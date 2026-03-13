import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'
import { checkRateLimitAsync } from '@/lib/rate-limit'
import { searchReddit } from '@/lib/reddit/client'
import { searchYouTube } from '@/lib/youtube/client'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) return authResult

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()
    const platform = searchParams.get('platform') || 'all'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50)

    if (!q) {
      return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 })
    }

    const result = await checkRateLimitAsync(`ugc-search:${(authResult as any).adminId}`, {
      maxRequests: 5,
      windowMs: 60 * 1000,
    })
    if (!result.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const results: Array<{
      platform: string
      id: string
      author: string
      title: string
      content: string
      url: string
      subreddit?: string
      score: number
      comments: number
      createdAt: string
    }> = []

    const errors: string[] = []

    if (platform === 'reddit' || platform === 'all') {
      try {
        const posts = await searchReddit(q, undefined, limit)
        for (const post of posts) {
          results.push({
            platform: 'reddit',
            id: post.id,
            author: post.author,
            title: post.title,
            content: post.selftext,
            url: post.url,
            subreddit: post.subreddit,
            score: post.score,
            comments: post.num_comments,
            createdAt: new Date(post.created_utc * 1000).toISOString(),
          })
        }
      } catch (err: any) {
        errors.push(`Reddit: ${err.message}`)
      }
    }

    if (platform === 'youtube' || platform === 'all') {
      try {
        const videos = await searchYouTube(q, limit)
        for (const video of videos) {
          results.push({
            platform: 'youtube',
            id: video.id,
            author: video.channelTitle,
            title: video.title,
            content: video.description,
            url: video.url,
            score: video.likeCount,
            comments: 0,
            createdAt: video.publishedAt,
          })
        }
      } catch (err: any) {
        errors.push(`YouTube: ${err.message}`)
      }
    }

    return NextResponse.json({
      results,
      total: results.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
