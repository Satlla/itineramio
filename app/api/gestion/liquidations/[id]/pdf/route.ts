import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateLiquidationHTML, LiquidationData } from '@/lib/liquidation-generator'

/**
 * GET /api/gestion/liquidations/[id]/pdf
 * Generar HTML/PDF de liquidación
 */
export async function GET(
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

    const liquidation = await prisma.liquidation.findFirst({
      where: { id, userId },
      include: {
        owner: true,
        reservations: {
          include: {
            billingConfig: {
              include: {
                property: {
                  select: { name: true },
                },
              },
            },
          },
          orderBy: { checkIn: 'asc' },
        },
        expenses: {
          include: {
            billingConfig: {
              include: {
                property: {
                  select: { name: true },
                },
              },
            },
          },
          orderBy: { date: 'asc' },
        },
      },
    })

    if (!liquidation) {
      return NextResponse.json(
        { error: 'Liquidación no encontrada' },
        { status: 404 }
      )
    }

    // Obtener configuración del gestor
    const managerConfig = await prisma.userInvoiceConfig.findUnique({
      where: { userId },
    })

    if (!managerConfig) {
      return NextResponse.json(
        { error: 'Configure los datos de facturación primero' },
        { status: 400 }
      )
    }

    // Construir datos para el generador
    const data: LiquidationData = {
      id: liquidation.id,
      year: liquidation.year,
      month: liquidation.month,
      status: liquidation.status,
      createdAt: liquidation.createdAt.toISOString(),
      owner: {
        name: liquidation.owner.type === 'EMPRESA'
          ? liquidation.owner.companyName || ''
          : `${liquidation.owner.firstName} ${liquidation.owner.lastName}`,
        nif: liquidation.owner.type === 'EMPRESA'
          ? liquidation.owner.cif || ''
          : liquidation.owner.nif || '',
        email: liquidation.owner.email || undefined,
        address: liquidation.owner.address || undefined,
        city: liquidation.owner.city || undefined,
        postalCode: liquidation.owner.postalCode || undefined,
        country: liquidation.owner.country || undefined,
        iban: liquidation.owner.iban || undefined,
      },
      manager: {
        businessName: managerConfig.businessName,
        nif: managerConfig.nif,
        address: managerConfig.address,
        city: managerConfig.city,
        postalCode: managerConfig.postalCode,
        country: managerConfig.country,
        email: managerConfig.email || undefined,
        phone: managerConfig.phone || undefined,
        logoUrl: managerConfig.logoUrl || undefined,
        iban: managerConfig.iban || undefined,
        bic: managerConfig.bic || undefined,
        bankName: managerConfig.bankName || undefined,
      },
      totals: {
        totalIncome: Number(liquidation.totalIncome),
        totalCommission: Number(liquidation.totalCommission),
        totalCommissionVat: Number(liquidation.totalCommissionVat),
        totalCleaning: Number(liquidation.totalCleaning),
        totalExpenses: Number(liquidation.totalExpenses),
        totalAmount: Number(liquidation.totalAmount),
      },
      reservations: liquidation.reservations.map((r) => ({
        confirmationCode: r.confirmationCode || '',
        guestName: r.guestName || '',
        checkIn: r.checkIn.toISOString(),
        checkOut: r.checkOut.toISOString(),
        nights: r.nights || 0,
        platform: r.platform || '',
        hostEarnings: Number(r.hostEarnings || 0),
        property: r.billingConfig?.property?.name || 'N/A',
      })),
      expenses: liquidation.expenses.map((e) => ({
        date: e.date.toISOString(),
        concept: e.concept,
        category: e.category,
        amount: Number(e.amount || 0),
        vatAmount: Number(e.vatAmount || 0),
        property: e.billingConfig?.property?.name || 'N/A',
      })),
      notes: liquidation.notes || undefined,
    }

    const html = generateLiquidationHTML(data)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="liquidacion-${liquidation.year}-${String(liquidation.month).padStart(2, '0')}.html"`,
      },
    })
  } catch (error) {
    console.error('Error generating liquidation PDF:', error)
    return NextResponse.json(
      { error: 'Error al generar el PDF' },
      { status: 500 }
    )
  }
}
