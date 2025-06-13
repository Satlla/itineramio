import { NextResponse } from 'next/server'

export async function GET() {
  const originalUrl = process.env.DATABASE_URL
  
  if (!originalUrl) {
    return NextResponse.json({ error: 'No DATABASE_URL configured' }, { status: 500 })
  }
  
  // Check if URL already has pgbouncer parameter
  const hasPgBouncer = originalUrl.includes('pgbouncer=true')
  const hasPoolTimeout = originalUrl.includes('pool_timeout')
  
  let fixedUrl = originalUrl
  
  // Add pgbouncer=true if not present
  if (!hasPgBouncer) {
    const separator = originalUrl.includes('?') ? '&' : '?'
    fixedUrl += `${separator}pgbouncer=true`
  }
  
  // Add pool_timeout if not present
  if (!hasPoolTimeout) {
    const separator = fixedUrl.includes('?') ? '&' : '?'
    fixedUrl += `${separator}pool_timeout=0`
  }
  
  return NextResponse.json({
    message: 'Database URL configuration',
    needsFix: !hasPgBouncer || !hasPoolTimeout,
    recommendation: 'Add these parameters to your DATABASE_URL in Vercel:',
    parameters: '?pgbouncer=true&pool_timeout=0',
    example: 'postgresql://user:pass@host:port/db?pgbouncer=true&pool_timeout=0',
    current: {
      hasPgBouncer,
      hasPoolTimeout,
      urlLength: originalUrl.length
    }
  })
}