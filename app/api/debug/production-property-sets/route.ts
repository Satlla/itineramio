import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking ALL property sets in production DB')
    
    // Get all property sets without any filters
    const allPropertySets = await prisma.propertySet.findMany({
      select: {
        id: true,
        name: true,
        hostId: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            properties: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`🔍 Found ${allPropertySets.length} property sets total`)
    
    // Also get all users to see who owns what
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })
    
    console.log(`🔍 Found ${allUsers.length} users total`)
    
    // Check specific property set that's failing
    const specificSet = await prisma.propertySet.findFirst({
      where: {
        id: 'cmdsqc0530003la042xfy4933'
      },
      select: {
        id: true,
        name: true,
        hostId: true,
        status: true,
        createdAt: true
      }
    })
    
    console.log('🔍 Specific property set check:', specificSet)
    
    return NextResponse.json({
      success: true,
      data: {
        allPropertySets,
        allUsers,
        specificSet,
        totalPropertySets: allPropertySets.length,
        totalUsers: allUsers.length,
        message: specificSet ? 'Property set exists' : 'Property set NOT FOUND'
      }
    })
    
  } catch (error) {
    console.error('Error checking production property sets:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}