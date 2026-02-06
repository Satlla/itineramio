import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAuth } from '../../../../src/lib/auth'

// GET - Get user's referral info and stats
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request)
  if (authResult instanceof Response) {
    return authResult
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: {
        referralCode: true,
        affiliateCommission: true,
        referredUsers: {
          select: {
            id: true,
            referredUserId: true,
            type: true,
            amount: true,
            status: true,
            createdAt: true,
            referredUser: {
              select: {
                name: true,
                createdAt: true,
                subscription: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Generate referral code if not exists
    let referralCode = user.referralCode
    if (!referralCode) {
      referralCode = `REF${authResult.userId.slice(-6).toUpperCase()}`
      await prisma.user.update({
        where: { id: authResult.userId },
        data: { referralCode }
      })
    }

    // Calculate stats
    const referrals = user.referredUsers || []
    const totalReferrals = referrals.length
    const activeReferrals = referrals.filter(r => r.referredUser.subscription).length
    const pendingCommission = referrals
      .filter(r => r.status === 'PENDING')
      .reduce((sum, r) => sum + Number(r.amount), 0)
    const paidCommission = referrals
      .filter(r => r.status === 'PAID')
      .reduce((sum, r) => sum + Number(r.amount), 0)

    // Build referral link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'
    const referralLink = `${baseUrl}/register?ref=${referralCode}`

    return NextResponse.json({
      referralCode,
      referralLink,
      stats: {
        totalReferrals,
        activeReferrals,
        pendingCommission,
        paidCommission,
        totalCommission: Number(user.affiliateCommission) || 0
      },
      referrals: referrals.map(r => ({
        id: r.id,
        name: r.referredUser.name,
        joinedAt: r.referredUser.createdAt,
        subscription: r.referredUser.subscription,
        commission: Number(r.amount),
        status: r.status
      }))
    })
  } catch (error) {
    console.error('Error getting referral info:', error)
    return NextResponse.json(
      { error: 'Error al obtener información de referidos' },
      { status: 500 }
    )
  }
}
