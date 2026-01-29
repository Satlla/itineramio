import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/properties-simple
 * Get a simple list of properties for dropdowns
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Obtener Properties (legacy - módulo Manuales)
    const properties = await prisma.property.findMany({
      where: { hostId: userId },
      select: {
        id: true,
        name: true,
        street: true,
        city: true,
        billingConfig: {
          select: { id: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    const formattedProperties = properties.map(p => ({
      id: p.id,
      name: p.name,
      address: p.street ? `${p.street}, ${p.city}` : p.city,
      hasBillingConfig: !!p.billingConfig,
      billingConfigId: p.billingConfig?.id || null
    }))

    // Obtener BillingUnits (nuevo - módulo Gestión)
    const billingUnits = await prisma.billingUnit.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        name: true,
        city: true,
        imageUrl: true,
        commissionValue: true,
        cleaningValue: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            type: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    const formattedBillingUnits = billingUnits.map(u => ({
      id: u.id,
      name: u.name,
      city: u.city,
      imageUrl: u.imageUrl,
      commissionValue: Number(u.commissionValue),
      cleaningValue: Number(u.cleaningValue),
      ownerName: u.owner
        ? (u.owner.type === 'EMPRESA' ? u.owner.companyName : `${u.owner.firstName} ${u.owner.lastName}`.trim())
        : null
    }))

    return NextResponse.json({
      properties: formattedProperties,
      billingUnits: formattedBillingUnits
    })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
