import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAuth } from '../../../../src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult
    const { userId } = authResult

    const pendingRequest = await prisma.subscriptionRequest.findFirst({
      where: {
        userId,
        status: 'PENDING',
        moduleType: 'GESTION'
      },
      select: {
        id: true,
        requestedAt: true,
        totalAmount: true,
        paymentMethod: true
      }
    })

    return NextResponse.json({
      hasPending: !!pendingRequest,
      request: pendingRequest ? {
        ...pendingRequest,
        totalAmount: Number(pendingRequest.totalAmount)
      } : null
    })
  } catch (error) {
    console.error('Error checking pending module request:', error)
    return NextResponse.json(
      { error: 'Error al verificar solicitud pendiente' },
      { status: 500 }
    )
  }
}
