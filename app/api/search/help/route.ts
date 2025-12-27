import { NextRequest, NextResponse } from 'next/server'
import { HELP_CONTENT, HelpContent } from '../../../../src/data/help-content'
import { prisma } from '../../../../src/lib/prisma'

// Función para normalizar texto: quita tildes, convierte a minúsculas
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita diacríticos (tildes, etc.)
    .replace(/[ñ]/g, 'n')
    .replace(/[ü]/g, 'u')
}

// Función para buscar con tolerancia
function fuzzyMatch(text: string, query: string): boolean {
  const normalizedText = normalizeText(text)
  const normalizedQuery = normalizeText(query)

  // Búsqueda directa normalizada
  if (normalizedText.includes(normalizedQuery)) {
    return true
  }

  // Buscar cada palabra del query
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2)
  if (queryWords.length > 1) {
    // Si tiene múltiples palabras, buscar que al menos 60% coincidan
    const matches = queryWords.filter(word => normalizedText.includes(word))
    return matches.length >= Math.ceil(queryWords.length * 0.6)
  }

  return false
}

// Mapeo de categorías del blog a nombres legibles
const BLOG_CATEGORY_LABELS: Record<string, string> = {
  GUIAS: 'Guías',
  MEJORES_PRACTICAS: 'Mejores Prácticas',
  NORMATIVA: 'Normativa y Legal',
  AUTOMATIZACION: 'Automatización',
  MARKETING: 'Marketing',
  OPERACIONES: 'Operaciones',
  CASOS_ESTUDIO: 'Casos de Estudio',
  NOTICIAS: 'Noticias'
}

export interface UnifiedSearchResult {
  id: string
  type: 'faq' | 'guide' | 'resource' | 'tutorial' | 'blog'
  source: 'help' | 'blog'  // De dónde viene: Centro de Ayuda o Blog
  sourceLabel: string      // Etiqueta: "Centro de Ayuda" o "Blog"
  title: string
  description: string
  content?: string
  tags: string[]
  url: string
  category: string         // Categoría específica dentro de la fuente
  score?: number
  // Campos adicionales para blog
  readTime?: number
  publishedAt?: Date
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')?.toLowerCase().trim()

    if (!query || query.length < 2) {
      return NextResponse.json({
        results: [],
        total: 0,
        query: query || ''
      })
    }

    // 1. BUSCAR EN CONTENIDO ESTÁTICO DE AYUDA
    const helpResults: UnifiedSearchResult[] = HELP_CONTENT.filter((item) => {
      const searchText = `${item.title} ${item.description} ${item.content} ${item.tags.join(' ')}`
      return fuzzyMatch(searchText, query)
    }).map((item) => {
      let score = 0
      if (fuzzyMatch(item.title, query)) score += 10
      if (fuzzyMatch(item.description, query)) score += 5
      if (item.tags.some(tag => fuzzyMatch(tag, query))) score += 3
      if (fuzzyMatch(item.content, query)) score += 1

      return {
        id: item.id,
        type: item.type,
        source: 'help' as const,
        sourceLabel: 'Centro de Ayuda',
        title: item.title,
        description: item.description,
        content: item.content,
        tags: item.tags,
        url: item.url,
        category: item.category,
        score
      }
    })

    // 2. BUSCAR EN ARTÍCULOS DEL BLOG (BD)
    let blogResults: UnifiedSearchResult[] = []
    try {
      // Normalizar query para búsqueda más tolerante
      const normalizedQuery = normalizeText(query)

      const blogPosts = await prisma.blogPost.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { title: { contains: normalizedQuery, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: normalizedQuery, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { content: { contains: normalizedQuery, mode: 'insensitive' } },
            { tags: { hasSome: [query] } },
            { tags: { hasSome: [normalizedQuery] } },
            { keywords: { hasSome: [query] } },
            { keywords: { hasSome: [normalizedQuery] } }
          ]
        },
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          category: true,
          tags: true,
          readTime: true,
          publishedAt: true
        },
        take: 20,
        orderBy: { publishedAt: 'desc' }
      })

      blogResults = blogPosts.map((post) => {
        let score = 0

        if (fuzzyMatch(post.title, query)) score += 10
        if (fuzzyMatch(post.excerpt, query)) score += 5
        if (post.tags.some(tag => fuzzyMatch(tag, query))) score += 3

        // Boost para artículos recientes (publicados en últimos 30 días)
        if (post.publishedAt) {
          const daysSincePublished = (Date.now() - new Date(post.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
          if (daysSincePublished < 30) score += 2
        }

        return {
          id: post.id,
          type: 'blog' as const,
          source: 'blog' as const,
          sourceLabel: 'Blog',
          title: post.title,
          description: post.excerpt,
          tags: post.tags,
          url: `/blog/${post.slug}`,
          category: BLOG_CATEGORY_LABELS[post.category] || post.category,
          score,
          readTime: post.readTime,
          publishedAt: post.publishedAt || undefined
        }
      })
    } catch (dbError) {
      console.error('Error buscando en blog:', dbError)
      // Si falla la BD, continuamos solo con resultados estáticos
    }

    // 3. COMBINAR Y ORDENAR TODOS LOS RESULTADOS
    const allResults = [...helpResults, ...blogResults]
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 15) // Limitar a 15 resultados

    // 4. AGRUPAR POR FUENTE (para mostrar secciones)
    const groupedBySource = allResults.reduce((acc, item) => {
      if (!acc[item.source]) {
        acc[item.source] = []
      }
      acc[item.source].push(item)
      return acc
    }, {} as Record<string, UnifiedSearchResult[]>)

    // 5. AGRUPAR POR TIPO (para compatibilidad)
    const groupedByType = allResults.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = []
      }
      acc[item.type].push(item)
      return acc
    }, {} as Record<string, UnifiedSearchResult[]>)

    return NextResponse.json({
      results: allResults,
      grouped: groupedByType,
      groupedBySource,
      total: allResults.length,
      totalHelp: helpResults.length,
      totalBlog: blogResults.length,
      query
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Error en la búsqueda' },
      { status: 500 }
    )
  }
}
