import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { getAdminUser } from '../../../../src/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'ALL'

    // Build where clause based on status filter
    let whereClause: any = {}
    if (status !== 'ALL') {
      whereClause.status = status
    }

    const requests = await prisma.subscriptionRequest.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        plan: {
          select: {
            name: true,
            priceMonthly: true
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // PENDING first
        { requestedAt: 'desc' }
      ]
    })

    // Format the response
    const formattedRequests = requests.map(request => ({
      ...request,
      totalAmount: Number(request.totalAmount),
      plan: request.plan ? {
        ...request.plan,
        priceMonthly: Number(request.plan.priceMonthly)
      } : null
    }))

    return NextResponse.json(formattedRequests)

  } catch (error) {
    console.error('Error fetching subscription requests:', error)
    return NextResponse.json(
      { error: 'Error al obtener las solicitudes' },
      { status: 500 }
    )
  }
}