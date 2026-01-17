import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../../src/lib/admin-auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const { id } = await params

    // Check if coupon exists
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        uses: true
      }
    })

    if (!coupon) {
      return NextResponse.json({
        error: 'Coupon not found'
      }, { status: 404 })
    }

    // If coupon has been used, soft delete by deactivating instead of hard delete
    if (coupon.uses.length > 0) {
      await prisma.coupon.update({
        where: { id },
        data: { isActive: false }
      })

      return NextResponse.json({
        success: true,
        message: 'Coupon has been deactivated (has usage history)',
        softDeleted: true
      })
    }

    // Hard delete if no uses
    await prisma.coupon.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
