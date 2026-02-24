import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// Default payment methods configuration
const DEFAULT_PAYMENT_METHODS = [
  { type: 'TRANSFER', enabled: true, label: 'Transferencia bancaria' },
  { type: 'BIZUM', enabled: false, label: 'Bizum' },
  { type: 'PAYPAL', enabled: false, label: 'PayPal' },
  { type: 'CASH', enabled: false, label: 'Efectivo' },
  { type: 'CARD', enabled: false, label: 'Tarjeta' },
  { type: 'DIRECT_DEBIT', enabled: false, label: 'Domiciliación SEPA' }
]

/**
 * GET /api/manager-profile
 * Get the manager's invoice configuration
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const config = await prisma.userInvoiceConfig.findUnique({
      where: { userId }
    })

    if (!config) {
      return NextResponse.json({ config: null })
    }

    // Parse payment methods or use defaults
    let paymentMethods = DEFAULT_PAYMENT_METHODS
    if (config.paymentMethods) {
      try {
        paymentMethods = config.paymentMethods as any[]
      } catch (e) {
        // Keep defaults
      }
    }

    return NextResponse.json({
      config: {
        id: config.id,
        businessName: config.businessName,
        nif: config.nif,
        address: config.address,
        city: config.city,
        postalCode: config.postalCode,
        country: config.country,
        email: config.email,
        phone: config.phone,
        logoUrl: config.logoUrl,
        footerNotes: config.footerNotes,
        // Payment methods
        paymentMethods,
        defaultPaymentMethod: config.defaultPaymentMethod || 'TRANSFER',
        // Bank details
        bankName: config.bankName,
        iban: config.iban,
        bic: config.bic,
        // Other payment details
        bizumPhone: config.bizumPhone,
        paypalEmail: config.paypalEmail,
        // VeriFactu
        verifactuEnabled: config.verifactuEnabled,
        siiExempt: config.siiExempt,
        verifactuApiKey: config.verifactuApiKey ? '••••' + config.verifactuApiKey.slice(-4) : null,
        verifactuApiKeyConfigured: !!config.verifactuApiKey,
      }
    })
  } catch (error) {
    console.error('Error fetching manager profile:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/manager-profile
 * Create or update the manager's invoice configuration
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const {
      businessName,
      nif,
      address,
      city,
      postalCode,
      country = 'España',
      email,
      phone,
      footerNotes,
      // Payment methods
      paymentMethods,
      defaultPaymentMethod,
      // Bank details
      bankName,
      iban,
      bic,
      // Other payment details
      bizumPhone,
      paypalEmail,
      // VeriFactu
      verifactuEnabled,
      siiExempt,
      verifactuApiKey
    } = body

    if (!businessName || !nif || !address || !city || !postalCode) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    // Validate IBAN format if provided
    if (iban && !/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/.test(iban.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Formato de IBAN inválido' },
        { status: 400 }
      )
    }

    const config = await prisma.userInvoiceConfig.upsert({
      where: { userId },
      create: {
        userId,
        businessName,
        nif,
        address,
        city,
        postalCode,
        country,
        email,
        phone,
        footerNotes,
        paymentMethods: paymentMethods || DEFAULT_PAYMENT_METHODS,
        defaultPaymentMethod: defaultPaymentMethod || 'TRANSFER',
        bankName,
        iban: iban?.replace(/\s/g, ''),
        bic,
        bizumPhone,
        paypalEmail,
        verifactuEnabled: verifactuEnabled ?? false,
        siiExempt: siiExempt ?? false,
        ...(verifactuApiKey !== undefined && { verifactuApiKey }),
      },
      update: {
        businessName,
        nif,
        address,
        city,
        postalCode,
        country,
        email,
        phone,
        footerNotes,
        ...(paymentMethods !== undefined && { paymentMethods }),
        ...(defaultPaymentMethod !== undefined && { defaultPaymentMethod }),
        ...(bankName !== undefined && { bankName }),
        ...(iban !== undefined && { iban: iban?.replace(/\s/g, '') }),
        ...(bic !== undefined && { bic }),
        ...(bizumPhone !== undefined && { bizumPhone }),
        ...(paypalEmail !== undefined && { paypalEmail }),
        ...(verifactuEnabled !== undefined && { verifactuEnabled }),
        ...(siiExempt !== undefined && { siiExempt }),
        ...(verifactuApiKey !== undefined && { verifactuApiKey })
      }
    })

    // Parse payment methods for response
    let responsePaymentMethods = DEFAULT_PAYMENT_METHODS
    if (config.paymentMethods) {
      try {
        responsePaymentMethods = config.paymentMethods as any[]
      } catch (e) {
        // Keep defaults
      }
    }

    return NextResponse.json({
      config: {
        id: config.id,
        businessName: config.businessName,
        nif: config.nif,
        address: config.address,
        city: config.city,
        postalCode: config.postalCode,
        country: config.country,
        email: config.email,
        phone: config.phone,
        logoUrl: config.logoUrl,
        footerNotes: config.footerNotes,
        paymentMethods: responsePaymentMethods,
        defaultPaymentMethod: config.defaultPaymentMethod || 'TRANSFER',
        bankName: config.bankName,
        iban: config.iban,
        bic: config.bic,
        bizumPhone: config.bizumPhone,
        paypalEmail: config.paypalEmail,
        verifactuEnabled: config.verifactuEnabled,
        siiExempt: config.siiExempt,
        verifactuApiKey: config.verifactuApiKey ? '••••' + config.verifactuApiKey.slice(-4) : null,
        verifactuApiKeyConfigured: !!config.verifactuApiKey,
      }
    })
  } catch (error) {
    console.error('Error updating manager profile:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
