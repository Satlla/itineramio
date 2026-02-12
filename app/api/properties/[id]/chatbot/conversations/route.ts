import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../../src/lib/auth'

// GET /api/properties/[id]/chatbot/conversations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Check authentication
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    // Verify user owns the property
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        hostId: userId
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada o no autorizada' },
        { status: 404 }
      )
    }

    // Get conversations
    const conversations = await prisma.chatbotConversation.findMany({
      where: { propertyId },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit
    })

    const totalConversations = await prisma.chatbotConversation.count({
      where: { propertyId }
    })

    // Get ALL conversations for stats (not paginated)
    const allConversations = await prisma.chatbotConversation.findMany({
      where: { propertyId },
      select: {
        guestEmail: true,
        guestName: true,
        language: true,
        unansweredQuestions: true,
        messages: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Calculate stats
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const uniqueEmails = new Set(
      allConversations
        .filter(c => c.guestEmail)
        .map(c => c.guestEmail!.toLowerCase())
    )

    const allUnanswered = allConversations.flatMap(c => {
      const questions = c.unansweredQuestions as any[]
      return Array.isArray(questions) ? questions : []
    })

    const languageDistribution: Record<string, number> = {}
    allConversations.forEach(c => {
      const lang = c.language || 'es'
      languageDistribution[lang] = (languageDistribution[lang] || 0) + 1
    })

    const last7Days = allConversations.filter(c => c.createdAt >= sevenDaysAgo).length
    const last30Days = allConversations.filter(c => c.createdAt >= thirtyDaysAgo).length

    // Build guests list grouped by email
    const guestsMap = new Map<string, {
      email: string
      name: string | null
      conversationCount: number
      language: string
      firstSeen: Date
      lastSeen: Date
    }>()

    allConversations.forEach(c => {
      if (!c.guestEmail) return
      const key = c.guestEmail.toLowerCase()
      const existing = guestsMap.get(key)
      if (existing) {
        existing.conversationCount++
        if (c.createdAt < existing.firstSeen) existing.firstSeen = c.createdAt
        if (c.updatedAt > existing.lastSeen) existing.lastSeen = c.updatedAt
        if (c.guestName && !existing.name) existing.name = c.guestName
      } else {
        guestsMap.set(key, {
          email: c.guestEmail,
          name: c.guestName,
          conversationCount: 1,
          language: c.language || 'es',
          firstSeen: c.createdAt,
          lastSeen: c.updatedAt
        })
      }
    })

    const guests = Array.from(guestsMap.values())
      .sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime())
      .map(g => ({
        ...g,
        firstSeen: g.firstSeen.toISOString(),
        lastSeen: g.lastSeen.toISOString()
      }))

    // Transform conversations for response
    const transformedConversations = conversations.map(c => ({
      id: c.id,
      sessionId: c.sessionId,
      language: c.language,
      guestEmail: c.guestEmail,
      guestName: c.guestName,
      messages: c.messages as any[],
      unansweredQuestions: c.unansweredQuestions as any[],
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString()
    }))

    const stats = {
      totalConversations: allConversations.length,
      capturedGuests: uniqueEmails.size,
      totalUnanswered: allUnanswered.length,
      languageDistribution,
      last7Days,
      last30Days
    }

    return NextResponse.json({
      success: true,
      data: {
        conversations: transformedConversations,
        stats,
        guests,
        pagination: {
          page,
          limit,
          total: totalConversations,
          pages: Math.ceil(totalConversations / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error fetching chatbot conversations:', error)
    return NextResponse.json(
      { error: 'Error al obtener las conversaciones' },
      { status: 500 }
    )
  }
}

// DELETE /api/properties/[id]/chatbot/conversations
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
    const { conversationIds } = await request.json()

    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const property = await prisma.property.findFirst({
      where: { id: propertyId, hostId: userId }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada o no autorizada' },
        { status: 404 }
      )
    }

    if (!Array.isArray(conversationIds) || conversationIds.length === 0) {
      return NextResponse.json(
        { error: 'Se requieren IDs de conversaciones' },
        { status: 400 }
      )
    }

    const deleted = await prisma.chatbotConversation.deleteMany({
      where: {
        id: { in: conversationIds },
        propertyId
      }
    })

    return NextResponse.json({
      success: true,
      deleted: deleted.count
    })

  } catch (error) {
    console.error('Error deleting chatbot conversations:', error)
    return NextResponse.json(
      { error: 'Error al eliminar las conversaciones' },
      { status: 500 }
    )
  }
}
