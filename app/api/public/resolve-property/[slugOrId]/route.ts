import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { createPropertySlug } from '../../../../../src/lib/slugs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slugOrId: string }> }
) {
  try {
    const { slugOrId } = await params
    
    // First try direct ID lookup (published OR demo preview not expired)
    let property = await prisma.property.findFirst({
      where: {
        id: slugOrId,
        deletedAt: null,
        OR: [
          { isPublished: true },
          { isDemoPreview: true, demoExpiresAt: { gt: new Date() } },
        ],
      },
      select: {
        id: true,
        name: true,
        city: true
      }
    })
    
    if (property) {
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
        deletedAt: null,
        OR: [
          { isPublished: true },
          { isDemoPreview: true, demoExpiresAt: { gt: new Date() } },
        ],
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
        return NextResponse.json({
          success: true,
          data: { 
            id: prop.id,
            resolvedBy: 'slug'
          }
        })
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Propiedad no encontrada'
    }, { status: 404 })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Error al resolver la propiedad'
    }, { status: 500 })
  }
}