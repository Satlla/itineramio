import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '../../../src/lib/email-improved'
import jwt from 'jsonwebtoken'

const JWT_SECRET = 'itineramio-secret-key-2024'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let userId: string
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      userId = decoded.userId
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Check environment variables
    const emailConfig = {
      hasResendApiKey: !!process.env.RESEND_API_KEY,
      isTestKey: process.env.RESEND_API_KEY === 'test_key',
      fromEmail: process.env.RESEND_FROM_EMAIL || 'hola@itineramio.com',
      nodeEnv: process.env.NODE_ENV,
      apiKeyLength: process.env.RESEND_API_KEY?.length || 0
    }

    console.log('📧 Email Configuration Check:', emailConfig)

    return NextResponse.json({
      success: true,
      config: emailConfig,
      message: 'Para que funcionen los correos electrónicos, necesitas:',
      requirements: [
        {
          requirement: 'RESEND_API_KEY configurada',
          status: emailConfig.hasResendApiKey && !emailConfig.isTestKey ? '✅' : '❌',
          note: emailConfig.isTestKey ? 'Usando test_key - los emails no se enviarán' : ''
        },
        {
          requirement: 'Dominio verificado en Resend',
          status: '⚠️',
          note: 'Verifica que itineramio.com esté verificado en tu cuenta de Resend'
        },
        {
          requirement: 'Email de envío configurado',
          status: '✅',
          current: emailConfig.fromEmail
        }
      ],
      debug: {
        timestamp: new Date().toISOString(),
        userId
      }
    })

  } catch (error) {
    console.error('Error checking email config:', error)
    return NextResponse.json(
      { error: 'Error checking email configuration' },
      { status: 500 }
    )
  }
}

// POST endpoint to send a test email
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { testEmail } = await request.json()
    
    if (!testEmail) {
      return NextResponse.json({ error: 'Email de prueba requerido' }, { status: 400 })
    }

    console.log('📧 Sending test email to:', testEmail)

    const result = await sendEmail({
      to: testEmail,
      subject: 'Test de configuración de email - Itineramio',
      html: `
        <h2>¡Test exitoso!</h2>
        <p>Si estás recibiendo este email, significa que la configuración de correo está funcionando correctamente.</p>
        <p>Fecha de test: ${new Date().toLocaleString('es-ES')}</p>
        <hr>
        <p><small>Este es un email de prueba enviado desde Itineramio.</small></p>
      `
    })

    console.log('📧 Test email result:', result)

    return NextResponse.json({
      success: result.success,
      result,
      message: result.success 
        ? 'Email de prueba enviado correctamente. Revisa tu bandeja de entrada.'
        : 'Error al enviar el email de prueba.',
      debug: {
        timestamp: new Date().toISOString(),
        emailSent: result.success,
        emailId: result.id,
        error: result.error,
        skipped: result.skipped
      }
    })

  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { 
        error: 'Error al enviar email de prueba',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}