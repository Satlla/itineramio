# 🔄 Sistema de Reactivación de Suscripciones

## 📋 Visión General

El sistema de reactivación permite a los usuarios que cancelaron su suscripción cambiar de opinión y reactivarla **sin costo adicional** mientras su período pagado esté activo.

## 🎯 Casos de Uso

### Caso 1: Usuario se arrepiente inmediatamente
- Usuario cancela suscripción el 1 de enero (pagado hasta 30 de junio)
- Usuario se arrepiente el 2 de enero
- ✅ Puede reactivar gratis, suscripción continúa hasta 30 de junio

### Caso 2: Usuario se arrepiente días después
- Usuario cancela suscripción el 1 de enero (pagado hasta 30 de junio)
- Usuario se arrepiente el 15 de febrero
- ✅ Puede reactivar gratis, suscripción continúa hasta 30 de junio

### Caso 3: Usuario ya expiró
- Usuario cancela suscripción el 1 de enero (pagado hasta 30 de junio)
- Usuario intenta reactivar el 1 de julio (ya expiró)
- ❌ No puede reactivar, debe crear nueva suscripción

## 🏗️ Arquitectura del Sistema

### Estado de Suscripción Cancelada

```typescript
{
  id: "cmh0qjgne000j7c4retx67g6v",
  status: "ACTIVE",                    // Sigue activa
  cancelAtPeriodEnd: true,              // Marcada para cancelarse
  canceledAt: "2025-01-01T10:00:00Z",  // Cuándo se solicitó cancelación
  cancelReason: "Usuario solicitó...",  // Por qué canceló
  endDate: "2025-06-30T23:59:59Z"      // Se cancelará en esta fecha
}
```

### Proceso de Reactivación

```typescript
// 1. Usuario hace clic en "Reactivar Gratis"
// 2. Frontend llama a /api/subscription/reactivate
// 3. Backend verifica:
const subscription = await prisma.userSubscription.findFirst({
  where: {
    userId,
    status: 'ACTIVE',
    cancelAtPeriodEnd: true,  // Fue cancelada
    endDate: { gte: new Date() }  // Aún no expiró
  }
})

// 4. Backend actualiza:
await prisma.userSubscription.update({
  where: { id: subscription.id },
  data: {
    cancelAtPeriodEnd: false,  // Quitar marca de cancelación
    // Guardar historial en notes
  }
})

// 5. Suscripción continúa normalmente hasta endDate
```

## 💳 Integración con Stripe (Futuro)

### Sistema Manual Actual vs Stripe

| Aspecto | Manual (Actual) | Stripe (Futuro) |
|---------|-----------------|-----------------|
| Cancelación | Marca `cancelAtPeriodEnd = true` | `stripe.subscriptions.update({ cancel_at_period_end: true })` |
| Reactivación | Marca `cancelAtPeriodEnd = false` | `stripe.subscriptions.update({ cancel_at_period_end: false })` |
| Cobro | No cobra nada (ya pagado) | No cobra nada (Stripe maneja automáticamente) |
| Renovación | Manual al expirar | Automática por Stripe |

### Código para Stripe (Preparado)

```typescript
// En /api/subscription/reactivate/route.ts (líneas 37-45)
if (subscription.stripeSubscriptionId) {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  
  // Remover cancelación en Stripe
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: false,
    metadata: {
      reactivated_at: new Date().toISOString(),
      reactivated_by: decoded.userId
    }
  })
  
  // Stripe renovará automáticamente al final del período
}
```

### Ventajas de Stripe

1. **Sincronización automática**: Stripe y nuestra DB siempre consistentes
2. **Renovación automática**: No necesitamos cron jobs
3. **Webhooks**: Nos notifica de todos los cambios
4. **Menos errores**: Stripe maneja edge cases

### Webhooks de Stripe

```typescript
// Webhook: customer.subscription.updated
{
  "type": "customer.subscription.updated",
  "data": {
    "object": {
      "id": "sub_xxxxx",
      "cancel_at_period_end": false,  // Cambió de true a false
      "status": "active"
    }
  }
}

// Nuestra respuesta:
await prisma.userSubscription.update({
  where: { stripeSubscriptionId: "sub_xxxxx" },
  data: { cancelAtPeriodEnd: false }
})
```

## 📱 Experiencia de Usuario

### UX en /account/plans

**Banner de suscripción cancelada:**
```
┌─────────────────────────────────────────────────────────┐
│ ⚠️  Plan Actual: HOST                       [Se cancelará] │
│ €102.60 cada 6 meses • Semestral                        │
│ ⚠️ Se cancelará el 21 de abril de 2026 (en 180 días)   │
│                                                          │
│ [✅ Reactivar Gratis]                                    │
└─────────────────────────────────────────────────────────┘
```

**Después de reactivar:**
```
┌─────────────────────────────────────────────────────────┐
│ 👑  Plan Actual: HOST                           [Activo] │
│ €102.60 cada 6 meses • Semestral                        │
│ Válido hasta 21 de abril de 2026 (180 días restantes)  │
│                                                          │
│ [Cancelar suscripción]                                  │
└─────────────────────────────────────────────────────────┘
```

### Mensajes al Usuario

**Éxito:**
```
¡Suscripción reactivada! Seguirás disfrutando de tu plan HOST sin interrupciones.
```

**Error - Ya expiró:**
```
No tienes suscripción cancelada para reactivar
(Debe crear nueva suscripción)
```

## 🔧 Archivos del Sistema

### Backend
- `/app/api/subscription/reactivate/route.ts` - Endpoint de reactivación
- `/app/api/subscription/cancel/route.ts` - Endpoint de cancelación

### Frontend
- `/app/(dashboard)/account/plans/page.tsx` - Página principal con botón
- `/src/components/billing/CanceledSubscriptionBanner.tsx` - Banner standalone

### Base de datos
```sql
-- Campos necesarios en user_subscriptions:
cancel_at_period_end BOOLEAN DEFAULT false,
canceled_at TIMESTAMP NULL,
cancel_reason TEXT NULL
```

## 📊 Métricas de Reactivación

### KPIs a Trackear
- **Tasa de reactivación**: % de usuarios que reactivan vs cancelan
- **Tiempo hasta reactivación**: Cuántos días tarda usuario en cambiar de opinión
- **Razones de cancelación**: Por qué cancelan (para mejorar producto)
- **Retención post-reactivación**: ¿Vuelven a cancelar?

### Queries útiles

```sql
-- Usuarios que cancelaron y reactivaron
SELECT 
  COUNT(*) as total_reactivations,
  AVG(EXTRACT(EPOCH FROM (reactivated_at - canceled_at))/86400) as avg_days_to_reactivate
FROM user_subscriptions
WHERE 
  notes LIKE '%REACTIVADA por usuario%'
  AND canceled_at IS NOT NULL;

-- Tasa de reactivación por plan
SELECT 
  p.name as plan_name,
  COUNT(CASE WHEN us.notes LIKE '%REACTIVADA%' THEN 1 END) as reactivations,
  COUNT(*) as total_cancellations,
  ROUND(COUNT(CASE WHEN us.notes LIKE '%REACTIVADA%' THEN 1 END)::numeric / COUNT(*) * 100, 2) as reactivation_rate
FROM user_subscriptions us
JOIN subscription_plans p ON us.plan_id = p.id
WHERE us.canceled_at IS NOT NULL
GROUP BY p.name;
```

## 🚀 Roadmap

### Fase 1: Manual (✅ COMPLETADO)
- [x] Endpoint de reactivación
- [x] UI en /account/plans
- [x] Banner responsive
- [x] Historial en notes

### Fase 2: Mejoras UX
- [ ] Email de confirmación de reactivación
- [ ] Notificación al admin de reactivación
- [ ] Analytics dashboard de reactivaciones

### Fase 3: Stripe Integration
- [ ] Sincronización bidireccional con Stripe
- [ ] Webhooks para actualizaciones automáticas
- [ ] Testing con Stripe test mode

### Fase 4: Optimización
- [ ] A/B testing de mensajes de reactivación
- [ ] Ofertas personalizadas para prevenir cancelación
- [ ] Encuesta post-reactivación

## 💡 Tips para el Admin

### Cómo ver suscripciones canceladas pendientes

```typescript
// Endpoint ya creado: /api/admin/canceled-subscriptions
GET /api/admin/canceled-subscriptions

// Retorna:
{
  canceledSubscriptions: [
    {
      userName: "Juan Pérez",
      userEmail: "juan@example.com",
      planName: "HOST",
      daysRemaining: 45,
      canceledAt: "2025-01-15",
      cancelReason: "Muy caro"
    }
  ],
  total: 5
}
```

### Widget en Admin Dashboard

El widget `ExpiringSubscriptionsWidget` ya muestra suscripciones canceladas con badge especial:

```tsx
// Muestra:
// - Badge "CANCELADA" en rojo
// - Motivo de cancelación
// - Fecha de cancelación
// - Días hasta que expire
```

## ⚠️ Casos Edge a Considerar

### 1. Usuario tiene múltiples suscripciones
```typescript
// Solución: Reactivar solo la más reciente cancelada
orderBy: { createdAt: 'desc' }
```

### 2. Usuario intenta reactivar después de expirar
```typescript
// Solución: Verificar endDate >= now
where: { endDate: { gte: new Date() }}
```

### 3. Suscripción ya renovada automáticamente
```typescript
// Con Stripe: Webhook actualiza estado antes de que usuario intente
// Sin Stripe: Cron job marca como EXPIRED
```

### 4. Usuario cambia de plan después de cancelar
```typescript
// Solución: Nueva suscripción sobrescribe la cancelada
// Antigua: status = 'CANCELED', cancelAtPeriodEnd = true
// Nueva: status = 'ACTIVE', cancelAtPeriodEnd = false
```

---

**Última actualización:** 24/10/2025  
**Estado:** ✅ Sistema manual completado, listo para Stripe

