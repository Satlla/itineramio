import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  TOPIC_CLUSTERS,
  getNextArticleToGenerate,
  getClusterForArticle,
  type ClusterArticle,
} from '@/lib/topicClusters'

/**
 * Cron: Genera 1 artículo diario en DRAFT a las 6:00 AM.
 * Selecciona el siguiente artículo pendiente (prioridad 1 primero).
 *
 * GET /api/cron/generate-daily
 */
export async function GET(request: NextRequest) {
  try {
    const cronSecret = request.headers.get('x-cron-secret')
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY no configurada' },
        { status: 500 }
      )
    }

    // Get existing slugs
    const existingPosts = await prisma.blogPost.findMany({
      select: { slug: true },
    })
    const existingSlugs = existingPosts.map(p => p.slug)

    // Find next article to generate
    const nextArticle = getNextArticleToGenerate(existingSlugs)
    if (!nextArticle) {
      return NextResponse.json({
        success: true,
        message: 'Todos los artículos del mapa de contenido ya están generados',
        generated: false,
      })
    }

    const cluster = getClusterForArticle(nextArticle.slug)
    if (!cluster) {
      return NextResponse.json({
        success: false,
        error: 'Cluster no encontrado para el artículo',
      })
    }

    // Generate the article
    const content = await generateWithClaude(nextArticle, cluster, ANTHROPIC_API_KEY)

    // Save as DRAFT
    const htmlContent = content.content || ''
    const wordCount = htmlContent.replace(/<[^>]*>/g, '').split(/\s+/).length
    const readTime = Math.max(1, Math.round(wordCount / 200))

    const post = await prisma.blogPost.create({
      data: {
        slug: nextArticle.slug,
        title: content.title || nextArticle.title,
        excerpt: content.excerpt || `Guía sobre ${nextArticle.keyword}`,
        content: htmlContent,
        category: nextArticle.category as any,
        tags: content.tags || [],
        featured: nextArticle.type === 'pillar',
        metaTitle: content.metaTitle || null,
        metaDescription: content.metaDescription || null,
        keywords: content.keywords || [nextArticle.keyword, ...nextArticle.secondaryKeywords],
        status: 'DRAFT',
        authorId: 'admin',
        authorName: 'Equipo Itineramio',
        readTime,
      },
    })

    return NextResponse.json({
      success: true,
      generated: true,
      article: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        cluster: cluster.id,
        type: nextArticle.type,
        priority: nextArticle.priority,
        wordCount,
        readTime,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error en generación diaria' },
      { status: 500 }
    )
  }
}

async function generateWithClaude(
  article: ClusterArticle,
  cluster: typeof TOPIC_CLUSTERS[number],
  apiKey: string,
) {
  const isPillar = article.type === 'pillar'
  const wordCount = article.estimatedWords

  const relatedLinks = cluster.articles
    .filter(a => a.slug !== article.slug)
    .slice(0, 6)
    .map(a => `- "${a.title}" → /blog/${a.slug}`)
    .join('\n')

  const faqSection = article.faqTopics.length > 0
    ? `\nIncluye sección FAQ al final:\n${article.faqTopics.map(q => `- ${q}`).join('\n')}`
    : ''

  const prompt = `Eres experto en alquiler vacacional en España. Genera artículo exhaustivo sobre: "${article.title}"
Tipo: ${isPillar ? 'PILAR' : 'CLUSTER'} | Keyword: "${article.keyword}" | Mínimo ${wordCount} palabras
Keywords secundarias: ${article.secondaryKeywords.join(', ')}
${faqSection}

Enlaces internos (integra 3-5):
${relatedLinks}

Estructura: tabla contenidos, 5+ secciones H2 con id, tablas comparativas, cajas tips/advertencias, datos reales España.
Tono experto accesible, ejemplos prácticos, consejos accionables.

Devuelve SOLO JSON:
{"title":"...","excerpt":"...","content":"HTML","metaTitle":"...","metaDescription":"...","keywords":["..."],"tags":["..."]}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
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
    throw new Error(`Claude API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text || ''
  const jsonStr = text.replace(/```json\s*\n?/g, '').replace(/```\s*$/g, '').trim()
  return JSON.parse(jsonStr)
}
