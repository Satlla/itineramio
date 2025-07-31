import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug endpoint called')
    
    // Test database connection
    const userCount = await prisma.user.count()
    console.log('👥 User count:', userCount)
    
    // Test announcement table
    const announcementCount = await prisma.announcement.count()
    console.log('📢 Announcement count:', announcementCount)
    
    // Test if announcements table exists by trying to query it
    const announcements = await prisma.announcement.findMany({
      take: 1
    })
    console.log('📢 Sample announcement:', announcements)
    
    return NextResponse.json({
      success: true,
      data: {
        userCount,
        announcementCount,
        sampleAnnouncement: announcements[0] || null,
        environment: process.env.NODE_ENV,
        databaseUrl: !!process.env.DATABASE_URL,
        jwtSecret: !!process.env.JWT_SECRET
      }
    })
    
  } catch (error) {
    console.error('💥 Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
}