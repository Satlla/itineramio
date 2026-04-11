import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email-improved'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL?.replace('localhost:3000', 'itineramio.com') || 'https://itineramio.com'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'alejandrosatlla@gmail.com'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Severity = 'critical' | 'warning' | 'info'

interface CheckResult {
  name: string
  ok: boolean
  detail: string
  severity: Severity
  ms?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────
async function timed<T>(fn: () => Promise<T>): Promise<{ result: T; ms: number }> {
  const start = Date.now()
  const result = await fn()
  return { result, ms: Date.now() - start }
}

async function fetchWithTimeout(url: string, opts: RequestInit = {}, timeoutMs = 10000) {
  return fetch(url, { ...opts, signal: AbortSignal.timeout(timeoutMs) })
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. BASE DE DATOS
// ─────────────────────────────────────────────────────────────────────────────
async function checkDatabase(): Promise<CheckResult> {
  try {
    const { ms } = await timed(() => prisma.user.count())
    if (ms > 5000) return { name: 'Base de datos', ok: false, detail: `Lenta: ${ms}ms`, severity: 'critical', ms }
    if (ms > 2000) return { name: 'Base de datos', ok: false, detail: `Degradada: ${ms}ms`, severity: 'warning', ms }
    return { name: 'Base de datos', ok: true, detail: `OK — ${ms}ms`, severity: 'critical', ms }
  } catch (e) {
    return { name: 'Base de datos', ok: false, detail: `Error: ${e instanceof Error ? e.message : String(e)}`, severity: 'critical' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. OPENAI
// ─────────────────────────────────────────────────────────────────────────────
async function checkOpenAI(): Promise<CheckResult> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return { name: 'OpenAI', ok: false, detail: 'API key no configurada', severity: 'critical' }
  try {
    const { ms } = await timed(() => fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'OK' }], max_tokens: 5 }),
    }))
    if (ms > 8000) return { name: 'OpenAI', ok: false, detail: `Lento: ${ms}ms`, severity: 'warning', ms }
    return { name: 'OpenAI', ok: true, detail: `OK — ${ms}ms`, severity: 'critical', ms }
  } catch (e) {
    return { name: 'OpenAI', ok: false, detail: `Error: ${e instanceof Error ? e.message : String(e)}`, severity: 'critical' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ANTHROPIC (IA wizard zonas)
// ─────────────────────────────────────────────────────────────────────────────
async function checkAnthropic(): Promise<CheckResult> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return { name: 'Anthropic (IA zonas)', ok: false, detail: 'API key no configurada', severity: 'critical' }
  try {
    const { result, ms } = await timed(() => fetchWithTimeout('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Reply OK' }],
      }),
    }))
    if (!result.ok) return { name: 'Anthropic (IA zonas)', ok: false, detail: `HTTP ${result.status}`, severity: 'critical', ms }
    return { name: 'Anthropic (IA zonas)', ok: true, detail: `OK — ${ms}ms`, severity: 'critical', ms }
  } catch (e) {
    return { name: 'Anthropic (IA zonas)', ok: false, detail: `Error: ${e instanceof Error ? e.message : String(e)}`, severity: 'critical' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. STRIPE
// ─────────────────────────────────────────────────────────────────────────────
async function checkStripe(): Promise<CheckResult> {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return { name: 'Stripe', ok: false, detail: 'API key no configurada', severity: 'critical' }
  try {
    const { result, ms } = await timed(() => fetchWithTimeout('https://api.stripe.com/v1/balance', {
      headers: { Authorization: `Bearer ${key}` },
    }))
    if (!result.ok) return { name: 'Stripe', ok: false, detail: `HTTP ${result.status}`, severity: 'critical', ms }
    return { name: 'Stripe', ok: true, detail: `OK — ${ms}ms`, severity: 'critical', ms }
  } catch (e) {
    return { name: 'Stripe', ok: false, detail: `Error: ${e instanceof Error ? e.message : String(e)}`, severity: 'critical' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. RESEND (email transaccional)
// ─────────────────────────────────────────────────────────────────────────────
async function checkResend(): Promise<CheckResult> {
  const key = process.env.RESEND_API_KEY
  if (!key) return { name: 'Resend (emails)', ok: false, detail: 'API key no configurada', severity: 'critical' }
  try {
    const { result, ms } = await timed(() => fetchWithTimeout('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${key}` },
    }))
    if (!result.ok) return { name: 'Resend (emails)', ok: false, detail: `HTTP ${result.status}`, severity: 'critical', ms }
    return { name: 'Resend (emails)', ok: true, detail: `OK — ${ms}ms`, severity: 'critical', ms }
  } catch (e) {
    return { name: 'Resend (emails)', ok: false, detail: `Error: ${e instanceof Error ? e.message : String(e)}`, severity: 'critical' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. RENDIMIENTO: Landing page
// ─────────────────────────────────────────────────────────────────────────────
async function checkLandingPerformance(): Promise<CheckResult> {
  try {
    const { result, ms } = await timed(() => fetchWithTimeout(APP_URL, {}, 15000))
    if (!result.ok) return { name: 'Landing (rendimiento)', ok: false, detail: `HTTP ${result.status} — ${ms}ms`, severity: 'critical', ms }
    if (ms > 5000) return { name: 'Landing (rendimiento)', ok: false, detail: `Muy lenta: ${ms}ms`, severity: 'critical', ms }
    if (ms > 3000) return { name: 'Landing (rendimiento)', ok: false, detail: `Lenta: ${ms}ms`, severity: 'warning', ms }
    return { name: 'Landing (rendimiento)', ok: true, detail: `OK — ${ms}ms`, severity: 'critical', ms }
  } catch (e) {
    return { name: 'Landing (rendimiento)', ok: false, detail: `Error: ${e instanceof Error ? e.message : String(e)}`, severity: 'critical' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. RENDIMIENTO: Guía pública
// ─────────────────────────────────────────────────────────────────────────────
async function checkGuidePerformance(): Promise<CheckResult> {
  try {
    // Find a published property with a slug
    const property = await prisma.property.findFirst({
      where: { isPublished: true, deletedAt: null, isDemoPreview: false },
      select: { slug: true },
    })

    if (!property?.slug) {
      return { name: 'Guía pública (rendimiento)', ok: true, detail: 'Sin propiedades publicadas para testear', severity: 'info' }
    }

    const guideUrl = `${APP_URL}/guide/${property.slug}`
    const { result, ms } = await timed(() => fetchWithTimeout(guideUrl, {}, 15000))

    if (!result.ok) return { name: 'Guía pública (rendimiento)', ok: false, detail: `HTTP ${result.status} — ${ms}ms — ${guideUrl}`, severity: 'critical', ms }
    if (ms > 5000) return { name: 'Guía pública (rendimiento)', ok: false, detail: `Muy lenta: ${ms}ms`, severity: 'critical', ms }
    if (ms > 3000) return { name: 'Guía pública (rendimiento)', ok: false, detail: `Lenta: ${ms}ms`, severity: 'warning', ms }
    return { name: 'Guía pública (rendimiento)', ok: true, detail: `OK — ${ms}ms — /guide/${property.slug}`, severity: 'critical', ms }
  } catch (e) {
    return { name: 'Guía pública (rendimiento)', ok: false, detail: `Error: ${e instanceof Error ? e.message : String(e)}`, severity: 'critical' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. USUARIOS ATASCADOS en PENDING
// ─────────────────────────────────────────────────────────────────────────────
async function checkPendingUsers(): Promise<CheckResult> {
  try {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000)
    const stuck = await prisma.user.count({
      where: { status: 'PENDING', emailVerified: null, createdAt: { lt: cutoff } },
    })
    if (stuck > 10) return { name: 'Usuarios PENDING (+48h)', ok: false, detail: `${stuck} usuarios atascados sin verificar — posible fallo en email de verificación`, severity: 'critical' }
    if (stuck > 3) return { name: 'Usuarios PENDING (+48h)', ok: false, detail: `${stuck} usuarios atascados sin verificar`, severity: 'warning' }
    return { name: 'Usuarios PENDING (+48h)', ok: true, detail: `OK — ${stuck} usuarios atascados`, severity: 'warning' }
  } catch (e) {
    return { name: 'Usuarios PENDING (+48h)', ok: false, detail: `Error: ${e instanceof Error ? e.message : String(e)}`, severity: 'warning' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. TRIALS EXPIRADOS SIN PROCESAR
// ─────────────────────────────────────────────────────────────────────────────
async function checkExpiredTrials(): Promise<CheckResult> {
  try {
    const now = new Date()
    const expiredNotSuspended = await prisma.property.count({
      where: {
        status: 'TRIAL',
        trialEndsAt: { lte: now },
        deletedAt: null,
      },
    })
    if (expiredNotSuspended > 0) return {
      name: 'Trials expirados sin procesar',
      ok: false,
      detail: `${expiredNotSuspended} propiedad(es) con trial expirado pero aún en estado TRIAL — cron check-trials puede estar fallando`,
      severity: 'critical',
    }
    return { name: 'Trials expirados sin procesar', ok: true, detail: 'OK — todos los trials procesados', severity: 'critical' }
  } catch (e) {
    return { name: 'Trials expirados sin procesar', ok: false, detail: `Error: ${e instanceof Error ? e.message : String(e)}`, severity: 'critical' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. PROPIEDADES PUBLICADAS SIN ZONAS
// ─────────────────────────────────────────────────────────────────────────────
async function checkPublishedWithoutZones(): Promise<CheckResult> {
  try {
    const total = await prisma.property.count({ where: { isPublished: true, deletedAt: null } })
    const withZones = await prisma.property.count({
      where: { isPublished: true, deletedAt: null, zones: { some: { status: 'ACTIVE' } } },
    })
    const noZones = total - withZones
    const pct = total > 0 ? Math.round((noZones / total) * 100) : 0

    if (pct > 30) return { name: 'Publicadas sin zonas activas', ok: false, detail: `${noZones}/${total} propiedades publicadas sin zonas (${pct}%)`, severity: 'warning' }
    return { name: 'Publicadas sin zonas activas', ok: true, detail: `${noZones}/${total} sin zonas (${pct}%) — ${withZones} correctas`, severity: 'warning' }
  } catch (e) {
    return { name: 'Publicadas sin zonas activas', ok: false, detail: `Error: ${e instanceof Error ? e.message : String(e)}`, severity: 'warning' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. ZONAS CON PLACEHOLDERS SIN RELLENAR
// ─────────────────────────────────────────────────────────────────────────────
async function checkPlaceholders(): Promise<CheckResult> {
  const PLACEHOLDER_REGEX = /\[NOMBRE\]|\[NAME\]|\[X\]|\[DESTINO\]|\[NÚMERO\]|\[UBICACIÓN\]|\[COLOR\]|\[APP_NAME\]/i
  try {
    const activeZones = await prisma.zone.findMany({
      where: { status: 'ACTIVE' },
      include: { steps: { select: { content: true } } },
      take: 500,
    })

    let count = 0
    for (const zone of activeZones) {
      for (const step of (zone as any).steps ?? []) {
        if (PLACEHOLDER_REGEX.test(JSON.stringify(step.content || ''))) { count++; break }
      }
    }

    if (count > 5) return { name: 'Zonas con placeholders', ok: false, detail: `${count} zonas activas con [NOMBRE] u otros placeholders sin rellenar`, severity: 'warning' }
    return { name: 'Zonas con placeholders', ok: true, detail: `OK — ${count} zonas con placeholders pendientes`, severity: 'warning' }
  } catch (e) {
    return { name: 'Zonas con placeholders', ok: false, detail: `Error: ${e instanceof Error ? e.message : String(e)}`, severity: 'warning' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. SALUD DEL EMAIL — últimas 24h
// ─────────────────────────────────────────────────────────────────────────────
async function checkEmailHealth(): Promise<CheckResult> {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const [totalSent, totalBounced, lastSent] = await Promise.all([
      prisma.emailEvent.count({ where: { eventType: 'SENT', sentAt: { gte: oneDayAgo } } }),
      prisma.emailEvent.count({ where: { eventType: 'BOUNCED', sentAt: { gte: oneDayAgo } } }),
      prisma.emailEvent.findFirst({ where: { eventType: 'SENT' }, orderBy: { sentAt: 'desc' }, select: { sentAt: true } }),
    ])

    const bouncePct = totalSent > 0 ? Math.round((totalBounced / totalSent) * 100) : 0
    const lastSentAgo = lastSent?.sentAt
      ? Math.round((Date.now() - lastSent.sentAt.getTime()) / 1000 / 60)
      : null

    if (bouncePct > 10) return {
      name: 'Salud del email (24h)',
      ok: false,
      detail: `Tasa de rebotes alta: ${totalBounced}/${totalSent} (${bouncePct}%) — posible problema con dominio`,
      severity: 'critical',
    }

    const lastStr = lastSentAgo !== null ? ` · último email hace ${lastSentAgo}min` : ' · sin emails registrados'
    return {
      name: 'Salud del email (24h)',
      ok: true,
      detail: `${totalSent} enviados · ${totalBounced} rebotes (${bouncePct}%)${lastStr}`,
      severity: 'warning',
    }
  } catch (e) {
    return { name: 'Salud del email (24h)', ok: false, detail: `Error: ${e instanceof Error ? e.message : String(e)}`, severity: 'warning' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. SECUENCIAS DE EMAIL — ¿se están enviando?
// ─────────────────────────────────────────────────────────────────────────────
async function checkEmailSequences(): Promise<CheckResult> {
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

    const [day3, day7] = await Promise.all([
      prisma.notification.findFirst({
        where: { type: 'EMAIL_SEQUENCE_DAY3', createdAt: { gte: threeDaysAgo } },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      prisma.notification.findFirst({
        where: { type: 'EMAIL_SEQUENCE_DAY7', createdAt: { gte: threeDaysAgo } },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ])

    // Check if cron ran in last 25h
    const cronLastRun = await prisma.notification.findFirst({
      where: {
        type: { in: ['EMAIL_SEQUENCE_DAY3', 'EMAIL_SEQUENCE_DAY7'] },
      },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    })

    // Only alert if there are eligible users and no sequences sent
    const eligibleUsers = await prisma.user.count({
      where: {
        emailVerified: { not: null },
        status: 'ACTIVE',
        createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), lte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      },
    })

    if (eligibleUsers > 0 && !cronLastRun) {
      return {
        name: 'Secuencias de email',
        ok: false,
        detail: `${eligibleUsers} usuarios elegibles pero sin secuencias enviadas en 3 días — revisar cron email-sequence`,
        severity: 'warning',
      }
    }

    const lastRun = cronLastRun?.createdAt
    const lastRunAgo = lastRun ? Math.round((Date.now() - lastRun.getTime()) / 1000 / 60 / 60) : null
    return {
      name: 'Secuencias de email',
      ok: true,
      detail: `OK — Day3: ${day3 ? 'activo' : 'sin envíos recientes'} · Day7: ${day7 ? 'activo' : 'sin envíos recientes'}${lastRunAgo !== null ? ` · último envío hace ${lastRunAgo}h` : ''}`,
      severity: 'warning',
    }
  } catch (e) {
    return { name: 'Secuencias de email', ok: false, detail: `Error: ${e instanceof Error ? e.message : String(e)}`, severity: 'warning' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. CHATBOT — calidad de respuestas (últimas 24h)
// ─────────────────────────────────────────────────────────────────────────────
const BAD_PATTERNS = [
  'revisa las secciones del manual',
  'revisa los pasos correspondientes',
  'revisa los pasos detallados',
  'te recomiendo revisar',
  'consulta el manual',
  'check the manual sections',
  'review the different manual sections',
  'contactez l\'hôte directement',
  'consultez les sections du manuel',
  'no tengo información',
  'no dispongo de información',
  'no puedo responder',
]

async function checkChatbotQuality(): Promise<CheckResult> {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const conversations = await prisma.chatbotConversation.findMany({
      where: { createdAt: { gte: oneDayAgo } },
      select: { messages: true, propertyId: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    if (conversations.length === 0) {
      return { name: 'Chatbot (calidad 24h)', ok: true, detail: 'Sin conversaciones en las últimas 24h', severity: 'info' }
    }

    let totalResponses = 0
    let badCount = 0
    const badExamples: string[] = []
    const unansweredSet = new Set<string>()

    for (const conv of conversations) {
      const messages = Array.isArray(conv.messages) ? conv.messages : []
      for (const msg of messages as any[]) {
        if (!msg || msg.role !== 'assistant') continue
        totalResponses++
        const content = typeof msg.content === 'string' ? msg.content.toLowerCase() : ''
        const isBad = BAD_PATTERNS.some(p => content.includes(p))
        if (isBad) {
          badCount++
          if (badExamples.length < 2) badExamples.push(`"${String(msg.content).slice(0, 100)}..."`)
        }
      }
      // Check unanswered questions
      if (Array.isArray((conv as any).unansweredQuestions)) {
        for (const q of (conv as any).unansweredQuestions) {
          if (typeof q === 'string') unansweredSet.add(q)
        }
      }
    }

    const badPct = totalResponses > 0 ? Math.round((badCount / totalResponses) * 100) : 0
    const unanswered = unansweredSet.size

    let detail = `${conversations.length} conv · ${totalResponses} respuestas · ${badPct}% genéricas`
    if (unanswered > 0) detail += ` · ${unanswered} preguntas sin responder`
    if (badExamples.length > 0) detail += `\nEjemplos: ${badExamples.join(' | ')}`

    if (badPct > 20) return { name: 'Chatbot (calidad 24h)', ok: false, detail, severity: 'critical' }
    if (badPct > 10) return { name: 'Chatbot (calidad 24h)', ok: false, detail, severity: 'warning' }
    return { name: 'Chatbot (calidad 24h)', ok: true, detail, severity: 'critical' }
  } catch (e) {
    return { name: 'Chatbot (calidad 24h)', ok: false, detail: `Error: ${e instanceof Error ? e.message : String(e)}`, severity: 'critical' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. CHATBOT — test en vivo con propiedad real
// ─────────────────────────────────────────────────────────────────────────────
async function checkChatbotLive(): Promise<CheckResult> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return { name: 'Chatbot (test en vivo)', ok: false, detail: 'OpenAI key no configurada', severity: 'critical' }

  try {
    // Find a published property with zones and steps
    const property = await prisma.property.findFirst({
      where: { isPublished: true, deletedAt: null, isDemoPreview: false },
      include: {
        zones: {
          where: { status: 'ACTIVE' },
          include: { steps: { take: 3 } },
          take: 3,
        },
      },
    })

    if (!property || property.zones.length === 0) {
      return { name: 'Chatbot (test en vivo)', ok: true, detail: 'Sin propiedades con zonas para testear', severity: 'info' }
    }

    // Build a mini context from the property
    const context = property.zones.map(zone => {
      const zoneName = typeof zone.name === 'object' ? ((zone.name as any).es || Object.values(zone.name as object)[0]) : String(zone.name)
      const stepsText = zone.steps.map(s => {
        const content = typeof s.content === 'object' ? JSON.stringify((s.content as any).es || s.content) : String(s.content || '')
        return content.slice(0, 200)
      }).join(' | ')
      return `${zoneName}: ${stepsText}`
    }).join('\n')

    const testQuestion = 'How do I get the WiFi password?'

    const { result, ms } = await timed(() => fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres el asistente virtual del alojamiento "${typeof property.name === 'string' ? property.name : ''}". Usa SOLO la información siguiente para responder. Si no está en la información, di exactamente "NO_INFO".\n\nInformación:\n${context}`,
          },
          { role: 'user', content: testQuestion },
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    }, 20000))

    if (!result.ok) {
      return { name: 'Chatbot (test en vivo)', ok: false, detail: `OpenAI respondió HTTP ${result.status} — ${ms}ms`, severity: 'critical', ms }
    }

    const data = await result.json()
    const reply = data.choices?.[0]?.message?.content || ''
    const isGeneric = BAD_PATTERNS.some(p => reply.toLowerCase().includes(p))

    if (isGeneric) {
      return {
        name: 'Chatbot (test en vivo)',
        ok: false,
        detail: `Respuesta genérica detectada — ${ms}ms: "${reply.slice(0, 100)}"`,
        severity: 'warning',
        ms,
      }
    }

    return {
      name: 'Chatbot (test en vivo)',
      ok: true,
      detail: `OK — ${ms}ms · propiedad: ${property.name} · respuesta: "${reply.slice(0, 80)}..."`,
      severity: 'critical',
      ms,
    }
  } catch (e) {
    return { name: 'Chatbot (test en vivo)', ok: false, detail: `Error: ${e instanceof Error ? e.message : String(e)}`, severity: 'critical' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. MÉTRICAS GENERALES (info)
// ─────────────────────────────────────────────────────────────────────────────
async function checkMetrics(): Promise<CheckResult> {
  try {
    const now = new Date()
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const [totalUsers, activeUsers, totalProperties, publishedProperties, newRegistrations, trialsActive] = await Promise.all([
      prisma.user.count({ where: { status: { not: 'SUSPENDED' } } }),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.property.count({ where: { deletedAt: null } }),
      prisma.property.count({ where: { isPublished: true, deletedAt: null } }),
      prisma.user.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.property.count({ where: { status: 'TRIAL', trialEndsAt: { gte: now }, deletedAt: null } }),
    ])

    return {
      name: 'Métricas generales',
      ok: true,
      detail: `Usuarios: ${totalUsers} total · ${activeUsers} activos · ${newRegistrations} nuevos hoy | Propiedades: ${totalProperties} total · ${publishedProperties} publicadas · ${trialsActive} en trial`,
      severity: 'info',
    }
  } catch (e) {
    return { name: 'Métricas generales', ok: true, detail: `No disponible: ${e instanceof Error ? e.message : String(e)}`, severity: 'info' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Email HTML builder
// ─────────────────────────────────────────────────────────────────────────────
function buildEmail(results: CheckResult[], timestamp: string): string {
  const criticalFailed = results.filter(r => !r.ok && r.severity === 'critical')
  const warnings = results.filter(r => !r.ok && r.severity === 'warning')
  const allOk = criticalFailed.length === 0

  const headerColor = allOk
    ? (warnings.length > 0 ? '#f59e0b' : '#22c55e')
    : '#ef4444'
  const headerText = allOk
    ? (warnings.length > 0 ? `⚠️ ${warnings.length} advertencia(s)` : '✅ Todo en orden')
    : `🔴 ${criticalFailed.length} error(es) crítico(s)`

  const severityColors: Record<Severity, string> = {
    critical: '#fee2e2',
    warning: '#fef9c3',
    info: '#f0f9ff',
  }

  const rows = results.map(r => {
    const rowBg = r.ok ? 'transparent' : severityColors[r.severity]
    const badge = r.ok
      ? '<span style="background:#dcfce7;color:#15803d;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">OK</span>'
      : r.severity === 'critical'
        ? '<span style="background:#fee2e2;color:#991b1b;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">ERROR</span>'
        : '<span style="background:#fef9c3;color:#854d0e;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">WARN</span>'
    const msStr = r.ms !== undefined ? ` <span style="color:#9ca3af;font-size:11px">(${r.ms}ms)</span>` : ''

    return `
    <tr style="background:${rowBg};border-bottom:1px solid #f3f4f6">
      <td style="padding:10px 16px;font-size:13px;color:#374151;font-weight:500">${r.name}${msStr}</td>
      <td style="padding:10px 16px;text-align:center;white-space:nowrap">${badge}</td>
      <td style="padding:10px 16px;font-size:12px;color:#6b7280;font-family:monospace;white-space:pre-wrap;word-break:break-word;max-width:420px">${r.detail}</td>
    </tr>`
  }).join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:760px;margin:0 auto;padding:24px 16px">

  <div style="background:linear-gradient(135deg,${headerColor},${headerColor}cc);border-radius:16px;padding:28px 32px;margin-bottom:24px;color:#fff">
    <p style="margin:0 0 4px;font-size:11px;opacity:0.75;text-transform:uppercase;letter-spacing:1.5px">Itineramio Health Check · ${timestamp}</p>
    <h1 style="margin:0;font-size:24px;font-weight:800">${headerText}</h1>
    ${warnings.length > 0 && allOk ? `<p style="margin:8px 0 0;font-size:14px;opacity:0.85">${warnings.length} advertencia(s) — no crítico pero revisar</p>` : ''}
  </div>

  <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;margin-bottom:20px">
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb">
          <th style="padding:10px 16px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;width:28%">Check</th>
          <th style="padding:10px 16px;text-align:center;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;width:8%">Estado</th>
          <th style="padding:10px 16px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px">Detalle</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>

  <p style="text-align:center;font-size:11px;color:#d1d5db;margin:0">
    Itineramio Health Check · diario 8:00 AM ·
    <a href="${APP_URL}" style="color:#7c3aed;text-decoration:none">itineramio.com</a>
  </p>
</div>
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const timestamp = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })
  const forceEmail = req.nextUrl.searchParams.get('force') === '1'

  // Run all checks in parallel (grouped by dependency)
  const [
    db, openai, anthropic, stripe, resend,
    landing, guide,
    pendingUsers, expiredTrials, noZones, placeholders,
    emailHealth, sequences,
    chatbotQuality, chatbotLive,
    metrics,
  ] = await Promise.all([
    checkDatabase(),
    checkOpenAI(),
    checkAnthropic(),
    checkStripe(),
    checkResend(),
    checkLandingPerformance(),
    checkGuidePerformance(),
    checkPendingUsers(),
    checkExpiredTrials(),
    checkPublishedWithoutZones(),
    checkPlaceholders(),
    checkEmailHealth(),
    checkEmailSequences(),
    checkChatbotQuality(),
    checkChatbotLive(),
    checkMetrics(),
  ])

  const results: CheckResult[] = [
    db, openai, anthropic, stripe, resend,
    landing, guide,
    pendingUsers, expiredTrials, noZones, placeholders,
    emailHealth, sequences,
    chatbotQuality, chatbotLive,
    metrics,
  ]

  const criticalFailed = results.filter(r => !r.ok && r.severity === 'critical')
  const warnings = results.filter(r => !r.ok && r.severity === 'warning')
  const hasIssues = criticalFailed.length > 0 || warnings.length > 0

  if (hasIssues || forceEmail) {
    await sendEmail({
      to: [ADMIN_EMAIL],
      subject: criticalFailed.length > 0
        ? `🔴 Itineramio Health — ${criticalFailed.length} error(es) crítico(s) · ${timestamp}`
        : `⚠️ Itineramio Health — ${warnings.length} advertencia(s) · ${timestamp}`,
      html: buildEmail(results, timestamp),
    }).catch(() => { /* non-critical */ })
  } else if (forceEmail) {
    await sendEmail({
      to: [ADMIN_EMAIL],
      subject: `✅ Itineramio Health — Todo en orden · ${timestamp}`,
      html: buildEmail(results, timestamp),
    }).catch(() => { /* non-critical */ })
  }

  return NextResponse.json({
    ok: criticalFailed.length === 0,
    timestamp,
    summary: {
      critical: criticalFailed.length,
      warnings: warnings.length,
      total: results.length,
    },
    checks: results.map(r => ({ name: r.name, ok: r.ok, severity: r.severity, detail: r.detail, ms: r.ms })),
  })
}
