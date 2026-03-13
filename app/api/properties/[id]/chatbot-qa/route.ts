import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/properties/[id]/chatbot-qa
// Saves a custom Q&A pair to property.intelligence.customQA
// The chatbot includes these with max priority in its context
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: propertyId } = await params
  const { question, answer } = await req.json()

  if (!question?.trim() || !answer?.trim()) {
    return NextResponse.json({ error: 'question and answer are required' }, { status: 400 })
  }

  const property = await prisma.property.findFirst({
    where: { id: propertyId, hostId: user.userId, deletedAt: null },
    select: { intelligence: true }
  })

  if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const intel = (property.intelligence as Record<string, any>) || {}
  const customQA = Array.isArray(intel.customQA) ? intel.customQA : []

  // Avoid exact duplicates
  const exists = customQA.some((qa: any) => qa.question?.toLowerCase() === question.toLowerCase())
  if (!exists) {
    customQA.push({ question: question.trim(), answer: answer.trim(), addedAt: new Date().toISOString() })
  }

  await prisma.property.update({
    where: { id: propertyId },
    data: { intelligence: { ...intel, customQA } }
  })

  return NextResponse.json({ ok: true })
}
