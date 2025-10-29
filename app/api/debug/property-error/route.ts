import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../src/lib/prisma'

const JWT_SECRET = 'itineramio-secret-key-2024'

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const userId = decoded.userId
    
    const propertyId = 'cmdsrdyil001jl404b3qvcgxr'
    
    console.log('🔍 Debugging property error:', propertyId, 'for user:', userId)
    
    // Try to fetch property without zones first
    let property = null
    let propertyError = null
    
    try {
      property = await prisma.property.findFirst({
        where: {
          id: {
            startsWith: propertyId
          },
          hostId: userId
        },
        select: {
          id: true,
          name: true,
          hostId: true,
          status: true,
          isPublished: true,
          propertySetId: true
        }
      })
    } catch (e) {
      propertyError = e instanceof Error ? e.message : 'Unknown error'
    }
    
    // Try to fetch zones separately
    let zones = null
    let zonesError = null
    
    if (property) {
      try {
        zones = await prisma.zone.findMany({
          where: {
            propertyId: property.id
          },
          select: {
            id: true,
            name: true,
            isPublished: true
          }
        })
      } catch (e) {
        zonesError = e instanceof Error ? e.message : 'Unknown error'
      }
    }
    
    // Try with orderBy
    let zonesWithOrder = null
    let orderError = null
    
    if (property) {
      try {
        zonesWithOrder = await prisma.zone.findMany({
          where: {
            propertyId: property.id
          },
          orderBy: {
            id: 'asc'
          },
          select: {
            id: true,
            name: true,
            isPublished: true
          }
        })
      } catch (e) {
        orderError = e instanceof Error ? e.message : 'Unknown error'
      }
    }
    
    // Try analytics
    let analytics = null
    let analyticsError = null
    
    if (property) {
      try {
        analytics = await prisma.property.findFirst({
          where: {
            id: property.id
          },
          include: {
            analytics: true
          }
        })
      } catch (e) {
        analyticsError = e instanceof Error ? e.message : 'Unknown error'
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        searchedId: propertyId,
        currentUserId: userId,
        
        property: property || null,
        propertyError,
        
        zones: zones || null,
        zonesError,
        
        orderError,
        
        analytics: analytics?.analytics || null,
        analyticsError,
        
        // Check database columns
        probableIssue: orderError ? 'zones.order column missing' : zonesError ? 'zones table issue' : analyticsError ? 'analytics issue' : 'unknown'
      }
    })
    
  } catch (error) {
    console.error('Error in debug endpoint:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}