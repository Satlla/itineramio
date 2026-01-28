import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import * as XLSX from 'xlsx'

/**
 * GET /api/gestion/properties/[propertyId]/reservations/export
 * Export reservations to Excel
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId
    const { propertyId } = await params

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear()
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null

    // Verify property ownership
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        hostId: true,
        name: true,
        billingConfig: {
          select: {
            id: true,
            commissionValue: true,
            owner: {
              select: {
                firstName: true,
                lastName: true,
                companyName: true,
                type: true
              }
            }
          }
        }
      }
    })

    if (!property || property.hostId !== userId) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 })
    }

    if (!property.billingConfig) {
      return NextResponse.json({ error: 'Configura la facturación primero' }, { status: 400 })
    }

    // Build date filter
    let startDate: Date
    let endDate: Date
    let periodLabel: string

    if (month) {
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0, 23, 59, 59)
      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
      periodLabel = `${monthNames[month - 1]} ${year}`
    } else {
      startDate = new Date(year, 0, 1)
      endDate = new Date(year, 11, 31, 23, 59, 59)
      periodLabel = `Año ${year}`
    }

    // Get reservations
    const reservations = await prisma.reservation.findMany({
      where: {
        billingConfigId: property.billingConfig.id,
        checkOut: { gte: startDate, lte: endDate },
        status: { not: 'CANCELLED' }
      },
      orderBy: { checkIn: 'asc' }
    })

    // Prepare data for Excel
    const ownerName = property.billingConfig.owner
      ? property.billingConfig.owner.type === 'EMPRESA'
        ? property.billingConfig.owner.companyName
        : `${property.billingConfig.owner.firstName} ${property.billingConfig.owner.lastName}`
      : 'Sin propietario'

    // Create header rows
    const headerRows = [
      ['INFORME DE RESERVAS'],
      [''],
      ['Propiedad:', property.name],
      ['Propietario:', ownerName],
      ['Periodo:', periodLabel],
      ['Fecha de exportación:', new Date().toLocaleDateString('es-ES')],
      [''],
      ['']
    ]

    // Data rows
    const dataHeaders = [
      'Código', 'Plataforma', 'Huésped', 'País',
      'Check-in', 'Check-out', 'Noches',
      'Alojamiento', 'Limpieza', 'Comisión Plataforma', 'Cobro Neto',
      'Comisión Gestor', 'Limpieza Gestor', 'Para Propietario',
      'Estado', 'Facturado'
    ]

    const dataRows = reservations.map(r => [
      r.confirmationCode,
      r.platform,
      r.guestName,
      r.guestCountry || '-',
      new Date(r.checkIn).toLocaleDateString('es-ES'),
      new Date(r.checkOut).toLocaleDateString('es-ES'),
      r.nights,
      Number(r.roomTotal) || 0,
      Number(r.cleaningFee) || 0,
      Number(r.hostServiceFee) || 0,
      Number(r.hostEarnings) || 0,
      Number(r.managerAmount) || 0,
      Number(r.cleaningAmount) || 0,
      Number(r.ownerAmount) || 0,
      r.status === 'COMPLETED' ? 'Finalizada' : r.status === 'CONFIRMED' ? 'Confirmada' : r.status,
      r.invoiced ? 'Sí' : 'No'
    ])

    // Calculate totals
    const totals = reservations.reduce((acc, r) => ({
      nights: acc.nights + r.nights,
      roomTotal: acc.roomTotal + (Number(r.roomTotal) || 0),
      cleaningFee: acc.cleaningFee + (Number(r.cleaningFee) || 0),
      hostServiceFee: acc.hostServiceFee + (Number(r.hostServiceFee) || 0),
      hostEarnings: acc.hostEarnings + (Number(r.hostEarnings) || 0),
      managerAmount: acc.managerAmount + (Number(r.managerAmount) || 0),
      cleaningAmount: acc.cleaningAmount + (Number(r.cleaningAmount) || 0),
      ownerAmount: acc.ownerAmount + (Number(r.ownerAmount) || 0)
    }), {
      nights: 0, roomTotal: 0, cleaningFee: 0, hostServiceFee: 0,
      hostEarnings: 0, managerAmount: 0, cleaningAmount: 0, ownerAmount: 0
    })

    const totalRow = [
      'TOTALES', '', '', '',
      '', '', totals.nights,
      totals.roomTotal, totals.cleaningFee, totals.hostServiceFee, totals.hostEarnings,
      totals.managerAmount, totals.cleaningAmount, totals.ownerAmount,
      '', ''
    ]

    // Summary section
    const summaryRows = [
      [''],
      [''],
      ['RESUMEN'],
      ['Total reservas:', reservations.length],
      ['Total noches:', totals.nights],
      [''],
      ['Ingresos brutos alojamiento:', `${totals.roomTotal.toFixed(2)}€`],
      ['Limpieza cobrada:', `${totals.cleaningFee.toFixed(2)}€`],
      ['Comisiones plataforma:', `-${totals.hostServiceFee.toFixed(2)}€`],
      ['Cobro neto:', `${totals.hostEarnings.toFixed(2)}€`],
      [''],
      ['REPARTO:'],
      ['Tu comisión:', `${totals.managerAmount.toFixed(2)}€`],
      ['Limpieza (gestor):', `${totals.cleaningAmount.toFixed(2)}€`],
      ['Para propietario:', `${totals.ownerAmount.toFixed(2)}€`]
    ]

    // Build worksheet
    const allRows = [
      ...headerRows,
      dataHeaders,
      ...dataRows,
      [],
      totalRow,
      ...summaryRows
    ]

    const ws = XLSX.utils.aoa_to_sheet(allRows)

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // Código
      { wch: 12 }, // Plataforma
      { wch: 25 }, // Huésped
      { wch: 10 }, // País
      { wch: 12 }, // Check-in
      { wch: 12 }, // Check-out
      { wch: 8 },  // Noches
      { wch: 12 }, // Alojamiento
      { wch: 10 }, // Limpieza
      { wch: 15 }, // Comisión Plataforma
      { wch: 12 }, // Cobro Neto
      { wch: 14 }, // Comisión Gestor
      { wch: 14 }, // Limpieza Gestor
      { wch: 14 }, // Para Propietario
      { wch: 12 }, // Estado
      { wch: 10 }  // Facturado
    ]

    // Create workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Reservas')

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Generate filename
    const fileName = `Reservas_${property.name.replace(/[^a-zA-Z0-9]/g, '_')}_${periodLabel.replace(/\s/g, '_')}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    })
  } catch (error) {
    console.error('Error exporting reservations:', error)
    return NextResponse.json({ error: 'Error al exportar' }, { status: 500 })
  }
}
