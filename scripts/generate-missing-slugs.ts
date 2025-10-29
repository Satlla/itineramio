import { PrismaClient } from '@prisma/client'
import { generateSlug, generateUniqueSlug } from '../src/lib/slug-utils'

const prisma = new PrismaClient()

// Helper to get text from multilingual JSON
function getText(value: any): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    return value.es || value.en || value.fr || ''
  }
  return ''
}

async function generateMissingSlugs() {
  console.log('🔄 Starting slug generation for existing data...')
  
  try {
    // Generate slugs for properties without them
    const propertiesWithoutSlug = await prisma.property.findMany({
      where: { slug: null },
      select: { id: true, name: true }
    })
    
    console.log(`📦 Found ${propertiesWithoutSlug.length} properties without slugs`)
    
    for (const property of propertiesWithoutSlug) {
      const propertyName = getText(property.name)
      if (!propertyName) continue
      
      const baseSlug = generateSlug(propertyName)
      
      // Get all existing property slugs to ensure uniqueness
      const existingSlugs = await prisma.property.findMany({
        where: { slug: { not: null } },
        select: { slug: true }
      }).then(results => results.map(r => r.slug).filter(Boolean) as string[])
      
      const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs)
      
      await prisma.property.update({
        where: { id: property.id },
        data: { slug: uniqueSlug }
      })
      
      console.log(`✅ Property "${propertyName}" -> slug: "${uniqueSlug}"`)
    }
    
    // Generate slugs for zones without them
    const zonesWithoutSlug = await prisma.zone.findMany({
      where: { slug: null },
      select: { id: true, name: true, propertyId: true }
    })
    
    console.log(`📦 Found ${zonesWithoutSlug.length} zones without slugs`)
    
    // Group zones by property to ensure uniqueness within each property
    const zonesByProperty = zonesWithoutSlug.reduce((acc, zone) => {
      if (!acc[zone.propertyId]) acc[zone.propertyId] = []
      acc[zone.propertyId].push(zone)
      return acc
    }, {} as Record<string, typeof zonesWithoutSlug>)
    
    for (const [propertyId, zones] of Object.entries(zonesByProperty)) {
      // Get existing slugs for this property
      const existingSlugs = await prisma.zone.findMany({
        where: { 
          propertyId,
          slug: { not: null }
        },
        select: { slug: true }
      }).then(results => results.map(r => r.slug).filter(Boolean) as string[])
      
      for (const zone of zones) {
        const zoneName = getText(zone.name)
        if (!zoneName) continue
        
        const baseSlug = generateSlug(zoneName)
        const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs)
        
        await prisma.zone.update({
          where: { id: zone.id },
          data: { slug: uniqueSlug }
        })
        
        // Add to existing slugs for next iteration
        existingSlugs.push(uniqueSlug)
        
        console.log(`✅ Zone "${zoneName}" (Property: ${propertyId}) -> slug: "${uniqueSlug}"`)
      }
    }
    
    console.log('✨ Slug generation completed!')
    
  } catch (error) {
    console.error('❌ Error generating slugs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
generateMissingSlugs()