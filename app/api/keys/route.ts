import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { generateApiKey } from '@/lib/api-keys'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const keys = await prisma.apiKey.findMany({
    where: { userId: auth.userId, revokedAt: null },
    select: {
      id: true,
      name: true,
      prefix: true,
      permissions: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json({ success: true, data: keys })
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  let body: any
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const name = body.name || 'API Key'

  // Limit to 5 active keys per user
  const activeKeyCount = await prisma.apiKey.count({
    where: { userId: auth.userId, revokedAt: null },
  })
  if (activeKeyCount >= 5) {
    return Response.json(
      { success: false, error: 'Maximum 5 active API keys per account' },
      { status: 400 }
    )
  }

  const { rawKey, hashedKey, prefix } = generateApiKey()

  const apiKey = await prisma.apiKey.create({
    data: {
      userId: auth.userId,
      name,
      hashedKey,
      prefix,
    },
  })

  // Return rawKey only once — never stored in DB
  return Response.json(
    {
      success: true,
      data: {
        id: apiKey.id,
        name: apiKey.name,
        key: rawKey,
        prefix,
        createdAt: apiKey.createdAt,
        warning: 'Save this key now. It will not be shown again.',
      },
    },
    { status: 201 }
  )
}
