import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

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
      where: { email: email.toLowerCase() }
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

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
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

    console.log('Setting cookie with token:', token.substring(0, 20) + '...')
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/'
    })

    console.log('Login successful for user:', user.email)
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}