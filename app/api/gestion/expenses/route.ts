import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/expenses
 * List expenses with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const category = searchParams.get('category')
    const month = searchParams.get('month') // Format: "2025-01"

    // Build where clause
    const where: any = {
      userId,
      billingConfig: {
        property: {
          hostId: userId
        }
      }
    }

    if (propertyId) {
      where.billingConfig.propertyId = propertyId
    }

    if (category) {
      where.category = category
    }

    if (month) {
      const [year, monthNum] = month.split('-')
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0)
      where.date = {
        gte: startDate,
        lte: endDate
      }
    }

    const expenses = await prisma.propertyExpense.findMany({
      where,
      include: {
        billingConfig: {
          include: {
            property: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        liquidation: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    const formattedExpenses = expenses.map(expense => ({
      id: expense.id,
      date: expense.date.toISOString(),
      concept: expense.concept,
      category: expense.category,
      amount: Number(expense.amount),
      vatAmount: Number(expense.vatAmount),
      chargeToOwner: expense.chargeToOwner,
      supplierName: expense.supplierName,
      invoiceNumber: expense.invoiceNumber,
      invoiceUrl: expense.invoiceUrl,
      property: {
        id: expense.billingConfig.property.id,
        name: expense.billingConfig.property.name
      },
      liquidation: expense.liquidation
    }))

    return NextResponse.json({ expenses: formattedExpenses })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/gestion/expenses
 * Create a new expense
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const {
      propertyId,
      date,
      concept,
      category,
      amount,
      vatAmount = 0,
      chargeToOwner = true,
      supplierName,
      invoiceNumber
    } = body

    // Validar campos obligatorios
    if (!propertyId) {
      return NextResponse.json(
        { error: 'Debes seleccionar una propiedad' },
        { status: 400 }
      )
    }

    if (!date) {
      return NextResponse.json(
        { error: 'La fecha es obligatoria' },
        { status: 400 }
      )
    }

    if (!concept || concept.trim() === '') {
      return NextResponse.json(
        { error: 'El concepto es obligatorio' },
        { status: 400 }
      )
    }

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'El importe debe ser mayor que 0' },
        { status: 400 }
      )
    }

    // Get billing config for property (with ownership check in WHERE)
    const billingConfig = await prisma.propertyBillingConfig.findFirst({
      where: {
        propertyId,
        property: { hostId: userId }
      }
    })

    if (!billingConfig) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada o no configurada' },
        { status: 404 }
      )
    }

    const expense = await prisma.propertyExpense.create({
      data: {
        userId,
        billingConfigId: billingConfig.id,
        date: new Date(date),
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
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
