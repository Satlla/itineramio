import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export async function POST(request: NextRequest) {
  try {
    // Verify JWT authentication
    if (!JWT_SECRET) {
      console.error('JWT_SECRET not configured')
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }

    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let decoded: { userId: string }
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { email, password, firstName, lastName, phone, profileImage, newEmail } = await request.json()

    // Find authenticated user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Verify email matches authenticated user (prevent modifying other accounts)
    if (email && email !== user.email) {
      return NextResponse.json({ error: 'No autorizado para modificar esta cuenta' }, { status: 403 })
    }

    // Password is only required for email changes
    if (newEmail && newEmail !== user.email && !password) {
      return NextResponse.json({ error: 'Contraseña requerida para cambiar email' }, { status: 400 })
    }
    
    // Verify password only if provided (for email changes)
    if (password) {
      const validPassword = await bcrypt.compare(password, user.password!)
      if (!validPassword) {
        return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
      }
    }

    // Prepare update data
    const updateData: any = {
      name: `${firstName || ''} ${lastName || ''}`.trim() || 'Usuario',
      phone: phone || null,
      avatar: profileImage || null
    }

    // Handle email change
    if (newEmail && newEmail !== user.email) {
      // Check if new email is available
      const existing = await prisma.user.findUnique({ where: { email: newEmail } })
      if (existing) {
        return NextResponse.json({ error: 'El nuevo email ya está en uso' }, { status: 400 })
      }
      updateData.email = newEmail
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    })
    
    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar
      }
    })
    
  } catch (error) {
    console.error('Direct update error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}