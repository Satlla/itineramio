import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAdminAuth, createActivityLog, getRequestInfo } from '../../../../../../src/lib/admin-auth'

// GET - Return single article by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminAuth(req)
    if (authResult instanceof Response) return authResult

    const { id } = await params

    const article = await prisma.helpArticle.findUnique({
      where: { id },
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ article })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener artículo' },
      { status: 500 }
    )
  }
}

// PUT - Update article
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminAuth(req)
    if (authResult instanceof Response) return authResult

    const { id } = await params
    const body = await req.json()

    // Verify article exists
    const existingArticle = await prisma.helpArticle.findUnique({
      where: { id },
      select: { id: true, slug: true }
    })

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // If slug is being changed, check uniqueness
    if (body.slug && body.slug !== existingArticle.slug) {
      const slugExists = await prisma.helpArticle.findUnique({
        where: { slug: body.slug },
      })
      if (slugExists) {
        return NextResponse.json(
          { error: 'An article with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Validate category if provided
    if (body.category) {
      const validCategories = [
        'GETTING_STARTED', 'PROPERTIES', 'GUIDES', 'BILLING',
        'ACCOUNT', 'INTEGRATIONS', 'TROUBLESHOOTING', 'FEATURES'
      ]
      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        )
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'slug', 'title', 'content', 'excerpt', 'category', 'icon',
      'order', 'status', 'featured', 'searchTerms'
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const article = await prisma.helpArticle.update({
      where: { id },
      data: updateData,
    })

    // Log activity
    const { ipAddress, userAgent } = getRequestInfo(req)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'help_article_updated',
      targetType: 'help_article',
      targetId: id,
      description: `Artículo de ayuda actualizado: ${article.slug}`,
      metadata: { updatedFields: Object.keys(updateData) },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ article })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar artículo' },
      { status: 500 }
    )
  }
}

// DELETE - Delete article
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminAuth(req)
    if (authResult instanceof Response) return authResult

    const { id } = await params

    // Verify article exists
    const existingArticle = await prisma.helpArticle.findUnique({
      where: { id },
      select: { id: true, slug: true }
    })

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    await prisma.helpArticle.delete({
      where: { id },
    })

    // Log activity
    const { ipAddress, userAgent } = getRequestInfo(req)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'help_article_deleted',
      targetType: 'help_article',
      targetId: id,
      description: `Artículo de ayuda eliminado: ${existingArticle.slug}`,
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar artículo' },
      { status: 500 }
    )
  }
}
