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
    const billingUnitId = searchParams.get('billingUnitId')
    const category = searchParams.get('category')
    const month = searchParams.get('month') // Format: "2025-01"

    // Build where clause - soporta tanto BillingUnit como PropertyBillingConfig
    const where: any = {
      userId,
      OR: [
        { billingUnitId: { not: null } },
        { billingConfig: { property: { hostId: userId } } }
      ]
    }

    if (billingUnitId) {
      where.billingUnitId = billingUnitId
      delete where.OR
    } else if (propertyId) {
      where.billingConfig = { propertyId }
      delete where.OR
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
        billingUnit: {
          select: {
            id: true,
            name: true
          }
        },
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
      // Usar billingUnit si existe, si no billingConfig
      property: expense.billingUnit
        ? { id: expense.billingUnit.id, name: expense.billingUnit.name }
        : expense.billingConfig?.property
          ? { id: expense.billingConfig.property.id, name: expense.billingConfig.property.name }
          : { id: '', name: 'Sin asignar' },
      billingUnitId: expense.billingUnitId,
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
      billingUnitId, // Nuevo: unidad de facturación independiente
      date,
      concept,
      category,
      amount,
      vatAmount = 0,
      chargeToOwner = true,
      supplierName,
      invoiceNumber
    } = body

    // Validar campos obligatorios - requiere billingUnitId O propertyId
    if (!propertyId && !billingUnitId) {
      return NextResponse.json(
        { error: 'Debes seleccionar un apartamento' },
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

    const parsedAmount = parseFloat(String(amount))
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'El importe debe ser un número mayor que 0' },
        { status: 400 }
      )
    }

    let finalBillingConfigId: string | null = null
    let finalBillingUnitId: string | null = null

    // NUEVO: Si viene billingUnitId, usar BillingUnit
    if (billingUnitId) {
      const billingUnit = await prisma.billingUnit.findFirst({
        where: { id: billingUnitId, userId }
      })
      if (!billingUnit) {
        return NextResponse.json(
          { error: 'Apartamento no encontrado' },
          { status: 404 }
        )
      }
      finalBillingUnitId = billingUnit.id
    }
    // LEGACY: Si viene propertyId, usar PropertyBillingConfig
    else if (propertyId) {
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
      finalBillingConfigId = billingConfig.id
    }

    const expense = await prisma.propertyExpense.create({
      data: {
        userId,
        billingConfigId: finalBillingConfigId,
        billingUnitId: finalBillingUnitId,
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
