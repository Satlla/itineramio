import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { createPropertySlug } from '../../../../../src/lib/slugs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slugOrId: string }> }
) {
  try {
    const { slugOrId } = await params
    console.log('🔍 Resolving property:', slugOrId)
    
    // First try direct ID lookup
    let property = await prisma.property.findFirst({
      where: {
        id: slugOrId,
        isPublished: true
      },
      select: {
        id: true,
        name: true,
        city: true
      }
    })
    
    if (property) {
      console.log('🔍 Found by ID:', property.id)
      return NextResponse.json({
        success: true,
        data: { 
          id: property.id,
          resolvedBy: 'id'
        }
      })
    }
    
    // If not found by ID, try to find by slug
    const properties = await prisma.property.findMany({
      where: {
        isPublished: true
      },
      select: {
        id: true,
        name: true,
        city: true
      }
    })

    // Find property with matching slug
    for (const prop of properties) {
      const propertySlug = createPropertySlug(prop)
      if (propertySlug === slugOrId) {
        console.log('🔍 Found by slug:', prop.id, 'slug:', propertySlug)
        return NextResponse.json({
          success: true,
          data: { 
            id: prop.id,
            resolvedBy: 'slug'
          }
        })
      }
    }
    
    console.log('🔍 Property not found by ID or slug')
    return NextResponse.json({
      success: false,
      error: 'Propiedad no encontrada'
    }, { status: 404 })
    
  } catch (error) {
    console.error('Error resolving property:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al resolver la propiedad'
    }, { status: 500 })
  }
}