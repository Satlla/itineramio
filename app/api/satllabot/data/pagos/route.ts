import { NextRequest, NextResponse } from 'next/server'
import { verifyPanelToken, getPanelTokenFromCookies } from '../../../../../src/lib/satllabot-auth'

export async function GET(request: NextRequest) {
  const token = await getPanelTokenFromCookies()
  if (!token || !(await verifyPanelToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const url = new URL(`${process.env.SATLLABOT_API_URL}/api/panel/pagos`)
  searchParams.forEach((value, key) => url.searchParams.set(key, value))

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${process.env.SATLLABOT_PANEL_SECRET}` },
    cache: 'no-store',
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function POST(request: NextRequest) {
  const token = await getPanelTokenFromCookies()
  if (!token || !(await verifyPanelToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const res = await fetch(`${process.env.SATLLABOT_API_URL}/api/panel/pagos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SATLLABOT_PANEL_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function PATCH(request: NextRequest) {
  const token = await getPanelTokenFromCookies()
  if (!token || !(await verifyPanelToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const res = await fetch(`${process.env.SATLLABOT_API_URL}/api/panel/pagos`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${process.env.SATLLABOT_PANEL_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
