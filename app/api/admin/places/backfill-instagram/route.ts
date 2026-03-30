import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { getAdminUser } from '../../../../../src/lib/admin-auth'
import { extractInstagramFromWebsite } from '../../../../../src/lib/extract-instagram'

const BATCH_SIZE = 8

/**
 * POST /api/admin/places/backfill-instagram
 * Extracts Instagram URLs from business websites for places in a city guide.
 * Runs in batches to avoid Vercel timeout.
 * Body: { guideId: string, offset?: number }
 */
export async function POST(request: NextRequest) {
  const admin = await getAdminUser(request)
  if (!admin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const { guideId, offset = 0 } = body

  if (!guideId) {
    return NextResponse.json({ error: 'guideId requerido' }, { status: 400 })
  }

  // Find places in this guide that have a website but no instagramUrl yet
  const guidePlaces = await prisma.cityGuidePlace.findMany({
    where: {
      guideId,
      place: {
        website: { not: null },
        instagramUrl: null,
      },
    },
    include: {
      place: { select: { id: true, name: true, website: true } },
    },
    skip: offset,
    take: BATCH_SIZE,
    orderBy: { createdAt: 'asc' },
  })

  const total = await prisma.cityGuidePlace.count({
    where: {
      guideId,
      place: {
        website: { not: null },
        instagramUrl: null,
      },
    },
  })

  let found = 0

  for (const gp of guidePlaces) {
    const website = gp.place.website!
    const instagram = await extractInstagramFromWebsite(website)

    if (instagram) {
      await prisma.place.update({
        where: { id: gp.place.id },
        data: { instagramUrl: instagram },
      })
      found++
    }

    // Soft rate limiting between requests
    await new Promise(r => setTimeout(r, 300))
  }

  const nextOffset = offset + guidePlaces.length
  const done = guidePlaces.length < BATCH_SIZE || nextOffset >= total

  return NextResponse.json({
    processed: guidePlaces.length,
    found,
    done,
    nextOffset,
    total,
  })
}
