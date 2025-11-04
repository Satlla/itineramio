import { cookies } from 'next/headers'
import { verifyToken, type JWTPayload } from './auth'

export async function getSession(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    const decoded = verifyToken(token)
    return decoded
  } catch (error) {
    console.error('Session verification error:', error)
    return null
  }
}
