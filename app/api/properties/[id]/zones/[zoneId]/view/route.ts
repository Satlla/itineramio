import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../../src/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, zoneId: string }> }
) {
  try {
    const { id: propertyId, zoneId } = await params

    console.log('📊 Zone view tracking:', { propertyId, zoneId })

    const body = await request.json()

    // Get visitor info
    const userAgent = request.headers.get('user-agent') || ''
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               '127.0.0.1'
    const visitorIp = ip.split(',')[0].trim()

    // Extract metadata
    const {
      referrer = null,
      language = 'es',
      timezone = 'UTC',
      screenWidth = null,
      screenHeight = null,
      timeSpent = 0
    } = body

    // Detect if this is a host view (from dashboard)
    const dashboardPatterns = ['/properties/', '/dashboard', '/zones/', '/admin']
    const isHostView = referrer ? dashboardPatterns.some(pattern => referrer.includes(pattern)) : false

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

    if (!zone || !zone.property) {
      console.error('Zone not found:', { propertyId, zoneId })
      return NextResponse.json({
        success: false,
        error: 'Zona no encontrada'
      }, { status: 404 })
    }

    // Check if this IP has viewed this zone before
    const existingView = await prisma.zoneView.findFirst({
      where: {
        zoneId,
        visitorIp
      }
    })

    const isUniqueVisitor = !existingView

    // Create zone view record
    await prisma.zoneView.create({
      data: {
        zoneId,
        propertyId,
        hostId: zone.property.hostId,
        visitorIp,
        userAgent,
        referrer,
        language,
        timezone,
        screenWidth,
        screenHeight,
        timeSpent,
        isHostView,
        viewedAt: new Date()
      }
    })

    // Update zone analytics
    const zoneUpdateData: any = {
      totalViews: { increment: 1 },
      totalTimeSpent: { increment: timeSpent },
      lastViewedAt: new Date(),
      lastCalculatedAt: new Date()
    }

    if (isUniqueVisitor) {
      zoneUpdateData.uniqueVisitors = { increment: 1 }
    }

    await prisma.zoneAnalytics.upsert({
      where: { zoneId },
      update: zoneUpdateData,
      create: {
        zoneId,
        totalViews: 1,
        uniqueVisitors: 1,
        totalTimeSpent: timeSpent,
        lastViewedAt: new Date(),
        lastCalculatedAt: new Date()
      }
    })

    // Update zone viewCount
    await prisma.zone.update({
      where: { id: zoneId },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date()
      }
    })

    // Also update property analytics
    await prisma.propertyAnalytics.upsert({
      where: { propertyId },
      update: {
        zoneViews: { increment: 1 },
        lastViewedAt: new Date(),
        lastCalculatedAt: new Date()
      },
      create: {
        propertyId,
        zoneViews: 1,
        lastViewedAt: new Date(),
        lastCalculatedAt: new Date()
      }
    })

    console.log('✅ Zone view tracked successfully:', { zoneId, propertyId, isUniqueVisitor })

    return NextResponse.json({
      success: true,
      message: 'Vista de zona registrada correctamente',
      isUniqueVisitor
    })

  } catch (error) {
    console.error('❌ Error registrando vista de zona:', error)

    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}