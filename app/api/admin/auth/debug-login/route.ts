import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { hashAdminPassword, validateAdminPassword } from '../../../../../src/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('🔍 Debug login attempt:', { email, passwordLength: password?.length })

    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email y contraseña son requeridos',
        debug: { email: !!email, password: !!password }
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

    console.log('🔍 Admin found:', admin ? { id: admin.id, email: admin.email } : 'Not found')

    if (!admin) {
      return NextResponse.json({ 
        error: 'Admin no encontrado',
        debug: { searchEmail: email.toLowerCase() }
      }, { status: 404 })
    }

    // Test password validation
    const isValid = await validateAdminPassword(password, admin.password)
    console.log('🔍 Password validation result:', isValid)

    // Also test with a new hash to verify bcrypt is working
    const testHash = await hashAdminPassword(password)
    const testValidation = await validateAdminPassword(password, testHash)
    console.log('🔍 Test hash validation:', testValidation)

    return NextResponse.json({
      adminFound: true,
      email: admin.email,
      isActive: admin.isActive,
      passwordValid: isValid,
      testHashValid: testValidation,
      debug: {
        passwordLength: password.length,
        storedHashLength: admin.password.length,
        bcryptWorking: testValidation
      }
    })

  } catch (error) {
    console.error('Debug login error:', error)
    return NextResponse.json({ 
      error: 'Error en debug login',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}