import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ zoneId: string }> }
) {
  try {
    const { zoneId } = await params
    
    // Find zone by ID only (no property filter)
    const zone = await prisma.zone.findUnique({
      where: { id: zoneId },
      include: {
        steps: true,
        property: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    if (!zone) {
      return NextResponse.json({
        success: false,
        error: 'Zone not found with this ID',
        zoneId
      })
    }
    
    // Test the actual query that the page uses
    const pageQuery = await prisma.zone.findFirst({
      where: {
        id: zoneId,
        propertyId: zone.propertyId // Use the real property ID
      },
      include: {
        steps: {
          orderBy: {
            order: 'asc'
          }
        },
        property: {
          select: {
            name: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      zone: {
        id: zone.id,
        name: zone.name,
        propertyId: zone.propertyId,
        propertyName: zone.property?.name,
        stepsCount: zone.steps.length,
        correctUrl: `/properties/${zone.propertyId}/zones/${zone.id}`
      },
      pageQueryWorks: !!pageQuery,
      pageQueryResult: pageQuery ? 'Found' : 'Not found'
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}