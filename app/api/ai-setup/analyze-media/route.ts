import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../../src/lib/auth'
import { analyzeImage, analyzeVideo, analyzeFrames, type MediaAnalysisResult } from '../../../../src/lib/ai-setup/vision'

export const maxDuration = 60
export const runtime = 'nodejs'

// ============================================
// MOCK MODE — returns realistic fake data (zero API cost)
// Set MOCK_AI=true in .env to enable
// ============================================

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
    room_type: 'bathroom',
    appliances: [
      { detected_label: 'Secador de pelo', canonical_type: 'hair_dryer' as any, confidence: 0.90 },
    ],
    description: 'Baño amplio con ducha de lluvia y acabados modernos',
    confidence: 0.92,
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
    room_type: 'laundry',
    appliances: [
      { detected_label: 'Lavadora LG 8kg', canonical_type: 'washing_machine' as any, confidence: 0.95 },
    ],
    description: 'Zona de lavandería con lavadora y tendedero',
    confidence: 0.90,
  },
  {
    room_type: 'bedroom',
    appliances: [],
    description: 'Dormitorio principal con cama doble y armario empotrado',
    confidence: 0.94,
  },
  {
    room_type: 'entrance',
    appliances: [],
    description: 'Entrada principal con cerradura electrónica y perchero',
    confidence: 0.88,
  },
  {
    room_type: 'terrace',
    appliances: [],
    description: 'Terraza con mesa, sillas y vistas al exterior',
    confidence: 0.91,
  },
  {
    room_type: 'parking',
    appliances: [],
    description: 'Plaza de parking subterráneo con acceso por mando a distancia',
    confidence: 0.87,
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
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult

    const body = await request.json()
    const { mediaUrl, type, frames } = body

    console.log('[analyze-media] Request received:', { mediaUrl, type, framesCount: frames?.length })

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

    // MOCK MODE — instant fake analysis, no API cost
    if (process.env.MOCK_AI === 'true') {
      console.log('[analyze-media] MOCK MODE — returning fake result')
      // Simulate a small delay so UI feels natural
      await new Promise(r => setTimeout(r, 800 + Math.random() * 700))
      const mockResult = getMockResult()
      console.log('[analyze-media] MOCK result:', mockResult.room_type, '| appliances:', mockResult.appliances.length)
      return NextResponse.json({ success: true, data: mockResult })
    }

    let result
    if (hasFrames) {
      // Client-extracted frames (base64 data URLs) — no FFmpeg needed
      console.log('[analyze-media] Analyzing', frames.length, 'client-extracted frames')
      result = await analyzeFrames(frames)
    } else if (type === 'video') {
      console.log('[analyze-media] Starting server-side video analysis for:', mediaUrl)
      result = await analyzeVideo(mediaUrl)
    } else {
      console.log('[analyze-media] Starting image analysis for:', mediaUrl)
      result = await analyzeImage(mediaUrl)
    }

    console.log('[analyze-media] Analysis complete:', result.room_type, '| appliances:', result.appliances?.length || 0)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error analyzing media'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('[analyze-media] Error:', errorMessage)
    if (errorStack) console.error('[analyze-media] Stack:', errorStack)
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
