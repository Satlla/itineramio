import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAdminAuth, createActivityLog, getRequestInfo } from '../../../../../../src/lib/admin-auth'

// PUT - Update product update
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminAuth(req)
    if (authResult instanceof Response) return authResult

    const { id } = await params
    const body = await req.json()

    // Verify it exists
    const existing = await prisma.productUpdate.findUnique({
      where: { id },
      select: { id: true, isPublished: true }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Product update not found' },
        { status: 404 }
      )
    }

    // Validate tag if provided
    if (body.tag) {
      const validTags = ['NEW', 'IMPROVEMENT', 'FIX']
      if (!validTags.includes(body.tag)) {
        return NextResponse.json(
          { error: 'Invalid tag. Must be NEW, IMPROVEMENT, or FIX' },
          { status: 400 }
        )
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    const allowedFields = ['title', 'description', 'image', 'ctaText', 'ctaUrl', 'tag', 'isPublished']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // If being published for the first time, set publishedAt
    if (body.isPublished === true && !existing.isPublished) {
      updateData.publishedAt = new Date()
    }

    const update = await prisma.productUpdate.update({
      where: { id },
      data: updateData,
    })

    // Log activity
    const { ipAddress, userAgent } = getRequestInfo(req)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'product_update_updated',
      targetType: 'product_update',
      targetId: id,
      description: `Actualización de producto modificada`,
      metadata: { updatedFields: Object.keys(updateData) },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ update })
  } catch (error) {
    console.error('Error updating product update:', error)
    return NextResponse.json(
      { error: 'Error al actualizar' },
      { status: 500 }
    )
  }
}

// DELETE - Delete product update
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminAuth(req)
    if (authResult instanceof Response) return authResult

    const { id } = await params

    // Verify it exists
    const existing = await prisma.productUpdate.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Product update not found' },
        { status: 404 }
      )
    }

    // Delete associated reads first (cascade should handle this, but be explicit)
    await prisma.productUpdate.delete({
      where: { id },
    })

    // Log activity
    const { ipAddress, userAgent } = getRequestInfo(req)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'product_update_deleted',
      targetType: 'product_update',
      targetId: id,
      description: `Actualización de producto eliminada`,
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product update:', error)
    return NextResponse.json(
      { error: 'Error al eliminar' },
      { status: 500 }
    )
  }
}
