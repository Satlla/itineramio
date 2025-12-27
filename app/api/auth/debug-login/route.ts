import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    console.log('🔍 DEBUG: Email received:', email)
    console.log('🔍 DEBUG: Email type:', typeof email)
    console.log('🔍 DEBUG: Email length:', email?.length)

    // Test 1: Direct query
    console.log('🔍 TEST 1: Direct email query')
    const user1 = await prisma.user.findUnique({
      where: { email: email }
    })
    console.log('Result 1:', user1 ? `Found: ${user1.email}` : 'Not found')

    // Test 2: List all users with similar email
    console.log('🔍 TEST 2: Similar emails')
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: 'itineramio'
        }
      },
      select: { email: true, id: true }
    })
    console.log('Similar emails found:', users.length)
    users.forEach(u => console.log(`- "${u.email}" (${u.id})`))

    // Test 3: Check database connection
    console.log('🔍 TEST 3: Database connection')
    const count = await prisma.user.count()
    console.log('Total users in database:', count)

    // Test 4: Raw query
    console.log('🔍 TEST 4: Raw query')
    const rawResult = await prisma.$queryRaw`
      SELECT email, id FROM users WHERE email = ${email}
    `
    console.log('Raw query result:', rawResult)

    return NextResponse.json({
      debug: true,
      email,
      emailType: typeof email,
      emailLength: email?.length,
      directQuery: !!user1,
      similarEmails: users,
      totalUsers: count,
      rawResult
    })

  } catch (error) {
    console.error('🔍 DEBUG ERROR:', error)
    return NextResponse.json({
      error: 'Debug error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}