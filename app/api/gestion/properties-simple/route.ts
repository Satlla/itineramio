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

    return NextResponse.json({ properties: formattedProperties })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
