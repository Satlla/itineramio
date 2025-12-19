import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { getAuthUser } from '../../../../../src/lib/auth'
import { resend, FROM_EMAIL, REPLY_TO_EMAIL } from '../../../../../src/lib/resend'
import crypto from 'crypto'

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

// Generate a secure random token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// POST - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { authorName, authorEmail, content, parentId, honeypot, captchaAnswer, captchaExpected } = body

    // Honeypot check - if filled, it's a bot
    if (honeypot) {
      // Silently reject but return success to confuse bots
      return NextResponse.json({
        success: true,
        requiresVerification: true,
        message: 'Te hemos enviado un email para verificar tu comentario.'
      })
    }

    // Math captcha verification
    if (!captchaAnswer || !captchaExpected || parseInt(captchaAnswer) !== parseInt(captchaExpected)) {
      return NextResponse.json(
        { error: 'La respuesta del captcha es incorrecta' },
        { status: 400 }
      )
    }

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
      select: { id: true, authorId: true, title: true }
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

    // Simple spam detection - rate limiting
    const recentComments = await prisma.blogComment.count({
      where: {
        authorEmail: authorEmail.trim().toLowerCase(),
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

    // Check if this email has already verified comments (trusted user)
    const hasVerifiedComments = await prisma.blogComment.count({
      where: {
        authorEmail: authorEmail.trim().toLowerCase(),
        emailVerified: true,
        status: 'APPROVED'
      }
    })

    const isTrustedUser = hasVerifiedComments > 0 || isAuthor

    // Generate verification token for new users
    const verificationToken = !isTrustedUser ? generateToken() : null

    // Create the comment
    const comment = await prisma.blogComment.create({
      data: {
        postId: post.id,
        parentId: parentId || null,
        authorName: authorName.trim(),
        authorEmail: authorEmail.trim().toLowerCase(),
        content: content.trim(),
        isAuthor,
        emailVerified: isTrustedUser,
        verificationToken,
        verificationSentAt: !isTrustedUser ? new Date() : null,
        // Auto-approve if author or trusted user, otherwise pending verification
        status: isAuthor ? 'APPROVED' : (isTrustedUser ? 'PENDING' : 'PENDING_VERIFICATION')
      }
    })

    // Send verification email if needed
    if (!isTrustedUser && verificationToken) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itineramio.com'
      const verifyUrl = `${baseUrl}/api/blog/comments/verify?token=${verificationToken}`

      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: [authorEmail.trim().toLowerCase()],
          subject: 'Verifica tu comentario en Itineramio',
          reply_to: REPLY_TO_EMAIL,
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifica tu comentario</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #7c3aed; margin: 0; font-size: 28px;">Itineramio</h1>
      <p style="color: #71717a; margin-top: 8px; font-size: 14px;">Blog para profesionales del alquiler vacacional</p>
    </div>

    <h2 style="color: #18181b; margin-bottom: 16px; font-size: 22px;">¡Hola ${authorName.trim()}!</h2>

    <p style="color: #3f3f46; line-height: 1.6; font-size: 16px;">
      Has dejado un comentario en nuestro artículo <strong>"${post.title}"</strong>.
      Para publicarlo, necesitamos verificar tu email.
    </p>

    <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="color: #6b21a8; margin: 0; font-style: italic; font-size: 15px;">"${content.trim().substring(0, 200)}${content.length > 200 ? '...' : ''}"</p>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Verificar mi comentario
      </a>
    </div>

    <p style="color: #71717a; font-size: 14px; line-height: 1.6;">
      Si no has dejado ningún comentario, puedes ignorar este email.
    </p>

    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 32px 0;">

    <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin: 0;">
      © ${new Date().getFullYear()} Itineramio. Todos los derechos reservados.
    </p>
  </div>
</body>
</html>
          `
        })
      } catch (emailError) {
        console.error('Error sending verification email:', emailError)
        // Still return success - the comment is saved, they can request resend
      }
    }

    if (isAuthor) {
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
        message: 'Comentario publicado'
      })
    }

    if (isTrustedUser) {
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
        message: 'Comentario enviado. Será visible después de ser aprobado.'
      })
    }

    // New user - requires email verification
    return NextResponse.json({
      success: true,
      requiresVerification: true,
      message: 'Te hemos enviado un email para verificar tu comentario. Revisa tu bandeja de entrada.'
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Error al crear comentario' },
      { status: 500 }
    )
  }
}
