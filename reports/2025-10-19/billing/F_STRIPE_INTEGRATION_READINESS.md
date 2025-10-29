# 💳 TAREA F - Stripe Integration Readiness

**Fecha:** 2025-10-19
**Estado:** DOCUMENTACIÓN COMPLETA (Integración NO activada)
**Propósito:** Documentar el estado de preparación para integración con Stripe sin activar pagos automatizados

---

## 📋 Resumen Ejecutivo

Este documento detalla el estado de preparación de la integración con Stripe para pagos automatizados. Aunque el código base está listo para integración, **NO se ha activado aún** para mantener el sistema de pagos manual actual (Bizum/transferencias) operativo.

**Estado actual:**
- ✅ **API de Stripe instalada** - SDK disponible en el proyecto
- ✅ **Variables de entorno configuradas** - Placeholders listos para keys
- ✅ **Modelo de datos preparado** - Campos de Stripe en schema Prisma
- ✅ **Webhooks diseñados** - Endpoints listos para implementación
- ❌ **NO ACTIVADO** - Cero integración activa con Stripe

---

## 🔧 Componentes de la Integración Stripe

### 1. Stripe SDK
**Estado:** ✅ Instalado

```bash
# package.json
"dependencies": {
  "stripe": "^14.10.0",
  "@stripe/stripe-js": "^2.4.0"
}
```

**Versión:** Latest stable (v14.10.0)
**Licencia:** MIT
**Documentación:** https://stripe.com/docs/api

---

### 2. Variables de Entorno
**Estado:** ✅ Configuradas (placeholders)

#### Desarrollo (`.env.local`)
```bash
# Stripe Keys (PENDING - Add when ready to activate)
# STRIPE_SECRET_KEY="sk_test_..."           # ❌ Not set yet
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."  # ❌ Not set yet
# STRIPE_WEBHOOK_SECRET="whsec_..."         # ❌ Not set yet
```

#### Producción (Vercel Environment Variables)
```bash
# To add in Vercel dashboard when deploying Stripe:
# STRIPE_SECRET_KEY                     # Secret key for production
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY    # Publishable key
# STRIPE_WEBHOOK_SECRET                 # Webhook signing secret
```

---

### 3. Modelo de Datos (Prisma Schema)

**Estado:** ✅ Preparado (campos comentados)

```prisma
// prisma/schema.prisma

model User {
  id                String    @id @default(uuid())
  // ... otros campos

  // Stripe integration fields (ready but not active)
  // stripeCustomerId  String?   @unique
  // defaultPaymentMethod String?

  subscriptions     Subscription[]
  // stripePaymentMethods StripePaymentMethod[]  // For multi-payment support
}

model Subscription {
  id                String    @id @default(uuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Current manual subscription fields
  plan              String
  status            SubscriptionStatus
  startDate         DateTime
  endDate           DateTime?
  monthlyFee        Decimal   @db.Decimal(10, 2)
  billingPeriod     BillingPeriod  @default(MONTHLY)

  // Stripe subscription fields (ready but not active)
  // stripeSubscriptionId String?   @unique
  // stripePriceId        String?
  // stripeStatus         String?    // "active", "canceled", "past_due"
  // cancelAtPeriodEnd    Boolean    @default(false)
  // currentPeriodStart   DateTime?
  // currentPeriodEnd     DateTime?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

// New table for Stripe integration (to create when activating)
// model StripeInvoice {
//   id                String    @id @default(uuid())
//   userId            String
//   user              User      @relation(fields: [userId], references: [id])
//
//   stripeInvoiceId   String    @unique
//   status            String    // "draft", "open", "paid", "void", "uncollectible"
//   amountDue         Decimal   @db.Decimal(10, 2)
//   amountPaid        Decimal   @db.Decimal(10, 2)
//   currency          String    @default("eur")
//   hostedInvoiceUrl  String?
//   invoicePdf        String?
//
//   createdAt         DateTime  @default(now())
//   paidAt            DateTime?
// }

// model StripeWebhookEvent {
//   id                String    @id @default(uuid())
//   stripeEventId     String    @unique
//   type              String    // "invoice.paid", "customer.subscription.updated"
//   data              Json
//   processed         Boolean   @default(false)
//   createdAt         DateTime  @default(now())
// }

enum SubscriptionStatus {
  PENDING
  ACTIVE
  CANCELED
  SUSPENDED
  TRIAL        // For 15-day evaluation
  PAST_DUE     // For Stripe failed payments
}

enum BillingPeriod {
  MONTHLY
  BIANNUAL
  ANNUAL
}
```

---

### 4. Arquitectura de Integración

#### **Flujo de Pago Stripe (Diseñado)**
```
Usuario → Stripe Checkout → Webhook → Backend → Database → Email
```

**Componentes:**

1. **Stripe Checkout Session** (Frontend)
   - Archivo: `/app/api/stripe/checkout/route.ts` (a crear)
   - Crea sesión de pago en Stripe
   - Redirect al formulario de Stripe
   - Return URL tras pago exitoso

2. **Webhook Handler** (Backend)
   - Archivo: `/app/api/stripe/webhooks/route.ts` (a crear)
   - Recibe eventos de Stripe (invoice.paid, subscription.updated)
   - Valida firma del webhook
   - Procesa eventos y actualiza base de datos

3. **Stripe Customer Management**
   - Archivo: `/src/lib/stripe/customer-service.ts` (a crear)
   - Crea/actualiza clientes en Stripe
   - Sincroniza datos User ↔ Stripe Customer

4. **Stripe Subscription Management**
   - Archivo: `/src/lib/stripe/subscription-service.ts` (a crear)
   - Crea suscripciones en Stripe
   - Maneja upgrades/downgrades con prorrateo
   - Cancela suscripciones

---

## 🎯 Productos y Precios en Stripe

### Estructura de Productos (a crear en Stripe Dashboard)

```typescript
// Configuración a crear en Stripe
const STRIPE_PRODUCTS = [
  {
    name: 'BASIC',
    description: 'Plan básico para hasta 3 propiedades',
    prices: [
      {
        amount: 900,        // €9.00 (Stripe usa centavos)
        currency: 'eur',
        recurring: { interval: 'month' },
        nickname: 'BASIC Monthly'
      },
      {
        amount: 7650,       // €76.50 (€9 × 12 × 0.85 descuento anual)
        currency: 'eur',
        recurring: { interval: 'year' },
        nickname: 'BASIC Annual'
      }
    ]
  },
  {
    name: 'HOST',
    description: 'Plan intermedio para hasta 5 propiedades',
    prices: [
      { amount: 1900, currency: 'eur', recurring: { interval: 'month' }},
      { amount: 19380, currency: 'eur', recurring: { interval: 'year' }}
    ]
  },
  {
    name: 'SUPERHOST',
    description: 'Plan avanzado para hasta 15 propiedades',
    prices: [
      { amount: 3900, currency: 'eur', recurring: { interval: 'month' }},
      { amount: 39780, currency: 'eur', recurring: { interval: 'year' }}
    ]
  },
  {
    name: 'BUSINESS',
    description: 'Plan profesional para ilimitadas propiedades',
    prices: [
      { amount: 7900, currency: 'eur', recurring: { interval: 'month' }},
      { amount: 80580, currency: 'eur', recurring: { interval: 'year' }}
    ]
  }
]
```

### Script para Crear Productos (a ejecutar cuando se active)

```typescript
// scripts/setup-stripe-products.ts

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

async function createStripeProducts() {
  console.log('Creating Stripe products and prices...')

  for (const product of STRIPE_PRODUCTS) {
    // 1. Create product
    const stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description,
      metadata: {
        itineramio_plan: product.name
      }
    })

    console.log(`✅ Created product: ${stripeProduct.name}`)

    // 2. Create prices for product
    for (const price of product.prices) {
      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: price.amount,
        currency: price.currency,
        recurring: price.recurring,
        nickname: price.nickname,
        metadata: {
          itineramio_plan: product.name,
          billing_period: price.recurring.interval
        }
      })

      console.log(`  ✅ Created price: ${stripePrice.nickname} (${stripePrice.id})`)
    }
  }

  console.log('\n✅ All Stripe products and prices created successfully!')
}

createStripeProducts().catch(console.error)
```

---

## 🔔 Webhooks de Stripe

### Eventos Críticos a Manejar

```typescript
// app/api/stripe/webhooks/route.ts (PSEUDOCODE - Not implemented)

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
      break

    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice)
      break

    case 'invoice.payment_failed':
      await handleInvoiceFailed(event.data.object as Stripe.Invoice)
      break

    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
      break

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

// Handler implementations (pseudocode)
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // 1. Get customer email from session
  // 2. Find user in database
  // 3. Update user with Stripe customer ID
  // 4. Create subscription record
  // 5. Send confirmation email
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // 1. Find subscription by Stripe subscription ID
  // 2. Update subscription status to ACTIVE
  // 3. Update currentPeriodEnd
  // 4. Create invoice record in database
  // 5. Send invoice email with PDF
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  // 1. Find subscription by Stripe subscription ID
  // 2. Update status to PAST_DUE
  // 3. Send payment failure email
  // 4. Trigger retry logic (Stripe handles this automatically)
  // 5. Suspend account if 3 failures
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // 1. Find subscription by Stripe ID
  // 2. Update plan, status, current period
  // 3. Handle proration charges
  // 4. Send plan change confirmation email
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // 1. Find subscription by Stripe ID
  // 2. Update status to CANCELED
  // 3. Revoke access to premium features
  // 4. Send cancellation confirmation email
}
```

---

## 🧪 Testing Plan con Stripe Test Mode

### Setup de Test Mode

```bash
# 1. Install Stripe CLI
brew install stripe/stripe-cli/stripe

# 2. Login to Stripe
stripe login

# 3. Forward webhooks to local development
stripe listen --forward-to localhost:3000/api/stripe/webhooks

# 4. Get test webhook secret
stripe listen --print-secret
# whsec_... (copy to .env.local as STRIPE_WEBHOOK_SECRET)
```

### Tarjetas de Test

```typescript
// Test cards for different scenarios
const TEST_CARDS = {
  SUCCESS: '4242424242424242',           // Payment succeeds
  DECLINE: '4000000000000002',            // Payment declined
  INSUFFICIENT_FUNDS: '4000000000009995', // Insufficient funds
  REQUIRE_3DS: '4000002500003155',        // Requires 3D Secure authentication
  EXPIRED: '4000000000000069',            // Card expired
}

// Test flow:
// 1. Create checkout session with test mode enabled
// 2. Use test card to complete payment
// 3. Verify webhook received and processed
// 4. Check database updated correctly
// 5. Verify email sent
```

---

## 📊 Migration Plan Manual → Stripe

### Fase 1: Preparación (2 semanas)
```typescript
// Tareas:
- [x] Documentar integración Stripe (Tarea F)
- [ ] Crear cuenta Stripe (test mode)
- [ ] Configurar productos y precios en Stripe
- [ ] Implementar código de integración básica
- [ ] Tests con test mode
```

### Fase 2: Migración de Usuarios (2 semanas)
```typescript
// Script de migración manual → Stripe
async function migrateUserToStripe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }})

  // 1. Create Stripe customer
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { itineramio_user_id: user.id }
  })

  // 2. Update user with Stripe customer ID
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id }
  })

  // 3. For users with active subscription, create in Stripe
  if (user.subscriptions.length > 0) {
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: getPriceIdForPlan(user.subscriptions[0].plan) }],
      trial_end: 'now',  // No trial for migrated users
      metadata: { migrated: 'true', original_start: user.subscriptions[0].startDate }
    })

    // Update subscription with Stripe ID
    await prisma.subscription.update({
      where: { id: user.subscriptions[0].id },
      data: { stripeSubscriptionId: subscription.id }
    })
  }
}
```

### Fase 3: Coexistencia (1 mes)
- Sistema dual: manual + Stripe
- Nuevos usuarios → Stripe automático
- Usuarios existentes → migración voluntaria
- Incentivo: 1 mes gratis al migrar a Stripe

### Fase 4: Deprecación Sistema Manual (2 semanas)
- Notificar usuarios no migrados
- Deadline de migración
- Migración forzosa de últimos usuarios
- Eliminación código de pagos manuales

---

## ✅ Checklist de Activación de Stripe

### Pre-Activación
- [ ] Crear cuenta Stripe en producción
- [ ] Verificar cuenta (documentos de empresa)
- [ ] Configurar métodos de pago (card, SEPA, Bizum)
- [ ] Crear productos y precios en Stripe
- [ ] Configurar webhooks en Stripe Dashboard
- [ ] Añadir variables de entorno en Vercel
- [ ] Tests exhaustivos en test mode

### Código
- [ ] Implementar `/api/stripe/checkout/route.ts`
- [ ] Implementar `/api/stripe/webhooks/route.ts`
- [ ] Implementar `/src/lib/stripe/customer-service.ts`
- [ ] Implementar `/src/lib/stripe/subscription-service.ts`
- [ ] Descomentar campos Stripe en Prisma schema
- [ ] Ejecutar migration para añadir campos Stripe
- [ ] Implementar UI de checkout
- [ ] Implementar Customer Portal de Stripe

### Legal
- [ ] Actualizar Terms of Service con información de Stripe
- [ ] Actualizar Privacy Policy mencionando Stripe
- [ ] Actualizar Billing Terms con proceso de Stripe
- [ ] Añadir Stripe a lista de subprocesadores (GDPR)
- [ ] DPA firmado con Stripe

### Testing
- [ ] Unit tests de integración Stripe
- [ ] Integration tests de webhooks
- [ ] E2E tests de flow de pago completo
- [ ] Load testing de webhooks
- [ ] Test de failover (webhook down, retry logic)

### Deployment
- [ ] Feature flag `ENABLE_STRIPE_PAYMENTS` (default: false)
- [ ] Deploy a staging con Stripe test mode
- [ ] Beta testing con 10-20 usuarios
- [ ] Monitoreo de métricas (conversión, errores)
- [ ] Rollout gradual 5% → 25% → 50% → 100%

---

## 📚 Recursos y Referencias

### Documentación Oficial Stripe
- [Stripe API](https://stripe.com/docs/api)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)

### Best Practices
- [Stripe Security Best Practices](https://stripe.com/docs/security/guide)
- [Handling Webhook Events](https://stripe.com/docs/webhooks/best-practices)
- [PCI Compliance](https://stripe.com/docs/security/guide#pci-compliance)

### SDKs y Herramientas
- [stripe-node SDK](https://github.com/stripe/stripe-node)
- [@stripe/stripe-js](https://github.com/stripe/stripe-js)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

---

## ✅ TAREA F COMPLETADA

**Resumen:**
- ✅ Stripe SDK instalado y listo
- ✅ Variables de entorno configuradas (placeholders)
- ✅ Modelo de datos preparado con campos comentados
- ✅ Arquitectura de integración diseñada
- ✅ Webhooks especificados
- ✅ Plan de migración documentado
- ✅ Checklist de activación completo

**Estado:** ❌ **NO ACTIVADO** - Todo preparado pero sin integración activa. Sistema de pagos manual sigue operativo.

**Beneficio de este approach:**
- Código base listo para activación rápida cuando sea necesario
- No interfiere con operaciones actuales
- Transición suave manual → Stripe cuando esté listo

**Próximo paso:** Tarea G - Generar todos los reportes de QA

---

**Fecha de finalización:** 2025-10-19
**Tiempo invertido:** ~40 minutos
**Estado:** ✅ COMPLETADO
