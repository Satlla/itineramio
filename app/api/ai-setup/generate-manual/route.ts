import { NextRequest } from 'next/server'
import { requireAuth } from '../../../../src/lib/auth'
import { planLimitsService } from '../../../../src/lib/plan-limits'
import { generateManual, type PropertyInput, type GenerationEvent } from '../../../../src/lib/ai-setup/generator'
import { prisma } from '../../../../src/lib/prisma'
import crypto from 'crypto'
import { citiesMatch } from '../../../../src/lib/city-match'
import { CATEGORY_NAMES } from '../../../../src/lib/category-names'

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

          // Send final property ID FIRST — before any background work to avoid Safari stream timeout
          const finalData = `data: ${JSON.stringify({ type: 'property_id', propertyId })}\n\n`
          controller.enqueue(encoder.encode(finalData))

          // Auto-subscribe to city guide in background (after stream closes)
          if (propertyData.city) {
            prisma.cityGuide.findMany({
              where: { status: { in: ['PUBLISHED', 'VERIFIED'] } },
              include: { places: { include: { place: { select: { id: true, latitude: true, longitude: true } } } } },
            }).then(async (guides) => {
              const matchingGuide = guides.find(g => citiesMatch(g.city, propertyData.city!))
              if (!matchingGuide) return
              await prisma.propertyGuideSubscription.upsert({
                where: { guideId_propertyId: { guideId: matchingGuide.id, propertyId } },
                create: { guideId: matchingGuide.id, propertyId, userId, status: 'ACTIVE', lastSeenVersion: 1 },
                update: { status: 'ACTIVE' },
              })
              for (const gp of matchingGuide.places) {
                const catInfo = CATEGORY_NAMES[gp.category] || { es: gp.category, en: gp.category, fr: gp.category, icon: 'MapPin' }
                let zone = await prisma.zone.findFirst({ where: { propertyId, type: 'RECOMMENDATIONS', recommendationCategory: gp.category } })
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
            }).catch(() => {})
          }
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
