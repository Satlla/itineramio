import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/properties/[id]/chatbot/insights
// Returns the latest weekly insight stored in intelligence.weeklyInsight
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth(req)
  if (authResult instanceof Response) return authResult

  const { id: propertyId } = await params

  const property = await prisma.property.findFirst({
    where: { id: propertyId, hostId: authResult.userId, deletedAt: null },
    select: { intelligence: true }
  })

  if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const intel = (property.intelligence as Record<string, any>) || {}
  const insight = intel.weeklyInsight || null

  return NextResponse.json({ ok: true, insight })
}
