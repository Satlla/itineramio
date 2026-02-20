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
    const rateLimitKey = getRateLimitKey(request, null, 'login')
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
    const { email, password, rememberMe = true } = body // Por defecto true (30 días)

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email y contraseña son requeridos'
      }, { status: 400 })
    }

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

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Credenciales inválidas'
      }, { status: 401 })
    }

    const isValidPassword = user.password ? await bcrypt.compare(password, user.password) : false

    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: 'Credenciales inválidas'
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

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: 'HOST'
    })

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phone: user.phone
    }

    const response = NextResponse.json({
      success: true,
      user: userResponse
    })

    const isProduction = process.env.NODE_ENV === 'production'

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days for persistent login
      path: '/',
      domain: isProduction ? '.itineramio.com' : undefined
    })

    // Clear admin impersonation cookie if exists (user login should clean this up)
    response.cookies.set('admin-impersonation', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
      expires: new Date(0)
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}