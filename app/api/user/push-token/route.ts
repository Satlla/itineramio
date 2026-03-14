import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/user/push-token — save device push token
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof Response) return auth

  const body = await req.json()
  const { pushToken, platform } = body as { pushToken?: string; platform?: string }

  if (!pushToken || typeof pushToken !== 'string') {
    return NextResponse.json({ error: 'pushToken requerido' }, { status: 400 })
  }

  if (!platform || !['ios', 'android'].includes(platform)) {
    return NextResponse.json({ error: 'platform debe ser ios o android' }, { status: 400 })
  }

  await prisma.userDevice.upsert({
    where: { pushToken },
    create: {
      userId: auth.userId,
      pushToken,
      platform,
    },
    update: {
      userId: auth.userId,
      platform,
      updatedAt: new Date(),
    },
  })

  return NextResponse.json({ success: true })
}

// DELETE /api/user/push-token — remove device push token on logout
export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof Response) return auth

  const { searchParams } = new URL(req.url)
  const pushToken = searchParams.get('token')

  if (pushToken) {
    await prisma.userDevice.deleteMany({
      where: { pushToken, userId: auth.userId },
    })
  } else {
    // Delete all devices for this user
    await prisma.userDevice.deleteMany({
      where: { userId: auth.userId },
    })
  }

  return NextResponse.json({ success: true })
}
