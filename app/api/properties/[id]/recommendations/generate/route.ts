import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../../../../src/lib/auth'
import { prisma } from '../../../../../../src/lib/prisma'
import { generateRecommendations } from '../../../../../../src/lib/recommendations/service'

/**
 * POST /api/properties/[id]/recommendations/generate
 *
 * Generates RECOMMENDATIONS-type zones for a property based on its location.
 * Uses OSM (free) for pharmacies, supermarkets, etc. and Google Places
 * (paid) for restaurants, cafes, and attractions.
 *
 * Body: { lat: number, lng: number, categories?: string[] }
 * - lat/lng: Property coordinates (required)
 * - categories: Optional array of category IDs to generate (defaults to all)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Verify property ownership
    const property = await prisma.property.findFirst({
      where: { id, hostId: userId, deletedAt: null },
      select: { id: true, name: true, city: true },
    })

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Propiedad no encontrada' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { lat, lng, categories } = body

    if (!lat || !lng || typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Se requieren coordenadas válidas (lat, lng)' },
        { status: 400 }
      )
    }

    const result = await generateRecommendations(id, lat, lng, categories)

    return NextResponse.json({
      success: true,
      ...result,
      message: result.zonesCreated > 0
        ? `Se crearon ${result.zonesCreated} zonas con ${result.totalPlaces} recomendaciones`
        : 'No se encontraron lugares cercanos para las categorías seleccionadas',
    })
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json(
      { success: false, error: 'Error al generar recomendaciones' },
      { status: 500 }
    )
  }
}
