import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Obtener usuarios que son autores del blog (role = 'CONTENT_CREATOR' o email contiene @itineramio.com)
    const authors = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'CONTENT_CREATOR' },
          { email: { contains: '@itineramio.com' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        notes: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ authors })
  } catch (error) {
    console.error('Error fetching authors:', error)
    return NextResponse.json(
      { error: 'Error al cargar autores' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
