import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../../../src/lib/admin-auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminAuth(req)
    if (authResult instanceof Response) return authResult

    const { id } = await params

    // Verify FAQ exists
    const existing = await prisma.frequentQuestion.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'FAQ no encontrada' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { answer, category, includeInWelcomeEmail, status, question } = body

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (answer !== undefined) updateData.answer = answer
    if (category !== undefined) updateData.category = category
    if (includeInWelcomeEmail !== undefined) updateData.includeInWelcomeEmail = includeInWelcomeEmail
    if (status !== undefined) updateData.status = status
    if (question !== undefined) updateData.question = question

    const faq = await prisma.frequentQuestion.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ faq })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar FAQ' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminAuth(req)
    if (authResult instanceof Response) return authResult

    const { id } = await params

    // Verify FAQ exists
    const existing = await prisma.frequentQuestion.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'FAQ no encontrada' },
        { status: 404 }
      )
    }

    // Soft delete: set status to ARCHIVED
    const faq = await prisma.frequentQuestion.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    })

    return NextResponse.json({ faq })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al archivar FAQ' },
      { status: 500 }
    )
  }
}
