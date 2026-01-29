import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import type { ColumnMapping, ImportConfig } from '@/types/import'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/gestion/import-templates/[id]
 * Get a specific import template
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    const { id } = await params

    const template = await prisma.importTemplate.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Plantilla no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      template: {
        id: template.id,
        name: template.name,
        mapping: {
          guestName: template.guestNameColumn,
          checkIn: template.checkInColumn,
          checkOut: template.checkOutColumn,
          amount: template.amountColumn,
          confirmationCode: template.confirmationCodeColumn ?? undefined,
          nights: template.nightsColumn ?? undefined,
          cleaningFee: template.cleaningFeeColumn ?? undefined,
          commission: template.commissionColumn ?? undefined,
          status: template.statusColumn ?? undefined,
        } as ColumnMapping,
        config: {
          dateFormat: template.dateFormat,
          numberFormat: template.numberFormat,
          amountType: template.amountType,
          platform: template.platform,
        } as ImportConfig,
        originalHeaders: template.originalHeaders,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
      }
    })
  } catch (error) {
    console.error('Error fetching import template:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/gestion/import-templates/[id]
 * Update an import template
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    const { id } = await params

    // Verify template exists and belongs to user
    const existing = await prisma.importTemplate.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Plantilla no encontrada' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, mapping, config, originalHeaders } = body as {
      name?: string
      mapping?: ColumnMapping
      config?: ImportConfig
      originalHeaders?: string[]
    }

    // Check for duplicate name if changing it
    if (name && name !== existing.name) {
      const duplicate = await prisma.importTemplate.findFirst({
        where: {
          userId,
          name,
          id: { not: id }
        }
      })

      if (duplicate) {
        return NextResponse.json(
          { error: 'Ya existe una plantilla con ese nombre' },
          { status: 409 }
        )
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (name) updateData.name = name

    if (mapping) {
      if (mapping.guestName !== undefined) updateData.guestNameColumn = mapping.guestName
      if (mapping.checkIn !== undefined) updateData.checkInColumn = mapping.checkIn
      if (mapping.checkOut !== undefined) updateData.checkOutColumn = mapping.checkOut
      if (mapping.amount !== undefined) updateData.amountColumn = mapping.amount
      updateData.confirmationCodeColumn = mapping.confirmationCode ?? null
      updateData.nightsColumn = mapping.nights ?? null
      updateData.cleaningFeeColumn = mapping.cleaningFee ?? null
      updateData.commissionColumn = mapping.commission ?? null
      updateData.statusColumn = mapping.status ?? null
    }

    if (config) {
      if (config.dateFormat) updateData.dateFormat = config.dateFormat
      if (config.numberFormat) updateData.numberFormat = config.numberFormat
      if (config.amountType) updateData.amountType = config.amountType
      if (config.platform) updateData.platform = config.platform
    }

    if (originalHeaders !== undefined) {
      updateData.originalHeaders = originalHeaders
    }

    const template = await prisma.importTemplate.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        mapping: {
          guestName: template.guestNameColumn,
          checkIn: template.checkInColumn,
          checkOut: template.checkOutColumn,
          amount: template.amountColumn,
          confirmationCode: template.confirmationCodeColumn ?? undefined,
          nights: template.nightsColumn ?? undefined,
          cleaningFee: template.cleaningFeeColumn ?? undefined,
          commission: template.commissionColumn ?? undefined,
          status: template.statusColumn ?? undefined,
        },
        config: {
          dateFormat: template.dateFormat,
          numberFormat: template.numberFormat,
          amountType: template.amountType,
          platform: template.platform,
        },
        originalHeaders: template.originalHeaders,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
      }
    })
  } catch (error) {
    console.error('Error updating import template:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/gestion/import-templates/[id]
 * Delete an import template
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    const { id } = await params

    // Verify template exists and belongs to user
    const existing = await prisma.importTemplate.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Plantilla no encontrada' },
        { status: 404 }
      )
    }

    await prisma.importTemplate.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Plantilla eliminada'
    })
  } catch (error) {
    console.error('Error deleting import template:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
