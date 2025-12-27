import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../src/lib/prisma'

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

    console.log('Testing login for email:', email)
    console.log('Lowercase email:', email.toLowerCase())

    // Try to find user with exact email
    const userExact = await prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        emailVerified: true,
        status: true
      }
    })

    console.log('User with exact email:', userExact ? 'Found' : 'Not found')

    // Try to find user with lowercase email
    const userLowercase = await prisma.user.findUnique({
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

    console.log('User with lowercase email:', userLowercase ? 'Found' : 'Not found')

    // Try to find all users with similar email
    const similarUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: email.split('@')[0] } },
          { email: { endsWith: '@' + email.split('@')[1] } }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true
      },
      take: 5
    })

    console.log('Similar users found:', similarUsers.length)

    const user = userExact || userLowercase

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado',
        debug: {
          searchedEmail: email,
          searchedEmailLowercase: email.toLowerCase(),
          similarUsers: similarUsers.map(u => ({ id: u.id, email: u.email, name: u.name }))
        }
      }, { status: 404 })
    }

    const isValidPassword = user.password ? await bcrypt.compare(password, user.password) : false

    return NextResponse.json({
      success: isValidPassword,
      user: isValidPassword ? {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        status: user.status
      } : null,
      error: !isValidPassword ? 'Contraseña incorrecta' : null,
      debug: {
        foundEmail: user.email,
        searchedEmail: email,
        emailMatch: user.email === email,
        emailMatchLowercase: user.email === email.toLowerCase()
      }
    })

  } catch (error) {
    console.error('Test login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}