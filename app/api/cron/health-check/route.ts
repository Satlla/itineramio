import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email-improved'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

// Phrases that indicate a bad chatbot response (fallback fired or AI over-redirected)
const BAD_RESPONSE_PATTERNS = [
  'revisa las secciones del manual',
  'revisa los pasos correspondientes',
  'revisa los pasos detallados',
  'te recomiendo revisar',
  'consulta el manual',
  'check the manual sections',
  'review the different manual sections',
  'contactez l\'hôte directement',
  'consultez les sections du manuel',
]

interface CheckResult {
  name: string
  ok: boolean
  detail: string
  critical: boolean
}

// ── 1. Database health ────────────────────────────────────────────────────────
async function checkDatabase(): Promise<CheckResult> {
  try {
    const start = Date.now()
    const count = await prisma.user.count()
    const ms = Date.now() - start
    if (ms > 5000) return { name: 'Base de datos', ok: false, detail: `Lenta: ${ms}ms (${count} usuarios)`, critical: true }
    return { name: 'Base de datos', ok: true, detail: `OK — ${ms}ms · ${count} usuarios`, critical: true }
  } catch (e) {
    return { name: 'Base de datos', ok: false, detail: `Error: ${e instanceof Error ? e.message : String(e)}`, critical: true }
  }
}

// ── 2. OpenAI health ──────────────────────────────────────────────────────────
async function checkOpenAI(): Promise<CheckResult> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return { name: 'OpenAI', ok: false, detail: 'OPENAI_API_KEY no configurada', critical: true }

  try {
    const start = Date.now()
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
        max_tokens: 10,
        temperature: 0,
      }),
      signal: AbortSignal.timeout(15000),
    })
    const ms = Date.now() - start
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { name: 'OpenAI', ok: false, detail: `HTTP ${res.status}: ${err?.error?.message || 'unknown'}`, critical: true }
    }
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || ''
    return { name: 'OpenAI', ok: true, detail: `OK — ${ms}ms · respuesta: "${content.slice(0, 30)}"`, critical: true }
  } catch (e) {
    return { name: 'OpenAI', ok: false, detail: `Error: ${e instanceof Error ? e.message : String(e)}`, critical: true }
  }
}

// ── 3. Stripe health ──────────────────────────────────────────────────────────
async function checkStripe(): Promise<CheckResult> {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return { name: 'Stripe', ok: false, detail: 'STRIPE_SECRET_KEY no configurada', critical: true }

  try {
    const start = Date.now()
    const res = await fetch('https://api.stripe.com/v1/balance', {
      headers: { 'Authorization': `Bearer ${key}` },
      signal: AbortSignal.timeout(10000),
    })
    const ms = Date.now() - start
    if (!res.ok) return { name: 'Stripe', ok: false, detail: `HTTP ${res.status}`, critical: true }
    return { name: 'Stripe', ok: true, detail: `OK — ${ms}ms`, critical: true }
  } catch (e) {
    return { name: 'Stripe', ok: false, detail: `Error: ${e instanceof Error ? e.message : String(e)}`, critical: true }
  }
}

// ── 4. Chatbot quality — scan recent AI responses for bad patterns ──────────
async function checkChatbotQuality(): Promise<CheckResult> {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const recentConversations = await prisma.chatbotConversation.findMany({
      where: { createdAt: { gte: oneDayAgo } },
      select: { messages: true, propertyId: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    if (recentConversations.length === 0) {
      return { name: 'Chatbot (calidad)', ok: true, detail: 'Sin conversaciones en las últimas 24h', critical: false }
    }

    let badCount = 0
    const badExamples: string[] = []

    for (const conv of recentConversations) {
      const messages = Array.isArray(conv.messages) ? conv.messages : []
      for (const msg of messages as any[]) {
        if (!msg || msg.role !== 'assistant') continue
        const content = typeof msg.content === 'string' ? msg.content.toLowerCase() : ''
        const isBad = BAD_RESPONSE_PATTERNS.some(p => content.includes(p))
        if (isBad && badExamples.length < 3) {
          badExamples.push(`[${conv.propertyId.slice(0, 8)}] "${String(msg.content).slice(0, 80)}..."`)
        }
        if (isBad) badCount++
      }
    }

    const totalResponses = recentConversations.reduce((acc, c) => {
      return acc + (Array.isArray(c.messages) ? c.messages.filter((m: any) => m.role === 'assistant').length : 0)
    }, 0)

    const badPct = totalResponses > 0 ? Math.round((badCount / totalResponses) * 100) : 0
    const isOk = badPct < 15 // alert if >15% of responses are generic redirects

    const detail = isOk
      ? `OK — ${badCount}/${totalResponses} respuestas genéricas (${badPct}%) en 24h`
      : `⚠️ ${badCount}/${totalResponses} respuestas genéricas (${badPct}%) — ejemplos:\n${badExamples.join('\n')}`

    return { name: 'Chatbot (calidad)', ok: isOk, detail, critical: false }
  } catch (e) {
    return { name: 'Chatbot (calidad)', ok: false, detail: `Error al analizar: ${e instanceof Error ? e.message : String(e)}`, critical: false }
  }
}

// ── 5. Active properties health — check for broken zones ─────────────────────
async function checkActiveProperties(): Promise<CheckResult> {
  try {
    const total = await prisma.property.count({ where: { deletedAt: null, status: 'PUBLISHED' } })
    const withZones = await prisma.property.count({
      where: { deletedAt: null, status: 'PUBLISHED', zones: { some: {} } }
    })
    const noZones = total - withZones
    const isOk = noZones < total * 0.3 // alert if >30% of published properties have no zones

    return {
      name: 'Propiedades activas',
      ok: isOk,
      detail: `${total} publicadas · ${withZones} con zonas · ${noZones} sin zonas`,
      critical: false,
    }
  } catch (e) {
    return { name: 'Propiedades activas', ok: false, detail: `Error: ${e instanceof Error ? e.message : String(e)}`, critical: false }
  }
}

// ── Build alert email ─────────────────────────────────────────────────────────
function buildHealthEmail(results: CheckResult[], allOk: boolean, timestamp: string): string {
  const statusColor = allOk ? '#22c55e' : '#ef4444'
  const statusText = allOk ? '✅ Todo en orden' : '🔴 Problemas detectados'

  const rows = results.map(r => `
    <tr style="border-bottom:1px solid #f3f4f6">
      <td style="padding:10px 16px;font-size:13px;color:#374151">${r.name}</td>
      <td style="padding:10px 16px;text-align:center">
        <span style="background:${r.ok ? '#dcfce7' : '#fee2e2'};color:${r.ok ? '#15803d' : '#991b1b'};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600">
          ${r.ok ? 'OK' : 'ERROR'}
        </span>
      </td>
      <td style="padding:10px 16px;font-size:12px;color:#6b7280;font-family:monospace;white-space:pre-wrap">${r.detail}</td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:640px;margin:0 auto;padding:24px 16px">
    <div style="background:${allOk ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#ef4444,#dc2626)'};border-radius:16px;padding:24px;margin-bottom:20px;color:#fff">
      <p style="margin:0 0 4px;font-size:11px;opacity:0.8;text-transform:uppercase;letter-spacing:1px">Health Check · ${timestamp}</p>
      <h1 style="margin:0;font-size:22px;font-weight:700">${statusText}</h1>
    </div>

    <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;margin-bottom:20px">
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#f9fafb;border-bottom:1px solid #e5e7eb">
            <th style="padding:10px 16px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px">Servicio</th>
            <th style="padding:10px 16px;text-align:center;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px">Estado</th>
            <th style="padding:10px 16px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px">Detalle</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <p style="text-align:center;font-size:11px;color:#d1d5db">Itineramio Health Check · automático cada 6h</p>
  </div>
</body>
</html>`
}

// ── Main cron handler ─────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const timestamp = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })

  // Run all checks in parallel
  const results = await Promise.all([
    checkDatabase(),
    checkOpenAI(),
    checkStripe(),
    checkChatbotQuality(),
    checkActiveProperties(),
  ])

  const allOk = results.every(r => r.ok)
  const criticalFailed = results.filter(r => !r.ok && r.critical)
  const hasIssues = !allOk

  // Only send email if there are issues (or force with ?force=1 for testing)
  const forceEmail = req.nextUrl.searchParams.get('force') === '1'
  const adminEmail = process.env.ADMIN_EMAIL || 'alejandrosatlla@gmail.com'

  if (hasIssues || forceEmail) {
    await sendEmail({
      to: [adminEmail],
      subject: allOk
        ? `✅ Itineramio Health Check — Todo OK · ${timestamp}`
        : `🔴 Itineramio Health Check — ${criticalFailed.length} problema(s) crítico(s) · ${timestamp}`,
      html: buildHealthEmail(results, allOk, timestamp),
    }).catch(() => { /* non-critical */ })
  }

  return NextResponse.json({
    ok: allOk,
    timestamp,
    checks: results.map(r => ({ name: r.name, ok: r.ok, detail: r.detail, critical: r.critical })),
  })
}
