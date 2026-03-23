import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../../src/lib/admin-auth'
import { citiesMatch } from '../../../../../src/lib/city-match'

const CATEGORY_NAMES: Record<string, { es: string; en: string; fr: string; icon: string }> = {
  restaurant: { es: 'Restaurantes', en: 'Restaurants', fr: 'Restaurants', icon: 'Utensils' },
  cafe: { es: 'Cafeterías', en: 'Cafes', fr: 'Cafés', icon: 'Coffee' },
  tourist_attraction: { es: 'Lugares de interés', en: 'Tourist Attractions', fr: 'Attractions touristiques', icon: 'Camera' },
  park: { es: 'Parques y naturaleza', en: 'Parks & Nature', fr: 'Parcs & Nature', icon: 'Trees' },
  beach: { es: 'Playas', en: 'Beaches', fr: 'Plages', icon: 'Waves' },
  shopping_mall: { es: 'Compras', en: 'Shopping', fr: 'Shopping', icon: 'ShoppingBag' },
  museum: { es: 'Museos', en: 'Museums', fr: 'Musées', icon: 'Landmark' },
  bar: { es: 'Bares', en: 'Bars', fr: 'Bars', icon: 'Wine' },
  pharmacy: { es: 'Farmacias', en: 'Pharmacies', fr: 'Pharmacies', icon: 'Pill' },
  hospital: { es: 'Hospitales', en: 'Hospitals', fr: 'Hôpitaux', icon: 'Hospital' },
  supermarket: { es: 'Supermercados', en: 'Supermarkets', fr: 'Supermarchés', icon: 'ShoppingCart' },
  gym: { es: 'Gimnasios', en: 'Gyms', fr: 'Salles de sport', icon: 'Dumbbell' },
}

/**
 * POST /api/admin/city-guides/bulk-subscribe
 * Auto-subscribes all existing properties to their matching city guide.
 * Skips properties already subscribed.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth(request)
  if (auth instanceof Response) return auth

  try {
    // Load all published/verified guides with their places
    const guides = await prisma.cityGuide.findMany({
      where: { status: { in: ['PUBLISHED', 'VERIFIED'] } },
      include: {
        places: {
          include: { place: { select: { id: true, latitude: true, longitude: true } } },
        },
      },
    })

    // Load all properties
    const properties = await prisma.property.findMany({
      select: { id: true, city: true, hostId: true },
    })

    // Load existing active subscriptions to skip already-subscribed pairs
    const existingSubs = await prisma.propertyGuideSubscription.findMany({
      where: { status: 'ACTIVE' },
      select: { guideId: true, propertyId: true },
    })
    const subSet = new Set(existingSubs.map(s => `${s.guideId}__${s.propertyId}`))

    let subscribedCount = 0
    let placesImported = 0

    for (const guide of guides) {
      const guideCity = guide.city.toLowerCase().trim()

      // Find matching properties (bidirectional city name match)
      const matchingProperties = properties.filter(p => citiesMatch(p.city, guide.city))

      for (const property of matchingProperties) {
        const key = `${guide.id}__${property.id}`
        if (subSet.has(key)) continue // already subscribed

        // Create subscription
        await prisma.propertyGuideSubscription.upsert({
          where: { guideId_propertyId: { guideId: guide.id, propertyId: property.id } },
          create: {
            guideId: guide.id,
            propertyId: property.id,
            userId: property.hostId,
            status: 'ACTIVE',
            lastSeenVersion: 1,
          },
          update: { status: 'ACTIVE' },
        })
        subscribedCount++

        // Import places into recommendation zones
        for (const gp of guide.places) {
          const catInfo = CATEGORY_NAMES[gp.category] || { es: gp.category, en: gp.category, fr: gp.category, icon: 'MapPin' }

          let zone = await prisma.zone.findFirst({
            where: { propertyId: property.id, type: 'RECOMMENDATIONS', recommendationCategory: gp.category },
          })

          if (!zone) {
            const maxOrder = await prisma.zone.aggregate({ where: { propertyId: property.id }, _max: { order: true } })
            zone = await prisma.zone.create({
              data: {
                propertyId: property.id,
                name: { es: catInfo.es, en: catInfo.en, fr: catInfo.fr },
                icon: catInfo.icon,
                type: 'RECOMMENDATIONS',
                recommendationCategory: gp.category,
                qrCode: `qr_${crypto.randomUUID()}`,
                accessCode: crypto.randomUUID().slice(0, 8).toUpperCase(),
                order: (maxOrder._max.order ?? -1) + 1,
                status: 'ACTIVE',
                isPublished: true,
              },
            })
          }

          const maxReco = await prisma.recommendation.aggregate({ where: { zoneId: zone.id }, _max: { order: true } })
          try {
            await prisma.recommendation.create({
              data: {
                zoneId: zone.id,
                placeId: gp.placeId,
                source: 'CITY_GUIDE',
                order: (maxReco._max.order ?? -1) + 1,
              },
            })
            placesImported++
          } catch (e: any) {
            if (e?.code !== 'P2002') throw e // skip duplicates
          }
        }

        subSet.add(key) // mark as done
      }

      // Update subscriber count
      if (subscribedCount > 0) {
        await prisma.cityGuide.update({
          where: { id: guide.id },
          data: { subscriberCount: { increment: subscribedCount } },
        })
      }
    }

    return NextResponse.json({
      success: true,
      subscribedCount,
      placesImported,
      message: `${subscribedCount} propiedades suscritas, ${placesImported} lugares importados`,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    )
  }
}
