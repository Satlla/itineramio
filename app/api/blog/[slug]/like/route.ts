import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { checkRateLimitAsync, getRateLimitKey } from '../../../../../src/lib/rate-limit'

// POST - Like a blog post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const rl = await checkRateLimitAsync(
      getRateLimitKey(request, null, 'blog-like'),
      { maxRequests: 3, windowMs: 60 * 1000 }
    )
    if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const { slug } = await params

    // Find the blog post by slug
    const post = await prisma.blogPost.findUnique({
      where: { slug, status: 'PUBLISHED' },
      select: { id: true, likes: true }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Artículo no encontrado' },
        { status: 404 }
      )
    }

    // Increment likes
    const updated = await prisma.blogPost.update({
      where: { id: post.id },
      data: { likes: { increment: 1 } },
      select: { likes: true }
    })

    return NextResponse.json({
      success: true,
      likes: updated.likes
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al dar like' },
      { status: 500 }
    )
  }
}
