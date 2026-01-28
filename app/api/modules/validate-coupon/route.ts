import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * POST /api/modules/validate-coupon
 * Validar un cupón para activación de módulo
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { code, moduleType, amount } = await request.json()

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Código de cupón requerido' },
        { status: 400 }
      )
    }

    // Buscar el cupón
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        uses: {
          where: { userId }
        }
      }
    })

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Cupón no encontrado' },
        { status: 404 }
      )
    }

    // Validaciones
    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, error: 'Este cupón ya no está activo' },
        { status: 400 }
      )
    }

    // Verificar fecha de validez
    const now = new Date()
    if (coupon.validFrom > now) {
      return NextResponse.json(
        { success: false, error: 'Este cupón aún no es válido' },
        { status: 400 }
      )
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      return NextResponse.json(
        { success: false, error: 'Este cupón ha expirado' },
        { status: 400 }
      )
    }

    // Verificar usos máximos
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { success: false, error: 'Este cupón ha alcanzado su límite de usos' },
        { status: 400 }
      )
    }

    // Verificar usos por usuario
    if (coupon.uses.length >= coupon.maxUsesPerUser) {
      return NextResponse.json(
        { success: false, error: 'Ya has usado este cupón el máximo de veces permitido' },
        { status: 400 }
      )
    }

    // Verificar módulo aplicable
    // Normalize FACTURAMIO to GESTION for compatibility with legacy data
    const normalizedModuleType = moduleType === 'FACTURAMIO' ? 'GESTION' : moduleType
    // Cast to string for comparison since legacy DB data might still contain FACTURAMIO
    const applicableModuleStr = coupon.applicableModule as string | null
    const normalizedApplicableModule = applicableModuleStr === 'FACTURAMIO' ? 'GESTION' : coupon.applicableModule

    if (normalizedApplicableModule && normalizedModuleType) {
      const moduleMatches = normalizedApplicableModule === normalizedModuleType

      if (!moduleMatches) {
        const moduleNames: Record<string, string> = {
          'MANUALES': 'Manuales Digitales',
          'GESTION': 'Gestión'
        }
        return NextResponse.json(
          { success: false, error: `Este cupón solo es válido para ${moduleNames[normalizedApplicableModule] || normalizedApplicableModule}` },
          { status: 400 }
        )
      }
    }

    // Calcular descuento
    let discountAmount = 0
    let discountType = coupon.type
    let discountValue = 0

    switch (coupon.type) {
      case 'PERCENTAGE':
        discountValue = coupon.discountPercent || 0
        discountAmount = amount ? (amount * discountValue) / 100 : 0
        break
      case 'FIXED_AMOUNT':
        discountValue = Number(coupon.discountAmount) || 0
        discountAmount = discountValue
        break
      case 'FREE_MONTHS':
        discountValue = coupon.freeMonths || 0
        // Para meses, el descuento se calcula diferente
        discountAmount = 0 // El frontend manejará esto
        break
    }

    const finalAmount = amount ? Math.max(0, amount - discountAmount) : null

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        discountType,
        discountValue,
        discountPercent: coupon.discountPercent,
        discountAmount: coupon.discountAmount ? Number(coupon.discountAmount) : null,
        freeMonths: coupon.freeMonths,
        applicableModule: coupon.applicableModule
      },
      calculation: {
        originalAmount: amount,
        discountAmount,
        finalAmount
      }
    })
  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
