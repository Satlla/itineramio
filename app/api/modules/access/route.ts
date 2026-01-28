import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { moduleLimitsService } from '@/lib/module-limits'
import { MODULES, type ModuleCode } from '@/config/modules'

/**
 * GET /api/modules/access
 * Obtener el estado de acceso a los módulos del usuario
 *
 * Query params:
 * - module: 'MANUALES' | 'GESTION' | 'FACTURAMIO' (legacy) | undefined (si no se especifica, devuelve ambos)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { searchParams } = new URL(request.url)
    const moduleParam = searchParams.get('module')?.toUpperCase() as ModuleCode | 'FACTURAMIO' | undefined

    // Si se especifica un módulo, devolver solo ese
    if (moduleParam) {
      if (moduleParam === 'MANUALES') {
        const access = await moduleLimitsService.getManualesAccess(userId)
        return NextResponse.json({
          success: true,
          module: MODULES.MANUALES,
          access
        })
      } else if (moduleParam === 'GESTION' || moduleParam === 'FACTURAMIO') {
        // FACTURAMIO es legacy, redirigir a GESTION
        const access = await moduleLimitsService.getGestionAccess(userId)
        return NextResponse.json({
          success: true,
          module: MODULES.GESTION,
          access
        })
      }
    }

    // Devolver acceso a ambos módulos
    const { manuales, gestion } = await moduleLimitsService.getAllModulesAccess(userId)

    return NextResponse.json({
      success: true,
      modules: {
        manuales: {
          config: MODULES.MANUALES,
          access: manuales
        },
        gestion: {
          config: MODULES.GESTION,
          access: gestion
        },
        // Legacy alias
        facturamio: {
          config: MODULES.GESTION,
          access: gestion
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
