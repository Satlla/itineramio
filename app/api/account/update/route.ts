import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = 'itineramio-secret-key-2024'

export async function POST(request: NextRequest) {
  try {
    // Get user from token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      password, // Current password for verification
      newPassword,
      profileImage
    } = body

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Verify current password only if changing password or if password is provided
    if (newPassword || password) {
      if (!password) {
        return NextResponse.json({ error: 'Contraseña actual requerida' }, { status: 400 })
      }
      const isValidPassword = await bcrypt.compare(password, currentUser.password!)
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
      }
    }

    // Prepare update data
    const updateData: any = {
      name: `${firstName} ${lastName}`.trim(),
      phone
    }

    // Check if email is changing
    if (email !== currentUser.email) {
      // Check if new email is already taken
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      
      if (existingUser) {
        return NextResponse.json({ error: 'Este email ya está en uso' }, { status: 400 })
      }
      
      updateData.email = email
    }

    // Update password if provided
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    // Update profile image if provided
    if (profileImage !== undefined) {
      updateData.avatar = profileImage
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true
      }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser
    })

  } catch (error) {
    console.error('Account update error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la cuenta' },
      { status: 500 }
    )
  }
}