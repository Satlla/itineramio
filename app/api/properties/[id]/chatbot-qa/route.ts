import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/properties/[id]/chatbot-qa — list all customQA for this property
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: propertyId } = await params

  const property = await prisma.property.findFirst({
    where: { id: propertyId, hostId: user.userId, deletedAt: null },
    select: { intelligence: true }
  })

  if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const intel = (property.intelligence as Record<string, any>) || {}
  const customQA = Array.isArray(intel.customQA) ? intel.customQA : []

  return NextResponse.json({ ok: true, data: customQA })
}

// POST /api/properties/[id]/chatbot-qa — add a new Q&A pair
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

// PUT /api/properties/[id]/chatbot-qa — update an existing Q&A by original question
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: propertyId } = await params
  const { originalQuestion, question, answer } = await req.json()

  if (!originalQuestion?.trim() || !answer?.trim()) {
    return NextResponse.json({ error: 'originalQuestion and answer are required' }, { status: 400 })
  }

  const property = await prisma.property.findFirst({
    where: { id: propertyId, hostId: user.userId, deletedAt: null },
    select: { intelligence: true }
  })

  if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const intel = (property.intelligence as Record<string, any>) || {}
  const customQA = Array.isArray(intel.customQA) ? intel.customQA : []

  const idx = customQA.findIndex((qa: any) =>
    qa.question?.toLowerCase() === originalQuestion.toLowerCase()
  )

  if (idx === -1) return NextResponse.json({ error: 'Q&A not found' }, { status: 404 })

  customQA[idx] = {
    ...customQA[idx],
    question: (question?.trim() || originalQuestion).trim(),
    answer: answer.trim(),
    updatedAt: new Date().toISOString()
  }

  await prisma.property.update({
    where: { id: propertyId },
    data: { intelligence: { ...intel, customQA } }
  })

  return NextResponse.json({ ok: true })
}

// DELETE /api/properties/[id]/chatbot-qa — remove a Q&A by question
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: propertyId } = await params
  const { question } = await req.json()

  if (!question?.trim()) {
    return NextResponse.json({ error: 'question is required' }, { status: 400 })
  }

  const property = await prisma.property.findFirst({
    where: { id: propertyId, hostId: user.userId, deletedAt: null },
    select: { intelligence: true }
  })

  if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const intel = (property.intelligence as Record<string, any>) || {}
  const customQA = Array.isArray(intel.customQA) ? intel.customQA : []

  const filtered = customQA.filter((qa: any) =>
    qa.question?.toLowerCase() !== question.toLowerCase()
  )

  await prisma.property.update({
    where: { id: propertyId },
    data: { intelligence: { ...intel, customQA: filtered } }
  })

  return NextResponse.json({ ok: true })
}
