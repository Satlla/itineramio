import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const propertyId = url.searchParams.get('id')
    
    if (!propertyId) {
      return NextResponse.json({
        error: 'Property ID required as ?id=prop-xxx'
      }, { status: 400 })
    }
    
    console.log('🔍 DEBUG DELETE - Checking property:', propertyId)
    
    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        name: true,
        hostId: true,
        _count: {
          select: {
            zones: true,
            reviews: true,
            propertyRatings: true,
            propertyViews: true,
            trackingEvents: true,
            announcements: true
          }
        }
      }
    })
    
    if (!property) {
      return NextResponse.json({
        error: 'Property not found',
        propertyId
      }, { status: 404 })
    }
    
    // Check what's preventing deletion
    const blockingData = {
      propertyId,
      propertyName: property.name,
      hostId: property.hostId,
      relatedData: property._count,
      canDelete: Object.values(property._count).every(count => count === 0)
    }
    
    // Try to identify specific blocking tables
    const blockingTables = []
    
    // Check zones with more detail
    if (property._count.zones > 0) {
      const zones = await prisma.zone.findMany({
        where: { propertyId },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              steps: true,
              comments: true,
              ratings: true,
              errorReports: true
            }
          }
        }
      })
      blockingTables.push({
        table: 'zones',
        count: property._count.zones,
        details: zones
      })
    }
    
    // Check other blocking data
    const checks = [
      { table: 'reviews', count: property._count.reviews },
      { table: 'property_ratings', count: property._count.propertyRatings },
      { table: 'property_views', count: property._count.propertyViews },
      { table: 'tracking_events', count: property._count.trackingEvents },
      { table: 'announcements', count: property._count.announcements }
    ]
    
    for (const check of checks) {
      if (check.count > 0) {
        blockingTables.push(check)
      }
    }
    
    return NextResponse.json({
      success: true,
      propertyExists: true,
      blockingData,
      blockingTables,
      recommendation: blockingTables.length === 0 
        ? 'Property can be deleted safely' 
        : 'Delete related data first or use nuclear delete endpoint'
    })
    
  } catch (error) {
    console.error('Debug delete error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}