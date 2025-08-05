import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../../src/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('💥 NUCLEAR DELETE - Property ID:', id)
    
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    
    // Verify user owns this property first
    const ownerCheck = await prisma.$queryRaw`
      SELECT id FROM properties WHERE id = ${id} AND "hostId" = ${userId}
    ` as any[]
    
    if (ownerCheck.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada o no autorizada'
      }, { status: 404 })
    }
    
    console.log('💥 NUCLEAR DELETE: Confirmed ownership, proceeding with total destruction...')
    
    // NUCLEAR OPTION: Delete everything in one transaction with raw SQL
    await prisma.$transaction(async (tx) => {
      // Delete in reverse dependency order
      console.log('💥 Deleting steps...')
      await tx.$executeRaw`
        DELETE FROM steps WHERE "zoneId" IN (
          SELECT id FROM zones WHERE "propertyId" = ${id}
        )
      `
      
      console.log('💥 Deleting zone comments...')
      await tx.$executeRaw`
        DELETE FROM zone_comments WHERE "zoneId" IN (
          SELECT id FROM zones WHERE "propertyId" = ${id}
        )
      `
      
      console.log('💥 Deleting zone ratings...')
      await tx.$executeRaw`
        DELETE FROM zone_ratings WHERE "zoneId" IN (
          SELECT id FROM zones WHERE "propertyId" = ${id}
        )
      `
      
      console.log('💥 Deleting error reports...')
      await tx.$executeRaw`
        DELETE FROM error_reports WHERE "zoneId" IN (
          SELECT id FROM zones WHERE "propertyId" = ${id}
        )
      `
      
      console.log('💥 Deleting zone analytics...')
      await tx.$executeRaw`
        DELETE FROM zone_analytics WHERE "zoneId" IN (
          SELECT id FROM zones WHERE "propertyId" = ${id}
        )
      `
      
      console.log('💥 Deleting zone views...')
      await tx.$executeRaw`DELETE FROM zone_views WHERE "propertyId" = ${id}`
      
      console.log('💥 Deleting zones...')
      await tx.$executeRaw`DELETE FROM zones WHERE "propertyId" = ${id}`
      
      console.log('💥 Deleting property analytics...')
      await tx.$executeRaw`DELETE FROM property_analytics WHERE "propertyId" = ${id}`
      
      console.log('💥 Deleting property ratings...')
      await tx.$executeRaw`DELETE FROM property_ratings WHERE "propertyId" = ${id}`
      
      console.log('💥 Deleting property views...')
      await tx.$executeRaw`DELETE FROM property_views WHERE "propertyId" = ${id}`
      
      console.log('💥 Deleting reviews...')
      await tx.$executeRaw`DELETE FROM reviews WHERE "propertyId" = ${id}`
      
      console.log('💥 Deleting tracking events...')
      await tx.$executeRaw`DELETE FROM tracking_events WHERE "propertyId" = ${id}`
      
      console.log('💥 Deleting announcements...')
      await tx.$executeRaw`DELETE FROM announcements WHERE "propertyId" = ${id}`
      
      console.log('💥 FINAL BLOW: Deleting property...')
      await tx.$executeRaw`DELETE FROM properties WHERE id = ${id}`
    })
    
    console.log('💥💥💥 NUCLEAR DELETE SUCCESSFUL - Property obliterated! 💥💥💥')
    
    return NextResponse.json({
      success: true,
      message: '💥 Propiedad eliminada con éxito usando ELIMINACIÓN NUCLEAR 💥'
    })
    
  } catch (error) {
    console.error('💥 NUCLEAR DELETE FAILED:', error)
    return NextResponse.json({
      success: false,
      error: 'Error en eliminación nuclear',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}