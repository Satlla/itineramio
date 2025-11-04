import { NextRequest, NextResponse } from 'next/server'
import { resendVerificationEmail } from '../../../../src/lib/academy/email-verification'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    const result = await resendVerificationEmail(email)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email de verificación reenviado exitosamente'
    })

  } catch (error) {
    console.error('Error in resend-verification API:', error)
    return NextResponse.json(
      { error: 'Error al reenviar el email de verificación' },
      { status: 500 }
    )
  }
}
