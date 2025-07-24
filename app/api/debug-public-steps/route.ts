import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const propertyId = url.searchParams.get('propertyId')
    const zoneId = url.searchParams.get('zoneId')
    
    if (!propertyId || !zoneId) {
      return NextResponse.json({
        error: 'Missing propertyId or zoneId parameters'
      }, { status: 400 })
    }

    console.log('🔧 Debug - propertyId:', propertyId, 'zoneId:', zoneId)
    
    // Check if property exists and is published
    const property = await prisma.property.findFirst({
      where: {
        OR: [
          { id: propertyId },
          { id: { startsWith: propertyId } }
        ]
      }
    })
    
    console.log('🔧 Property found:', !!property, property?.isPublished)
    
    // Check if zone exists
    const zone = await prisma.zone.findFirst({
      where: {
        OR: [
          { id: zoneId },
          { id: { startsWith: zoneId } }
        ],
        propertyId: property?.id
      }
    })
    
    console.log('🔧 Zone found:', !!zone)
    
    // Check steps
    const steps = await prisma.step.findMany({
      where: {
        zoneId: zone?.id
      },
      orderBy: {
        order: 'asc'
      }
    })
    
    console.log('🔧 Steps found:', steps.length)
    console.log('🔧 Steps details:', steps.map(s => ({
      id: s.id,
      type: s.type,
      isPublished: s.isPublished,
      titleEs: (s.title as any)?.es,
      contentEs: (s.content as any)?.es
    })))

    return NextResponse.json({
      success: true,
      property: property ? {
        id: property.id,
        name: property.name,
        isPublished: property.isPublished
      } : null,
      zone: zone ? {
        id: zone.id,
        name: zone.name,
        propertyId: zone.propertyId
      } : null,
      steps: steps.map(step => ({
        id: step.id,
        type: step.type,
        order: step.order,
        isPublished: step.isPublished,
        title: step.title,
        content: step.content,
        titleText: (step.title as any)?.es || '',
        contentText: (step.content as any)?.es || ''
      }))
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}