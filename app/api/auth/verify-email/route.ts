import { NextRequest, NextResponse } from 'next/server'
import { EmailVerificationService } from '@/lib/auth-email'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = 'itineramio-secret-key-2024'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(
        new URL('/login?error=Token faltante', request.url)
      )
    }

    const result = await EmailVerificationService.verifyEmailToken(token)

    if (!result.success) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(result.error || 'Error de verificación')}`, request.url)
      )
    }

    // Get user info and create session
    if (result.email) {
      const user = await prisma.user.findUnique({
        where: { email: result.email },
        select: { id: true, name: true, email: true }
      })

      if (user) {
        // Send welcome email (don't await to avoid blocking the response)
        EmailVerificationService.sendWelcomeEmail(user.email, user.name).catch(error => {
          console.error('Error sending welcome email:', error)
        })

        // Create JWT token for automatic login
        const token = jwt.sign(
          { userId: user.id },
          JWT_SECRET as string,
          { expiresIn: '24h' }
        )

        // Redirect to dashboard with login cookie
        const response = NextResponse.redirect(
          new URL('/main', request.url)
        )
        
        response.cookies.set('auth-token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 24 * 60 * 60,
          path: '/'
        })
        
        return response
      }
    }

    // Fallback redirect to login
    return NextResponse.redirect(
      new URL('/login?verified=true', request.url)
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(
      new URL('/login?error=Error de verificación', request.url)
    )
  }
}

// Optional: Add endpoint to resend verification email
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    // Check if user exists and is not verified
    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true, emailVerified: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email ya verificado' },
        { status: 400 }
      )
    }

    // Resend verification email
    await EmailVerificationService.sendVerificationEmail(email, user.name)

    return NextResponse.json({
      message: 'Email de verificación enviado'
    })
  } catch (error) {
    console.error('Error resending verification email:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}