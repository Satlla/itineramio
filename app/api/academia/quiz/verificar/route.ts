import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { isTokenExpired } from '../../../../../src/lib/academy/verification-token'
import { sendQuizResultsEmail } from '../../../../../src/lib/academy/quiz-emails'
import { quizQuestions } from '../../../../../src/data/quiz-questions'
import { notifyQuizEmailVerified } from '../../../../../src/lib/notifications/admin-notifications'

/**
 * GET /api/academia/quiz/verificar?token=xxx
 * Verifica el email de un usuario que completó el quiz
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token de verificación es requerido' },
        { status: 400 }
      )
    }

    // Find the lead with this verification token
    const lead = await prisma.quizLead.findUnique({
      where: { verificationToken: token },
      select: {
        id: true,
        email: true,
        fullName: true,
        score: true,
        level: true,
        answers: true,
        timeElapsed: true,
        emailVerified: true,
        verificationTokenExpires: true,
        verifiedAt: true
      }
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Token de verificación inválido' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (lead.emailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: 'Este email ya fue verificado anteriormente',
        lead: {
          email: lead.email,
          fullName: lead.fullName,
          score: lead.score,
          level: lead.level
        }
      })
    }

    // Check if token is expired
    if (isTokenExpired(lead.verificationTokenExpires)) {
      return NextResponse.json(
        { error: 'El token de verificación ha expirado. Por favor, completa el quiz nuevamente.' },
        { status: 410 } // 410 Gone
      )
    }

    // Mark as verified
    const now = new Date()
    await prisma.quizLead.update({
      where: { id: lead.id },
      data: {
        emailVerified: true,
        verifiedAt: now,
        // Clear the token after verification
        verificationToken: null,
        verificationTokenExpires: null
      }
    })

    // Calculate correct answers count
    const answers = lead.answers as any[]
    const correctCount = answers.filter((a: any) => a.isCorrect).length

    // Send quiz results email (async, don't block response)
    sendQuizResultsEmail({
      email: lead.email,
      fullName: lead.fullName || 'Usuario',
      score: lead.score,
      totalQuestions: quizQuestions.length,
      correctAnswers: correctCount,
      timeElapsed: lead.timeElapsed
    }).catch(error => {
      console.error('Failed to send quiz results email after verification:', error)
    })

    // Send admin notification (async, don't block response)
    notifyQuizEmailVerified({
      email: lead.email,
      fullName: lead.fullName
    }).catch(error => {
      console.error('Failed to send admin notification:', error)
    })

    return NextResponse.json({
      success: true,
      message: 'Email verificado exitosamente',
      lead: {
        email: lead.email,
        fullName: lead.fullName,
        score: lead.score,
        level: lead.level,
        verifiedAt: now
      }
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Error al verificar el email' },
      { status: 500 }
    )
  }
}
