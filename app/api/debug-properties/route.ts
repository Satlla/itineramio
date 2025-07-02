import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../src/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'itineramio-secret-key-2024'

export async function GET(request: NextRequest) {
  try {
    // Test 1: Check if JWT token exists and is valid
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No token found', step: 'token_check' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    } catch (jwtError) {
      return NextResponse.json({ 
        error: 'JWT verification failed', 
        step: 'jwt_verify',
        details: jwtError instanceof Error ? jwtError.message : 'Unknown JWT error'
      }, { status: 401 })
    }

    const userId = decoded.userId

    // Test 2: Check if user exists
    let user
    try {
      user = await prisma.user.findUnique({
        where: { id: userId }
      })
      if (!user) {
        return NextResponse.json({ 
          error: 'User not found', 
          step: 'user_check',
          userId: userId 
        }, { status: 404 })
      }
    } catch (userError) {
      return NextResponse.json({ 
        error: 'User query failed', 
        step: 'user_query',
        details: userError instanceof Error ? userError.message : 'Unknown user error'
      }, { status: 500 })
    }

    // Test 3: Try to fetch properties with minimal query
    let properties
    try {
      properties = await prisma.property.findMany({
        where: { hostId: userId },
        select: {
          id: true,
          name: true
          // slug: true // Temporarily disabled - column doesn't exist
        },
        take: 1
      })
    } catch (propError) {
      return NextResponse.json({ 
        error: 'Properties query failed', 
        step: 'properties_query',
        details: propError instanceof Error ? propError.message : 'Unknown properties error'
      }, { status: 500 })
    }

    // Test 4: Try full query like in original API
    let fullProperties
    try {
      fullProperties = await prisma.property.findMany({
        where: { hostId: userId },
        take: 1,
        include: {
          analytics: true,
          _count: {
            select: {
              zones: true
            }
          }
        }
      })
    } catch (fullError) {
      return NextResponse.json({ 
        error: 'Full properties query failed', 
        step: 'full_properties_query',
        details: fullError instanceof Error ? fullError.message : 'Unknown full query error'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      step: 'all_tests_passed',
      user: { id: user.id, email: user.email },
      propertiesCount: properties.length,
      fullPropertiesCount: fullProperties.length,
      firstProperty: properties[0] || null
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Unexpected error',
      step: 'catch_all',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}