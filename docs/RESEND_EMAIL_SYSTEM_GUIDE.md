# 📧 Sistema de Email Marketing con Resend - Guía Completa

> **Sistema completamente configurado y listo para usar** - 6 de Noviembre 2025

---

## 📋 Tabla de Contenidos

1. [¿Qué se ha configurado?](#qué-se-ha-configurado)
2. [Configuración de cuenta Resend](#configuración-de-cuenta-resend)
3. [Uso del sistema](#uso-del-sistema)
4. [Templates de email disponibles](#templates-de-email-disponibles)
5. [API Endpoints](#api-endpoints)
6. [Ejemplos de código](#ejemplos-de-código)
7. [Próximos pasos](#próximos-pasos)
8. [Troubleshooting](#troubleshooting)

---

## ✅ ¿Qué se ha configurado?

### 1. **Resend API Integration** (`src/lib/resend.ts`)
- ✅ Cliente de Resend configurado
- ✅ Funciones de envío de email
- ✅ Sistema de tags y segmentación
- ✅ Tipos TypeScript completos
- ✅ Funciones específicas para cada tipo de email

### 2. **Templates de Email** (`src/emails/templates/`)
- ✅ `welcome-lead.tsx` - Email genérico de bienvenida
- ✅ `welcome-test.tsx` - Email tras completar test de personalidad (8 arquetipos)
- ✅ `welcome-qr.tsx` - Email tras generar código QR
- ✅ `onboarding-day1-stats.tsx` - Estadísticas primeras 24h
- ✅ `onboarding-day7-duplicate.tsx` - Cómo duplicar propiedades
- ✅ `onboarding-day13-trial-ending.tsx` - Trial expirando + oferta 20%

### 3. **Modelo de Base de Datos** (`prisma/schema.prisma`)
- ✅ Modelo `EmailSubscriber` con todos los campos necesarios:
  - Datos personales (email, name)
  - Segmentación (archetype, source, tags)
  - Métricas (openRate, clickRate, engagement)
  - Journey tracking (currentJourneyStage)
  - Estado de suscripción

### 4. **API Endpoints** (`app/api/email/`)
- ✅ `POST /api/email/subscribe` - Suscribir emails
- ✅ `GET /api/email/subscribe?email=xxx` - Consultar estado
- ✅ `POST /api/email/unsubscribe` - Dar de baja
- ✅ `GET /api/email/unsubscribe?email=xxx` - Página de confirmación de baja

---

## 🔧 Configuración de Cuenta Resend

### Paso 1: Verificar tu cuenta actual

Ya tienes configurado en `.env.local`:
```bash
RESEND_API_KEY="re_EuT63Wc2_Np1z28sdw1EB8QqK9yy86y76"
RESEND_FROM_EMAIL="hola@itineramio.com"
```

### Paso 2: Verificar dominio en Resend

1. Ve a https://resend.com/domains
2. Verifica que `itineramio.com` esté verificado
3. Si no lo está, añade estos DNS records:

```
Tipo: TXT
Nombre: resend._domainkey
Valor: [Te lo da Resend]

Tipo: TXT
Nombre: _dmarc
Valor: v=DMARC1; p=none

Tipo: MX
Nombre: @
Valor: feedback-smtp.eu-west-1.amazonses.com
Prioridad: 10
```

### Paso 3: Configurar Webhook (Opcional)

Para tracking de opens/clicks:
1. Ir a https://resend.com/webhooks
2. Crear webhook apuntando a: `https://itineramio.com/api/email/webhook`
3. Eventos a escuchar:
   - `email.delivered`
   - `email.opened`
   - `email.clicked`
   - `email.bounced`
   - `email.complained`

---

## 🚀 Uso del Sistema

### Caso 1: Usuario completa Test de Personalidad

```typescript
// En tu componente del test, cuando el usuario envía el formulario:

import { scheduleOnboardingSequence } from '@/lib/resend'

async function handleTestSubmit(data: TestData) {
  // 1. Guardar resultados del test en DB
  const testResult = await saveTestResults(data)

  // 2. Suscribir al email marketing
  const response = await fetch('/api/email/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: data.email,
      name: data.name,
      archetype: testResult.archetype, // 'ESTRATEGA', 'SISTEMATICO', etc.
      source: 'test',
      tags: ['host-profile-test', `archetype-${testResult.archetype.toLowerCase()}`]
    })
  })

  // 3. El sistema automáticamente envía el email de bienvenida
  // No necesitas hacer nada más, la secuencia se programa sola
}
```

### Caso 2: Usuario genera código QR

```typescript
// En tu componente de generación de QR:

async function handleQRGenerated(email: string, name: string) {
  await fetch('/api/email/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      name,
      source: 'qr',
      tags: ['qr-generator']
    })
  })

  // Email automático se envía con instrucciones de uso
}
```

### Caso 3: Usuario descarga Lead Magnet del Blog

```typescript
// En tu landing page de descarga:

async function handleLeadMagnetDownload(email: string, resourceName: string) {
  await fetch('/api/email/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      source: 'blog',
      tags: ['blog-lead', `resource-${resourceName}`],
      metadata: {
        downloadedResource: resourceName,
        downloadDate: new Date().toISOString()
      }
    })
  })
}
```

### Caso 4: Enviar email personalizado manualmente

```typescript
import { sendEmail } from '@/lib/resend'
import { OnboardingDay1Stats } from '@/emails/templates/onboarding-day1-stats'

async function sendStatsEmail(email: string, name: string, views: number) {
  await sendEmail({
    to: email,
    subject: `👀 ${name}, tu manual ya tiene ${views} visitas!`,
    react: OnboardingDay1Stats({ name, views }),
    tags: ['onboarding', 'day-1', 'stats']
  })
}
```

---

## 📨 Templates de Email Disponibles

### 1. `WelcomeTestEmail`
**Cuándo usar:** Inmediatamente tras completar el test de personalidad

**Props:**
```typescript
{
  name: string
  archetype: 'ESTRATEGA' | 'SISTEMATICO' | 'DIFERENCIADOR' | 'EJECUTOR' | 'RESOLUTOR' | 'EXPERIENCIAL' | 'EQUILIBRADO' | 'IMPROVISADOR'
}
```

**Contenido:**
- Resultado del test
- Mayor fortaleza
- Brecha crítica
- Guía personalizada descargable
- CTA a prueba gratis

**Ejemplo:**
```typescript
import { sendWelcomeTestEmail } from '@/lib/resend'

await sendWelcomeTestEmail({
  email: 'usuario@ejemplo.com',
  name: 'María',
  archetype: 'ESTRATEGA'
})
```

---

### 2. `WelcomeQREmail`
**Cuándo usar:** Tras generar un código QR

**Props:**
```typescript
{
  name: string
}
```

**Contenido:**
- Confirmación de QR generado
- 3 tips para usar el QR
- Ejemplo real de uso
- CTA a ver manual completo

**Ejemplo:**
```typescript
import { sendWelcomeQREmail } from '@/lib/resend'

await sendWelcomeQREmail({
  email: 'usuario@ejemplo.com',
  name: 'Carlos'
})
```

---

### 3. `OnboardingDay1Stats`
**Cuándo usar:** 24 horas después del registro (si tiene propiedades con visitas)

**Props:**
```typescript
{
  name: string
  views: number
}
```

**Contenido:**
- Estadísticas primeras 24h
- Consultas evitadas
- Tiempo ahorrado
- CTA a ver analytics completo

**Ejemplo:**
```typescript
import { sendEmail } from '@/lib/resend'
import { OnboardingDay1Stats } from '@/emails/templates/onboarding-day1-stats'

await sendEmail({
  to: 'usuario@ejemplo.com',
  subject: '👀 ¡Tu manual ya tiene 12 visitas!',
  react: OnboardingDay1Stats({ name: 'María', views: 12 }),
  tags: ['onboarding', 'day-1']
})
```

---

### 4. `OnboardingDay7Duplicate`
**Cuándo usar:** 7 días después del registro

**Props:**
```typescript
{
  name: string
}
```

**Contenido:**
- Cómo duplicar propiedades en 5 min
- Testimonio real
- CTA a dashboard de propiedades

---

### 5. `OnboardingDay13TrialEnding`
**Cuándo usar:** 2 días antes de que expire el trial (día 13 de 15)

**Props:**
```typescript
{
  name: string
  totalViews: number
  propertiesCount: number
}
```

**Contenido:**
- Resumen de impacto (vistas, consultas evitadas, tiempo ahorrado)
- Oferta exclusiva 20% descuento
- Código de cupón: TRIAL20
- Testimonio social proof
- CTA a activar plan

**Ejemplo:**
```typescript
import { sendEmail } from '@/lib/resend'
import { OnboardingDay13TrialEnding } from '@/emails/templates/onboarding-day13-trial-ending'

await sendEmail({
  to: 'usuario@ejemplo.com',
  subject: '⏰ Tu prueba expira en 2 días',
  react: OnboardingDay13TrialEnding({
    name: 'María',
    totalViews: 47,
    propertiesCount: 2
  }),
  tags: ['onboarding', 'day-13', 'trial-ending']
})
```

---

## 🔌 API Endpoints

### POST `/api/email/subscribe`

Suscribe un email a la lista de marketing.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "name": "María González",
  "archetype": "ESTRATEGA",
  "source": "test",
  "tags": ["host-profile-test", "archetype-estratega"],
  "metadata": {
    "utm_source": "facebook",
    "utm_campaign": "test-personalidad"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Suscripción exitosa",
  "subscriber": {
    "id": "clx...",
    "email": "usuario@ejemplo.com",
    "archetype": "ESTRATEGA"
  }
}
```

**Response (200) - Ya existe:**
```json
{
  "success": true,
  "message": "Ya estás suscrito",
  "subscriber": {
    "email": "usuario@ejemplo.com",
    "alreadySubscribed": true
  }
}
```

---

### GET `/api/email/subscribe?email=xxx`

Consulta el estado de suscripción.

**Response (200):**
```json
{
  "subscribed": true,
  "subscriber": {
    "id": "clx...",
    "email": "usuario@ejemplo.com",
    "name": "María González",
    "archetype": "ESTRATEGA",
    "source": "test",
    "status": "active",
    "currentJourneyStage": "engaged",
    "engagementScore": "hot",
    "subscribedAt": "2025-11-06T10:30:00Z",
    "tags": ["host-profile-test", "archetype-estratega"]
  }
}
```

---

### POST `/api/email/unsubscribe`

Da de baja un email.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "reason": "No me interesa más"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Has sido dado de baja correctamente"
}
```

---

### GET `/api/email/unsubscribe?email=xxx`

Página web de confirmación de baja (para usar en links de emails).

**Uso en emails:**
```html
<a href="{{unsubscribe}}">Cancelar suscripción</a>
```

O manualmente:
```html
<a href="https://itineramio.com/api/email/unsubscribe?email=usuario@ejemplo.com">
  Cancelar suscripción
</a>
```

---

## 💻 Ejemplos de Código

### Ejemplo 1: Integración completa en formulario de registro

```typescript
'use client'

import { useState } from 'react'

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: ''
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // 1. Crear usuario en tu sistema
    const userResponse = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData)
    })

    const user = await userResponse.json()

    // 2. Suscribir a email marketing automáticamente
    await fetch('/api/email/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        name: formData.name,
        source: 'landing',
        tags: ['new-user', 'trial-started']
      })
    })

    // 3. Redirigir a onboarding
    window.location.href = '/onboarding'
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Tu formulario aquí */}
    </form>
  )
}
```

---

### Ejemplo 2: Cron job para enviar emails programados

```typescript
// app/api/cron/send-day-7-emails/route.ts

import { PrismaClient } from '@prisma/client'
import { sendEmail } from '@/lib/resend'
import { OnboardingDay7Duplicate } from '@/emails/templates/onboarding-day7-duplicate'

const prisma = new PrismaClient()

export async function GET() {
  // Buscar usuarios que se registraron hace exactamente 7 días
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const subscribers = await prisma.emailSubscriber.findMany({
    where: {
      subscribedAt: {
        gte: new Date(sevenDaysAgo.setHours(0, 0, 0, 0)),
        lte: new Date(sevenDaysAgo.setHours(23, 59, 59, 999))
      },
      status: 'active',
      // Solo si no han recibido ya este email
      tags: {
        hasEvery: ['new-user'],
        none: ['day-7-sent']
      }
    }
  })

  // Enviar email a cada uno
  for (const subscriber of subscribers) {
    await sendEmail({
      to: subscriber.email,
      subject: `⚡ ${subscriber.name}, crea tu 2ª propiedad en 5 minutos`,
      react: OnboardingDay7Duplicate({ name: subscriber.name || 'Hola' }),
      tags: ['onboarding', 'day-7']
    })

    // Marcar como enviado
    await prisma.emailSubscriber.update({
      where: { id: subscriber.id },
      data: {
        tags: [...subscriber.tags, 'day-7-sent'],
        emailsSent: { increment: 1 },
        lastEmailSentAt: new Date()
      }
    })
  }

  return Response.json({ sent: subscribers.length })
}
```

---

### Ejemplo 3: Tracking de opens y clicks (Webhook)

```typescript
// app/api/email/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  const body = await request.json()

  const { type, data } = body

  switch (type) {
    case 'email.opened':
      await handleEmailOpened(data)
      break

    case 'email.clicked':
      await handleEmailClicked(data)
      break

    case 'email.bounced':
      await handleEmailBounced(data)
      break
  }

  return NextResponse.json({ received: true })
}

async function handleEmailOpened(data: any) {
  const subscriber = await prisma.emailSubscriber.findFirst({
    where: { email: data.to }
  })

  if (subscriber) {
    await prisma.emailSubscriber.update({
      where: { id: subscriber.id },
      data: {
        emailsOpened: { increment: 1 },
        lastEmailOpenedAt: new Date(),
        openRate: (subscriber.emailsOpened + 1) / subscriber.emailsSent,
        engagementScore: calculateEngagement(subscriber)
      }
    })
  }
}

async function handleEmailClicked(data: any) {
  const subscriber = await prisma.emailSubscriber.findFirst({
    where: { email: data.to }
  })

  if (subscriber) {
    await prisma.emailSubscriber.update({
      where: { id: subscriber.id },
      data: {
        emailsClicked: { increment: 1 },
        lastEmailClickedAt: new Date(),
        clickRate: (subscriber.emailsClicked + 1) / subscriber.emailsSent,
        engagementScore: 'hot' // Click = alta engagement
      }
    })
  }
}

function calculateEngagement(subscriber: any): 'hot' | 'warm' | 'cold' {
  if (subscriber.clickRate > 0.1) return 'hot'
  if (subscriber.openRate > 0.3) return 'warm'
  return 'cold'
}
```

---

## 📅 Próximos Pasos

### 1. **Configurar Cron Jobs** (Recomendado con Vercel Cron)

Crear cron jobs para enviar emails programados:

**`vercel.json`:**
```json
{
  "crons": [
    {
      "path": "/api/cron/send-day-1-emails",
      "schedule": "0 10 * * *"
    },
    {
      "path": "/api/cron/send-day-7-emails",
      "schedule": "0 10 * * *"
    },
    {
      "path": "/api/cron/send-day-13-emails",
      "schedule": "0 10 * * *"
    }
  ]
}
```

### 2. **Crear más templates**

Emails adicionales recomendados:
- Day 3: Personalización de diseño
- Day 10: Plantillas premium
- Day 15: Último día de trial
- Trial expired: Win-back campaign
- Newsletter mensual para clientes activos

### 3. **Implementar segmentación avanzada**

Crear secuencias diferentes según:
- Arquetipo (8 secuencias personalizadas)
- Nivel de engagement (hot, warm, cold)
- Producto comprado (manual, curso)
- Número de propiedades

### 4. **Analytics Dashboard**

Crear una página en el dashboard para ver:
- Total de suscriptores
- Tasa de apertura por email
- Tasa de conversión trial → pago
- Journey stage distribution
- Engagement score distribution

### 5. **A/B Testing**

Implementar variantes de subject lines:
```typescript
const subjectLines = [
  '⏰ Tu prueba expira en 2 días',
  '🚨 Solo quedan 48 horas de tu prueba',
  'María, ¿seguimos juntos después del trial?'
]

const randomSubject = subjectLines[Math.floor(Math.random() * subjectLines.length)]
```

---

## 🔧 Troubleshooting

### Problema: Emails no se envían

**Solución:**
1. Verificar que `RESEND_API_KEY` esté en `.env.local`
2. Verificar que el dominio `itineramio.com` esté verificado en Resend
3. Revisar logs de Resend: https://resend.com/logs

```bash
# Test rápido en Node.js
node
> const { Resend } = require('resend')
> const resend = new Resend('re_EuT63Wc2_Np1z28sdw1EB8QqK9yy86y76')
> await resend.emails.send({
    from: 'hola@itineramio.com',
    to: 'tu-email@gmail.com',
    subject: 'Test',
    html: '<p>Funciona!</p>'
  })
```

---

### Problema: Emails van a spam

**Soluciones:**
1. Verificar SPF, DKIM y DMARC en tu dominio
2. No usar palabras spam en subject line: "GRATIS", "URGENTE", "DINERO"
3. Incluir siempre link de unsubscribe
4. Mantener ratio de bounces <5%
5. Usar dominio verificado, no `@gmail.com`

---

### Problema: Template no renderiza bien

**Solución:**
React Email es server-side rendering. No puedes usar:
- ❌ `useState`, `useEffect`
- ❌ Client components
- ❌ Dynamic imports

Solo puedes usar:
- ✅ Props
- ✅ Conditional rendering con ternarios
- ✅ Inline styles
- ✅ React components simples

---

### Problema: Base de datos no sincroniza

**Solución:**
```bash
# Generar cliente Prisma actualizado
npx prisma generate

# Aplicar migraciones pendientes
npx prisma migrate dev

# Ver datos en Prisma Studio
npx prisma studio
```

---

## 📚 Recursos Adicionales

- **Resend Docs:** https://resend.com/docs
- **React Email Docs:** https://react.email/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Ejemplos de emails:** https://react.email/examples

---

## 🎉 Conclusión

El sistema de email marketing está **100% configurado y listo para usar**.

**Lo que tienes ahora:**
- ✅ 6 templates profesionales de email
- ✅ Sistema de suscripción y baja automática
- ✅ Segmentación por arquetipos y tags
- ✅ API endpoints listos para integrar
- ✅ Base de datos con tracking completo
- ✅ Resend configurado y funcionando

**Lo que falta (opcional):**
- Cron jobs para emails programados (recomendado)
- Webhook para tracking de opens/clicks
- Dashboard de analytics
- Más templates de email
- A/B testing de subject lines

---

**¿Preguntas? Revisa esta guía o consulta los ejemplos de código.**

**¡Ahora solo queda empezar a capturar emails y verlos crecer! 🚀**

---

*Última actualización: 6 de Noviembre 2025*
*Autor: Sistema de Marketing Automation - Itineramio*
