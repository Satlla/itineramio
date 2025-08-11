import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../src/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    // Fetch all custom plans with usage statistics
    const customPlans = await prisma.customPlan.findMany({
      include: {
        subscriptions: {
          select: {
            id: true,
            userId: true,
            status: true,
            startDate: true,
            endDate: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate stats
    const stats = {
      totalPlans: customPlans.length,
      activePlans: customPlans.filter(p => p.isActive).length,
      hotelPlans: customPlans.filter(p => p.isForHotels).length,
      totalSubscriptions: customPlans.reduce((sum, p) => sum + p.subscriptions.length, 0),
      activeSubscriptions: customPlans.reduce((sum, p) => 
        sum + p.subscriptions.filter(s => s.status === 'ACTIVE').length, 0
      )
    }
    
    return NextResponse.json({ customPlans, stats })
    
  } catch (error) {
    console.error('Error fetching custom plans:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    
    const {
      name,
      description,
      pricePerProperty,
      minProperties = 1,
      maxProperties,
      features = [],
      restrictions = {},
      isForHotels = false,
      maxZonesPerProperty,
      requiresApproval = false
    } = await request.json()
    
    // Validate required fields
    if (!name || !pricePerProperty) {
      return NextResponse.json({ 
        error: 'Nombre y precio por propiedad son requeridos' 
      }, { status: 400 })
    }
    
    // Create the custom plan
    const customPlan = await prisma.customPlan.create({
      data: {
        name,
        description,
        pricePerProperty,
        minProperties,
        maxProperties,
        features,
        restrictions,
        isForHotels,
        maxZonesPerProperty,
        requiresApproval,
        createdBy: authResult.adminId
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      customPlan,
      message: `Plan personalizado "${customPlan.name}" creado exitosamente` 
    })
    
  } catch (error) {
    console.error('Error creating custom plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}