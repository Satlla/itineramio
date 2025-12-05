import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { calculateLevel, quizQuestions } from '../../../../../src/data/quiz-questions'
import { sendVerificationEmail } from '../../../../../src/lib/academy/quiz-emails'
import { generateVerificationToken, getTokenExpiration } from '../../../../../src/lib/academy/verification-token'
import { notifyQuizLeadCaptured } from '../../../../../src/lib/notifications/admin-notifications'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, score, answers, fullName, timeElapsed } = body

    if (!email || score === undefined) {
      return NextResponse.json(
        { error: 'Email y puntuación son requeridos' },
        { status: 400 }
      )
    }

    // Calculate level
    const levelData = calculateLevel(score)

    // Calculate correct answers count
    const correctCount = answers.filter((a: any) => a.isCorrect).length

    // Generate verification token and expiration
    const verificationToken = generateVerificationToken()
    const verificationTokenExpires = getTokenExpiration()

    // ✅ ALWAYS save to QuizLead table (for ALL users)
    // Lead starts as NOT verified - must confirm email first
    const quizLead = await prisma.quizLead.create({
      data: {
        email,
        fullName: fullName || null,
        score,
        level: levelData.level,
        answers,
        timeElapsed: timeElapsed || 0,
        source: 'QUIZ_PUBLIC',
        // Get user agent for analytics
        userAgent: request.headers.get('user-agent') || null,
        // Note: In production, get real IP. For now, skip due to localhost
        ipAddress: null,
        // Email verification fields
        emailVerified: false,
        verificationToken,
        verificationTokenExpires
      }
    })

    // Send admin notification (async, don't block response)
    notifyQuizLeadCaptured({
      email,
      fullName: fullName || null,
      score,
      level: levelData.level,
      emailVerified: false
    }).catch(error => {
      console.error('Failed to send admin notification:', error)
    })

    // Check if user already exists in AcademyUser
    const existingUser = await prisma.academyUser.findUnique({
      where: { email }
    })

    if (existingUser) {
      // Update existing user with quiz results
      await prisma.academyUser.update({
        where: { id: existingUser.id },
        data: {
          quizScore: score,
          quizLevel: levelData.level,
          quizCompletedAt: new Date(),
          quizAnswers: answers,
          tags: {
            push: `QUIZ_${levelData.level}`
          }
        }
      })

      // Mark the lead as converted
      await prisma.quizLead.updateMany({
        where: { email },
        data: {
          converted: true,
          academyUserId: existingUser.id
        }
      })
    }

    // Send verification email (async, don't block response)
    sendVerificationEmail({
      email,
      fullName: fullName || existingUser?.fullName || 'Usuario',
      verificationToken
    }).catch(error => {
      // Log error but don't fail the request
      console.error('Failed to send verification email:', error)
    })

    return NextResponse.json({
      success: true,
      level: levelData.level,
      message: 'Quiz guardado exitosamente. Revisa tu email para verificar tu dirección y ver tus resultados.'
    })

  } catch (error) {
    console.error('Save quiz error:', error)
    return NextResponse.json(
      { error: 'Error al guardar el quiz' },
      { status: 500 }
    )
  }
}
