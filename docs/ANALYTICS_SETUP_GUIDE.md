# 📊 Sistema de Analytics Completo - Google Analytics 4

> **Sistema configurado y listo para usar** - 6 de Noviembre 2025

---

## 📋 Tabla de Contenidos

1. [¿Qué se ha configurado?](#qué-se-ha-configurado)
2. [Configuración de cuenta Google Analytics 4](#configuración-de-cuenta-google-analytics-4)
3. [Eventos custom configurados](#eventos-custom-configurados)
4. [Cómo usar el sistema de tracking](#cómo-usar-el-sistema-de-tracking)
5. [Funnels predefinidos](#funnels-predefinidos)
6. [Dashboards y reportes](#dashboards-y-reportes)
7. [Ejemplos de implementación](#ejemplos-de-implementación)
8. [Troubleshooting](#troubleshooting)

---

## ✅ ¿Qué se ha configurado?

### 1. **Google Analytics 4 Integration**
- ✅ Componente `GoogleAnalytics.tsx` creado
- ✅ Integrado en `app/layout.tsx`
- ✅ Variables de entorno configuradas
- ✅ Compatible con Vercel Analytics (ambos funcionan juntos)

### 2. **Sistema de Tracking Custom** (`src/lib/analytics.ts`)
- ✅ 14 eventos custom predefinidos
- ✅ Funciones helper para cada evento
- ✅ Tracking de funnels multi-step
- ✅ Tracking de scroll depth y time on page
- ✅ TypeScript types completos

### 3. **Eventos Configurados**

| Evento | Cuándo se trackea | Valor |
|--------|-------------------|-------|
| `test_started` | Usuario inicia test de personalidad | - |
| `test_completed` | Usuario completa test | 1 |
| `email_captured` | Capturamos email (lead) | 2 |
| `course_started` | Usuario inicia curso | 3-10 |
| `course_completed` | Usuario completa curso | 5-20 |
| `trial_started` | Usuario inicia trial | 5 |
| `property_created` | Usuario crea propiedad | 3-7 |
| `qr_generated` | Usuario genera QR code | 1 |
| `manual_viewed` | Huésped ve manual | 0.5 |
| `zone_viewed` | Huésped ve zona específica | 0.3 |
| `lead_magnet_downloaded` | Descarga de recurso blog | 2 |
| `newsletter_subscribed` | Suscripción a newsletter | 2 |
| `blog_article_read` | Lectura completa de artículo | 0.5-1 |
| `purchase_completed` | Compra realizada | Valor real |

---

## 🔧 Configuración de Cuenta Google Analytics 4

### Paso 1: Crear propiedad GA4

1. Ve a https://analytics.google.com/
2. Click en "Administrar" (⚙️ abajo izquierda)
3. En la columna "Cuenta", click "+ Crear cuenta"
4. Nombre de cuenta: **Itineramio**
5. Click "Siguiente"
6. Nombre de propiedad: **Itineramio Web**
7. Zona horaria: **España (GMT+1)**
8. Moneda: **EUR - Euro**
9. Click "Siguiente"
10. Detalles del negocio:
    - Sector: **Software y tecnología**
    - Tamaño: **Pequeña (1-10 empleados)**
11. Click "Crear"
12. Acepta los términos

### Paso 2: Obtener Measurement ID

1. En "Administrar" > "Flujos de datos"
2. Click "Añadir flujo"
3. Selecciona "Web"
4. URL del sitio web: `https://itineramio.com`
5. Nombre del flujo: "Itineramio Website"
6. Click "Crear flujo"
7. **Copia tu MEASUREMENT ID** (formato: `G-XXXXXXXXXX`)

### Paso 3: Añadir a tu proyecto

Actualiza `.env.local`:

```bash
NEXT_PUBLIC_GA_ID="G-TU_MEASUREMENT_ID_AQUI"
```

Ejemplo:
```bash
NEXT_PUBLIC_GA_ID="G-1234567890"
```

### Paso 4: Verificar que funciona

1. Abre tu web en modo desarrollo: `npm run dev`
2. Abre DevTools > Console
3. Deberías ver: `📊 Analytics Event: ...` (en desarrollo)
4. En producción, ve a **GA4 > Informes > Tiempo real**
5. Navega por tu web y verás tus visitas en tiempo real

---

## 📈 Eventos Custom Configurados

### Eventos del Customer Journey

#### 1. **test_started**
**Cuándo:** Usuario hace click en "Comenzar test"

**Código:**
```typescript
import { trackTestStarted } from '@/lib/analytics'

// En tu componente del test
function handleStartTest() {
  trackTestStarted({ source: 'homepage' })
  // ... resto del código
}
```

---

#### 2. **test_completed**
**Cuándo:** Usuario completa las 45 preguntas del test

**Código:**
```typescript
import { trackTestCompleted } from '@/lib/analytics'

async function handleTestSubmit(data: TestData) {
  // Calcular resultado
  const result = calculateArchetype(data.answers)

  // Trackear evento
  trackTestCompleted({
    archetype: result.archetype,
    email: data.email,
    source: 'organic'
  })

  // Guardar en BD
  await saveTestResult(result)
}
```

**Parámetros:**
- `archetype`: String - ESTRATEGA, SISTEMATICO, etc.
- `email`: Boolean (has_email) - Si capturamos email
- `source`: String - organic, facebook, google, etc.
- `value`: 1

---

#### 3. **email_captured**
**Cuándo:** Capturamos email de un lead (test, QR, blog, etc.)

**Código:**
```typescript
import { trackEmailCaptured } from '@/lib/analytics'

await fetch('/api/email/subscribe', {
  method: 'POST',
  body: JSON.stringify({ email, name, source: 'test' })
})

// Trackear
trackEmailCaptured({
  source: 'test',
  archetype: 'ESTRATEGA',
  leadMagnet: 'test-personalidad'
})
```

**Parámetros:**
- `source`: test | qr | blog | landing | manual
- `archetype`: String (opcional)
- `leadMagnet`: String (opcional)
- `value`: 2

---

#### 4. **trial_started**
**Cuándo:** Usuario se registra e inicia trial de 15 días

**Código:**
```typescript
import { trackTrialStarted } from '@/lib/analytics'

async function handleRegister(userData) {
  // Crear usuario
  const user = await createUser(userData)

  // Trackear
  trackTrialStarted({
    plan: 'BASIC',
    trialDays: 15
  })

  // Redirigir
  router.push('/onboarding')
}
```

---

#### 5. **property_created**
**Cuándo:** Usuario crea su primera (o siguiente) propiedad

**Código:**
```typescript
import { trackPropertyCreated } from '@/lib/analytics'

async function handleCreateProperty(data) {
  const property = await prisma.property.create({ data })

  const userProperties = await prisma.property.count({
    where: { userId: user.id }
  })

  trackPropertyCreated({
    propertyId: property.id,
    isFirstProperty: userProperties === 1,
    source: 'dashboard'
  })
}
```

---

#### 6. **qr_generated**
**Cuándo:** Usuario genera código QR (propiedad o zona)

**Código:**
```typescript
import { trackQRGenerated } from '@/lib/analytics'

function handleGenerateQR(propertyId, zoneId) {
  // Generar QR
  const qrCode = generateQRCode(url)

  // Trackear
  trackQRGenerated({
    propertyId,
    zoneId,
    qrType: zoneId ? 'zone' : 'property'
  })

  return qrCode
}
```

---

#### 7. **purchase_completed** 🎯 CRÍTICO
**Cuándo:** Usuario completa una compra (trial → paid)

**Código:**
```typescript
import { trackPurchaseCompleted } from '@/lib/analytics'

async function handleStripeWebhook(event) {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    // Trackear compra
    trackPurchaseCompleted({
      transactionId: session.id,
      value: session.amount_total / 100, // Convertir de centavos
      currency: 'EUR',
      items: [{
        item_id: session.metadata.plan_id,
        item_name: session.metadata.plan_name,
        item_category: 'subscription',
        price: session.amount_total / 100,
        quantity: 1
      }],
      coupon: session.metadata.coupon || undefined
    })
  }
}
```

**Este evento es CRÍTICO para:**
- Calcular ROI de campañas
- Optimizar bidding en Google Ads
- Medir conversión trial → paid

---

### Eventos de Engagement

#### 8. **manual_viewed**
**Cuándo:** Un huésped abre el manual digital

**Código:**
```typescript
import { trackManualViewed } from '@/lib/analytics'

// En la página pública del manual
useEffect(() => {
  trackManualViewed({
    propertyId: params.propertyId,
    guestId: generateGuestId(), // Cookie o fingerprint
    source: searchParams.get('utm_source') || 'qr'
  })
}, [])
```

---

#### 9. **zone_viewed**
**Cuándo:** Un huésped ve una zona específica del manual

**Código:**
```typescript
import { trackZoneViewed } from '@/lib/analytics'

function ZonePage({ zone }) {
  useEffect(() => {
    trackZoneViewed({
      propertyId: zone.propertyId,
      zoneId: zone.id,
      zoneName: zone.title,
      guestId: getGuestId()
    })
  }, [zone])

  return <div>...</div>
}
```

---

### Eventos de Marketing

#### 10. **lead_magnet_downloaded**
**Cuándo:** Usuario descarga recurso del blog (PDF, template, etc.)

**Código:**
```typescript
import { trackLeadMagnetDownloaded } from '@/lib/analytics'

async function handleDownload(resourceName) {
  // Enviar email con link de descarga
  await sendLeadMagnetEmail(email, resourceName)

  // Trackear
  trackLeadMagnetDownloaded({
    resourceName: 'Guía VUT Madrid 2025',
    resourceType: 'pdf',
    articleSlug: 'vut-madrid-requisitos'
  })
}
```

---

#### 11. **blog_article_read**
**Cuándo:** Usuario lee >80% de un artículo de blog

**Código:**
```typescript
import { trackBlogArticleRead, setupScrollDepthTracking } from '@/lib/analytics'

function BlogArticle({ article }) {
  const [scrollDepth, setScrollDepth] = useState(0)
  const [readTime, setReadTime] = useState(0)

  useEffect(() => {
    const startTime = Date.now()

    // Setup scroll tracking
    const cleanup = setupScrollDepthTracking()

    return () => {
      cleanup?.()

      const timeSpent = Math.round((Date.now() - startTime) / 1000)

      // Si leyó >80%, trackear
      if (scrollDepth > 80) {
        trackBlogArticleRead({
          articleSlug: article.slug,
          articleTitle: article.title,
          category: article.category,
          readTime: timeSpent,
          scrollDepth
        })
      }
    }
  }, [])

  return <article>...</article>
}
```

---

## 🎯 Funnels Predefinidos

### Funnel 1: Test → Trial

**Objetivo:** Medir conversión desde test de personalidad hasta trial iniciado

**Steps:**
1. `test_started` → Usuario inicia test
2. `test_completed` → Completa test
3. `email_captured` → Capturamos email
4. `trial_started` → Se registra
5. `property_created` → Crea primera propiedad

**Configurar en GA4:**
1. Ir a **Exploración** > **Crear nuevo análisis de embudo**
2. Nombre: "Test → Trial Funnel"
3. Añadir steps:
   - Step 1: `test_started`
   - Step 2: `test_completed`
   - Step 3: `email_captured`
   - Step 4: `trial_started`
   - Step 5: `property_created`
4. Guardar

**Métricas objetivo:**
- test_started → test_completed: >80%
- test_completed → email_captured: >70%
- email_captured → trial_started: >30%
- trial_started → property_created: >60%

---

### Funnel 2: Trial → Paid

**Objetivo:** Conversión de trials a clientes de pago

**Steps:**
1. `trial_started`
2. `property_created`
3. `qr_generated`
4. `manual_viewed` (huésped usó el manual)
5. `purchase_completed`

**Métrica crítica:** trial_started → purchase_completed: **>25%**

---

### Funnel 3: Blog → Lead

**Objetivo:** Captura de leads desde blog

**Steps:**
1. `blog_article_read`
2. `lead_magnet_downloaded`
3. `email_captured`
4. `trial_started`

**Métrica crítica:** blog_article_read → email_captured: **>5%**

---

## 📊 Dashboards y Reportes

### Dashboard Semanal (Looker Studio)

Crear dashboard con estos widgets:

1. **Acquisition (Adquisición)**
   - Total de visitas
   - Visitas por canal (Organic, Direct, Social, Paid)
   - Tasa de rebote por landing page
   - Conversión landing → trial

2. **Activation (Activación)**
   - Trials iniciados
   - Propiedades creadas
   - QR codes generados
   - Time to first value (trial → property_created)

3. **Retention (Retención)**
   - Trial → Paid conversion rate
   - MRR (calcular desde eventos purchase_completed)
   - Churn rate

4. **Revenue (Ingresos)**
   - Ingresos totales (sum de purchase_completed values)
   - Ingresos por canal
   - LTV por cohorte

5. **Referral (Referencias)**
   - NPS (si tienes encuesta)
   - Viral coefficient

**Conectar Looker Studio:**
1. Ir a https://lookerstudio.google.com/
2. Crear nuevo informe
3. Conectar fuente de datos: Google Analytics 4
4. Seleccionar tu propiedad de Itineramio
5. Diseñar dashboard con métricas arriba

---

## 💻 Ejemplos de Implementación

### Ejemplo 1: Tracking en formulario de registro

```typescript
'use client'

import { useState } from 'react'
import { trackTrialStarted, trackEmailCaptured } from '@/lib/analytics'

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: ''
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // 1. Crear usuario
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData)
    })

    const { user } = await response.json()

    // 2. Trackear email capturado
    trackEmailCaptured({
      source: 'landing',
      leadMagnet: 'trial-signup'
    })

    // 3. Trackear trial iniciado
    trackTrialStarted({
      plan: 'BASIC',
      trialDays: 15
    })

    // 4. Redirigir
    window.location.href = '/onboarding'
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Tu formulario */}
    </form>
  )
}
```

---

### Ejemplo 2: Tracking en página de artículo de blog

```typescript
'use client'

import { useEffect, useState } from 'react'
import { trackBlogArticleRead, setupScrollDepthTracking } from '@/lib/analytics'

export default function BlogArticlePage({ article }) {
  const [tracked, setTracked] = useState(false)

  useEffect(() => {
    const startTime = Date.now()
    let maxScroll = 0

    // Setup scroll tracking
    const cleanup = setupScrollDepthTracking()

    // Track scroll manually también
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = (winScroll / height) * 100
      maxScroll = Math.max(maxScroll, scrolled)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      cleanup?.()

      // Si scroll >80% y tiempo >30seg, considerar leído
      const timeSpent = (Date.now() - startTime) / 1000

      if (maxScroll > 80 && timeSpent > 30 && !tracked) {
        trackBlogArticleRead({
          articleSlug: article.slug,
          articleTitle: article.title,
          category: article.category,
          readTime: timeSpent,
          scrollDepth: Math.round(maxScroll)
        })
        setTracked(true)
      }
    }
  }, [article, tracked])

  return (
    <article>
      <h1>{article.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: article.content }} />
    </article>
  )
}
```

---

### Ejemplo 3: Tracking de compras en Stripe Webhook

```typescript
// app/api/webhooks/stripe/route.ts

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { trackPurchaseCompleted } from '@/lib/analytics'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Trackear compra en GA4
    trackPurchaseCompleted({
      transactionId: session.id,
      value: (session.amount_total || 0) / 100,
      currency: 'EUR',
      items: [{
        item_id: session.metadata?.plan_id || 'unknown',
        item_name: session.metadata?.plan_name || 'Plan desconocido',
        item_category: 'subscription',
        price: (session.amount_total || 0) / 100,
        quantity: 1
      }],
      coupon: session.metadata?.coupon
    })

    // Guardar en BD...
  }

  return NextResponse.json({ received: true })
}
```

---

## 🔧 Troubleshooting

### Problema: No veo eventos en GA4

**Solución:**
1. Ve a **Informes > Tiempo real** en GA4
2. Navega por tu web
3. Si no ves nada:
   - Verifica que `NEXT_PUBLIC_GA_ID` esté en `.env.local`
   - Verifica que NO tenga comillas dentro de comillas
   - Verifica en DevTools > Network que gtag.js se carga
   - Desactiva adblockers (pueden bloquear GA)

---

### Problema: Eventos custom no aparecen

**Solución:**
Los eventos custom tardan **24-48h** en aparecer en GA4.

Para verlos en tiempo real:
1. GA4 > Informes > Tiempo real
2. Verás el nombre del evento en la lista

Para verlos en informes:
1. Espera 24-48h
2. GA4 > Informes > Engagement > Eventos

---

### Problema: Valores de eventos no suman bien

**Solución:**
Asegúrate de pasar `value` como número, no string:

```typescript
// ❌ MAL
trackEvent('test_completed', { value: '1' })

// ✅ BIEN
trackEvent('test_completed', { value: 1 })
```

---

## 📚 Recursos Adicionales

- **Google Analytics 4 Docs:** https://support.google.com/analytics/
- **GA4 Setup Guide:** https://support.google.com/analytics/answer/9304153
- **Event Tracking Guide:** https://developers.google.com/analytics/devguides/collection/ga4/events
- **Looker Studio:** https://lookerstudio.google.com/

---

## 🎉 Conclusión

El sistema de analytics está **configurado y listo para usar**.

**Ya tienes:**
- ✅ Google Analytics 4 integrado
- ✅ 14 eventos custom predefinidos
- ✅ Funciones helper en TypeScript
- ✅ Tracking de funnels
- ✅ Scroll depth y time on page

**Lo que falta (opcional):**
- Configurar funnels en GA4 (manual, 10 min)
- Crear dashboard en Looker Studio (30 min)
- Integrar tracking en más páginas

**Siguiente paso:**
Consigue tu GA4 Measurement ID y añádelo a `.env.local`. El sistema empezará a trackear automáticamente.

---

*Última actualización: 6 de Noviembre 2025*
*Autor: Sistema de Analytics - Itineramio*
