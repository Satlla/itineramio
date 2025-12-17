import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { getAuthUser } from '../../../../../src/lib/auth'

// GET - List approved comments for a blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Find the blog post by slug
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Artículo no encontrado' },
        { status: 404 }
      )
    }

    // Get approved comments with replies
    const comments = await prisma.blogComment.findMany({
      where: {
        postId: post.id,
        status: 'APPROVED',
        parentId: null // Only top-level comments
      },
      include: {
        replies: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      comments,
      total: comments.length
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Error al cargar comentarios' },
      { status: 500 }
    )
  }
}

// POST - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { authorName, authorEmail, content, parentId } = body

    // Validation
    if (!authorName?.trim() || !authorEmail?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Nombre, email y comentario son requeridos' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(authorEmail)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Content length validation
    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'El comentario es demasiado largo (máximo 2000 caracteres)' },
        { status: 400 }
      )
    }

    // Find the blog post
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, authorId: true }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Artículo no encontrado' },
        { status: 404 }
      )
    }

    // Check if replying to a valid comment
    if (parentId) {
      const parentComment = await prisma.blogComment.findFirst({
        where: {
          id: parentId,
          postId: post.id,
          status: 'APPROVED'
        }
      })

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Comentario padre no encontrado' },
          { status: 404 }
        )
      }
    }

    // Check if user is the blog post author
    const user = await getAuthUser(request)
    const isAuthor = user?.id === post.authorId

    // Simple spam detection
    const recentComments = await prisma.blogComment.count({
      where: {
        authorEmail,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        }
      }
    })

    if (recentComments >= 3) {
      return NextResponse.json(
        { error: 'Demasiados comentarios. Por favor espera unos minutos.' },
        { status: 429 }
      )
    }

    // Create the comment
    const comment = await prisma.blogComment.create({
      data: {
        postId: post.id,
        parentId: parentId || null,
        authorName: authorName.trim(),
        authorEmail: authorEmail.trim().toLowerCase(),
        content: content.trim(),
        isAuthor,
        // Auto-approve if author, otherwise pending
        status: isAuthor ? 'APPROVED' : 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        authorName: comment.authorName,
        content: comment.content,
        isAuthor: comment.isAuthor,
        createdAt: comment.createdAt,
        status: comment.status
      },
      message: isAuthor
        ? 'Comentario publicado'
        : 'Comentario enviado. Será visible después de ser aprobado.'
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Error al crear comentario' },
      { status: 500 }
    )
  }
}
