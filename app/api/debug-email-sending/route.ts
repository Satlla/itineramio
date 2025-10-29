import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import jwt from 'jsonwebtoken'

const JWT_SECRET = 'itineramio-secret-key-2024'

export async function POST(request: NextRequest) {
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

    const { testEmail } = await request.json()
    
    if (!testEmail) {
      return NextResponse.json({ error: 'Email de prueba requerido' }, { status: 400 })
    }

    // Test direct Resend API
    const RESEND_API_KEY = process.env.RESEND_API_KEY
    console.log('🔍 Debug - API Key exists:', !!RESEND_API_KEY)
    console.log('🔍 Debug - API Key length:', RESEND_API_KEY?.length)
    console.log('🔍 Debug - API Key starts with:', RESEND_API_KEY?.substring(0, 5))
    
    if (!RESEND_API_KEY) {
      return NextResponse.json({
        error: 'RESEND_API_KEY not configured',
        debug: {
          hasKey: false,
          keyLength: 0
        }
      }, { status: 500 })
    }

    const resend = new Resend(RESEND_API_KEY)
    
    // Try multiple sending methods
    const results = []
    
    // Test 1: Direct with onboarding@resend.dev
    try {
      console.log('📧 Test 1: Sending with onboarding@resend.dev...')
      const result1 = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: testEmail,
        subject: 'Test 1 - Onboarding Email',
        html: '<p>This is test 1 using onboarding@resend.dev</p>'
      })
      results.push({ test: 'onboarding@resend.dev', success: true, data: result1 })
      console.log('✅ Test 1 success:', result1)
    } catch (error: any) {
      results.push({ test: 'onboarding@resend.dev', success: false, error: error.message })
      console.error('❌ Test 1 failed:', error)
    }
    
    // Test 2: Try with domain (might fail if not verified)
    try {
      console.log('📧 Test 2: Sending with hola@itineramio.com...')
      const result2 = await resend.emails.send({
        from: 'hola@itineramio.com',
        to: testEmail,
        subject: 'Test 2 - Domain Email',
        html: '<p>This is test 2 using hola@itineramio.com</p>'
      })
      results.push({ test: 'hola@itineramio.com', success: true, data: result2 })
      console.log('✅ Test 2 success:', result2)
    } catch (error: any) {
      results.push({ test: 'hola@itineramio.com', success: false, error: error.message })
      console.error('❌ Test 2 failed:', error)
    }
    
    // Test 3: Check API key validity
    try {
      console.log('📧 Test 3: Checking API key with domains endpoint...')
      const response = await fetch('https://api.resend.com/domains', {
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })
      const domains = await response.json()
      results.push({ 
        test: 'API key check', 
        success: response.ok, 
        domains: domains.data || domains
      })
      console.log('🔍 Domains response:', domains)
    } catch (error: any) {
      results.push({ test: 'API key check', success: false, error: error.message })
      console.error('❌ API check failed:', error)
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      testEmail,
      results,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasResendKey: !!process.env.RESEND_API_KEY,
        resendFromEmail: process.env.RESEND_FROM_EMAIL || 'not set'
      }
    })

  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { 
        error: 'Error in debug endpoint',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}