import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '../../../../src/lib/admin-auth'
import { prisma } from '../../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  const adminOrResponse = await requireAdminAuth(request)
  if (adminOrResponse instanceof Response) return adminOrResponse

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const search = searchParams.get('search')?.trim() || ''
    const statusFilter = searchParams.get('status') || 'all' // all | lead | registered | subscribed

    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = { source: 'demo' }

    // Count total for pagination (before search filter for stats)
    const totalLeads = await prisma.lead.count({ where: { source: 'demo' } })

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get leads
    const leads = await prisma.lead.findMany({
      where: where as any,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    const total = await prisma.lead.count({ where: where as any })

    // Batch lookups
    const emails = leads.map(l => l.email)
    const users = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { id: true, email: true, subscription: true, status: true },
    })
    const userByEmail = new Map(users.map(u => [u.email, u]))

    // Extract coupon codes from metadata
    const couponCodes: string[] = []
    for (const lead of leads) {
      const meta = (lead.metadata as Record<string, unknown>) || {}
      if (meta.couponCode) couponCodes.push(meta.couponCode as string)
    }

    // Batch lookup coupons
    const coupons = couponCodes.length > 0
      ? await prisma.coupon.findMany({
          where: { code: { in: couponCodes } },
          include: { uses: { select: { id: true, userId: true } } },
        })
      : []
    const couponByCode = new Map(coupons.map(c => [c.code, c]))

    // Build response leads
    const responseLeads = leads.map(lead => {
      const meta = (lead.metadata as Record<string, unknown>) || {}
      const user = userByEmail.get(lead.email)
      const couponCode = (meta.couponCode as string) || ''
      const coupon = couponCode ? couponByCode.get(couponCode) : null

      // Determine conversion status
      let conversion: 'lead' | 'registered' | 'subscribed' = 'lead'
      if (user) {
        conversion = 'registered'
        if (user.subscription && user.subscription !== 'FREE' && user.subscription !== 'TRIAL') {
          conversion = 'subscribed'
        }
      }

      // Email timeline from metadata
      const confirmationSentAt = (meta.confirmationEmailSentAt as string) || (meta.demoGeneratedAt as string) || null
      const emails = {
        confirmation: confirmationSentAt,
        feedback: (meta.feedbackEmailSentAt as string) || null,
        chatbot: (meta.chatbotEmailSentAt as string) || null,
        fomo: (meta.fomoEmailSentAt as string) || null,
        urgency: (meta.urgencyEmailSentAt as string) || null,
        lastChance: (meta.lastChanceEmailSentAt as string) || null,
      }

      return {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: (meta.phone as string) || '',
        createdAt: lead.createdAt.toISOString(),
        property: {
          name: (meta.propertyName as string) || '',
          city: (meta.city as string) || '',
          id: (meta.propertyId as string) || '',
        },
        coupon: coupon ? {
          code: coupon.code,
          validUntil: coupon.validUntil?.toISOString() || null,
          isActive: coupon.isActive && (!coupon.validUntil || coupon.validUntil > new Date()),
          used: coupon.uses.length > 0,
        } : couponCode ? {
          code: couponCode,
          validUntil: null,
          isActive: false,
          used: false,
        } : null,
        emails,
        conversion,
      }
    })

    // Apply status filter after enrichment
    let filteredLeads = responseLeads
    if (statusFilter !== 'all') {
      filteredLeads = responseLeads.filter(l => l.conversion === statusFilter)
    }

    // Funnel stats — use all demo leads for accurate stats
    const allDemoLeads = await prisma.lead.findMany({
      where: { source: 'demo' },
      select: { email: true, metadata: true },
    })

    let feedbackCount = 0
    let chatbotCount = 0
    let fomoCount = 0
    let urgencyCount = 0
    let lastChanceCount = 0
    const allCouponCodes: string[] = []
    const allEmails: string[] = []

    for (const lead of allDemoLeads) {
      const meta = (lead.metadata as Record<string, unknown>) || {}
      if (meta.feedbackEmailSentAt) feedbackCount++
      if (meta.chatbotEmailSentAt) chatbotCount++
      if (meta.fomoEmailSentAt) fomoCount++
      if (meta.urgencyEmailSentAt) urgencyCount++
      if (meta.lastChanceEmailSentAt) lastChanceCount++
      if (meta.couponCode) allCouponCodes.push(meta.couponCode as string)
      allEmails.push(lead.email)
    }

    // Count coupons used
    const allCoupons = allCouponCodes.length > 0
      ? await prisma.coupon.findMany({
          where: { code: { in: [...new Set(allCouponCodes)] } },
          include: { uses: { select: { id: true } } },
        })
      : []
    const couponsUsed = allCoupons.filter(c => c.uses.length > 0).length

    // Count registered & subscribed from demo leads
    const allUsers = await prisma.user.findMany({
      where: { email: { in: [...new Set(allEmails)] } },
      select: { email: true, subscription: true },
    })
    const registered = allUsers.length
    const subscribed = allUsers.filter(u =>
      u.subscription && u.subscription !== 'FREE' && u.subscription !== 'TRIAL'
    ).length

    return NextResponse.json({
      leads: statusFilter !== 'all' ? filteredLeads : responseLeads,
      total: statusFilter !== 'all' ? filteredLeads.length : total,
      page,
      limit,
      funnelStats: {
        totalLeads,
        emailsSent: {
          feedback: feedbackCount,
          chatbot: chatbotCount,
          fomo: fomoCount,
          urgency: urgencyCount,
          lastChance: lastChanceCount,
        },
        couponsUsed,
        registered,
        subscribed,
      },
    })
  } catch (error) {
    console.error('[AdminDemoConversions] Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
