import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'
import { generateSlug } from '../../../src/lib/slug-utils'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting bulk fix for all properties...')
    
    // Get all properties
    const allProperties = await prisma.property.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        isPublished: true,
        hostId: true,
        _count: {
          select: {
            zones: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`Found ${allProperties.length} total properties`)
    
    const issues = {
      missingSlug: [] as any[],
      unpublishedZones: [] as any[],
      fixed: {
        slugs: [] as any[],
        zones: [] as any[]
      }
    }
    
    // Check each property
    for (const property of allProperties) {
      // 1. Check for missing slug
      if (!property.slug && property.isPublished) {
        issues.missingSlug.push({
          id: property.id,
          name: property.name
        })
        
        // Generate and save slug
        const baseSlug = generateSlug(property.name)
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
          if (slugSuffix > 100) break
        }
        
        // Update property with slug
        await prisma.property.update({
          where: { id: property.id },
          data: { slug: uniqueSlug }
        })
        
        issues.fixed.slugs.push({
          id: property.id,
          name: property.name,
          newSlug: uniqueSlug,
          newUrl: `https://www.itineramio.com/guide/${uniqueSlug}`
        })
        
        console.log(`✅ Fixed slug for: ${property.name} -> ${uniqueSlug}`)
      }
      
      // 2. Check for unpublished zones
      if (property.isPublished && property._count.zones > 0) {
        const unpublishedZones = await prisma.zone.count({
          where: {
            propertyId: property.id,
            OR: [
              { status: 'DRAFT' },
              { isPublished: false }
            ]
          }
        })
        
        if (unpublishedZones > 0) {
          issues.unpublishedZones.push({
            id: property.id,
            name: property.name,
            unpublishedCount: unpublishedZones,
            totalZones: property._count.zones
          })
          
          // Publish all zones
          const updateResult = await prisma.zone.updateMany({
            where: {
              propertyId: property.id,
              OR: [
                { status: 'DRAFT' },
                { isPublished: false }
              ]
            },
            data: {
              status: 'ACTIVE',
              isPublished: true,
              publishedAt: new Date()
            }
          })
          
          issues.fixed.zones.push({
            id: property.id,
            name: property.name,
            zonesPublished: updateResult.count
          })
          
          console.log(`✅ Published ${updateResult.count} zones for: ${property.name}`)
        }
      }
    }
    
    // Summary
    const summary = {
      totalProperties: allProperties.length,
      propertiesWithMissingSlug: issues.missingSlug.length,
      propertiesWithUnpublishedZones: issues.unpublishedZones.length,
      slugsFixed: issues.fixed.slugs.length,
      propertiesWithZonesFixed: issues.fixed.zones.length,
      totalZonesPublished: issues.fixed.zones.reduce((sum, p) => sum + p.zonesPublished, 0)
    }
    
    console.log('🎉 Bulk fix completed!')
    console.log('Summary:', summary)
    
    return NextResponse.json({
      success: true,
      message: 'Bulk fix completed successfully',
      summary,
      details: {
        missingSlugProperties: issues.missingSlug,
        unpublishedZonesProperties: issues.unpublishedZones,
        fixed: issues.fixed
      }
    })
    
  } catch (error) {
    console.error('💥 Bulk fix error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}