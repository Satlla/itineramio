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
    
    // Set JWT claims for PostgreSQL RLS policies
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${decoded.userId}, true)`
    
    const body = await request.json()
    console.log('Update request body:', body)
    
    const {
      firstName,
      lastName,
      email,
      phone,
      password, // Current password for verification
      newPassword,
      profileImage
    } = body

    // Validate required fields - only email is truly required
    if (!email) {
      console.log('Missing email')
      return NextResponse.json({ 
        error: 'Email es requerido'
      }, { status: 400 })
    }
    
    // If firstName or lastName are empty, use a default or current name
    const finalFirstName = firstName || 'Usuario'
    const finalLastName = lastName || ''

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

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
      name: `${finalFirstName} ${finalLastName}`.trim(),
      phone
    }

    // Check if email is changing
    if (email !== currentUser.email) {
      console.log('Email change detected:', { old: currentUser.email, new: email })
      
      // Require password for email change
      if (!password) {
        return NextResponse.json({ 
          error: 'Se requiere la contraseña actual para cambiar el email',
          requiresPassword: true 
        }, { status: 400 })
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, currentUser.password!)
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
      }
      
      // Check if new email is already taken
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      
      if (existingUser) {
        console.log('Email already taken by user:', existingUser.id)
        return NextResponse.json({ error: 'Este email ya está en uso' }, { status: 400 })
      }
      
      updateData.email = email
      console.log('Email will be updated')
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
    // Return more specific error message
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'Error al actualizar la cuenta' },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Error al actualizar la cuenta' },
      { status: 500 }
    )
  }
}