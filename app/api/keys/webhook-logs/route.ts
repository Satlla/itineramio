import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
  const skip = (page - 1) * limit

  // Get user's API key IDs
  const apiKeys = await prisma.apiKey.findMany({
    where: { userId: auth.userId },
    select: { id: true },
  })

  const apiKeyIds = apiKeys.map((k) => k.id)

  if (apiKeyIds.length === 0) {
    return Response.json({
      success: true,
      data: { events: [], pagination: { page, limit, total: 0, totalPages: 0 } },
    })
  }

  const [events, total] = await Promise.all([
    prisma.webhookEvent.findMany({
      where: { apiKeyId: { in: apiKeyIds } },
      select: {
        id: true,
        eventType: true,
        status: true,
        error: true,
        processedAt: true,
        createdAt: true,
        apiKey: { select: { name: true, prefix: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.webhookEvent.count({
      where: { apiKeyId: { in: apiKeyIds } },
    }),
  ])

  return Response.json({
    success: true,
    data: {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  })
}
