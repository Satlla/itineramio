import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

// GET /api/public/announcements/[propertyId] - Get active announcements for public view
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params
    console.log('🚀 GET public announcements for property:', propertyId)

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID es requerido' },
        { status: 400 }
      )
    }

    // Get active announcements for the property (max 5)
    let announcements: any[] = []
    
    try {
      announcements = await prisma.announcement.findMany({
        where: {
          propertyId,
          isActive: true,
          OR: [
            { startDate: null },
            { startDate: { lte: new Date() } }
          ],
          AND: [
            {
              OR: [
                { endDate: null },
                { endDate: { gte: new Date() } }
              ]
            }
          ]
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        take: 5 // Limit to maximum 5 announcements
      })
    } catch (dbError) {
      console.error('💥 Database error getting announcements:', dbError)
      // Return empty array if database error
      announcements = []
    }

    console.log('📢 Found active announcements:', announcements.length)

    return NextResponse.json({
      success: true,
      data: announcements
    })

  } catch (error) {
    console.error('💥 Error getting public announcements:', error)
    
    // Return empty announcements array instead of error to prevent frontend crash
    return NextResponse.json({
      success: true,
      data: []
    })
  }
}