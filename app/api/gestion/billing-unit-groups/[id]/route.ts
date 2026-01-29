import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/billing-unit-groups/[id]
 * Obtiene un conjunto específico con todos sus apartamentos
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

    const group = await prisma.billingUnitGroup.findFirst({
      where: { id, userId },
      include: {
        owner: true,
        billingUnits: {
          include: {
            _count: {
              select: { reservations: true }
            }
          }
        },
        _count: {
          select: {
            invoices: true
          }
        }
      }
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Conjunto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      group
    })
  } catch (error) {
    console.error('Error fetching billing unit group:', error)
    return NextResponse.json(
      { error: 'Error al obtener el conjunto' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/gestion/billing-unit-groups/[id]
 * Actualiza un conjunto
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
    const existing = await prisma.billingUnitGroup.findFirst({
      where: { id, userId }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Conjunto no encontrado' },
        { status: 404 }
      )
    }

    // Si se cambia el propietario, verificar que existe
    if (body.ownerId && body.ownerId !== existing.ownerId) {
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

    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl || null
    if (body.ownerId !== undefined) updateData.ownerId = body.ownerId
    if (body.incomeReceiver !== undefined) updateData.incomeReceiver = body.incomeReceiver
    if (body.commissionType !== undefined) updateData.commissionType = body.commissionType
    if (body.commissionValue !== undefined) updateData.commissionValue = body.commissionValue
    if (body.commissionVat !== undefined) updateData.commissionVat = body.commissionVat
    if (body.cleaningType !== undefined) updateData.cleaningType = body.cleaningType
    if (body.cleaningValue !== undefined) updateData.cleaningValue = body.cleaningValue
    if (body.cleaningVatIncluded !== undefined) updateData.cleaningVatIncluded = body.cleaningVatIncluded
    if (body.cleaningFeeRecipient !== undefined) updateData.cleaningFeeRecipient = body.cleaningFeeRecipient
    if (body.cleaningFeeSplitPct !== undefined) updateData.cleaningFeeSplitPct = body.cleaningFeeSplitPct
    if (body.monthlyFee !== undefined) updateData.monthlyFee = body.monthlyFee
    if (body.monthlyFeeVat !== undefined) updateData.monthlyFeeVat = body.monthlyFeeVat
    if (body.monthlyFeeConcept !== undefined) updateData.monthlyFeeConcept = body.monthlyFeeConcept
    if (body.defaultVatRate !== undefined) updateData.defaultVatRate = body.defaultVatRate
    if (body.defaultRetentionRate !== undefined) updateData.defaultRetentionRate = body.defaultRetentionRate
    if (body.invoiceDetailLevel !== undefined) updateData.invoiceDetailLevel = body.invoiceDetailLevel
    if (body.singleConceptText !== undefined) updateData.singleConceptText = body.singleConceptText
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const updated = await prisma.billingUnitGroup.update({
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
        },
        billingUnits: {
          select: { id: true, name: true }
        }
      }
    })

    // Si se especifican apartamentos a añadir/quitar
    if (body.addBillingUnitIds && body.addBillingUnitIds.length > 0) {
      await prisma.billingUnit.updateMany({
        where: {
          id: { in: body.addBillingUnitIds },
          userId
        },
        data: {
          groupId: id,
          ownerId: null
        }
      })
    }

    if (body.removeBillingUnitIds && body.removeBillingUnitIds.length > 0) {
      await prisma.billingUnit.updateMany({
        where: {
          id: { in: body.removeBillingUnitIds },
          userId
        },
        data: {
          groupId: null
        }
      })
    }

    return NextResponse.json({
      success: true,
      group: {
        id: updated.id,
        name: updated.name,
        imageUrl: updated.imageUrl,
        ownerId: updated.ownerId,
        owner: updated.owner ? {
          id: updated.owner.id,
          name: updated.owner.type === 'EMPRESA'
            ? updated.owner.companyName
            : `${updated.owner.firstName} ${updated.owner.lastName}`.trim()
        } : null,
        billingUnits: updated.billingUnits
      }
    })
  } catch (error) {
    console.error('Error updating billing unit group:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el conjunto' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/gestion/billing-unit-groups/[id]
 * Elimina un conjunto (los apartamentos quedan como independientes)
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

    // Verificar propiedad y estado
    const existing = await prisma.billingUnitGroup.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: {
            invoices: true,
            billingUnits: true
          }
        }
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Conjunto no encontrado' },
        { status: 404 }
      )
    }

    // No permitir eliminar si tiene facturas
    if (existing._count.invoices > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar: tiene facturas asociadas' },
        { status: 400 }
      )
    }

    // Desvincular apartamentos del grupo (quedan como independientes)
    await prisma.billingUnit.updateMany({
      where: { groupId: id },
      data: { groupId: null }
    })

    // Eliminar el grupo
    await prisma.billingUnitGroup.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Conjunto eliminado. Los apartamentos ahora son independientes.'
    })
  } catch (error) {
    console.error('Error deleting billing unit group:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el conjunto' },
      { status: 500 }
    )
  }
}
