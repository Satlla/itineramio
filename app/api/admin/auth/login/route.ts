import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { signAdminToken, validateAdminPassword } from '../../../../../src/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email y contraseña son requeridos' 
      }, { status: 400 })
    }

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        isActive: true
      }
    })

    if (!admin) {
      return NextResponse.json({ 
        error: 'Credenciales inválidas' 
      }, { status: 401 })
    }

    // Check if admin is active
    if (!admin.isActive) {
      return NextResponse.json({ 
        error: 'Cuenta desactivada. Contacta al super administrador.' 
      }, { status: 403 })
    }

    // Validate password
    const isValidPassword = await validateAdminPassword(password, admin.password)
    if (!isValidPassword) {
      return NextResponse.json({ 
        error: 'Credenciales inválidas' 
      }, { status: 401 })
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() }
    })

    // Generate JWT token
    const token = signAdminToken({
      adminId: admin.id,
      email: admin.email,
      role: admin.role
    })

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    })

    // Set admin cookie
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/'
    })

    console.log(`✅ Admin login successful: ${admin.email}`)
    return response

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ 
      error: 'Error durante el login' 
    }, { status: 500 })
  }
}