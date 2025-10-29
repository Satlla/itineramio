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
    
    const limits = await planLimitsService.getUserPlanLimits(decoded.userId)
    const canCreateCheck = await planLimitsService.canUserCreateProperty(decoded.userId)
    
    return NextResponse.json({
      ...limits,
      canCreateProperty: canCreateCheck.canCreate,
      creationBlockedReason: canCreateCheck.reason,
      upgradeUrl: canCreateCheck.upgradeUrl
    })
  } catch (error) {
    console.error('Error fetching plan limits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}