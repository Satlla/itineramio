import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * PUT /api/gestion/expenses/[id]
 * Update an expense
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    const { id } = await params

    // Check ownership (filter in WHERE, not after)
    const existing = await prisma.propertyExpense.findFirst({
      where: { id, userId },
      include: { liquidation: true }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Gasto no encontrado' },
        { status: 404 }
      )
    }

    if (existing.liquidation) {
      return NextResponse.json(
        { error: 'No se puede editar un gasto ya liquidado' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      date,
      concept,
      category,
      amount,
      vatAmount,
      chargeToOwner,
      supplierName,
      invoiceNumber
    } = body

    const expense = await prisma.propertyExpense.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        concept,
        category,
        amount,
        vatAmount,
        chargeToOwner,
        supplierName,
        invoiceNumber
      }
    })

    return NextResponse.json({ expense })
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/gestion/expenses/[id]
 * Delete an expense
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    const { id } = await params

    // Check ownership (filter in WHERE, not after)
    const existing = await prisma.propertyExpense.findFirst({
      where: { id, userId },
      include: { liquidation: true }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Gasto no encontrado' },
        { status: 404 }
      )
    }

    if (existing.liquidation) {
      return NextResponse.json(
        { error: 'No se puede eliminar un gasto ya liquidado' },
        { status: 400 }
      )
    }

    await prisma.propertyExpense.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
