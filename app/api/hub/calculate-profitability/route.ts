import { NextRequest, NextResponse } from 'next/server'
import { calculatePotential, MARKET_DATA } from '../../../../src/data/market-data'
import { getClientIP, checkCalculationRateLimit, checkEmailRateLimit } from '../../../../src/utils/rate-limit'
import { validateEmail } from '../../../../src/utils/email-validation'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      city,
      propertyType,
      currentPrice,
      currentOccupancy,
      email, // Opcional: si el usuario quiere resultados detallados
      name
    } = body

    // Validaciones básicas
    if (!city || !propertyType || !currentPrice || !currentOccupancy) {
      return NextResponse.json({
        success: false,
        error: 'Faltan datos requeridos: city, propertyType, currentPrice, currentOccupancy'
      }, { status: 400 })
    }

    // Verificar que la ciudad existe
    if (!MARKET_DATA[city]) {
      return NextResponse.json({
        success: false,
        error: 'Ciudad no soportada'
      }, { status: 400 })
    }

    // Verificar tipo de propiedad válido
    const validTypes = ['studio', 'onebed', 'twobed', 'threebed']
    if (!validTypes.includes(propertyType)) {
      return NextResponse.json({
        success: false,
        error: 'Tipo de propiedad inválido'
      }, { status: 400 })
    }

    // RATE LIMITING
    const clientIP = getClientIP(req.headers)
    let validatedEmail: string | null = null
    let isEmailProvided = false

    if (email) {
      // Si proporcionó email, validarlo
      const emailValidation = validateEmail(email)

      if (!emailValidation.isValid) {
        return NextResponse.json({
          success: false,
          error: emailValidation.error || 'Email inválido',
          requiresValidEmail: true
        }, { status: 400 })
      }

      validatedEmail = email
      isEmailProvided = true

      // Rate limit más permisivo con email válido
      const emailRateLimit = checkEmailRateLimit(email)
      if (!emailRateLimit.allowed) {
        return NextResponse.json({
          success: false,
          error: emailRateLimit.error || 'Has excedido el límite de cálculos diarios',
          rateLimited: true,
          resetAt: emailRateLimit.resetAt
        }, { status: 429 })
      }
    } else {
      // Sin email, verificar rate limit de IP (más restrictivo)
      const ipRateLimit = checkCalculationRateLimit(clientIP)

      if (!ipRateLimit.allowed) {
        return NextResponse.json({
          success: false,
          error: 'Has alcanzado el límite de cálculos gratuitos. Proporciona tu email para continuar.',
          requiresEmail: true,
          rateLimited: true,
          resetAt: ipRateLimit.resetAt
        }, { status: 429 })
      }
    }

    // Calcular potencial
    const result = calculatePotential(
      city,
      propertyType as 'studio' | 'onebed' | 'twobed' | 'threebed',
      Number(currentPrice),
      Number(currentOccupancy)
    )

    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'No se pudo calcular el potencial'
      }, { status: 500 })
    }

    // Si proporcionó email válido, guardar en BD
    if (validatedEmail) {
      try {
        const { prisma } = await import('../../../../src/lib/prisma')

        // Crear o actualizar subscriber
        await prisma.newsletterSubscriber.upsert({
          where: { email: validatedEmail },
          update: {
            name: name || undefined,
            city: MARKET_DATA[city].displayName,
            propertyCount: 1,
            tags: ['calculator-user'],
            source: 'calculadora-rentabilidad'
          },
          create: {
            email: validatedEmail,
            name: name || undefined,
            city: MARKET_DATA[city].displayName,
            propertyCount: 1,
            tags: ['calculator-user'],
            source: 'calculadora-rentabilidad',
            isActive: true
          }
        })

        // Registrar descarga/uso
        await prisma.lead.create({
          data: {
            name: name || 'Usuario',
            email: validatedEmail,
            source: 'calculadora-rentabilidad',
            metadata: {
              city,
              propertyType,
              currentPrice,
              currentOccupancy,
              calculatedGain: result.potentialGain
            }
          }
        })
        console.log(`[Lead] Created for ${validatedEmail} from calculadora-rentabilidad`)

        // TODO: Enviar email con resultados detallados usando Resend
        // await sendCalculatorResults(validatedEmail, name, result)

      } catch (dbError) {
        console.error('Error guardando en BD:', dbError)
        // No fallar el request si falla el guardado en BD
      }
    }

    // RESPUESTA DIFERENCIADA:
    // Sin email: solo datos básicos
    // Con email: datos completos
    const responseData: any = {
      currentMonthlyRevenue: result.currentMonthlyRevenue,
      marketMonthlyRevenue: result.marketMonthlyRevenue,
      potentialGain: result.potentialGain,
      suggestedPrice: result.suggestedPrice,
      suggestedOccupancy: result.suggestedOccupancy,
      priceRange: result.priceRange,
      city: MARKET_DATA[city].displayName,
      propertyType,
      hasFullAccess: isEmailProvided
    }

    // Solo incluir datos detallados si proporcionó email
    if (isEmailProvided) {
      responseData.seasonal = result.seasonal
      responseData.neighborhoods = result.neighborhoods
      responseData.insights = generateInsights(result, currentPrice, currentOccupancy)
    }

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error('Error en calculate-profitability:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al calcular rentabilidad'
    }, { status: 500 })
  }
}

// Helper: Generar insights personalizados
function generateInsights(
  result: any,
  currentPrice: number,
  currentOccupancy: number
) {
  const insights = []

  // Insight sobre precio
  if (currentPrice < result.suggestedPrice * 0.8) {
    insights.push({
      type: 'price',
      severity: 'high',
      message: `Tu precio está ${Math.round(((result.suggestedPrice - currentPrice) / result.suggestedPrice) * 100)}% por debajo del mercado`,
      recommendation: `Considera subir a €${result.suggestedPrice}/noche`
    })
  } else if (currentPrice > result.suggestedPrice * 1.2) {
    insights.push({
      type: 'price',
      severity: 'medium',
      message: `Tu precio está por encima del promedio del mercado`,
      recommendation: 'Asegúrate de que tu valor agregado justifique el precio premium'
    })
  }

  // Insight sobre ocupación
  if (currentOccupancy < result.suggestedOccupancy * 0.8) {
    insights.push({
      type: 'occupancy',
      severity: 'high',
      message: `Tu ocupación está ${Math.round(result.suggestedOccupancy - currentOccupancy)}% por debajo del mercado`,
      recommendation: 'Optimiza tu título, fotos y descripción para aumentar visibilidad'
    })
  }

  // Insight sobre potencial de ganancias
  if (result.potentialGain > 500) {
    insights.push({
      type: 'revenue',
      severity: 'high',
      message: `Tienes un potencial de €${result.potentialGain}/mes sin explotar`,
      recommendation: 'Descarga nuestra guía de optimización de pricing'
    })
  } else if (result.potentialGain < -200) {
    insights.push({
      type: 'revenue',
      severity: 'medium',
      message: `Estás ganando más que el promedio del mercado. ¡Excelente trabajo!`,
      recommendation: 'Mantén tu estrategia actual y considera escalar a más propiedades'
    })
  }

  return insights
}
