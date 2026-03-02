import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { checkRateLimit, getRateLimitKey } from '../../../../src/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 requests per IP per hour
    const rateLimitKey = getRateLimitKey(request, null, 'demo-feedback')
    const rateCheck = checkRateLimit(rateLimitKey, {
      maxRequests: 5,
      windowMs: 60 * 60 * 1000,
    })
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Demasiados envíos. Inténtalo más tarde.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { leadId, rating, comment, improveComment } = body

    if (!leadId || !rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Datos inválidos. Se requiere leadId y rating (1-5).' },
        { status: 400 }
      )
    }

    // Find the lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    })

    if (!lead || lead.source !== 'demo') {
      return NextResponse.json(
        { error: 'Lead no encontrado.' },
        { status: 404 }
      )
    }

    const metadata = (lead.metadata as Record<string, unknown>) || {}

    // Don't allow re-submission
    if (metadata.feedbackRating) {
      return NextResponse.json({
        success: true,
        alreadySubmitted: true,
        couponCode: (metadata.couponCode as string) || null,
      })
    }

    // Update lead metadata with feedback
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        metadata: {
          ...metadata,
          feedbackRating: rating,
          feedbackComment: comment || null,
          feedbackImproveComment: improveComment || null,
          feedbackAt: new Date().toISOString(),
        },
      },
    })

    return NextResponse.json({
      success: true,
      couponCode: (metadata.couponCode as string) || null,
    })
  } catch (error) {
    console.error('[DemoFeedback] Error:', error)
    return NextResponse.json(
      { error: 'Error al guardar feedback.' },
      { status: 500 }
    )
  }
}
