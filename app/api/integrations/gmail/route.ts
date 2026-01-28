import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/integrations/gmail
 * Get Gmail integration status
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const integration = await prisma.gmailIntegration.findUnique({
      where: { userId },
      select: {
        id: true,
        email: true,
        isActive: true,
        lastSyncAt: true,
        syncErrors: true,
        createdAt: true,
        _count: {
          select: {
            syncedEmails: true,
          },
        },
      },
    })

    if (!integration) {
      return NextResponse.json({
        connected: false,
        integration: null,
      })
    }

    // Get recent synced emails stats
    const emailStats = await prisma.gmailSyncedEmail.groupBy({
      by: ['status'],
      where: {
        gmailIntegrationId: integration.id,
      },
      _count: true,
    })

    const stats = {
      total: integration._count.syncedEmails,
      processed: emailStats.find(s => s.status === 'PROCESSED')?._count || 0,
      pending: emailStats.find(s => s.status === 'PENDING')?._count || 0,
      errors: emailStats.find(s => s.status === 'ERROR')?._count || 0,
    }

    return NextResponse.json({
      connected: true,
      integration: {
        id: integration.id,
        email: integration.email,
        isActive: integration.isActive,
        lastSyncAt: integration.lastSyncAt?.toISOString(),
        syncErrors: integration.syncErrors,
        connectedAt: integration.createdAt.toISOString(),
      },
      stats,
    })
  } catch (error) {
    console.error('Error fetching Gmail integration:', error)
    return NextResponse.json(
      { error: 'Error al obtener integración' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/integrations/gmail
 * Disconnect Gmail integration
 */
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    await prisma.gmailIntegration.deleteMany({
      where: { userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting Gmail:', error)
    return NextResponse.json(
      { error: 'Error al desconectar Gmail' },
      { status: 500 }
    )
  }
}
