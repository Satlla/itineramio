import { NextRequest, NextResponse } from 'next/server'
import { verifyPanelToken, getPanelTokenFromCookies } from '../../../../../src/lib/satllabot-auth'

export async function GET(request: NextRequest) {
  const token = await getPanelTokenFromCookies()
  if (!token || !(await verifyPanelToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const res = await fetch(`${process.env.SATLLABOT_API_URL}/api/panel/week`, {
    headers: { Authorization: `Bearer ${process.env.SATLLABOT_PANEL_SECRET}` },
    next: { revalidate: 120 },
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
