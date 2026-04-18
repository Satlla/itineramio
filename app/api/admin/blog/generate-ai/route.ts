import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth, createActivityLog, getRequestInfo } from '@/lib/admin-auth'
import {
  TOPIC_CLUSTERS,
  getClusterForArticle,
  getRelatedArticles,
  type ClusterArticle,
  type TopicCluster,
} from '@/lib/topicClusters'

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdminAuth(req)
    if (authResult instanceof Response) {
      return authResult
    }

    const { topic, category = 'GUIAS', slug, clusterId } = await req.json()

    if (!topic) {
      return NextResponse.json(
        { error: 'El tema es requerido' },
        { status: 400 }
      )
    }

    // Find article context from topic clusters if available
    const articleContext = findArticleContext(slug, clusterId, topic)

    const generatedContent = await generateBlogContent(topic, category, articleContext)

    const { ipAddress, userAgent } = getRequestInfo(req)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'blog_ai_generated',
      targetType: 'blog_post',
      description: `Contenido AI generado para: ${topic}`,
      metadata: { topic, category, slug, clusterId },
      ipAddress,
      userAgent
    })

    return NextResponse.json({
      success: true,
      content: generatedContent
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al generar contenido' },
      { status: 500 }
    )
  }
}

// ─── Article Context from Topic Clusters ─────────────────────────────────────

interface ArticleContext {
  article: ClusterArticle
  cluster: TopicCluster
  relatedArticles: ClusterArticle[]
}

function findArticleContext(
  slug?: string,
  clusterId?: string,
  topic?: string,
): ArticleContext | null {
  // Try by slug first
  if (slug) {
    const cluster = getClusterForArticle(slug)
    if (cluster) {
      const article = cluster.articles.find(a => a.slug === slug)
      if (article) {
        return {
          article,
          cluster,
          relatedArticles: getRelatedArticles(slug),
        }
      }
    }
  }

  // Try by clusterId + topic match
  if (clusterId) {
    const cluster = TOPIC_CLUSTERS.find(c => c.id === clusterId)
    if (cluster && topic) {
      const article = cluster.articles.find(a =>
        a.title.toLowerCase().includes(topic.toLowerCase()) ||
        a.keyword.toLowerCase().includes(topic.toLowerCase())
      )
      if (article) {
        return {
          article,
          cluster,
          relatedArticles: getRelatedArticles(article.slug),
        }
      }
    }
  }

  return null
}

// ─── Content Generation ──────────────────────────────────────────────────────

async function generateBlogContent(
  topic: string,
  category: string,
  context: ArticleContext | null,
) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

  if (!ANTHROPIC_API_KEY) {
    return generateFallbackContent(topic, category, context)
  }

  try {
    const prompt = buildPrompt(topic, category, context)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16384,
        temperature: 0.6,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      return generateFallbackContent(topic, category, context)
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    const jsonStr = text.replace(/```json\s*\n?/g, '').replace(/```\s*$/g, '').trim()
    const parsed = JSON.parse(jsonStr)

    return {
      title: parsed.title || topic,
      slug: context?.article.slug || generateSlug(parsed.title || topic),
      excerpt: parsed.excerpt || '',
      content: parsed.content || '',
      metaTitle: parsed.metaTitle || `${topic} | Itineramio`,
      metaDescription: parsed.metaDescription || '',
      keywords: parsed.keywords || [],
      tags: parsed.tags || [],
      category: context?.article.category || category,
      readTime: estimateReadTime(parsed.content || ''),
    }
  } catch {
    return generateFallbackContent(topic, category, context)
  }
}

function buildPrompt(
  topic: string,
  category: string,
  context: ArticleContext | null,
): string {
  const isPillar = context?.article.type === 'pillar'
  const wordCount = context?.article.estimatedWords || (isPillar ? 5000 : 2500)
  const categoryLabel = getCategoryContext(category)

  // Build internal links section
  let internalLinksSection = ''
  if (context?.relatedArticles && context.relatedArticles.length > 0) {
    const links = context.relatedArticles
      .slice(0, 8)
      .map(a => `- "${a.title}" → /blog/${a.slug}`)
      .join('\n')
    internalLinksSection = `

ENLACES INTERNOS — Incluye de forma natural 3-5 enlaces a estos artículos relacionados dentro del texto (no al final, sino integrados en el contenido donde sean relevantes):
${links}
Formato de enlace: <a href="/blog/SLUG">texto descriptivo del enlace</a>`
  }

  // Build FAQ section
  let faqSection = ''
  if (context?.article.faqTopics && context.article.faqTopics.length > 0) {
    const faqs = context.article.faqTopics.map(q => `- ${q}`).join('\n')
    faqSection = `

SECCIÓN FAQ — Incluye al final del artículo una sección "Preguntas Frecuentes" con estas preguntas (y respuestas detalladas de 2-4 frases cada una):
${faqs}`
  }

  // Build keywords section
  let keywordsSection = ''
  if (context?.article) {
    const kws = [context.article.keyword, ...context.article.secondaryKeywords].join(', ')
    keywordsSection = `

KEYWORDS OBJETIVO — Integra estas palabras clave de forma natural en el texto (especialmente en H2, primer párrafo y conclusión):
- Principal: "${context.article.keyword}"
- Secundarias: ${context.article.secondaryKeywords.map(k => `"${k}"`).join(', ')}`
  }

  // Build lead magnet section
  let leadMagnetSection = ''
  if (context?.article.leadMagnet) {
    leadMagnetSection = `

LEAD MAGNET — Incluye una caja CTA antes de la conclusión invitando a descargar: "${context.article.leadMagnet}". Usa este HTML:
<div style="background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); border: 2px solid #c7d2fe; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: center;">
  <p style="font-size: 1.1rem; font-weight: 700; color: #312e81; margin: 0 0 8px;">📥 Descarga gratis: ${context.article.leadMagnet}</p>
  <p style="color: #4338ca; margin: 0;">Recurso exclusivo para suscriptores del blog de Itineramio</p>
</div>`
  }

  // Pillar context
  let pillarContext = ''
  if (context?.cluster) {
    pillarContext = `

CONTEXTO DEL CLUSTER — Este artículo pertenece al cluster "${context.cluster.pillarTitle}". Keyword principal del pilar: "${context.cluster.primaryKeyword}".
${isPillar ? 'Este es el ARTÍCULO PILAR del cluster — debe ser la referencia definitiva del tema, cubriendo todos los aspectos de forma exhaustiva.' : `Este es un artículo CLUSTER que profundiza en un subtema específico del pilar.`}`
  }

  return `Eres el mejor redactor SEO de contenido sobre alquiler vacacional y turístico en España. Conoces profundamente el mercado español: Airbnb, Booking, regulaciones VUT por comunidad autónoma, fiscalidad, operativa de gestión, y las necesidades reales de los anfitriones.

TAREA: Genera un artículo de blog exhaustivo y de altísima calidad sobre: "${topic}"
Categoría: ${categoryLabel}
${pillarContext}
${keywordsSection}

REQUISITOS DE CONTENIDO:
- Mínimo ${wordCount} palabras de contenido real y útil
- Tono: experto pero accesible, como un mentor que sabe de lo que habla
- Datos concretos: cifras reales del mercado español (ocupación media, precios, porcentajes)
- Ejemplos prácticos: situaciones reales que un anfitrión español reconozca
- Consejos accionables: que el lector pueda implementar hoy mismo
- Estructura clara: tabla de contenidos, H2 y H3 bien organizados
- NUNCA contenido genérico ni relleno — cada párrafo debe aportar valor

ESTRUCTURA OBLIGATORIA:
1. Tabla de contenidos con anchor links (formato: <a href="#seccion">texto</a>)
2. Introducción enganchante (sin "En este artículo vamos a..." — directo al valor)
3. Secciones principales con H2 (mínimo 5-6 secciones sustanciales)
4. Subsecciones con H3 donde sea necesario
5. Listas (ul/ol) para pasos, consejos o comparativas
6. Al menos 1 tabla HTML comparativa si el tema lo permite
7. Cajas destacadas para datos importantes o advertencias
8. ${isPillar ? 'Sección de conclusión extensa con resumen ejecutivo' : 'Conclusión con próximos pasos claros'}
${faqSection}
${internalLinksSection}
${leadMagnetSection}

FORMATO HTML:
- Usa <h2 id="seccion-slug"> para cada sección principal
- Usa <h3> para subsecciones
- Usa <strong> para destacar conceptos clave
- Usa <table> con <thead> y <tbody> para comparativas
- Cajas de advertencia: <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 8px;"><p style="margin:0;"><strong>⚠️ Importante:</strong> texto</p></div>
- Cajas de dato/tip: <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 8px;"><p style="margin:0;"><strong>💡 Consejo:</strong> texto</p></div>
- Cajas de éxito: <div style="background-color: #dcfce7; border-left: 4px solid #22c55e; padding: 16px; margin: 24px 0; border-radius: 8px;"><p style="margin:0;"><strong>✅ Caso real:</strong> texto</p></div>

Devuelve SOLO un JSON válido (sin markdown code fences alrededor):
{
  "title": "título SEO del artículo (50-65 caracteres, incluye keyword principal)",
  "excerpt": "resumen para preview (150-200 caracteres, incluye keyword)",
  "content": "contenido HTML completo del artículo",
  "metaTitle": "título para Google (max 60 chars, keyword al inicio)",
  "metaDescription": "descripción para Google (max 155 chars, incluye keyword y CTA)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"]
}`
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCategoryContext(category: string): string {
  const contexts: Record<string, string> = {
    'GUIAS': 'Guía práctica paso a paso',
    'MEJORES_PRACTICAS': 'Mejores prácticas recomendadas por expertos',
    'NORMATIVA': 'Información legal y normativa actualizada',
    'AUTOMATIZACION': 'Estrategias de automatización',
    'MARKETING': 'Técnicas de marketing probadas',
    'OPERACIONES': 'Mejores prácticas operativas',
    'CASOS_ESTUDIO': 'Análisis detallado de casos reales',
    'NOTICIAS': 'Información actualizada del sector'
  }
  return contexts[category] || 'Guía completa'
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    .replace(/-$/, '')
}

function estimateReadTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, '')
  const words = text.split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

function generateFallbackContent(
  topic: string,
  category: string,
  context: ArticleContext | null,
) {
  const categoryLabel = getCategoryContext(category)
  const keywords = context?.article
    ? [context.article.keyword, ...context.article.secondaryKeywords.slice(0, 4)]
    : ['apartamento turístico', 'airbnb', 'alquiler vacacional', 'gestión apartamentos', topic.toLowerCase()]
  const tags = context?.article
    ? [categoryLabel, 'Alquiler Vacacional', context.cluster?.primaryKeyword || 'Gestión'].filter(Boolean)
    : ['Guía', 'Airbnb', 'Gestión']

  return {
    title: context?.article.title || topic,
    slug: context?.article.slug || generateSlug(topic),
    excerpt: `Guía completa sobre ${topic}. Descubre estrategias probadas y consejos prácticos para optimizar tu gestión de alquiler vacacional.`,
    content: `<h2>Contenido en preparación</h2><p>Este artículo sobre <strong>${topic}</strong> está siendo generado. Por favor, inténtalo de nuevo en unos momentos.</p>`,
    metaTitle: `${topic} | Itineramio`,
    metaDescription: `Todo lo que necesitas saber sobre ${topic}. Guía actualizada con casos reales y estrategias comprobadas.`,
    keywords,
    tags,
    category: context?.article.category || category,
    readTime: 5,
  }
}
