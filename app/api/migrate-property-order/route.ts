import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Adding order field to Property table...')
    
    // Add order column to properties table if it doesn't exist
    const addOrderColumn = `
      ALTER TABLE properties 
      ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0
    `
    
    await prisma.$executeRawUnsafe(addOrderColumn)
    console.log('✅ Order column added to properties table')
    
    // Update existing properties in property sets to have sequential order based on creation date
    const propertySets = await prisma.propertySet.findMany({
      include: {
        properties: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })
    
    for (const propertySet of propertySets) {
      if (propertySet.properties.length > 0) {
        console.log(`Setting order for ${propertySet.properties.length} properties in set: ${propertySet.name}`)
        
        for (let i = 0; i < propertySet.properties.length; i++) {
          await prisma.property.update({
            where: { id: propertySet.properties[i].id },
            data: { order: i + 1 }
          })
        }
      }
    }
    
    console.log('✅ Property order migration completed')
    
    return NextResponse.json({
      success: true,
      message: 'Property order field added and initialized successfully'
    })
    
  } catch (error) {
    console.error('💥 Migration error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}