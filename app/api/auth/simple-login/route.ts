import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../../src/lib/prisma'
import { signToken } from '../../../../src/lib/auth'
import { checkRateLimit, getRateLimitKey } from '../../../../src/lib/rate-limit'

// Strict rate limit for login: 5 attempts per minute per IP
const LOGIN_RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60 * 1000 // 1 minute
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting to prevent brute force attacks
    const rateLimitKey = getRateLimitKey(request, null, 'simple-login')
    const rateLimitResult = checkRateLimit(rateLimitKey, LOGIN_RATE_LIMIT)

    if (!rateLimitResult.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Demasiados intentos de inicio de sesión. Por favor, espera un momento.'
      }, {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000))
        }
      })
    }

    const body = await request.json()
    const { email, password, rememberMe = false } = body

    console.log('🔐 Login attempt for:', email, '| Remember me:', rememberMe)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        emailVerified: true,
        status: true,
        avatar: true,
        phone: true
      }
    })

    console.log('👤 User found:', user ? {
      id: user.id,
      email: user.email,
      hasPassword: !!user.password,
      emailVerified: !!user.emailVerified,
      status: user.status
    } : 'No user found')

    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'No existe una cuenta con este email' 
      }, { status: 401 })
    }

    if (!user.password) {
      return NextResponse.json({ 
        success: false,
        error: 'Cuenta sin contraseña configurada' 
      }, { status: 401 })
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json({
        success: false,
        error: 'EMAIL_NOT_VERIFIED',
        message: 'Tu email no ha sido verificado. Revisa tu bandeja de entrada.',
        email: user.email
      }, { status: 403 })
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return NextResponse.json({ 
        success: false,
        error: 'Contraseña incorrecta' 
      }, { status: 401 })
    }

    // Create token using centralized auth (always 30d, cookie manages shorter sessions)
    const token = signToken({ userId: user.id, email: user.email, role: 'HOST' })

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone
      },
      token
    })

    // Set cookie with appropriate duration based on rememberMe
    const cookieMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 // 30 days or 24 hours
    const isProduction = process.env.NODE_ENV === 'production'

    // Use Next.js cookies API (NOT manual headers.set) for proper cookie handling
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: cookieMaxAge,
      path: '/'
    })

    console.log('🍪 Cookie configured:', {
      maxAge: `${cookieMaxAge}s (${rememberMe ? '30 days' : '24 hours'})`,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}