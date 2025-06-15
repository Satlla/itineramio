import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = 'itineramio-secret-key-2024'

export async function DELETE(request: NextRequest) {
  try {
    // Get user from token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ error: 'Contraseña requerida' }, { status: 400 })
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, currentUser.password!)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
    }

    // Delete all user data in order
    // 1. Delete email verification tokens
    await prisma.emailVerificationToken.deleteMany({
      where: { email: currentUser.email }
    })

    // 2. Delete all properties (this will cascade delete zones and steps)
    await prisma.property.deleteMany({
      where: { hostId: decoded.userId }
    })

    // 3. Delete property sets
    await prisma.propertySet.deleteMany({
      where: { hostId: decoded.userId }
    })

    // 4. Finally delete the user
    await prisma.user.delete({
      where: { id: decoded.userId }
    })

    // Clear auth cookie
    const response = NextResponse.json({
      success: true,
      message: 'Cuenta eliminada exitosamente'
    })

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      expires: new Date(0),
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la cuenta' },
      { status: 500 }
    )
  }
}