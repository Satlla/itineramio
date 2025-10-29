import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../../../src/lib/admin-auth'

export async function DELETE(
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
    
    const userId = params.id
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            properties: true,
            propertySets: true
          }
        }
      }
    })
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }
    
    // Don't allow deleting admin users
    if (user.isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot delete admin users' 
      }, { status: 403 })
    }
    
    // Start transaction to delete all related data with timeout
    await prisma.$transaction(async (tx) => {
      // Get all property and zone IDs first
      const properties = await tx.property.findMany({
        where: { hostId: userId },
        select: {
          id: true,
          zones: { select: { id: true } }
        }
      })

      const propertyIds = properties.map(p => p.id)
      const zoneIds = properties.flatMap(p => p.zones.map(z => z.id))

      // Batch delete zone-related data (much faster than loops)
      if (zoneIds.length > 0) {
        await tx.zoneRating.deleteMany({ where: { zoneId: { in: zoneIds } } })
        await tx.step.deleteMany({ where: { zoneId: { in: zoneIds } } })
        await tx.zoneComment.deleteMany({ where: { zoneId: { in: zoneIds } } })
        await tx.zoneAnalytics.deleteMany({ where: { zoneId: { in: zoneIds } } })
      }

      // Batch delete property-related data
      if (propertyIds.length > 0) {
        await tx.zone.deleteMany({ where: { propertyId: { in: propertyIds } } })
        await tx.propertyAnalytics.deleteMany({ where: { propertyId: { in: propertyIds } } })
        await tx.propertyView.deleteMany({ where: { propertyId: { in: propertyIds } } })
        await tx.review.deleteMany({ where: { propertyId: { in: propertyIds } } })
      }

      // Delete properties
      await tx.property.deleteMany({ where: { hostId: userId } })

      // Delete all user-related data in parallel batches
      await Promise.all([
        tx.propertySet.deleteMany({ where: { hostId: userId } }),
        tx.subscriptionRequest.deleteMany({ where: { userId } }),
        tx.userSubscription.deleteMany({ where: { userId } }),
        tx.invoice.deleteMany({ where: { userId } }),
        tx.notification.deleteMany({ where: { userId } }),
        tx.emailVerificationToken.deleteMany({ where: { email: user.email } }),
        tx.emailChangeToken.deleteMany({ where: { userId } }),
        tx.callLog.deleteMany({ where: { userId } }),
        tx.userNote.deleteMany({ where: { userId } }),
        tx.trackingEvent.deleteMany({ where: { userId } }),
        tx.mediaLibrary.deleteMany({ where: { userId } }),
        tx.couponUse.deleteMany({ where: { userId } }),
        tx.affiliateTransaction.deleteMany({
          where: { OR: [{ referrerId: userId }, { referredUserId: userId }] }
        }),
        tx.organization_members.deleteMany({ where: { userId } }),
        tx.userInspirationState.deleteMany({ where: { userId } }),
        tx.zoneView.deleteMany({ where: { hostId: userId } }),
        tx.billingInfo.deleteMany({ where: { userId } })
      ])

      // Update operations (unassign, don't delete)
      await Promise.all([
        tx.errorReport.updateMany({
          where: { assignedTo: userId },
          data: { assignedTo: null }
        }),
        tx.zoneComment.updateMany({
          where: { moderatedBy: userId },
          data: { moderatedBy: null }
        })
      ])

      // Finally, delete the user
      await tx.user.delete({ where: { id: userId } })
    }, {
      timeout: 30000 // 30 second timeout for the transaction
    })
    
    // Log activity
    const adminUser = await prisma.user.findFirst({
      where: { isAdmin: true },
      select: { id: true }
    })
    
    if (adminUser) {
      await prisma.adminActivityLog.create({
        data: {
          adminUserId: adminUser.id,
          action: 'user_deleted',
          targetType: 'user',
          targetId: userId,
          description: `Deleted user ${user.email}`,
          metadata: { 
            userName: user.name,
            userEmail: user.email,
            propertiesDeleted: user._count.properties,
            propertySetsDeleted: user._count.propertySets
          }
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'User and all related data deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error deleting user. Some related data may prevent deletion.' 
    }, { status: 500 })
  }
}