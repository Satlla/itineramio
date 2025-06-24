import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/public/zones/[zoneCode] - Get zone by unique code for public access
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ zoneCode: string }> }
) {
  try {
    const { zoneCode } = await params

    // Find zone by the access code
    const zone = await prisma.zone.findFirst({
      where: {
        accessCode: zoneCode,
        isPublished: true // Only show published zones
      },
      include: {
        steps: {
          where: {
            isPublished: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        property: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
            isPublished: true,
            hostContactName: true,
            hostContactPhone: true,
            hostContactEmail: true
          }
        }
      }
    })

    if (!zone) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Zona no encontrada o no disponible públicamente' 
        },
        { status: 404 }
      )
    }

    // Check if property is also published
    if (!zone.property?.isPublished) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Esta zona no está disponible públicamente' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: zone
    })

  } catch (error) {
    console.error('Error fetching public zone:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
}