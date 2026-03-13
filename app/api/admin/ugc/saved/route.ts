import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) return authResult

    const leads = await prisma.ugcLead.findMany({
      orderBy: { savedAt: 'desc' },
    })

    return NextResponse.json({ leads })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) return authResult

    const body = await request.json()
    const { postId, platform, author, title, content, url, subreddit, score, comments } = body

    if (!postId || !platform || !author || !url) {
      return NextResponse.json({ error: 'postId, platform, author and url are required' }, { status: 400 })
    }

    const lead = await prisma.ugcLead.upsert({
      where: { postId },
      update: {},
      create: {
        postId,
        platform,
        author,
        title: title || null,
        content: content || null,
        url,
        subreddit: subreddit || null,
        score: score ?? null,
        comments: comments ?? null,
      },
    })

    return NextResponse.json({ lead }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) return authResult

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    await prisma.ugcLead.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
