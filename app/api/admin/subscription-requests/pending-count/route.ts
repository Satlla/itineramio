import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { getAdminUser } from '../../../../../src/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await getAdminUser(request)
    if (!admin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Count pending subscription requests
    const count = await prisma.subscriptionRequest.count({
      where: {
        status: 'PENDING'
      }
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error fetching pending count:', error)
    return NextResponse.json(
      { error: 'Error al obtener el conteo' },
      { status: 500 }
    )
  }
}
