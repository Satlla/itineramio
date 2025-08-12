import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('=== DIRECT UPDATE ===')
    
    const { email, password, firstName, lastName, phone, newEmail } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }
    
    // Password is only required for email changes
    if (newEmail && newEmail !== email && !password) {
      return NextResponse.json({ error: 'Contraseña requerida para cambiar email' }, { status: 400 })
    }
    
    // Find user by current email
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }
    
    // Verify password only if provided (for email changes)
    if (password) {
      const validPassword = await bcrypt.compare(password, user.password!)
      if (!validPassword) {
        return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
      }
      console.log('Password verified for user:', user.id)
    }
    
    // Prepare update data
    const updateData: any = {
      name: `${firstName || ''} ${lastName || ''}`.trim() || 'Usuario',
      phone: phone || null
    }
    
    // Handle email change
    if (newEmail && newEmail !== email) {
      // Check if new email is available
      const existing = await prisma.user.findUnique({ where: { email: newEmail } })
      if (existing) {
        return NextResponse.json({ error: 'El nuevo email ya está en uso' }, { status: 400 })
      }
      updateData.email = newEmail
      console.log('Email will be changed to:', newEmail)
    }
    
    console.log('Updating user with data:', updateData)
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    })
    
    console.log('User updated successfully')
    
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
    console.error('Direct update error:', error)
    return NextResponse.json({ 
      error: 'Error interno: ' + (error instanceof Error ? error.message : 'Desconocido')
    }, { status: 500 })
  }
}