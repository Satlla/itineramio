import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}

export async function POST(request: NextRequest) {
  try {
    // Get user from token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      console.log('No auth token provided')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let decoded: { userId: string }
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    } catch (jwtError) {
      console.log('Invalid JWT token:', jwtError)
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }
    
    // Set JWT claims for PostgreSQL RLS policies
    // REMOVED: set_config doesn't work with PgBouncer in transaction mode
    // RLS is handled at application level instead
    
    let body: any
    try {
      body = await request.json()
    } catch (parseError) {
      console.log('Failed to parse request body:', parseError)
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }
    
    console.log('Update request from user:', decoded.userId)
    console.log('Update request body:', JSON.stringify(body, null, 2))
    
    // Destructure with defaults
    const {
      firstName = '',
      lastName = '',
      email = '',
      phone = '',
      password = '', // Current password for verification
      newPassword = '',
      profileImage = null
    } = body

    console.log('Extracted fields:', {
      firstName: typeof firstName,
      lastName: typeof lastName,
      email: typeof email,
      phone: typeof phone,
      hasPassword: !!password,
      hasNewPassword: !!newPassword,
      hasProfileImage: profileImage !== null
    })

    // Validate required fields - be more permissive
    if (!email || typeof email !== 'string' || email.trim() === '') {
      console.log('Missing or invalid email:', { email, type: typeof email })
      return NextResponse.json({ 
        error: 'Email es requerido'
      }, { status: 400 })
    }
    
    // If firstName or lastName are empty, use current user's name or default
    const finalFirstName = firstName && typeof firstName === 'string' && firstName.trim() !== '' ? firstName.trim() : 'Usuario'
    const finalLastName = lastName && typeof lastName === 'string' && lastName.trim() !== '' ? lastName.trim() : ''

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const trimmedEmail = email.trim()
    if (!emailRegex.test(trimmedEmail)) {
      console.log('Invalid email format:', trimmedEmail)
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

    // Prepare update data - only include fields that were explicitly provided
    const updateData: any = {}

    // Check if this is a password-only change (no profile data provided)
    const isPasswordOnlyChange = newPassword && !body.firstName && !body.lastName && !body.phone && profileImage === null

    // Only update name and phone if this is NOT a password-only change
    if (!isPasswordOnlyChange) {
      // Use current user's name if not provided
      const finalFirstName = firstName && typeof firstName === 'string' && firstName.trim() !== ''
        ? firstName.trim()
        : currentUser.name?.split(' ')[0] || 'Usuario'
      const finalLastName = lastName && typeof lastName === 'string' && lastName.trim() !== ''
        ? lastName.trim()
        : currentUser.name?.split(' ').slice(1).join(' ') || ''

      updateData.name = `${finalFirstName} ${finalLastName}`.trim()

      // Only update phone if explicitly provided in the request
      if (body.hasOwnProperty('phone')) {
        const finalPhone = phone && typeof phone === 'string' ? phone.trim() : ''
        updateData.phone = finalPhone || null
      }
    }

    // Check if email is changing
    if (trimmedEmail !== currentUser.email) {
      console.log('Email change detected:', { old: currentUser.email, new: trimmedEmail })
      
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
        where: { email: trimmedEmail }
      })
      
      if (existingUser) {
        console.log('Email already taken by user:', existingUser.id)
        return NextResponse.json({ error: 'Este email ya está en uso' }, { status: 400 })
      }
      
      updateData.email = trimmedEmail
      console.log('Email will be updated')
    }

    // Update password if provided
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    // Update profile image only if explicitly provided in the request
    if (body.hasOwnProperty('profileImage')) {
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