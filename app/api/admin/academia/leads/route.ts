import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
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
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      )
    }

    await prisma.emailSubscriber.delete({
      where: { id }
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
