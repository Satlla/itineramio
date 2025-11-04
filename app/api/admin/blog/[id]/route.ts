import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { cookies } from 'next/headers'

// GET - Get single blog post
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const cookieStore = cookies()
    const adminToken = cookieStore.get('admin-token')

    if (!adminToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const post = await prisma.blogPost.findUnique({
      where: { id: params.id }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Artículo no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'Error al obtener artículo' },
      { status: 500 }
    )
  }
}

// PUT - Update blog post
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const cookieStore = cookies()
    const adminToken = cookieStore.get('admin-token')

    if (!adminToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: params.id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Artículo no encontrado' },
        { status: 404 }
      )
    }

    // If slug is changing, check it's unique
    if (body.slug && body.slug !== existingPost.slug) {
      const slugTaken = await prisma.blogPost.findUnique({
        where: { slug: body.slug }
      })

      if (slugTaken) {
        return NextResponse.json(
          { error: 'Ya existe un artículo con ese slug' },
          { status: 400 }
        )
      }
    }

    // Calculate read time if content changed
    let readTime = existingPost.readTime
    if (body.content && body.content !== existingPost.content) {
      const wordCount = body.content.split(/\s+/).length
      readTime = Math.max(1, Math.ceil(wordCount / 200))
    }

    // Set publishedAt if status is changing to PUBLISHED
    let publishedAt = existingPost.publishedAt
    if (body.status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED' && !publishedAt) {
      publishedAt = new Date()
    }

    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        ...(body.slug && { slug: body.slug }),
        ...(body.title && { title: body.title }),
        ...(body.subtitle !== undefined && { subtitle: body.subtitle }),
        ...(body.excerpt && { excerpt: body.excerpt }),
        ...(body.content && { content: body.content, readTime }),
        ...(body.coverImage !== undefined && { coverImage: body.coverImage }),
        ...(body.coverImageAlt !== undefined && { coverImageAlt: body.coverImageAlt }),
        ...(body.category && { category: body.category }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.featured !== undefined && { featured: body.featured }),
        ...(body.metaTitle !== undefined && { metaTitle: body.metaTitle }),
        ...(body.metaDescription !== undefined && { metaDescription: body.metaDescription }),
        ...(body.keywords !== undefined && { keywords: body.keywords }),
        ...(body.status && { status: body.status }),
        ...(body.scheduledFor !== undefined && {
          scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null
        }),
        ...(body.authorId && { authorId: body.authorId }),
        ...(body.authorName && { authorName: body.authorName }),
        ...(body.authorImage !== undefined && { authorImage: body.authorImage }),
        publishedAt
      }
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { error: 'Error al actualizar artículo' },
      { status: 500 }
    )
  }
}

// DELETE - Delete blog post
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const cookieStore = cookies()
    const adminToken = cookieStore.get('admin-token')

    if (!adminToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: params.id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Artículo no encontrado' },
        { status: 404 }
      )
    }

    await prisma.blogPost.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json(
      { error: 'Error al eliminar artículo' },
      { status: 500 }
    )
  }
}
