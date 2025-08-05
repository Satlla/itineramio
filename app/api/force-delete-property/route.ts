import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

// 🖕 ENDPOINT SIN AUTENTICACIÓN NI HOSTIAS - SOLO PARA ELIMINAR ESA PUTA PROPIEDAD
export async function POST(request: NextRequest) {
  try {
    const { propertyId } = await request.json()
    
    if (!propertyId) {
      return NextResponse.json({ error: 'Necesito el propertyId' }, { status: 400 })
    }
    
    console.log('🖕 FORCE DELETE - A TOMAR POR CULO TODO')
    
    // Eliminar TODO sin miramientos
    const queries = [
      `DELETE FROM steps WHERE "zoneId" IN (SELECT id FROM zones WHERE "propertyId" = '${propertyId}')`,
      `DELETE FROM zone_comments WHERE "zoneId" IN (SELECT id FROM zones WHERE "propertyId" = '${propertyId}')`,
      `DELETE FROM zone_ratings WHERE "zoneId" IN (SELECT id FROM zones WHERE "propertyId" = '${propertyId}')`,
      `DELETE FROM error_reports WHERE "zoneId" IN (SELECT id FROM zones WHERE "propertyId" = '${propertyId}')`,
      `DELETE FROM zone_analytics WHERE "zoneId" IN (SELECT id FROM zones WHERE "propertyId" = '${propertyId}')`,
      `DELETE FROM zone_views WHERE "propertyId" = '${propertyId}'`,
      `DELETE FROM zones WHERE "propertyId" = '${propertyId}'`,
      `DELETE FROM property_analytics WHERE "propertyId" = '${propertyId}'`,
      `DELETE FROM property_ratings WHERE "propertyId" = '${propertyId}'`,
      `DELETE FROM property_views WHERE "propertyId" = '${propertyId}'`,
      `DELETE FROM reviews WHERE "propertyId" = '${propertyId}'`,
      `DELETE FROM tracking_events WHERE "propertyId" = '${propertyId}'`,
      `DELETE FROM announcements WHERE "propertyId" = '${propertyId}'`,
      `DELETE FROM properties WHERE id = '${propertyId}'`
    ]
    
    const results = []
    
    for (const query of queries) {
      try {
        const result = await prisma.$executeRawUnsafe(query)
        results.push({ query: query.split(' ')[2], success: true, deleted: result })
      } catch (err) {
        results.push({ query: query.split(' ')[2], success: false, error: err instanceof Error ? err.message : 'Unknown' })
      }
    }
    
    return NextResponse.json({
      message: '🖕 FORCE DELETE EJECUTADO',
      propertyId,
      results
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Algo salió mal',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 })
  }
}