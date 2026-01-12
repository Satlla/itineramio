import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let userId: string
    try {
      const decoded = verifyToken(token)
      userId = decoded.userId
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { hash, originalName, size } = await request.json()

    if (!hash && !originalName) {
      return NextResponse.json({ error: 'Hash o nombre requerido' }, { status: 400 })
    }

    let existingMedia = null

    if (hash) {
      // Check by hash (most accurate)
      existingMedia = await prisma.mediaLibrary.findFirst({
        where: {
          userId: userId,
          hash: hash
        },
        select: {
          id: true,
          url: true,
          thumbnailUrl: true,
          filename: true,
          originalName: true,
          type: true,
          size: true,
          createdAt: true
        }
      })
    } else if (originalName) {
      // Check by original name only (for large files where size differs after compression)
      existingMedia = await prisma.mediaLibrary.findFirst({
        where: {
          userId: userId,
          originalName: originalName
        },
        select: {
          id: true,
          url: true,
          thumbnailUrl: true,
          filename: true,
          originalName: true,
          type: true,
          size: true,
          createdAt: true
        }
      })
    }

    if (existingMedia) {
      return NextResponse.json({
        exists: true,
        media: existingMedia
      })
    }

    return NextResponse.json({ exists: false })

  } catch (error) {
    console.error('Error checking duplicate:', error)
    return NextResponse.json({ error: 'Error verificando archivo' }, { status: 500 })
  }
}
