import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/blog/view - Increment blog post view count (async, non-blocking)
export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json()

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 })
    }

    // Increment view count in background (fire and forget style)
    await prisma.blogPost.updateMany({
      where: { slug, status: 'PUBLISHED' },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    // Don't fail the request if view tracking fails
    console.error('Blog view tracking error:', error)
    return NextResponse.json({ success: false })
  }
}
