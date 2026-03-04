import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { prisma } from '../../../src/lib/prisma';
import { checkRateLimit, getRateLimitKey } from '../../../src/lib/rate-limit';

// Production: allow up to 60s for DB queries + OpenAI streaming
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface MediaItem {
  type: 'IMAGE' | 'VIDEO'
  url: string
  caption?: string
}

const CHATBOT_RATE_LIMIT = {
  maxRequests: 20,
  windowMs: 60 * 1000 // 1 minute
};

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const rateLimitKey = getRateLimitKey(request, null, 'chatbot');
    const rateLimitResult = checkRateLimit(rateLimitKey, CHATBOT_RATE_LIMIT);

    if (!rateLimitResult.allowed) {
      return NextResponse.json({
        error: 'Too many requests. Please wait a moment before sending another message.'
      }, {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000)),
          'X-RateLimit-Limit': String(rateLimitResult.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        }
      });
    }

    const {
      message,
      propertyId,
      zoneId,
      zoneName,
      propertyName,
      language = 'es',
      conversationHistory = [],
      sessionId
    } = await request.json();

    if (!message || !propertyId) {
      return NextResponse.json({
        error: 'Faltan parámetros requeridos'
      }, { status: 400 });
    }

    // TEMP: Restrict chatbot to specific host emails during beta
    const ALLOWED_HOST_EMAILS = ['alejandrosatlla@gmail.com', 'colaboracionesbnb@gmail.com'];

    // Get property and zone(s) context
    let property: any;
    let zones: any[] = [];

    if (zoneId) {
      // Single zone mode
      property = await prisma.property.findFirst({
        where: { id: propertyId, deletedAt: null },
        include: {
          zones: {
            where: { id: zoneId },
            include: {
              steps: {
                orderBy: { id: 'asc' }
              },
              recommendations: {
                include: { place: true },
                orderBy: { order: 'asc' }
              }
            }
          },
          host: {
            select: {
              name: true,
              email: true,
              phone: true
            }
          }
        }
      });

      if (!property || !property.zones.length) {
        return NextResponse.json({
          error: 'Propiedad o zona no encontrada'
        }, { status: 404 });
      }

      zones = property.zones;
    } else {
      // Full property mode - get all published zones
      property = await prisma.property.findFirst({
        where: { id: propertyId, deletedAt: null },
        include: {
          zones: {
            where: { status: 'ACTIVE' },
            include: {
              steps: {
                orderBy: { id: 'asc' }
              },
              recommendations: {
                include: { place: true },
                orderBy: { order: 'asc' }
              }
            },
            orderBy: { order: 'asc' }
          },
          host: {
            select: {
              name: true,
              email: true,
              phone: true
            }
          }
        }
      });

      if (!property) {
        return NextResponse.json({
          error: 'Propiedad no encontrada'
        }, { status: 404 });
      }

      zones = property.zones;
    }

    // TEMP: Block chatbot for non-allowed hosts during beta (allow demo properties)
    if (!property.isDemoPreview && !ALLOWED_HOST_EMAILS.includes(property.host?.email?.toLowerCase())) {
      return NextResponse.json({
        error: 'Chatbot not available for this property'
      }, { status: 403 });
    }

    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      // Fallback to rule-based responses if no OpenAI
      const zone = zones[0] || null;
      const response = generateFallbackResponse(message, property, zone, language);
      const media = detectRelevantMedia(message, response, zones, language);
      return NextResponse.json({ response, media: media.length > 0 ? media : undefined });
    }

    // Build context for OpenAI + fetch learned context in parallel
    const systemPrompt = zoneId && zones.length === 1
      ? buildZoneSystemPrompt(property, zones[0], language)
      : buildPropertySystemPrompt(property, zones, language);

    const learnedContext = await getLearnedContext(propertyId);
    const fullSystemPrompt = learnedContext
      ? systemPrompt + learnedContext
      : systemPrompt;

    // Sanitize conversation history: only keep role + content, max 500 chars each
    const sanitizedHistory: Message[] = (conversationHistory as any[])
      .slice(-8)
      .filter((m: any) => m.role === 'user' || m.role === 'assistant')
      .map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: typeof m.content === 'string' ? m.content.slice(0, 500) : ''
      }));

    const messages: Message[] = [
      { role: 'system', content: fullSystemPrompt },
      ...sanitizedHistory,
      { role: 'user', content: message.slice(0, 500) }
    ];

    try {
      // Call OpenAI API with streaming + timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 750,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
          stream: true
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }

      // Stream the response to the client
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      let fullResponse = '';

      // Promise that resolves when stream completes, so after() can wait for it
      let resolveStreamDone: () => void;
      const streamDone = new Promise<void>(resolve => { resolveStreamDone = resolve; });

      const stream = new ReadableStream({
        async start(controller) {
          const reader = openaiResponse.body?.getReader();
          if (!reader) {
            controller.close();
            resolveStreamDone!();
            return;
          }

          try {
            let sseBuffer = '';
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              sseBuffer += decoder.decode(value, { stream: true });
              const lines = sseBuffer.split('\n');
              // Keep the last (potentially incomplete) line in the buffer
              sseBuffer = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith('data: ')) continue;
                const data = trimmed.slice(6).trim();
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullResponse += content;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: content })}\n\n`));
                  }
                } catch {
                  // Skip malformed chunks
                }
              }
            }

            // After stream completes, send media and finish
            const media = detectRelevantMedia(message, fullResponse, zones, language);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, media: media.length > 0 ? media : undefined })}\n\n`));
            controller.close();
          } catch (err) {
            controller.error(err);
          } finally {
            resolveStreamDone!();
          }
        }
      });

      // after() runs AFTER the response is sent — Vercel keeps the function alive for this
      // Called at route handler level so AsyncLocalStorage context is available
      after(async () => {
        await streamDone; // Wait for stream to finish so fullResponse is populated
        if (!fullResponse) return;
        const isUnanswered = detectUnansweredQuestion(fullResponse, language);
        logChatInteraction(propertyId, zoneId || null, message, fullResponse);
        if (sessionId) {
          await saveConversation({ propertyId, zoneId: zoneId || null, sessionId, language, userMessage: message, aiResponse: fullResponse, isUnanswered });
        }
        // Save unanswered questions to property intelligence
        if (isUnanswered) {
          try {
            const prop = await prisma.property.findUnique({ where: { id: propertyId }, select: { intelligence: true } });
            const intel = (prop?.intelligence as Record<string, any>) || {};
            const unanswered = Array.isArray(intel.unansweredQuestions) ? intel.unansweredQuestions : [];
            unanswered.push({
              question: message.slice(0, 300),
              askedAt: new Date().toISOString(),
              askedBy: sessionId || 'guest',
              answered: false,
            });
            await prisma.property.update({
              where: { id: propertyId },
              data: { intelligence: { ...intel, unansweredQuestions: unanswered } },
            });
          } catch (e) {
            console.error('[ChatBot] Error saving unanswered question:', e);
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      });

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      const zone = zones[0] || null;
      const response = generateFallbackResponse(message, property, zone, language);
      const media = detectRelevantMedia(message, response, zones, language);
      return NextResponse.json({
        response,
        media: media.length > 0 ? media : undefined
      });
    }

  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// ========================================
// MEDIA DETECTION
// ========================================

// Synonyms/related words for common zone topics (multilingual)
const ZONE_SYNONYMS: Record<string, string[]> = {
  'check in': ['entrar', 'entrada', 'llegar', 'llegada', 'acceso', 'acceder', 'enter', 'arrival', 'arrive', 'access', 'key', 'llave', 'código', 'code', 'puerta', 'door', 'portal', 'arrivée', 'entrer', 'accès', 'clé', 'porte'],
  'check out': ['salir', 'salida', 'dejar', 'leave', 'leaving', 'departure', 'checkout', 'sortie', 'partir', 'quitter'],
  'wifi': ['internet', 'wifi', 'contraseña', 'password', 'red', 'network', 'conexión', 'connection', 'réseau', 'mot de passe'],
  'parking': ['aparcar', 'coche', 'garaje', 'garage', 'car', 'park', 'voiture', 'garer', 'estacionamiento'],
  'climatización': ['aire', 'calefacción', 'heating', 'cooling', 'temperature', 'temperatura', 'frío', 'calor', 'cold', 'hot', 'chauffage', 'climatisation'],
  'cocina': ['cocinar', 'cook', 'kitchen', 'horno', 'oven', 'microondas', 'microwave', 'vitrocerámica', 'cuisiner', 'cuisine', 'four'],
  'vitrocerámica': ['vitro', 'cocina', 'placa', 'hob', 'stove', 'cooktop', 'cocinar', 'cook', 'plaque'],
  'microondas': ['microwave', 'calentar', 'heat', 'warm', 'micro', 'réchauffer'],
  'lavadora': ['lavar', 'ropa', 'wash', 'laundry', 'washing', 'clothes', 'linge', 'laver', 'machine'],
  'basura': ['reciclar', 'reciclaje', 'trash', 'garbage', 'recycling', 'waste', 'bin', 'poubelle', 'déchet', 'recycler'],
  'recomendaciones': ['restaurante', 'comer', 'restaurant', 'eat', 'food', 'visitar', 'visit', 'actividad', 'activity', 'manger', 'activité'],
  'emergencia': ['emergencia', 'emergency', 'urgencia', 'urgence', 'policía', 'police', 'hospital', 'teléfono', 'phone', 'ambulancia', 'ambulance'],
  'normas': ['regla', 'rule', 'norma', 'ruido', 'noise', 'prohibido', 'forbidden', 'règle', 'bruit', 'interdit'],
  'transporte': ['metro', 'bus', 'taxi', 'tren', 'train', 'transport', 'llegar', 'aéroport', 'airport', 'aeropuerto'],
};

function getKeywords(text: string): string[] {
  return text.toLowerCase()
    .replace(/[-_/\\.,;:!?()]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3);
}

function detectRelevantMedia(userMessage: string, aiResponse: string, zones: any[], language: string): MediaItem[] {
  const media: MediaItem[] = [];
  const userKeywords = new Set(getKeywords(userMessage));

  for (const zone of zones) {
    // Skip RECOMMENDATIONS zones — they don't have step media
    if (zone.type === 'RECOMMENDATIONS') continue;

    const zoneName = getLocalizedText(zone.name, language);
    const zoneNameLower = zoneName.toLowerCase();
    const zoneKeywords = getKeywords(zoneName);

    // Check if this zone matches the user's question (by zone name or synonyms)
    let zoneMatchesQuery = zoneKeywords.some(w => userKeywords.has(w));

    if (!zoneMatchesQuery) {
      for (const [key, synonyms] of Object.entries(ZONE_SYNONYMS)) {
        if (zoneNameLower.includes(key) || key.includes(zoneNameLower)) {
          // Require at least 2 synonym matches OR one exact zone name match to avoid false positives
          const matchCount = synonyms.filter(s => userKeywords.has(s)).length;
          if (matchCount >= 1) {
            zoneMatchesQuery = true;
            break;
          }
        }
      }
    }

    // Only show media from the matched zone — don't cross-match step titles against unrelated zones
    if (!zoneMatchesQuery) continue;

    for (const step of (zone.steps || [])) {
      const content = step.content as any;
      if (!content || !content.mediaUrl) continue;
      const stepType = (step.type || '').toUpperCase();
      if (stepType !== 'IMAGE' && stepType !== 'VIDEO') continue;

      const stepTitle = getLocalizedText(step.title, language);

      media.push({
        type: stepType === 'VIDEO' ? 'VIDEO' : 'IMAGE',
        url: content.mediaUrl,
        caption: stepTitle || zoneName
      });

      if (media.length >= 3) return media;
    }
  }

  return media;
}

// ========================================
// UNANSWERED QUESTION DETECTION
// ========================================

function detectUnansweredQuestion(aiResponse: string, language: string): boolean {
  const lower = aiResponse.toLowerCase();

  const fallbackPhrases: Record<string, string[]> = {
    es: ['contacta al anfitrión', 'contactar al anfitrión', 'contacta directamente', 'no tengo información', 'no dispongo de esa información', 'no cuento con esa información'],
    en: ['contact the host', 'contact your host', 'reach out to the host', 'don\'t have that information', 'do not have specific information', 'i don\'t have information'],
    fr: ['contactez l\'hôte', 'contacter l\'hôte', 'je n\'ai pas cette information', 'je ne dispose pas de cette information', 'je n\'ai pas d\'information']
  };

  // Check all languages (AI may respond in a different language than requested)
  const allPhrases = Object.values(fallbackPhrases).flat();
  return allPhrases.some(phrase => lower.includes(phrase));
}

// ========================================
// CONVERSATION PERSISTENCE (non-blocking)
// ========================================

async function saveConversation(params: {
  propertyId: string;
  zoneId: string | null;
  sessionId: string;
  language: string;
  userMessage: string;
  aiResponse: string;
  isUnanswered: boolean;
}) {
  try {
    const { propertyId, zoneId, sessionId, language, userMessage, aiResponse, isUnanswered } = params;

    const newMessagePair = [
      { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
      { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
    ];

    const unansweredEntry = isUnanswered
      ? [{ question: userMessage, timestamp: new Date().toISOString() }]
      : [];

    // Use upsert to avoid race condition with find+create
    const existing = await prisma.chatbotConversation.findUnique({
      where: { sessionId },
      select: { messages: true, unansweredQuestions: true }
    });

    if (existing) {
      const currentMessages = Array.isArray(existing.messages) ? existing.messages as any[] : [];
      const currentUnanswered = Array.isArray(existing.unansweredQuestions) ? existing.unansweredQuestions as any[] : [];

      await prisma.chatbotConversation.update({
        where: { sessionId },
        data: {
          messages: [...currentMessages, ...newMessagePair],
          unansweredQuestions: [...currentUnanswered, ...unansweredEntry]
        }
      });
    } else {
      await prisma.chatbotConversation.create({
        data: {
          propertyId,
          zoneId: zoneId || undefined,
          sessionId,
          language,
          messages: newMessagePair,
          unansweredQuestions: unansweredEntry
        }
      });
    }
  } catch (error) {
    // Non-blocking — don't fail the chatbot response
    console.error('[ChatBot] Error saving conversation:', error);
  }
}

// ========================================
// LEARNING — Previous conversations context (with 5-min cache)
// ========================================

const learnedContextCache = new Map<string, { data: string; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getLearnedContext(propertyId: string): Promise<string> {
  // Check cache first
  const cached = learnedContextCache.get(propertyId);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  try {
    const recentConversations = await prisma.chatbotConversation.findMany({
      where: {
        propertyId,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      },
      select: { messages: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    if (recentConversations.length === 0) {
      learnedContextCache.set(propertyId, { data: '', expires: Date.now() + CACHE_TTL });
      return '';
    }

    const qaPairs: string[] = [];
    for (const conv of recentConversations) {
      const msgs = Array.isArray(conv.messages) ? conv.messages as any[] : [];
      for (let i = 0; i < msgs.length - 1; i++) {
        if (msgs[i].role === 'user' && msgs[i + 1]?.role === 'assistant') {
          const q = msgs[i].content?.substring(0, 80);
          const a = msgs[i + 1].content?.substring(0, 120);
          if (q && a) qaPairs.push(`- P: ${q} → R: ${a}`);
        }
      }
      if (qaPairs.length >= 8) break;
    }

    const result = qaPairs.length === 0
      ? ''
      : `\n\nPREGUNTAS FRECUENTES DE HUÉSPEDES ANTERIORES (usa como referencia):\n${qaPairs.join('\n')}`;

    learnedContextCache.set(propertyId, { data: result, expires: Date.now() + CACHE_TTL });
    return result;
  } catch {
    return '';
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function getLocalizedText(value: any, language: string): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    return value[language] || value.es || value.en || value.fr || '';
  }
  return '';
}

function buildStepDescription(step: any, index: number, language: string): string {
  const content = step.content as any;
  const title = getLocalizedText(step.title, language);
  // Content stores text at language keys (content.es, content.en), not content.text
  const text = getLocalizedText(content, language);

  let desc = `Paso ${index + 1}: ${text || title}`;

  // Include actual media URL so the AI can embed it in markdown responses
  if (content && content.mediaUrl) {
    if (step.type === 'VIDEO') {
      desc += `\n  📹 Vídeo disponible: ${content.mediaUrl}`;
    } else if (step.type === 'IMAGE') {
      desc += `\n  📷 Imagen disponible: ![${title || 'imagen'}](${content.mediaUrl})`;
    }
  }

  return desc;
}

function buildHostInfo(host: any, language: string): string {
  if (!host) return '';
  const labels: Record<string, { title: string; name: string; phone: string; email: string; na: string }> = {
    es: { title: 'Información del anfitrión', name: 'Nombre', phone: 'Teléfono', email: 'Email', na: 'No disponible' },
    en: { title: 'Host information', name: 'Name', phone: 'Phone', email: 'Email', na: 'Not available' },
    fr: { title: 'Informations de l\'hôte', name: 'Nom', phone: 'Téléphone', email: 'Email', na: 'Non disponible' }
  };
  const l = labels[language] || labels.es;
  return `\n${l.title}:\n- ${l.name}: ${host.name}\n- ${l.phone}: ${host.phone || l.na}\n- ${l.email}: ${host.email || l.na}\n`;
}

const EMERGENCY_KNOWLEDGE = `
COMMON PROBLEMS & EMERGENCIES:
If a guest reports a problem you don't have specific info about, provide these general guidelines:
- Power outage: Check the circuit breaker panel (usually near the entrance or in a utility closet). Flip any tripped breakers. If the whole building is affected, it may be a general outage — wait or contact the host.
- No hot water: Check if the water heater/boiler is on. Some have a switch or thermostat. Wait 15-20 min after turning on. If gas-powered, check the pilot light. Contact the host if it persists.
- Water leak: Turn off the nearest water valve (under sink or main valve). Place towels/buckets. Contact the host immediately.
- Heating/AC not working: Check the thermostat settings and batteries. Make sure the unit is set to the right mode (heat/cool). Check if filters are blocked. Contact the host if it doesn't respond.
- Locked out: Contact the host for key/code assistance. If there's a lockbox, re-check the code.
- Appliance not working: Check if it's plugged in and the outlet works (try another device). Check for a reset button. Refer to the manual zone if available.
- Noise/neighbor issues: Be respectful of quiet hours. If excessive, contact the host or building management.
- Emergency numbers: Call 112 (EU) or 911 (US) for real emergencies (fire, medical, crime).
IMPORTANT: Always provide these practical tips first, then suggest contacting the host for property-specific help.
`;

function buildIntelligenceSection(property: any): string {
  const intel = property.intelligence;
  if (!intel || typeof intel !== 'object') return '';

  const lines: string[] = ['PROPERTY INTELLIGENCE:'];

  // Host
  if (intel.hostName) lines.push(`- Anfitrión: ${intel.hostName}${intel.isSuperhost ? ' (Superhost)' : ''}`);

  // WiFi
  if (intel.wifi) {
    const w = intel.wifi;
    if (w.networkName) lines.push(`- WiFi: red "${w.networkName}"${w.password ? ', contraseña: ' + w.password : ''}`);
    if (w.routerLocation) lines.push(`- Router: ${w.routerLocation}`);
    if (w.troubleshooting) lines.push(`- WiFi troubleshooting: ${w.troubleshooting}`);
  }

  // Items with locations
  if (intel.items) {
    const itemLabels: Record<string, string> = {
      iron: 'Plancha', ironingBoard: 'Tabla de planchar', hairdryer: 'Secador',
      firstAid: 'Botiquín', extraBlankets: 'Mantas extra', broom: 'Escoba',
    };
    const itemParts: string[] = [];
    for (const [key, label] of Object.entries(itemLabels)) {
      const item = (intel.items as any)[key];
      if (item) {
        const loc = item.location ? `, ${item.location}` : '';
        itemParts.push(`${label} (${item.has ? 'sí' + loc : 'no'})`);
      }
    }
    if (itemParts.length > 0) lines.push(`- Items: ${itemParts.join(', ')}`);
  }

  // Appliances
  if (intel.appliances) {
    const appLabels: Record<string, string> = {
      washingMachine: 'Lavadora', dryer: 'Secadora', dishwasher: 'Lavavajillas',
      oven: 'Horno', microwave: 'Microondas', coffeeMachine: 'Cafetera',
      toaster: 'Tostadora', kettle: 'Hervidor', vacuumCleaner: 'Aspiradora', mop: 'Fregona',
    };
    for (const [key, label] of Object.entries(appLabels)) {
      const app = (intel.appliances as any)[key];
      if (app?.has) {
        let desc = `${label}: sí`;
        if (app.location) desc += `, ${app.location}`;
        if (app.instructions) desc += ` — ${app.instructions}`;
        if (app.type) desc += ` (${app.type})`;
        if (app.detergentLocation) desc += `, pastillas: ${app.detergentLocation}`;
        if (app.capsuleLocation) desc += `, cápsulas: ${app.capsuleLocation}`;
        lines.push(`- ${desc}`);
      } else if (app?.has === false) {
        lines.push(`- ${label}: no`);
      }
    }
  }

  // Climate
  if (intel.climate) {
    const c = intel.climate;
    if (c.ac?.has) {
      let desc = `AC: sí (${c.ac.type || 'tipo no especificado'})`;
      if (c.ac.remoteLocation) desc += `, mando: ${c.ac.remoteLocation}`;
      if (c.ac.instructions) desc += ` — ${c.ac.instructions}`;
      lines.push(`- ${desc}`);
    }
    if (c.heating?.has) {
      let desc = `Calefacción: sí (${c.heating.type || 'tipo no especificado'})`;
      if (c.heating.thermostatLocation) desc += `, termostato: ${c.heating.thermostatLocation}`;
      if (c.heating.instructions) desc += ` — ${c.heating.instructions}`;
      lines.push(`- ${desc}`);
    }
    if (c.fan?.has) lines.push(`- Ventilador: ${c.fan.location || 'sí'}`);
    if (c.fireplace?.has) lines.push(`- Chimenea: ${c.fireplace.type || 'sí'}${c.fireplace.instructions ? ' — ' + c.fireplace.instructions : ''}`);
  }

  // Water & bathroom
  if (intel.waterBathroom) {
    const wb = intel.waterBathroom;
    if (wb.hotWaterType) {
      lines.push(`- Agua caliente: ${wb.hotWaterType}${wb.tankCapacityLiters ? ' (' + wb.tankCapacityLiters + 'L)' : ''}`);
      if (wb.hotWaterWarning) lines.push(`  ⚠️ ${wb.hotWaterWarning}`);
    }
    if (wb.gasBottle?.applies) {
      lines.push(`- Bombona gas: ${wb.gasBottle.location || ''}${wb.gasBottle.howToChange ? ' — ' + wb.gasBottle.howToChange : ''}`);
      if (wb.gasBottle.emergencyNumber) lines.push(`  📞 Emergencia gas: ${wb.gasBottle.emergencyNumber}`);
    }
    if (wb.towelsLocation) lines.push(`- Toallas: ${wb.towelsLocation}`);
    if (wb.extraTowelsLocation) lines.push(`- Toallas extra: ${wb.extraTowelsLocation}`);
    if (wb.toiletPaperLocation) lines.push(`- Papel higiénico extra: ${wb.toiletPaperLocation}`);
  }

  // Bedroom
  if (intel.bedroom) {
    const b = intel.bedroom;
    if (b.pillowTypes) lines.push(`- Almohadas: ${b.pillowTypes}`);
    if (b.extraPillowsLocation) lines.push(`- Almohadas extra: ${b.extraPillowsLocation}`);
    if (b.bedLinenLocation) lines.push(`- Ropa de cama: ${b.bedLinenLocation}`);
    if (b.safebox?.has) lines.push(`- Caja fuerte: ${b.safebox.location || 'sí'}${b.safebox.instructions ? ' — ' + b.safebox.instructions : ''}`);
  }

  // Kitchen
  if (intel.kitchen) {
    const k = intel.kitchen;
    if (k.essentialsProvided?.length) lines.push(`- Básicos cocina: ${k.essentialsProvided.join(', ')}`);
    if (k.waterDrinkable !== undefined) lines.push(`- Agua grifo potable: ${k.waterDrinkable ? 'sí' : 'no'}`);
    if (k.waterFilter?.has) lines.push(`- Filtro agua: ${k.waterFilter.location || 'sí'}`);
    if (k.nearestSupermarket) lines.push(`- Supermercado: ${k.nearestSupermarket}${k.supermarketHours ? ' (' + k.supermarketHours + ')' : ''}`);
    if (k.trashBagsLocation) lines.push(`- Bolsas basura: ${k.trashBagsLocation}`);
  }

  // Entertainment
  if (intel.entertainment) {
    const e = intel.entertainment;
    if (e.tv?.has) {
      let desc = `TV: ${e.tv.type || 'sí'}`;
      if (e.tv.streamingApps?.length) desc += ` — ${e.tv.streamingApps.join(', ')}`;
      if (e.tv.remoteLocation) desc += `, mando: ${e.tv.remoteLocation}`;
      if (e.tv.instructions) desc += ` — ${e.tv.instructions}`;
      lines.push(`- ${desc}`);
    }
    if (e.bluetooth?.has) lines.push(`- Bluetooth: ${e.bluetooth.deviceName || 'sí'}`);
    if (e.boardGames?.has) lines.push(`- Juegos mesa: ${e.boardGames.location || 'sí'}`);
  }

  // Laundry
  if (intel.laundry) {
    const l = intel.laundry;
    if (l.detergentLocation) lines.push(`- Detergente: ${l.detergentLocation}`);
    if (l.dryingRack?.has) lines.push(`- Tendedero: ${l.dryingRack.location || 'sí'}`);
    if (l.dryingInstructions) lines.push(`- Secado: ${l.dryingInstructions}`);
    if (l.cleaningProducts) lines.push(`- Productos limpieza: ${l.cleaningProducts}`);
  }

  // House rules
  if (intel.houseRules) {
    const rules: string[] = [];
    if (intel.houseRules.noPets) rules.push('No mascotas');
    if (intel.houseRules.noSmoking) rules.push('No fumar');
    if (intel.houseRules.noParties) rules.push('No fiestas');
    if (intel.houseRules.quietHoursStart && intel.houseRules.quietHoursEnd) {
      rules.push(`Silencio ${intel.houseRules.quietHoursStart}-${intel.houseRules.quietHoursEnd}`);
    }
    if (intel.houseRules.additionalRules) rules.push(intel.houseRules.additionalRules);
    if (rules.length > 0) lines.push(`- Normas: ${rules.join(', ')}`);
  }

  // Checkout tasks
  if (intel.checkoutTasks && intel.checkoutTasks.length > 0) {
    lines.push(`- Tareas checkout: ${intel.checkoutTasks.join(', ')}`);
  }

  // Amenities
  if (intel.allAmenities && intel.allAmenities.length > 0) {
    lines.push(`- Amenities: ${intel.allAmenities.slice(0, 30).join(', ')}`);
  }

  // Details (check-in, checkout, parking, services)
  if (intel.details) {
    const d = intel.details;
    if (d.hotWaterType && !intel.waterBathroom?.hotWaterType) lines.push(`- Agua caliente: ${d.hotWaterType}`);
    if (d.electricalPanelLocation) lines.push(`- Panel eléctrico: ${d.electricalPanelLocation}`);
    if (d.checkoutInstructions) lines.push(`- Checkout: ${d.checkoutInstructions}`);
    if (d.keyReturn) lines.push(`- Devolución llave: ${d.keyReturn}${d.keyReturnDetails ? ' — ' + d.keyReturnDetails : ''}`);
    if (d.lockboxCode) lines.push(`- Lockbox: código ${d.lockboxCode}${d.lockboxLocation ? ', ' + d.lockboxLocation : ''}`);
    if (d.doorCode) lines.push(`- Código puerta: ${d.doorCode}`);
    if (d.recyclingContainerLocation) lines.push(`- Reciclaje: ${d.recyclingContainerLocation}`);
    if (d.parkingSpotNumber) lines.push(`- Parking: plaza ${d.parkingSpotNumber}${d.parkingFloor ? ', planta ' + d.parkingFloor : ''}${d.parkingAccess ? ', acceso: ' + d.parkingAccess : ''}${d.parkingAccessCode ? ' (código: ' + d.parkingAccessCode + ')' : ''}`);
    if (d.supportHoursFrom && d.supportHoursTo) lines.push(`- Soporte: ${d.supportHoursFrom}-${d.supportHoursTo}`);
    if (d.emergencyPhone) lines.push(`- Emergencia: ${d.emergencyPhone}`);
    if (d.lateCheckout) lines.push(`- Late checkout: ${d.lateCheckout}${d.lateCheckoutPrice ? ' (' + d.lateCheckoutPrice + ')' : ''}${d.lateCheckoutUntil ? ' hasta ' + d.lateCheckoutUntil : ''}`);
    if (d.luggageAfterCheckout) lines.push(`- Equipaje: ${d.luggageAfterCheckout}${d.luggageUntil ? ' hasta ' + d.luggageUntil : ''}${d.luggageConsignaInfo ? ' — ' + d.luggageConsignaInfo : ''}`);
    if (d.latePlan) lines.push(`- Llegada tarde: ${d.latePlan}${d.latePlanDetails ? ' — ' + d.latePlanDetails : ''}`);
  }

  // Security
  if (intel.security) {
    const s = intel.security;
    if (s.nearestHospital) lines.push(`- Hospital: ${s.nearestHospital}`);
    if (s.nearestPharmacy) lines.push(`- Farmacia: ${s.nearestPharmacy}`);
    if (s.lockInstructions) lines.push(`- Cerradura: ${s.lockInstructions}`);
    if (s.alarmSystem?.has) lines.push(`- Alarma: código ${s.alarmSystem.code || '?'}${s.alarmSystem.instructions ? ' — ' + s.alarmSystem.instructions : ''}`);
    if (s.neighborContact?.name) lines.push(`- Vecino contacto: ${s.neighborContact.name}${s.neighborContact.phone ? ', tel: ' + s.neighborContact.phone : ''}${s.neighborContact.apartment ? ', ' + s.neighborContact.apartment : ''}`);
  }

  // Outdoor
  if (intel.outdoor) {
    const o = intel.outdoor;
    if (o.pool?.has) lines.push(`- Piscina: ${o.pool.type || 'sí'}${o.pool.hours ? ', horario: ' + o.pool.hours : ''}${o.pool.rules ? ' — ' + o.pool.rules : ''}`);
    if (o.jacuzzi?.has) lines.push(`- Jacuzzi: sí${o.jacuzzi.instructions ? ' — ' + o.jacuzzi.instructions : ''}`);
    if (o.bbq?.has) lines.push(`- BBQ: ${o.bbq.type || 'sí'}${o.bbq.location ? ', ' + o.bbq.location : ''}${o.bbq.rules ? ' — ' + o.bbq.rules : ''}`);
    if (o.terrace?.has) lines.push(`- Terraza: sí${o.terrace.furniture ? ' — ' + o.terrace.furniture : ''}`);
  }

  // Neighborhood
  if (intel.neighborhood) {
    const n = intel.neighborhood;
    if (n.publicTransport) lines.push(`- Transporte: ${n.publicTransport}`);
    if (n.taxiApp) lines.push(`- Taxi: ${n.taxiApp}`);
    if (n.nearestRestaurant) lines.push(`- Restaurante: ${n.nearestRestaurant}`);
    if (n.nearestCafe) lines.push(`- Café: ${n.nearestCafe}`);
    if (n.nearestATM) lines.push(`- Cajero: ${n.nearestATM}`);
    if (n.nearestBeach) lines.push(`- Playa: ${n.nearestBeach}`);
    if (n.nightlifeArea) lines.push(`- Ocio nocturno: ${n.nightlifeArea}`);
    if (n.bestViewpoint) lines.push(`- Mirador: ${n.bestViewpoint}`);
    if (n.walkingTips) lines.push(`- Tips: ${n.walkingTips}`);
  }

  // Children
  if (intel.children) {
    const ch = intel.children;
    if (ch.crib?.has) lines.push(`- Cuna: ${ch.crib.location || 'sí'}`);
    if (ch.highChair?.has) lines.push(`- Trona: ${ch.highChair.location || 'sí'}`);
    if (ch.nearestPlayground) lines.push(`- Parque infantil: ${ch.nearestPlayground}`);
    if (ch.childFriendlyNote) lines.push(`- Niños: ${ch.childFriendlyNote}`);
  }

  // Accessibility
  if (intel.accessibility) {
    const a = intel.accessibility;
    const parts: string[] = [];
    if (a.elevator !== undefined) parts.push(`Ascensor: ${a.elevator ? 'sí' : 'no'}`);
    if (a.floorNumber !== undefined) parts.push(`Planta ${a.floorNumber}`);
    if (a.stepsToEntrance) parts.push(`${a.stepsToEntrance} escalones`);
    if (a.wheelchairAccessible !== undefined) parts.push(`Silla ruedas: ${a.wheelchairAccessible ? 'sí' : 'no'}`);
    if (a.accessibilityNote) parts.push(a.accessibilityNote);
    if (parts.length > 0) lines.push(`- Accesibilidad: ${parts.join(', ')}`);
  }

  // Pets & weather
  if (intel.petsWeather) {
    const pw = intel.petsWeather;
    if (pw.nearestVet) lines.push(`- Veterinario: ${pw.nearestVet}`);
    if (pw.dogFriendlyAreas) lines.push(`- Zonas perros: ${pw.dogFriendlyAreas}`);
    if (pw.petRules) lines.push(`- Normas mascotas: ${pw.petRules}`);
    if (pw.heatAdvice) lines.push(`- Consejo calor: ${pw.heatAdvice}`);
    if (pw.coldAdvice) lines.push(`- Consejo frío: ${pw.coldAdvice}`);
    if (pw.rainAdvice) lines.push(`- Consejo lluvia: ${pw.rainAdvice}`);
  }

  // Quirks (important for chatbot — things guests ask about)
  if (intel.quirks) {
    const q = intel.quirks;
    if (q.doorTrick) lines.push(`- Truco puerta: ${q.doorTrick}`);
    if (q.lightSwitch) lines.push(`- Interruptor: ${q.lightSwitch}`);
    if (q.waterTrick) lines.push(`- Truco agua: ${q.waterTrick}`);
    if (q.noiseWarnings) lines.push(`- Ruido: ${q.noiseWarnings}`);
    if (q.otherQuirks?.length) lines.push(`- Peculiaridades: ${q.otherQuirks.join('; ')}`);
  }

  return lines.length > 1 ? '\n' + lines.join('\n') + '\n' : '';
}

function buildZoneSystemPrompt(property: any, zone: any, language: string): string {
  let zoneSteps = '';
  if (zone.type === 'RECOMMENDATIONS' && zone.recommendations?.length > 0) {
    zoneSteps = zone.recommendations.map((rec: any) => {
      if (!rec.place) return '';
      const p = rec.place;
      let line = `- ${p.name}`;
      if (p.address) line += ` (${p.address})`;
      if (p.rating) line += ` ★${p.rating}`;
      if (rec.distanceMeters) line += ` — ${rec.distanceMeters < 1000 ? rec.distanceMeters + 'm' : (rec.distanceMeters / 1000).toFixed(1) + 'km'}`;
      if (rec.walkMinutes) line += `, ${rec.walkMinutes} min a pie`;
      if (rec.description) line += ` — ${rec.description}`;
      return line;
    }).filter(Boolean).join('\n');
  } else {
    zoneSteps = zone.steps.map((step: any, index: number) => {
      return buildStepDescription(step, index, language);
    }).join('\n');
  }

  const hostInfo = buildHostInfo(property.host, language);

  const intelligenceSection = buildIntelligenceSection(property);

  const prompt = `You are a virtual assistant expert for the property "${getLocalizedText(property.name, language)}" located in ${property.city}, ${property.country}.
You are specifically helping with the "${getLocalizedText(zone.name, language)}" zone.

PROPERTY INFORMATION:
${getLocalizedText(property.description, language) || 'N/A'}
${intelligenceSection}
CURRENT ZONE INFORMATION:
${getLocalizedText(zone.description, language) || 'N/A'}

ZONE STEPS AND INSTRUCTIONS:
${zoneSteps || 'No steps available'}

${hostInfo}
${EMERGENCY_KNOWLEDGE}

RESPONSE STYLE:
- CRITICAL: Detect the language the user writes in and ALWAYS respond in that SAME language. If they write in English, respond in English. If in Spanish, respond in Spanish. If in French, respond in French. If in any other language, respond in that language.
- Be a friendly, approachable host — as if chatting on WhatsApp with your guest
- Use **bold** to highlight important info (names, key data, steps)
- Use bullet lists with - when listing things
- Format links as [text](url) when relevant
- Be brief and direct (max 2-3 short paragraphs)
- Use occasional emojis to be friendly (📍🏠✅ etc.)
- IMPORTANT: If a step has an image (📷), include it with markdown ![description](url). If it has a video (📹), include the link as [🎬 Video](url)
- If you don't have the info, kindly suggest contacting the host
- Don't make up information
- Remember previous conversation context for coherent answers`;

  return prompt;
}

function buildPropertySystemPrompt(property: any, zones: any[], language: string): string {
  const hostInfo = buildHostInfo(property.host, language);

  // Build all zones content, truncating if too long
  let zonesContent = '';
  for (const zone of zones) {
    const zoneName = getLocalizedText(zone.name, language);
    const zoneDesc = getLocalizedText(zone.description, language);
    let zoneSection = `\n--- ${zoneName} ---\n`;
    if (zoneDesc) zoneSection += `${zoneDesc}\n`;

    if (zone.type === 'RECOMMENDATIONS' && zone.recommendations?.length > 0) {
      // Recommendation zones: list places with their data
      for (const rec of zone.recommendations) {
        if (!rec.place) continue;
        const p = rec.place;
        let line = `  - ${p.name}`;
        if (p.address) line += ` (${p.address})`;
        if (p.rating) line += ` ★${p.rating}`;
        if (rec.distanceMeters) line += ` — ${rec.distanceMeters < 1000 ? rec.distanceMeters + 'm' : (rec.distanceMeters / 1000).toFixed(1) + 'km'}`;
        if (rec.walkMinutes) line += `, ${rec.walkMinutes} min a pie`;
        if (rec.description) line += ` — ${rec.description}`;
        zoneSection += `${line}\n`;
      }
    } else if (zone.steps && zone.steps.length > 0) {
      for (const [index, step] of zone.steps.entries()) {
        zoneSection += `  ${buildStepDescription(step, index, language)}\n`;
      }
    }

    if ((zonesContent + zoneSection).length > 12000) {
      zonesContent += `\n... (more zones available, content truncated)\n`;
      break;
    }
    zonesContent += zoneSection;
  }

  const propertyName = getLocalizedText(property.name, language);

  const intelligenceSection = buildIntelligenceSection(property);

  const prompt = `You are a virtual assistant expert for the property "${propertyName}" located in ${property.city}, ${property.country}.
You have access to ALL zones and sections of the property manual.

PROPERTY INFORMATION:
${getLocalizedText(property.description, language) || 'N/A'}
${intelligenceSection}
${hostInfo}

MANUAL ZONES:
${zonesContent || 'No zones available'}
${EMERGENCY_KNOWLEDGE}

RESPONSE STYLE:
- CRITICAL: Detect the language the user writes in and ALWAYS respond in that SAME language. If they write in English, respond in English. If in Spanish, respond in Spanish. If in French, respond in French. If in any other language, respond in that language.
- Be a friendly, approachable host — as if chatting on WhatsApp with your guest
- Use **bold** to highlight important info (names, key data, steps)
- Use bullet lists with - when listing things
- Format links as [text](url) when relevant
- Be brief and direct (max 2-3 short paragraphs)
- Use occasional emojis to be friendly (📍🏠✅ etc.)
- Search all relevant zones to give the best answer
- IMPORTANT: If a step has an image (📷), include it with markdown ![description](url). If it has a video (📹), include the link as [🎬 Video](url)
- If you don't have the info, kindly suggest contacting the host
- Don't make up information
- Remember previous conversation context for coherent answers`;

  return prompt;
}

function generateFallbackResponse(message: string, property: any, zone: any | null, language: string): string {
  const lowerMessage = message.toLowerCase();
  const zoneName = zone ? getLocalizedText(zone.name, language) : '';
  const propertyName = getLocalizedText(property.name, language);

  const responses: Record<string, Record<string, string>> = {
    es: {
      wifi: zone
        ? `Para información sobre Wi-Fi, revisa los pasos específicos en la zona "${zoneName}". Si no encuentras la información, contacta al anfitrión.`
        : `Para información sobre Wi-Fi, revisa las secciones del manual de "${propertyName}". Si no encuentras la información, contacta al anfitrión.`,
      checkin: `Las instrucciones de check-in están detalladas en los pasos de la zona de acceso. Sigue cada paso numerado para completar tu llegada.`,
      parking: `La información sobre parking está disponible en las instrucciones de la propiedad. Revisa los pasos correspondientes o contacta al anfitrión.`,
      contact: `Puedes contactar al anfitrión a través de los datos de contacto proporcionados en la información de la propiedad.`,
      default: zone
        ? `Gracias por tu pregunta sobre "${propertyName}". Para obtener la información más actualizada sobre "${zoneName}", te recomiendo revisar los pasos detallados o contactar directamente al anfitrión.`
        : `Gracias por tu pregunta sobre "${propertyName}". Te recomiendo revisar las distintas secciones del manual o contactar directamente al anfitrión.`
    },
    en: {
      wifi: zone
        ? `For Wi-Fi information, check the specific steps in the "${zoneName}" zone. If you can't find the information, contact the host.`
        : `For Wi-Fi information, check the manual sections for "${propertyName}". If you can't find the information, contact the host.`,
      checkin: `Check-in instructions are detailed in the access zone steps. Follow each numbered step to complete your arrival.`,
      parking: `Parking information is available in the property instructions. Check the corresponding steps or contact the host.`,
      contact: `You can contact the host through the contact details provided in the property information.`,
      default: zone
        ? `Thank you for your question about "${propertyName}". For the most up-to-date information about "${zoneName}", I recommend reviewing the detailed steps or contacting the host directly.`
        : `Thank you for your question about "${propertyName}". I recommend reviewing the different manual sections or contacting the host directly.`
    },
    fr: {
      wifi: zone
        ? `Pour les informations Wi-Fi, consultez les étapes spécifiques dans la zone "${zoneName}". Si vous ne trouvez pas l'information, contactez l'hôte.`
        : `Pour les informations Wi-Fi, consultez les sections du manuel de "${propertyName}". Si vous ne trouvez pas l'information, contactez l'hôte.`,
      checkin: `Les instructions d'enregistrement sont détaillées dans les étapes de la zone d'accès. Suivez chaque étape numérotée pour compléter votre arrivée.`,
      parking: `Les informations de parking sont disponibles dans les instructions de la propriété. Consultez les étapes correspondantes ou contactez l'hôte.`,
      contact: `Vous pouvez contacter l'hôte via les coordonnées fournies dans les informations de la propriété.`,
      default: zone
        ? `Merci pour votre question sur "${propertyName}". Pour les informations les plus récentes sur "${zoneName}", je recommande de consulter les étapes détaillées ou de contacter l'hôte directement.`
        : `Merci pour votre question sur "${propertyName}". Je recommande de consulter les différentes sections du manuel ou de contacter l'hôte directement.`
    }
  };

  const langResponses = responses[language] || responses.es;

  if (lowerMessage.includes('wifi') || lowerMessage.includes('internet')) {
    return langResponses.wifi;
  }
  if (lowerMessage.includes('check') || lowerMessage.includes('llegada') || lowerMessage.includes('arrival')) {
    return langResponses.checkin;
  }
  if (lowerMessage.includes('parking') || lowerMessage.includes('aparcamiento') || lowerMessage.includes('estacionamiento')) {
    return langResponses.parking;
  }
  if (lowerMessage.includes('contacto') || lowerMessage.includes('contact') || lowerMessage.includes('teléfono') || lowerMessage.includes('phone')) {
    return langResponses.contact;
  }

  return langResponses.default;
}

function logChatInteraction(propertyId: string, zoneId: string | null, userMessage: string, aiResponse: string) {
  console.log(`[ChatBot] Property: ${propertyId}${zoneId ? `, Zone: ${zoneId}` : ''}, Query: ${userMessage.substring(0, 80)}, ResponseLen: ${aiResponse.length}`);
}
