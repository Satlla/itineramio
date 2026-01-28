import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { moduleLimitsService } from '@/lib/module-limits'
import { MODULES, type ModuleCode } from '@/config/modules'

/**
 * GET /api/modules/access
 * Obtener el estado de acceso a los módulos del usuario
 *
 * Query params:
 * - module: 'MANUALES' | 'FACTURAMIO' | 'GESTION' (legacy) | undefined (si no se especifica, devuelve ambos)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { searchParams } = new URL(request.url)
    const moduleParam = searchParams.get('module')?.toUpperCase() as ModuleCode | 'GESTION' | undefined

    // Si se especifica un módulo, devolver solo ese
    if (moduleParam) {
      if (moduleParam === 'MANUALES') {
        const access = await moduleLimitsService.getManualesAccess(userId)
        return NextResponse.json({
          success: true,
          module: MODULES.MANUALES,
          access
        })
      } else if (moduleParam === 'FACTURAMIO' || moduleParam === 'GESTION') {
        // GESTION es legacy, redirigir a FACTURAMIO
        const access = await moduleLimitsService.getFacturamioAccess(userId)
        return NextResponse.json({
          success: true,
          module: MODULES.FACTURAMIO,
          access
        })
      }
    }

    // Devolver acceso a ambos módulos
    const { manuales, facturamio } = await moduleLimitsService.getAllModulesAccess(userId)

    return NextResponse.json({
      success: true,
      modules: {
        manuales: {
          config: MODULES.MANUALES,
          access: manuales
        },
        facturamio: {
          config: MODULES.FACTURAMIO,
          access: facturamio
        },
        // Legacy alias
        gestion: {
          config: MODULES.FACTURAMIO,
          access: facturamio
        }
      }
    })
  } catch (error) {
    console.error('Error fetching module access:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
