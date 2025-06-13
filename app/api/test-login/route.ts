import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    console.log('🔍 Test login attempt:', { email, hasPassword: !!password })
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email y contraseña son requeridos',
        debug: { hasEmail: !!email, hasPassword: !!password }
      }, { status: 400 })
    }

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
        error: 'Usuario no encontrado',
        debug: { searchEmail: email.toLowerCase() }
      }, { status: 404 })
    }

    // Check password
    const isValidPassword = user.password ? await bcrypt.compare(password, user.password) : false
    console.log('🔐 Password check:', { isValid: isValidPassword, hasStoredPassword: !!user.password })

    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: 'Contraseña incorrecta',
        debug: { hasStoredPassword: !!user.password }
      }, { status: 401 })
    }

    // Check email verification
    if (!user.emailVerified) {
      return NextResponse.json({
        success: false,
        error: 'Email no verificado',
        debug: { emailVerified: user.emailVerified }
      }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      message: 'Login test successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: !!user.emailVerified,
        status: user.status
      }
    })

  } catch (error) {
    console.error('🚨 Test login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      debug: { errorMessage: error instanceof Error ? error.message : 'Unknown error' }
    }, { status: 500 })
  }
}