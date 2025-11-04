import { NextRequest, NextResponse } from 'next/server'
import { removeAcademyAuthCookie } from '../../../../../src/lib/academy/auth'

export async function POST(request: NextRequest) {
  try {
    await removeAcademyAuthCookie()

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    )
  }
}
