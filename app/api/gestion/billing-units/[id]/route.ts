import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/billing-units/[id]
 * Obtiene una unidad de facturación específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { id } = await params

    const billingUnit = await prisma.billingUnit.findFirst({
      where: { id, userId },
      include: {
        owner: true,
        _count: {
          select: {
            reservations: true,
            expenses: true,
            invoices: true
          }
        }
      }
    })

    if (!billingUnit) {
      return NextResponse.json(
        { error: 'Unidad de facturación no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      billingUnit
    })
  } catch (error) {
    console.error('Error fetching billing unit:', error)
    return NextResponse.json(
      { error: 'Error al obtener la unidad de facturación' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/gestion/billing-units/[id]
 * Actualiza una unidad de facturación
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { id } = await params
    const body = await request.json()

    // Verificar propiedad
    const existing = await prisma.billingUnit.findFirst({
      where: { id, userId }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Unidad de facturación no encontrada' },
        { status: 404 }
      )
    }

    // Si se especifica un propietario, verificar que pertenece al usuario
    if (body.ownerId !== undefined && body.ownerId !== null) {
      const owner = await prisma.propertyOwner.findFirst({
        where: { id: body.ownerId, userId }
      })
      if (!owner) {
        return NextResponse.json(
          { error: 'Propietario no encontrado' },
          { status: 404 }
        )
      }
    }

    // Construir datos de actualización
    const updateData: Record<string, unknown> = {}

    // Campos básicos
    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.city !== undefined) updateData.city = body.city?.trim() || null
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl || null
    if (body.ownerId !== undefined) updateData.ownerId = body.ownerId || null

    // Matching
    if (body.airbnbNames !== undefined) updateData.airbnbNames = body.airbnbNames
    if (body.bookingNames !== undefined) updateData.bookingNames = body.bookingNames
    if (body.vrboNames !== undefined) updateData.vrboNames = body.vrboNames

    // Configuración de ingresos
    if (body.incomeReceiver !== undefined) updateData.incomeReceiver = body.incomeReceiver

    // Comisión
    if (body.commissionType !== undefined) updateData.commissionType = body.commissionType
    if (body.commissionValue !== undefined) updateData.commissionValue = body.commissionValue
    if (body.commissionVat !== undefined) updateData.commissionVat = body.commissionVat

    // Limpieza
    if (body.cleaningType !== undefined) updateData.cleaningType = body.cleaningType
    if (body.cleaningValue !== undefined) updateData.cleaningValue = body.cleaningValue
    if (body.cleaningVatIncluded !== undefined) updateData.cleaningVatIncluded = body.cleaningVatIncluded
    if (body.cleaningFeeRecipient !== undefined) updateData.cleaningFeeRecipient = body.cleaningFeeRecipient
    if (body.cleaningFeeSplitPct !== undefined) updateData.cleaningFeeSplitPct = body.cleaningFeeSplitPct

    // Cuota mensual
    if (body.monthlyFee !== undefined) updateData.monthlyFee = body.monthlyFee
    if (body.monthlyFeeVat !== undefined) updateData.monthlyFeeVat = body.monthlyFeeVat
    if (body.monthlyFeeConcept !== undefined) updateData.monthlyFeeConcept = body.monthlyFeeConcept

    // Fiscalidad
    if (body.defaultVatRate !== undefined) updateData.defaultVatRate = body.defaultVatRate
    if (body.defaultRetentionRate !== undefined) updateData.defaultRetentionRate = body.defaultRetentionRate

    // Preferencias de factura
    if (body.invoiceDetailLevel !== undefined) updateData.invoiceDetailLevel = body.invoiceDetailLevel
    if (body.singleConceptText !== undefined) updateData.singleConceptText = body.singleConceptText

    // iCal
    if (body.icalUrl !== undefined) updateData.icalUrl = body.icalUrl

    // Estado
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const updated = await prisma.billingUnit.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            type: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      billingUnit: {
        id: updated.id,
        name: updated.name,
        city: updated.city,
        imageUrl: updated.imageUrl,
        ownerId: updated.ownerId,
        owner: updated.owner ? {
          id: updated.owner.id,
          name: updated.owner.type === 'EMPRESA'
            ? updated.owner.companyName
            : `${updated.owner.firstName} ${updated.owner.lastName}`.trim()
        } : null,
        commissionType: updated.commissionType,
        commissionValue: updated.commissionValue,
        cleaningValue: updated.cleaningValue,
        airbnbNames: updated.airbnbNames,
        bookingNames: updated.bookingNames,
        vrboNames: updated.vrboNames,
        isActive: updated.isActive
      }
    })
  } catch (error) {
    console.error('Error updating billing unit:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la unidad de facturación' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/gestion/billing-units/[id]
 * Elimina una unidad de facturación
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { id } = await params

    // Verificar propiedad
    const existing = await prisma.billingUnit.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: {
            reservations: true,
            invoices: true
          }
        }
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Unidad de facturación no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que no tiene datos asociados críticos
    if (existing._count.invoices > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar: tiene facturas asociadas' },
        { status: 400 }
      )
    }

    // Soft delete o hard delete según preferencia
    // Por ahora hacemos soft delete (isActive = false)
    if (existing._count.reservations > 0) {
      // Tiene reservas, solo desactivar
      await prisma.billingUnit.update({
        where: { id },
        data: { isActive: false }
      })

      return NextResponse.json({
        success: true,
        message: 'Unidad desactivada (tiene reservas asociadas)'
      })
    }

    // Sin datos, eliminar completamente
    await prisma.billingUnit.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Unidad eliminada'
    })
  } catch (error) {
    console.error('Error deleting billing unit:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la unidad de facturación' },
      { status: 500 }
    )
  }
}
