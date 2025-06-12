export function validateEnvironmentVariables() {
  // Only validate in production or when explicitly required
  if (process.env.NODE_ENV !== 'production' && !process.env.VALIDATE_ENV) {
    return
  }

  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NEXT_PUBLIC_APP_URL',
    'RESEND_API_KEY'
  ]

  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar])

  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Missing environment variables: ${missingVars.join(', ')}\n` +
      'The application may not function correctly in production.'
    )
  }
}