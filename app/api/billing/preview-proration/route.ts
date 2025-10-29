import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'
import { calculateProration } from '../../../../src/lib/proration-service'
import { getPlan } from '../../../../src/config/plans'

/**
 * Vista previa del prorrateo antes de que el usuario confirme el cambio de plan
 * GET /api/billing/preview-proration?planCode=HOST&billingPeriod=ANNUAL
 * POST /api/billing/preview-proration (body: { targetPlanCode, targetBillingPeriod })
 */

/**
 * POST - Método preferido para obtener preview de prorrateo
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Obtener parámetros del body
    const body = await request.json()
    const planCode = body.targetPlanCode || body.planCode
    let billingPeriod = body.targetBillingPeriod || body.billingPeriod

    // Normalizar billing period (frontend usa semiannual/annual, backend usa BIANNUAL/ANNUAL)
    if (billingPeriod === 'semiannual') {
      billingPeriod = 'BIANNUAL'
    } else if (billingPeriod === 'annual') {
      billingPeriod = 'ANNUAL'
    } else if (billingPeriod === 'monthly') {
      billingPeriod = 'MONTHLY'
    }

    console.log('🎯 POST PREVIEW PRORATION REQUEST:')
    console.log(`  planCode: "${planCode}"`)
    console.log(`  billingPeriod: "${billingPeriod}"`)
    console.log(`  userId: ${decoded.userId}`)

    if (!planCode || !billingPeriod) {
      return NextResponse.json(
        { error: 'Faltan parámetros: targetPlanCode y targetBillingPeriod son requeridos' },
        { status: 400 }
      )
    }

    // Reutilizar la misma lógica que GET
    return await handleProrationPreview(decoded.userId, planCode, billingPeriod as 'MONTHLY' | 'BIANNUAL' | 'ANNUAL')

  } catch (error) {
    console.error('Error in POST proration preview:', error)
    return NextResponse.json(
      { error: 'Error al calcular el prorrateo' },
      { status: 500 }
    )
  }
}

/**
 * GET - Método legacy (mantener para compatibilidad)
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Obtener parámetros
    const { searchParams } = new URL(request.url)
    const planCode = searchParams.get('planCode')
    const billingPeriod = searchParams.get('billingPeriod') as 'MONTHLY' | 'BIANNUAL' | 'ANNUAL'

    console.log('🎯 GET PREVIEW PRORATION REQUEST:')
    console.log(`  planCode: "${planCode}"`)
    console.log(`  billingPeriod: "${billingPeriod}"`)
    console.log(`  userId: ${decoded.userId}`)

    if (!planCode || !billingPeriod) {
      return NextResponse.json(
        { error: 'Faltan parámetros: planCode y billingPeriod son requeridos' },
        { status: 400 }
      )
    }

    // Reutilizar la misma lógica que POST
    return await handleProrationPreview(decoded.userId, planCode, billingPeriod)

  } catch (error) {
    console.error('Error in GET proration preview:', error)
    return NextResponse.json(
      { error: 'Error al calcular el prorrateo' },
      { status: 500 }
    )
  }
}

/**
 * Función compartida que procesa la lógica de prorrateo
 */
async function handleProrationPreview(
  userId: string,
  planCode: string,
  billingPeriod: 'MONTHLY' | 'BIANNUAL' | 'ANNUAL'
) {
  try {
    // Buscar suscripción activa del usuario
    const activeSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: userId,
        status: 'ACTIVE',
        endDate: { gte: new Date() }
      },
      include: {
        plan: {
          select: {
            code: true,
            name: true,
            priceMonthly: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Si no hay suscripción activa, devolver precio completo
    if (!activeSubscription || !activeSubscription.plan) {
      const newPlan = getPlan(planCode as any)
      const multiplier = billingPeriod === 'MONTHLY' ? 1
                       : billingPeriod === 'BIANNUAL' ? 6
                       : 12

      // Aplicar descuentos según período
      let discountPercent = 0
      if (billingPeriod === 'BIANNUAL') discountPercent = 10
      if (billingPeriod === 'ANNUAL') discountPercent = 20

      const monthlyPrice = newPlan.priceMonthly
      const discountedMonthlyPrice = monthlyPrice * (1 - discountPercent / 100)
      const totalPrice = discountedMonthlyPrice * multiplier

      return NextResponse.json({
        hasActiveSubscription: false,
        hasProration: false,
        newPlanName: newPlan.name,
        newPlanPrice: totalPrice,
        finalPrice: totalPrice,
        message: 'No tienes suscripción activa. Pagarás el precio completo.',
        breakdown: [
          {
            label: `${newPlan.name} - ${getBillingPeriodLabel(billingPeriod)}`,
            value: `€${totalPrice.toFixed(2)}`
          }
        ]
      })
    }

    // Calcular duración actual para determinar billing period
    const existingDuration = activeSubscription.endDate.getTime() - activeSubscription.startDate.getTime()
    const daysInExisting = existingDuration / (1000 * 60 * 60 * 24)

    let currentBillingPeriod: 'monthly' | 'biannual' | 'annual' = 'monthly'
    if (daysInExisting > 150 && daysInExisting < 250) {
      currentBillingPeriod = 'biannual'
    } else if (daysInExisting > 300) {
      currentBillingPeriod = 'annual'
    }

    // 🔧 FIX CRÍTICO: Calcular el precio TOTAL pagado según el periodo de facturación
    const currentMonthlyPrice = Number(activeSubscription.plan.priceMonthly)
    let currentMonthsMultiplier = 1
    let currentDiscountPercent = 0

    if (currentBillingPeriod === 'biannual') {
      currentMonthsMultiplier = 6
      currentDiscountPercent = 10
    } else if (currentBillingPeriod === 'annual') {
      currentMonthsMultiplier = 12
      currentDiscountPercent = 20
    }

    const currentDiscountedMonthlyPrice = currentMonthlyPrice * (1 - currentDiscountPercent / 100)
    const currentTotalPricePaid = currentDiscountedMonthlyPrice * currentMonthsMultiplier

    console.log('💰 Cálculo de precio total pagado:')
    console.log(`  Periodo: ${currentBillingPeriod}`)
    console.log(`  Precio mensual: €${currentMonthlyPrice}`)
    console.log(`  Descuento: ${currentDiscountPercent}%`)
    console.log(`  Meses: ${currentMonthsMultiplier}`)
    console.log(`  TOTAL PAGADO: €${currentTotalPricePaid.toFixed(2)}`)

    // Verificar si es el mismo plan y período (no permitir)
    const isSamePlan = activeSubscription.plan.code === planCode
    const isSamePeriod = (
      (currentBillingPeriod === 'monthly' && billingPeriod === 'MONTHLY') ||
      (currentBillingPeriod === 'biannual' && billingPeriod === 'BIANNUAL') ||
      (currentBillingPeriod === 'annual' && billingPeriod === 'ANNUAL')
    )

    if (isSamePlan && isSamePeriod) {
      return NextResponse.json({
        error: 'Ya tienes este plan activo',
        message: `Ya estás suscrito a ${activeSubscription.plan.name} con el mismo período de facturación.`
      }, { status: 400 })
    }

    // Obtener información del nuevo plan
    const newPlan = getPlan(planCode as any)

    // Determinar si es upgrade o downgrade comparando precios mensuales
    // (reutilizamos currentMonthlyPrice ya calculado en línea 99)
    const newMonthlyPrice = newPlan.priceMonthly
    const isUpgrade = newMonthlyPrice > currentMonthlyPrice

    // Si es DOWNGRADE, no permitir cambio inmediato
    if (!isUpgrade && activeSubscription.plan.code !== planCode) {
      const endDateFormatted = new Date(activeSubscription.endDate).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })

      return NextResponse.json({
        error: 'No se permite bajar de plan inmediatamente',
        isDowngrade: true,
        message: `Para bajar de ${activeSubscription.plan.name} a ${newPlan.name}, tu suscripción actual debe expirar primero (${endDateFormatted}). Puedes hacer upgrades inmediatos, pero los downgrades se aplicarán al final del período actual.`,
        currentPlanEndDate: activeSubscription.endDate,
        suggestedAction: 'Espera a que expire tu plan actual o contáctanos si necesitas ayuda.'
      }, { status: 400 })
    }

    // MISMO PLAN pero diferente período: verificar si es upgrade o downgrade de duración
    if (isSamePlan && !isSamePeriod) {
      // Usar jerarquía de periodos para determinar upgrade/downgrade
      const periodHierarchy = {
        'monthly': 1,
        'biannual': 2,
        'annual': 3
      }

      // Convertir billingPeriod de API format a lowercase
      const newBillingPeriodLowercase = billingPeriod === 'MONTHLY' ? 'monthly'
                                       : billingPeriod === 'BIANNUAL' ? 'biannual'
                                       : billingPeriod === 'ANNUAL' ? 'annual'
                                       : billingPeriod?.toLowerCase() || 'unknown'

      const currentLevel = periodHierarchy[currentBillingPeriod] || 0
      const newLevel = periodHierarchy[newBillingPeriodLowercase] || 0

      console.log('🔍 Periodo Debug (MISMO PLAN):')
      console.log(`  Plan code: ${planCode}`)
      console.log(`  billingPeriod from API: "${billingPeriod}"`)
      console.log(`  Current period: ${currentBillingPeriod} (level: ${currentLevel})`)
      console.log(`  New period: ${newBillingPeriodLowercase} (level: ${newLevel})`)
      console.log(`  Is downgrade? ${newLevel < currentLevel}`)

      // Si el nuevo periodo es menor en la jerarquía, es downgrade
      if (newLevel < currentLevel) {
        const endDateFormatted = new Date(activeSubscription.endDate).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })

        return NextResponse.json({
          error: 'No se permite cambiar a un período de menor compromiso',
          isDowngrade: true,
          message: `No puedes cambiar de ${getBillingPeriodName(currentBillingPeriod)} a ${getBillingPeriodName(newBillingPeriodLowercase)} hasta que expire tu suscripción actual (${endDateFormatted}).`,
          currentPlanEndDate: activeSubscription.endDate
        }, { status: 400 })
      }
    }

    // Convertir billing period a formato del servicio
    const newBillingPeriod = (billingPeriod === 'BIANNUAL' ? 'biannual'
                            : billingPeriod === 'ANNUAL' ? 'annual'
                            : 'monthly') as 'monthly' | 'biannual' | 'annual'

    // Calcular prorrateo usando el precio TOTAL correcto
    const prorationCalculation = calculateProration({
      currentSubscription: {
        planName: activeSubscription.plan.name,
        amountPaid: currentTotalPricePaid, // 🔧 FIX: Usar precio total calculado
        startDate: activeSubscription.startDate,
        endDate: activeSubscription.endDate
      },
      newPlan: {
        name: newPlan.name,
        priceMonthly: newPlan.priceMonthly,
        billingPeriod: newBillingPeriod
      },
      today: new Date()
    })

    return NextResponse.json({
      hasActiveSubscription: true,
      hasProration: true,

      // Suscripción actual
      currentPlan: {
        name: activeSubscription.plan.name,
        amountPaid: currentTotalPricePaid, // 🔧 FIX: Precio total correcto
        startDate: activeSubscription.startDate,
        endDate: activeSubscription.endDate,
        daysRemaining: prorationCalculation.daysRemaining
      },

      // Nuevo plan
      newPlanName: newPlan.name,
      newPlanPrice: prorationCalculation.newPlanPrice,
      billingPeriod: billingPeriod,

      // Cálculos de prorrateo
      creditAmount: prorationCalculation.creditAmount,
      finalPrice: prorationCalculation.finalPrice,

      // Resumen y desglose
      summary: prorationCalculation.summary,
      breakdown: prorationCalculation.breakdown,

      // Fechas del nuevo período
      newStartDate: prorationCalculation.newStartDate,
      newEndDate: prorationCalculation.newEndDate
    })

  } catch (error) {
    console.error('Error calculating proration preview:', error)
    return NextResponse.json(
      { error: 'Error al calcular el prorrateo' },
      { status: 500 }
    )
  }
}

function getBillingPeriodLabel(period: string): string {
  switch (period) {
    case 'MONTHLY': return 'Mensual'
    case 'BIANNUAL': return 'Semestral (10% dto.)'
    case 'ANNUAL': return 'Anual (20% dto.)'
    default: return period
  }
}

function getBillingPeriodName(period: 'monthly' | 'biannual' | 'annual' | string): string {
  switch (period) {
    case 'monthly': return 'plan mensual'
    case 'biannual': return 'plan semestral'
    case 'annual': return 'plan anual'
    default:
      console.error(`⚠️ getBillingPeriodName received unexpected value: "${period}"`)
      return `plan ${period}` // Fallback to prevent undefined
  }
}
