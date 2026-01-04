import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return redirectWithMessage('error', 'Token de verificación no proporcionado')
    }

    // Find the comment with this token
    const comment = await prisma.blogComment.findFirst({
      where: {
        verificationToken: token,
        status: 'PENDING_VERIFICATION'
      },
      include: {
        post: {
          select: {
            slug: true,
            title: true
          }
        }
      }
    })

    if (!comment) {
      return redirectWithMessage('error', 'Token inválido o comentario ya verificado')
    }

    // Check if token is expired (24 hours)
    if (comment.verificationSentAt) {
      const expirationTime = 24 * 60 * 60 * 1000 // 24 hours
      const tokenAge = Date.now() - comment.verificationSentAt.getTime()

      if (tokenAge > expirationTime) {
        // Delete expired comment
        await prisma.blogComment.delete({
          where: { id: comment.id }
        })
        return redirectWithMessage('error', 'El enlace de verificación ha expirado. Por favor, envía tu comentario de nuevo.')
      }
    }

    // Verify the comment
    await prisma.blogComment.update({
      where: { id: comment.id },
      data: {
        status: 'PENDING', // Move to pending approval
        emailVerified: true,
        verifiedAt: new Date(),
        verificationToken: null // Clear the token
      }
    })

    // Redirect to the blog post with success message
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'
    const redirectUrl = new URL(`/blog/${comment.post.slug}`, baseUrl)
    redirectUrl.searchParams.set('verified', 'true')

    return NextResponse.redirect(redirectUrl.toString())
  } catch (error) {
    console.error('Error verifying comment:', error)
    return redirectWithMessage('error', 'Error al verificar el comentario')
  }
}

function redirectWithMessage(type: 'success' | 'error', message: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'
  const redirectUrl = new URL('/blog', baseUrl)
  redirectUrl.searchParams.set(type, message)
  return NextResponse.redirect(redirectUrl.toString())
}
