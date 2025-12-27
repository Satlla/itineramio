import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { EmailVerificationService } from '../../../../src/lib/auth-email'
import { z } from 'zod'

const resendSchema = z.object({
  email: z.string().email('Email inválido')
})

export async function POST(request: NextRequest) {
  try {
    console.log('📧 RESEND VERIFICATION - Starting')
    const body = await request.json()
    
    // Validate input
    const { email } = resendSchema.parse(body)
    console.log('📝 Email to resend:', email)
    
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
    console.log('🗑️ Deleted existing tokens')
    
    // Send new verification email
    try {
      await EmailVerificationService.sendVerificationEmail(user.email, user.name)
      console.log('✅ New verification email sent')
      
      return NextResponse.json({
        message: 'Email de verificación enviado exitosamente',
        email: user.email
      })
    } catch (emailError) {
      console.error('❌ Error sending verification email:', emailError)
      return NextResponse.json(
        { error: 'Error al enviar el email. Por favor intenta más tarde.' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('🚨 Resend verification error:', error)
    
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