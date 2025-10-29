import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSlugs() {
  console.log('🔍 Checking slugs in database...\n')
  
  try {
    // Check properties
    const properties = await prisma.property.findMany({
      select: { id: true, name: true, slug: true }
    })
    
    console.log('📦 PROPERTIES:')
    properties.forEach(p => {
      const name = typeof p.name === 'string' ? p.name : (p.name as any)?.es || 'No name'
      console.log(`  - ${name}: slug="${p.slug || 'NO SLUG'}"`)
    })
    
    console.log('\n📦 ZONES:')
    // Check zones for each property
    for (const property of properties) {
      const propertyName = typeof property.name === 'string' ? property.name : (property.name as any)?.es || 'No name'
      console.log(`\n  Property: ${propertyName}`)
      
      const zones = await prisma.zone.findMany({
        where: { propertyId: property.id },
        select: { id: true, name: true, slug: true }
      })
      
      zones.forEach(z => {
        const name = typeof z.name === 'string' ? z.name : (z.name as any)?.es || 'No name'
        console.log(`    - ${name}: slug="${z.slug || 'NO SLUG'}"`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSlugs()