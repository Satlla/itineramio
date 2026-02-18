import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAuth } from '../../../../src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const properties = await prisma.property.findMany({
      where: {
        hostId: userId,
        deletedAt: { not: null }
      },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        type: true,
        profileImage: true,
        deletedAt: true,
        _count: {
          select: {
            zones: true
          }
        }
      },
      orderBy: {
        deletedAt: 'desc'
      }
    })

    const data = properties.map(p => ({
      id: p.id,
      name: p.name,
      city: p.city,
      state: p.state,
      type: p.type,
      profileImage: p.profileImage,
      deletedAt: p.deletedAt,
      zonesCount: p._count.zones
    }))

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Error fetching trash:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener la papelera'
    }, { status: 500 })
  }
}
