import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Iniciando diagnóstico del manual público')
    
    // 1. Verificar conexión a base de datos
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Conexión a base de datos: OK')
    
    // 2. Buscar todas las propiedades
    const allProperties = await prisma.property.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isPublished: true,
        zones: {
          select: {
            id: true,
            name: true,
            isPublished: true,
            steps: {
              where: { isPublished: true },
              select: { id: true }
            }
          }
        }
      }
    })
    
    console.log(`📊 Total propiedades encontradas: ${allProperties.length}`)
    
    // 3. Verificar rutas específicas
    const testIds = [
      'cmcqppejj00027cbu1c9c3r6t',
      'cmcqq5nf30001lb043htv4xij',
      'cmck7fchh000cl204e2eg56xb'
    ]
    
    const testResults: Record<string, any> = {}
    
    for (const testId of testIds) {
      try {
        const property = await prisma.property.findFirst({
          where: { id: testId },
          include: {
            zones: {
              include: {
                steps: {
                  where: { isPublished: true }
                }
              }
            }
          }
        })
        
        testResults[testId] = {
          exists: !!property,
          published: property?.isPublished || false,
          zones: property?.zones?.length || 0,
          name: property?.name || null
        }
      } catch (error: any) {
        testResults[testId] = {
          exists: false,
          error: error.message
        }
      }
    }
    
    // 4. Verificar endpoints de API
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const apiTests: Record<string, any> = {}
    
    try {
      // Test API by-slug
      const slugResponse = await fetch(`${baseUrl}/api/public/properties/by-slug/villa-mediterranea-valencia`, {
        method: 'GET'
      })
      apiTests['by-slug'] = {
        status: slugResponse.status,
        ok: slugResponse.ok
      }
    } catch (error: any) {
      apiTests['by-slug'] = {
        error: error.message
      }
    }
    
    try {
      // Test API by-id
      const idResponse = await fetch(`${baseUrl}/api/public/properties/cmcqppejj00027cbu1c9c3r6t`, {
        method: 'GET'
      })
      apiTests['by-id'] = {
        status: idResponse.status,
        ok: idResponse.ok
      }
    } catch (error: any) {
      apiTests['by-id'] = {
        error: error.message
      }
    }
    
    const diagnosticReport = {
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        totalProperties: allProperties.length
      },
      properties: allProperties,
      testResults,
      apiTests,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET'
      }
    }
    
    console.log('📋 Reporte de diagnóstico generado')
    
    return NextResponse.json({
      success: true,
      message: 'Diagnóstico del manual público completado',
      data: diagnosticReport
    })
    
  } catch (error: any) {
    console.error('❌ Error en diagnóstico:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}