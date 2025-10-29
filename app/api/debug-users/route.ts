import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true
      },
      take: 10
    })

    // Try raw query
    const rawUsers = await prisma.$queryRaw`
      SELECT id, email, name 
      FROM users 
      WHERE email = 'info@mrbarriot.com'
      LIMIT 1
    `

    // Count total users
    const totalUsers = await prisma.user.count()

    return NextResponse.json({
      success: true,
      totalUsers,
      firstUsers: allUsers,
      rawQueryResult: rawUsers,
      databaseUrl: process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@') // Hide password
    })

  } catch (error) {
    console.error('Debug users error:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}