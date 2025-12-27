import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const oldId = searchParams.get('id')
    
    if (!oldId) {
      return NextResponse.json({
        success: false,
        error: 'Property ID is required'
      }, { status: 400 })
    }
    
    console.log('🔄 Redirect - Looking for property slug for ID:', oldId)
    
    // Find the property by ID and get its slug
    const property = await prisma.property.findUnique({
      where: { id: oldId },
      select: {
        id: true,
        name: true,
        slug: true,
        isPublished: true
      }
    })
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Property not found'
      }, { status: 404 })
    }
    
    if (!property.isPublished) {
      return NextResponse.json({
        success: false,
        error: 'Property not published'
      }, { status: 404 })
    }
    
    if (!property.slug) {
      return NextResponse.json({
        success: false,
        error: 'Property has no slug - cannot redirect'
      }, { status: 404 })
    }
    
    const newUrl = `https://www.itineramio.com/guide/${property.slug}`
    
    return NextResponse.json({
      success: true,
      redirect: true,
      newUrl,
      message: `Property "${property.name}" is now available at the new URL`,
      property: {
        id: property.id,
        name: property.name,
        slug: property.slug
      }
    })
    
  } catch (error) {
    console.error('💥 Redirect error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}