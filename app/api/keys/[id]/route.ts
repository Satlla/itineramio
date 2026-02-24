import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const { id } = await params

  const apiKey = await prisma.apiKey.findFirst({
    where: { id, userId: auth.userId, revokedAt: null },
  })

  if (!apiKey) {
    return Response.json({ success: false, error: 'API key not found' }, { status: 404 })
  }

  await prisma.apiKey.update({
    where: { id },
    data: { revokedAt: new Date() },
  })

  return Response.json({ success: true, data: { revoked: true } })
}
