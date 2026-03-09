import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()
    const category = searchParams.get('category')

    // Build where clause
    const where: Record<string, unknown> = {
      status: 'PUBLISHED',
    }

    if (category) {
      where.category = category.toUpperCase()
    }

    // Fetch articles
    let articles = await prisma.helpArticle.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    // Filter by search term in JS (since title/content are JSON fields)
    if (search) {
      const searchLower = search.toLowerCase()
      articles = articles.filter((article) => {
        // Check title (multilang JSON)
        const titleObj = article.title as Record<string, string> | null
        if (titleObj) {
          const titleMatch = Object.values(titleObj).some(
            (val) => typeof val === 'string' && val.toLowerCase().includes(searchLower)
          )
          if (titleMatch) return true
        }

        // Check excerpt (multilang JSON)
        const excerptObj = article.excerpt as Record<string, string> | null
        if (excerptObj) {
          const excerptMatch = Object.values(excerptObj).some(
            (val) => typeof val === 'string' && val.toLowerCase().includes(searchLower)
          )
          if (excerptMatch) return true
        }

        // Check searchTerms array
        if (article.searchTerms && article.searchTerms.length > 0) {
          const termsMatch = article.searchTerms.some(
            (term) => term.toLowerCase().includes(searchLower)
          )
          if (termsMatch) return true
        }

        return false
      })
    }

    return NextResponse.json({ articles })
  } catch (error) {
    console.error('Error fetching help articles:', error)
    return NextResponse.json(
      { error: 'Error al obtener artículos' },
      { status: 500 }
    )
  }
}
