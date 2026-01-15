import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { getAdminUser } from '../../../../../src/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const adminPayload = await getAdminUser(request)
    
    if (!adminPayload) {
      return NextResponse.json({ 
        authenticated: false 
      }, { status: 401 })
    }

    // Get admin details from database
    const admin = await prisma.admin.findUnique({
      where: { id: adminPayload.adminId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        isActive: true,
      }
    })

    if (!admin || !admin.isActive) {
      return NextResponse.json({
        authenticated: false
      }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions || [],
      }
    })

  } catch (error) {
    console.error('Admin auth check error:', error)
    return NextResponse.json({ 
      authenticated: false 
    }, { status: 401 })
  }
}