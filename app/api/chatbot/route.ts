import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { prisma } from '../../../src/lib/prisma';
import { checkRateLimit, checkRateLimitAsync, getRateLimitKey } from '../../../src/lib/rate-limit';
import { sendEmail } from '../../../src/lib/email-improved';

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
  stepText?: string  // full step instruction text shown above the media
  stepIndex?: number // 1-based step number
}

// Burst: 20 msg/min — prevents spam floods
const CHATBOT_RATE_LIMIT = {
  maxRequests: 20,
  windowMs: 60 * 1000
};
// Hourly: 60 msg/hour — normal guest usage ceiling
const CHATBOT_HOURLY_LIMIT = {
  maxRequests: 60,
  windowMs: 60 * 60 * 1000
};
// Daily: 150 msg/day — triggers admin alert on breach
const CHATBOT_DAILY_LIMIT = {
  maxRequests: 150,
  windowMs: 24 * 60 * 60 * 1000
};

async function notifyAbuse(ip: string, propertyId: string, limitType: 'hourly' | 'daily', count: number) {
  try {
    await sendEmail({
      to: ['alejandrosatlla@gmail.com'],
      subject: `⚠️ Uso excesivo del chatbot — límite ${limitType === 'hourly' ? 'horario' : 'diario'} superado`,
      html: `
        <h2>Alerta de uso excesivo del chatbot</h2>
        <p>Un usuario ha superado el límite <strong>${limitType === 'hourly' ? 'horario (60 msg/h)' : 'diario (150 msg/día)'}</strong>.</p>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>IP</strong></td><td style="padding:8px;border:1px solid #ddd">${ip}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Propiedad</strong></td><td style="padding:8px;border:1px solid #ddd">${propertyId}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Mensajes enviados</strong></td><td style="padding:8px;border:1px solid #ddd">${count}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Fecha/hora</strong></td><td style="padding:8px;border:1px solid #ddd">${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</td></tr>
        </table>
        <p>El usuario ha recibido un mensaje informándole del límite alcanzado.</p>
      `
    });
  } catch {
    // Non-critical — don't break the request if email fails
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitKey = getRateLimitKey(request, null, 'chatbot');

    // 1. Burst check (sync, fast)
    const burstResult = checkRateLimit(rateLimitKey, CHATBOT_RATE_LIMIT);
    if (!burstResult.allowed) {
      return NextResponse.json({
        error: 'Too many requests. Please wait a moment before sending another message.'
      }, {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(burstResult.resetIn / 1000)),
          'X-RateLimit-Limit': String(burstResult.limit),
          'X-RateLimit-Remaining': String(burstResult.remaining),
        }
      });
    }

    // 2. Hourly check (async, Redis-backed)
    const hourlyResult = await checkRateLimitAsync(`${rateLimitKey}:hourly`, CHATBOT_HOURLY_LIMIT);
    if (!hourlyResult.allowed) {
      const { propertyId = 'unknown' } = await request.clone().json().catch(() => ({}));
      after(() => notifyAbuse(ip, propertyId, 'hourly', hourlyResult.current));
      return NextResponse.json({
        error: 'Has enviado demasiados mensajes esta hora. Por favor, contacta directamente con el anfitrión o vuelve a intentarlo más tarde.',
        limitType: 'hourly'
      }, { status: 429 });
    }

    // 3. Daily check (async, Redis-backed)
    const dailyResult = await checkRateLimitAsync(`${rateLimitKey}:daily`, CHATBOT_DAILY_LIMIT);
    if (!dailyResult.allowed) {
      const { propertyId = 'unknown' } = await request.clone().json().catch(() => ({}));
      after(() => notifyAbuse(ip, propertyId, 'daily', dailyResult.current));
      return NextResponse.json({
        error: 'Has alcanzado el límite de mensajes por hoy. Por favor, contacta directamente con el anfitrión.',
        limitType: 'daily'
      }, { status: 429 });
    }

    // Detect mobile browsers — SSE streaming is unreliable on mobile (second message bug).
    // Return plain JSON instead; the client already handles both response types.
    const ua = request.headers.get('user-agent') || '';
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);

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

    // Get property from cache (avoids DB hit on every message)
    const property = await getCachedProperty(propertyId);
    if (!property) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
    }

    // Select relevant zones based on message keywords (RAG-lite)
    const allZones: any[] = property.zones;
    const zones = zoneId
      ? allZones.filter((z: any) => z.id === zoneId).length > 0
        ? allZones.filter((z: any) => z.id === zoneId)
        : rankZonesByRelevance(message, allZones, language)
      : rankZonesByRelevance(message, allZones, language);

    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      // Fallback to rule-based responses if no OpenAI
      const zone = zones[0] || null;
      const response = generateFallbackResponse(message, property, zone, language);
      const media = collectRelevantMedia(zones, language);
      const recommendations = detectRelevantRecommendations(message, response, zones, language);
      return NextResponse.json({
        response,
        media: media.length > 0 ? media : undefined,
        recommendations: recommendations.length > 0 ? recommendations : undefined,
      });
    }

    // Build context for OpenAI — always use property mode with relevant zones
    const systemPrompt = buildPropertySystemPrompt(property, zones, language);

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

    // Shared post-response logic (runs via after() for streaming, inline for iOS)
    const runAfterTasks = async (fullResponse: string) => {
      if (!fullResponse) return;
      const isUnanswered = detectUnansweredQuestion(fullResponse, language);
      logChatInteraction(propertyId, zoneId || null, message, fullResponse);
      if (sessionId) {
        await saveConversation({ propertyId, zoneId: zoneId || null, sessionId, language, userMessage: message, aiResponse: fullResponse, isUnanswered });
      }
      if (isUnanswered) {
        try {
          const prop = await prisma.property.findUnique({
            where: { id: propertyId },
            select: { intelligence: true, name: true, host: { select: { email: true, name: true } } }
          });
          const intel = (prop?.intelligence as Record<string, any>) || {};
          const unanswered = Array.isArray(intel.unansweredQuestions) ? intel.unansweredQuestions : [];
          const allUserMessages = [
            ...conversationHistory.filter((m: Message) => m.role === 'user').map((m: Message) => m.content),
            message
          ];
          const substantiveQuestion = [...allUserMessages].reverse().find(m => m.length > 20) || message;
          unanswered.push({
            question: substantiveQuestion.slice(0, 300),
            askedAt: new Date().toISOString(),
            askedBy: sessionId || 'guest',
            answered: false,
          });
          await prisma.property.update({
            where: { id: propertyId },
            data: { intelligence: { ...intel, unansweredQuestions: unanswered } },
          });
          // TODO: Reactivar notificaciones cuando esté listo
          // const hostEmail = (prop as any)?.host?.email;
          // const propertyNameText = getLocalizedText(prop?.name, language) || propertyId;
          // const hostUser = await prisma.user.findUnique({ where: { email: hostEmail || '' }, select: { id: true } });
          // if (hostUser) {
          //   await prisma.notification.create({
          //     data: {
          //       userId: hostUser.id,
          //       type: 'warning',
          //       title: `❓ Pregunta sin respuesta — ${propertyNameText}`,
          //       message: `"${message.slice(0, 120)}"`,
          //       data: { propertyId, actionUrl: `/properties/${propertyId}/chatbot?tab=unanswered` }
          //     }
          //   });
          // }
          // if (hostEmail) {
          //   await sendEmail({
          //     to: [hostEmail],
          //     subject: `❓ Pregunta sin respuesta en "${propertyNameText}"`,
          //     html: `
          //       <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          //         <h2 style="color:#1a1a1a">Un huésped hizo una pregunta que el chatbot no pudo responder</h2>
          //         <p style="color:#555">Propiedad: <strong>${propertyNameText}</strong></p>
          //         <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;border-radius:8px;margin:20px 0">
          //           <p style="margin:0;font-size:16px;color:#92400e">"${substantiveQuestion.slice(0, 300)}"</p>
          //         </div>
          //         <p style="color:#555">Puedes añadir una respuesta directamente en el panel para que el chatbot la use en futuras preguntas:</p>
          //         <a href="https://www.itineramio.com/properties/${propertyId}/chatbot?tab=unanswered"
          //            style="display:inline-block;background:#7c3aed;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
          //           Añadir respuesta →
          //         </a>
          //         <p style="color:#999;font-size:12px;margin-top:24px">Itineramio · Asistente IA</p>
          //       </div>
          //     `
          //   });
          // }
        } catch (e) {
          console.error('[ChatBot] Error saving unanswered question:', e);
        }
      }
    };

    try {
      // iOS Safari: SSE streaming is unreliable (second message bug).
      // Use standard JSON response instead — client handles both.
      if (isMobile) {
        // Mobile path has its own try/catch to return fallback on OpenAI failure
        // instead of propagating to the outer 500 handler.
        try {
        const iosController = new AbortController();
        const iosTimeout = setTimeout(() => iosController.abort(), 45000);
        const iosOpenaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            max_tokens: 1500,
            temperature: 0.3,
            presence_penalty: 0.1,
            frequency_penalty: 0.1,
            stream: false,
          }),
          signal: iosController.signal,
        });
        clearTimeout(iosTimeout);
        if (!iosOpenaiResponse.ok) throw new Error(`OpenAI API error: ${iosOpenaiResponse.status}`);
        const iosData = await iosOpenaiResponse.json();
        const fullResponse = iosData.choices?.[0]?.message?.content || '';
        const media = collectRelevantMedia(zones, language);
        const recommendations = detectRelevantRecommendations(message, fullResponse, zones, language);
        after(() => runAfterTasks(fullResponse));
        return NextResponse.json({
          response: fullResponse,
          media: media.length > 0 ? media : undefined,
          recommendations: recommendations.length > 0 ? recommendations : undefined,
        });
        } catch (mobileError) {
          // OpenAI failed on mobile — return a graceful fallback instead of 500
          console.error('[ChatBot] Mobile OpenAI error:', mobileError);
          const zone = zones[0] || null;
          const fallback = generateFallbackResponse(message, property, zone, language);
          return NextResponse.json({ response: fallback });
        }
      }

      // Desktop: SSE streaming
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
          max_tokens: 1500,
          temperature: 0.3,
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

            // After stream completes, send media + recommendation cards and finish
            const media = collectRelevantMedia(zones, language);
            const recommendations = detectRelevantRecommendations(message, fullResponse, zones, language);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              done: true,
              media: media.length > 0 ? media : undefined,
              recommendations: recommendations.length > 0 ? recommendations : undefined,
            })}\n\n`));
            controller.close();
          } catch (err) {
            controller.error(err);
          } finally {
            resolveStreamDone!();
          }
        }
      });

      // after() runs AFTER the response is sent — Vercel keeps the function alive for this
      after(async () => {
        await streamDone; // Wait for stream to finish so fullResponse is populated
        await runAfterTasks(fullResponse);
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-store',
          'Connection': 'close',
          'X-Accel-Buffering': 'no',
        }
      });

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      const zone = zones[0] || null;
      const response = generateFallbackResponse(message, property, zone, language);
      const media = collectRelevantMedia(zones, language);
      const recommendations = detectRelevantRecommendations(message, response, zones, language);
      return NextResponse.json({
        response,
        media: media.length > 0 ? media : undefined,
        recommendations: recommendations.length > 0 ? recommendations : undefined,
      });
    }

  } catch (error) {
    const msg = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error('Chatbot API error:', msg);
    return NextResponse.json({
      error: msg
    }, { status: 500 });
  }
}

// ========================================
// MEDIA DETECTION — derived from AI response URLs
// ========================================

/**
 * Collect media (images + videos) directly from the most relevant zone's steps.
 * Does NOT depend on the AI including URLs in its response — always reliable.
 *
 * Strategy: use zones[0] if it is a standard zone (not RECOMMENDATIONS).
 * If the top zone is a RECOMMENDATIONS zone (e.g. user asked about restaurants),
 * there are no step-media to show, so we return [].
 */
function collectRelevantMedia(zones: any[], language: string): MediaItem[] {
  if (!zones.length || zones[0].type === 'RECOMMENDATIONS') return [];

  const zone = zones[0];
  const items: MediaItem[] = [];
  let stepNumber = 0;

  for (const step of (zone.steps || [])) {
    const content = step.content as any;
    if (!content?.mediaUrl) continue;
    const stepType = (step.type || '').toUpperCase();
    if (stepType !== 'IMAGE' && stepType !== 'VIDEO') continue;

    stepNumber++;
    const title = getLocalizedText(step.title, language) || '';
    // Step text: prefer content text, fall back to title
    const contentText = getLocalizedText(content, language) || '';
    const stepText = contentText || title || undefined;

    items.push({
      type: stepType as 'IMAGE' | 'VIDEO',
      url: content.mediaUrl,
      caption: title || getLocalizedText(zone.name, language) || '',
      stepText,
      stepIndex: stepNumber,
    });
    if (items.length >= 8) break;
  }
  return items;
}

// Synonyms for recommendation categories
const RECOMMENDATION_SYNONYMS: Record<string, string[]> = {
  'restaurant': ['restaurante', 'restaurantes', 'comer', 'eat', 'food', 'cenar', 'almorzar', 'dinner', 'lunch', 'tapas', 'comida', 'manger', 'dîner', 'déjeuner'],
  'local_cuisine': ['local', 'típico', 'típica', 'tradicional', 'autóctono', 'regional', 'cocina'],
  'seafood': ['marisco', 'mariscos', 'pescado', 'marisquería', 'frutos del mar', 'seafood', 'fish'],
  'grill': ['asador', 'parrilla', 'carne', 'brasa', 'grill', 'barbacoa'],
  'vegetarian': ['vegetariano', 'vegano', 'vegan', 'vegetarian', 'plant based'],
  'street_food': ['street food', 'food truck', 'mercado gastronómico', 'gastronomico'],
  'ice_cream': ['helado', 'helados', 'heladería', 'pastelería', 'postre', 'ice cream', 'gelato'],
  'bakery': ['panadería', 'pan', 'desayuno', 'bakery', 'breakfast', 'croissant'],
  'cafe': ['café', 'cafeteria', 'cafetería', 'coffee', 'desayuno', 'breakfast', 'brunch', 'desayunar', 'petit-déjeuner'],
  'brunch': ['brunch', 'desayuno', 'breakfast', 'brunch spot'],
  'tea_bar': ['té', 'tetería', 'matcha', 'infusión', 'tea'],
  'cocktail_bar': ['cócteles', 'coctelería', 'bar', 'cocktail', 'copa', 'copas', 'speakeasy'],
  'wine_bar': ['vino', 'vinos', 'enoteca', 'bodega', 'wine', 'maridaje'],
  'tapas_bar': ['tapas', 'pintxos', 'raciones', 'bar de tapas'],
  'rooftop': ['rooftop', 'terraza', 'vistas', 'azotea'],
  'pub': ['pub', 'cervecería', 'cerveza', 'beer', 'bar'],
  'club': ['discoteca', 'club', 'nightclub', 'boliche', 'marcha', 'noche', 'fiesta'],
  'cathedral': ['catedral', 'iglesia', 'templo', 'mezquita', 'church'],
  'castle': ['castillo', 'fortaleza', 'castle', 'fortress'],
  'palace': ['palacio', 'palace'],
  'ruins': ['ruinas', 'yacimiento', 'arqueológico', 'ruins'],
  'monument': ['monumento', 'estatua', 'escultura', 'monument'],
  'museum': ['museo', 'museos', 'museum', 'exposición', 'exposicion'],
  'art_gallery': ['galería', 'arte', 'gallery', 'pintura'],
  'park': ['parque', 'parques', 'jardín', 'jardines', 'garden', 'naturaleza', 'nature', 'pasear', 'walk', 'jardin'],
  'beach': ['playa', 'playas', 'beach', 'beaches', 'mar', 'sea', 'costa', 'coast', 'bañarse', 'swim', 'plage', 'mer'],
  'cove': ['cala', 'calas', 'cove', 'cala escondida'],
  'viewpoint': ['mirador', 'miradores', 'vistas', 'viewpoint'],
  'hiking': ['senderismo', 'ruta', 'rutas', 'montaña', 'trekking', 'hiking', 'caminar'],
  'square': ['plaza', 'plazas', 'square'],
  'market': ['mercado', 'mercados', 'market', 'mercadillo'],
  'neighborhood': ['barrio', 'barrios', 'neighborhood', 'quarter'],
  'shopping_mall': ['compras', 'shopping', 'tienda', 'tiendas', 'shop', 'store', 'centro comercial', 'mall', 'boutique', 'magasin'],
  'supermarket': ['supermercado', 'supermercados', 'supermarket', 'comprar', 'buy', 'mercado', 'market', 'grocery', 'marché'],
  'pharmacy': ['farmacia', 'farmacias', 'pharmacy', 'medicina', 'medicine', 'pharmacie', 'médicament'],
  'hospital': ['hospital', 'hospitales', 'urgencias', 'emergency', 'médico', 'doctor', 'hôpital', 'urgences'],
  'parking': ['parking', 'aparcamiento', 'aparcar', 'park', 'coche', 'car', 'garaje', 'garage', 'stationnement'],
  'water_sports': ['deportes acuáticos', 'kayak', 'paddle surf', 'buceo', 'snorkel', 'water sports'],
  'spa': ['spa', 'bienestar', 'masaje', 'relax', 'wellness'],
  'boat_trip': ['barco', 'excursión en barco', 'boat', 'paseo marítimo'],
};

function getKeywords(text: unknown): string[] {
  if (!text || typeof text !== 'string') return [];
  return text.toLowerCase()
    .replace(/[-_/\\.,;:!?()]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3);
}

interface RecommendationCard {
  name: string
  address: string
  rating: number | null
  distance: string | null
  walkMinutes: number | null
  photoUrl: string | null
  category: string
  categoryIcon: string
  mapsUrl: string | null
}

function detectRelevantRecommendations(userMessage: string, aiResponse: string, zones: any[], language: string): RecommendationCard[] {
  const cards: RecommendationCard[] = [];
  const userKeywords = new Set(getKeywords(userMessage));
  const userKeywordsArr = [...userKeywords]; // precomputed for bidirectional checks

  for (const zone of zones) {
    if (zone.type !== 'RECOMMENDATIONS' || !zone.recommendations?.length) continue;

    const categoryId = zone.recommendationCategory || '';
    const zoneName = String(getLocalizedText(zone.name, language) || '').toLowerCase();

    // Check if user is asking about this recommendation category
    let matches = false;

    // Direct category synonym match — bidirectional to handle plurals/variants
    const synonyms = RECOMMENDATION_SYNONYMS[categoryId] || [];
    if (synonyms.some(s => userKeywords.has(s) || userKeywordsArr.some(uk => uk.includes(s) || s.includes(uk)))) {
      matches = true;
    }

    // Zone name match — bidirectional: "restaurantes" matches zone "Restaurante"
    if (!matches) {
      const zoneWords = getKeywords(zoneName);
      if (zoneWords.some(w => userKeywords.has(w) || userKeywordsArr.some(uk => uk.includes(w) || w.includes(uk)))) {
        matches = true;
      }
    }

    // Check if AI response mentions places from this zone (AI decided to recommend them)
    if (!matches) {
      for (const rec of zone.recommendations) {
        if (!rec.place) continue;
        const placeName = String(rec.place.name || '').toLowerCase();
        if (String(aiResponse || '').toLowerCase().includes(placeName)) {
          matches = true;
          break;
        }
      }
    }

    if (!matches) continue;

    // Detect proximity query — user wants places close to the apartment
    const isNearbyQuery = /cerca|cercan|próxim|proxim|andando|caminando|walking|near\b|close\b|al lado|a pie/i.test(userMessage);
    const NEARBY_MAX_METERS = 1500; // ~18 min walk

    // Sort by distance ascending (closest first); unknowns go to the end
    const sortedRecs = [...zone.recommendations].sort((a, b) => {
      if (a.distanceMeters != null && b.distanceMeters != null) return a.distanceMeters - b.distanceMeters;
      if (a.distanceMeters != null) return -1;
      if (b.distanceMeters != null) return 1;
      return 0;
    });

    // Filter by proximity if requested
    const recsToShow = isNearbyQuery
      ? sortedRecs.filter(r => r.distanceMeters == null || r.distanceMeters <= NEARBY_MAX_METERS)
      : sortedRecs;

    for (const rec of recsToShow) {
      if (!rec.place) continue;
      const p = rec.place;
      const distance = rec.distanceMeters
        ? rec.distanceMeters < 1000
          ? `${rec.distanceMeters}m`
          : `${(rec.distanceMeters / 1000).toFixed(1)}km`
        : null;

      cards.push({
        name: p.name,
        address: p.address || '',
        rating: p.rating,
        distance,
        walkMinutes: rec.walkMinutes,
        photoUrl: p.photoUrl || null,
        category: getLocalizedText(zone.name, language),
        categoryIcon: zone.icon || '',
        mapsUrl: p.latitude && p.longitude
          ? `https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}`
          : null,
      });

      if (cards.length >= 6) return cards;
    }
  }

  return cards;
}

// ========================================
// UNANSWERED QUESTION DETECTION
// ========================================

function detectUnansweredQuestion(aiResponse: string, language: string): boolean {
  const lower = String(aiResponse || '').toLowerCase();

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
// PROPERTY DATA CACHE — avoids DB hit on every message (5-min TTL)
// ========================================

const propertyDataCache = new Map<string, { data: any; expires: number }>();
const PROPERTY_CACHE_TTL = 60 * 1000; // 1 minute — keeps content fresh when host adds/removes places

async function getCachedProperty(propertyId: string): Promise<any | null> {
  const cached = propertyDataCache.get(propertyId);
  if (cached && cached.expires > Date.now()) return cached.data;

  const property = await prisma.property.findFirst({
    where: { id: propertyId, deletedAt: null },
    include: {
      zones: {
        where: { status: 'ACTIVE' },
        include: {
          steps: { orderBy: { id: 'asc' } },
          recommendations: { include: { place: true }, orderBy: { order: 'asc' } }
        },
        orderBy: { order: 'asc' }
      },
      host: { select: { name: true, email: true, phone: true } }
    }
  });

  if (property) {
    propertyDataCache.set(propertyId, { data: property, expires: Date.now() + PROPERTY_CACHE_TTL });
  }
  return property;
}

// ========================================
// RELEVANCE RANKING — select top zones for each question
// ========================================

function rankZonesByRelevance(message: string, zones: any[], language: string): any[] {
  const words = String(message || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .split(/\s+/).filter(w => w.length > 2);

  const ALWAYS_RELEVANT = ['wifi', 'wi-fi', 'check', 'entrada', 'salida', 'llegada', 'acceso'];

  const scored = zones.map(zone => {
    const zoneName = String(getLocalizedText(zone.name, language) || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let score = 0;

    // Zone name keyword match = high relevance — bidirectional handles plurals
    // e.g. "restaurantes" matches zone "Restaurante" via word.includes(zoneName)
    for (const word of words) {
      if (zoneName.includes(word) || word.includes(zoneName)) score += 15;
    }

    // Step content match = medium relevance
    for (const step of (zone.steps || [])) {
      const content = step.content as any;
      const title = String(getLocalizedText(step.title, language) || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const text = String(getLocalizedText(content, language) || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const combined = `${title} ${text}`;
      for (const word of words) {
        if (combined.includes(word)) score += 4;
      }
    }

    // Always-relevant zones get a small base score
    for (const term of ALWAYS_RELEVANT) {
      if (zoneName.includes(term)) score += 2;
    }

    return { zone, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Return top 6 zones — enough context, not overwhelming
  return scored.slice(0, 6).map(s => s.zone);
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
    const raw = value[language] || value.es || value.en || value.fr || '';
    // Some step contents are nested: { es: { text: "...", mediaUrl: "..." } }
    if (typeof raw === 'string') return raw;
    if (raw && typeof raw === 'object') {
      const inner = raw.text ?? raw.content ?? '';
      return typeof inner === 'string' ? inner : '';
    }
    return '';
  }
  return '';
}

function buildStepDescription(step: any, index: number, language: string): string {
  const content = step.content as any;
  const title = getLocalizedText(step.title, language);
  // Content stores text at language keys (content.es, content.en), not content.text
  const text = getLocalizedText(content, language);

  // For video-only steps with no text/title, use a descriptive fallback
  const hasMedia = content && content.mediaUrl;
  const isVideoOnly = step.type === 'VIDEO' && !text && !title;
  const fallbackLabel = isVideoOnly
    ? { es: 'Vídeo explicativo', en: 'Explanatory video', fr: 'Vidéo explicative' }[language] || 'Vídeo explicativo'
    : '';

  let desc = `Paso ${index + 1}: ${text || title || fallbackLabel}`;

  // Include actual media URL so the AI can embed it in markdown responses
  if (hasMedia) {
    if (step.type === 'VIDEO') {
      desc += `\n  📹 Vídeo disponible (INCLUIR en la respuesta): ${content.mediaUrl}`;
    } else if (step.type === 'IMAGE') {
      desc += `\n  📷 Imagen disponible (INCLUIR en la respuesta): ![${title || 'imagen'}](${content.mediaUrl})`;
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

  // Neighborhood (solo info específica del alojamiento — lo demás va en guía de lugar)
  if (intel.neighborhood) {
    const n = intel.neighborhood;
    if (n.publicTransport) lines.push(`- Transporte: ${n.publicTransport}`);
    if (n.taxiApp) lines.push(`- Taxi: ${n.taxiApp}`);
    if (n.walkingTips) lines.push(`- Tips zona: ${n.walkingTips}`);
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
    if (a.floorNumber !== undefined) {
      const floorLabels: Record<string, string> = { baja: 'Planta baja', entreplanta: 'Entreplanta' }
      const floorStr = String(a.floorNumber)
      parts.push(floorLabels[floorStr] ?? `Planta ${floorStr}`)
    }
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

  // Custom Q&A added by the host to answer questions the chatbot couldn't handle
  if (Array.isArray(intel.customQA) && intel.customQA.length > 0) {
    lines.push('\nRESPUESTAS PERSONALIZADAS DEL ANFITRIÓN (máxima prioridad):');
    for (const qa of intel.customQA) {
      if (qa.question && qa.answer) {
        lines.push(`- P: "${qa.question}" → R: ${qa.answer}`);
      }
    }
  }

  return lines.length > 1 ? '\n' + lines.join('\n') + '\n' : '';
}

function buildZoneSystemPrompt(property: any, zone: any, language: string): string {
  let zoneSteps = '';
  if (zone.type === 'RECOMMENDATIONS' && zone.recommendations?.length > 0) {
    zoneSteps = zone.recommendations.map((rec: any) => {
      if (!rec.place || !rec.place.name) return '';
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
    zoneSteps = (zone.steps || []).map((step: any, index: number) => {
      return buildStepDescription(step, index, language);
    }).join('\n');
  }

  const hostInfo = buildHostInfo(property.host, language);

  const intelligenceSection = buildIntelligenceSection(property);

  const prompt = `You are the virtual concierge for "${getLocalizedText(property.name, language)}" in ${property.city}, ${property.country}.
You are helping with the "${getLocalizedText(zone.name, language)}" zone.

YOUR KNOWLEDGE BASE — use ONLY this information to answer:

PROPERTY:
${getLocalizedText(property.description, language) || 'N/A'}
${intelligenceSection}
ZONE "${getLocalizedText(zone.name, language)}":
${getLocalizedText(zone.description, language) || ''}

STEPS & INSTRUCTIONS:
${zoneSteps || 'No steps available'}

${hostInfo}
${EMERGENCY_KNOWLEDGE}

CRITICAL RULES:
1. LANGUAGE: Detect the language the user writes in and ALWAYS respond in that SAME language.
2. ANSWER FROM DATA: Your answers MUST come from the knowledge base above. Quote specific details (names, codes, locations, times).
3. MEDIA: For every step you describe that has a 📷 or 📹, you MUST include the EXACT URL in your response. For images: ![description](url). For videos: [🎬 Ver vídeo](url). Include ALL images and videos from every step you mention — never skip them.
4. VIDEO STEPS: If a zone or step only has a video (📹) and no text, ALWAYS share the video link and say it explains everything visually. Example: "Aquí tienes el vídeo explicativo: [🎬 Ver vídeo](url)"
5. RECOMMENDATIONS: When the guest asks about restaurants, cafés, attractions or any place category, list ALL places from that zone — every single one. Never pick just 1 or 2. Show name, rating (★), distance, and walk time for each.
6. STYLE: Be friendly and direct. Use **bold** for key info. Use bullet lists. Max 3 short paragraphs.
7. HONESTY: If the info isn't in your knowledge base, say so and suggest contacting the host.
8. NEVER invent information not present in the knowledge base above.`;

  return prompt;
}

function buildPropertySystemPrompt(property: any, zones: any[], language: string): string {
  const hostInfo = buildHostInfo(property.host, language);

  // Build all zones content — limit per zone to avoid one zone eating all context
  const MAX_ZONE_CHARS = 3000;
  const MAX_TOTAL_CHARS = 50000;
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

    // Truncate individual zone if it's excessively long (e.g. recommendations)
    if (zoneSection.length > MAX_ZONE_CHARS) {
      zoneSection = zoneSection.substring(0, MAX_ZONE_CHARS) + '\n  ...\n';
    }

    if ((zonesContent + zoneSection).length > MAX_TOTAL_CHARS) {
      break;
    }
    zonesContent += zoneSection;
  }

  const propertyName = getLocalizedText(property.name, language);

  const intelligenceSection = buildIntelligenceSection(property);

  const prompt = `You are the virtual concierge for "${propertyName}" in ${property.city}, ${property.country}.
You have access to the complete property manual with all zones and sections.

YOUR KNOWLEDGE BASE — use ONLY this information to answer:

PROPERTY:
${getLocalizedText(property.description, language) || 'N/A'}
${intelligenceSection}
${hostInfo}

MANUAL ZONES:
${zonesContent || 'No zones available'}
${EMERGENCY_KNOWLEDGE}

CRITICAL RULES:
1. LANGUAGE: Detect the language the user writes in and ALWAYS respond in that SAME language.
2. ANSWER FROM DATA: Your answers MUST come from the knowledge base above. Quote specific details (WiFi name, codes, locations, times, step-by-step instructions).
3. MEDIA: For every step you describe that has a 📷 or 📹, you MUST include the EXACT URL in your response. For images: ![description](url). For videos: [🎬 Ver vídeo](url). Include ALL images and videos from every step you mention — never skip them.
4. VIDEO STEPS: If a zone or step only has a video (📹) and no text, ALWAYS share the video link and say it explains everything visually. Example: "Aquí tienes el vídeo explicativo: [🎬 Ver vídeo](url)"
5. RECOMMENDATIONS: When the guest asks about restaurants, cafés, attractions or any category, list ALL places from that zone. Show name, rating (★), distance, and walk time for each. If the guest asks for places "cerca", "near", "close" or mentions walking distance, prioritize places with low distanceMeters/walkMinutes and only list those within ~1.5km (18 min walk).
6. SEARCH ALL ZONES: Look through ALL zones to find the most relevant information for each question.
7. STYLE: Be friendly and direct like a WhatsApp chat. Use **bold** for key info. Use bullet lists with -. Max 3 short paragraphs. Use emojis sparingly (📍🏠✅☕🍽️).
8. HONESTY: If the info isn't in your knowledge base, say so and suggest contacting the host.
9. NEVER invent information not present in the knowledge base above.`;

  return prompt;
}

function generateFallbackResponse(message: string, property: any, zone: any | null, language: string): string {
  const lowerMessage = String(message || '').toLowerCase();
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
}
