import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { signToken } from '../../../../src/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('Force login attempt for:', email)
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 400 })
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.password!)
    if (!validPassword) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 400 })
    }
    
    // Create token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.isAdmin ? 'admin' : 'user'
    })
    
    console.log('Token created, length:', token.length)
    
    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        isAdmin: user.isAdmin
      },
      token // Also return token in response for debugging
    })
    
    // Set cookie with multiple attempts
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: false, // Allow both HTTP and HTTPS
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/'
    })
    
    // Also try setting without httpOnly for debugging
    response.cookies.set('auth-token-debug', token, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/'
    })
    
    console.log('Cookies set, returning response')
    
    return response
    
  } catch (error) {
    console.error('Force login error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}