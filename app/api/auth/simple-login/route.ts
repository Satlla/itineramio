import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('🔐 Login attempt for:', email)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        emailVerified: true,
        status: true
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

    // Create token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'itineramio-secret-key-2024',
      { expiresIn: '7d' }
    )

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    })

    // Set cookie - simple configuration
    response.cookies.set({
      name: 'auth-token',
      value: token,
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
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