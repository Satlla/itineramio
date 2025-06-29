import { NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET() {
  try {
    console.log('🧹 Starting comprehensive cleanup...')
    
    // First, get all users except demo
    const usersToDelete = await prisma.user.findMany({
      where: {
        email: {
          not: 'demo@itineramio.com'
        }
      },
      select: {
        id: true,
        email: true
      }
    })
    
    console.log(`Found ${usersToDelete.length} users to delete:`, usersToDelete.map(u => u.email))
    
    // Delete in proper order to avoid foreign key constraints
    let deletedCounts = {
      steps: 0,
      zones: 0,
      properties: 0,
      propertySets: 0,
      moderatedComments: 0,
      errorReports: 0,
      tokens: 0,
      users: 0
    }
    
    for (const user of usersToDelete) {
      console.log(`Processing user: ${user.email} (${user.id})`)
      
      try {
        // Get all properties for this user
        const properties = await prisma.property.findMany({
          where: { hostId: user.id },
          select: { id: true }
        })
        
        // Delete steps from all zones of all properties
        for (const property of properties) {
          const zones = await prisma.zone.findMany({
            where: { propertyId: property.id },
            select: { id: true }
          })
          
          for (const zone of zones) {
            const deletedSteps = await prisma.step.deleteMany({
              where: { zoneId: zone.id }
            })
            deletedCounts.steps += deletedSteps.count
          }
          
          // Delete zones
          const deletedZones = await prisma.zone.deleteMany({
            where: { propertyId: property.id }
          })
          deletedCounts.zones += deletedZones.count
        }
        
        // Delete properties
        const deletedProperties = await prisma.property.deleteMany({
          where: { hostId: user.id }
        })
        deletedCounts.properties += deletedProperties.count
        
        // Delete property sets
        const deletedPropertySets = await prisma.propertySet.deleteMany({
          where: { hostId: user.id }
        })
        deletedCounts.propertySets += deletedPropertySets.count
        
        // Delete moderated comments
        const deletedComments = await prisma.zoneComment.deleteMany({
          where: { moderatedBy: user.id }
        })
        deletedCounts.moderatedComments += deletedComments.count
        
        // Delete assigned error reports
        const deletedReports = await prisma.errorReport.deleteMany({
          where: { assignedTo: user.id }
        })
        deletedCounts.errorReports += deletedReports.count
        
      } catch (err) {
        console.error(`Error cleaning up relations for ${user.email}:`, err)
      }
    }
    
    // Delete all verification tokens
    const deletedTokens = await prisma.emailVerificationToken.deleteMany({})
    deletedCounts.tokens = deletedTokens.count
    
    // Finally, delete all users except demo
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          not: 'demo@itineramio.com'
        }
      }
    })
    deletedCounts.users = deletedUsers.count
    
    // Verify cleanup
    const remainingUsers = await prisma.user.findMany({
      select: { email: true }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Comprehensive cleanup completed',
      deletedCounts,
      remainingUsers: remainingUsers.map(u => u.email),
      processedEmails: usersToDelete.map(u => u.email)
    })
  } catch (error) {
    console.error('❌ Cleanup error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code
    }, { status: 500 })
  }
}