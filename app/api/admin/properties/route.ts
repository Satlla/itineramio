import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { requireAdminAuth } from '../../../../src/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Admin properties endpoint called')
    
    // Require admin authentication
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      console.log('❌ Admin authentication failed in properties endpoint')
      return authResult
    }
    
    console.log('✅ Admin authenticated successfully:', authResult.email)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    // Build where clause
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { street: { contains: search, mode: 'insensitive' as const } },
        { city: { contains: search, mode: 'insensitive' as const } },
        { propertyCode: { contains: search, mode: 'insensitive' as const } },
        { host: { email: { contains: search, mode: 'insensitive' as const } } }
      ]
    } : {}

    // Get properties and count
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          host: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              zones: true,
              propertyViews: true,
              reviews: true
            }
          }
        }
      }),
      prisma.property.count({ where })
    ])

    return NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}