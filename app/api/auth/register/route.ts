import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { EmailVerificationService } from '../../../../src/lib/auth-email'
import { POLICY_VERSION } from '../../../../src/config/policies'
import { notifyNewUserRegistration } from '../../../../src/lib/notifications/admin-notifications'

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(6, 'Teléfono inválido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'Debes aceptar los términos y condiciones'),
  marketingConsent: z.boolean().optional().default(false),
  registrationLanguage: z.string().optional().default('es'),
  referralCode: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

// Simple in-memory rate limiting (resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const MAX_REGISTRATIONS_PER_IP = 3

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (record.count >= MAX_REGISTRATIONS_PER_IP) {
    return false
  }

  record.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 🛡️ HONEYPOT CHECK - bots fill hidden fields, humans don't
    if (body._hp || body.website) {
      // Return fake success to not alert the bot
      return NextResponse.json({
        success: true,
        message: 'Registration successful'
      }, { status: 201 })
    }

    // 🛡️ RATE LIMITING - max 3 registrations per IP per hour
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json({
        error: 'Demasiados intentos de registro. Inténtalo de nuevo en una hora.'
      }, { status: 429 })
    }

    // 🛡️ BOT PATTERN DETECTION - random character names
    const nameHasRandomPattern = /^[A-Za-z]{15,}$/.test(body.name) ||
                                  /^[A-Z][a-z]+[A-Z][a-z]+[A-Z]/.test(body.name) ||
                                  body.name.length > 30
    if (nameHasRandomPattern) {
      return NextResponse.json({
        success: true,
        message: 'Registration successful'
      }, { status: 201 })
    }

    // Extract demoPropertyId before Zod validation (it's not in the schema)
    const demoPropertyId = typeof body.demoPropertyId === 'string' ? body.demoPropertyId : null

    // Validate input
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      // If user exists but is not verified and account is pending, delete it to allow re-registration
      if (!existingUser.emailVerified && existingUser.status === 'PENDING') {
        // Delete any existing verification tokens
        await prisma.emailVerificationToken.deleteMany({
          where: { email: existingUser.email }
        })
        
        // Delete the unverified user
        await prisma.user.delete({
          where: { id: existingUser.id }
        })
      } else {
        // User is verified or active, don't allow re-registration
        return NextResponse.json(
          { error: 'Ya existe una cuenta con este email' },
          { status: 400 }
        )
      }
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Capture User-Agent (IP already captured above for rate limiting)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Create policy acceptance metadata
    const policyAcceptance = {
      version: POLICY_VERSION,
      acceptedAt: new Date().toISOString(),
      ip: ip,
      userAgent: userAgent,
      source: 'signup',
      accepted: true
    }

    // Create marketing consent metadata (only if user consented)
    const marketingConsentData = validatedData.marketingConsent ? {
      accepted: true,
      acceptedAt: new Date().toISOString(),
      ip: ip,
      userAgent: userAgent,
      source: 'signup'
    } : {
      accepted: false,
      declinedAt: new Date().toISOString(),
      ip: ip,
      userAgent: userAgent,
      source: 'signup'
    }

    // Look up referrer if referral code provided
    let referrerId: string | null = null
    if (validatedData.referralCode) {
      const referrer = await prisma.user.findFirst({
        where: { referralCode: validatedData.referralCode },
        select: { id: true }
      })
      if (referrer) {
        referrerId = referrer.id
      }
    }

    // Create user (PENDING status until email verification)
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        password: hashedPassword,
        preferredLanguage: validatedData.registrationLanguage,
        status: 'PENDING',
        emailVerified: null,
        referredBy: referrerId,
        // Store policy acceptance and marketing consent in notificationPreferences for now
        notificationPreferences: {
          policyAcceptance,
          marketingConsent: marketingConsentData,
          ...(demoPropertyId && { demoPropertyId })
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true
      }
    })

    // Create affiliate transaction record if referred
    if (referrerId) {
      await prisma.affiliateTransaction.create({
        data: {
          referrerId,
          referredUserId: user.id,
          type: 'REFERRAL_SIGNUP',
          amount: 0, // Will be updated when user subscribes
          status: 'PENDING',
          description: 'Nuevo usuario referido'
        }
      })
    }

    // Send verification email - CRITICAL: must succeed for user to verify
    let emailSent = false
    try {
      await EmailVerificationService.sendVerificationEmail(user.email, user.name)
      emailSent = true
    } catch (emailError) {
      // Return error to user so they know email wasn't sent
      return NextResponse.json({
        success: false,
        error: 'Tu cuenta fue creada pero no pudimos enviar el email de verificación. Por favor, ve a la página de login e intenta reenviar el email de verificación.',
        canResendEmail: true,
        email: user.email
      }, { status: 500 })
    }

    // Send admin notification (async, don't block response)
    notifyNewUserRegistration({
      email: user.email,
      name: user.name,
      source: 'Registro directo'
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: '¡Enhorabuena! Gracias por registrarte en Itineramio. Te hemos enviado un correo de confirmación.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: false,
        status: user.status
      }
    }, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }
    
    // More specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor'
    
    return NextResponse.json(
      { 
        error: errorMessage,
        type: error?.constructor?.name,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}