import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
// Auto-creates config and series if needed - no external dependency
// NOTE: Invoice numbers are NOT assigned to drafts - only when ISSUED (like Holded)

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

    const entityType = searchParams.get('type') // 'unit', 'group', or null (legacy property)
    const isUnit = entityType === 'unit'
    const isGroup = entityType === 'group'
    let ownerId: string | null = null
    let propertyName = ''
    let propertyCity = ''
    let billingConfig: any = null
    let billingUnitId: string | null = null
    let billingUnitGroupId: string | null = null
    let groupUnitIds: string[] = []

    if (isGroup) {
      // Handle BillingUnitGroup
      const group = await prisma.billingUnitGroup.findFirst({
        where: { id: propertyId, userId },
        include: {
          owner: true,
          billingUnits: {
            select: { id: true, name: true, city: true }
          }
        }
      })

      if (!group) {
        return NextResponse.json(
          { error: 'Conjunto no encontrado' },
          { status: 404 }
        )
      }

      if (!group.ownerId) {
        return NextResponse.json(
          { error: 'Este conjunto no tiene un propietario asignado. Configúralo primero.' },
          { status: 400 }
        )
      }

      ownerId = group.ownerId
      propertyName = group.name
      propertyCity = group.billingUnits[0]?.city || '' // Get city from first unit
      billingUnitGroupId = group.id
      groupUnitIds = group.billingUnits.map(u => u.id)
      billingConfig = {
        id: group.id,
        commissionValue: group.commissionValue,
        commissionVat: Number(group.commissionVat) || 21,
        cleaningValue: group.cleaningValue,
        cleaningVatIncluded: group.cleaningVatIncluded ?? true,
        invoiceDetailLevel: group.invoiceDetailLevel || 'DETAILED',
        singleConceptText: group.singleConceptText || 'Gestión apartamento turístico',
        owner: group.owner
      }
    } else if (isUnit) {
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

    // Check if there's already an ISSUED or PAID invoice for this owner + month + year
    // This prevents duplicate invoices for the same period
    const existingIssuedInvoice = await prisma.clientInvoice.findFirst({
      where: {
        userId,
        ownerId,
        periodYear: year,
        periodMonth: month,
        status: { in: ['ISSUED', 'PAID'] },
        isRectifying: false // Don't count rectifying invoices as duplicates
      },
      select: {
        id: true,
        fullNumber: true,
        status: true,
        total: true,
        issuedAt: true
      }
    })

    if (existingIssuedInvoice) {
      return NextResponse.json(
        {
          error: `Ya existe una factura emitida para este propietario en ${getMonthName(month)} ${year}`,
          duplicateInvoice: {
            id: existingIssuedInvoice.id,
            fullNumber: existingIssuedInvoice.fullNumber,
            status: existingIssuedInvoice.status,
            total: Number(existingIssuedInvoice.total),
            issuedAt: existingIssuedInvoice.issuedAt?.toISOString()
          }
        },
        { status: 409 } // Conflict
      )
    }

    // Try to find existing draft invoice for this property/month
    let invoiceWhereClause: any = { userId, periodYear: year, periodMonth: month, status: 'DRAFT' as const }
    if (isGroup) {
      invoiceWhereClause.billingUnitGroupId = propertyId
    } else if (isUnit) {
      invoiceWhereClause.billingUnitId = propertyId
    } else {
      invoiceWhereClause.propertyId = propertyId
    }

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
        billingUnitGroup: isGroup ? {
          select: {
            id: true,
            name: true,
            billingUnits: { select: { id: true, name: true, city: true } }
          }
        } : false,
        property: !isUnit && !isGroup ? {
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

      // Query reservations based on whether it's a BillingUnit, Group, or Property
      const reservationWhere: any = {
        userId,
        checkIn: {
          gte: startDate,
          lt: endDate
        },
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      }

      if (billingUnitGroupId && groupUnitIds.length > 0) {
        // Group: get reservations for all units in the group
        reservationWhere.billingUnitId = { in: groupUnitIds }
      } else if (billingUnitId) {
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
          const shortMonths = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
          const sameMonth = checkIn.getMonth() === checkOut.getMonth()
          const dateRange = sameMonth
            ? `${checkIn.getDate()}-${checkOut.getDate()} ${shortMonths[checkIn.getMonth()]}`
            : `${checkIn.getDate()} ${shortMonths[checkIn.getMonth()]} - ${checkOut.getDate()} ${shortMonths[checkOut.getMonth()]}`

          const roundedCommission = Math.round(commission * 100) / 100
          items.push({
            concept: `${r.guestName} · ${dateRange}`,
            description: null,
            quantity: 1,
            unitPrice: roundedCommission,
            vatRate: commissionVat,
            retentionRate: retentionRate,
            total: Math.round(roundedCommission * (1 + commissionVat / 100) * 100) / 100,
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
            const cleaningRetention = Math.round(cleaningTotalBase * (cleaningRetentionRate / 100) * 100) / 100
            items.push({
              concept: 'Limpieza',
              quantity: cleaningQuantity,
              unitPrice: cleaningUnitBase,
              vatRate: 21,
              retentionRate: cleaningRetentionRate,
              total: Math.round((cleaningTotalWithVat - cleaningRetention) * 100) / 100,
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
          const roundedTotalCommission = Math.round(totalCommission * 100) / 100
          items.push({
            concept: `${conceptText} - ${getMonthName(month)} ${year}`,
            quantity: 1,
            unitPrice: roundedTotalCommission,
            vatRate: commissionVat,
            retentionRate: retentionRate,
            total: Math.round(roundedTotalCommission * (1 + commissionVat / 100) * 100) / 100,
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
          const cleaningRetention = Math.round(cleaningTotalBase * (cleaningRetentionRate / 100) * 100) / 100
          items.push({
            concept: 'Limpieza',
            quantity: cleaningQuantity,
            unitPrice: cleaningUnitBase,
            vatRate: 21,
            retentionRate: cleaningRetentionRate,
            total: Math.round((cleaningTotalWithVat - cleaningRetention) * 100) / 100,
            order: 1
          })
          totalCleaning = cleaningTotalBase
        }
      }

      // Get expenses for this property/month (chargeToOwner = true, not yet invoiced)
      const lastDayOfMonth = new Date(year, month, 0) // Last day of the month

      // Query expenses based on whether it's a BillingUnit, Group, or Property
      const expenseWhere: any = {
        date: {
          gte: startDate,
          lte: lastDayOfMonth
        },
        chargeToOwner: true
      }

      if (billingUnitGroupId && groupUnitIds.length > 0) {
        // Group: get expenses for all units in the group
        expenseWhere.billingUnitId = { in: groupUnitIds }
      } else if (billingUnitId) {
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
        const standardVat = Math.round(expenseAmount * (vatRate / 100) * 100) / 100

        items.push({
          concept: expense.concept + (expense.supplierName ? ` (${expense.supplierName})` : ''),
          description: expense.invoiceNumber ? `Factura: ${expense.invoiceNumber}` : null,
          quantity: 1,
          unitPrice: Math.round(expenseAmount * 100) / 100,
          vatRate: vatRate,
          retentionRate: 0,
          total: Math.round((expenseAmount + standardVat) * 100) / 100,
          order: items.length
        })
      })

      // Calculate totals (round each to avoid floating point accumulation)
      let subtotal = 0
      let totalVatAmount = 0
      let totalRetentionAmount = 0

      items.forEach(item => {
        subtotal += Math.round(item.unitPrice * item.quantity * 100) / 100
        totalVatAmount += Math.round(item.unitPrice * item.quantity * (item.vatRate / 100) * 100) / 100
        totalRetentionAmount += Math.round(item.unitPrice * item.quantity * (item.retentionRate / 100) * 100) / 100
      })

      subtotal = Math.round(subtotal * 100) / 100
      totalVatAmount = Math.round(totalVatAmount * 100) / 100
      totalRetentionAmount = Math.round(totalRetentionAmount * 100) / 100
      const total = Math.round((subtotal + totalVatAmount - totalRetentionAmount) * 100) / 100

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
        billingUnitGroup: isGroup ? {
          select: {
            id: true,
            name: true,
            billingUnits: { select: { id: true, name: true, city: true } }
          }
        } : false,
        property: !isUnit && !isGroup ? {
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
        // IMPORTANT: Don't assign invoice number to drafts
        // Number is only assigned when the invoice is ISSUED (like Holded does)
        // This prevents losing numbers when drafts are deleted or never issued

        // Create new invoice WITHOUT number (will be assigned on issue)
        // Use correct field based on whether it's a BillingUnit or legacy Property
        const invoiceData = {
          userId,
          ownerId,
          seriesId,
          number: null, // Assigned on issue
          fullNumber: null, // Assigned on issue
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
          ...(isGroup ? { billingUnitGroupId: propertyId } : isUnit ? { billingUnitId: propertyId } : { propertyId }),
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

    // Build property info for response (works for Property, BillingUnit, and BillingUnitGroup)
    // Cast to any to access included relations
    const invoiceWithRelations = invoice as any

    let propertyInfo: any
    if (isGroup) {
      propertyInfo = invoiceWithRelations.billingUnitGroup || { id: propertyId, name: propertyName, city: propertyCity }
    } else if (isUnit) {
      propertyInfo = invoiceWithRelations.billingUnit || { id: propertyId, name: propertyName, city: propertyCity }
    } else {
      propertyInfo = invoiceWithRelations.property || { id: propertyId, name: propertyName, city: propertyCity }
    }

    return NextResponse.json({
      invoice: {
        id: invoice.id,
        number: invoice.number,
        fullNumber: invoice.fullNumber,
        propertyId: isGroup ? (invoice.billingUnitGroupId || propertyId) : isUnit ? (invoice.billingUnitId || propertyId) : (invoice.propertyId || propertyId),
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
        owner: invoiceWithRelations.owner,
        property: propertyInfo,
        series: invoiceWithRelations.series,
        items: (invoiceWithRelations.items || []).map((i: any) => ({
          id: i.id,
          concept: i.concept,
          description: i.description,
          quantity: Number(i.quantity),
          unitPrice: Math.round(Number(i.unitPrice) * 100) / 100,
          vatRate: Number(i.vatRate),
          retentionRate: Number(i.retentionRate),
          total: Math.round(Number(i.total) * 100) / 100,
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
      isUnit, // Pass this so frontend knows it's a BillingUnit
      isGroup // Pass this so frontend knows it's a BillingUnitGroup
    })
  } catch (error: any) {
    console.error('Error getting/creating property-month invoice:', error?.message || error)
    console.error('Stack:', error?.stack)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error?.message },
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
