import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email') || 'test@example.com'

  try {
    console.log('🧪 TEST EMAIL ENDPOINT')
    console.log('📧 Sending test email to:', email)
    console.log('🔑 RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
    console.log('🔑 API Key value:', process.env.RESEND_API_KEY?.substring(0, 20) + '...')
    
    const result = await sendEmail({
      to: email,
      subject: 'Test Email from Itineramio',
      html: `
        <h1>Test Email</h1>
        <p>If you receive this, email sending is working!</p>
        <p>Time: ${new Date().toISOString()}</p>
      `
    })

    return NextResponse.json({
      success: true,
      message: 'Test email sent',
      result,
      debug: {
        apiKeyPresent: !!process.env.RESEND_API_KEY,
        apiKeyStart: process.env.RESEND_API_KEY?.substring(0, 10),
        emailTo: email,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('❌ Test email error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        apiKeyPresent: !!process.env.RESEND_API_KEY,
        apiKeyStart: process.env.RESEND_API_KEY?.substring(0, 10),
        errorType: error?.constructor?.name
      }
    }, { status: 500 })
  }
}