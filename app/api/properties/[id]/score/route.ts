import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { checkRateLimitAsync, getRateLimitKey } from '@/lib/rate-limit'
import { calculatePropertyScore, updatePropertyScore } from '@/lib/property-scoring'

/**
 * GET /api/properties/[id]/score
 * Calcula la puntuación de optimización sin persistir
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(req)
  if (authResult instanceof Response) return authResult

  const rlKey = getRateLimitKey(req, authResult.userId, 'property-score')
  const { allowed } = await checkRateLimitAsync(rlKey, { maxRequests: 30, windowMs: 60_000 })
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { id } = await params

  const score = await calculatePropertyScore(id)
  if (!score) {
    return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 })
  }

  return NextResponse.json({
    score: score.total,
    level: score.level,
    breakdown: score.breakdown,
  })
}

/**
 * POST /api/properties/[id]/score
 * Calcula y persiste la puntuación en PropertyAnalytics.improvementScore
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(req)
  if (authResult instanceof Response) return authResult

  const rlKey = getRateLimitKey(req, authResult.userId, 'property-score-update')
  const { allowed } = await checkRateLimitAsync(rlKey, { maxRequests: 10, windowMs: 60_000 })
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { id } = await params

  const score = await updatePropertyScore(id)
  if (!score) {
    return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 })
  }

  return NextResponse.json({
    score: score.total,
    level: score.level,
    breakdown: score.breakdown,
  })
}
