/**
 * Tests del chatbot — renderizado de imágenes y vídeos
 *
 * Cubre:
 * - collectRelevantMedia: IMAGE y VIDEO cuando score >= 8
 * - Sin media cuando score < 8 o zona RECOMMENDATIONS
 * - content.mediaUrl a nivel raíz (formato real de la BD)
 * - Máx 8 items, stepIndex, stepText presentes
 * - zoneId directo fuerza media (score = 20)
 * - Funciona para cualquier propertyId
 * - Steps TEXT o sin mediaUrl → sin media
 * - Validaciones: 400 / 404
 * - Rate limiting: 429
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ─── vi.hoisted: garantiza que los mocks existen cuando vi.mock() los usa ───
const {
  mockFindFirst,
  mockConvFindUnique,
  mockConvCreate,
  mockConvUpdate,
  mockConvFindMany,
  mockCheckRateLimit,
  mockCheckRateLimitAsync,
} = vi.hoisted(() => ({
  mockFindFirst:           vi.fn(),
  mockConvFindUnique:      vi.fn(),
  mockConvCreate:          vi.fn(),
  mockConvUpdate:          vi.fn(),
  mockConvFindMany:        vi.fn(),
  mockCheckRateLimit:      vi.fn(),
  mockCheckRateLimitAsync: vi.fn(),
}))

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>()
  return { ...actual, after: vi.fn() }
})

vi.mock('../../src/lib/rate-limit', () => ({
  checkRateLimit:      mockCheckRateLimit,
  checkRateLimitAsync: mockCheckRateLimitAsync,
  getRateLimitKey:     vi.fn().mockReturnValue('test-key'),
}))

vi.mock('../../src/lib/email-improved', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('../../src/lib/prisma', () => ({
  prisma: {
    property: { findFirst: mockFindFirst },
    chatbotConversation: {
      findUnique: mockConvFindUnique,
      create:     mockConvCreate,
      update:     mockConvUpdate,
      findMany:   mockConvFindMany,
    },
  },
}))

// ─── Import estático del route ───────────────────────────────────────────────
import { POST } from '../../app/api/chatbot/route'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Formato real que usa la BD:
 * content = { mediaUrl: "...", es: "texto español", en: "english text" }
 * (mediaUrl siempre a nivel raíz — así lo lee collectRelevantMedia)
 */
function makeMediaStep(overrides: {
  id?:    string
  type?:  string
  title?: any
  url?:   string
  textEs?: string
  textEn?: string
  order?: number
} = {}) {
  const url = overrides.url ?? 'https://cdn.example.com/img/door.jpg'
  return {
    id:    overrides.id    ?? 'step-001',
    type:  overrides.type  ?? 'IMAGE',
    title: overrides.title ?? { es: 'Foto de la entrada', en: 'Front door photo' },
    content: {
      mediaUrl: url,                                         // ← nivel raíz
      es: overrides.textEs ?? 'Esta es la puerta principal',
      en: overrides.textEn ?? 'This is the main door',
    },
    order: overrides.order ?? 1,
  }
}

/** Step de texto sin media */
function makeTextStep(overrides: { id?: string; title?: any } = {}) {
  return {
    id:      overrides.id    ?? 'step-text',
    type:    'TEXT',
    title:   overrides.title ?? { es: 'Nota', en: 'Note' },
    content: { es: 'Solo texto, sin media', en: 'Text only, no media' },
    order:   1,
  }
}

function makeZone(overrides: {
  id?:    string
  name?:  any
  type?:  string
  steps?: any[]
  order?: number
} = {}) {
  return {
    id:              overrides.id    ?? 'zone-001',
    type:            overrides.type  ?? 'STANDARD',
    status:          'ACTIVE',
    name:            overrides.name  ?? { es: 'Zona principal', en: 'Main zone' },
    description:     { es: '', en: '' },
    steps:           overrides.steps ?? [],
    recommendations: [],
    order:           overrides.order ?? 1,
  }
}

function makeProperty(zones: any[], id = 'prop-test-00001') {
  return {
    id,
    name:         { es: 'Apartamento Test', en: 'Test Apartment' },
    intelligence: null,
    host:         { name: 'Test Host', email: 'host@test.com', phone: '+34600000000' },
    zones,
    deletedAt:    null,
  }
}

function req(body: Record<string, any>) {
  return new NextRequest('http://localhost:3000/api/chatbot', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
}

const ALLOW = { allowed: true, remaining: 99, limit: 20, resetIn: 60000, current: 1 }

// ─── beforeEach ──────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  delete process.env.OPENAI_API_KEY  // modo fallback: sin OpenAI, determinista
  mockCheckRateLimit.mockReturnValue(ALLOW)
  mockCheckRateLimitAsync.mockResolvedValue(ALLOW)
  mockConvFindUnique.mockResolvedValue(null)
  mockConvCreate.mockResolvedValue({ id: 'conv-001' })
  mockConvUpdate.mockResolvedValue({ id: 'conv-001' })
  mockConvFindMany.mockResolvedValue([])
})

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 1 — Media en respuestas (imágenes y vídeos)
// ═══════════════════════════════════════════════════════════════════════════

describe('Chatbot — imágenes y vídeos en respuestas', () => {

  // ── 1. IMAGE cuando la zona coincide ────────────────────────────────────

  it('devuelve IMAGE cuando la zona coincide con la pregunta (score >= 8)', async () => {
    mockFindFirst.mockResolvedValue(makeProperty([
      makeZone({
        name:  { es: 'Check-in y llegada', en: 'Check-in and arrival' },
        steps: [makeMediaStep({ type: 'IMAGE', url: 'https://cdn.example.com/door.jpg' })],
      })
    ], 'prop-img-001'))

    const res = await POST(req({
      message:    'check in llegada al apartamento',  // 'check' → +15, 'llegada' → ALWAYS +2
      propertyId: 'prop-img-001',
      language:   'es',
      sessionId:  'sess-001',
    }))

    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.media).toBeDefined()
    expect(body.media[0].type).toBe('IMAGE')
    expect(body.media[0].url).toBe('https://cdn.example.com/door.jpg')
  })

  // ── 2. VIDEO cuando el step es de tipo VIDEO ─────────────────────────────

  it('devuelve VIDEO cuando el step es de tipo VIDEO', async () => {
    mockFindFirst.mockResolvedValue(makeProperty([
      makeZone({
        name:  { es: 'Cerradura inteligente', en: 'Smart lock' },
        steps: [makeMediaStep({ type: 'VIDEO', url: 'https://cdn.example.com/lock.mp4' })],
      })
    ], 'prop-vid-002'))

    const res = await POST(req({
      message:    'cerradura inteligente cómo funciona',  // 'cerradura' en nombre zona → +15
      propertyId: 'prop-vid-002',
      language:   'es',
      sessionId:  'sess-002',
    }))

    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.media).toBeDefined()
    expect(body.media[0].type).toBe('VIDEO')
    expect(body.media[0].url).toMatch(/\.mp4$/)
  })

  // ── 3. Sin media cuando score < 8 ───────────────────────────────────────

  it('NO devuelve media cuando la pregunta no coincide con ninguna zona (score < 8)', async () => {
    mockFindFirst.mockResolvedValue(makeProperty([
      makeZone({
        name:  { es: 'Piscina exterior' },
        steps: [makeMediaStep()],
      })
    ], 'prop-nomatch-003'))

    const res = await POST(req({
      message:    'qué hora es mañana',   // sin keywords de ninguna zona
      propertyId: 'prop-nomatch-003',
      language:   'es',
      sessionId:  'sess-003',
    }))

    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.media ?? undefined).toBeUndefined()
  })

  // ── 4. Sin media para zonas RECOMMENDATIONS ──────────────────────────────

  it('NO devuelve media cuando la zona top es tipo RECOMMENDATIONS', async () => {
    mockFindFirst.mockResolvedValue(makeProperty([
      makeZone({
        type:  'RECOMMENDATIONS',
        name:  { es: 'Restaurantes cercanos' },
        steps: [makeMediaStep()],
      })
    ], 'prop-recs-004'))

    const res = await POST(req({
      message:    'restaurantes cercanos para cenar',
      propertyId: 'prop-recs-004',
      language:   'es',
      sessionId:  'sess-004',
    }))

    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.media ?? undefined).toBeUndefined()
  })

  // ── 5. mediaUrl a nivel raíz en content (formato de la BD) ───────────────

  it('extrae mediaUrl cuando está a nivel raíz en content', async () => {
    const step = {
      id: 'step-flat',
      type: 'IMAGE',
      title: { es: 'Foto de la piscina' },
      content: {
        mediaUrl: 'https://cdn.example.com/pool.jpg',   // ← nivel raíz
        es: 'Vista de la piscina exterior',
        en: 'Outdoor pool view',
      },
      order: 1,
    }
    mockFindFirst.mockResolvedValue(makeProperty([
      makeZone({
        name:  { es: 'Piscina y terraza', en: 'Pool and terrace' },
        steps: [step],
      })
    ], 'prop-flat-005'))

    const res = await POST(req({
      message:    'piscina terraza instrucciones',  // 'piscina' en nombre → +15
      propertyId: 'prop-flat-005',
      language:   'es',
      sessionId:  'sess-005',
    }))

    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.media).toBeDefined()
    expect(body.media[0].url).toBe('https://cdn.example.com/pool.jpg')
  })

  // ── 6. content.mediaUrl directo + texto plano por idioma ─────────────────

  it('extrae texto localizado cuando content tiene mediaUrl + claves de idioma', async () => {
    const step = {
      id: 'step-wifi',
      type: 'IMAGE',
      title: { es: 'Etiqueta WiFi' },
      content: {
        mediaUrl: 'https://cdn.example.com/wifi.jpg',
        es: 'La contraseña está en la etiqueta del router',
        en: 'Password is on the router label',
      },
      order: 1,
    }
    mockFindFirst.mockResolvedValue(makeProperty([
      makeZone({
        name:  { es: 'WiFi y contraseña', en: 'WiFi and password' },
        steps: [step],
      })
    ], 'prop-wifi-006'))

    const res = await POST(req({
      message:    'contraseña wifi internet',   // 'wifi' en nombre → +15 + ALWAYS +2
      propertyId: 'prop-wifi-006',
      language:   'es',
      sessionId:  'sess-006',
    }))

    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.media).toBeDefined()
    expect(body.media[0].url).toBe('https://cdn.example.com/wifi.jpg')
    expect(typeof body.media[0].stepText).toBe('string')
    expect(body.media[0].stepText.length).toBeGreaterThan(0)
  })

  // ── 7. Máximo 8 items ────────────────────────────────────────────────────

  it('devuelve como máximo 8 items aunque la zona tenga 12 steps con media', async () => {
    const steps = Array.from({ length: 12 }, (_, i) =>
      makeMediaStep({
        id:    `step-m-${i}`,
        type:  i % 2 === 0 ? 'IMAGE' : 'VIDEO',
        url:   `https://cdn.example.com/s${i}.jpg`,
        order: i + 1,
      })
    )
    mockFindFirst.mockResolvedValue(makeProperty([
      makeZone({
        name:  { es: 'Instrucciones completas llegada', en: 'Full arrival instructions' },
        steps,
      })
    ], 'prop-max-007'))

    const res = await POST(req({
      message:    'instrucciones llegada completas',   // 'llegada' ALWAYS +2 + 'instrucciones' en steps
      propertyId: 'prop-max-007',
      language:   'es',
      sessionId:  'sess-007',
    }))

    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.media).toBeDefined()
    expect(body.media.length).toBeGreaterThan(0)
    expect(body.media.length).toBeLessThanOrEqual(8)
  })

  // ── 8. zoneId directo fuerza media ──────────────────────────────────────

  it('devuelve media cuando se especifica zoneId directamente (score forzado a 20)', async () => {
    const targetZone = makeZone({
      id:    'zone-bath',
      name:  { es: 'Baño principal', en: 'Main bathroom' },
      steps: [makeMediaStep({ type: 'VIDEO', url: 'https://cdn.example.com/bath.mp4' })],
    })
    const otherZone = makeZone({ id: 'zone-kitchen', name: { es: 'Cocina' }, steps: [] })

    mockFindFirst.mockResolvedValue(makeProperty([targetZone, otherZone], 'prop-zoneid-008'))

    const res = await POST(req({
      message:    'ok',               // mensaje genérico sin keywords
      propertyId: 'prop-zoneid-008',
      zoneId:     'zone-bath',        // → score forzado a 20
      language:   'es',
      sessionId:  'sess-008',
    }))

    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.media).toBeDefined()
    expect(body.media[0].type).toBe('VIDEO')
    expect(body.media[0].url).toContain('bath.mp4')
  })

  // ── 9. Funciona para cualquier propertyId ────────────────────────────────

  it('funciona correctamente con propertyIds arbitrarios de cualquier propiedad', async () => {
    const arbitraryIds = [
      'cld8f2x9a000001kzg8ht3b5c',
      'cld9m7r2b000002jy1xkp4d6e',
      'prop-booking-12345678-abcd',
    ]

    for (let i = 0; i < arbitraryIds.length; i++) {
      const propId = arbitraryIds[i]
      mockFindFirst.mockResolvedValue(makeProperty([
        makeZone({
          id:    `zone-${i}`,
          name:  { es: 'Acceso y llegada' },
          steps: [makeMediaStep({ url: `https://cdn.example.com/${propId}/door.jpg` })],
        })
      ], propId))

      const res = await POST(req({
        message:    'acceso llegada apartamento',  // 'acceso' en nombre → +15
        propertyId: propId,
        language:   'es',
        sessionId:  `sess-arb-${i}`,
      }))

      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.media).toBeDefined()
      expect(body.media[0].url).toContain(propId)
    }
  })

  // ── 10. Sin media para steps sin mediaUrl ───────────────────────────────

  it('NO añade media para steps que no tienen mediaUrl', async () => {
    const stepNoUrl = {
      id: 'step-nourl',
      type: 'IMAGE',
      title: { es: 'Solo texto' },
      content: { es: 'Texto sin imagen adjunta' },  // sin mediaUrl
      order: 1,
    }
    mockFindFirst.mockResolvedValue(makeProperty([
      makeZone({
        name:  { es: 'Check-in y acceso' },
        steps: [stepNoUrl],
      })
    ], 'prop-nourl-010'))

    const res = await POST(req({
      message:    'check in acceso instrucciones',
      propertyId: 'prop-nourl-010',
      language:   'es',
      sessionId:  'sess-010',
    }))

    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.media ?? undefined).toBeUndefined()
  })

  // ── 11. Sin media para steps de tipo TEXT ────────────────────────────────

  it('NO devuelve media para steps de tipo TEXT aunque tengan mediaUrl', async () => {
    mockFindFirst.mockResolvedValue(makeProperty([
      makeZone({
        name:  { es: 'Bienvenida y llegada' },
        steps: [{
          id: 'step-text',
          type: 'TEXT',  // tipo TEXT — excluido de colección de media
          title: { es: 'Nota' },
          content: { mediaUrl: 'https://cdn.example.com/nota.jpg', es: 'Texto' },
          order: 1,
        }],
      })
    ], 'prop-texttype-011'))

    const res = await POST(req({
      message:    'bienvenida llegada apartamento',
      propertyId: 'prop-texttype-011',
      language:   'es',
      sessionId:  'sess-011',
    }))

    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.media ?? undefined).toBeUndefined()
  })

  // ── 12. IMAGE y VIDEO en la misma respuesta ──────────────────────────────

  it('devuelve IMAGE y VIDEO juntos cuando la zona tiene ambos tipos', async () => {
    mockFindFirst.mockResolvedValue(makeProperty([
      makeZone({
        name: { es: 'Entrada y acceso', en: 'Entry and access' },
        steps: [
          makeMediaStep({ id: 'step-img', type: 'IMAGE', url: 'https://cdn.example.com/key.jpg', order: 1 }),
          makeMediaStep({ id: 'step-vid', type: 'VIDEO', url: 'https://cdn.example.com/open.mp4', order: 2 }),
        ],
      })
    ], 'prop-mixed-012'))

    const res = await POST(req({
      message:    'entrada acceso instrucciones',   // 'entrada' en nombre → +15
      propertyId: 'prop-mixed-012',
      language:   'es',
      sessionId:  'sess-012',
    }))

    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.media).toBeDefined()
    const types = body.media.map((m: any) => m.type)
    expect(types).toContain('IMAGE')
    expect(types).toContain('VIDEO')
  })

  // ── 13. stepIndex y stepText presentes ──────────────────────────────────

  it('cada item de media incluye stepIndex y stepText válidos', async () => {
    mockFindFirst.mockResolvedValue(makeProperty([
      makeZone({
        name:  { es: 'Acceso y llegada' },
        steps: [makeMediaStep({
          textEs: 'La llave está en el cajón de la entrada',
          url:    'https://cdn.example.com/key.jpg',
        })],
      })
    ], 'prop-stepidx-013'))

    const res = await POST(req({
      message:    'acceso llegada instrucciones',   // 'acceso' en nombre → +15
      propertyId: 'prop-stepidx-013',
      language:   'es',
      sessionId:  'sess-013',
    }))

    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.media).toBeDefined()
    expect(body.media[0].stepIndex).toBe(1)
    expect(typeof body.media[0].stepText).toBe('string')
    expect(body.media[0].stepText.length).toBeGreaterThan(0)
  })

  // ── 14. Respuesta sin media cuando no hay steps ──────────────────────────

  it('devuelve respuesta válida sin media cuando no hay steps en la zona', async () => {
    mockFindFirst.mockResolvedValue(makeProperty([
      makeZone({ name: { es: 'Bienvenida' }, steps: [] })
    ], 'prop-nosteps-014'))

    const res = await POST(req({
      message:    'bienvenida',
      propertyId: 'prop-nosteps-014',
      language:   'es',
      sessionId:  'sess-014',
    }))

    const body = await res.json()
    expect(res.status).toBe(200)
    expect(typeof body.response).toBe('string')
    expect(body.response.length).toBeGreaterThan(0)
    expect(body.media ?? undefined).toBeUndefined()
  })

  // ── 15. Funciona con huésped en inglés ───────────────────────────────────

  it('devuelve media cuando el huésped habla inglés (language=en)', async () => {
    mockFindFirst.mockResolvedValue(makeProperty([
      makeZone({
        name:  { es: 'Check-in y llegada', en: 'Check-in and arrival' },
        steps: [makeMediaStep({
          type:   'IMAGE',
          url:    'https://cdn.example.com/key-en.jpg',
          textEs: 'La llave',
          textEn: 'The key is in the drawer',
        })],
      })
    ], 'prop-en-015'))

    const res = await POST(req({
      message:    'check in arrival key',   // 'check' en nombre → +15, ALWAYS 'check' +2
      propertyId: 'prop-en-015',
      language:   'en',
      sessionId:  'sess-015',
    }))

    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.media).toBeDefined()
    expect(body.media[0].url).toContain('key-en.jpg')
  })

  // ── 16. La respuesta siempre incluye campo response ──────────────────────

  it('la respuesta incluye siempre el campo response con texto', async () => {
    mockFindFirst.mockResolvedValue(makeProperty([makeZone()], 'prop-resp-016'))

    const res = await POST(req({
      message:    'hola',
      propertyId: 'prop-resp-016',
      language:   'es',
      sessionId:  'sess-016',
    }))

    const body = await res.json()
    expect(res.status).toBe(200)
    expect(typeof body.response).toBe('string')
    expect(body.response.length).toBeGreaterThan(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 2 — Validación de parámetros
// ═══════════════════════════════════════════════════════════════════════════

describe('Chatbot — validación de parámetros', () => {

  it('devuelve 400 cuando falta message', async () => {
    const res = await POST(req({ propertyId: 'prop-test-uuid-001', language: 'es' }))
    expect(res.status).toBe(400)
  })

  it('devuelve 400 cuando falta propertyId', async () => {
    const res = await POST(req({ message: 'hola', language: 'es' }))
    expect(res.status).toBe(400)
  })

  it('devuelve 400 cuando propertyId < 10 chars', async () => {
    const res = await POST(req({ message: 'hola', propertyId: 'short', language: 'es' }))
    expect(res.status).toBe(400)
  })

  it('devuelve 400 cuando message > 600 caracteres', async () => {
    const res = await POST(req({ message: 'x'.repeat(601), propertyId: 'prop-test-uuid-001', language: 'es' }))
    expect(res.status).toBe(400)
  })

  it('devuelve 404 cuando la propiedad no existe en BD', async () => {
    mockFindFirst.mockResolvedValue(null)

    const res = await POST(req({
      message:    'hola',
      propertyId: 'prop-nonexistent-uuid123',
      language:   'es',
      sessionId:  'sess-404',
    }))

    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 3 — Rate limiting
// ═══════════════════════════════════════════════════════════════════════════

describe('Chatbot — rate limiting', () => {

  it('devuelve 429 cuando se supera el burst rate limit', async () => {
    mockCheckRateLimit.mockReturnValueOnce({
      allowed: false, remaining: 0, limit: 20, resetIn: 30000,
    })

    const res = await POST(req({
      message:    'hola',
      propertyId: 'prop-rate-burst-uuid123',
      language:   'es',
      sessionId:  'sess-rate-001',
    }))

    expect(res.status).toBe(429)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })

  it('devuelve 429 con limitType=hourly cuando se supera el límite horario', async () => {
    // burst pasa, hourly falla
    mockCheckRateLimit.mockReturnValueOnce(ALLOW)
    mockCheckRateLimitAsync
      .mockResolvedValueOnce({ allowed: false, remaining: 0, current: 61 })

    const res = await POST(req({
      message:    'hola',
      propertyId: 'prop-rate-hourly-uuid123',
      language:   'es',
      sessionId:  'sess-rate-002',
    }))

    expect(res.status).toBe(429)
    const body = await res.json()
    expect(body.limitType).toBe('hourly')
  })
})
