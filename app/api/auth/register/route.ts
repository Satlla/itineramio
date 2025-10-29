import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { EmailVerificationService } from '../../../../src/lib/auth-email'
import { POLICY_VERSION } from '../../../../src/config/policies'

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
  registrationLanguage: z.string().optional().default('es')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 REGISTER ENDPOINT - Starting registration')
    const body = await request.json()
    console.log('📝 Registration data received:', { email: body.email, name: body.name })
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    console.log('✅ Data validated successfully')
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      // If user exists but is not verified and account is pending, delete it to allow re-registration
      if (!existingUser.emailVerified && existingUser.status === 'PENDING') {
        console.log('🔄 Deleting unverified pending user to allow re-registration:', existingUser.email)
        
        // Delete any existing verification tokens
        await prisma.emailVerificationToken.deleteMany({
          where: { email: existingUser.email }
        })
        
        // Delete the unverified user
        await prisma.user.delete({
          where: { id: existingUser.id }
        })
        
        console.log('✅ Unverified user deleted, proceeding with new registration')
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

    // Capture IP address from headers
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Capture User-Agent
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
        // Store policy acceptance and marketing consent in notificationPreferences for now
        notificationPreferences: {
          policyAcceptance,
          marketingConsent: marketingConsentData
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true
      }
    })
    
    // Send verification email
    try {
      console.log('🔄 Attempting to send verification email to:', user.email)
      await EmailVerificationService.sendVerificationEmail(user.email, user.name)
      console.log('✅ Verification email sent successfully')
    } catch (emailError) {
      console.error('🚨 CRITICAL: Error sending verification email:', emailError)
      console.error('📊 Error details:', JSON.stringify(emailError, null, 2))
    }
    
    return NextResponse.json({
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
    console.error('🚨 Registration error:', error)
    console.error('🔍 Error type:', error?.constructor?.name)
    console.error('📊 Error details:', JSON.stringify(error, null, 2))
    
    if (error instanceof z.ZodError) {
      console.log('❌ Validation error:', error.errors)
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