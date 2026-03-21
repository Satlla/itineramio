import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { EmailVerificationService } from '../../../../src/lib/auth-email'
import { z } from 'zod'
import { checkRateLimit, getRateLimitKey } from '../../../../src/lib/rate-limit'

// Strict rate limit: 3 resend attempts per 10 minutes per IP
const RESEND_RATE_LIMIT = {
  maxRequests: 3,
  windowMs: 10 * 60 * 1000 // 10 minutes
}

const resendSchema = z.object({
  email: z.string().email('Email inválido')
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting to prevent email spam
    const rateLimitKey = getRateLimitKey(request, null, 'resend-verification')
    const rateLimitResult = checkRateLimit(rateLimitKey, RESEND_RATE_LIMIT)

    if (!rateLimitResult.allowed) {
      return NextResponse.json({
        error: 'Demasiados intentos. Por favor, espera unos minutos antes de solicitar otro email.'
      }, {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000))
        }
      })
    }

    const body = await request.json()

    // Validate input
    const { email } = resendSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'No se encontró una cuenta con este email' },
        { status: 404 }
      )
    }
    
    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Este email ya está verificado' },
        { status: 400 }
      )
    }
    
    // Delete any existing tokens for this email
    await prisma.emailVerificationToken.deleteMany({
      where: { email }
    })

    // Send new verification email
    try {
      await EmailVerificationService.sendVerificationEmail(user.email, user.name)

      return NextResponse.json({
        message: 'Email de verificación enviado exitosamente',
        email: user.email
      })
    } catch (emailError) {
      return NextResponse.json(
        { error: 'Error al enviar el email. Por favor intenta más tarde.' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}