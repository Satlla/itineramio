export function validateEnvironmentVariables() {
  const isProduction = process.env.NODE_ENV === 'production'

  // Always validate in production, optional in development
  if (!isProduction && !process.env.VALIDATE_ENV) {
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

  // SECURITY: Check for hardcoded JWT secret
  const jwtSecret = process.env.JWT_SECRET
  const insecureSecrets = [
    'itineramio-secret-key-2024',
    'your-secret-key',
    'secret',
    'jwt-secret'
  ]

  if (jwtSecret && insecureSecrets.includes(jwtSecret)) {
    console.error(
      '🔴 SECURITY WARNING: JWT_SECRET is using an insecure default value!\n' +
      'Please set a strong, unique JWT_SECRET in your environment variables.\n' +
      'Generate one with: openssl rand -base64 32'
    )
  }

  // SECURITY: Warn if JWT_SECRET is too short
  if (jwtSecret && jwtSecret.length < 32) {
    console.warn(
      '⚠️  JWT_SECRET is shorter than recommended (32+ characters).\n' +
      'Consider using a longer secret for better security.'
    )
  }
}