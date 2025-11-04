import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { hashPassword, createToken, setAcademyAuthCookie } from '../../../../../src/lib/academy/auth'
import { generateVerificationToken, sendVerificationEmail } from '../../../../../src/lib/academy/email-verification'
import { calculateLevel } from '../../../../../src/data/quiz-questions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, quizData } = body

    // Validate input
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password y nombre completo son requeridos' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.academyUser.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Prepare quiz data if available
    let quizFields = {}
    if (quizData && quizData.score !== undefined) {
      const levelData = calculateLevel(quizData.score)
      quizFields = {
        quizScore: quizData.score,
        quizLevel: levelData.level,
        quizCompletedAt: new Date(),
        quizAnswers: quizData.answers,
        tags: [`QUIZ_${levelData.level}`]
      }
    }

    // Create user with quiz data if available
    const user = await prisma.academyUser.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        ...quizFields
      }
    })

    // Update enrollment count on the first published course
    const course = await prisma.course.findFirst({
      where: { published: true }
    })

    if (course) {
      await prisma.course.update({
        where: { id: course.id },
        data: {
          enrollmentCount: {
            increment: 1
          }
        }
      })
    }

    // Generate verification token and send email
    const verificationToken = await generateVerificationToken(user.id)
    await sendVerificationEmail(user.email, user.fullName, verificationToken)

    // Return success WITHOUT setting auth cookie
    // User must verify email before accessing dashboard
    return NextResponse.json({
      success: true,
      message: 'Cuenta creada. Revisa tu email para verificar tu cuenta.',
      requiresVerification: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        emailVerified: false
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Error al crear la cuenta' },
      { status: 500 }
    )
  }
}
