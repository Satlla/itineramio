import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '../../../../src/lib/auth'
import { planLimitsService } from '../../../../src/lib/plan-limits'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 })
    }

    const decoded = verifyToken(token)

    // Get plan limits ONCE (avoids duplicate queries)
    const limits = await planLimitsService.getUserPlanLimits(decoded.userId)

    // Derive canCreate from limits data (no extra queries needed)
    const canCreateProperty = limits.canCreateMore
    const upgradeUrl = '/account/billing'
    let creationBlockedReason: string | undefined

    if (!canCreateProperty) {
      if (limits.upgradeRequired) {
        creationBlockedReason = limits.upgradeMessage || 'Has alcanzado el límite de tu plan actual'
      } else {
        creationBlockedReason = `Has alcanzado el límite de ${limits.maxProperties} propiedades de tu plan ${limits.planName}`
      }
    }

    return NextResponse.json({
      ...limits,
      canCreateProperty,
      creationBlockedReason,
      upgradeUrl: canCreateProperty ? undefined : upgradeUrl
    })
  } catch (error) {
    console.error('Error fetching plan limits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}