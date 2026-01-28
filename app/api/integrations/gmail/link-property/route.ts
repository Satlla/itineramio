import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * POST /api/integrations/gmail/link-property
 * Link emails to a property and save the alias for future auto-matching
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const {
      emailIds,
      billingConfigId,
      propertyNameAlias, // The name from the email to save as alias
      saveAlias = true,  // Whether to save the alias for future matching
      platform = 'airbnb'
    } = body

    if (!billingConfigId) {
      return NextResponse.json(
        { error: 'Selecciona una propiedad' },
        { status: 400 }
      )
    }

    if (!emailIds || emailIds.length === 0) {
      return NextResponse.json(
        { error: 'No hay emails seleccionados' },
        { status: 400 }
      )
    }

    let actualConfigId = billingConfigId
    let billingConfig: {
      id: string
      airbnbNames: string[]
      bookingNames: string[]
      vrboNames: string[]
    } | null = null

    // Check if this is a pending config (property without billingConfig)
    if (billingConfigId.startsWith('pending-')) {
      const propertyId = billingConfigId.replace('pending-', '')

      // Verify property belongs to user
      const property = await prisma.property.findFirst({
        where: { id: propertyId, hostId: userId }
      })

      if (!property) {
        return NextResponse.json(
          { error: 'Propiedad no encontrada' },
          { status: 404 }
        )
      }

      // Create billing config with defaults (no owner = user keeps 100%)
      billingConfig = await prisma.propertyBillingConfig.create({
        data: {
          propertyId,
          ownerId: null, // No owner = user is the owner
          incomeReceiver: 'MANAGER',
          commissionType: 'PERCENTAGE',
          commissionValue: 0, // 0% commission = keep everything
          cleaningFeeRecipient: 'MANAGER',
          airbnbNames: [],
          bookingNames: [],
          vrboNames: []
        },
        select: {
          id: true,
          airbnbNames: true,
          bookingNames: true,
          vrboNames: true
        }
      })
      actualConfigId = billingConfig.id
    } else {
      // Verify existing billing config belongs to user
      billingConfig = await prisma.propertyBillingConfig.findFirst({
        where: {
          id: billingConfigId,
          property: { hostId: userId }
        },
        select: {
          id: true,
          airbnbNames: true,
          bookingNames: true,
          vrboNames: true
        }
      })

      if (!billingConfig) {
        return NextResponse.json(
          { error: 'Configuración no encontrada' },
          { status: 404 }
        )
      }
    }

    // Save alias if provided and not already saved
    if (saveAlias && propertyNameAlias && billingConfig) {
      const normalizedAlias = propertyNameAlias.trim()

      if (platform === 'airbnb') {
        if (!billingConfig.airbnbNames.includes(normalizedAlias)) {
          await prisma.propertyBillingConfig.update({
            where: { id: actualConfigId },
            data: {
              airbnbNames: {
                push: normalizedAlias
              }
            }
          })
        }
      } else if (platform === 'booking') {
        if (!billingConfig.bookingNames.includes(normalizedAlias)) {
          await prisma.propertyBillingConfig.update({
            where: { id: actualConfigId },
            data: {
              bookingNames: {
                push: normalizedAlias
              }
            }
          })
        }
      } else if (platform === 'vrbo') {
        if (!billingConfig.vrboNames.includes(normalizedAlias)) {
          await prisma.propertyBillingConfig.update({
            where: { id: actualConfigId },
            data: {
              vrboNames: {
                push: normalizedAlias
              }
            }
          })
        }
      }
    }

    // Return success with actual config ID
    return NextResponse.json({
      success: true,
      message: `${emailIds.length} emails vinculados`,
      aliasAdded: saveAlias && propertyNameAlias ? propertyNameAlias : null,
      billingConfigId: actualConfigId,
      configCreated: billingConfigId.startsWith('pending-')
    })
  } catch (error) {
    console.error('Error linking property:', error)
    return NextResponse.json(
      { error: 'Error al vincular propiedad' },
      { status: 500 }
    )
  }
}
