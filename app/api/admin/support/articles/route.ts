import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAdminAuth, createActivityLog, getRequestInfo } from '../../../../../src/lib/admin-auth'

// GET - Return all articles (including drafts)
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAdminAuth(req)
    if (authResult instanceof Response) return authResult

    const articles = await prisma.helpArticle.findMany({
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ articles })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener artículos' },
      { status: 500 }
    )
  }
}

// POST - Create article
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdminAuth(req)
    if (authResult instanceof Response) return authResult

    const body = await req.json()
    const { slug, title, content, excerpt, category, icon, order, status, featured, searchTerms } = body

    if (!slug || !title || !content || !category) {
      return NextResponse.json(
        { error: 'slug, title, content, and category are required' },
        { status: 400 }
      )
    }

    // Validate slug uniqueness
    const existingArticle = await prisma.helpArticle.findUnique({
      where: { slug },
    })

    if (existingArticle) {
      return NextResponse.json(
        { error: 'An article with this slug already exists' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = [
      'GETTING_STARTED', 'PROPERTIES', 'GUIDES', 'BILLING',
      'ACCOUNT', 'INTEGRATIONS', 'TROUBLESHOOTING', 'FEATURES'
    ]
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    const article = await prisma.helpArticle.create({
      data: {
        slug,
        title,
        content,
        excerpt: excerpt || null,
        category,
        icon: icon || null,
        order: order || 0,
        status: status || 'DRAFT',
        featured: featured || false,
        searchTerms: searchTerms || [],
      }
    })

    // Log activity
    const { ipAddress, userAgent } = getRequestInfo(req)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'help_article_created',
      targetType: 'help_article',
      targetId: article.id,
      description: `Artículo de ayuda creado: ${slug}`,
      metadata: { slug, category, status: article.status },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ article }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear artículo' },
      { status: 500 }
    )
  }
}
