import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getRateLimitKey } from '../../../../src/lib/rate-limit'
import { analyzeImage, analyzeVideo, analyzeFrames, type MediaAnalysisResult } from '../../../../src/lib/ai-setup/vision'

export const maxDuration = 60
export const runtime = 'nodejs'

// Mock results for MOCK_AI mode
const MOCK_RESULTS: MediaAnalysisResult[] = [
  {
    room_type: 'kitchen',
    appliances: [
      { detected_label: 'Microondas Samsung', canonical_type: 'microwave' as any, confidence: 0.94 },
      { detected_label: 'Vitrocerámica de inducción', canonical_type: 'induction_hob' as any, confidence: 0.91 },
      { detected_label: 'Lavavajillas Bosch', canonical_type: 'dishwasher' as any, confidence: 0.88 },
    ],
    description: 'Cocina moderna completamente equipada con electrodomésticos de acero inoxidable',
    confidence: 0.95,
  },
  {
    room_type: 'living_room',
    appliances: [
      { detected_label: 'Smart TV Samsung 55"', canonical_type: 'smart_tv' as any, confidence: 0.96 },
      { detected_label: 'Aire acondicionado split', canonical_type: 'air_conditioning' as any, confidence: 0.89 },
    ],
    description: 'Salón luminoso con sofá grande y televisión de pantalla plana',
    confidence: 0.93,
  },
  {
    room_type: 'bathroom',
    appliances: [
      { detected_label: 'Secador de pelo', canonical_type: 'hair_dryer' as any, confidence: 0.90 },
    ],
    description: 'Baño amplio con ducha de lluvia y acabados modernos',
    confidence: 0.92,
  },
  {
    room_type: 'bedroom',
    appliances: [],
    description: 'Dormitorio principal con cama doble y armario empotrado',
    confidence: 0.94,
  },
  {
    room_type: 'terrace',
    appliances: [],
    description: 'Terraza con mesa, sillas y vistas al exterior',
    confidence: 0.91,
  },
]

let mockIndex = 0

function getMockResult(): MediaAnalysisResult {
  const result = MOCK_RESULTS[mockIndex % MOCK_RESULTS.length]
  mockIndex++
  return result
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 analyses per IP per 24h
    const rateLimitKey = getRateLimitKey(request, null, 'demo-analyze')
    const rateCheck = checkRateLimit(rateLimitKey, {
      maxRequests: 10,
      windowMs: 24 * 60 * 60 * 1000,
    })
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Has alcanzado el límite de análisis de demo. Vuelve mañana.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { mediaUrl, type, frames } = body

    // Validate: either frames[] or mediaUrl+type must be provided
    const hasFrames = Array.isArray(frames) && frames.length > 0
    if (!hasFrames && (!mediaUrl || !type)) {
      return NextResponse.json(
        { success: false, error: 'Either frames[] or mediaUrl+type are required' },
        { status: 400 }
      )
    }

    if (!hasFrames && !['video', 'image'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'type must be "video" or "image"' },
        { status: 400 }
      )
    }

    // MOCK MODE
    if (process.env.MOCK_AI === 'true') {
      await new Promise(r => setTimeout(r, 800 + Math.random() * 700))
      return NextResponse.json({ success: true, data: getMockResult() })
    }

    let result
    if (hasFrames) {
      result = await analyzeFrames(frames)
    } else if (type === 'video') {
      result = await analyzeVideo(mediaUrl)
    } else {
      result = await analyzeImage(mediaUrl)
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error analyzing media'
    console.error('[demo-analyze-media] Error:', errorMessage)
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
