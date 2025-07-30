import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '../../../src/lib/email-improved'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, type = 'test', subject, message } = body

    if (!to) {
      return NextResponse.json(
        { error: 'Email recipient required' },
        { status: 400 }
      )
    }

    let emailContent = ''
    let emailSubject = subject || 'Test Email - Itineramio'

    // Different email types for testing
    switch (type) {
      case 'verification':
        emailContent = emailTemplates.emailVerification(
          'https://itineramio.com/verify?token=test123',
          'Usuario Test'
        )
        emailSubject = 'Confirma tu cuenta - Itineramio'
        break
        
      case 'welcome':
        emailContent = emailTemplates.welcomeEmail('Usuario Test')
        emailSubject = '¡Bienvenido a Itineramio!'
        break
        
      case 'evaluation':
        emailContent = emailTemplates.zoneEvaluationNotification(
          'Casa de Playa',
          'Check-in',
          4,
          'Todo perfecto, muy clara la información'
        )
        emailSubject = 'Nueva evaluación recibida - Itineramio'
        break
        
      case 'custom':
        emailContent = `
          <h1>Test Email</h1>
          <p>${message || 'This is a test email from Itineramio'}</p>
        `
        break
        
      default:
        emailContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Test Email</title>
          </head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #8b5cf6;">Test Email - Itineramio</h1>
            <p>Este es un email de prueba para verificar la configuración.</p>
            <hr>
            <p><strong>Configuración actual:</strong></p>
            <ul>
              <li>API Key configurada: ${process.env.RESEND_API_KEY ? 'Sí' : 'No'}</li>
              <li>From Email: ${process.env.RESEND_FROM_EMAIL || 'hola@itineramio.com'}</li>
              <li>Environment: ${process.env.NODE_ENV || 'development'}</li>
              <li>Timestamp: ${new Date().toISOString()}</li>
            </ul>
          </body>
          </html>
        `
    }

    // Send test email
    const result = await sendEmail({
      to,
      subject: emailSubject,
      html: emailContent
    })

    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? 'Email enviado correctamente' 
        : 'Error al enviar email',
      details: {
        id: result.id,
        error: result.error,
        skipped: result.skipped,
        config: {
          hasApiKey: !!process.env.RESEND_API_KEY,
          fromEmail: process.env.RESEND_FROM_EMAIL || 'hola@itineramio.com',
          environment: process.env.NODE_ENV || 'development'
        }
      }
    })

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { 
        error: 'Error sending test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check email configuration status
export async function GET() {
  const config = {
    resend: {
      apiKeyConfigured: !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'test_key',
      apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10) + '...',
      fromEmail: process.env.RESEND_FROM_EMAIL || 'hola@itineramio.com',
      environment: process.env.NODE_ENV || 'development'
    },
    recommendations: [] as string[]
  }

  // Add recommendations based on configuration
  if (!config.resend.apiKeyConfigured) {
    config.recommendations.push('Configure RESEND_API_KEY in environment variables')
  }

  if (config.resend.fromEmail === 'hola@itineramio.com') {
    config.recommendations.push('Verify itineramio.com domain in Resend or use RESEND_FROM_EMAIL with a verified domain')
  }

  if (config.resend.environment === 'production' && !config.resend.apiKeyConfigured) {
    config.recommendations.push('⚠️ CRITICAL: Email service not configured for production!')
  }

  return NextResponse.json({
    status: config.resend.apiKeyConfigured ? 'configured' : 'not_configured',
    config,
    testEndpoint: '/api/test-email (POST)',
    testPayload: {
      to: 'your-email@example.com',
      type: 'test|verification|welcome|evaluation|custom',
      subject: 'Optional custom subject',
      message: 'Optional custom message (for type: custom)'
    }
  })
}