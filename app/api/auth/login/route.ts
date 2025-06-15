import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../src/lib/prisma'

const JWT_SECRET = 'itineramio-secret-key-2024'

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
        status: true
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

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET as string,
      { expiresIn: '24h' }
    )

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email
    }

    const response = NextResponse.json({
      success: true,
      user: userResponse
    })

    // Token set successfully
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: true, // Production requires secure
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/'
    })

    console.log('Login successful for user:', user.email)
    console.log('Token created:', token.substring(0, 20) + '...')
    console.log('Cookie secure setting:', true)
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}