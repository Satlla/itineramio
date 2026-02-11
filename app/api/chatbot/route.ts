import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../src/lib/prisma';
import { checkRateLimit, getRateLimitKey } from '../../../src/lib/rate-limit';

interface Message {
  role: 'user' | 'assistant'
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

    // Get property and zone(s) context
    let property: any;
    let zones: any[] = [];

    if (zoneId) {
      // Single zone mode
      property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
          zones: {
            where: { id: zoneId },
            include: {
              steps: {
                orderBy: { id: 'asc' }
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
      property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
          zones: {
            where: { status: 'ACTIVE' },
            include: {
              steps: {
                orderBy: { id: 'asc' }
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

    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      // Fallback to rule-based responses if no OpenAI
      const zone = zones[0] || null;
      const response = generateFallbackResponse(message, property, zone, language);
      const media = detectRelevantMedia(message, response, zones, language);
      return NextResponse.json({ response, media: media.length > 0 ? media : undefined });
    }

    // Build context for OpenAI (now includes media info)
    const systemPrompt = zoneId && zones.length === 1
      ? buildZoneSystemPrompt(property, zones[0], language)
      : buildPropertySystemPrompt(property, zones, language);

    // Fetch learned Q&A from previous conversations (non-blocking knowledge)
    const learnedContext = await getLearnedContext(propertyId);

    // Prepare messages for OpenAI
    const fullSystemPrompt = learnedContext
      ? systemPrompt + learnedContext
      : systemPrompt;

    const messages: Message[] = [
      { role: 'assistant', content: fullSystemPrompt },
      ...conversationHistory.slice(-8), // Keep last 8 messages for context
      { role: 'user', content: message }
    ];

    try {
      // Call OpenAI API
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }

      const data = await openaiResponse.json();
      const aiResponse = data.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from OpenAI');
      }

      // Detect relevant media from steps
      const media = detectRelevantMedia(message, aiResponse, zones, language);

      // Detect if question was unanswered
      const isUnanswered = detectUnansweredQuestion(aiResponse, language);

      // Log the interaction silently (non-blocking, no DB FK issues)
      logChatInteraction(propertyId, zoneId || null, message, aiResponse);

      // Save conversation to DB (non-blocking)
      if (sessionId) {
        saveConversation({
          propertyId,
          zoneId: zoneId || null,
          sessionId,
          language,
          userMessage: message,
          aiResponse,
          isUnanswered
        });
      }

      return NextResponse.json({
        response: aiResponse,
        media: media.length > 0 ? media : undefined
      });

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      // Fallback to rule-based response if OpenAI fails
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

// Extract significant words (3+ chars) from text for fuzzy matching
function getKeywords(text: string): string[] {
  return text.toLowerCase()
    .replace(/[-_/\\.,;:!?()]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3);
}

// Check if any keywords from source appear in target
function hasKeywordOverlap(sourceWords: string[], targetText: string): boolean {
  const targetWords = new Set(getKeywords(targetText));
  return sourceWords.some(word => targetWords.has(word));
}

function detectRelevantMedia(userMessage: string, aiResponse: string, zones: any[], language: string): MediaItem[] {
  const media: MediaItem[] = [];
  const combinedText = (userMessage + ' ' + aiResponse).toLowerCase();
  const combinedKeywords = getKeywords(combinedText);

  for (const zone of zones) {
    const zoneName = getLocalizedText(zone.name, language);
    const zoneKeywords = getKeywords(zoneName);
    // Check if zone is relevant by keyword overlap
    const zoneIsRelevant = zoneKeywords.length > 0 && zoneKeywords.some(w => combinedKeywords.includes(w));

    for (const step of (zone.steps || [])) {
      const content = step.content as any;
      if (!content || !content.mediaUrl) continue;

      const stepTitle = getLocalizedText(step.title, language);
      // Only match against zone name + step title (NOT full content text — too many false positives)
      const stepTitleKeywords = getKeywords(stepTitle);
      const stepIsRelevant = stepTitleKeywords.length > 0 && stepTitleKeywords.some(w => combinedKeywords.includes(w));

      if (!zoneIsRelevant && !stepIsRelevant) continue;

      media.push({
        type: step.type === 'VIDEO' ? 'VIDEO' : 'IMAGE',
        url: content.mediaUrl,
        caption: stepTitle || zoneName
      });

      // Max 2 media items
      if (media.length >= 2) return media;
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
    es: ['contacta al anfitrión', 'contactar al anfitrión', 'contacta directamente', 'no tengo información', 'no dispongo de esa información'],
    en: ['contact the host', 'contact your host', 'reach out to the host', 'don\'t have that information', 'do not have specific information'],
    fr: ['contactez l\'hôte', 'contacter l\'hôte', 'je n\'ai pas cette information', 'je ne dispose pas de cette information']
  };

  const phrases = fallbackPhrases[language] || fallbackPhrases.es;

  // If the response primarily suggests contacting the host without providing specific info
  const hasFallbackPhrase = phrases.some(phrase => lower.includes(phrase));
  // Check if response is very short (likely generic)
  const isShort = aiResponse.length < 80;

  return hasFallbackPhrase || isShort;
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

    const existing = await prisma.chatbotConversation.findUnique({
      where: { sessionId }
    });

    const newMessagePair = [
      { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
      { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
    ];

    if (existing) {
      const currentMessages = Array.isArray(existing.messages) ? existing.messages as any[] : [];
      const currentUnanswered = Array.isArray(existing.unansweredQuestions) ? existing.unansweredQuestions as any[] : [];

      await prisma.chatbotConversation.update({
        where: { sessionId },
        data: {
          messages: [...currentMessages, ...newMessagePair],
          unansweredQuestions: isUnanswered
            ? [...currentUnanswered, { question: userMessage, timestamp: new Date().toISOString() }]
            : currentUnanswered
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
          unansweredQuestions: isUnanswered
            ? [{ question: userMessage, timestamp: new Date().toISOString() }]
            : []
        }
      });
    }
  } catch (error) {
    // Non-blocking — don't fail the chatbot response
    console.error('[ChatBot] Error saving conversation:', error);
  }
}

// ========================================
// LEARNING — Previous conversations context
// ========================================

async function getLearnedContext(propertyId: string): Promise<string> {
  try {
    // Get recent conversations with good Q&A pairs (last 30 days, max 10)
    const recentConversations = await prisma.chatbotConversation.findMany({
      where: {
        propertyId,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      },
      select: { messages: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    if (recentConversations.length === 0) return '';

    // Extract common Q&A patterns from previous conversations
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

    if (qaPairs.length === 0) return '';

    return `\n\nPREGUNTAS FRECUENTES DE HUÉSPEDES ANTERIORES (usa como referencia):\n${qaPairs.join('\n')}`;
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

function buildZoneSystemPrompt(property: any, zone: any, language: string): string {
  const zoneSteps = zone.steps.map((step: any, index: number) => {
    return buildStepDescription(step, index, language);
  }).join('\n');

  const hostInfo = property.host ? `
Información del anfitrión:
- Nombre: ${property.host.name}
- Teléfono: ${property.host.phone || 'No disponible'}
- Email: ${property.host.email || 'No disponible'}
` : '';

  const prompts: Record<string, string> = {
    es: `Eres un asistente virtual experto para la propiedad "${getLocalizedText(property.name, language)}" ubicada en ${property.city}, ${property.country}.
Estás ayudando específicamente con la zona "${getLocalizedText(zone.name, language)}".

INFORMACIÓN DE LA PROPIEDAD:
${getLocalizedText(property.description, language) || 'Información no disponible'}

INFORMACIÓN DE LA ZONA ACTUAL:
${getLocalizedText(zone.description, language) || 'Información no disponible'}

PASOS E INSTRUCCIONES DE LA ZONA:
${zoneSteps || 'No hay pasos disponibles'}

${hostInfo}

ESTILO DE RESPUESTA:
- Responde en español como un anfitrión cercano y amable, como si hablaras por WhatsApp con tu huésped
- Usa **negritas** para destacar lo importante (nombres, datos clave, pasos)
- Usa listas con - cuando enumeres cosas
- Si mencionas un enlace, formatea como [texto](url)
- Sé breve y directo (máximo 2-3 párrafos cortos)
- Usa emojis ocasionalmente para ser más cercano (📍🏠✅ etc.)
- IMPORTANTE: Si un paso tiene una imagen (📷), inclúyela en tu respuesta con formato markdown ![descripción](url). Si tiene un vídeo (📹), incluye el enlace como [🎬 Ver vídeo](url)
- Si no tienes la información, sugiere contactar al anfitrión amablemente
- No inventes información que no tengas
- Recuerda el contexto de la conversación anterior para dar respuestas coherentes`,

    en: `You are a virtual assistant expert for the property "${getLocalizedText(property.name, language)}" located in ${property.city}, ${property.country}.
You are specifically helping with the "${getLocalizedText(zone.name, language)}" zone.

PROPERTY INFORMATION:
${getLocalizedText(property.description, language) || 'Information not available'}

CURRENT ZONE INFORMATION:
${getLocalizedText(zone.description, language) || 'Information not available'}

ZONE STEPS AND INSTRUCTIONS:
${zoneSteps || 'No steps available'}

${hostInfo}

RESPONSE STYLE:
- Respond in English like a friendly, approachable host — as if chatting on WhatsApp with your guest
- Use **bold** to highlight important info (names, key data, steps)
- Use bullet lists with - when listing things
- Format links as [text](url) when relevant
- Be brief and direct (max 2-3 short paragraphs)
- Use occasional emojis to be friendly (📍🏠✅ etc.)
- IMPORTANT: If a step has an image (📷), include it in your response with markdown ![description](url). If it has a video (📹), include the link as [🎬 Watch video](url)
- If you don't have the info, kindly suggest contacting the host
- Don't make up information
- Remember previous conversation context for coherent answers`,

    fr: `Vous êtes un assistant virtuel expert pour la propriété "${getLocalizedText(property.name, language)}" située à ${property.city}, ${property.country}.
Vous aidez spécifiquement avec la zone "${getLocalizedText(zone.name, language)}".

INFORMATIONS SUR LA PROPRIÉTÉ:
${getLocalizedText(property.description, language) || 'Informations non disponibles'}

INFORMATIONS SUR LA ZONE ACTUELLE:
${getLocalizedText(zone.description, language) || 'Informations non disponibles'}

ÉTAPES ET INSTRUCTIONS DE LA ZONE:
${zoneSteps || 'Aucune étape disponible'}

${hostInfo}

STYLE DE RÉPONSE:
- Répondez en français comme un hôte sympathique et accessible, comme sur WhatsApp avec votre invité
- Utilisez le **gras** pour mettre en valeur les infos importantes (noms, données clés, étapes)
- Utilisez des listes avec - pour énumérer
- Formatez les liens comme [texte](url) si pertinent
- Soyez bref et direct (max 2-3 paragraphes courts)
- Utilisez des emojis occasionnellement pour être plus chaleureux (📍🏠✅ etc.)
- IMPORTANT: Si une étape a une image (📷), incluez-la avec le format markdown ![description](url). Si elle a une vidéo (📹), incluez le lien comme [🎬 Voir la vidéo](url)
- Si vous n'avez pas l'info, suggérez gentiment de contacter l'hôte
- N'inventez pas d'informations
- Gardez le contexte de la conversation pour des réponses cohérentes`
  };

  return prompts[language] || prompts.es;
}

function buildPropertySystemPrompt(property: any, zones: any[], language: string): string {
  const hostInfo = property.host ? `
Información del anfitrión:
- Nombre: ${property.host.name}
- Teléfono: ${property.host.phone || 'No disponible'}
- Email: ${property.host.email || 'No disponible'}
` : '';

  // Build all zones content, truncating if too long
  let zonesContent = '';
  for (const zone of zones) {
    const zoneName = getLocalizedText(zone.name, language);
    const zoneDesc = getLocalizedText(zone.description, language);
    let zoneSection = `\n--- ${zoneName} ---\n`;
    if (zoneDesc) zoneSection += `${zoneDesc}\n`;

    if (zone.steps && zone.steps.length > 0) {
      for (const [index, step] of zone.steps.entries()) {
        zoneSection += `  ${buildStepDescription(step, index, language)}\n`;
      }
    }

    // Truncate if total would exceed ~12,000 chars
    if ((zonesContent + zoneSection).length > 12000) {
      zonesContent += `\n... (más zonas disponibles, contenido truncado por brevedad)\n`;
      break;
    }
    zonesContent += zoneSection;
  }

  const propertyName = getLocalizedText(property.name, language);

  const prompts: Record<string, string> = {
    es: `Eres un asistente virtual experto para la propiedad "${propertyName}" ubicada en ${property.city}, ${property.country}.
Tienes acceso a TODAS las zonas y secciones del manual de la propiedad.

INFORMACIÓN DE LA PROPIEDAD:
${getLocalizedText(property.description, language) || 'Información no disponible'}

${hostInfo}

ZONAS DEL MANUAL:
${zonesContent || 'No hay zonas disponibles'}

ESTILO DE RESPUESTA:
- Responde en español como un anfitrión cercano y amable, como si hablaras por WhatsApp con tu huésped
- Usa **negritas** para destacar lo importante (nombres, datos clave, pasos)
- Usa listas con - cuando enumeres cosas
- Si mencionas un enlace, formatea como [texto](url)
- Sé breve y directo (máximo 2-3 párrafos cortos)
- Usa emojis ocasionalmente para ser más cercano (📍🏠✅ etc.)
- Busca en todas las zonas relevantes para dar la mejor respuesta
- IMPORTANTE: Si un paso tiene una imagen (📷), inclúyela en tu respuesta con formato markdown ![descripción](url). Si tiene un vídeo (📹), incluye el enlace como [🎬 Ver vídeo](url)
- Si no tienes la información, sugiere contactar al anfitrión amablemente
- No inventes información que no tengas
- Recuerda el contexto de la conversación anterior para dar respuestas coherentes`,

    en: `You are a virtual assistant expert for the property "${propertyName}" located in ${property.city}, ${property.country}.
You have access to ALL zones and sections of the property manual.

PROPERTY INFORMATION:
${getLocalizedText(property.description, language) || 'Information not available'}

${hostInfo}

MANUAL ZONES:
${zonesContent || 'No zones available'}

RESPONSE STYLE:
- Respond in English like a friendly, approachable host — as if chatting on WhatsApp with your guest
- Use **bold** to highlight important info (names, key data, steps)
- Use bullet lists with - when listing things
- Format links as [text](url) when relevant
- Be brief and direct (max 2-3 short paragraphs)
- Use occasional emojis to be friendly (📍🏠✅ etc.)
- Search all relevant zones to give the best answer
- IMPORTANT: If a step has an image (📷), include it in your response with markdown ![description](url). If it has a video (📹), include the link as [🎬 Watch video](url)
- If you don't have the info, kindly suggest contacting the host
- Don't make up information
- Remember previous conversation context for coherent answers`,

    fr: `Vous êtes un assistant virtuel expert pour la propriété "${propertyName}" située à ${property.city}, ${property.country}.
Vous avez accès à TOUTES les zones et sections du manuel de la propriété.

INFORMATIONS SUR LA PROPRIÉTÉ:
${getLocalizedText(property.description, language) || 'Informations non disponibles'}

${hostInfo}

ZONES DU MANUEL:
${zonesContent || 'Aucune zone disponible'}

STYLE DE RÉPONSE:
- Répondez en français comme un hôte sympathique et accessible, comme sur WhatsApp avec votre invité
- Utilisez le **gras** pour mettre en valeur les infos importantes (noms, données clés, étapes)
- Utilisez des listes avec - pour énumérer
- Formatez les liens comme [texte](url) si pertinent
- Soyez bref et direct (max 2-3 paragraphes courts)
- Utilisez des emojis occasionnellement pour être plus chaleureux (📍🏠✅ etc.)
- Cherchez dans toutes les zones pertinentes pour la meilleure réponse
- IMPORTANT: Si une étape a une image (📷), incluez-la avec le format markdown ![description](url). Si elle a une vidéo (📹), incluez le lien comme [🎬 Voir la vidéo](url)
- Si vous n'avez pas l'info, suggérez gentiment de contacter l'hôte
- N'inventez pas d'informations
- Gardez le contexte de la conversation pour des réponses cohérentes`
  };

  return prompts[language] || prompts.es;
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
