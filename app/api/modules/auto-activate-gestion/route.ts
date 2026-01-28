import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { autoActivateGestionTrial } from '@/lib/auto-activate-trial'

/**
 * POST /api/modules/auto-activate-gestion
 *
 * Auto-activa el trial de GESTION cuando el usuario visita /gestion
 * por primera vez. Es idempotente - si ya tiene trial o módulo activo,
 * no hace nada.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const result = await autoActivateGestionTrial(userId)

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Error auto-activating GESTION trial:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
