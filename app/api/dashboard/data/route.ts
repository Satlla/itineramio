import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 })
    }
    
    const decoded = verifyToken(token)
    
    // Obtener todos los datos necesarios en paralelo
    const [properties, propertySets, recentActivity, totalCount, allPropertiesForStats] = await Promise.all([
      // Obtener solo 10 propiedades para mostrar (más que suficiente para mostrar 3)
      prisma.property.findMany({
        where: { hostId: decoded.userId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          state: true,
          bedrooms: true,
          bathrooms: true,
          maxGuests: true,
          status: true,
          profileImage: true,
          propertySetId: true,
          createdAt: true,
          _count: {
            select: {
              zones: true,
              propertyViews: true
            }
          }
        }
      }),
      
      // Obtener property sets
      prisma.propertySet.findMany({
        where: { hostId: decoded.userId },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          city: true,
          state: true,
          profileImage: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              properties: true
            }
          }
        }
      }),
      
      // Obtener actividad reciente limitada
      prisma.propertyView.findMany({
        where: {
          property: {
            hostId: decoded.userId
          }
        },
        take: 5,
        orderBy: { viewedAt: 'desc' },
        include: {
          property: {
            select: {
              name: true
            }
          }
        }
      }),
      
      // Contar total de propiedades
      prisma.property.count({
        where: { hostId: decoded.userId }
      }),
      
      // Obtener todas las propiedades para stats correctos
      prisma.property.findMany({
        where: { hostId: decoded.userId },
        select: {
          status: true,
          _count: {
            select: {
              propertyViews: true,
              zones: true
            }
          }
        }
      })
    ])
    
    // Calcular stats básicos usando TODAS las propiedades
    const stats = {
      totalProperties: totalCount,
      totalViews: allPropertiesForStats.reduce((sum, p) => sum + (p._count?.propertyViews || 0), 0),
      activeManuals: allPropertiesForStats.filter(p => p.status === 'ACTIVE').length,
      zonesViewed: allPropertiesForStats.reduce((sum, p) => sum + (p._count?.zones || 0), 0)
    }
    
    // Formatear actividad reciente
    const formattedActivity = recentActivity.map(view => ({
      id: view.id,
      type: 'view',
      message: `Visualización en ${view.property.name}`,
      time: new Date(view.viewedAt).toLocaleString('es-ES', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }))
    
    // Formatear propiedades
    const formattedProperties = properties.map(property => ({
      ...property,
      zonesCount: property._count?.zones || 0,
      totalViews: property._count?.propertyViews || 0,
      // Remover _count para limpiar respuesta
      _count: undefined
    }))
    
    // Formatear property sets
    const formattedPropertySets = propertySets.map(set => ({
      ...set,
      propertiesCount: set._count?.properties || 0,
      totalViews: 0, // Se puede calcular después si es necesario
      avgRating: 0,
      totalZones: 0,
      // Remover _count para limpiar respuesta
      _count: undefined
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        properties: formattedProperties,
        propertySets: formattedPropertySets,
        stats,
        recentActivity: formattedActivity
      }
    })
    
  } catch (error) {
    console.error('Dashboard data error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}