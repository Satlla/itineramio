import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    
    console.log('🔍 Announcements Debug - Checking announcements...', { propertyId })
    
    // Check if announcements table exists and get schema
    const tableCheck = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'announcements' 
      ORDER BY column_name
    `
    
    // Get total count of announcements
    const totalCount = await prisma.announcement.count()
    
    // Get announcements for specific property if provided
    let propertyAnnouncements = []
    if (propertyId) {
      try {
        propertyAnnouncements = await prisma.announcement.findMany({
          where: { propertyId },
          select: {
            id: true,
            title: true,
            isActive: true,
            startDate: true,
            endDate: true,
            priority: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      } catch (announcementError) {
        console.error('Error querying property announcements:', announcementError)
      }
    }
    
    // Get sample announcements
    const sampleAnnouncements = await prisma.announcement.findMany({
      select: {
        id: true,
        propertyId: true,
        title: true,
        isActive: true,
        startDate: true,
        endDate: true
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({
      success: true,
      debug: {
        tableSchema: tableCheck,
        totalCount,
        propertyId,
        propertyAnnouncementsCount: propertyAnnouncements.length,
        propertyAnnouncements: propertyAnnouncements.slice(0, 3),
        sampleAnnouncements
      }
    })
    
  } catch (error) {
    console.error('💥 Announcements debug error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}