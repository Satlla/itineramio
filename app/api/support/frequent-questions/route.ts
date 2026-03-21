import { NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function GET() {
  try {
    const questions = await prisma.frequentQuestion.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { frequency: 'desc' },
      take: 5,
      select: { id: true, question: true, category: true },
    })

    return NextResponse.json({ questions })
  } catch (error) {
    return NextResponse.json({ questions: [] })
  }
}
