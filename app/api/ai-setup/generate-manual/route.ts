import { NextRequest } from 'next/server'
import { requireAuth } from '../../../../src/lib/auth'
import { planLimitsService } from '../../../../src/lib/plan-limits'
import { generateManual, type PropertyInput, type GenerationEvent } from '../../../../src/lib/ai-setup/generator'
import { type MediaAnalysisResult } from '../../../../src/lib/ai-setup/vision'

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
      mediaAnalysis: MediaAnalysisResult[]
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
            console.error('[generate-manual] Error sending SSE event:', err)
          }
        }

        try {
          const propertyId = await generateManual(
            userId,
            propertyData,
            mediaAnalysis || [],
            sendEvent
          )

          // Send final property ID
          const finalData = `data: ${JSON.stringify({ type: 'property_id', propertyId })}\n\n`
          controller.enqueue(encoder.encode(finalData))
        } catch (error) {
          console.error('[generate-manual] Generation error:', error)
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
    console.error('[generate-manual] Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
