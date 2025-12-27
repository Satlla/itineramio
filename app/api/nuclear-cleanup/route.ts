import { NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET() {
  try {
    console.log('🚨 NUCLEAR CLEANUP INITIATED')
    
    // Get all users to delete (except demo)
    const usersToDelete = await prisma.user.findMany({
      where: {
        email: {
          not: 'demo@itineramio.com'
        }
      },
      select: { id: true, email: true }
    })
    
    console.log('Users to delete:', usersToDelete.map(u => u.email))
    
    let deletedCounts = {
      tokens: 0,
      steps: 0,
      zones: 0,
      properties: 0,
      propertySets: 0,
      comments: 0,
      reports: 0,
      users: 0
    }
    
    // Step 1: Delete all verification tokens
    const deletedTokens = await prisma.emailVerificationToken.deleteMany({})
    deletedCounts.tokens = deletedTokens.count
    console.log(`✅ Deleted ${deletedTokens.count} verification tokens`)
    
    // Process each user individually
    for (const user of usersToDelete) {
      console.log(`Processing user: ${user.email}`)
      
      try {
        // Get user's properties
        const properties = await prisma.property.findMany({
          where: { hostId: user.id },
          select: { id: true }
        })
        
        // Delete steps from user's zones
        for (const property of properties) {
          const zones = await prisma.zone.findMany({
            where: { propertyId: property.id },
            select: { id: true }
          })
          
          for (const zone of zones) {
            const steps = await prisma.step.deleteMany({
              where: { zoneId: zone.id }
            })
            deletedCounts.steps += steps.count
          }
        }
        
        // Delete user's zones
        for (const property of properties) {
          const zones = await prisma.zone.deleteMany({
            where: { propertyId: property.id }
          })
          deletedCounts.zones += zones.count
        }
        
        // Delete user's properties
        const properties2 = await prisma.property.deleteMany({
          where: { hostId: user.id }
        })
        deletedCounts.properties += properties2.count
        
        // Delete user's property sets
        const propertySets = await prisma.propertySet.deleteMany({
          where: { hostId: user.id }
        })
        deletedCounts.propertySets += propertySets.count
        
        // Delete comments moderated by user
        const comments = await prisma.zoneComment.deleteMany({
          where: { moderatedBy: user.id }
        })
        deletedCounts.comments += comments.count
        
        // Delete error reports assigned to user
        const reports = await prisma.errorReport.deleteMany({
          where: { assignedTo: user.id }
        })
        deletedCounts.reports += reports.count
        
      } catch (err) {
        console.error(`Error processing user ${user.email}:`, err)
      }
    }
    
    // Finally delete all users
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          not: 'demo@itineramio.com'
        }
      }
    })
    deletedCounts.users = deletedUsers.count
    console.log(`✅ Deleted ${deletedUsers.count} users`)
    
    // Verify final state
    const finalUsers = await prisma.user.findMany({
      select: { email: true }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Nuclear cleanup completed successfully',
      deletedCounts,
      remainingUsers: finalUsers.map(u => u.email),
      processedEmails: usersToDelete.map(u => u.email)
    })
    
  } catch (error) {
    console.error('💥 Nuclear cleanup error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code
    }, { status: 500 })
  }
}