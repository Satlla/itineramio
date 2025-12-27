import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { cookies } from 'next/headers'

// GET - List all blog posts
export async function GET(req: NextRequest) {
  try {
    // Check admin authentication
    const cookieStore = cookies()
    const adminToken = cookieStore.get('admin-token')

    if (!adminToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const posts = await prisma.blogPost.findMany({
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Error al obtener artículos' },
      { status: 500 }
    )
  }
}

// POST - Create new blog post
export async function POST(req: NextRequest) {
  try {
    // Check admin authentication
    const cookieStore = cookies()
    const adminToken = cookieStore.get('admin-token')

    if (!adminToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()

    // Generate slug from title if not provided
    const slug = body.slug || generateSlug(body.title)

    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug }
    })

    if (existingPost) {
      return NextResponse.json(
        { error: 'Ya existe un artículo con ese slug' },
        { status: 400 }
      )
    }

    // Estimate read time based on content length (assuming 200 words per minute)
    const wordCount = body.content.split(/\s+/).length
    const readTime = Math.max(1, Math.ceil(wordCount / 200))

    const post = await prisma.blogPost.create({
      data: {
        slug,
        title: body.title,
        subtitle: body.subtitle || null,
        excerpt: body.excerpt,
        content: body.content,
        coverImage: body.coverImage || null,
        coverImageAlt: body.coverImageAlt || null,
        category: body.category,
        tags: body.tags || [],
        featured: body.featured || false,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        keywords: body.keywords || [],
        status: body.status || 'DRAFT',
        publishedAt: body.status === 'PUBLISHED' ? new Date() : null,
        scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
        authorId: 'admin',
        authorName: body.authorName || 'Equipo Itineramio',
        readTime
      }
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'Error al crear artículo' },
      { status: 500 }
    )
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}
