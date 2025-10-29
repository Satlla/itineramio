import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'
import { requireAuth } from '../../../../../src/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🔥 SIMPLE DELETE - Property ID:', id)
    
    // Get authenticated user
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    
    console.log('🔥 Auth OK, proceeding with SIMPLE delete...')
    
    // Just delete the fucking property - let the database handle cascades
    const result = await prisma.$executeRaw`
      DELETE FROM properties 
      WHERE id = ${id} AND "hostId" = ${userId}
    `
    
    console.log('🔥 Delete result:', result)
    
    if (result === 0) {
      return NextResponse.json({
        success: false,
        error: 'Propiedad no encontrada o no autorizada'
      }, { status: 404 })
    }
    
    console.log('🔥🔥🔥 SIMPLE DELETE SUCCESS! 🔥🔥🔥')
    
    return NextResponse.json({
      success: true,
      message: '🔥 Propiedad eliminada con método simple 🔥'
    })
    
  } catch (error) {
    console.error('🔥 SIMPLE DELETE ERROR:', error)
    
    // If it's a foreign key constraint, tell us which one
    if (error instanceof Error && error.message.includes('foreign key')) {
      console.error('🔥 FOREIGN KEY VIOLATION:', error.message)
      
      return NextResponse.json({
        success: false,
        error: 'No se puede eliminar: hay datos relacionados',
        details: error.message,
        suggestion: 'Elimina primero las zonas y sus contenidos'
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Error en eliminación simple',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}