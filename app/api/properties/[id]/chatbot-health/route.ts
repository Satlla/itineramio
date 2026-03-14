import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const PLACEHOLDER_REGEX = /\[NOMBRE\]|\[NAME\]|\[X\]|\[DESTINO\]|\[DESTINATION\]|\[NÚMERO\]|\[NUMBER\]|\[UBICACIÓN\]|\[LOCATION\]|\[COLOR\]|\[APP_NAME\]|\[NOMBRE_APP\]|\[OTRAS\]|\[NOMBRE_APP_LOCAL\]/i

export interface ZoneIssue {
  zoneId: string
  zoneName: string
  type: 'empty' | 'placeholder'
  actionUrl: string
}

// GET /api/properties/[id]/chatbot-health
// Returns zones with empty content or unfilled placeholders
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: propertyId } = await params

  const property = await prisma.property.findFirst({
    where: { id: propertyId, hostId: user.userId, deletedAt: null },
    include: {
      zones: {
        where: { status: 'ACTIVE' },
        include: { steps: true },
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const issues: ZoneIssue[] = []

  for (const zone of property.zones) {
    const zoneName = typeof zone.name === 'object'
      ? ((zone.name as any).es || (zone.name as any).en || Object.values(zone.name as object)[0])
      : String(zone.name)

    const actionUrl = `/properties/${propertyId}/zones/${zone.id}/steps`

    if (zone.steps.length === 0) {
      issues.push({ zoneId: zone.id, zoneName, type: 'empty', actionUrl })
      continue
    }

    for (const step of zone.steps) {
      const content = JSON.stringify(step.content || '')
      if (PLACEHOLDER_REGEX.test(content)) {
        issues.push({ zoneId: zone.id, zoneName, type: 'placeholder', actionUrl })
        break
      }
    }
  }

  return NextResponse.json({ issues, total: issues.length })
}
