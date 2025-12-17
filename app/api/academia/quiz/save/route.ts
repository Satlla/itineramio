import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { calculateLevel, quizQuestions } from '../../../../../src/data/quiz-questions'
import { sendVerificationEmail } from '../../../../../src/lib/academy/quiz-emails'
import { generateVerificationToken, getTokenExpiration } from '../../../../../src/lib/academy/verification-token'
import { notifyQuizLeadCaptured } from '../../../../../src/lib/notifications/admin-notifications'

// Mapeo de niveles del quiz a niveles del embudo Soap Opera
const LEVEL_TO_NIVEL: Record<string, 'principiante' | 'intermedio' | 'avanzado' | 'profesional'> = {
  'BASIC': 'principiante',
  'INTERMEDIATE': 'intermedio',
  'ADVANCED': 'avanzado'
}

// Función para determinar el nivel del embudo basado en score
function getNivelFromScore(score: number, quizLevel: string): 'principiante' | 'intermedio' | 'avanzado' | 'profesional' {
  // Score 90+ = profesional (top performers)
  if (score >= 90) return 'profesional'
  // Usar mapeo estándar para el resto
  return LEVEL_TO_NIVEL[quizLevel] || 'principiante'
}

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

    // Map to Soap Opera nivel (principiante/intermedio/avanzado/profesional)
    const soapOperaNivel = getNivelFromScore(score, levelData.level)

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

    // ✅ CREATE/UPDATE EmailSubscriber for Soap Opera email funnel
    // This is the main conversion funnel: 15 days, 8 emails, personalized by level
    try {
      await prisma.emailSubscriber.upsert({
        where: { email },
        create: {
          email,
          name: fullName || null,
          source: 'academia_quiz',
          sourceMetadata: {
            quizLeadId: quizLead.id,
            completedAt: new Date().toISOString(),
            score,
            level: levelData.level,
            timeElapsed
          },
          status: 'active',
          currentJourneyStage: 'subscribed',
          // Tag with nivel for segmented email sequence
          tags: [`nivel_${soapOperaNivel}`, 'quiz_completed', 'soap_opera'],
          // Store nivel for personalization (mapped to soap opera levels)
          nivel: soapOperaNivel,
          quizScore: score,
          // Start the Soap Opera sequence (main conversion funnel)
          soapOperaStartedAt: new Date(),
          soapOperaStatus: 'pending', // Will be activated by cron
          // Also start legacy sequences for backwards compatibility
          sequenceStartedAt: new Date(),
          sequenceStatus: 'active'
        },
        update: {
          // If already exists, update with quiz data but don't overwrite archetype data
          sourceMetadata: {
            quizLeadId: quizLead.id,
            completedAt: new Date().toISOString(),
            score,
            level: levelData.level,
            timeElapsed
          },
          // Add nivel tag without removing existing tags
          tags: {
            push: [`nivel_${soapOperaNivel}`, 'quiz_completed', 'soap_opera']
          },
          // Update nivel and score (mapped to soap opera levels)
          nivel: soapOperaNivel,
          quizScore: score,
          // Start Soap Opera sequence if not already in an active sequence
          soapOperaStartedAt: new Date(),
          soapOperaStatus: 'pending',
          // Legacy sequences
          sequenceStartedAt: new Date(),
          sequenceStatus: 'active'
        }
      })
      console.log(`✅ EmailSubscriber created/updated for Soap Opera funnel: ${email} -> ${soapOperaNivel} (quiz: ${levelData.level}, score: ${score})`)
    } catch (emailSubError) {
      console.error('❌ Could not create EmailSubscriber for Soap Opera funnel:', emailSubError)
      // Don't fail the request if this fails
    }

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
