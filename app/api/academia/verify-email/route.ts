import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailToken } from '../../../../src/lib/academy/email-verification'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token es requerido' },
        { status: 400 }
      )
    }

    const result = await verifyEmailToken(token)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email verificado exitosamente'
    })

  } catch (error) {
    console.error('Error in verify-email API:', error)
    return NextResponse.json(
      { error: 'Error al verificar el email' },
      { status: 500 }
    )
  }
}
