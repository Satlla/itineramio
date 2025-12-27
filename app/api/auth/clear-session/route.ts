import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Delete all auth cookies
    const cookieStore = await cookies()

    cookieStore.delete('auth-token')
    cookieStore.delete('admin-token')

    console.log('✅ All auth cookies cleared')

    return NextResponse.json({
      success: true,
      message: 'Sesión limpiada correctamente'
    })
  } catch (error) {
    console.error('❌ Error clearing session:', error)
    return NextResponse.json(
      { error: 'Error limpiando sesión' },
      { status: 500 }
    )
  }
}
