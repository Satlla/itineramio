import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
    const body = await request.json()

    // Get visitor info
    const userAgent = request.headers.get('user-agent') || ''
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               '127.0.0.1'
    const visitorIp = ip.split(',')[0].trim()

    // Extract referrer and other metadata
    const {
      referrer = null,
      language = 'es',
      timezone = 'UTC',
      screenWidth = null,
      screenHeight = null
    } = body

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, hostId: true }
    })

    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada'
      }, { status: 404 })
    }

    // Check if this IP has visited this property before
    const existingView = await prisma.propertyView.findFirst({
      where: {
        propertyId,
        visitorIp
      }
    })

    const isUniqueVisitor = !existingView

    // Create view record
    await prisma.propertyView.create({
      data: {
        propertyId,
        hostId: property.hostId,
        visitorIp,
        userAgent,
        referrer,
        language,
        timezone,
        screenWidth,
        screenHeight,
        viewedAt: new Date()
      }
    })

    // Update property analytics
    const updateData: any = {
      totalViews: { increment: 1 },
      lastViewedAt: new Date(),
      lastCalculatedAt: new Date()
    }

    if (isUniqueVisitor) {
      updateData.uniqueVisitors = { increment: 1 }
    }

    await prisma.propertyAnalytics.upsert({
      where: { propertyId },
      update: updateData,
      create: {
        propertyId,
        totalViews: 1,
        uniqueVisitors: 1,
        lastViewedAt: new Date(),
        lastCalculatedAt: new Date()
      }
    })

    // Update daily stats (async, don't wait)
    updateDailyStats(propertyId, isUniqueVisitor).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Vista registrada correctamente',
      isUniqueVisitor
    })

  } catch (error) {
    console.error('Error registrando vista de propiedad:', error)

    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// Helper function to update daily stats
async function updateDailyStats(propertyId: string, isUniqueVisitor: boolean) {
  try {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    const updateData: any = {
      views: { increment: 1 },
      updatedAt: new Date()
    }

    if (isUniqueVisitor) {
      updateData.uniqueVisitors = { increment: 1 }
    }

    await prisma.dailyStats.upsert({
      where: {
        propertyId_date: {
          propertyId,
          date: today
        }
      },
      create: {
        propertyId,
        date: today,
        views: 1,
        uniqueVisitors: isUniqueVisitor ? 1 : 0,
        whatsappClicks: 0,
        avgSessionDuration: 0,
        errorReports: 0,
        newComments: 0
      },
      update: updateData
    })
  } catch (error) {
    console.error('Error updating daily stats:', error)
  }
}