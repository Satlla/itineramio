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
    
    // Start transaction to delete all related data
    await prisma.$transaction(async (tx) => {
      // Delete all user's properties and related data
      const properties = await tx.property.findMany({
        where: { hostId: userId },
        select: { id: true }
      })
      
      for (const property of properties) {
        // Delete zones and their steps
        const zones = await tx.zone.findMany({
          where: { propertyId: property.id },
          select: { id: true }
        })
        
        for (const zone of zones) {
          // Delete steps
          await tx.step.deleteMany({
            where: { zoneId: zone.id }
          })
        }
        
        // Delete zones
        await tx.zone.deleteMany({
          where: { propertyId: property.id }
        })
        
        // Delete property views
        await tx.propertyView.deleteMany({
          where: { propertyId: property.id }
        })
        
        // Delete reviews
        await tx.review.deleteMany({
          where: { propertyId: property.id }
        })
        
        // Delete zone analytics
        await tx.zoneAnalytics.deleteMany({
          where: { 
            zone: {
              propertyId: property.id
            }
          }
        })
      }
      
      // Delete properties
      await tx.property.deleteMany({
        where: { hostId: userId }
      })
      
      // Delete property sets
      await tx.propertySet.deleteMany({
        where: { hostId: userId }
      })
      
      // Delete subscriptions
      await tx.userSubscription.deleteMany({
        where: { userId }
      })
      
      // Delete invoices
      await tx.invoice.deleteMany({
        where: { userId }
      })
      
      // Delete notifications
      await tx.notification.deleteMany({
        where: { userId }
      })
      
      // Delete email verification tokens
      await tx.emailVerificationToken.deleteMany({
        where: { email: user.email }
      })
      
      // Delete call logs
      await tx.callLog.deleteMany({
        where: { userId }
      })
      
      // Delete notes
      await tx.userNote.deleteMany({
        where: { userId }
      })
      
      // Finally, delete the user
      await tx.user.delete({
        where: { id: userId }
      })
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