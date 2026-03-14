import { NextRequest, NextResponse } from 'next/server'
import { signPanelToken, COOKIE_NAME, EXPIRES_IN } from '../../../../../src/lib/satllabot-auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password || password !== process.env.SATLLABOT_PANEL_PASSWORD) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
    }

    const token = await signPanelToken()

    const response = NextResponse.json({ ok: true })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: EXPIRES_IN,
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
