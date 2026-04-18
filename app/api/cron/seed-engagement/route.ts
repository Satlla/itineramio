import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Cron: Genera comentarios seed para artículos recién publicados.
 * Se ejecuta cada 4 horas. Solo genera comentarios para artículos
 * publicados en los últimos 14 días que tengan menos de sus comentarios objetivo.
 *
 * Los comentarios se guardan como PENDING para aprobación del admin.
 *
 * Mix de comentarios:
 * - 60% positivos con matiz
 * - 25% preguntas genuinas
 * - 15% críticos constructivos
 *
 * Escalonamiento: máximo 1 comentario por artículo por ejecución del cron.
 *
 * GET /api/cron/seed-engagement
 */
export async function GET(request: NextRequest) {
  try {
    const cronSecret = request.headers.get('x-cron-secret')
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 500 })
    }

    const now = new Date()
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // Find recently published articles
    const recentPosts = await prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          gte: fourteenDaysAgo,
        },
      },
      include: {
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { publishedAt: 'asc' },
    })

    if (recentPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay artículos recientes para generar engagement',
        generated: 0,
      })
    }

    const generated: Array<{ postTitle: string; commentType: string }> = []

    for (const post of recentPosts) {
      const targetComments = post.featured ? 7 : 3
      const currentComments = post._count.comments

      if (currentComments >= targetComments) continue

      // Determine what type of comment to generate based on position
      const commentType = getCommentType(currentComments)
      const daysSincePublished = Math.floor(
        (now.getTime() - (post.publishedAt?.getTime() || now.getTime())) / (24 * 60 * 60 * 1000)
      )

      // Escalonamiento: solo generar si el tiempo es adecuado
      const minDaysForPosition: Record<number, number> = {
        0: 0,  // Día 0: primer comentario
        1: 1,  // Día 1: segundo
        2: 3,  // Día 3: tercero
        3: 7,  // Día 7: cuarto
        4: 10, // Día 10: quinto (reply)
        5: 12, // Día 12: sexto
        6: 14, // Día 14: séptimo
      }

      const minDays = minDaysForPosition[currentComments] ?? 14
      if (daysSincePublished < minDays) continue

      // Generate the comment
      const comment = await generateComment(post, commentType, currentComments, ANTHROPIC_API_KEY)
      if (!comment) continue

      // Find parent comment for replies (position 4+)
      let parentId: string | null = null
      if (commentType === 'reply') {
        const existingComments = await prisma.blogComment.findMany({
          where: { postId: post.id, parentId: null },
          orderBy: { createdAt: 'asc' },
          take: 1,
        })
        if (existingComments.length > 0) {
          parentId = existingComments[0].id
        }
      }

      await prisma.blogComment.create({
        data: {
          postId: post.id,
          parentId,
          authorName: comment.authorName,
          authorEmail: comment.authorEmail,
          content: comment.content,
          status: 'PENDING',
          emailVerified: true,
          verifiedAt: now,
          isAuthor: false,
        },
      })

      generated.push({ postTitle: post.title, commentType })

      // Max 3 comments per cron execution to avoid overloading
      if (generated.length >= 3) break
    }

    return NextResponse.json({
      success: true,
      generated: generated.length,
      details: generated,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error en generación de engagement' },
      { status: 500 }
    )
  }
}

// ─── Comment type based on position ──────────────────────────────────────────

type CommentType = 'question' | 'positive' | 'critical' | 'experience' | 'reply'

function getCommentType(position: number): CommentType {
  // Escalonamiento diseñado para credibilidad
  const sequence: CommentType[] = [
    'question',      // Día 0: pregunta genuina
    'positive',      // Día 1: experiencia positiva con matiz
    'critical',      // Día 3: crítico constructivo
    'experience',    // Día 7: aportación complementaria
    'reply',         // Día 10: respuesta a comentario anterior
    'positive',      // Día 12: otra experiencia
    'question',      // Día 14: otra pregunta
  ]
  return sequence[position % sequence.length]
}

// ─── Spanish names pool ──────────────────────────────────────────────────────

const NAMES = [
  'María García', 'Carlos Rodríguez', 'Ana Martínez', 'David López',
  'Laura Sánchez', 'Miguel Fernández', 'Carmen Ruiz', 'Javier Díaz',
  'Patricia Moreno', 'Alberto Torres', 'Elena Romero', 'Francisco Navarro',
  'Isabel Domínguez', 'Roberto Vázquez', 'Marta Ramos', 'Alejandro Gil',
  'Cristina Molina', 'Fernando Ortega', 'Lucía Serrano', 'Pablo Jiménez',
  'Raquel Muñoz', 'Sergio Alonso', 'Natalia Guerrero', 'Daniel Peña',
  'Silvia Herrero', 'Andrés Blanco', 'Beatriz Medina', 'Óscar Castro',
  'Teresa Cortés', 'Víctor Garrido',
]

function getRandomName(position: number): string {
  // Deterministic but varied per position
  return NAMES[position % NAMES.length]
}

function generateEmail(name: string): string {
  const clean = name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.')
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.es', 'outlook.com']
  return `${clean}@${domains[Math.floor(Math.random() * domains.length)]}`
}

// ─── Generate comment with Claude ────────────────────────────────────────────

async function generateComment(
  post: { title: string; content: string; category: string },
  type: CommentType,
  position: number,
  apiKey: string,
): Promise<{ authorName: string; authorEmail: string; content: string } | null> {
  const authorName = getRandomName(position)
  const authorEmail = generateEmail(authorName)

  // Extract first 500 chars of content for context
  const contentPreview = post.content
    .replace(/<[^>]*>/g, '')
    .slice(0, 500)

  const typeInstructions: Record<CommentType, string> = {
    question: `Escribe una PREGUNTA genuina sobre el tema. Como alguien que ha leído el artículo y quiere saber más sobre un aspecto específico. Ejemplo: "¿Esto aplica también para...?" o "¿Alguien sabe si en [ciudad] funciona igual?"`,
    positive: `Escribe un comentario POSITIVO CON MATIZ. No perfecto ni entusiasta, sino realista. Como alguien que lo probó y le funcionó pero con algún detalle. Ejemplo: "Nosotros lo implementamos y nos fue bien, aunque tardamos un par de semanas en verlo..."`,
    critical: `Escribe un comentario CRÍTICO CONSTRUCTIVO. Señala algo que falta en el artículo o una perspectiva diferente. No agresivo, sino respetuoso pero directo. Ejemplo: "Buen artículo pero echo en falta mención a... que es bastante relevante en mi experiencia"`,
    experience: `Escribe una APORTACIÓN COMPLEMENTARIA. Comparte una experiencia o tip adicional que no está en el artículo. Como alguien con experiencia real. Ejemplo: "Nosotros hacemos algo parecido pero añadimos [detalle] y nos ha funcionado genial"`,
    reply: `Escribe una RESPUESTA a otro comentario. Muestra acuerdo parcial o añade información. Breve y conversacional. Ejemplo: "Coincido totalmente, en nuestro caso además..."`,
  }

  const prompt = `Genera un comentario de blog en español para este artículo:
Título: "${post.title}"
Categoría: ${post.category}
Contenido (extracto): "${contentPreview}..."

Tipo de comentario: ${typeInstructions[type]}

REGLAS:
- Máximo 2-3 frases (comentarios cortos y naturales)
- Tono coloquial español (no formal ni perfecto)
- Puede tener alguna falta menor de puntuación o acento (naturalidad)
- NO uses emojis excesivos (máximo 0-1)
- NO menciones "Itineramio" ni hagas publicidad
- SÍ menciona detalles específicos del artículo para que parezca que lo leyó
- El autor se llama "${authorName}" y es anfitrión/gestor de alquiler vacacional en España

Devuelve SOLO el texto del comentario, sin comillas ni formato JSON.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        temperature: 0.8,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) return null

    const data = await response.json()
    const text = data.content?.[0]?.text?.trim() || ''
    if (!text || text.length < 10) return null

    return { authorName, authorEmail, content: text }
  } catch {
    return null
  }
}
