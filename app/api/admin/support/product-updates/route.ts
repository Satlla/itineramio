import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAdminAuth, createActivityLog, getRequestInfo } from '../../../../../src/lib/admin-auth'

// GET - Return all product updates (including unpublished)
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAdminAuth(req)
    if (authResult instanceof Response) return authResult

    const updates = await prisma.productUpdate.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { reads: true }
        }
      }
    })

    return NextResponse.json({ updates })
  } catch (error) {
    console.error('Error fetching admin product updates:', error)
    return NextResponse.json(
      { error: 'Error al obtener actualizaciones' },
      { status: 500 }
    )
  }
}

// POST - Create product update
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdminAuth(req)
    if (authResult instanceof Response) return authResult

    const body = await req.json()
    const { title, description, image, ctaText, ctaUrl, tag, isPublished } = body

    if (!title || !description) {
      return NextResponse.json(
        { error: 'title and description are required' },
        { status: 400 }
      )
    }

    // Validate tag if provided
    if (tag) {
      const validTags = ['NEW', 'IMPROVEMENT', 'FIX']
      if (!validTags.includes(tag)) {
        return NextResponse.json(
          { error: 'Invalid tag. Must be NEW, IMPROVEMENT, or FIX' },
          { status: 400 }
        )
      }
    }

    const update = await prisma.productUpdate.create({
      data: {
        title,
        description,
        image: image || null,
        ctaText: ctaText || null,
        ctaUrl: ctaUrl || null,
        tag: tag || 'NEW',
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
      }
    })

    // Log activity
    const { ipAddress, userAgent } = getRequestInfo(req)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'product_update_created',
      targetType: 'product_update',
      targetId: update.id,
      description: `Actualización de producto creada`,
      metadata: { tag: update.tag, isPublished: update.isPublished },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ update }, { status: 201 })
  } catch (error) {
    console.error('Error creating product update:', error)
    return NextResponse.json(
      { error: 'Error al crear actualización' },
      { status: 500 }
    )
  }
}
