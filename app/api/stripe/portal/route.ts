import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe Billing Portal session so users can manage
 * their payment methods, view invoices, and cancel subscriptions.
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe no está configurado' },
        { status: 503 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      telemetry: false,
      httpClient: Stripe.createFetchHttpClient()
    })

    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Find or create Stripe customer
    let customerId: string

    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id
    } else {
      const newCustomer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          itineramio_user_id: user.id
        }
      })
      customerId = newCustomer.id
    }

    // Create billing portal session
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://www.itineramio.com'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/account/billing`,
    })

    return NextResponse.json({ success: true, url: portalSession.url })

  } catch (error) {
    console.error('Error creating billing portal session:', error)
    return NextResponse.json(
      { error: 'Error al crear la sesión del portal de facturación' },
      { status: 500 }
    )
  }
}
