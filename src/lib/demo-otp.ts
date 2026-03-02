import { createHmac } from 'crypto'

const OTP_SECRET = process.env.OTP_HMAC_SECRET || process.env.NEXTAUTH_SECRET || 'demo-otp-fallback-secret'

/**
 * Generate a 6-digit numeric OTP code
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Generate a signed verification token for a verified email.
 * The token encodes email + timestamp, signed with HMAC-SHA256.
 * Valid for 15 minutes.
 */
export function generateDemoVerificationToken(email: string): string {
  const timestamp = Date.now()
  const payload = `${email.toLowerCase().trim()}:${timestamp}`
  const signature = createHmac('sha256', OTP_SECRET).update(payload).digest('hex')
  // Base64-encode payload:signature
  return Buffer.from(`${payload}:${signature}`).toString('base64url')
}

/**
 * Verify a demo verification token.
 * Returns true if token is valid, matches the email, and is not expired (15 min).
 */
export function verifyDemoVerificationToken(token: string, email: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const parts = decoded.split(':')
    if (parts.length !== 3) return false

    const [tokenEmail, timestampStr, signature] = parts
    const timestamp = parseInt(timestampStr, 10)

    // Check email matches
    if (tokenEmail !== email.toLowerCase().trim()) return false

    // Check not expired (15 minutes)
    const MAX_AGE_MS = 15 * 60 * 1000
    if (Date.now() - timestamp > MAX_AGE_MS) return false

    // Verify HMAC signature
    const payload = `${tokenEmail}:${timestampStr}`
    const expectedSignature = createHmac('sha256', OTP_SECRET).update(payload).digest('hex')
    if (signature !== expectedSignature) return false

    return true
  } catch {
    return false
  }
}
