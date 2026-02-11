import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../src/lib/prisma';
import { checkRateLimit, getRateLimitKey } from '../../../src/lib/rate-limit';

interface Message {
  role: 'user' | 'assistant'
  content: string
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
      conversationHistory = []
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
      return NextResponse.json({ response });
    }

    // Build context for OpenAI
    const systemPrompt = zoneId && zones.length === 1
      ? buildZoneSystemPrompt(property, zones[0], language)
      : buildPropertySystemPrompt(property, zones, language);

    // Prepare messages for OpenAI
    const messages: Message[] = [
      { role: 'assistant', content: systemPrompt },
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
          max_tokens: 300,
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

      // Log the interaction silently (non-blocking, no DB FK issues)
      logChatInteraction(propertyId, zoneId || null, message, aiResponse);

      return NextResponse.json({ response: aiResponse });

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      // Fallback to rule-based response if OpenAI fails
      const zone = zones[0] || null;
      const response = generateFallbackResponse(message, property, zone, language);
      return NextResponse.json({ response });
    }

  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

function getLocalizedText(value: any, language: string): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    return value[language] || value.es || value.en || value.fr || '';
  }
  return '';
}

function buildZoneSystemPrompt(property: any, zone: any, language: string): string {
  const zoneSteps = zone.steps.map((step: any, index: number) => {
    const stepContent = getLocalizedText(step.content, language)
      || getLocalizedText(step.title, language);
    return `Paso ${index + 1}: ${stepContent}`;
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

INSTRUCCIONES:
- Responde siempre en español de forma amigable y útil
- Usa la información específica de la zona y pasos cuando sea relevante
- Si no tienes información específica, sugiere contactar al anfitrión
- Sé conciso pero completo (máximo 2-3 párrafos)
- Si te preguntan sobre servicios, check-in, Wi-Fi, etc., refiere a los pasos específicos
- Mantén un tono profesional pero cálido
- No inventes información que no tengas`,

    en: `You are a virtual assistant expert for the property "${getLocalizedText(property.name, language)}" located in ${property.city}, ${property.country}.
You are specifically helping with the "${getLocalizedText(zone.name, language)}" zone.

PROPERTY INFORMATION:
${getLocalizedText(property.description, language) || 'Information not available'}

CURRENT ZONE INFORMATION:
${getLocalizedText(zone.description, language) || 'Information not available'}

ZONE STEPS AND INSTRUCTIONS:
${zoneSteps || 'No steps available'}

${hostInfo}

INSTRUCTIONS:
- Always respond in English in a friendly and helpful manner
- Use specific zone and step information when relevant
- If you don't have specific information, suggest contacting the host
- Be concise but complete (maximum 2-3 paragraphs)
- For questions about services, check-in, Wi-Fi, etc., refer to specific steps
- Maintain a professional but warm tone
- Don't make up information you don't have`,

    fr: `Vous êtes un assistant virtuel expert pour la propriété "${getLocalizedText(property.name, language)}" située à ${property.city}, ${property.country}.
Vous aidez spécifiquement avec la zone "${getLocalizedText(zone.name, language)}".

INFORMATIONS SUR LA PROPRIÉTÉ:
${getLocalizedText(property.description, language) || 'Informations non disponibles'}

INFORMATIONS SUR LA ZONE ACTUELLE:
${getLocalizedText(zone.description, language) || 'Informations non disponibles'}

ÉTAPES ET INSTRUCTIONS DE LA ZONE:
${zoneSteps || 'Aucune étape disponible'}

${hostInfo}

INSTRUCTIONS:
- Répondez toujours en français de manière amicale et utile
- Utilisez les informations spécifiques de la zone et des étapes quand c'est pertinent
- Si vous n'avez pas d'informations spécifiques, suggérez de contacter l'hôte
- Soyez concis mais complet (maximum 2-3 paragraphes)
- Pour les questions sur les services, l'enregistrement, le Wi-Fi, etc., référez aux étapes spécifiques
- Maintenez un ton professionnel mais chaleureux
- N'inventez pas d'informations que vous n'avez pas`
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
        const stepText = getLocalizedText(step.content, language)
          || getLocalizedText(step.title, language);
        if (stepText) {
          zoneSection += `  Paso ${index + 1}: ${stepText}\n`;
        }
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

INSTRUCCIONES:
- Responde siempre en español de forma amigable y útil
- Usa la información de cualquier zona relevante para responder
- Si no tienes información específica, sugiere contactar al anfitrión
- Sé conciso pero completo (máximo 2-3 párrafos)
- Si te preguntan sobre servicios, check-in, Wi-Fi, parking, etc., busca en las zonas relevantes
- Mantén un tono profesional pero cálido
- No inventes información que no tengas`,

    en: `You are a virtual assistant expert for the property "${propertyName}" located in ${property.city}, ${property.country}.
You have access to ALL zones and sections of the property manual.

PROPERTY INFORMATION:
${getLocalizedText(property.description, language) || 'Information not available'}

${hostInfo}

MANUAL ZONES:
${zonesContent || 'No zones available'}

INSTRUCTIONS:
- Always respond in English in a friendly and helpful manner
- Use information from any relevant zone to answer
- If you don't have specific information, suggest contacting the host
- Be concise but complete (maximum 2-3 paragraphs)
- For questions about services, check-in, Wi-Fi, parking, etc., search relevant zones
- Maintain a professional but warm tone
- Don't make up information you don't have`,

    fr: `Vous êtes un assistant virtuel expert pour la propriété "${propertyName}" située à ${property.city}, ${property.country}.
Vous avez accès à TOUTES les zones et sections du manuel de la propriété.

INFORMATIONS SUR LA PROPRIÉTÉ:
${getLocalizedText(property.description, language) || 'Informations non disponibles'}

${hostInfo}

ZONES DU MANUEL:
${zonesContent || 'Aucune zone disponible'}

INSTRUCTIONS:
- Répondez toujours en français de manière amicale et utile
- Utilisez les informations de n'importe quelle zone pertinente pour répondre
- Si vous n'avez pas d'informations spécifiques, suggérez de contacter l'hôte
- Soyez concis mais complet (maximum 2-3 paragraphes)
- Pour les questions sur les services, l'enregistrement, le Wi-Fi, le parking, etc., cherchez dans les zones pertinentes
- Maintenez un ton professionnel mais chaleureux
- N'inventez pas d'informations que vous n'avez pas`
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
  // Log to console only - AdminActivityLog requires a real admin FK which we don't have in guest context
  console.log(`[ChatBot] Property: ${propertyId}${zoneId ? `, Zone: ${zoneId}` : ''}, Query: ${userMessage.substring(0, 80)}, ResponseLen: ${aiResponse.length}`);
}
