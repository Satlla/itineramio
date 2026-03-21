/**
 * Tests para GET y POST /api/gestion/reservations
 * Cubre: autenticación, listado, filtros, creación, validaciones
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { signToken } from '../src/lib/auth'

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../src/lib/prisma', () => ({
  prisma: {
    reservation: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    billingUnit: {
      findFirst: vi.fn(),
    },
    propertyBillingConfig: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    property: {
      findFirst: vi.fn(),
    },
    guest: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

// Import handlers AFTER mocks are registered
import { GET, POST } from '../app/api/gestion/reservations/route'
import { prisma } from '../src/lib/prisma'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const USER_ID = 'user_test_123'
const USER_EMAIL = 'host@example.com'

function makeAuthToken(): string {
  return signToken({ userId: USER_ID, email: USER_EMAIL, role: 'HOST' })
}

function makeRequest(
  url: string,
  options: { method?: string; body?: object; authenticated?: boolean } = {}
): NextRequest {
  const { method = 'GET', body, authenticated = true } = options
  const token = authenticated ? makeAuthToken() : null

  const headers = new Headers({ 'Content-Type': 'application/json' })
  if (token) {
    headers.set('Cookie', `auth-token=${token}`)
  }

  return new NextRequest(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
}

// ─── Sample data ─────────────────────────────────────────────────────────────

const sampleReservation = {
  id: 'res_001',
  userId: USER_ID,
  guestName: 'Ana García',
  guestEmail: 'ana@example.com',
  platform: 'AIRBNB',
  status: 'CONFIRMED',
  checkIn: new Date('2026-04-01'),
  checkOut: new Date('2026-04-07'),
  nights: 6,
  hostEarnings: 600,
  roomTotal: 550,
  cleaningFee: 50,
  hostServiceFee: 0,
  billingUnit: { id: 'bu_001', name: 'Apartamento Mar', imageUrl: null, commissionValue: 20, cleaningValue: 50 },
  billingConfig: null,
  liquidation: null,
  guest: { id: 'g_001', name: 'Ana García', totalStays: 2, notes: null, tags: [] },
}

// ─── GET tests ────────────────────────────────────────────────────────────────

describe('GET /api/gestion/reservations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devuelve 401 sin autenticación', async () => {
    const req = makeRequest('http://localhost:3000/api/gestion/reservations', { authenticated: false })
    const res = await GET(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  it('devuelve array vacío cuando no hay reservas para el usuario', async () => {
    vi.mocked(prisma.reservation.findMany).mockResolvedValueOnce([])

    const req = makeRequest('http://localhost:3000/api/gestion/reservations')
    const res = await GET(req)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.reservations).toEqual([])
    expect(body.totals).toMatchObject({ count: 0, earnings: 0, nights: 0 })
  })

  it('devuelve lista de reservas con estructura correcta', async () => {
    vi.mocked(prisma.reservation.findMany).mockResolvedValueOnce([sampleReservation] as any)

    const req = makeRequest('http://localhost:3000/api/gestion/reservations')
    const res = await GET(req)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.reservations).toHaveLength(1)
    expect(body.reservations[0]).toMatchObject({ id: 'res_001', guestName: 'Ana García', platform: 'AIRBNB' })
    expect(body.totals).toMatchObject({ count: 1, confirmed: 1, pending: 0, cancelled: 0 })
  })

  it('pasa filtro de status al query de Prisma', async () => {
    vi.mocked(prisma.reservation.findMany).mockResolvedValueOnce([])

    const req = makeRequest(
      'http://localhost:3000/api/gestion/reservations?status=CONFIRMED'
    )
    const res = await GET(req)

    expect(res.status).toBe(200)
    const call = vi.mocked(prisma.reservation.findMany).mock.calls[0][0]
    expect((call as any).where.status).toBe('CONFIRMED')
  })

  it('ignora status inválido — no lo incluye en el where', async () => {
    vi.mocked(prisma.reservation.findMany).mockResolvedValueOnce([])

    const req = makeRequest(
      'http://localhost:3000/api/gestion/reservations?status=FAKE_STATUS'
    )
    const res = await GET(req)

    expect(res.status).toBe(200)
    const call = vi.mocked(prisma.reservation.findMany).mock.calls[0][0]
    expect((call as any).where.status).toBeUndefined()
  })

  it('pasa filtro de platform al query de Prisma', async () => {
    vi.mocked(prisma.reservation.findMany).mockResolvedValueOnce([])

    const req = makeRequest(
      'http://localhost:3000/api/gestion/reservations?platform=BOOKING'
    )
    const res = await GET(req)

    expect(res.status).toBe(200)
    const call = vi.mocked(prisma.reservation.findMany).mock.calls[0][0]
    expect((call as any).where.platform).toBe('BOOKING')
  })

  it('ignora platform inválida — no la incluye en el where', async () => {
    vi.mocked(prisma.reservation.findMany).mockResolvedValueOnce([])

    const req = makeRequest(
      'http://localhost:3000/api/gestion/reservations?platform=TRIPADVISOR'
    )
    const res = await GET(req)

    expect(res.status).toBe(200)
    const call = vi.mocked(prisma.reservation.findMany).mock.calls[0][0]
    expect((call as any).where.platform).toBeUndefined()
  })

  it('usa el año actual por defecto en el filtro de fecha', async () => {
    vi.mocked(prisma.reservation.findMany).mockResolvedValueOnce([])

    const req = makeRequest('http://localhost:3000/api/gestion/reservations')
    const res = await GET(req)

    expect(res.status).toBe(200)
    const call = vi.mocked(prisma.reservation.findMany).mock.calls[0][0]
    const gte: Date = (call as any).where.checkIn.gte
    expect(gte.getFullYear()).toBe(new Date().getFullYear())
  })

  it('filtra por año y mes específicos', async () => {
    vi.mocked(prisma.reservation.findMany).mockResolvedValueOnce([])

    const req = makeRequest(
      'http://localhost:3000/api/gestion/reservations?year=2026&month=4'
    )
    const res = await GET(req)

    expect(res.status).toBe(200)
    const call = vi.mocked(prisma.reservation.findMany).mock.calls[0][0]
    const gte: Date = (call as any).where.checkIn.gte
    const lt: Date = (call as any).where.checkIn.lt
    // gte = 1 Abril 2026, lt = 1 Mayo 2026
    expect(gte.getMonth()).toBe(3) // Abril (0-indexed)
    expect(gte.getFullYear()).toBe(2026)
    expect(lt.getMonth()).toBe(4) // Mayo
  })

  it('calcula totales correctamente con múltiples reservas', async () => {
    const res2 = { ...sampleReservation, id: 'res_002', status: 'PENDING', hostEarnings: 300, nights: 3 }
    vi.mocked(prisma.reservation.findMany).mockResolvedValueOnce([sampleReservation, res2] as any)

    const req = makeRequest('http://localhost:3000/api/gestion/reservations')
    const res = await GET(req)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.totals.count).toBe(2)
    expect(body.totals.earnings).toBe(900)
    expect(body.totals.nights).toBe(9)
    expect(body.totals.confirmed).toBe(1)
    expect(body.totals.pending).toBe(1)
    expect(body.totals.cancelled).toBe(0)
  })
})

// ─── POST tests ───────────────────────────────────────────────────────────────

describe('POST /api/gestion/reservations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const validBody = {
    billingUnitId: 'bu_001',
    platform: 'AIRBNB',
    guestName: 'Carlos López',
    guestEmail: 'carlos@example.com',
    checkIn: '2026-05-10',
    checkOut: '2026-05-15',
    hostEarnings: 500,
    cleaningFee: 60,
  }

  const createdReservation = {
    id: 'res_new_001',
    userId: USER_ID,
    guestName: 'Carlos López',
    platform: 'AIRBNB',
    status: 'CONFIRMED',
    nights: 5,
    hostEarnings: 500,
    billingUnit: { id: 'bu_001', name: 'Apartamento Mar', imageUrl: null },
    billingConfig: null,
    guest: { id: 'g_new_001', name: 'Carlos López', totalStays: 1, notes: null },
  }

  it('devuelve 401 sin autenticación', async () => {
    const req = makeRequest('http://localhost:3000/api/gestion/reservations', {
      method: 'POST',
      body: validBody,
      authenticated: false,
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('crea una reserva correctamente con billingUnitId', async () => {
    vi.mocked(prisma.billingUnit.findFirst).mockResolvedValueOnce({
      id: 'bu_001',
      userId: USER_ID,
      commissionValue: 20,
      cleaningValue: 60,
    } as any)

    vi.mocked(prisma.$transaction).mockImplementationOnce(async (fn: any) => {
      return fn({
        guest: {
          findUnique: vi.fn().mockResolvedValue(null),
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({ id: 'g_new_001', name: 'Carlos López', totalStays: 0 }),
          update: vi.fn().mockResolvedValue({}),
        },
        reservation: {
          create: vi.fn().mockResolvedValue(createdReservation),
          findMany: vi.fn().mockResolvedValue([createdReservation]),
        },
      })
    })

    const req = makeRequest('http://localhost:3000/api/gestion/reservations', {
      method: 'POST',
      body: validBody,
    })
    const res = await POST(req)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.reservation).toBeDefined()
    expect(body.reservation.id).toBe('res_new_001')
    expect(body.isReturningGuest).toBe(false)
  })

  it('devuelve 400 si falta billingUnitId/billingConfigId', async () => {
    const req = makeRequest('http://localhost:3000/api/gestion/reservations', {
      method: 'POST',
      body: { ...validBody, billingUnitId: undefined },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('obligatorios')
  })

  it('devuelve 400 si falta guestName', async () => {
    const req = makeRequest('http://localhost:3000/api/gestion/reservations', {
      method: 'POST',
      body: { ...validBody, guestName: undefined },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('obligatorios')
  })

  it('devuelve 400 si falta checkIn', async () => {
    const req = makeRequest('http://localhost:3000/api/gestion/reservations', {
      method: 'POST',
      body: { ...validBody, checkIn: undefined },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('obligatorios')
  })

  it('devuelve 400 si falta checkOut', async () => {
    const req = makeRequest('http://localhost:3000/api/gestion/reservations', {
      method: 'POST',
      body: { ...validBody, checkOut: undefined },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('obligatorios')
  })

  it('devuelve 400 si falta hostEarnings', async () => {
    const req = makeRequest('http://localhost:3000/api/gestion/reservations', {
      method: 'POST',
      body: { ...validBody, hostEarnings: undefined },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('obligatorios')
  })

  it('devuelve 400 si hostEarnings es negativo', async () => {
    const req = makeRequest('http://localhost:3000/api/gestion/reservations', {
      method: 'POST',
      body: { ...validBody, hostEarnings: -100 },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('positivo')
  })

  it('devuelve 400 si cleaningFee es negativo', async () => {
    const req = makeRequest('http://localhost:3000/api/gestion/reservations', {
      method: 'POST',
      body: { ...validBody, cleaningFee: -50 },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('positivo')
  })

  it('devuelve 400 si las fechas son inválidas (checkOut <= checkIn)', async () => {
    vi.mocked(prisma.billingUnit.findFirst).mockResolvedValueOnce({
      id: 'bu_001',
      userId: USER_ID,
      commissionValue: 20,
      cleaningValue: 60,
    } as any)

    const req = makeRequest('http://localhost:3000/api/gestion/reservations', {
      method: 'POST',
      body: { ...validBody, checkIn: '2026-05-15', checkOut: '2026-05-10' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('válidas')
  })

  it('devuelve 400 si checkIn y checkOut son el mismo día', async () => {
    vi.mocked(prisma.billingUnit.findFirst).mockResolvedValueOnce({
      id: 'bu_001',
      userId: USER_ID,
      commissionValue: 20,
      cleaningValue: 60,
    } as any)

    const req = makeRequest('http://localhost:3000/api/gestion/reservations', {
      method: 'POST',
      body: { ...validBody, checkIn: '2026-05-15', checkOut: '2026-05-15' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('válidas')
  })

  it('devuelve 404 si billingUnit no pertenece al usuario', async () => {
    vi.mocked(prisma.billingUnit.findFirst).mockResolvedValueOnce(null)

    const req = makeRequest('http://localhost:3000/api/gestion/reservations', {
      method: 'POST',
      body: validBody,
    })
    const res = await POST(req)
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  it('isReturningGuest es true si el huésped ya existía', async () => {
    vi.mocked(prisma.billingUnit.findFirst).mockResolvedValueOnce({
      id: 'bu_001',
      userId: USER_ID,
      commissionValue: 20,
      cleaningValue: 60,
    } as any)

    const existingGuest = { id: 'g_existing', name: 'Carlos López', email: 'carlos@example.com', phone: null, country: null, totalStays: 3, notes: 'Buen huésped' }

    vi.mocked(prisma.$transaction).mockImplementationOnce(async (fn: any) => {
      return fn({
        guest: {
          findUnique: vi.fn().mockResolvedValue(existingGuest),
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn(),
          update: vi.fn().mockResolvedValue({}),
        },
        reservation: {
          create: vi.fn().mockResolvedValue({ ...createdReservation, guestId: 'g_existing' }),
          findMany: vi.fn().mockResolvedValue([createdReservation]),
        },
      })
    })

    const req = makeRequest('http://localhost:3000/api/gestion/reservations', {
      method: 'POST',
      body: validBody,
    })
    const res = await POST(req)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.isReturningGuest).toBe(true)
    expect(body.guestHistory).toMatchObject({ totalStays: 3, notes: 'Buen huésped' })
  })
})
