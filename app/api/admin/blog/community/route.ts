import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../../src/lib/admin-auth'

const categoryNames: Record<string, string> = {
  'GUIAS': 'Guías',
  'MEJORES_PRACTICAS': 'Mejores Prácticas',
  'NORMATIVA': 'Normativa',
  'AUTOMATIZACION': 'Automatización',
  'MARKETING': 'Marketing',
  'OPERACIONES': 'Operaciones',
  'CASOS_ESTUDIO': 'Casos de Estudio',
  'NOTICIAS': 'Noticias'
}

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get('sortBy') || 'comments'

    // Get all comments with post info
    const comments = await prisma.blogComment.findMany({
      select: {
        authorEmail: true,
        authorName: true,
        likes: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        post: {
          select: {
            title: true,
            slug: true,
            category: true
          }
        }
      }
    })

    // Aggregate by email
    const commenterMap = new Map<string, {
      email: string
      name: string
      totalComments: number
      approvedComments: number
      totalLikes: number
      firstCommentAt: Date
      lastCommentAt: Date
      isVerified: boolean
      categoryCounts: Map<string, number>
      postCounts: Map<string, { title: string; slug: string; count: number }>
    }>()

    for (const comment of comments) {
      const email = comment.authorEmail.toLowerCase()

      if (!commenterMap.has(email)) {
        commenterMap.set(email, {
          email,
          name: comment.authorName,
          totalComments: 0,
          approvedComments: 0,
          totalLikes: 0,
          firstCommentAt: comment.createdAt,
          lastCommentAt: comment.createdAt,
          isVerified: false,
          categoryCounts: new Map(),
          postCounts: new Map()
        })
      }

      const commenter = commenterMap.get(email)!
      commenter.totalComments++
      commenter.totalLikes += comment.likes

      if (comment.status === 'APPROVED') {
        commenter.approvedComments++
      }

      if (comment.emailVerified) {
        commenter.isVerified = true
      }

      if (comment.createdAt < commenter.firstCommentAt) {
        commenter.firstCommentAt = comment.createdAt
      }
      if (comment.createdAt > commenter.lastCommentAt) {
        commenter.lastCommentAt = comment.createdAt
      }

      // Track categories
      const category = comment.post.category
      const currentCatCount = commenter.categoryCounts.get(category) || 0
      commenter.categoryCounts.set(category, currentCatCount + 1)

      // Track posts
      const postSlug = comment.post.slug
      const existingPost = commenter.postCounts.get(postSlug)
      if (existingPost) {
        existingPost.count++
      } else {
        commenter.postCounts.set(postSlug, {
          title: comment.post.title,
          slug: postSlug,
          count: 1
        })
      }
    }

    // Convert to array and format
    let commenters = Array.from(commenterMap.values()).map(c => ({
      email: c.email,
      name: c.name,
      totalComments: c.totalComments,
      approvedComments: c.approvedComments,
      totalLikes: c.totalLikes,
      firstCommentAt: c.firstCommentAt.toISOString(),
      lastCommentAt: c.lastCommentAt.toISOString(),
      isVerified: c.isVerified,
      categories: Array.from(c.categoryCounts.entries())
        .map(([name, count]) => ({ name: categoryNames[name] || name, count }))
        .sort((a, b) => b.count - a.count),
      posts: Array.from(c.postCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    }))

    // Sort
    switch (sortBy) {
      case 'likes':
        commenters.sort((a, b) => b.totalLikes - a.totalLikes)
        break
      case 'recent':
        commenters.sort((a, b) => new Date(b.lastCommentAt).getTime() - new Date(a.lastCommentAt).getTime())
        break
      case 'oldest':
        commenters.sort((a, b) => new Date(a.firstCommentAt).getTime() - new Date(b.firstCommentAt).getTime())
        break
      case 'comments':
      default:
        commenters.sort((a, b) => b.totalComments - a.totalComments)
    }

    return NextResponse.json({ commenters })
  } catch (error) {
    console.error('Error fetching community:', error)
    return NextResponse.json(
      { error: 'Error al cargar la comunidad' },
      { status: 500 }
    )
  }
}
