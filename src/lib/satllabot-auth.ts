import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'satllabot-token'
const EXPIRES_IN = 60 * 60 * 24 // 24h in seconds

function getSecret(): Uint8Array {
  const secret = process.env.SATLLABOT_PANEL_SECRET
  if (!secret) throw new Error('SATLLABOT_PANEL_SECRET no configurado')
  return new TextEncoder().encode(secret)
}

export async function signPanelToken(): Promise<string> {
  return new SignJWT({ panel: 'satllabot' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSecret())
}

export async function verifyPanelToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret())
    return true
  } catch {
    return false
  }
}

export async function getPanelTokenFromCookies(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value
}

export { COOKIE_NAME, EXPIRES_IN }
