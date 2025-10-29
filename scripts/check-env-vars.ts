// Script to check which environment variables are configured
// This helps debug email and other service issues

console.log('Environment Variables Check:')
console.log('----------------------------')

const importantVars = [
  'RESEND_API_KEY',
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'NEXT_PUBLIC_APP_URL',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'NODE_ENV'
]

for (const varName of importantVars) {
  const value = process.env[varName]
  if (value) {
    // Show only first 10 chars for security
    const preview = value.substring(0, 10) + '...'
    console.log(`✅ ${varName}: ${preview}`)
  } else {
    console.log(`❌ ${varName}: NOT SET`)
  }
}

console.log('\nEmail Configuration:')
console.log('--------------------')
if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'test_key') {
  console.log('⚠️  Emails will NOT be sent - RESEND_API_KEY is not configured')
  console.log('   To fix: Add RESEND_API_KEY to Vercel environment variables')
} else {
  console.log('✅ Email sending is configured')
}