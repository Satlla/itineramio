import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '../../../src/lib/email-improved'

export async function POST(request: NextRequest) {
  try {
    console.log('🚨 EMAIL DEBUG TEST: Starting...')
    
    // Test environment variables
    console.log('🚨 Environment check:', {
      nodeEnv: process.env.NODE_ENV,
      hasResendKey: !!process.env.RESEND_API_KEY,
      resendKeyLength: process.env.RESEND_API_KEY?.length || 0,
      fromEmail: JSON.stringify(process.env.RESEND_FROM_EMAIL),
      resendKeyPreview: process.env.RESEND_API_KEY?.substring(0, 10) + '...'
    })

    // Test email sending exactly like in evaluations
    const testEmail = 'alejandrosatlla@gmail.com'
    
    console.log('🚨 EMAIL DEBUG TEST: Sending to:', testEmail)
    
    const emailResult = await sendEmail({
      to: testEmail,
      subject: 'TEST DEBUG - Nueva evaluación de zona: 5 estrellas - Test Property',
      html: emailTemplates.zoneEvaluationNotification(
        'Test Property Debug',
        'Test Zone Debug',
        5,
        'This is a debug test to see why emails are not arriving'
      )
    })
    
    console.log('🚨 EMAIL DEBUG TEST: Full result:', JSON.stringify(emailResult, null, 2))

    return NextResponse.json({
      success: true,
      emailResult,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasResendKey: !!process.env.RESEND_API_KEY,
        fromEmailRaw: process.env.RESEND_FROM_EMAIL,
        fromEmailJson: JSON.stringify(process.env.RESEND_FROM_EMAIL)
      }
    })

  } catch (error) {
    console.error('🚨 EMAIL DEBUG TEST: Error:', error)
    return NextResponse.json({
      error: 'Debug test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}