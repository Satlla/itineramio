import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const name = searchParams.get('name')
    
    console.log('🔍 Property Debug - Searching for property...', { id, name })
    
    let property = null
    
    if (id) {
      // Search by ID
      property = await prisma.property.findUnique({
        where: { id },
        include: {
          analytics: true,
          zones: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        }
      })
    }
    
    // If not found by ID, search by name pattern
    if (!property && name) {
      const properties = await prisma.property.findMany({
        where: {
          name: {
            contains: name,
            mode: 'insensitive'
          }
        },
        include: {
          analytics: true,
          zones: {
            select: {
              id: true,
              name: true,
              status: true
            }
          }
        },
        take: 5
      })
      
      if (properties.length > 0) {
        property = properties[0] // Take first match
      }
    }
    
    // If still not found, get all properties for debugging
    if (!property) {
      const allProperties = await prisma.property.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          isPublished: true
        },
        take: 10,
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      return NextResponse.json({
        success: false,
        message: 'Property not found',
        debug: {
          searchedId: id,
          searchedName: name,
          recentProperties: allProperties
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      property: {
        id: property.id,
        name: property.name,
        slug: property.slug,
        status: property.status,
        isPublished: property.isPublished,
        zonesCount: property.zones.length,
        hasAnalytics: !!property.analytics
      }
    })
    
  } catch (error) {
    console.error('💥 Property debug error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}