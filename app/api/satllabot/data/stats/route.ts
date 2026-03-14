import { NextRequest, NextResponse } from 'next/server'
import { verifyPanelToken, getPanelTokenFromCookies } from '../../../../../src/lib/satllabot-auth'

export async function GET(request: NextRequest) {
  const token = await getPanelTokenFromCookies()
  if (!token || !(await verifyPanelToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const months = searchParams.get('months') || ''

  const url = new URL(`${process.env.SATLLABOT_API_URL}/api/panel/stats`)
  if (months) url.searchParams.set('months', months)

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${process.env.SATLLABOT_PANEL_SECRET}` },
    next: { revalidate: 3600 },
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
