import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyPanelToken, getPanelTokenFromCookies } from '../../../../../src/lib/satllabot-auth'

const CleaningPostSchema = z.object({
  apartmentId: z.string().min(1),
  date: z.string().min(1),
  status: z.enum(['pending', 'completed', 'cancelled']).optional(),
  notes: z.string().max(500).optional(),
})

const CleaningPatchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['pending', 'completed', 'cancelled']).optional(),
  notes: z.string().max(500).optional(),
  date: z.string().optional(),
})

async function proxyToSatllabot(method: string, body: unknown) {
  const res = await fetch(`${process.env.SATLLABOT_API_URL}/api/panel/cleanings`, {
    method,
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

export async function POST(request: NextRequest) {
  const token = await getPanelTokenFromCookies()
  if (!token || !(await verifyPanelToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const raw = await request.json()
  const parsed = CleaningPostSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
  }
  return proxyToSatllabot('POST', parsed.data)
}

export async function PATCH(request: NextRequest) {
  const token = await getPanelTokenFromCookies()
  if (!token || !(await verifyPanelToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const raw = await request.json()
  const parsed = CleaningPatchSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
  }
  return proxyToSatllabot('PATCH', parsed.data)
}
