import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 URGENT: Checking steps data integrity')
    
    // Check total steps count
    const totalSteps = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM steps
    ` as any[]
    
    console.log('📊 Total steps in database:', totalSteps[0]?.count)
    
    // Check steps per zone for the problematic property
    const testPropertyId = 'cmdcrgua10001jv04cbhb1pyn'
    
    const zones = await prisma.$queryRaw`
      SELECT id, name FROM zones WHERE "propertyId" = ${testPropertyId}
    ` as any[]
    
    console.log('🏠 Zones for test property:', zones.length)
    
    const zoneStepsData = []
    for (const zone of zones) {
      const stepsCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM steps WHERE "zoneId" = ${zone.id}
      ` as any[]
      
      const sampleSteps = await prisma.$queryRaw`
        SELECT id, title, type, "zoneId" FROM steps WHERE "zoneId" = ${zone.id} LIMIT 3
      ` as any[]
      
      zoneStepsData.push({
        zoneName: zone.name,
        zoneId: zone.id,
        stepsCount: Number(stepsCount[0]?.count || 0),
        sampleSteps: sampleSteps
      })
    }
    
    // Check for any recent deletions or modifications
    const recentSteps = await prisma.$queryRaw`
      SELECT id, title, type, "zoneId", "createdAt", "updatedAt"
      FROM steps 
      ORDER BY "updatedAt" DESC 
      LIMIT 10
    ` as any[]
    
    return NextResponse.json({
      success: true,
      data: {
        totalSteps: Number(totalSteps[0]?.count || 0),
        testPropertyZones: zoneStepsData,
        recentSteps: recentSteps,
        message: 'Steps data integrity check completed'
      }
    })
    
  } catch (error) {
    console.error('❌ Error checking steps data:', error)
    return NextResponse.json({
      success: false,
      error: 'Error checking steps data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}