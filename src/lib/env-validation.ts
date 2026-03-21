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

  // SECURITY: Check for hardcoded JWT secret
  const jwtSecret = process.env.JWT_SECRET
  const insecureSecrets = [
    'itineramio-secret-key-2024',
    'your-secret-key',
    'secret',
    'jwt-secret'
  ]

  if (jwtSecret && insecureSecrets.includes(jwtSecret)) {
    throw new Error('SECURITY WARNING: JWT_SECRET is using an insecure default value. Set a strong, unique JWT_SECRET.')
  }
}