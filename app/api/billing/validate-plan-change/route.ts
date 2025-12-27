import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../src/lib/prisma'
import { verifyToken } from '../../../../src/lib/auth'
import { PLANS } from '../../../../src/config/plans'

/**
 * Validate if a plan change is allowed
 * POST /api/billing/validate-plan-change
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Get parameters from body
    const body = await request.json()
    const { targetPlanCode, targetBillingPeriod } = body

    console.log('🔍 VALIDATE PLAN CHANGE:', {
      userId: decoded.userId,
      targetPlanCode,
      targetBillingPeriod
    })

    if (!targetPlanCode || !targetBillingPeriod) {
      return NextResponse.json({
        allowed: false,
        message: 'Faltan parámetros: targetPlanCode y targetBillingPeriod son requeridos'
      }, { status: 400 })
    }

    // Get user's active subscription
    const activeSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: decoded.userId,
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

    // If no active subscription, allow any plan
    if (!activeSubscription || !activeSubscription.plan) {
      console.log('✅ No active subscription - allow any plan')
      return NextResponse.json({
        allowed: true,
        message: 'No tienes suscripción activa. Puedes elegir cualquier plan.'
      })
    }

    // Calculate current billing period from subscription duration
    let currentBillingPeriod: 'monthly' | 'semiannual' | 'annual' = 'monthly'

    if (activeSubscription.endDate) {
      const existingDuration = activeSubscription.endDate.getTime() - activeSubscription.startDate.getTime()
      const daysInExisting = existingDuration / (1000 * 60 * 60 * 24)

      if (daysInExisting > 150 && daysInExisting < 250) {
        currentBillingPeriod = 'semiannual'
      } else if (daysInExisting > 300) {
        currentBillingPeriod = 'annual'
      }
    }

    // Normalize target billing period
    const normalizedTargetPeriod = targetBillingPeriod === 'MONTHLY' ? 'monthly'
                                  : targetBillingPeriod === 'BIANNUAL' || targetBillingPeriod === 'semiannual' ? 'semiannual'
                                  : targetBillingPeriod === 'ANNUAL' || targetBillingPeriod === 'annual' ? 'annual'
                                  : targetBillingPeriod?.toLowerCase() || 'monthly'

    // Check if same plan and period
    const isSamePlan = activeSubscription.plan.code === targetPlanCode
    const isSamePeriod = currentBillingPeriod === normalizedTargetPeriod

    if (isSamePlan && isSamePeriod) {
      console.log('❌ Same plan and period')
      return NextResponse.json({
        allowed: false,
        message: `Ya tienes el plan ${activeSubscription.plan.name} activo con el mismo período de facturación.`
      })
    }

    // Get target plan info
    const targetPlan = PLANS[targetPlanCode as keyof typeof PLANS]
    if (!targetPlan) {
      return NextResponse.json({
        allowed: false,
        message: 'Plan no válido'
      }, { status: 400 })
    }

    // Determine if it's an upgrade or downgrade based on monthly price
    const currentMonthlyPrice = Number(activeSubscription.plan.priceMonthly)
    const targetMonthlyPrice = targetPlan.priceMonthly
    const isUpgrade = targetMonthlyPrice > currentMonthlyPrice

    console.log('📊 Plan comparison:', {
      currentPlan: activeSubscription.plan.code,
      currentPrice: currentMonthlyPrice,
      targetPlan: targetPlanCode,
      targetPrice: targetMonthlyPrice,
      isUpgrade
    })

    // If it's a downgrade to a different plan, don't allow immediate change
    if (!isUpgrade && !isSamePlan) {
      const endDateFormatted = activeSubscription.endDate
        ? new Date(activeSubscription.endDate).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })
        : 'fecha no definida'

      console.log('❌ Downgrade not allowed')
      return NextResponse.json({
        allowed: false,
        isDowngrade: true,
        message: `Para bajar de ${activeSubscription.plan.name} a ${targetPlan.name}, tu suscripción actual debe expirar primero (${endDateFormatted}). Puedes hacer upgrades inmediatos, pero los downgrades se aplicarán al final del período actual.`,
        currentPlanEndDate: activeSubscription.endDate
      })
    }

    // If same plan but changing period, validate period hierarchy
    if (isSamePlan && !isSamePeriod) {
      const periodHierarchy = {
        'monthly': 1,
        'semiannual': 2,
        'annual': 3
      }

      const currentLevel = periodHierarchy[currentBillingPeriod]
      const targetLevel = periodHierarchy[normalizedTargetPeriod as keyof typeof periodHierarchy]

      console.log('📊 Period comparison:', {
        currentPeriod: currentBillingPeriod,
        currentLevel,
        targetPeriod: normalizedTargetPeriod,
        targetLevel,
        isDowngrade: targetLevel < currentLevel
      })

      // If downgrading period commitment, don't allow
      if (targetLevel < currentLevel) {
        const endDateFormatted = activeSubscription.endDate
          ? new Date(activeSubscription.endDate).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })
          : 'fecha no definida'

        console.log('❌ Period downgrade not allowed')
        return NextResponse.json({
          allowed: false,
          isDowngrade: true,
          message: `No puedes cambiar a un período de menor compromiso hasta que expire tu suscripción actual (${endDateFormatted}).`,
          currentPlanEndDate: activeSubscription.endDate
        })
      }
    }

    // All validations passed
    console.log('✅ Plan change allowed')
    return NextResponse.json({
      allowed: true,
      message: 'Cambio de plan permitido'
    })

  } catch (error) {
    console.error('Error validating plan change:', error)
    return NextResponse.json({
      allowed: false,
      message: 'Error al validar el cambio de plan'
    }, { status: 500 })
  }
}
