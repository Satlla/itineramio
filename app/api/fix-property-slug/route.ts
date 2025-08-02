import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { generateSlug } from '../../../src/lib/slug-utils'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('id')
    
    if (!propertyId) {
      return NextResponse.json({
        success: false,
        error: 'Property ID is required'
      }, { status: 400 })
    }
    
    console.log('🔧 Fixing slug for property:', propertyId)
    
    // Get the property
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        name: true,
        slug: true
      }
    })
    
    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Property not found'
      }, { status: 404 })
    }
    
    if (property.slug) {
      return NextResponse.json({
        success: true,
        message: 'Property already has a slug',
        property: {
          id: property.id,
          name: property.name,
          slug: property.slug
        }
      })
    }
    
    // Generate slug from name
    const baseSlug = generateSlug(property.name)
    console.log('Generated base slug:', baseSlug)
    
    // Check for uniqueness
    let uniqueSlug = baseSlug
    let slugSuffix = 0
    
    while (true) {
      const testSlug = slugSuffix === 0 ? baseSlug : `${baseSlug}-${slugSuffix}`
      
      const existing = await prisma.property.findUnique({
        where: { slug: testSlug },
        select: { id: true }
      })
      
      if (!existing) {
        uniqueSlug = testSlug
        break
      }
      
      slugSuffix++
      if (slugSuffix > 100) {
        throw new Error('Unable to generate unique slug after 100 attempts')
      }
    }
    
    console.log('Final unique slug:', uniqueSlug)
    
    // Update property with slug
    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: { slug: uniqueSlug },
      select: {
        id: true,
        name: true,
        slug: true
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Property slug fixed successfully',
      property: updatedProperty,
      newUrl: `https://www.itineramio.com/guide/${uniqueSlug}`
    })
    
  } catch (error) {
    console.error('💥 Fix slug error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}