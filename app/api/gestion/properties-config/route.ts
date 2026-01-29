import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/properties-config
 * Get properties with their billing configuration
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const properties = await prisma.property.findMany({
      where: { hostId: userId },
      select: {
        id: true,
        name: true,
        city: true,
        profileImage: true,
        billingConfig: {
          select: {
            id: true,
            ownerId: true,
            airbnbNames: true,
            bookingNames: true,
            vrboNames: true,
            incomeReceiver: true,
            commissionType: true,
            commissionValue: true,
            commissionVat: true,
            cleaningType: true,
            cleaningValue: true,
            cleaningFeeRecipient: true,
            cleaningFeeSplitPct: true,
            monthlyFee: true,
            defaultVatRate: true,
            defaultRetentionRate: true,
            invoiceDetailLevel: true,
            owner: {
              select: {
                id: true,
                type: true,
                firstName: true,
                lastName: true,
                companyName: true,
                nif: true,
                cif: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    const formattedProperties = properties.map(p => ({
      id: p.id,
      name: p.name,
      city: p.city,
      profileImage: p.profileImage,
      billingConfig: p.billingConfig ? {
        id: p.billingConfig.id,
        ownerId: p.billingConfig.ownerId,
        owner: p.billingConfig.owner,
        airbnbNames: p.billingConfig.airbnbNames,
        bookingNames: p.billingConfig.bookingNames,
        vrboNames: p.billingConfig.vrboNames,
        incomeReceiver: p.billingConfig.incomeReceiver,
        commissionType: p.billingConfig.commissionType,
        commissionValue: Number(p.billingConfig.commissionValue),
        commissionVat: Number(p.billingConfig.commissionVat),
        cleaningType: p.billingConfig.cleaningType,
        cleaningValue: Number(p.billingConfig.cleaningValue),
        cleaningFeeRecipient: p.billingConfig.cleaningFeeRecipient,
        cleaningFeeSplitPct: p.billingConfig.cleaningFeeSplitPct ? Number(p.billingConfig.cleaningFeeSplitPct) : null,
        monthlyFee: Number(p.billingConfig.monthlyFee),
        defaultVatRate: Number(p.billingConfig.defaultVatRate),
        defaultRetentionRate: Number(p.billingConfig.defaultRetentionRate),
        invoiceDetailLevel: p.billingConfig.invoiceDetailLevel
      } : null
    }))

    return NextResponse.json({ properties: formattedProperties })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
