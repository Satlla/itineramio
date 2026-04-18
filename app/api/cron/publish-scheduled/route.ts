import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Cron: Publica artículos programados cuya fecha scheduledFor ya pasó.
 * Se ejecuta cada hora via Vercel Cron.
 *
 * GET /api/cron/publish-scheduled
 */
export async function GET(request: NextRequest) {
  try {
    const cronSecret = request.headers.get('x-cron-secret')
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    // Find all SCHEDULED posts whose scheduledFor has passed
    const postsToPublish = await prisma.blogPost.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledFor: {
          lte: now,
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        scheduledFor: true,
      },
    })

    if (postsToPublish.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay artículos programados para publicar',
        published: 0,
      })
    }

    // Publish each post
    const publishedIds: string[] = []
    for (const post of postsToPublish) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: {
          status: 'PUBLISHED',
          publishedAt: now,
        },
      })
      publishedIds.push(post.id)
    }

    return NextResponse.json({
      success: true,
      published: publishedIds.length,
      articles: postsToPublish.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al publicar artículos programados' },
      { status: 500 }
    )
  }
}
