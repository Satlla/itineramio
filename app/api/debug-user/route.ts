import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email') || 'alejandrosatlla@gmail.com'

  try {
    // Find user with all relations
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        properties: {
          select: { id: true, name: true }
        },
        propertySets: {
          select: { id: true, name: true }
        },
        moderatedComments: {
          select: { id: true }
        },
        assignedErrorReports: {
          select: { id: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({
        exists: false,
        message: 'User not found'
      })
    }

    // Try to delete
    let deleteError = null
    try {
      await prisma.user.delete({
        where: { email }
      })
    } catch (error) {
      deleteError = error
    }

    return NextResponse.json({
      exists: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        emailVerified: !!user.emailVerified,
        status: user.status
      },
      relations: {
        properties: user.properties.length,
        propertySets: user.propertySets.length,
        moderatedComments: user.moderatedComments.length,
        assignedErrorReports: user.assignedErrorReports.length
      },
      canDelete: !deleteError,
      deleteError: deleteError ? {
        message: (deleteError as Error).message,
        code: (deleteError as any).code
      } : null
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}