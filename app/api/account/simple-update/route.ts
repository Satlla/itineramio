import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'itineramio-secret-key-2024'

export async function POST(request: NextRequest) {
  console.log('=== SIMPLE UPDATE ===')
  
  try {
    // Get user
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    console.log('User ID:', decoded.userId)
    
    const body = await request.json()
    console.log('Request body:', body)
    
    const { firstName, lastName, email, phone, password } = body
    
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Check if email is changing
    const emailChanged = email !== user.email
    console.log('Email changed:', emailChanged)

    if (emailChanged) {
      // Require password
      if (!password) {
        return NextResponse.json({ 
          error: 'Contraseña requerida para cambiar email',
          requiresPassword: true 
        }, { status: 400 })
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password!)
      if (!validPassword) {
        return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
      }

      // Check email availability
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        return NextResponse.json({ error: 'Email ya en uso' }, { status: 400 })
      }
    }

    // Update user
    const updateData: any = {
      name: `${firstName || ''} ${lastName || ''}`.trim() || 'Usuario',
      phone: phone || null
    }

    if (emailChanged) {
      updateData.email = email
    }

    console.log('Updating with:', updateData)

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData
    })

    console.log('Updated successfully:', updatedUser.id)

    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone
      }
    })

  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ 
      error: 'Error interno: ' + (error instanceof Error ? error.message : 'Desconocido')
    }, { status: 500 })
  }
}