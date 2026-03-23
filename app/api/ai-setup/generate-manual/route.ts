import { NextRequest } from 'next/server'
import { requireAuth } from '../../../../src/lib/auth'
import { planLimitsService } from '../../../../src/lib/plan-limits'
import { generateManual, type PropertyInput, type GenerationEvent } from '../../../../src/lib/ai-setup/generator'
import { prisma } from '../../../../src/lib/prisma'
import crypto from 'crypto'

export const maxDuration = 300
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult
    const userId = authResult.userId

    // Check plan limits
    const limitsCheck = await planLimitsService.validatePropertyCreation(userId)
    if (!limitsCheck.valid) {
      return new Response(
        JSON.stringify({ success: false, error: limitsCheck.error, upgradeRequired: true }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const body = await request.json()
    const { propertyData, mediaAnalysis } = body as {
      propertyData: PropertyInput
      mediaAnalysis: any[]
    }

    if (!propertyData || !propertyData.name || !propertyData.street) {
      return new Response(
        JSON.stringify({ success: false, error: 'Property data is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Set up SSE stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: GenerationEvent) => {
          try {
            const data = `data: ${JSON.stringify(event)}\n\n`
            controller.enqueue(encoder.encode(data))
          } catch (err) {
            // ignore SSE send errors
          }
        }

        try {
          const propertyId = await generateManual(
            userId,
            propertyData,
            mediaAnalysis || [],
            sendEvent
          )

          // Auto-subscribe to city guide if one exists for this city (non-blocking)
          if (propertyData.city) {
            try {
              const city = propertyData.city.toLowerCase().trim()
              const guides = await prisma.cityGuide.findMany({
                where: { status: { in: ['PUBLISHED', 'VERIFIED'] } },
                include: {
                  places: {
                    include: { place: { select: { id: true, latitude: true, longitude: true } } },
                  },
                },
              })
              const matchingGuide = guides.find(g => {
                const gc = g.city.toLowerCase().trim()
                return gc.includes(city) || city.includes(gc)
              })
              if (matchingGuide) {
                // Create subscription
                await prisma.propertyGuideSubscription.upsert({
                  where: { guideId_propertyId: { guideId: matchingGuide.id, propertyId } },
                  create: { guideId: matchingGuide.id, propertyId, userId, status: 'ACTIVE', lastSeenVersion: 1 },
                  update: { status: 'ACTIVE' },
                })
                // Import places into recommendation zones
                for (const gp of matchingGuide.places) {
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
                  }
                  const catInfo = CATEGORY_NAMES[gp.category] || { es: gp.category, en: gp.category, fr: gp.category, icon: 'MapPin' }
                  let zone = await prisma.zone.findFirst({
                    where: { propertyId, type: 'RECOMMENDATIONS', recommendationCategory: gp.category },
                  })
                  if (!zone) {
                    const maxOrder = await prisma.zone.aggregate({ where: { propertyId }, _max: { order: true } })
                    zone = await prisma.zone.create({
                      data: {
                        propertyId, name: { es: catInfo.es, en: catInfo.en, fr: catInfo.fr },
                        icon: catInfo.icon, type: 'RECOMMENDATIONS', recommendationCategory: gp.category,
                        qrCode: `qr_${crypto.randomUUID()}`, accessCode: crypto.randomUUID().slice(0, 8).toUpperCase(),
                        order: (maxOrder._max.order ?? -1) + 1, status: 'ACTIVE', isPublished: true,
                      },
                    })
                  }
                  const maxReco = await prisma.recommendation.aggregate({ where: { zoneId: zone.id }, _max: { order: true } })
                  await prisma.recommendation.upsert({
                    where: { zoneId_placeId: { zoneId: zone.id, placeId: gp.placeId } },
                    create: { zoneId: zone.id, placeId: gp.placeId, source: 'CITY_GUIDE', order: (maxReco._max.order ?? -1) + 1 },
                    update: {},
                  })
                }
                await prisma.cityGuide.update({ where: { id: matchingGuide.id }, data: { subscriberCount: { increment: 1 } } })
              }
            } catch {
              // Non-blocking — don't fail generation if city guide import fails
            }
          }

          // Send final property ID
          const finalData = `data: ${JSON.stringify({ type: 'property_id', propertyId })}\n\n`
          controller.enqueue(encoder.encode(finalData))
        } catch (error) {
          const errorData = `data: ${JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Error generating manual',
          })}\n\n`
          controller.enqueue(encoder.encode(errorData))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
