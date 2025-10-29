import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const propertySets = await prisma.propertySet.findMany({
      include: {
        host: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        properties: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Last 10 property sets
    })
    
    return NextResponse.json({
      success: true,
      data: propertySets.map(ps => ({
        id: ps.id,
        name: ps.name,
        type: ps.type,
        status: ps.status,
        createdAt: ps.createdAt,
        hostId: ps.hostId,
        hostEmail: ps.host?.email,
        hostName: ps.host?.name,
        propertiesCount: ps.properties.length
      }))
    })
    
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}