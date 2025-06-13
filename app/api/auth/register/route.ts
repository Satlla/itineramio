import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { EmailVerificationService } from '@/lib/auth-email'

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
  registrationLanguage: z.string().optional().default('es')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este email' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    // Create user (with PENDING status and unverified email)
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        password: hashedPassword,
        preferredLanguage: validatedData.registrationLanguage,
        status: 'PENDING', // User starts as PENDING until email verification
        emailVerified: null // Email is not verified yet
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
      // Don't fail the registration if email fails, but log it
      // The user can resend verification email later
    }
    
    return NextResponse.json({
      message: 'Cuenta creada exitosamente. Revisa tu email para verificar tu cuenta.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: false,
        status: user.status
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Registration error:', error)
    
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
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}