import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enrollSubscriberInSequences } from '@/lib/email-sequences'

/**
 * POST /api/hub/profitability-lead
 *
 * Guarda los datos de leads que usan la calculadora de rentabilidad.
 * Los datos se almacenan en el modelo Lead con metadata completa para análisis.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      // Datos del lead
      email,
      name,
      phone,

      // Datos de la calculadora
      numProperties,
      operationModel,
      zone,
      currentSeason,

      // Costes operativos
      hoursPerCleaning,
      hourlyRate,
      selfLaundry,
      staffMonthlyCost,
      cleaningCostPerCheckout,
      laundryCostPerBed,

      // Herramientas
      usesTools,
      toolsMonthlyCost,
      usesPricingTool,
      pricingToolCost,

      // Métricas actuales
      avgNightlyRate,
      avgOccupancy,
      avgStayLength,
      cleaningFeeCharged,
      platformCommission,

      // Costes fijos
      utilitiesCost,
      insuranceCost,
      communityFees,
      otherFixedCosts,

      // Resultados calculados
      result,

      // Metadata
      source,
      createdAt: clientCreatedAt
    } = body

    // Validación básica
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email es requerido'
      }, { status: 400 })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Email inválido'
      }, { status: 400 })
    }

    // Normalizar email a minúsculas
    const normalizedEmail = email.toLowerCase().trim()

    // Preparar metadata completa
    const metadata = {
      phone,
      profile: {
        numProperties: parseInt(numProperties) || 1,
        operationModel,
        zone,
        currentSeason,
        usesTools,
        usesPricingTool
      },
      costs: {
        hoursPerCleaning: parseFloat(hoursPerCleaning) || 0,
        hourlyRate: parseFloat(hourlyRate) || 0,
        selfLaundry,
        staffMonthlyCost: parseFloat(staffMonthlyCost) || 0,
        cleaningCostPerCheckout: parseFloat(cleaningCostPerCheckout) || 0,
        laundryCostPerBed: parseFloat(laundryCostPerBed) || 0,
        toolsMonthlyCost: parseFloat(toolsMonthlyCost) || 0,
        pricingToolCost: parseFloat(pricingToolCost) || 0,
        utilitiesCost: parseFloat(utilitiesCost) || 0,
        insuranceCost: parseFloat(insuranceCost) || 0,
        communityFees: parseFloat(communityFees) || 0,
        otherFixedCosts: parseFloat(otherFixedCosts) || 0
      },
      metrics: {
        avgNightlyRate: parseFloat(avgNightlyRate) || 0,
        avgOccupancy: parseFloat(avgOccupancy) || 0,
        avgStayLength: parseFloat(avgStayLength) || 0,
        cleaningFeeCharged: parseFloat(cleaningFeeCharged) || 0,
        platformCommission: parseFloat(platformCommission) || 0
      },
      calculationResult: result ? {
        totalRevenue: result.totalRevenue,
        totalCosts: result.totalCosts,
        netMonthlyProfit: result.netMonthlyProfit,
        profitMargin: result.profitMargin,
        minimumViablePrice: result.minimumViablePrice,
        realHourlyEarning: result.realHourlyEarning,
        isProfitable: result.isProfitable,
        profitabilityLevel: result.profitabilityLevel,
        isChangingMoney: result.isChangingMoney,
        marketComparison: result.marketComparison,
        recommendations: result.recommendations
      } : null,
      lastCalculatedAt: clientCreatedAt || new Date().toISOString(),
      calculationCount: 1
    }

    // Buscar lead existente por email
    const existingLead = await prisma.lead.findFirst({
      where: { email: normalizedEmail }
    })

    let lead

    if (existingLead) {
      // Actualizar lead existente
      const existingMetadata = existingLead.metadata as Record<string, unknown> || {}
      const calculationCount = (existingMetadata.calculationCount as number || 0) + 1

      lead = await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          name: name || existingLead.name,
          metadata: {
            ...metadata,
            calculationCount,
            previousCalculations: existingMetadata.calculationResult
              ? [...(existingMetadata.previousCalculations as unknown[] || []), existingMetadata.calculationResult]
              : []
          }
        }
      })
    } else {
      // Crear nuevo lead
      lead = await prisma.lead.create({
        data: {
          email: normalizedEmail,
          name: name || 'Sin nombre',
          source: source || 'calculadora-rentabilidad',
          metadata
        }
      })
    }

    // También crear/actualizar EmailSubscriber para secuencia de emails
    try {
      const existingSubscriber = await prisma.emailSubscriber.findFirst({
        where: { email: normalizedEmail }
      })

      if (existingSubscriber) {
        // Actualizar subscriber existente - añadir tag sin duplicar
        const currentTags = existingSubscriber.tags || []
        const newTags = currentTags.includes('calculadora-rentabilidad')
          ? currentTags
          : [...currentTags, 'calculadora-rentabilidad']

        await prisma.emailSubscriber.update({
          where: { id: existingSubscriber.id },
          data: {
            name: name || existingSubscriber.name,
            tags: newTags,
            sourceMetadata: {
              calculatorUsed: true,
              zone,
              numProperties: parseInt(numProperties) || 1,
              operationModel,
              profitabilityLevel: result?.profitabilityLevel || 'unknown',
              isChangingMoney: result?.isChangingMoney || false
            }
          }
        })
      } else {
        // Crear nuevo subscriber
        const newSubscriber = await prisma.emailSubscriber.create({
          data: {
            email: normalizedEmail,
            name: name || undefined,
            source: 'calculadora-rentabilidad',
            status: 'active',
            tags: ['calculadora-rentabilidad'],
            archetype: 'ESTRATEGA', // Los usuarios de calculadora suelen ser estrategas
            engagementScore: 'hot', // Alto engagement por usar calculadora
            currentJourneyStage: 'lead',
            sourceMetadata: {
              calculatorUsed: true,
              zone,
              numProperties: parseInt(numProperties) || 1,
              operationModel,
              profitabilityLevel: result?.profitabilityLevel || 'unknown',
              isChangingMoney: result?.isChangingMoney || false
            },
            sequenceStartedAt: new Date(),
            sequenceStatus: 'active'
          }
        })

        // Enrollar en secuencias de email automáticas
        await enrollSubscriberInSequences(newSubscriber.id, 'SUBSCRIBER_CREATED', {
          archetype: 'ESTRATEGA',
          source: 'calculadora-rentabilidad',
          tags: ['calculadora-rentabilidad', 'high-intent']
        }).catch(error => {
          console.error('Failed to enroll calculator lead in sequences:', error)
        })
      }
    } catch (subscriberError) {
      // No fallar si hay error con subscriber
      console.error('Error actualizando EmailSubscriber:', subscriberError)
    }

    return NextResponse.json({
      success: true,
      data: {
        leadId: lead.id,
        email: lead.email
      }
    })

  } catch (error) {
    console.error('Error guardando profitability lead:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al guardar los datos'
    }, { status: 500 })
  }
}

/**
 * GET /api/hub/profitability-lead
 *
 * Obtiene estadísticas de leads de la calculadora (para admin)
 */
export async function GET(req: NextRequest) {
  try {
    // Verificar autorización (simplificado - en producción usar middleware de auth)
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'No autorizado'
      }, { status: 401 })
    }

    // Obtener leads de la calculadora
    const leads = await prisma.lead.findMany({
      where: {
        source: 'calculadora-rentabilidad'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    })

    // Calcular estadísticas
    const stats = {
      total: leads.length,
      byZone: {} as Record<string, number>,
      byOperationModel: {} as Record<string, number>,
      byProfitability: {
        excellent: 0,
        good: 0,
        marginal: 0,
        losing: 0
      },
      changingMoney: 0,
      avgProperties: 0
    }

    let totalProperties = 0
    for (const lead of leads) {
      const metadata = lead.metadata as Record<string, unknown>
      const profile = metadata?.profile as Record<string, unknown>
      const calculationResult = metadata?.calculationResult as Record<string, unknown>

      if (profile) {
        // Por zona
        const zone = (profile.zone as string) || 'unknown'
        stats.byZone[zone] = (stats.byZone[zone] || 0) + 1

        // Por modelo de operación
        const model = (profile.operationModel as string) || 'unknown'
        stats.byOperationModel[model] = (stats.byOperationModel[model] || 0) + 1

        // Total propiedades
        totalProperties += (profile.numProperties as number) || 1
      }

      if (calculationResult) {
        // Por rentabilidad
        const level = calculationResult.profitabilityLevel as string
        if (level && level in stats.byProfitability) {
          stats.byProfitability[level as keyof typeof stats.byProfitability]++
        }

        // Cambiando dinero
        if (calculationResult.isChangingMoney) {
          stats.changingMoney++
        }
      }
    }

    stats.avgProperties = leads.length > 0 ? totalProperties / leads.length : 0

    return NextResponse.json({
      success: true,
      data: {
        leads,
        stats
      }
    })

  } catch (error) {
    console.error('Error obteniendo profitability leads:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener datos'
    }, { status: 500 })
  }
}
