import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const authResult = await verifyToken(request)
    if (!authResult.isValid || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const userId = authResult.user.id
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const status = searchParams.get('status')

    // Build where clause
    let whereClause: any = {
      userId: userId
    }

    if (status && status !== 'ALL') {
      whereClause.status = status
    }

    // Get total count for pagination
    const totalInvoices = await prisma.invoice.count({
      where: whereClause
    })

    // Get invoices with pagination
    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        subscription: {
          include: {
            plan: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: (page - 1) * limit
    })

    // Format the response
    const formattedInvoices = invoices.map(invoice => ({
      ...invoice,
      amount: Number(invoice.amount),
      discountAmount: Number(invoice.discountAmount),
      finalAmount: Number(invoice.finalAmount),
      subscription: invoice.subscription ? {
        ...invoice.subscription,
        plan: invoice.subscription.plan
      } : null
    }))

    // Calculate summary stats
    const totalPaid = await prisma.invoice.aggregate({
      where: {
        userId: userId,
        status: 'PAID'
      },
      _sum: {
        finalAmount: true
      }
    })

    const pendingAmount = await prisma.invoice.aggregate({
      where: {
        userId: userId,
        status: 'PENDING'
      },
      _sum: {
        finalAmount: true
      }
    })

    return NextResponse.json({
      invoices: formattedInvoices,
      pagination: {
        total: totalInvoices,
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalInvoices / limit)
      },
      summary: {
        totalPaid: Number(totalPaid._sum.finalAmount || 0),
        pendingAmount: Number(pendingAmount._sum.finalAmount || 0),
        totalInvoices
      }
    })

  } catch (error) {
    console.error('Error fetching user invoices:', error)
    return NextResponse.json(
      { error: 'Error al obtener las facturas' },
      { status: 500 }
    )
  }
}