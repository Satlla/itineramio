import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    // Test sending to a non-verified email
    const testEmail = 'test@example.com'
    
    const { data, error } = await resend.emails.send({
      from: 'hola@itineramio.com',
      to: testEmail,
      subject: 'Test Domain Verification',
      html: '<p>If you receive this, the domain is verified!</p>'
    })
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully!',
      data
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}