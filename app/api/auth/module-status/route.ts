import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAuth } from '../../../../src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult
    const { userId } = authResult

    const now = new Date()

    // Check GESTION module
    const gestionModule = await prisma.userModule.findUnique({
      where: { userId_moduleType: { userId, moduleType: 'GESTION' } },
      select: { status: true, expiresAt: true, trialEndsAt: true }
    })

    const gestionActive = !!gestionModule && (
      (gestionModule.status === 'ACTIVE' && (!gestionModule.expiresAt || gestionModule.expiresAt > now)) ||
      (gestionModule.status === 'TRIAL' && gestionModule.trialEndsAt && gestionModule.trialEndsAt > now)
    )

    // Check MANUALES module
    const manualesModule = await prisma.userModule.findUnique({
      where: { userId_moduleType: { userId, moduleType: 'MANUALES' } },
      select: { status: true, expiresAt: true, trialEndsAt: true }
    })

    // Also check UserSubscription for MANUALES (legacy)
    const manualesSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { gte: now }
      },
      select: { id: true }
    })

    const manualesActive = !!manualesSubscription || (!!manualesModule && (
      (manualesModule.status === 'ACTIVE' && (!manualesModule.expiresAt || manualesModule.expiresAt > now)) ||
      (manualesModule.status === 'TRIAL' && manualesModule.trialEndsAt && manualesModule.trialEndsAt > now)
    ))

    return NextResponse.json({
      manualesActive,
      gestionActive
    })
  } catch (error) {
    console.error('Error checking module status:', error)
    return NextResponse.json(
      { error: 'Error al verificar módulos' },
      { status: 500 }
    )
  }
}
