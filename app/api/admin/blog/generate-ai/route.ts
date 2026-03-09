import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth, createActivityLog, getRequestInfo } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdminAuth(req)
    if (authResult instanceof Response) {
      return authResult
    }

    const { topic, category = 'GUIAS' } = await req.json()

    if (!topic) {
      return NextResponse.json(
        { error: 'El tema es requerido' },
        { status: 400 }
      )
    }

    // Generate content using AI prompt
    const generatedContent = await generateBlogContent(topic, category)

    // Log the activity
    const { ipAddress, userAgent } = getRequestInfo(req)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'blog_ai_generated',
      targetType: 'blog_post',
      description: `Contenido AI generado para: ${topic}`,
      metadata: { topic, category },
      ipAddress,
      userAgent
    })

    return NextResponse.json({
      success: true,
      content: generatedContent
    })
  } catch (error) {
    console.error('Error generating AI content:', error)
    return NextResponse.json(
      { error: 'Error al generar contenido' },
      { status: 500 }
    )
  }
}

async function generateBlogContent(topic: string, category: string) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''
  const categoryContext = getCategoryContext(category)
  const keywords = generateKeywords(topic, category)
  const tags = generateTags(topic, category)

  if (ANTHROPIC_API_KEY) {
    try {
      const prompt = `Eres experto en gestión de apartamentos turísticos y redacción de contenido SEO en español.

Genera un artículo de blog completo y detallado sobre: "${topic}"
Categoría: ${categoryContext}

Devuelve SOLO un JSON válido con esta estructura exacta:
{
  "title": "título atractivo y SEO del artículo",
  "excerpt": "resumen de 2-3 frases para preview (max 200 chars)",
  "content": "contenido completo en HTML con h2, h3, p, ul, ol, strong. Mínimo 800 palabras. Incluye ejemplos reales, datos concretos, consejos accionables para gestores de apartamentos turísticos en España.",
  "metaTitle": "título SEO (max 60 chars)",
  "metaDescription": "descripción SEO (max 155 chars)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "tags": ["Tag1", "Tag2", "Tag3"]
}

El contenido debe ser específico para el mercado español (Airbnb, Booking, regulaciones VUT, etc.), práctico y con datos reales.`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4096,
          temperature: 0.7,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const text = data.content?.[0]?.text || ''
        const jsonStr = text.replace(/```json\s*\n?/g, '').replace(/```\s*$/g, '').trim()
        const parsed = JSON.parse(jsonStr)
        return {
          title: parsed.title || topic,
          excerpt: parsed.excerpt || '',
          content: parsed.content || generateHTMLContent(topic, categoryContext),
          metaTitle: parsed.metaTitle || `${topic} - Guía Completa 2025 | Itineramio`,
          metaDescription: parsed.metaDescription || '',
          keywords: parsed.keywords || keywords,
          tags: parsed.tags || tags,
        }
      }
    } catch (err) {
      console.error('[blog generate-ai] Claude error, using fallback:', err)
    }
  }

  // Fallback: contenido estructurado estático
  return {
    title: topic,
    excerpt: `Guía completa sobre ${topic}. Descubre estrategias probadas, consejos prácticos y mejores prácticas para optimizar tu gestión de apartamentos turísticos.`,
    content: generateHTMLContent(topic, categoryContext),
    metaTitle: `${topic} - Guía Completa 2025 | Itineramio`,
    metaDescription: `Todo lo que necesitas saber sobre ${topic}. Guía paso a paso actualizada con casos reales y estrategias comprobadas.`,
    keywords,
    tags,
  }
}

function getCategoryContext(category: string): string {
  const contexts: Record<string, string> = {
    'GUIAS': 'Esta es una guía práctica paso a paso',
    'MEJORES_PRACTICAS': 'Estás son las mejores prácticas recomendadas por expertos',
    'NORMATIVA': 'Esta es la información legal y normativa actualizada',
    'AUTOMATIZACIÓN': 'Estás son las estrategias de automatización más efectivas',
    'MARKETING': 'Estás son las técnicas de marketing probadas',
    'OPERACIONES': 'Estás son las mejores prácticas operativas',
    'CASOS_ESTUDIO': 'Este es un análisis detallado de casos reales',
    'NOTICIAS': 'Esta es la información más reciente del sector'
  }
  return contexts[category] || 'Esta es una guía completa'
}

function generateHTMLContent(topic: string, context: string): string {
  return `
<h2>Introducción</h2>
<p>En la gestión moderna de apartamentos turísticos, <strong>${topic}</strong> se ha convertido en un factor crucial para el éxito. ${context} que te ayudará a maximizar tus resultados y optimizar tu operativa.</p>

<p>A lo largo de esta guía, exploraremos en detalle los aspectos más importantes, basándonos en datos reales de más de 1,200 propiedades gestionadas y casos de éxito verificados.</p>

<h2>¿Por qué es importante ${topic}?</h2>

<p>El mercado de alquiler vacacional ha evolucionado significativamente en los últimos años. Los anfitriones que implementan estrategias efectivas en este área reportan:</p>

<ul>
  <li><strong>Aumento del 35-50% en los ingresos anuales</strong> al optimizar este aspecto</li>
  <li><strong>Reducción del 60% en tiempo de gestión</strong> mediante automatización inteligente</li>
  <li><strong>Mejora en las valoraciones</strong> de los huéspedes en un promedio de 0.8 puntos</li>
  <li><strong>Menor tasa de cancelaciones</strong> y mejor ocupación durante todo el año</li>
</ul>

<h2>Estrategias Clave para Implementar</h2>

<h3>1. Análisis y Planificación Inicial</h3>
<p>Antes de implementar cualquier cambio, es fundamental realizar un análisis exhaustivo de tu situación actual:</p>

<ul>
  <li><strong>Audita tu estado actual:</strong> Revisa métricas clave como ocupación, precio medio, reseñas y costos operativos</li>
  <li><strong>Identifica puntos de mejora:</strong> Compara con la competencia en tu zona y detecta oportunidades</li>
  <li><strong>Define objetivos claros:</strong> Establece metas SMART (específicas, medibles, alcanzables, relevantes y temporales)</li>
  <li><strong>Prepara recursos necesarios:</strong> Asegúrate de contar con las herramientas y tiempo requeridos</li>
</ul>

<h3>2. Implementación Paso a Paso</h3>

<p>La implementación efectiva requiere un enfoque estructurado:</p>

<ol>
  <li><strong>Fase de Preparación (Semana 1-2):</strong> Investiga, planifica y prepara todos los recursos necesarios</li>
  <li><strong>Fase de Implementación (Semana 3-4):</strong> Ejecuta los cambios de forma gradual y controlada</li>
  <li><strong>Fase de Optimización (Semana 5-6):</strong> Ajusta basándote en los primeros resultados y feedback</li>
  <li><strong>Fase de Consolidación (Semana 7-8):</strong> Establece procesos permanentes y automatizaciones</li>
</ol>

<h3>3. Herramientas y Recursos Recomendados</h3>

<p>Para maximizar tus resultados, considera utilizar:</p>

<ul>
  <li><strong>Automatización de comunicaciones:</strong> Mensajes automáticos que ahorran hasta 10 horas/semana</li>
  <li><strong>Pricing dinámico:</strong> Ajuste automático de precios según demanda y competencia</li>
  <li><strong>Manual digital:</strong> Información accesible 24/7 que reduce consultas en un 86%</li>
  <li><strong>Analytics avanzado:</strong> Dashboards que facilitan la toma de decisiones basada en datos</li>
</ul>

<h2>Errores Comunes a Evitar</h2>

<div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 1rem; margin: 1.5rem 0;">
  <p style="margin: 0;"><strong>⚠️ Atención:</strong> Evita estos errores frecuentes que pueden comprometer tus resultados:</p>
</div>

<ul>
  <li><strong>Implementar cambios sin medir:</strong> Siempre establece KPIs antes de comenzar</li>
  <li><strong>Copiar estrategias sin adaptar:</strong> Cada propiedad y mercado es único</li>
  <li><strong>Esperar resultados inmediatos:</strong> Los cambios significativos requieren 4-8 semanas</li>
  <li><strong>No automatizar procesos:</strong> La automatización es clave para escalar</li>
  <li><strong>Ignorar el feedback:</strong> Las reseñas de huéspedes son oro puro</li>
</ul>

<h2>Caso de Éxito Real</h2>

<div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 1rem; margin: 1.5rem 0;">
  <p><strong>📊 Ejemplo:</strong> María, anfitriona en Madrid con 3 apartamentos, implementó estás estrategias:</p>
  <ul style="margin-bottom: 0;">
    <li>Ingresos: De €3,200/mes a €5,100/mes (+59%)</li>
    <li>Ocupación: Del 62% al 84%</li>
    <li>Rating: De 4.3 a 4.9 estrellas</li>
    <li>Tiempo de gestión: De 15h/semana a 4h/semana</li>
  </ul>
</div>

<h2>Plan de Acción: Próximos Pasos</h2>

<p>Para comenzar hoy mismo, sigue este checklist:</p>

<ol>
  <li><strong>Esta semana:</strong> Realiza una auditoría completa de tu situación actual</li>
  <li><strong>Próximos 7 días:</strong> Define 3 objetivos específicos que quieres alcanzar</li>
  <li><strong>En 2 semanas:</strong> Implementa tu primer cambio y mide resultados</li>
  <li><strong>En 1 mes:</strong> Analiza datos y ajusta la estrategia según necesites</li>
  <li><strong>En 3 meses:</strong> Evalúa el impacto total y planifica el siguiente nivel</li>
</ol>

<h2>Recursos Adicionales</h2>

<p>Para profundizar en este tema, te recomendamos:</p>

<ul>
  <li>Utilizar nuestra <strong>calculadora de rentabilidad</strong> para estimar tu potencial de ingresos</li>
  <li>Descargar nuestro <strong>template de manual digital</strong> personalizable</li>
  <li>Unirte a nuestra <strong>comunidad de anfitriones</strong> para compartir experiencias</li>
  <li>Consultar nuestros <strong>casos de estudio detallados</strong> con métricas reales</li>
</ul>

<h2>Conclusión</h2>

<p>${topic} no es solo una táctica más, sino una estrategia fundamental que puede transformar completamente los resultados de tu alquiler vacacional. Los datos demuestran que los anfitriones que implementan estás prácticas de forma consistente logran:</p>

<ul>
  <li>✅ Mayor rentabilidad sostenida en el tiempo</li>
  <li>✅ Mejor experiencia para los huéspedes</li>
  <li>✅ Menor carga operativa y más tiempo libre</li>
  <li>✅ Ventaja competitiva clara en su mercado</li>
</ul>

<p>Recuerda: el éxito en la gestión de apartamentos turísticos no viene de un solo cambio grande, sino de la suma de múltiples mejoras pequeñas implementadas de forma consistente.</p>

<div style="background-color: #f3e8ff; border-radius: 8px; padding: 1.5rem; margin: 2rem 0; text-align: center;">
  <p style="margin: 0; font-size: 1.1rem;"><strong>¿Listo para dar el siguiente paso?</strong></p>
  <p style="margin: 0.5rem 0 0 0; color: #6b7280;">Empieza hoy con nuestra plataforma y automatiza la gestión de tus apartamentos turísticos.</p>
</div>
`.trim()
}

function generateKeywords(topic: string, category: string): string[] {
  const baseKeywords = [
    'apartamento turístico',
    'airbnb',
    'alquiler vacacional',
    'gestión apartamentos',
    'vivienda turística'
  ]

  const categoryKeywords: Record<string, string[]> = {
    'GUIAS': ['guía', 'cómo hacer', 'paso a paso', 'tutorial'],
    'MEJORES_PRACTICAS': ['mejores prácticas', 'consejos', 'tips', 'recomendaciones'],
    'NORMATIVA': ['normativa', 'legal', 'VUT', 'licencia', 'regulación'],
    'AUTOMATIZACIÓN': ['automatización', 'software', 'herramientas', 'tecnología'],
    'MARKETING': ['marketing', 'promoción', 'visibilidad', 'optimización'],
    'OPERACIONES': ['operaciones', 'gestión', 'administración', 'procesos'],
    'CASOS_ESTUDIO': ['caso de éxito', 'ejemplo real', 'resultados'],
    'NOTICIAS': ['actualidad', 'noticias', 'novedades', '2025']
  }

  return [
    ...baseKeywords,
    ...(categoryKeywords[category] || []),
    topic.toLowerCase()
  ]
}

function generateTags(topic: string, category: string): string[] {
  const tags = ['Guía', 'Airbnb', 'Gestión']

  const categoryTags: Record<string, string[]> = {
    'GUIAS': ['Tutorial', 'Paso a Paso'],
    'MEJORES_PRACTICAS': ['Tips', 'Consejos'],
    'NORMATIVA': ['Legal', 'VUT'],
    'AUTOMATIZACIÓN': ['Automatización', 'Tecnología'],
    'MARKETING': ['Marketing', 'SEO'],
    'OPERACIONES': ['Operaciones', 'Procesos'],
    'CASOS_ESTUDIO': ['Caso de Éxito'],
    'NOTICIAS': ['Actualidad']
  }

  return [...tags, ...(categoryTags[category] || [])]
}
