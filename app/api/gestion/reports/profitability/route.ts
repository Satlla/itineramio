import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * GET /api/gestion/reports/profitability
 * Get profitability report data or export as CSV
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const ownerId = searchParams.get('ownerId')
    const propertyId = searchParams.get('propertyId')
    const format = searchParams.get('format') || 'json' // 'json' or 'csv'

    // Default to current year
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1)
    const end = endDate ? new Date(endDate) : new Date()

    // Build where clause
    const where: any = {
      userId,
      checkOut: {
        gte: start,
        lte: end
      },
      status: { not: 'CANCELLED' }
    }

    if (ownerId) {
      where.billingConfig = {
        ownerId
      }
    }

    if (propertyId) {
      where.billingConfig = {
        ...where.billingConfig,
        propertyId
      }
    }

    // Get reservations with property and owner info
    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        billingConfig: {
          select: {
            propertyId: true,
            ownerId: true,
            commissionValue: true,
            commissionType: true,
            property: {
              select: {
                id: true,
                name: true,
                city: true
              }
            },
            owner: {
              select: {
                id: true,
                type: true,
                firstName: true,
                lastName: true,
                companyName: true
              }
            }
          }
        }
      },
      orderBy: [
        { checkIn: 'asc' }
      ]
    })

    // Group by property for summary
    const byProperty = new Map<string, {
      property: any
      owner: any
      commissionValue: number
      reservations: number
      nights: number
      hostEarnings: number
      managerAmount: number
      ownerAmount: number
      cleaningAmount: number
      invoiced: number
      pending: number
    }>()

    const rows: any[] = []

    for (const r of reservations) {
      const property = r.billingConfig.property
      const owner = r.billingConfig.owner
      const commissionValue = Number(r.billingConfig.commissionValue) || 0

      if (!byProperty.has(property.id)) {
        byProperty.set(property.id, {
          property,
          owner,
          commissionValue,
          reservations: 0,
          nights: 0,
          hostEarnings: 0,
          managerAmount: 0,
          ownerAmount: 0,
          cleaningAmount: 0,
          invoiced: 0,
          pending: 0
        })
      }

      const propertyData = byProperty.get(property.id)!
      const hostEarnings = Number(r.hostEarnings) || 0
      const managerAmount = Number(r.managerAmount) || 0
      const ownerAmount = Number(r.ownerAmount) || 0
      const cleaningAmount = Number(r.cleaningAmount) || 0

      propertyData.reservations++
      propertyData.nights += r.nights
      propertyData.hostEarnings += hostEarnings
      propertyData.managerAmount += managerAmount
      propertyData.ownerAmount += ownerAmount
      propertyData.cleaningAmount += cleaningAmount

      if (r.invoiced) {
        propertyData.invoiced++
      } else {
        propertyData.pending++
      }

      // Build row for CSV
      const ownerName = owner
        ? owner.type === 'EMPRESA'
          ? owner.companyName
          : `${owner.firstName || ''} ${owner.lastName || ''}`.trim()
        : 'Sin propietario'

      rows.push({
        propiedad: property.name,
        ciudad: property.city,
        propietario: ownerName,
        comision: commissionValue,
        plataforma: r.platform,
        codigo: r.confirmationCode,
        huesped: r.guestName,
        checkIn: r.checkIn.toISOString().split('T')[0],
        checkOut: r.checkOut.toISOString().split('T')[0],
        noches: r.nights,
        ingresoNeto: hostEarnings,
        comisionGestor: managerAmount,
        importePropietario: ownerAmount,
        limpieza: cleaningAmount,
        facturado: r.invoiced ? 'Sí' : 'No',
        estado: r.status
      })
    }

    // Calculate totals
    const totals = {
      reservations: 0,
      nights: 0,
      hostEarnings: 0,
      managerAmount: 0,
      ownerAmount: 0,
      cleaningAmount: 0,
      invoiced: 0,
      pending: 0
    }

    const properties = Array.from(byProperty.values()).map(p => {
      totals.reservations += p.reservations
      totals.nights += p.nights
      totals.hostEarnings += p.hostEarnings
      totals.managerAmount += p.managerAmount
      totals.ownerAmount += p.ownerAmount
      totals.cleaningAmount += p.cleaningAmount
      totals.invoiced += p.invoiced
      totals.pending += p.pending

      return {
        property: p.property,
        owner: p.owner,
        commissionValue: p.commissionValue,
        reservations: p.reservations,
        nights: p.nights,
        hostEarnings: Math.round(p.hostEarnings * 100) / 100,
        managerAmount: Math.round(p.managerAmount * 100) / 100,
        ownerAmount: Math.round(p.ownerAmount * 100) / 100,
        cleaningAmount: Math.round(p.cleaningAmount * 100) / 100,
        invoiced: p.invoiced,
        pending: p.pending
      }
    })

    // Sort by managerAmount descending
    properties.sort((a, b) => b.managerAmount - a.managerAmount)

    // Round totals
    totals.hostEarnings = Math.round(totals.hostEarnings * 100) / 100
    totals.managerAmount = Math.round(totals.managerAmount * 100) / 100
    totals.ownerAmount = Math.round(totals.ownerAmount * 100) / 100
    totals.cleaningAmount = Math.round(totals.cleaningAmount * 100) / 100

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Propiedad',
        'Ciudad',
        'Propietario',
        'Comisión %',
        'Plataforma',
        'Código',
        'Huésped',
        'Check-in',
        'Check-out',
        'Noches',
        'Ingreso Neto €',
        'Comisión Gestor €',
        'Importe Propietario €',
        'Limpieza €',
        'Facturado',
        'Estado'
      ]

      const csvRows = [headers.join(';')]

      for (const row of rows) {
        csvRows.push([
          escapeCSV(row.propiedad),
          escapeCSV(row.ciudad),
          escapeCSV(row.propietario),
          row.comision,
          row.plataforma,
          row.codigo,
          escapeCSV(row.huesped),
          row.checkIn,
          row.checkOut,
          row.noches,
          row.ingresoNeto.toFixed(2).replace('.', ','),
          row.comisionGestor.toFixed(2).replace('.', ','),
          row.importePropietario.toFixed(2).replace('.', ','),
          row.limpieza.toFixed(2).replace('.', ','),
          row.facturado,
          row.estado
        ].join(';'))
      }

      // Add totals row
      csvRows.push('')
      csvRows.push([
        'TOTAL',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        totals.nights,
        totals.hostEarnings.toFixed(2).replace('.', ','),
        totals.managerAmount.toFixed(2).replace('.', ','),
        totals.ownerAmount.toFixed(2).replace('.', ','),
        totals.cleaningAmount.toFixed(2).replace('.', ','),
        `${totals.invoiced}/${totals.reservations}`,
        ''
      ].join(';'))

      const csvContent = csvRows.join('\n')

      // Add BOM for Excel UTF-8 support
      const bom = '\uFEFF'
      const csvWithBom = bom + csvContent

      const filename = `rentabilidad_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}.csv`

      return new NextResponse(csvWithBom, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      })
    }

    // Return JSON format
    return NextResponse.json({
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      properties,
      totals
    })
  } catch (error) {
    console.error('Error generating profitability report:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * Escape CSV value
 */
function escapeCSV(value: string): string {
  if (!value) return ''
  // If value contains semicolon, newline or quotes, wrap in quotes
  if (value.includes(';') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
