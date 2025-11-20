# Sistema de Secuencias Automatizadas de Email

Sistema completo de email marketing automatizado con **Resend**, completamente integrado en tu app Next.js.

## 🎯 ¿Qué hace?

- ✅ Crea secuencias de emails automatizadas (onboarding, nurturing, etc.)
- ✅ Inscribe automáticamente a subscribers en las secuencias correctas
- ✅ Envía emails programados con delays y condiciones
- ✅ Trackea engagement (opens, clicks, bounces) en tiempo real
- ✅ Actualiza engagement scores automáticamente
- ✅ Maneja unsubscribes y bounces

## 📊 Arquitectura

```
EmailSubscriber (tabla existente)
    ↓
enrollSubscriberInSequences() - Cuando se crea un subscriber
    ↓
SequenceEnrollment - Se inscribe en secuencias que correspondan
    ↓
ScheduledEmail - Se programan todos los emails de la secuencia
    ↓
Cron Job (cada 15 min) - Busca emails listos para enviar
    ↓
Resend API - Envía el email
    ↓
Webhook Resend - Trackea opens, clicks, bounces
    ↓
trackEmailEvent() - Actualiza stats en DB
```

## 🗂️ Modelos de Base de Datos

### EmailSequence
- **Qué es**: Una secuencia completa de emails (ej: "Onboarding Genérico")
- **Campos clave**:
  - `triggerEvent`: Cuándo se activa (SUBSCRIBER_CREATED, TEST_COMPLETED, etc.)
  - `targetArchetype`: Segmentación por arquetipo (null = todos)
  - `targetSource`: Segmentación por source (null = todos)
  - `isActive`: Si la secuencia está activa

### EmailSequenceStep
- **Qué es**: Un email dentro de una secuencia
- **Campos clave**:
  - `delayDays`, `delayHours`: Cuánto esperar antes de enviar
  - `sendAtHour`: Hora específica del día (ej: 10 = 10 AM)
  - `templateName`: Nombre del archivo React Email
  - `requiresPreviousOpen/Click`: Condiciones para enviar

### SequenceEnrollment
- **Qué es**: La inscripción de un subscriber en una secuencia
- **Campos clave**:
  - `status`: active, completed, paused, unsubscribed
  - `currentStepOrder`: En qué paso está
  - Métricas de engagement

### ScheduledEmail
- **Qué es**: Un email programado para enviarse
- **Campos clave**:
  - `scheduledFor`: Cuándo enviarlo
  - `status`: pending, sending, sent, failed, cancelled
  - `resendId`: ID de Resend para tracking
  - Timestamps de opens, clicks, bounces

## 🚀 Uso

### 1. Crear una Secuencia

```bash
# Ejecutar el seed script
DATABASE_URL="..." npx tsx scripts/seed-email-sequences.ts
```

O manualmente en código:

```typescript
const sequence = await prisma.emailSequence.create({
  data: {
    name: 'Onboarding Estratega',
    triggerEvent: 'TEST_COMPLETED',
    targetArchetype: 'ESTRATEGA',
    isActive: true,
    steps: {
      create: [
        {
          name: 'Email 1: Bienvenida',
          subject: '¡Hola Estratega! Tu guía está lista',
          templateName: 'welcome-test.tsx',
          delayDays: 0,
          order: 1
        },
        {
          name: 'Email 2: Tips avanzados',
          subject: '5 estrategias que los Estrategas dominan',
          templateName: 'sequence-day3-mistakes.tsx',
          delayDays: 3,
          sendAtHour: 10,
          order: 2
        }
      ]
    }
  }
})
```

### 2. Inscribir Subscribers Automáticamente

Ya está integrado en `/api/newsletter/subscribe`:

```typescript
// Cuando alguien se suscribe
const subscriber = await prisma.emailSubscriber.create({
  data: { email, source, tags }
})

// Se inscribe automáticamente en secuencias
await enrollSubscriberInSequences(
  subscriber.id,
  'SUBSCRIBER_CREATED',
  { source, tags }
)
```

### 3. Envío Automático

El cron job `/api/cron/send-emails` se ejecuta **cada 15 minutos**:

```typescript
// Se ejecuta automáticamente vía Vercel Cron
await processScheduledEmails(100) // Procesa hasta 100 emails
```

## 📧 Secuencias Actuales

### 1. Onboarding Genérico (5 emails)

| Email | Delay | Subject | Template |
|-------|-------|---------|----------|
| 1 | Inmediato | ¡Bienvenido a Itineramio! 🎉 | welcome-test.tsx |
| 2 | +1 día (10 AM) | El secreto de los anfitriones que ganan más | onboarding-day1-stats.tsx |
| 3 | +3 días (10 AM) | 3 errores que están costando valoraciones | sequence-day3-mistakes.tsx |
| 4 | +7 días (10 AM) | Cómo Laura pasó de 4.2⭐ a 4.9⭐ | sequence-day7-case-study.tsx |
| 5 | +10 días (10 AM) | 15 días gratis para probar Itineramio | sequence-day10-trial.tsx |

**Trigger**: SUBSCRIBER_CREATED
**Segmentación**: Todos (no tiene filtros)
**Estado**: ✅ Activa

### 2. Post-Trial Nurturing (3 emails)

| Email | Delay | Subject |
|-------|-------|---------|
| 1 | +1 día | ¿Qué te pareció Itineramio? |
| 2 | +3 días | ¿Tienes dudas sobre Itineramio? |
| 3 | +7 días | Última oportunidad: 20% descuento |

**Trigger**: SUBSCRIBER_CREATED
**Segmentación**: tag = "trial_completed"
**Estado**: ⏸️ Desactivada (activar cuando esté lista)

## ⚙️ Configuración

### 1. Variables de Entorno

```env
# Resend
RESEND_API_KEY=re_xxx

# Cron Job (generar con: openssl rand -base64 32)
CRON_SECRET=tu_secret_aleatorio
```

### 2. Webhook de Resend

1. Ir a: https://resend.com/webhooks
2. Crear webhook:
   - **URL**: `https://itineramio.com/api/webhooks/resend`
   - **Eventos**:
     - ✅ email.delivered
     - ✅ email.opened
     - ✅ email.clicked
     - ✅ email.bounced
     - ✅ email.complained
3. (Opcional) Guardar el webhook secret en `.env`:
   ```env
   RESEND_WEBHOOK_SECRET=whsec_xxx
   ```

### 3. Cron Job en Vercel

Ya está configurado en `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-emails",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

**Importante**: Asegúrate de tener el plan Pro de Vercel para cron jobs.

## 🧪 Testing

### Probar Manualmente el Cron

```bash
curl -X POST http://localhost:3000/api/cron/send-emails \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

### Crear un Subscriber de Prueba

```bash
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "source": "academia-coming-soon"
  }'
```

Esto automáticamente:
1. Crea el EmailSubscriber
2. Lo inscribe en la secuencia "Onboarding Genérico"
3. Programa los 5 emails con sus delays

### Ver Emails Programados

```sql
SELECT
  se.subject,
  se.recipientEmail,
  se.scheduledFor,
  se.status
FROM scheduled_emails se
WHERE se.status = 'pending'
ORDER BY se.scheduledFor ASC;
```

## 📈 Métricas y Stats

### Ver Stats de una Secuencia

```typescript
import { getSequenceStats } from '@/lib/email-sequences'

const stats = await getSequenceStats('onboarding-generic')

console.log(stats)
// {
//   name: 'Onboarding Genérico',
//   totalEnrolled: 150,
//   activeEnrollments: 98,
//   completedEnrollments: 42,
//   completionRate: '28.00',
//   stepStats: [
//     {
//       name: 'Email 1: Bienvenida',
//       sent: 150,
//       delivered: 148,
//       opened: 89,
//       clicked: 23,
//       openRate: '60.14',
//       clickRate: '15.54'
//     },
//     ...
//   ]
// }
```

### Dashboard Admin (Próximo)

Panel visual para:
- Ver todas las secuencias y sus stats
- Activar/desactivar secuencias
- Ver subscribers inscritos
- Editar emails y delays
- Ver engagement por paso

## 🎨 Templates de Email

Los templates están en `src/emails/templates/`:

- `welcome-test.tsx` - Bienvenida con entrega de guía
- `onboarding-day1-stats.tsx` - Stats y valor educativo
- `sequence-day3-mistakes.tsx` - 3 errores comunes
- `sequence-day7-case-study.tsx` - Caso de estudio de Laura
- `sequence-day10-trial.tsx` - Invitación a trial
- `sequence-day14-urgency.tsx` - Última oportunidad

### Crear un Nuevo Template

1. Crear archivo en `src/emails/templates/mi-nuevo-email.tsx`:

```tsx
import * as React from 'react'
import { Html, Head, Body, Container, Text, Button } from '@react-email/components'

export default function MiNuevoEmail({ name }: { name: string }) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Text>Hola {name},</Text>
          <Text>Contenido del email...</Text>
          <Button href="https://itineramio.com">
            Call to Action
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
```

2. Referenciar en el EmailSequenceStep:

```typescript
{
  templateName: 'mi-nuevo-email.tsx',
  templateData: { /* datos extra */ }
}
```

## 🔄 Tracking de Engagement

El webhook de Resend actualiza automáticamente:

### EmailSubscriber
- `emailsSent`, `emailsDelivered`, `emailsOpened`, `emailsClicked`, `emailsBounced`
- `lastEmailOpenedAt`, `lastEmailClickedAt`, `lastEngagement`
- `engagementScore`: cold → warm → hot (basado en opens/clicks)
- `becameHotAt`: Cuando se volvió hot lead

### ScheduledEmail
- `openedAt`, `clickedAt`, `bouncedAt`, `complainedAt`, `unsubscribedAt`

### Enrollment
- Se pausa automáticamente si hay bounce
- Se desactiva si hay complaint o unsubscribe

## ⚠️ Casos Especiales

### Hard Bounce
- Subscriber marcado como `status: 'bounced'`
- Enrollment pausado
- No se envían más emails

### Spam Complaint
- Subscriber marcado como `status: 'unsubscribed'`
- Enrollment desactivado
- Añadido tag "complained"

### Unsubscribe
- Subscriber marcado como `status: 'unsubscribed'`
- Todos los enrollments desactivados
- No recibe más emails de ninguna secuencia

## 📝 Roadmap

### Próximas mejoras:

1. **Admin Panel Visual**
   - Dashboard de secuencias
   - Editor visual de emails
   - Analytics por secuencia

2. **A/B Testing**
   - Probar diferentes subjects
   - Diferentes delays
   - Diferentes contenidos

3. **Segmentación Avanzada**
   - Por engagement score
   - Por comportamiento
   - Por custom events

4. **Workflows Condicionales**
   - Ramificaciones según clicks
   - Decisiones basadas en engagement
   - Secuencias dinámicas

5. **Templates Adicionales**
   - Re-engagement para inactivos
   - Upsell/cross-sell
   - Referral program

## 🐛 Troubleshooting

### Los emails no se envían

1. Verificar que el cron job está configurado en Vercel
2. Verificar `CRON_SECRET` en variables de entorno
3. Ver logs en Vercel: `vercel logs`
4. Revisar scheduled_emails con `status = 'failed'`

### Webhook no funciona

1. Verificar URL en Resend dashboard
2. Ver logs del webhook: https://resend.com/webhooks
3. Probar manualmente:
   ```bash
   curl -X POST https://itineramio.com/api/webhooks/resend \
     -H "Content-Type: application/json" \
     -d '{"type":"email.opened","data":{"email_id":"test"}}'
   ```

### Emails duplicados

- Verificar que no hay múltiples cron jobs activos
- Revisar que el subscriber no está inscrito dos veces en la misma secuencia

## 💰 Costos

### Resend
- **Plan gratuito**: 3,000 emails/mes, 100 emails/día
- **Plan Pay-as-you-go**: $1 por 1,000 emails adicionales

### Vercel Cron
- **Plan Pro**: Incluido
- **Límite**: 1,000 ejecuciones/mes (suficiente para 15 min intervals)

### Base de Datos (Supabase)
- Sin costo adicional (solo storage normal)

## 🎉 ¡Ya está funcionando!

El sistema está **completamente funcional**. Cada vez que:

1. Alguien se suscribe en `/academia` → Se inscribe en "Onboarding Genérico"
2. Cada 15 minutos → Se envían los emails programados
3. Usuario abre email → Se trackea automáticamente
4. Usuario hace click → Engagement score sube a "hot"

Todo automático, sin intervención manual. 🚀
