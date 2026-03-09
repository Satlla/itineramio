import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { checkRateLimit, getRateLimitKey } from '../../../../../../src/lib/rate-limit'

const VOTE_RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60 * 1000
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Rate limit votes by IP
    const rateLimitKey = getRateLimitKey(request, null, 'article-vote')
    const rateLimitResult = checkRateLimit(rateLimitKey, VOTE_RATE_LIMIT)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const { slug } = await params
    const body = await request.json()
    const { helpful } = body

    if (typeof helpful !== 'boolean') {
      return NextResponse.json(
        { error: 'Field "helpful" (boolean) is required' },
        { status: 400 }
      )
    }

    const article = await prisma.helpArticle.findUnique({
      where: { slug },
      select: { id: true, status: true },
    })

    if (!article || article.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Increment the appropriate counter
    await prisma.helpArticle.update({
      where: { id: article.id },
      data: helpful
        ? { helpfulYes: { increment: 1 } }
        : { helpfulNo: { increment: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error voting on article:', error)
    return NextResponse.json(
      { error: 'Error al votar' },
      { status: 500 }
    )
  }
}
