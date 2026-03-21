import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../src/lib/auth'

function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      typeof result[key] === 'object' &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key], source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult
    const { userId } = authResult

    const property = await prisma.property.findFirst({
      where: { id, hostId: userId, deletedAt: null },
      select: { intelligence: true },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      intelligence: property.intelligence || {},
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) return authResult
    const { userId } = authResult

    const property = await prisma.property.findFirst({
      where: { id, hostId: userId, deletedAt: null },
      select: { intelligence: true },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const body = await request.json()
    const existing = (property.intelligence as Record<string, any>) || {}
    const merged = deepMerge(existing, body)

    const updated = await prisma.property.update({
      where: { id },
      data: { intelligence: merged },
      select: { intelligence: true },
    })

    return NextResponse.json({
      success: true,
      intelligence: updated.intelligence,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
