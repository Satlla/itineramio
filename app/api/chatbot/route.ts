import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../src/lib/prisma';

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      propertyId, 
      zoneId, 
      zoneName, 
      propertyName, 
      language = 'es',
      conversationHistory = []
    } = await request.json();

    if (!message || !propertyId || !zoneId) {
      return NextResponse.json({ 
        error: 'Faltan parámetros requeridos' 
      }, { status: 400 });
    }

    // Get property and zone context
    const property = await prisma.property.findUnique({
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

    const zone = property.zones[0];

    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      // Fallback to rule-based responses if no OpenAI
      const response = generateFallbackResponse(message, property, zone, language);
      return NextResponse.json({ response });
    }

    // Build context for OpenAI
    const systemPrompt = buildSystemPrompt(property, zone, language);
    
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
          model: 'gpt-3.5-turbo',
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

      // Log the interaction (optional)
      await logChatInteraction(propertyId, zoneId, message, aiResponse);

      return NextResponse.json({ response: aiResponse });

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      // Fallback to rule-based response if OpenAI fails
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

function buildSystemPrompt(property: any, zone: any, language: string): string {
  const zoneSteps = zone.steps.map((step: any, index: number) => {
    const stepContent = typeof step.content === 'string' 
      ? step.content 
      : step.content?.[language] || step.content?.es || '';
    
    return `Paso ${index + 1}: ${stepContent}`;
  }).join('\n');

  const hostInfo = property.host ? `
Información del anfitrión:
- Nombre: ${property.host.name}
- Teléfono: ${property.host.phone || 'No disponible'}
- Email: ${property.host.email || 'No disponible'}
` : '';

  const prompts = {
    es: `Eres un asistente virtual experto para la propiedad "${property.name}" ubicada en ${property.city}, ${property.country}. 
Estás ayudando específicamente con la zona "${zone.name}".

INFORMACIÓN DE LA PROPIEDAD:
${property.description || 'Información no disponible'}

INFORMACIÓN DE LA ZONA ACTUAL:
${zone.description || 'Información no disponible'}

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

    en: `You are a virtual assistant expert for the property "${property.name}" located in ${property.city}, ${property.country}. 
You are specifically helping with the "${zone.name}" zone.

PROPERTY INFORMATION:
${property.description || 'Information not available'}

CURRENT ZONE INFORMATION:
${zone.description || 'Information not available'}

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

    fr: `Vous êtes un assistant virtuel expert pour la propriété "${property.name}" située à ${property.city}, ${property.country}. 
Vous aidez spécifiquement avec la zone "${zone.name}".

INFORMATIONS SUR LA PROPRIÉTÉ:
${property.description || 'Informations non disponibles'}

INFORMATIONS SUR LA ZONE ACTUELLE:
${zone.description || 'Informations non disponibles'}

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

  return prompts[language as keyof typeof prompts] || prompts.es;
}

function generateFallbackResponse(message: string, property: any, zone: any, language: string): string {
  const lowerMessage = message.toLowerCase();
  
  const responses = {
    es: {
      wifi: `Para información sobre Wi-Fi, revisa los pasos específicos en la zona "${zone.name}". Si no encuentras la información, contacta al anfitrión.`,
      checkin: `Las instrucciones de check-in están detalladas en los pasos de la zona de acceso. Sigue cada paso numerado para completar tu llegada.`,
      parking: `La información sobre parking está disponible en las instrucciones de la propiedad. Revisa los pasos correspondientes o contacta al anfitrión.`,
      contact: `Puedes contactar al anfitrión a través de los datos de contacto proporcionados en la información de la propiedad.`,
      default: `Gracias por tu pregunta sobre "${property.name}". Para obtener la información más actualizada sobre "${zone.name}", te recomiendo revisar los pasos detallados o contactar directamente al anfitrión.`
    },
    en: {
      wifi: `For Wi-Fi information, check the specific steps in the "${zone.name}" zone. If you can't find the information, contact the host.`,
      checkin: `Check-in instructions are detailed in the access zone steps. Follow each numbered step to complete your arrival.`,
      parking: `Parking information is available in the property instructions. Check the corresponding steps or contact the host.`,
      contact: `You can contact the host through the contact details provided in the property information.`,
      default: `Thank you for your question about "${property.name}". For the most up-to-date information about "${zone.name}", I recommend reviewing the detailed steps or contacting the host directly.`
    },
    fr: {
      wifi: `Pour les informations Wi-Fi, consultez les étapes spécifiques dans la zone "${zone.name}". Si vous ne trouvez pas l'information, contactez l'hôte.`,
      checkin: `Les instructions d'enregistrement sont détaillées dans les étapes de la zone d'accès. Suivez chaque étape numérotée pour compléter votre arrivée.`,
      parking: `Les informations de parking sont disponibles dans les instructions de la propriété. Consultez les étapes correspondantes ou contactez l'hôte.`,
      contact: `Vous pouvez contacter l'hôte via les coordonnées fournies dans les informations de la propriété.`,
      default: `Merci pour votre question sur "${property.name}". Pour les informations les plus récentes sur "${zone.name}", je recommande de consulter les étapes détaillées ou de contacter l'hôte directement.`
    }
  };

  const langResponses = responses[language as keyof typeof responses] || responses.es;

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

async function logChatInteraction(propertyId: string, zoneId: string, userMessage: string, aiResponse: string) {
  try {
    // Create a simple log entry - you could expand this to track analytics
    await prisma.adminActivityLog.create({
      data: {
        adminUserId: 'system', // We could create a system user for this
        action: 'chatbot_interaction',
        targetType: 'property',
        targetId: propertyId,
        description: 'Chatbot interaction',
        metadata: {
          zoneId,
          userMessage: userMessage.substring(0, 100), // Truncate for privacy
          responseLength: aiResponse.length,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error logging chat interaction:', error);
    // Don't throw - this shouldn't break the chat functionality
  }
}