import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const propertyId = searchParams.get('id')
    
    console.log('🔍 Checking property publication status...')
    
    // 1. Get all properties with their publication status
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        name: true,
        isPublished: true,
        publishedAt: true,
        createdAt: true,
        zones: {
          select: {
            id: true,
            name: true,
            isPublished: true,
            steps: {
              select: {
                id: true,
                isPublished: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // 2. Check specific property if ID provided
    let specificProperty = null
    if (propertyId) {
      specificProperty = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
          zones: {
            include: {
              steps: true
            }
          }
        }
      })
    }
    
    // 3. Analyze the data
    const analysis = {
      totalProperties: properties.length,
      publishedProperties: properties.filter(p => p.isPublished).length,
      unpublishedProperties: properties.filter(p => !p.isPublished).length,
      propertiesWithContent: properties.filter(p => 
        p.zones.some(z => z.steps.length > 0)
      ).length,
      properties: properties.map(p => ({
        id: p.id,
        name: p.name,
        isPublished: p.isPublished,
        publishedAt: p.publishedAt,
        zonesCount: p.zones.length,
        publishedZonesCount: p.zones.filter(z => z.isPublished).length,
        zonesWithSteps: p.zones.filter(z => z.steps.length > 0).length,
        totalSteps: p.zones.reduce((acc, z) => acc + z.steps.length, 0),
        publishedSteps: p.zones.reduce((acc, z) => 
          acc + z.steps.filter(s => s.isPublished).length, 0
        ),
        publicUrl: `https://www.itineramio.com/guide/${p.id}`
      })),
      specificProperty: specificProperty ? {
        id: specificProperty.id,
        name: specificProperty.name,
        isPublished: specificProperty.isPublished,
        publishedAt: specificProperty.publishedAt,
        zones: specificProperty.zones.map(z => ({
          id: z.id,
          name: z.name,
          isPublished: z.isPublished,
          stepsCount: z.steps.length,
          publishedStepsCount: z.steps.filter(s => s.isPublished).length
        }))
      } : null
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      analysis
    })
    
  } catch (error: any) {
    console.error('❌ Error checking property publication:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}