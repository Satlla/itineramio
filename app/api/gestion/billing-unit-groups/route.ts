import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/billing-unit-groups
 * Lista todos los conjuntos de apartamentos del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const groups = await prisma.billingUnitGroup.findMany({
      where: { userId },
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
          select: {
            id: true,
            name: true,
            city: true,
            imageUrl: true
          }
        },
        _count: {
          select: {
            billingUnits: true,
            invoices: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      groups: groups.map(group => ({
        id: group.id,
        name: group.name,
        imageUrl: group.imageUrl,
        ownerId: group.ownerId,
        owner: group.owner ? {
          id: group.owner.id,
          name: group.owner.type === 'EMPRESA'
            ? group.owner.companyName
            : `${group.owner.firstName} ${group.owner.lastName}`.trim()
        } : null,
        billingUnits: group.billingUnits,
        unitsCount: group._count.billingUnits,
        invoicesCount: group._count.invoices,
        commissionType: group.commissionType,
        commissionValue: group.commissionValue,
        cleaningType: group.cleaningType,
        cleaningValue: Number(group.cleaningValue),
        cleaningVatIncluded: group.cleaningVatIncluded,
        cleaningFeeRecipient: group.cleaningFeeRecipient,
        isActive: group.isActive,
        createdAt: group.createdAt
      }))
    })
  } catch (error) {
    console.error('Error fetching billing unit groups:', error)
    return NextResponse.json(
      { error: 'Error al obtener los conjuntos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/gestion/billing-unit-groups
 * Crea un nuevo conjunto de apartamentos
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const {
      name,
      imageUrl,
      ownerId,
      incomeReceiver,
      commissionType,
      commissionValue,
      commissionVat,
      cleaningType,
      cleaningValue,
      cleaningVatIncluded,
      cleaningFeeRecipient,
      cleaningFeeSplitPct,
      monthlyFee,
      monthlyFeeVat,
      monthlyFeeConcept,
      defaultVatRate,
      defaultRetentionRate,
      invoiceDetailLevel,
      singleConceptText,
      // IDs de apartamentos existentes para añadir al grupo
      billingUnitIds
    } = body

    // Validar campos requeridos
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    if (!ownerId) {
      return NextResponse.json(
        { error: 'El propietario es requerido para un conjunto' },
        { status: 400 }
      )
    }

    // Verificar que el propietario pertenece al usuario
    const owner = await prisma.propertyOwner.findFirst({
      where: { id: ownerId, userId }
    })
    if (!owner) {
      return NextResponse.json(
        { error: 'Propietario no encontrado' },
        { status: 404 }
      )
    }

    // Crear el grupo
    const group = await prisma.billingUnitGroup.create({
      data: {
        userId,
        name: name.trim(),
        imageUrl: imageUrl || null,
        ownerId,
        incomeReceiver: incomeReceiver || 'OWNER',
        commissionType: commissionType || 'PERCENTAGE',
        commissionValue: commissionValue ?? 0,
        commissionVat: commissionVat ?? 21,
        cleaningType: cleaningType || 'FIXED_PER_RESERVATION',
        cleaningValue: cleaningValue ?? 0,
        cleaningVatIncluded: cleaningVatIncluded ?? true,
        cleaningFeeRecipient: cleaningFeeRecipient || 'MANAGER',
        cleaningFeeSplitPct: cleaningFeeSplitPct || null,
        monthlyFee: monthlyFee ?? 0,
        monthlyFeeVat: monthlyFeeVat ?? 21,
        monthlyFeeConcept: monthlyFeeConcept || null,
        defaultVatRate: defaultVatRate ?? 21,
        defaultRetentionRate: defaultRetentionRate ?? 0,
        invoiceDetailLevel: invoiceDetailLevel || 'DETAILED',
        singleConceptText: singleConceptText || null
      },
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

    // Si se especificaron apartamentos, asignarlos al grupo
    if (billingUnitIds && billingUnitIds.length > 0) {
      await prisma.billingUnit.updateMany({
        where: {
          id: { in: billingUnitIds },
          userId // Solo actualizar los del usuario
        },
        data: {
          groupId: group.id,
          ownerId: null // El propietario se hereda del grupo
        }
      })
    }

    return NextResponse.json({
      success: true,
      group: {
        id: group.id,
        name: group.name,
        imageUrl: group.imageUrl,
        ownerId: group.ownerId,
        owner: group.owner ? {
          id: group.owner.id,
          name: group.owner.type === 'EMPRESA'
            ? group.owner.companyName
            : `${group.owner.firstName} ${group.owner.lastName}`.trim()
        } : null
      }
    })
  } catch (error) {
    console.error('Error creating billing unit group:', error)
    return NextResponse.json(
      { error: 'Error al crear el conjunto' },
      { status: 500 }
    )
  }
}
