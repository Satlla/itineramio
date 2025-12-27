import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export interface AcademyJWTPayload {
  userId: string
  email: string
  fullName: string
}

// Create JWT token for academy user
export async function createToken(payload: AcademyJWTPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 days validity
    .sign(JWT_SECRET)
}

// Verify JWT token
export async function verifyToken(token: string): Promise<AcademyJWTPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload as AcademyJWTPayload
  } catch (error) {
    return null
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Compare password with hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Set auth cookie
export async function setAcademyAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('academy-auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })
}

// Remove auth cookie
export async function removeAcademyAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('academy-auth-token')
}

// Get session from cookie
export async function getAcademySession(): Promise<AcademyJWTPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('academy-auth-token')?.value

    if (!token) {
      return null
    }

    const decoded = await verifyToken(token)

    if (!decoded) {
      return null
    }

    // Verify email is confirmed
    // Import prisma lazily to avoid circular dependencies
    const { prisma } = await import('../prisma')
    const user = await prisma.academyUser.findUnique({
      where: { id: decoded.userId },
      select: { emailVerified: true }
    })

    if (!user || !user.emailVerified) {
      // Email not verified - return null (cookie will be cleared on next login)
      return null
    }

    return decoded
  } catch (error) {
    console.error('Academy session verification error:', error)
    return null
  }
}
