import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { comparePassword, createToken, setAcademyAuthCookie } from '../../../../../src/lib/academy/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.academyUser.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await comparePassword(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error: 'Debes verificar tu email antes de iniciar sesión',
          requiresVerification: true,
          email: user.email
        },
        { status: 403 }
      )
    }

    // Update last activity
    await prisma.academyUser.update({
      where: { id: user.id },
      data: { lastActivityAt: new Date() }
    })

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      fullName: user.fullName
    })

    // Set cookie
    await setAcademyAuthCookie(token)

    // Return success
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
}
