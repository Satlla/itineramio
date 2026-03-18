# ARCHITECTURE.md — Itineramio

Documento de referencia arquitectónico. Actualizar cuando cambie algo estructural.

---

## Visión general

Itineramio es una plataforma SaaS para gestores de apartamentos turísticos. Ofrece:
- **Guías digitales** para huéspedes (sustituto del manual en papel)
- **Módulo de gestión** (reservas, facturación, liquidaciones, clientes)
- **Portal propietario** (acceso sin login para owners)
- **Demo pública** con wizard + lead capture

---

## Módulos principales

```
┌─────────────────────────────────────────────────────┐
│                   Itineramio                        │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Guías   │  │ Gestión  │  │  Infraestructura  │  │
│  │ públicas │  │  SaaS    │  │                  │  │
│  └────┬─────┘  └────┬─────┘  │  • Auth (JWT)    │  │
│       │             │        │  • Stripe billing │  │
│  /guide/[slug]  /gestion/    │  • Resend email   │  │
│  Sin auth       Con auth     │  • Vercel Blob    │  │
│                              │  • Upstash Redis  │  │
│  ┌──────────┐  ┌──────────┐  │  • PostgreSQL     │  │
│  │  Admin   │  │  Demo    │  │  • Cron jobs x6   │  │
│  │  panel   │  │ pública  │  └──────────────────┘  │
│  └──────────┘  └──────────┘                        │
│  /admin/        /demo/                              │
│  isAdmin=true   Sin auth                            │
└─────────────────────────────────────────────────────┘
```

---

## Flujo de autenticación completo

```
Usuario → POST /api/auth/login
              │
              ▼
         bcryptjs.compare(password, hash)
              │
              ├─ ❌ → 401 Unauthorized
              │
              ▼ ✅
         jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' })
              │
              ▼
         Set-Cookie: token=<JWT>; httpOnly; SameSite=Lax; Secure
              │
              ▼
─────────────────────────────────────────────
En cada request siguiente:

middleware.ts (Edge Runtime)
  jose.jwtVerify(token, JWT_SECRET)
      │
      ├─ Token inválido/expirado → redirect /login + borrar cookie
      │
      ▼ ✅
  Request pasa al handler

En API route:
  getUser(req) → src/lib/auth.ts
      │
      ▼
  Devuelve User desde DB (Prisma) o null
```

---

## Sistema de propiedades y slugs

```
Propiedad (Property)
  ├─ id: cuid (interno, URLs de gestión)
  ├─ slug: string único (URLs públicas)
  ├─ userId: FK → User (propietario/gestor)
  ├─ sections: Section[] (contenido de la guía)
  │    └─ elements: Element[] (texto, imagen, video, etc.)
  ├─ reservations: Reservation[]
  ├─ expenses: PropertyExpense[]
  └─ owners: PropertyOwner[] (owners con acceso portal)

URLs:
  /guide/[slug]              → guía pública (sin auth)
  /gestion/apartamentos/[id] → edición (auth requerida)
  /propietario/[token]       → portal owner (token único)
```

---

## Módulo de gestión (gestion/)

```
/gestion/
  ├─ apartamentos/         → CRUD propiedades
  │    └─ [id]/            → edición de guía, secciones, elementos
  ├─ reservas/             → reservaciones (lista + calendario)
  │    ├─ import/          → importación CSV/iCal/email
  │    └─ [id]/            → detalle reserva
  ├─ clientes/             → propietarios/owners
  │    └─ [id]/            → detalle + envío portal link
  ├─ facturacion/          → facturas
  │    └─ [propertyId]/[year]/[month]/  → liquidación mensual
  ├─ liquidaciones/        → liquidaciones generadas (Excel)
  └─ analytics/            → métricas de visitas
```

---

## Sistema de facturación / Stripe

```
Plan gratuito (trial 14 días)
     │
     ▼
Stripe Subscription
  ├─ BASIC (1 propiedad)
  ├─ PRO (5 propiedades)
  └─ ENTERPRISE (ilimitado)

Flujo upgrade:
  POST /api/billing/create-checkout → Stripe Checkout Session
  Webhook: /api/webhooks/stripe
    ├─ checkout.session.completed → activar subscription en DB
    ├─ invoice.payment_succeeded → renovar
    └─ customer.subscription.deleted → downgrade

Entidades DB relevantes:
  User.subscription (plan actual)
  Invoice (facturas Stripe)
  BillingInfo (datos facturación)
```

---

## Sistema de emails

```
Transaccional: Resend
  src/lib/email.ts       → sendEmail() genérico
  src/lib/auth-email.ts  → emails de auth (verify, reset)
  src/lib/email-notifications.ts → notificaciones de plataforma

Secuencias marketing: Cron job /api/cron/email-sequence (9:00 diario)
  EmailSequence (DB) → EmailEvent (tracking)

Templates: React Email en src/components/ o inline
```

---

## Demo pública

```
/demo → wizard 4 pasos:
  Step1Address → dirección de la propiedad
  Step2Details → detalles (tipo, habitaciones, etc.)
  Step2Media   → subida de fotos/video
  Step4Review  → resumen + captura lead (email)

APIs sin auth:
  POST /api/public/demo-upload         → Vercel Blob
  POST /api/public/demo-analyze-media  → AI análisis imágenes
  GET  /api/public/demo-location-data  → Google Places
  GET  /api/public/demo-spots          → plazas disponibles (simulado)
  POST /api/public/generate-demo       → genera guía demo

Post-demo:
  → redirect /guide/[propertyId]?demo=1
  → DemoCountdownBanner (15 min TTL)
  → Cupón descuento 20% (1 hora de validez)
```

---

## Cron jobs

| Job | Hora | Lógica |
|-----|------|--------|
| guest-followup | 10:00 diario | Emails automáticos post-estancia |
| verifactu-status | cada hora | Polling estado facturas AEAT (UI dice "próximamente") |
| demo-followup | cada hora | Secuencia emails a leads demo |
| check-trials | cada 6h | Activar trials, expirar, notificar |
| check-module-trials | cada 6h | Igual para módulos individuales |
| email-sequence | 9:00 diario | Envía emails de secuencias marketing |

---

## Rate limiting

```typescript
// src/lib/rate-limit.ts
// Usa Upstash Redis si UPSTASH_REDIS_REST_URL está configurada
// Fallback in-memory si no

import { checkRateLimitAsync } from '@/lib/rate-limit'

// En rutas nuevas — SIEMPRE añadir rate limiting
const { success } = await checkRateLimitAsync(ip, { limit: 20, window: '1m' })
```

---

## Modelos Prisma principales (128 total)

```
User                    → gestor/host
Property                → propiedad/apartamento
  Section               → sección de guía
    Element             → elemento (texto/imagen/video/link)
Reservation             → reserva
PropertyExpense         → gasto por propiedad
PropertyOwner           → owner con acceso portal
Liquidation             → liquidación mensual
Invoice                 → factura generada
BillingInfo             → datos fiscales usuario
GmailIntegration        → OAuth Google para importar reservas
EmailSequence           → secuencias de marketing
EmailEvent              → tracking emails
Notification            → notificaciones in-app (modelo existe, sin SSE aún)
Coupon / CouponUse      → sistema de cupones
AffiliateTransaction    → programa de referidos
```

---

## Pendiente (TODOs críticos)

- **Booking parser** — importación de emails de Booking.com (Airbnb funciona)
- **SSE notifications** — modelo `Notification` existe en Prisma, sin WebSocket/SSE
- **Bulk actions** — selección múltiple en reservas y liquidaciones
- **Changelog badge** — seed existe (`seed-product-updates.ts`), sin UI
- **PWA** — sin service worker aún
- **TypeScript strict** — `ignoreBuildErrors: true` en next.config.js
- **Verifactu** — integración AEAT real (UI dice "próximamente")
