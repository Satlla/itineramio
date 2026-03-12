import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { getMetaAuthUrl } from '@/lib/meta/client'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const authUrl = getMetaAuthUrl(user.userId)
    return NextResponse.redirect(authUrl)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Configuration error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
