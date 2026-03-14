import { NextRequest, NextResponse } from 'next/server'
import { verifyPanelToken, getPanelTokenFromCookies } from '../../../../../src/lib/satllabot-auth'

export async function PATCH(request: NextRequest) {
  const token = await getPanelTokenFromCookies()
  if (!token || !(await verifyPanelToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const res = await fetch(`${process.env.SATLLABOT_API_URL}/api/panel/cleanings`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${process.env.SATLLABOT_PANEL_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
