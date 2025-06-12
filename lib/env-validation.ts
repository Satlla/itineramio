// Environment variables validation
const requiredEnvVars = [
  'JWT_SECRET',
  'DATABASE_URL',
  'NEXT_PUBLIC_APP_URL'
] as const

const optionalEnvVars = [
  'VERCEL_URL',
  'BLOB_READ_WRITE_TOKEN'
] as const

export function validateEnvironmentVariables() {
  const missing: string[] = []
  
  // Check required environment variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    )
  }
  
  // Validate JWT_SECRET strength
  const jwtSecret = process.env.JWT_SECRET
  if (jwtSecret && jwtSecret.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long for security. ' +
      'Generate a strong secret using: openssl rand -base64 32'
    )
  }
  
  // Validate NODE_ENV
  const nodeEnv = process.env.NODE_ENV
  if (nodeEnv && !['development', 'production', 'test'].includes(nodeEnv)) {
    console.warn(`Warning: NODE_ENV is set to "${nodeEnv}" but should be one of: development, production, test`)
  }
  
  console.log('✅ Environment variables validation passed')
}

export const env = {
  NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
  JWT_SECRET: process.env.JWT_SECRET!,
  DATABASE_URL: process.env.DATABASE_URL!,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
  VERCEL_URL: process.env.VERCEL_URL,
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
} as const