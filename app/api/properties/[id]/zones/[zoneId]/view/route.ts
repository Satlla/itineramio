import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../src/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, zoneId: string }> }
) {
  try {
    const { id: propertyId, zoneId } = await params
    const body = await request.json()
    
    // Get visitor info
    const userAgent = request.headers.get('user-agent') || ''
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1'
    
    // Extract metadata
    const { 
      referrer = null, 
      language = 'es',
      timezone = 'UTC',
      screenWidth = null,
      screenHeight = null,
      timeSpent = 0
    } = body

    // Check if zone exists and belongs to property
    const zone = await prisma.zone.findFirst({
      where: { 
        id: zoneId,
        propertyId: propertyId
      },
      include: {
        property: {
          select: { hostId: true }
        }
      }
    })

    if (!zone) {
      return NextResponse.json({
        success: false,
        error: 'Zona no encontrada'
      }, { status: 404 })
    }

    // Create zone view record
    await prisma.zoneView.create({
      data: {
        zoneId,
        propertyId,
        hostId: zone.property.hostId,
        visitorIp: ip,
        userAgent,
        referrer,
        language,
        timezone,
        screenWidth,
        screenHeight,
        timeSpent,
        viewedAt: new Date()
      }
    })

    // Update zone analytics
    await prisma.zoneAnalytics.upsert({
      where: { zoneId },
      update: {
        totalViews: {
          increment: 1
        },
        totalTimeSpent: {
          increment: timeSpent
        },
        lastViewedAt: new Date()
      },
      create: {
        zoneId,
        totalViews: 1,
        totalTimeSpent: timeSpent,
        lastViewedAt: new Date()
      }
    })

    // Also update property analytics
    await prisma.propertyAnalytics.upsert({
      where: { propertyId },
      update: {
        zoneViews: {
          increment: 1
        },
        lastViewedAt: new Date()
      },
      create: {
        propertyId,
        zoneViews: 1,
        lastViewedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Vista de zona registrada correctamente'
    })

  } catch (error) {
    console.error('Error registrando vista de zona:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}