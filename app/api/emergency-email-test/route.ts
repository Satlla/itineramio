import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '../../../src/lib/email-improved'

export async function POST(request: NextRequest) {
  try {
    const { testEmail, testType = 'evaluation' } = await request.json()
    
    if (!testEmail) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    console.log('🚨 EMERGENCY EMAIL TEST: Starting test for:', testEmail)
    console.log('🚨 Environment check:', {
      nodeEnv: process.env.NODE_ENV,
      hasResendKey: !!process.env.RESEND_API_KEY,
      resendKeyLength: process.env.RESEND_API_KEY?.length || 0,
      fromEmail: process.env.RESEND_FROM_EMAIL
    })

    let result
    if (testType === 'evaluation') {
      // Test evaluation email (the broken one)
      result = await sendEmail({
        to: testEmail,
        subject: 'TEST - Nueva evaluación de zona: 5 estrellas - Test Property',
        html: emailTemplates.zoneEvaluationNotification(
          'Test Property',
          'Test Zone',
          5,
          'This is a test evaluation comment'
        )
      })
    } else {
      // Test verification email (the working one)
      result = await sendEmail({
        to: testEmail,
        subject: 'TEST - Confirma tu cuenta - Itineramio',
        html: emailTemplates.emailVerification('http://example.com/verify', 'Test User')
      })
    }

    console.log('🚨 EMERGENCY EMAIL TEST: Result:', result)

    return NextResponse.json({
      success: result.success,
      result,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasResendKey: !!process.env.RESEND_API_KEY,
        fromEmail: process.env.RESEND_FROM_EMAIL
      }
    })

  } catch (error) {
    console.error('🚨 EMERGENCY EMAIL TEST: Error:', error)
    return NextResponse.json({
      error: 'Emergency test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}