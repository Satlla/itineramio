import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../../../src/lib/admin-auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const { isActive } = await request.json()
    
    // Update coupon status
    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: { isActive }
    })
    
    return NextResponse.json({ 
      success: true,
      coupon,
      message: `Cupón ${coupon.code} ${isActive ? 'activado' : 'desactivado'} exitosamente`
    })
    
  } catch (error) {
    console.error('Error toggling coupon:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}