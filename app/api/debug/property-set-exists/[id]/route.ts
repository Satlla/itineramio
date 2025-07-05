import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Find property set without any user restrictions to see if it exists at all
    const propertySet = await prisma.propertySet.findFirst({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        properties: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    })
    
    if (!propertySet) {
      return NextResponse.json({
        exists: false,
        message: 'Property set not found with ID: ' + id
      })
    }
    
    return NextResponse.json({
      exists: true,
      propertySet: {
        id: propertySet.id,
        name: propertySet.name,
        description: propertySet.description,
        type: propertySet.type,
        status: propertySet.status,
        createdAt: propertySet.createdAt,
        hostId: propertySet.hostId,
        hostEmail: propertySet.host?.email,
        hostName: propertySet.host?.name,
        propertiesCount: propertySet.properties.length,
        properties: propertySet.properties
      }
    })
    
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}