import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { getNextInvoiceNumber } from '@/lib/invoice-numbering'
// Auto-creates config and series if needed - no external dependency

/**
 * GET /api/gestion/invoices/property-month
 * Get or create a draft invoice for a specific property and month
 *
 * Query params:
 * - propertyId: string (required)
 * - year: number (required)
 * - month: number 1-12 (required)
 * - detailLevel: 'DETAILED' | 'SUMMARY' (optional, overrides property config)
 * - regenerate: 'true' to force regenerate items (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const year = parseInt(searchParams.get('year') || '')
    const month = parseInt(searchParams.get('month') || '')
    const detailLevelParam = searchParams.get('detailLevel') as 'DETAILED' | 'SUMMARY' | null
    const regenerate = searchParams.get('regenerate') === 'true'

    if (!propertyId || !year || !month || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Parámetros inválidos: propertyId, year y month son requeridos' },
        { status: 400 }
      )
    }

    const isUnit = searchParams.get('type') === 'unit'
    let ownerId: string | null = null
    let propertyName = ''
    let propertyCity = ''
    let billingConfig: any = null
    let billingUnitId: string | null = null

    if (isUnit) {
      // Handle BillingUnit
      const billingUnit = await prisma.billingUnit.findFirst({
        where: { id: propertyId, userId },
        include: {
          owner: true
        }
      })

      if (!billingUnit) {
        return NextResponse.json(
          { error: 'Apartamento no encontrado' },
          { status: 404 }
        )
      }

      if (!billingUnit.ownerId) {
        return NextResponse.json(
          { error: 'Este apartamento no tiene un propietario asignado. Configúralo primero.' },
          { status: 400 }
        )
      }

      ownerId = billingUnit.ownerId
      propertyName = billingUnit.name
      propertyCity = billingUnit.city || ''
      billingUnitId = billingUnit.id
      billingConfig = {
        id: billingUnit.id,
        commissionValue: billingUnit.commissionValue,
        commissionVat: Number(billingUnit.commissionVat) || 21,
        cleaningValue: billingUnit.cleaningValue,
        cleaningVatIncluded: billingUnit.cleaningVatIncluded ?? true,
        invoiceDetailLevel: billingUnit.invoiceDetailLevel || 'DETAILED',
        singleConceptText: billingUnit.singleConceptText || 'Gestión apartamento turístico',
        owner: billingUnit.owner
      }
    } else {
      // Handle legacy Property
      const property = await prisma.property.findFirst({
        where: { id: propertyId, hostId: userId },
        include: {
          billingConfig: {
            include: {
              owner: true
            }
          }
        }
      })

      if (!property) {
        return NextResponse.json(
          { error: 'Propiedad no encontrada' },
          { status: 404 }
        )
      }

      if (!property.billingConfig?.ownerId) {
        return NextResponse.json(
          { error: 'Esta propiedad no tiene un propietario asignado. Configúralo primero en Configuración.' },
          { status: 400 }
        )
      }

      ownerId = property.billingConfig.ownerId
      propertyName = property.name
      propertyCity = property.city || ''
      billingConfig = property.billingConfig
    }

    // Get or create invoice config
    const currentYear = new Date().getFullYear()
    let invoiceConfig = await prisma.userInvoiceConfig.findUnique({
      where: { userId },
      include: {
        invoiceSeries: {
          where: { isActive: true, type: 'STANDARD', year: currentYear },
          orderBy: { isDefault: 'desc' } // Prefer default series, but use any active one
        }
      }
    })

    // Auto-create config if doesn't exist
    if (!invoiceConfig) {
      // Get user info for defaults
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true }
      })

      invoiceConfig = await prisma.userInvoiceConfig.create({
        data: {
          userId,
          businessName: user?.name || 'Mi Empresa',
          nif: '',
          address: '',
          city: '',
          postalCode: '',
          country: 'España',
          email: user?.email || '',
          phone: ''
        },
        include: {
          invoiceSeries: {
            where: { isActive: true, type: 'STANDARD', year: currentYear },
            orderBy: { isDefault: 'desc' }
          }
        }
      })
    }

    // Auto-create default series if doesn't exist
    let seriesId: string
    if (invoiceConfig.invoiceSeries && invoiceConfig.invoiceSeries.length > 0) {
      seriesId = invoiceConfig.invoiceSeries[0].id
    } else {
      // Check if a series already exists (maybe not active or different year)
      const existingSeries = await prisma.invoiceSeries.findFirst({
        where: {
          invoiceConfigId: invoiceConfig.id,
          prefix: 'F',
          year: currentYear
        }
      })

      if (existingSeries) {
        // Use existing series (update to active if needed)
        if (!existingSeries.isActive) {
          await prisma.invoiceSeries.update({
            where: { id: existingSeries.id },
            data: { isActive: true }
          })
        }
        seriesId = existingSeries.id
      } else {
        // Create new series only if none exists
        const newSeries = await prisma.invoiceSeries.create({
          data: {
            invoiceConfigId: invoiceConfig.id,
            name: `Facturas ${currentYear}`,
            prefix: 'F',
            year: currentYear,
            type: 'STANDARD',
            currentNumber: 0,
            resetYearly: true,
            lastResetYear: currentYear,
            isDefault: true,
            isActive: true
          }
        })
        seriesId = newSeries.id
      }
    }

    // Try to find existing draft invoice for this property/month
    const invoiceWhereClause = isUnit
      ? { userId, billingUnitId: propertyId, periodYear: year, periodMonth: month, status: 'DRAFT' as const }
      : { userId, propertyId, periodYear: year, periodMonth: month, status: 'DRAFT' as const }

    let invoice = await prisma.clientInvoice.findFirst({
      where: invoiceWhereClause,
      include: {
        owner: {
          select: {
            id: true,
            type: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
            nif: true,
            cif: true,
            address: true,
            city: true,
            postalCode: true,
            country: true,
            phone: true
          }
        },
        billingUnit: isUnit ? {
          select: {
            id: true,
            name: true,
            city: true
          }
        } : false,
        property: !isUnit ? {
          select: {
            id: true,
            name: true,
            city: true
          }
        } : false,
        series: {
          select: {
            id: true,
            name: true,
            prefix: true
          }
        },
        items: {
          orderBy: { order: 'asc' }
        }
      }
    })

    // Store existing invoice ID for regenerate case
    const existingInvoiceId = invoice?.id
    // DRAFT invoices always regenerate to show current data (reservations, expenses)
    const shouldRegenerate = (regenerate || invoice?.status === 'DRAFT') && existingInvoiceId

    // If regenerate requested or it's a draft, delete items first
    if (shouldRegenerate) {
      await prisma.clientInvoiceItem.deleteMany({
        where: { invoiceId: existingInvoiceId }
      })
    }

    // If no draft exists or regenerate requested, create/update items
    if (!invoice || shouldRegenerate) {
      // seriesId already obtained above

      // Get reservations for this property/month to create initial items
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 1)

      // Query reservations based on whether it's a BillingUnit or Property
      const reservationWhere: any = {
        userId,
        checkIn: {
          gte: startDate,
          lt: endDate
        },
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      }

      if (billingUnitId) {
        reservationWhere.billingUnitId = billingUnitId
      } else {
        reservationWhere.billingConfig = { propertyId }
      }

      const reservations = await prisma.reservation.findMany({
        where: reservationWhere,
        orderBy: { checkIn: 'asc' }
      })

      // Calculate items based on reservations and billing config
      // billingConfig already set above based on property type
      const commissionPct = Number(billingConfig.commissionValue) / 100
      const commissionVat = Number(billingConfig.commissionVat)
      const cleaningVatIncluded = billingConfig.cleaningVatIncluded
      const cleaningVatRate = cleaningVatIncluded ? 21 : 0 // If VAT included, we need to show it
      const invoiceDetailLevel = detailLevelParam || billingConfig.invoiceDetailLevel // DETAILED or SUMMARY

      // Retención automática: 15% si el propietario es EMPRESA, 0% si es PERSONA_FISICA
      const ownerIsCompany = billingConfig.owner?.type === 'EMPRESA'
      const retentionRate = ownerIsCompany ? 15 : 0
      const cleaningRetentionRate = retentionRate // Misma retención para limpieza

      const items: any[] = []
      let totalCommission = 0
      let totalCleaning = 0

      if (invoiceDetailLevel === 'DETAILED') {
        // Create one line per reservation for commission
        reservations.forEach((r, index) => {
          const earnings = Number(r.hostEarnings)
          const cleaning = Number(r.cleaningFee)
          const baseForCommission = earnings - cleaning
          const commission = baseForCommission * commissionPct

          totalCommission += commission

          // Format dates: "15-18 ene" or "28 dic - 2 ene"
          const checkIn = new Date(r.checkIn)
          const checkOut = new Date(r.checkOut)
          const sameMonth = checkIn.getMonth() === checkOut.getMonth()
          const dateRange = sameMonth
            ? `${checkIn.getDate()}-${checkOut.getDate()} ${checkIn.toLocaleDateString('es-ES', { month: 'short' })}`
            : `${checkIn.getDate()} ${checkIn.toLocaleDateString('es-ES', { month: 'short' })} - ${checkOut.getDate()} ${checkOut.toLocaleDateString('es-ES', { month: 'short' })}`

          items.push({
            concept: `${r.guestName} · ${dateRange}`,
            description: null,
            quantity: 1,
            unitPrice: commission,
            vatRate: commissionVat,
            retentionRate: retentionRate,
            total: commission * (1 + commissionVat / 100),
            reservationId: r.id,
            order: index
          })
        })

        // Add cleaning as grouped line
        if (reservations.length > 0) {
          const cleaningPerUnit = Number(billingConfig.cleaningValue) || 0
          if (cleaningPerUnit > 0) {
            // If VAT is included in config, extract the base price per unit
            const cleaningUnitBase = Math.round((cleaningVatIncluded ? cleaningPerUnit / 1.21 : cleaningPerUnit) * 100) / 100
            const cleaningQuantity = reservations.length
            const cleaningTotalBase = Math.round(cleaningUnitBase * cleaningQuantity * 100) / 100
            const cleaningTotalWithVat = Math.round(cleaningTotalBase * 1.21 * 100) / 100
            const cleaningRetention = cleaningTotalBase * (cleaningRetentionRate / 100)
            items.push({
              concept: 'Limpieza',
              quantity: cleaningQuantity,
              unitPrice: cleaningUnitBase,
              vatRate: 21,
              retentionRate: cleaningRetentionRate,
              total: cleaningTotalWithVat - cleaningRetention,
              order: items.length
            })
            totalCleaning = cleaningTotalBase
          }
        }

      } else {
        // SUMMARY mode - one line for all commissions, one for cleaning
        reservations.forEach(r => {
          const earnings = Number(r.hostEarnings)
          const cleaning = Number(r.cleaningFee)
          const baseForCommission = earnings - cleaning
          totalCommission += baseForCommission * commissionPct
          totalCleaning += cleaning
        })

        const conceptText = billingConfig.singleConceptText || `Gestión apartamento turístico`

        if (totalCommission > 0) {
          items.push({
            concept: `${conceptText} - ${getMonthName(month)} ${year}`,
            quantity: 1,
            unitPrice: totalCommission,
            vatRate: commissionVat,
            retentionRate: retentionRate,
            total: totalCommission * (1 + commissionVat / 100),
            order: 0
          })
        }

        // Add cleaning line using config value per unit
        const cleaningPerUnit = Number(billingConfig.cleaningValue) || 0
        if (cleaningPerUnit > 0 && reservations.length > 0) {
          const cleaningUnitBase = Math.round((cleaningVatIncluded ? cleaningPerUnit / 1.21 : cleaningPerUnit) * 100) / 100
          const cleaningQuantity = reservations.length
          const cleaningTotalBase = Math.round(cleaningUnitBase * cleaningQuantity * 100) / 100
          const cleaningTotalWithVat = Math.round(cleaningTotalBase * 1.21 * 100) / 100
          const cleaningRetention = cleaningTotalBase * (cleaningRetentionRate / 100)
          items.push({
            concept: 'Limpieza',
            quantity: cleaningQuantity,
            unitPrice: cleaningUnitBase,
            vatRate: 21,
            retentionRate: cleaningRetentionRate,
            total: cleaningTotalWithVat - cleaningRetention,
            order: 1
          })
          totalCleaning = cleaningTotalBase
        }
      }

      // Get expenses for this property/month (chargeToOwner = true, not yet invoiced)
      const lastDayOfMonth = new Date(year, month, 0) // Last day of the month

      // Query expenses based on whether it's a BillingUnit or Property
      const expenseWhere: any = {
        date: {
          gte: startDate,
          lte: lastDayOfMonth
        },
        chargeToOwner: true
      }

      if (billingUnitId) {
        expenseWhere.billingUnitId = billingUnitId
      } else {
        expenseWhere.billingConfigId = billingConfig.id
      }

      const propertyExpenses = await prisma.propertyExpense.findMany({
        where: expenseWhere,
        orderBy: { date: 'asc' }
      })

      // Add expenses as invoice items
      propertyExpenses.forEach((expense) => {
        const expenseAmount = Number(expense.amount)
        const expenseVat = Number(expense.vatAmount) || 0

        // Determine VAT rate from amounts - round to standard rates (21%, 10%, 4%, 0%)
        let vatRate = 0
        if (expenseVat > 0 && expenseAmount > 0) {
          const calculatedRate = (expenseVat / expenseAmount) * 100
          // Round to nearest standard VAT rate
          if (calculatedRate >= 18) vatRate = 21
          else if (calculatedRate >= 7) vatRate = 10
          else if (calculatedRate >= 2) vatRate = 4
          else vatRate = 0
        }

        // Recalculate VAT with standard rate for consistency
        const standardVat = expenseAmount * (vatRate / 100)

        items.push({
          concept: expense.concept + (expense.supplierName ? ` (${expense.supplierName})` : ''),
          description: expense.invoiceNumber ? `Factura: ${expense.invoiceNumber}` : null,
          quantity: 1,
          unitPrice: expenseAmount,
          vatRate: vatRate,
          retentionRate: 0,
          total: expenseAmount + standardVat,
          order: items.length
        })
      })

      // Calculate totals
      let subtotal = 0
      let totalVatAmount = 0
      let totalRetentionAmount = 0

      items.forEach(item => {
        subtotal += item.unitPrice * item.quantity
        totalVatAmount += item.unitPrice * item.quantity * (item.vatRate / 100)
        totalRetentionAmount += item.unitPrice * item.quantity * (item.retentionRate / 100)
      })

      const total = subtotal + totalVatAmount - totalRetentionAmount

      // Create or update the draft invoice
      const invoiceInclude = {
        owner: {
          select: {
            id: true,
            type: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
            nif: true,
            cif: true,
            address: true,
            city: true,
            postalCode: true,
            country: true,
            phone: true
          }
        },
        billingUnit: isUnit ? {
          select: {
            id: true,
            name: true,
            city: true
          }
        } : false,
        property: !isUnit ? {
          select: {
            id: true,
            name: true,
            city: true
          }
        } : false,
        series: {
          select: {
            id: true,
            name: true,
            prefix: true
          }
        },
        items: {
          orderBy: { order: 'asc' as const }
        }
      }

      if (shouldRegenerate && existingInvoiceId) {
        // Update existing invoice with new items and owner (in case it changed)
        invoice = await prisma.clientInvoice.update({
          where: { id: existingInvoiceId },
          data: {
            ownerId, // Update owner in case it changed in config
            subtotal,
            totalVat: totalVatAmount,
            retentionRate: retentionRate,
            retentionAmount: totalRetentionAmount,
            total,
            items: {
              create: items.map(item => ({
                concept: item.concept,
                description: item.description || null,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                vatRate: item.vatRate,
                retentionRate: item.retentionRate,
                total: item.total,
                reservationId: item.reservationId || null,
                order: item.order
              }))
            }
          },
          include: invoiceInclude
        })
      } else {
        // Get next invoice number immediately
        const numberResult = await getNextInvoiceNumber(seriesId)

        // Create new invoice with number assigned
        // Use correct field based on whether it's a BillingUnit or legacy Property
        const invoiceData = {
          userId,
          ownerId,
          seriesId,
          number: numberResult.number,
          fullNumber: numberResult.fullNumber,
          periodYear: year,
          periodMonth: month,
          issueDate: new Date(),
          subtotal,
          totalVat: totalVatAmount,
          retentionRate: retentionRate,
          retentionAmount: totalRetentionAmount,
          total,
          status: 'DRAFT' as const,
          isLocked: false,
          ...(isUnit ? { billingUnitId: propertyId } : { propertyId }),
          items: {
            create: items.map(item => ({
              concept: item.concept,
              description: item.description || null,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              vatRate: item.vatRate,
              retentionRate: item.retentionRate,
              total: item.total,
              reservationId: item.reservationId || null,
              order: item.order
            }))
          }
        }

        invoice = await prisma.clientInvoice.create({
          data: invoiceData,
          include: invoiceInclude
        })
      }
    }

    // invoiceConfig already fetched at the beginning
    if (!invoice) {
      return NextResponse.json(
        { error: 'Error creando la factura' },
        { status: 500 }
      )
    }

    // Build property info for response (works for both Property and BillingUnit)
    const propertyInfo = isUnit
      ? (invoice.billingUnit || { id: propertyId, name: propertyName, city: propertyCity })
      : invoice.property

    return NextResponse.json({
      invoice: {
        id: invoice.id,
        number: invoice.number,
        fullNumber: invoice.fullNumber,
        propertyId: isUnit ? (invoice.billingUnitId || propertyId) : (invoice.propertyId || propertyId),
        periodYear: invoice.periodYear,
        periodMonth: invoice.periodMonth,
        issueDate: invoice.issueDate.toISOString(),
        dueDate: invoice.dueDate?.toISOString(),
        issuedAt: invoice.issuedAt?.toISOString(),
        subtotal: Number(invoice.subtotal),
        totalVat: Number(invoice.totalVat),
        retentionRate: Number(invoice.retentionRate),
        retentionAmount: Number(invoice.retentionAmount),
        total: Number(invoice.total),
        status: invoice.status,
        isLocked: invoice.isLocked,
        notes: invoice.notes,
        owner: invoice.owner,
        property: propertyInfo,
        series: invoice.series,
        items: invoice.items.map(i => ({
          id: i.id,
          concept: i.concept,
          description: i.description,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          vatRate: Number(i.vatRate),
          retentionRate: Number(i.retentionRate),
          total: Number(i.total),
          reservationId: i.reservationId
        }))
      },
      managerConfig: invoiceConfig ? {
        businessName: invoiceConfig.businessName,
        nif: invoiceConfig.nif,
        address: invoiceConfig.address,
        city: invoiceConfig.city,
        postalCode: invoiceConfig.postalCode,
        country: invoiceConfig.country,
        email: invoiceConfig.email,
        phone: invoiceConfig.phone,
        logoUrl: invoiceConfig.logoUrl,
        // Payment methods
        paymentMethods: invoiceConfig.paymentMethods,
        defaultPaymentMethod: invoiceConfig.defaultPaymentMethod,
        iban: invoiceConfig.iban,
        bankName: invoiceConfig.bankName,
        bic: invoiceConfig.bic,
        bizumPhone: invoiceConfig.bizumPhone,
        paypalEmail: invoiceConfig.paypalEmail
      } : null,
      isNew: !invoice.number, // If no number, it's a newly created draft
      // Invoice configuration options
      billingSettings: {
        detailLevel: billingConfig?.invoiceDetailLevel || 'DETAILED',
        singleConceptText: billingConfig?.singleConceptText || 'Gestión apartamento turístico'
      },
      isUnit // Pass this so frontend knows it's a BillingUnit
    })
  } catch (error: any) {
    console.error('Error getting/creating property-month invoice:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

function getMonthName(month: number): string {
  const months = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return months[month] || ''
}
