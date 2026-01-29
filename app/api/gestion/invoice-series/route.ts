import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { SeriesType } from '@prisma/client'
import {
  previewNextNumber,
  canDeleteSeries,
  canEditSeries
} from '@/lib/invoice-numbering'

/**
 * GET /api/gestion/invoice-series
 * List all invoice series for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Get user's invoice config with series
    const config = await prisma.userInvoiceConfig.findUnique({
      where: { userId },
      include: {
        invoiceSeries: {
          orderBy: [
            { type: 'asc' },
            { isDefault: 'desc' },
            { year: 'desc' },
            { name: 'asc' }
          ]
        }
      }
    })

    if (!config) {
      return NextResponse.json({ series: [] })
    }

    // Add next number preview to each series
    const seriesWithPreview = await Promise.all(
      config.invoiceSeries.map(async (s) => {
        const nextNumber = await previewNextNumber(s.id)
        const editable = await canEditSeries(s.id)
        return {
          id: s.id,
          name: s.name,
          prefix: s.prefix,
          year: s.year,
          type: s.type,
          currentNumber: s.currentNumber,
          resetYearly: s.resetYearly,
          isDefault: s.isDefault,
          isActive: s.isActive,
          nextNumber,
          editable
        }
      })
    )

    return NextResponse.json({ series: seriesWithPreview })
  } catch (error) {
    console.error('Error fetching invoice series:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/gestion/invoice-series
 * Create a new invoice series
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const { name, prefix, type, resetYearly, isDefault } = body

    // Validate required fields
    if (!name || !prefix) {
      return NextResponse.json(
        { error: 'Nombre y prefijo son obligatorios' },
        { status: 400 }
      )
    }

    // Validate prefix format (letters only, max 3 chars)
    if (!/^[A-Za-z]{1,3}$/.test(prefix)) {
      return NextResponse.json(
        { error: 'El prefijo debe ser de 1 a 3 letras' },
        { status: 400 }
      )
    }

    // Validate type
    const seriesType: SeriesType = type === 'RECTIFYING' ? 'RECTIFYING' : 'STANDARD'

    // Get or create invoice config
    let config = await prisma.userInvoiceConfig.findUnique({
      where: { userId }
    })

    if (!config) {
      return NextResponse.json(
        { error: 'Configure su perfil de gestor primero' },
        { status: 400 }
      )
    }

    const currentYear = new Date().getFullYear()

    // Check for duplicate prefix+year
    const existing = await prisma.invoiceSeries.findFirst({
      where: {
        invoiceConfigId: config.id,
        prefix: prefix.toUpperCase(),
        year: currentYear
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: `Ya existe una serie con prefijo ${prefix.toUpperCase()} para el año ${currentYear}` },
        { status: 400 }
      )
    }

    // If this will be default, unset other defaults of same type
    if (isDefault) {
      await prisma.invoiceSeries.updateMany({
        where: {
          invoiceConfigId: config.id,
          type: seriesType,
          isDefault: true
        },
        data: { isDefault: false }
      })
    }

    // Create the series
    const series = await prisma.invoiceSeries.create({
      data: {
        invoiceConfigId: config.id,
        name,
        prefix: prefix.toUpperCase(),
        year: currentYear,
        type: seriesType,
        currentNumber: 0,
        resetYearly: resetYearly !== false,
        lastResetYear: currentYear,
        isDefault: isDefault === true,
        isActive: true
      }
    })

    return NextResponse.json({
      series: {
        id: series.id,
        name: series.name,
        prefix: series.prefix,
        year: series.year,
        type: series.type,
        currentNumber: series.currentNumber,
        resetYearly: series.resetYearly,
        isDefault: series.isDefault,
        isActive: series.isActive,
        nextNumber: await previewNextNumber(series.id),
        editable: true
      }
    })
  } catch (error) {
    console.error('Error creating invoice series:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/gestion/invoice-series
 * Update an invoice series
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const { id, name, isDefault, isActive, currentNumber } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID de serie requerido' },
        { status: 400 }
      )
    }

    // Verify ownership
    const existing = await prisma.invoiceSeries.findFirst({
      where: {
        id,
        invoiceConfig: { userId }
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Serie no encontrada' },
        { status: 404 }
      )
    }

    // Check if editable (only if changing critical fields)
    const editable = await canEditSeries(id)

    // Build update data
    const updateData: any = {}

    if (name !== undefined) {
      updateData.name = name
    }

    // Handle currentNumber update
    if (currentNumber !== undefined) {
      const newNumber = parseInt(currentNumber)
      if (isNaN(newNumber) || newNumber < 0) {
        return NextResponse.json(
          { error: 'El número debe ser un valor válido mayor o igual a 0' },
          { status: 400 }
        )
      }

      // Get the maximum number already issued in this series
      const maxIssued = await prisma.clientInvoice.findFirst({
        where: {
          seriesId: id,
          number: { not: null },
          status: { not: 'DRAFT' }
        },
        orderBy: { number: 'desc' },
        select: { number: true }
      })

      const minAllowed = maxIssued?.number || 0
      if (newNumber < minAllowed) {
        return NextResponse.json(
          { error: `El número no puede ser menor que ${minAllowed} (última factura emitida)` },
          { status: 400 }
        )
      }

      updateData.currentNumber = newNumber
    }

    if (isActive !== undefined) {
      // Can only deactivate if editable or has no issued invoices
      if (!isActive && !editable) {
        return NextResponse.json(
          { error: 'No se puede desactivar una serie con facturas emitidas' },
          { status: 400 }
        )
      }
      updateData.isActive = isActive
    }

    if (isDefault !== undefined) {
      // If setting as default, unset other defaults of same type
      if (isDefault) {
        await prisma.invoiceSeries.updateMany({
          where: {
            invoiceConfig: { userId },
            type: existing.type,
            isDefault: true,
            id: { not: id }
          },
          data: { isDefault: false }
        })
      }
      updateData.isDefault = isDefault
    }

    const series = await prisma.invoiceSeries.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      series: {
        id: series.id,
        name: series.name,
        prefix: series.prefix,
        year: series.year,
        type: series.type,
        currentNumber: series.currentNumber,
        resetYearly: series.resetYearly,
        isDefault: series.isDefault,
        isActive: series.isActive,
        nextNumber: await previewNextNumber(series.id),
        editable: await canEditSeries(series.id)
      }
    })
  } catch (error) {
    console.error('Error updating invoice series:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/gestion/invoice-series
 * Delete an invoice series (only if no invoices issued)
 */
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID de serie requerido' },
        { status: 400 }
      )
    }

    // Verify ownership
    const existing = await prisma.invoiceSeries.findFirst({
      where: {
        id,
        invoiceConfig: { userId }
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Serie no encontrada' },
        { status: 404 }
      )
    }

    // Check if can be deleted
    const deletable = await canDeleteSeries(id)
    if (!deletable) {
      return NextResponse.json(
        { error: 'No se puede eliminar una serie con facturas emitidas' },
        { status: 400 }
      )
    }

    // Delete all draft invoices in this series first
    await prisma.clientInvoice.deleteMany({
      where: {
        seriesId: id,
        status: 'DRAFT'
      }
    })

    // Delete the series
    await prisma.invoiceSeries.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invoice series:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
