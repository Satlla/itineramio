import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAdminAuth, createActivityLog, getRequestInfo } from '../../../../../src/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    // Get all academia-related leads from EmailSubscriber
    const leads = await prisma.emailSubscriber.findMany({
      where: {
        OR: [
          { source: 'academia-coming-soon' },
          { source: { contains: 'academia' } },
          { tags: { hasSome: ['academia-interest', 'from_academia-coming-soon'] } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get quiz leads count for comparison
    const quizLeadsCount = await prisma.quizLead.count()

    return NextResponse.json({
      leads,
      stats: {
        total: leads.length,
        active: leads.filter(l => l.status === 'active').length,
        unsubscribed: leads.filter(l => l.status === 'unsubscribed').length,
        quizLeads: quizLeadsCount
      }
    })
  } catch (error) {
    console.error('Error fetching academia leads:', error)
    return NextResponse.json(
      { error: 'Error al obtener los leads' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      )
    }

    // Get lead info before deletion
    const lead = await prisma.emailSubscriber.findUnique({
      where: { id },
      select: { email: true }
    })

    await prisma.emailSubscriber.delete({
      where: { id }
    })

    // Log the activity
    const { ipAddress, userAgent } = getRequestInfo(request)
    await createActivityLog({
      adminId: authResult.adminId,
      action: 'academia_lead_deleted',
      targetType: 'email_subscriber',
      targetId: id,
      description: `Lead academia eliminado: ${lead?.email || 'Unknown'}`,
      ipAddress,
      userAgent
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting lead:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el lead' },
      { status: 500 }
    )
  }
}
