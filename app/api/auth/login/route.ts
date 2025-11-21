import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../../src/lib/prisma'
import { signToken } from '../../../../src/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

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

    // Token set successfully
    console.log('Setting auth cookie with token length:', token.length)
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/'
    })
    console.log('Auth cookie set successfully')

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