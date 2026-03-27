/**
 * Tests críticos para las APIs de notificaciones y el flujo de login
 *
 * Cubre:
 *   - GET /api/notifications/sse — SSE con autenticación
 *   - GET /api/notifications     — listado de notificaciones
 *   - PATCH /api/notifications   — marcar como leídas
 *   - POST /api/auth/login       — login con credenciales, rate limiting
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

// ---------------------------------------------------------------------------
// Mocks de dependencias externas — definidos antes de cualquier import dinámico
// ---------------------------------------------------------------------------

vi.mock('../src/lib/prisma', () => ({
  prisma: {
    notification: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    property: { count: vi.fn().mockResolvedValue(0) },
    zone: { count: vi.fn().mockResolvedValue(0) },
    reservation: { count: vi.fn().mockResolvedValue(0) },
    liquidation: { count: vi.fn().mockResolvedValue(0) },
    userInvoiceConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    propertyOwner: { findFirst: vi.fn(), update: vi.fn() },
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
  compare: vi.fn(),
  hash: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Helper: genera un JWT real con el JWT_SECRET que setup.ts inyecta en process.env
// No usa require dinámico para evitar problemas con resetModules.
// ---------------------------------------------------------------------------
function makeToken(overrides?: object): string {
  const payload = {
    userId: 'user_test_123',
    email: 'test@example.com',
    role: 'HOST',
    isAdmin: false,
    ...overrides,
  }
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' })
}

/** Crea un NextRequest con cookie auth-token */
function makeAuthRequest(
  url: string,
  options?: RequestInit & { token?: string }
): NextRequest {
  const { token, headers: extraHeaders, ...rest } = options ?? {}
  const headers: Record<string, string> = {
    ...((extraHeaders as Record<string, string>) ?? {}),
  }
  if (token) {
    headers['cookie'] = `auth-token=${token}`
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new NextRequest(url, { ...rest, headers, signal: rest.signal ?? undefined } as any)
}

// ---------------------------------------------------------------------------
// SSE endpoint — GET /api/notifications/sse
// ---------------------------------------------------------------------------

describe('GET /api/notifications/sse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devuelve 401 cuando no hay token de autenticación', async () => {
    const { GET } = await import('../app/api/notifications/sse/route')
    const req = new NextRequest('http://localhost/api/notifications/sse')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('devuelve 401 con token inválido', async () => {
    const { GET } = await import('../app/api/notifications/sse/route')
    const req = makeAuthRequest('http://localhost/api/notifications/sse', {
      token: 'invalid.token.value',
    })
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('devuelve Content-Type: text/event-stream con autenticación válida', async () => {
    const { prisma } = await import('../src/lib/prisma')
    vi.mocked(prisma.notification.count).mockResolvedValue(3)

    const { GET } = await import('../app/api/notifications/sse/route')
    const token = makeToken()
    const req = makeAuthRequest('http://localhost/api/notifications/sse', { token })
    const res = await GET(req)

    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/event-stream')
  })

  it('incluye cabeceras SSE necesarias cuando está autenticado', async () => {
    const { prisma } = await import('../src/lib/prisma')
    vi.mocked(prisma.notification.count).mockResolvedValue(0)

    const { GET } = await import('../app/api/notifications/sse/route')
    const token = makeToken()
    const req = makeAuthRequest('http://localhost/api/notifications/sse', { token })
    const res = await GET(req)

    expect(res.headers.get('Cache-Control')).toContain('no-cache')
    expect(res.headers.get('X-Accel-Buffering')).toBe('no')
    expect(res.headers.get('Connection')).toBe('keep-alive')
  })
})

// ---------------------------------------------------------------------------
// Notifications API — GET /api/notifications
// ---------------------------------------------------------------------------

describe('GET /api/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devuelve 401 sin token de autenticación', async () => {
    const { GET } = await import('../app/api/notifications/route')
    const req = new NextRequest('http://localhost/api/notifications')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('devuelve lista de notificaciones para usuario autenticado', async () => {
    const mockNotifications = [
      {
        id: 'notif_1',
        userId: 'user_test_123',
        type: 'RESERVATION',
        title: 'Nueva reserva',
        message: 'Tienes una reserva nueva',
        read: false,
        createdAt: new Date(),
        data: {},
      },
      {
        id: 'notif_2',
        userId: 'user_test_123',
        type: 'PAYMENT',
        title: 'Pago recibido',
        message: 'Pago confirmado',
        read: true,
        createdAt: new Date(),
        data: {},
      },
    ]

    const { prisma } = await import('../src/lib/prisma')
    vi.mocked(prisma.notification.findMany).mockResolvedValue(mockNotifications as any)

    const { GET } = await import('../app/api/notifications/route')
    const token = makeToken()
    const req = makeAuthRequest('http://localhost/api/notifications', { token })
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(Array.isArray(body.notifications)).toBe(true)
    expect(body.notifications).toHaveLength(2)
    expect(body.count).toBe(2)
  })

  it('devuelve array vacío si el usuario no tiene notificaciones', async () => {
    const { prisma } = await import('../src/lib/prisma')
    vi.mocked(prisma.notification.findMany).mockResolvedValue([])

    const { GET } = await import('../app/api/notifications/route')
    const token = makeToken()
    const req = makeAuthRequest('http://localhost/api/notifications', { token })
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.notifications).toEqual([])
    expect(body.count).toBe(0)
  })

  it('filtra por type cuando se pasa como query param', async () => {
    const { prisma } = await import('../src/lib/prisma')
    vi.mocked(prisma.notification.findMany).mockResolvedValue([])

    const { GET } = await import('../app/api/notifications/route')
    const token = makeToken()
    const req = makeAuthRequest(
      'http://localhost/api/notifications?type=RESERVATION',
      { token }
    )
    await GET(req)

    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'RESERVATION' }),
      })
    )
  })

  it('filtra por read=false cuando se pasa como query param', async () => {
    const { prisma } = await import('../src/lib/prisma')
    vi.mocked(prisma.notification.findMany).mockResolvedValue([])

    const { GET } = await import('../app/api/notifications/route')
    const token = makeToken()
    const req = makeAuthRequest(
      'http://localhost/api/notifications?read=false',
      { token }
    )
    await GET(req)

    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ read: false }),
      })
    )
  })
})

// ---------------------------------------------------------------------------
// Notifications API — PATCH /api/notifications
// ---------------------------------------------------------------------------

describe('PATCH /api/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devuelve 401 sin token de autenticación', async () => {
    const { PATCH } = await import('../app/api/notifications/route')
    const req = new NextRequest('http://localhost/api/notifications', {
      method: 'PATCH',
      body: JSON.stringify({ markAllAsRead: true }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await PATCH(req)
    expect(res.status).toBe(401)
  })

  it('marca todas las notificaciones como leídas con markAllAsRead', async () => {
    const { prisma } = await import('../src/lib/prisma')
    vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 5 })

    const { PATCH } = await import('../app/api/notifications/route')
    const token = makeToken()
    const req = makeAuthRequest('http://localhost/api/notifications', {
      token,
      method: 'PATCH',
      body: JSON.stringify({ markAllAsRead: true }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await PATCH(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(prisma.notification.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ read: false }),
        data: { read: true },
      })
    )
  })

  it('marca notificaciones específicas como leídas con notificationIds', async () => {
    const { prisma } = await import('../src/lib/prisma')
    vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 2 })

    const { PATCH } = await import('../app/api/notifications/route')
    const token = makeToken()
    const ids = ['notif_1', 'notif_2']
    const req = makeAuthRequest('http://localhost/api/notifications', {
      token,
      method: 'PATCH',
      body: JSON.stringify({ notificationIds: ids }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await PATCH(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(prisma.notification.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: { in: ids } }),
        data: { read: true },
      })
    )
  })

  it('devuelve 400 si no se pasan notificationIds ni markAllAsRead', async () => {
    const { PATCH } = await import('../app/api/notifications/route')
    const token = makeToken()
    const req = makeAuthRequest('http://localhost/api/notifications', {
      token,
      method: 'PATCH',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await PATCH(req)
    expect(res.status).toBe(400)
  })

  it('devuelve 400 si notificationIds no es un array', async () => {
    const { PATCH } = await import('../app/api/notifications/route')
    const token = makeToken()
    const req = makeAuthRequest('http://localhost/api/notifications', {
      token,
      method: 'PATCH',
      body: JSON.stringify({ notificationIds: 'not-an-array' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await PATCH(req)
    expect(res.status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// Auth login — POST /api/auth/login
// ---------------------------------------------------------------------------

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devuelve 400 si faltan email y password', async () => {
    const { POST } = await import('../app/api/auth/login/route')
    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }), // sin password
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.4' },
    })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toMatch(/requeridos/i)
  })

  it('devuelve 400 si sólo falta el password', async () => {
    const { POST } = await import('../app/api/auth/login/route')
    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'secret' }), // sin email
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.5' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('devuelve 401 si el usuario no existe', async () => {
    const { prisma } = await import('../src/lib/prisma')
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const { POST } = await import('../app/api/auth/login/route')
    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'noexiste@example.com', password: 'pass' }),
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.6' },
    })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.success).toBe(false)
    expect(body.error).toMatch(/inválidas/i)
  })

  it('devuelve 401 si la contraseña es incorrecta', async () => {
    const bcrypt = await import('bcryptjs')
    vi.mocked(bcrypt.default.compare).mockResolvedValue(false as never)

    const { prisma } = await import('../src/lib/prisma')
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user_abc',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed_password',
      emailVerified: true,
      status: 'ACTIVE',
      avatar: null,
      phone: null,
      isAdmin: false,
    } as any)

    const { POST } = await import('../app/api/auth/login/route')
    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'wrong_password' }),
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.7' },
    })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.success).toBe(false)
    expect(body.error).toMatch(/inválidas/i)
  })

  it('devuelve 403 si el email no está verificado', async () => {
    const bcrypt = await import('bcryptjs')
    vi.mocked(bcrypt.default.compare).mockResolvedValue(true as never)

    const { prisma } = await import('../src/lib/prisma')
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user_abc',
      name: 'Test User',
      email: 'unverified@example.com',
      password: 'hashed_password',
      emailVerified: false,
      status: 'ACTIVE',
      avatar: null,
      phone: null,
      isAdmin: false,
    } as any)

    const { POST } = await import('../app/api/auth/login/route')
    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'unverified@example.com', password: 'correct' }),
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.8' },
    })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.error).toBe('EMAIL_NOT_VERIFIED')
    expect(body.email).toBe('unverified@example.com')
  })

  it('devuelve 200 con token JWT y datos de usuario en login válido', async () => {
    const bcrypt = await import('bcryptjs')
    vi.mocked(bcrypt.default.compare).mockResolvedValue(true as never)

    const { prisma } = await import('../src/lib/prisma')
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user_abc',
      name: 'Ana García',
      email: 'ana@example.com',
      password: 'hashed_password',
      emailVerified: true,
      status: 'ACTIVE',
      avatar: null,
      phone: '+34600000000',
      isAdmin: false,
    } as any)

    const { POST } = await import('../app/api/auth/login/route')
    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'ana@example.com', password: 'correct' }),
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.1' },
    })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(typeof body.token).toBe('string')
    // JWT tiene exactamente 3 partes separadas por punto
    expect(body.token.split('.').length).toBe(3)
    expect(body.user).toMatchObject({
      id: 'user_abc',
      email: 'ana@example.com',
      name: 'Ana García',
    })
    // La respuesta no debe exponer la contraseña hasheada
    expect(body.user).not.toHaveProperty('password')
  })

  it('establece cookie auth-token HttpOnly en la respuesta tras login válido', async () => {
    const bcrypt = await import('bcryptjs')
    vi.mocked(bcrypt.default.compare).mockResolvedValue(true as never)

    const { prisma } = await import('../src/lib/prisma')
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user_cookie',
      name: 'Cookie User',
      email: 'cookie@example.com',
      password: 'hashed',
      emailVerified: true,
      status: 'ACTIVE',
      avatar: null,
      phone: null,
      isAdmin: false,
    } as any)

    const { POST } = await import('../app/api/auth/login/route')
    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'cookie@example.com', password: 'pass' }),
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.2' },
    })
    const res = await POST(req)

    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain('auth-token=')
    expect(setCookie).toContain('HttpOnly')
  })

  it('el token generado es verificable con el JWT_SECRET de entorno', async () => {
    const bcrypt = await import('bcryptjs')
    vi.mocked(bcrypt.default.compare).mockResolvedValue(true as never)

    const { prisma } = await import('../src/lib/prisma')
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user_verify',
      name: 'Verify User',
      email: 'verify@example.com',
      password: 'hashed',
      emailVerified: true,
      status: 'ACTIVE',
      avatar: null,
      phone: null,
      isAdmin: false,
    } as any)

    const { POST } = await import('../app/api/auth/login/route')
    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'verify@example.com', password: 'pass' }),
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.3' },
    })
    const res = await POST(req)
    const { token } = await res.json()

    // Verifica que el token firmado es válido y contiene el userId correcto
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    expect(decoded.userId).toBe('user_verify')
    expect(decoded.email).toBe('verify@example.com')
  })

  it('bloquea con 429 al superar el rate limit de login (5 intentos por IP)', async () => {
    const { prisma } = await import('../src/lib/prisma')
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const { POST } = await import('../app/api/auth/login/route')

    // IP única para este test — evita colisiones con otros tests en el mismo proceso
    const ip = `192.168.99.${Math.floor(Math.random() * 200) + 1}`

    const makeReq = () =>
      new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'brute@example.com', password: 'wrong' }),
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
      })

    // El límite es 5 intentos por ventana; agotarlos
    for (let i = 0; i < 5; i++) {
      await POST(makeReq())
    }

    // El 6º intento debe ser bloqueado
    const res = await POST(makeReq())
    expect(res.status).toBe(429)

    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toMatch(/intentos/i)
    expect(res.headers.get('Retry-After')).toBeTruthy()
  })
})
