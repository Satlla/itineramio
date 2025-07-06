import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../../src/lib/prisma'

const JWT_SECRET = 'itineramio-secret-key-2024'

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const userId = decoded.userId

    // Get recent evaluations for all properties owned by this user
    const recentEvaluations = await prisma.review.findMany({
      where: {
        property: {
          hostId: userId
        }
      },
      include: {
        property: {
          select: {
            name: true
          }
        },
        zone: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Get last 10 evaluations
    })

    // Format activity data
    const activity = recentEvaluations.map(evaluation => {
      const propertyName = typeof evaluation.property.name === 'string' 
        ? evaluation.property.name 
        : (evaluation.property.name as any)?.es || 'Propiedad'
      
      const zoneName = evaluation.zone 
        ? (typeof evaluation.zone.name === 'string' 
            ? evaluation.zone.name 
            : (evaluation.zone.name as any)?.es || 'Zona')
        : null

      const timeAgo = getTimeAgo(evaluation.createdAt)
      
      return {
        id: evaluation.id,
        type: 'evaluation',
        message: zoneName 
          ? `${evaluation.userName} dejó una evaluación de ${evaluation.rating} estrellas en ${zoneName} de ${propertyName}`
          : `${evaluation.userName} dejó una evaluación general de ${evaluation.rating} estrellas en ${propertyName}`,
        time: timeAgo,
        avatar: null, // We could add user avatars in the future
        property: propertyName,
        zone: zoneName,
        rating: evaluation.rating,
        isPublic: evaluation.isPublic,
        createdAt: evaluation.createdAt
      }
    })

    return NextResponse.json({
      success: true,
      activity
    })

  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener la actividad reciente'
    }, { status: 500 })
  }
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) {
    return 'hace un momento'
  } else if (minutes < 60) {
    return `hace ${minutes} minuto${minutes === 1 ? '' : 's'}`
  } else if (hours < 24) {
    return `hace ${hours} hora${hours === 1 ? '' : 's'}`
  } else {
    return `hace ${days} día${days === 1 ? '' : 's'}`
  }
}