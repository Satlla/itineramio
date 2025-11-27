import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
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
    console.log('🔒 Checking password...')
    const validPassword = await bcrypt.compare(password, user.password)
    console.log('✅ Password valid:', validPassword)
    
    if (!validPassword) {
      return NextResponse.json({ 
        success: false,
        error: 'Contraseña incorrecta' 
      }, { status: 401 })
    }

    // Create token with appropriate expiration based on rememberMe
    const JWT_SECRET = process.env.JWT_SECRET || 'itineramio-secret-key-2024'
    const tokenExpiration = rememberMe ? '30d' : '24h'
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: tokenExpiration }
    )

    console.log('🔑 Token created with expiration:', tokenExpiration)

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
    // If rememberMe: 30 days, otherwise 24 hours
    const cookieMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24
    const isProduction = process.env.NODE_ENV === 'production'

    // Get domain from request URL for proper cookie domain setting
    const domain = isProduction ? '.itineramio.com' : undefined
    const domainStr = domain ? `; Domain=${domain}` : ''

    response.headers.set(
      'Set-Cookie',
      `auth-token=${token}; Path=/; HttpOnly; Max-Age=${cookieMaxAge}; SameSite=${isProduction ? 'None' : 'Lax'}${isProduction ? '; Secure' : ''}${domainStr}`
    )

    console.log('🍪 Cookie set with Max-Age:', cookieMaxAge, 'seconds =', rememberMe ? '30 days' : '24 hours', '| HttpOnly: true | SameSite:', isProduction ? 'None' : 'Lax', '| Domain:', domain || 'default')

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}