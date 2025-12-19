import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../../../src/lib/admin-auth'

// PATCH - Update comment status (approve/reject/spam)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const { id } = await params
    const body = await request.json()
    const { action } = body

    if (!['approve', 'reject', 'spam'].includes(action)) {
      return NextResponse.json(
        { error: 'Acción no válida' },
        { status: 400 }
      )
    }

    const statusMap: Record<string, string> = {
      approve: 'APPROVED',
      reject: 'REJECTED',
      spam: 'SPAM'
    }

    const comment = await prisma.blogComment.update({
      where: { id },
      data: { status: statusMap[action] }
    })

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        status: comment.status
      }
    })
  } catch (error) {
    console.error('Error updating comment:', error)
    return NextResponse.json(
      { error: 'Error al actualizar comentario' },
      { status: 500 }
    )
  }
}

// DELETE - Delete comment permanently
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const { id } = await params

    await prisma.blogComment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Error al eliminar comentario' },
      { status: 500 }
    )
  }
}
