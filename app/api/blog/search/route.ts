import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

// Normalize text for accent-insensitive search
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ñ]/g, 'n')
    .replace(/[ü]/g, 'u')
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')?.trim()
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.length < 2) {
      return NextResponse.json({
        results: [],
        total: 0,
        query: query || ''
      })
    }

    const normalizedQuery = normalizeText(query)

    // Search in blog posts
    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
        ...(category && { category }),
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { title: { contains: normalizedQuery, mode: 'insensitive' } },
          { excerpt: { contains: query, mode: 'insensitive' } },
          { excerpt: { contains: normalizedQuery, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { content: { contains: normalizedQuery, mode: 'insensitive' } },
          { tags: { hasSome: [query, normalizedQuery] } },
          { keywords: { hasSome: [query, normalizedQuery] } },
        ]
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        category: true,
        tags: true,
        readTime: true,
        views: true,
        publishedAt: true,
        authorName: true,
      },
      orderBy: [
        { views: 'desc' },
        { publishedAt: 'desc' }
      ],
      take: limit
    })

    // Score and sort results by relevance
    const scoredPosts = posts.map(post => {
      let score = 0
      const normalizedTitle = normalizeText(post.title)
      const normalizedExcerpt = normalizeText(post.excerpt)

      // Title match (highest weight)
      if (normalizedTitle.includes(normalizedQuery)) {
        score += 10
        if (normalizedTitle.startsWith(normalizedQuery)) score += 5
      }

      // Excerpt match
      if (normalizedExcerpt.includes(normalizedQuery)) {
        score += 5
      }

      // Tag match
      if (post.tags.some(tag => normalizeText(tag).includes(normalizedQuery))) {
        score += 3
      }

      // Boost for recent posts (last 30 days)
      if (post.publishedAt) {
        const daysSince = (Date.now() - new Date(post.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
        if (daysSince < 30) score += 2
      }

      // Boost for popular posts
      if (post.views > 100) score += 1
      if (post.views > 500) score += 1

      return { ...post, score }
    })

    // Sort by score
    scoredPosts.sort((a, b) => b.score - a.score)

    // Category labels
    const categoryLabels: Record<string, string> = {
      'GUIAS': 'Guías',
      'MEJORES_PRACTICAS': 'Mejores Prácticas',
      'NORMATIVA': 'Normativa',
      'AUTOMATIZACIÓN': 'Automatización',
      'MARKETING': 'Marketing',
      'OPERACIONES': 'Operaciones',
      'CASOS_ESTUDIO': 'Casos de Estudio',
      'NOTICIAS': 'Noticias'
    }

    const results = scoredPosts.map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      category: post.category,
      categoryLabel: categoryLabels[post.category] || post.category,
      tags: post.tags,
      readTime: post.readTime,
      views: post.views,
      publishedAt: post.publishedAt,
      authorName: post.authorName,
      url: `/blog/${post.slug}`
    }))

    return NextResponse.json({
      results,
      total: results.length,
      query
    })

  } catch (error) {
    console.error('Blog search error:', error)
    return NextResponse.json(
      { error: 'Error en la búsqueda', results: [], total: 0 },
      { status: 500 }
    )
  }
}
