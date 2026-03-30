import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email-improved'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

// ── Topic keywords for rule-based classification ────────────────────────────
const TOPIC_PATTERNS: Record<string, RegExp> = {
  'Check-in / Entrada':     /\b(check.?in|entrada|llegada|llave|key|codigo|code|puerta|door|acceso)\b/i,
  'Check-out / Salida':     /\b(check.?out|salida|irse|departure|dejar|leaving|marcharse)\b/i,
  'WiFi':                   /\b(wifi|wi.fi|internet|contraseña|password|red|network)\b/i,
  'Restaurantes / Comer':   /\b(restaurante|comer|cenar|almorzar|food|eat|dinner|lunch|tapas|comida)\b/i,
  'Transporte / Parking':   /\b(parking|aparcamiento|taxi|metro|bus|transporte|coche|car|uber)\b/i,
  'Actividades / Turismo':  /\b(visitar|museo|monumento|actividad|turismo|ver|hacer|sightseeing)\b/i,
  'Ocio nocturno / Copas':  /\b(copa|copas|bar|cocteles|marcha|discoteca|noche|nightlife|club)\b/i,
  'Supermercado / Compras': /\b(supermercado|compras|tienda|mercado|shopping|comprar)\b/i,
  'Climatización':          /\b(aire acondicionado|calefaccion|frio|calor|ac|heating|fan|ventilador)\b/i,
  'Limpieza / Utensilios':  /\b(toallas|toalla|limpieza|fregona|escoba|detergente|limpiar|plancha)\b/i,
  'Emergencia / Problema':  /\b(problema|emergencia|urgente|roto|falla|no funciona|averia|broken)\b/i,
}

// ── Guest profile extraction from raw messages ──────────────────────────────
function detectGuestSignals(messages: any[]): {
  type: string | null
  hasKids: boolean
  language: string | null
  foodPref: string | null
} {
  const text = messages
    .filter(m => m.role === 'user')
    .map(m => (typeof m.content === 'string' ? m.content : ''))
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  let type: string | null = null
  if (/\b(pareja|couple|romantic|aniversario|anniversary|honeymoon)\b/.test(text)) type = 'pareja'
  else if (/\b(familia|family|hijos|ninos|kids|children)\b/.test(text)) type = 'familia'
  else if (/\b(amigos|friends|grupo)\b/.test(text)) type = 'amigos'

  const hasKids = /\b(ninos|ninas|hijos|hijas|kids|children|bebes|bebe)\b/.test(text)

  // Detect dominant language from first user message
  const firstMsg = messages.find(m => m.role === 'user')?.content || ''
  const language =
    /[àáâãäåçèéêëìíîïñòóôõöùúûü]/.test(firstMsg.toLowerCase()) && !/\b(the|and|is|are|was)\b/i.test(firstMsg)
      ? 'es'
      : /\b(the|and|is|are|was|can|how|where|what)\b/i.test(firstMsg)
      ? 'en'
      : null

  let foodPref: string | null = null
  if (/\b(vegetarian|vegetariano|vegano|vegan)\b/.test(text)) foodPref = 'vegetariano/vegano'
  else if (/\b(marisco|seafood|pescado)\b/.test(text)) foodPref = 'marisco/pescado'
  else if (/\b(gourmet|lujo|luxury|fine dining)\b/.test(text)) foodPref = 'gourmet'
  else if (/\b(economico|barato|cheap|budget)\b/.test(text)) foodPref = 'económico'

  return { type, hasKids, language, foodPref }
}

// ── Count topics from a list of conversations ────────────────────────────────
function countTopics(conversations: any[]): Array<{ topic: string; count: number }> {
  const counts: Record<string, number> = {}
  for (const conv of conversations) {
    const msgs = Array.isArray(conv.messages) ? conv.messages : []
    const userText = msgs
      .filter((m: any) => m.role === 'user')
      .map((m: any) => (typeof m.content === 'string' ? m.content : ''))
      .join(' ')

    for (const [topic, pattern] of Object.entries(TOPIC_PATTERNS)) {
      if (pattern.test(userText)) {
        counts[topic] = (counts[topic] || 0) + 1
      }
    }
  }
  return Object.entries(counts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
}

// ── Aggregate guest profiles across conversations ────────────────────────────
function aggregateProfiles(conversations: any[]): {
  couples: number; families: number; groups: number; unknown: number
  withKids: number; languages: Record<string, number>; foodPrefs: string[]
} {
  let couples = 0, families = 0, groups = 0, unknown = 0, withKids = 0
  const languages: Record<string, number> = {}
  const foodPrefsSet = new Set<string>()

  for (const conv of conversations) {
    const signals = detectGuestSignals(Array.isArray(conv.messages) ? conv.messages : [])
    if (signals.type === 'pareja') couples++
    else if (signals.type === 'familia') families++
    else if (signals.type === 'amigos') groups++
    else unknown++
    if (signals.hasKids) withKids++
    const lang = conv.language || signals.language || 'es'
    languages[lang] = (languages[lang] || 0) + 1
    if (signals.foodPref) foodPrefsSet.add(signals.foodPref)
  }

  return { couples, families, groups, unknown, withKids, languages, foodPrefs: [...foodPrefsSet] }
}

// ── Collect unanswered questions (deduplicated) ──────────────────────────────
function collectUnanswered(conversations: any[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const conv of conversations) {
    const items = Array.isArray(conv.unansweredQuestions) ? conv.unansweredQuestions : []
    for (const q of items) {
      const text = (typeof q === 'string' ? q : q.question || q.text || '').trim()
      const key = text.toLowerCase().slice(0, 60)
      if (text && !seen.has(key)) {
        seen.add(key)
        result.push(text)
      }
    }
  }
  return result.slice(0, 10)
}

// ── Generate AI narrative summary ────────────────────────────────────────────
async function generateAISummary(
  propertyName: string,
  profiles: ReturnType<typeof aggregateProfiles>,
  topTopics: Array<{ topic: string; count: number }>,
  unanswered: string[],
  totalConversations: number
): Promise<{ narrative: string; gaps: string[] }> {
  const openaiApiKey = process.env.OPENAI_API_KEY
  if (!openaiApiKey) return { narrative: '', gaps: [] }

  const profileText = [
    profiles.couples > 0 ? `${profiles.couples} parejas` : '',
    profiles.families > 0 ? `${profiles.families} familias` : '',
    profiles.groups > 0 ? `${profiles.groups} grupos de amigos` : '',
    profiles.withKids > 0 ? `${profiles.withKids} con niños` : '',
  ].filter(Boolean).join(', ') || 'perfil mixto'

  const topicsText = topTopics.map(t => `${t.topic} (${t.count}x)`).join(', ')
  const unansweredText = unanswered.slice(0, 5).map(q => `"${q.slice(0, 100)}"`).join('\n')

  const promptContent = `Eres el asistente de análisis de Itineramio. Genera un informe semanal breve para el anfitrión de "${propertyName}".

Datos de la semana:
- ${totalConversations} conversaciones
- Perfiles detectados: ${profileText}
- Temas más consultados: ${topicsText || 'ninguno destacado'}
- Preguntas sin respuesta: ${unanswered.length}
${unanswered.length > 0 ? `  Las más importantes:\n${unansweredText}` : ''}

Genera:
1. Un párrafo de 2-3 frases describiendo el perfil de huéspedes esta semana (natural, como si le hablaras al anfitrión)
2. Una lista de 2-3 mejoras específicas para el manual (basadas en lo que preguntaron y no pudo responder el chatbot)

Formato de respuesta JSON:
{
  "narrative": "texto del párrafo",
  "gaps": ["mejora 1", "mejora 2", "mejora 3"]
}
Solo devuelve el JSON, sin explicaciones.`

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: promptContent }],
        max_tokens: 400,
        temperature: 0.4,
      }),
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) return { narrative: '', gaps: [] }
    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content || ''
    // Extract JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return { narrative: '', gaps: [] }
    const parsed = JSON.parse(jsonMatch[0])
    return {
      narrative: typeof parsed.narrative === 'string' ? parsed.narrative : '',
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps.filter((g: any) => typeof g === 'string') : [],
    }
  } catch {
    return { narrative: '', gaps: [] }
  }
}

// ── Build HTML email ──────────────────────────────────────────────────────────
function buildInsightEmail(params: {
  hostName: string
  propertyName: string
  propertyId: string
  weekStr: string
  totalConversations: number
  profiles: ReturnType<typeof aggregateProfiles>
  topTopics: Array<{ topic: string; count: number }>
  unanswered: string[]
  aiNarrative: string
  aiGaps: string[]
}): string {
  const { hostName, propertyName, propertyId, weekStr, totalConversations, profiles, topTopics, unanswered, aiNarrative, aiGaps } = params
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'
  const chatbotUrl = `${baseUrl}/properties/${propertyId}/chatbot?tab=unanswered`
  const intelligenceUrl = `${baseUrl}/properties/${propertyId}/chatbot?tab=intelligence`

  const langFlags: Record<string, string> = { es: '🇪🇸', en: '🇬🇧', fr: '🇫🇷', de: '🇩🇪', it: '🇮🇹', pt: '🇵🇹' }
  const langRows = Object.entries(profiles.languages)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, count]) => `${langFlags[lang] || '🌍'} ${lang.toUpperCase()}: ${count}`)
    .join(' &nbsp;·&nbsp; ')

  const profileItems = [
    profiles.couples > 0 ? `💑 Parejas: <strong>${profiles.couples}</strong>` : '',
    profiles.families > 0 ? `👨‍👩‍👧 Familias: <strong>${profiles.families}</strong>` : '',
    profiles.groups > 0 ? `👯 Grupos de amigos: <strong>${profiles.groups}</strong>` : '',
    profiles.unknown > 0 && (profiles.couples + profiles.families + profiles.groups) === 0 ? `❓ Sin detectar: <strong>${profiles.unknown}</strong>` : '',
    profiles.withKids > 0 ? `🧒 Con niños: <strong>${profiles.withKids}</strong>` : '',
  ].filter(Boolean)

  const topicRows = topTopics.map(t =>
    `<tr><td style="padding:6px 12px;border-bottom:1px solid #f3f4f6;color:#374151">${t.topic}</td><td style="padding:6px 12px;border-bottom:1px solid #f3f4f6;font-weight:600;color:#7c3aed;text-align:right">${t.count}x</td></tr>`
  ).join('')

  const unansweredRows = unanswered.slice(0, 5).map(q =>
    `<li style="margin-bottom:8px;padding:8px 12px;background:#fff7ed;border-left:3px solid #f97316;border-radius:4px;color:#92400e;font-size:13px">"${q.slice(0, 120)}"</li>`
  ).join('')

  const gapRows = aiGaps.map(g =>
    `<li style="margin-bottom:6px;padding:8px 12px;background:#f0fdf4;border-left:3px solid #22c55e;border-radius:4px;color:#15803d;font-size:13px">⚡ ${g}</li>`
  ).join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:580px;margin:0 auto;padding:24px 16px">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);border-radius:16px;padding:28px 24px;margin-bottom:20px;color:#fff">
      <p style="margin:0 0 6px;font-size:12px;opacity:0.8;letter-spacing:1px;text-transform:uppercase">Informe semanal · ${weekStr}</p>
      <h1 style="margin:0 0 4px;font-size:22px;font-weight:700">${propertyName}</h1>
      <p style="margin:0;font-size:14px;opacity:0.85">Hola ${hostName || 'anfitrión'} 👋 Esto es lo que ha pasado esta semana con tu asistente IA</p>
    </div>

    <!-- Stats row -->
    <div style="display:flex;gap:12px;margin-bottom:20px">
      <div style="flex:1;background:#fff;border-radius:12px;padding:16px;text-align:center;border:1px solid #e5e7eb">
        <div style="font-size:28px;font-weight:700;color:#7c3aed">${totalConversations}</div>
        <div style="font-size:12px;color:#6b7280;margin-top:2px">conversaciones</div>
      </div>
      <div style="flex:1;background:#fff;border-radius:12px;padding:16px;text-align:center;border:1px solid #e5e7eb">
        <div style="font-size:28px;font-weight:700;color:#f97316">${unanswered.length}</div>
        <div style="font-size:12px;color:#6b7280;margin-top:2px">sin responder</div>
      </div>
      <div style="flex:1;background:#fff;border-radius:12px;padding:16px;text-align:center;border:1px solid #e5e7eb">
        <div style="font-size:28px;font-weight:700;color:#22c55e">${topTopics.length}</div>
        <div style="font-size:12px;color:#6b7280;margin-top:2px">temas detectados</div>
      </div>
    </div>

    ${aiNarrative ? `
    <!-- AI Narrative -->
    <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:20px;border:1px solid #e5e7eb">
      <p style="margin:0 0 10px;font-size:11px;font-weight:600;color:#7c3aed;text-transform:uppercase;letter-spacing:1px">✨ Análisis IA</p>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.6">${aiNarrative}</p>
    </div>` : ''}

    <!-- Guest profiles -->
    ${profileItems.length > 0 ? `
    <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:20px;border:1px solid #e5e7eb">
      <p style="margin:0 0 14px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:1px">👥 Quiénes son tus huéspedes</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:${langRows ? '12px' : '0'}">
        ${profileItems.map(item => `<span style="background:#f3f4f6;border-radius:20px;padding:5px 12px;font-size:13px;color:#374151">${item}</span>`).join('')}
      </div>
      ${langRows ? `<p style="margin:0;font-size:12px;color:#9ca3af">${langRows}</p>` : ''}
    </div>` : ''}

    <!-- Top topics -->
    ${topTopics.length > 0 ? `
    <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:20px;border:1px solid #e5e7eb">
      <p style="margin:0 0 14px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:1px">💬 Temas más consultados</p>
      <table style="width:100%;border-collapse:collapse">
        ${topicRows}
      </table>
    </div>` : ''}

    <!-- Unanswered questions -->
    ${unanswered.length > 0 ? `
    <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:20px;border:1px solid #e5e7eb">
      <p style="margin:0 0 14px;font-size:11px;font-weight:600;color:#f97316;text-transform:uppercase;letter-spacing:1px">❓ Preguntas que el chatbot no pudo responder</p>
      <ul style="margin:0;padding:0;list-style:none">${unansweredRows}</ul>
      <a href="${chatbotUrl}" style="display:inline-block;margin-top:14px;background:#f97316;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">Responder estas preguntas →</a>
    </div>` : ''}

    <!-- AI Gaps / Suggestions -->
    ${aiGaps.length > 0 ? `
    <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:20px;border:1px solid #e5e7eb">
      <p style="margin:0 0 14px;font-size:11px;font-weight:600;color:#22c55e;text-transform:uppercase;letter-spacing:1px">🚀 Mejora tu manual</p>
      <p style="margin:0 0 12px;font-size:13px;color:#6b7280">Esto aumentará la calidad de respuestas para tus próximos huéspedes:</p>
      <ul style="margin:0;padding:0;list-style:none">${gapRows}</ul>
      <a href="${intelligenceUrl}" style="display:inline-block;margin-top:14px;background:#7c3aed;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">Mejorar el manual →</a>
    </div>` : ''}

    <!-- Footer -->
    <div style="text-align:center;padding:20px 0">
      <a href="${baseUrl}/properties/${propertyId}/chatbot" style="color:#7c3aed;font-size:12px;text-decoration:none">Ver todas las conversaciones</a>
      <span style="color:#d1d5db;margin:0 8px">·</span>
      <a href="${baseUrl}/main" style="color:#9ca3af;font-size:12px;text-decoration:none">Dashboard</a>
    </div>
    <p style="text-align:center;font-size:11px;color:#d1d5db;margin:0">Itineramio · Tu asistente IA para huéspedes</p>
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

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Week string for email subject
  const weekStr = `${sevenDaysAgo.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} – ${now.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`

  let processed = 0
  let skipped = 0
  let errors = 0

  try {
    // Find all properties with chatbot conversations in the last 7 days
    const activeProperties = await prisma.property.findMany({
      where: {
        deletedAt: null,
        chatbotConversations: {
          some: { createdAt: { gte: sevenDaysAgo } }
        }
      },
      select: {
        id: true,
        name: true,
        intelligence: true,
        host: { select: { name: true, email: true } },
        chatbotConversations: {
          where: { createdAt: { gte: sevenDaysAgo } },
          select: {
            id: true,
            language: true,
            messages: true,
            unansweredQuestions: true,
          }
        }
      }
    })

    for (const prop of activeProperties) {
      try {
        const conversations = prop.chatbotConversations
        if (conversations.length < 2) { skipped++; continue } // not worth a report for 0-1 convs

        const propertyName = typeof prop.name === 'object'
          ? (prop.name as any).es || (prop.name as any).en || String(prop.name)
          : String(prop.name)

        const topTopics = countTopics(conversations)
        const profiles = aggregateProfiles(conversations)
        const unanswered = collectUnanswered(conversations)

        const { narrative, gaps } = await generateAISummary(
          propertyName,
          profiles,
          topTopics,
          unanswered,
          conversations.length
        )

        // Store insight in property.intelligence.weeklyInsight
        const currentIntel = (prop.intelligence as Record<string, any>) || {}
        await prisma.property.update({
          where: { id: prop.id },
          data: {
            intelligence: {
              ...currentIntel,
              weeklyInsight: {
                generatedAt: now.toISOString(),
                weekStart: sevenDaysAgo.toISOString(),
                conversationsCount: conversations.length,
                topTopics,
                profiles: {
                  couples: profiles.couples,
                  families: profiles.families,
                  groups: profiles.groups,
                  withKids: profiles.withKids,
                  languages: profiles.languages,
                  foodPrefs: profiles.foodPrefs,
                },
                unansweredCount: unanswered.length,
                unansweredSample: unanswered.slice(0, 5),
                aiNarrative: narrative,
                aiGaps: gaps,
              }
            }
          }
        })

        // Send email if host has email
        if (prop.host?.email) {
          const html = buildInsightEmail({
            hostName: prop.host.name || '',
            propertyName,
            propertyId: prop.id,
            weekStr,
            totalConversations: conversations.length,
            profiles,
            topTopics,
            unanswered,
            aiNarrative: narrative,
            aiGaps: gaps,
          })

          await sendEmail({
            to: prop.host.email,
            subject: `📊 Tu semana en "${propertyName}" — ${conversations.length} conversaciones`,
            html,
          })
        }

        processed++
      } catch {
        errors++
      }
    }

    return NextResponse.json({
      ok: true,
      processed,
      skipped,
      errors,
      total: processed + skipped + errors,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
