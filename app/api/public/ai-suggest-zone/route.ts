import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimitAsync, getRateLimitKey } from '@/lib/rate-limit'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 20 IA requests per IP per hour
    const rateLimitKey = getRateLimitKey(request, null, 'ai-suggest-zone')
    const rateCheck = await checkRateLimitAsync(rateLimitKey, {
      maxRequests: 20,
      windowMs: 60 * 60 * 1000,
    })
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Demasiadas peticiones. Vuelve a intentarlo más tarde.' },
        { status: 429 }
      )
    }

    const { zoneName } = await request.json()

    if (!zoneName || typeof zoneName !== 'string' || zoneName.trim().length < 2) {
      return NextResponse.json({ error: 'Zone name required' }, { status: 400 })
    }

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 500 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        temperature: 0.4,
        messages: [
          {
            role: 'user',
            content: `Eres un asistente para anfitriones de alojamientos turísticos. El anfitrión ha creado una zona llamada "${zoneName.trim()}" en su manual digital para huéspedes.

Genera una descripción breve y útil en español (3-5 líneas) con instrucciones prácticas para los huéspedes sobre esta zona/elemento. Incluye:
- Cómo funciona o cómo usarlo
- Ubicación si es relevante
- Precauciones o consejos importantes

Responde SOLO con la descripción, sin título ni formato markdown.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'AI request failed' }, { status: 500 })
    }

    const data = await response.json()
    const suggestion = data.content?.[0]?.text?.trim() || ''

    return NextResponse.json({ suggestion })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate suggestion' }, { status: 500 })
  }
}
