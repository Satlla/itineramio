import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Clean up blob URLs from properties
    const result = await prisma.property.updateMany({
      where: {
        OR: [
          { profileImage: { startsWith: 'blob:' } },
          { hostContactPhoto: { startsWith: 'blob:' } }
        ]
      },
      data: {
        profileImage: null,
        hostContactPhoto: null
      }
    })

    // Clean up blob URLs from property sets
    const resultSets = await prisma.propertySet.updateMany({
      where: {
        OR: [
          { profileImage: { startsWith: 'blob:' } },
          { hostContactPhoto: { startsWith: 'blob:' } }
        ]
      },
      data: {
        profileImage: null,
        hostContactPhoto: null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'URLs blob limpiadas exitosamente',
      propertiesUpdated: result.count,
      propertySetsUpdated: resultSets.count
    })
  } catch (error) {
    console.error('Error cleaning blob URLs:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}