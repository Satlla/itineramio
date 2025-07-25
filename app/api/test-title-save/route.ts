import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Test: Try to create a simple step with title
    const testStep = await prisma.step.create({
      data: {
        title: { es: 'TITULO DE PRUEBA', en: '', fr: '' },
        content: { es: 'contenido de prueba', en: '', fr: '' },
        type: 'TEXT',
        order: 999,
        isPublished: true,
        zoneId: 'cmdcrh6a80001l804lrybc2lp'
      }
    })
    
    console.log('✅ Test step created:', testStep.id)
    console.log('✅ Test step title:', testStep.title)
    
    // Now read it back
    const readBack = await prisma.step.findUnique({
      where: { id: testStep.id }
    })
    
    console.log('📖 Read back title:', readBack?.title)
    
    // Clean up - delete the test step
    await prisma.step.delete({
      where: { id: testStep.id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Title save test completed',
      created: {
        id: testStep.id,
        title: testStep.title
      },
      readBack: {
        title: readBack?.title
      }
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}