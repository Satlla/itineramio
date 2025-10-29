# 🧹 Plan de Limpieza: Referencias FREE/STARTER/GRATUITO

**Fecha:** 2025-10-19  
**Tarea:** B) Política "Nada gratis" - Eliminar todas las referencias a planes gratuitos  
**Objetivo:** Sustituir "gratis/gratuito/STARTER/FREE/primera propiedad gratis/incluida" por "Sin plan activo" + CTA

---

## 📋 Alcance del Problema

**Total de archivos afectados:** 63 archivos  
**Términos buscados:** `gratuito|gratis|free.?plan|primera propiedad|incluida|STARTER|FREE`

---

## 🎯 Estrategia de Reemplazo

| Término Original | Reemplazo | Contexto |
|------------------|-----------|----------|
| `gratis` | `Sin plan activo` | Mensajes de UI |
| `gratuito` | `Sin plan activo` | Mensajes de UI |
| `STARTER` | `(remover completamente)` | Referencias a plan |
| `FREE` | `(remover completamente)` | Referencias a plan |
| `primera propiedad gratis` | `período de prueba de 15 días` | Onboarding |
| `incluida` | `automática` | En contexto de features |
| `Plan Starter` | `Sin plan activo` | Mensajes de estado |
| `free plan` | `trial period` | Código/comentarios |

---

## 📂 Archivos Críticos (Prioridad Alta)

### APIs (Backend)
1. `/app/api/user/properties-subscription/route.ts` - Lógica de propiedades cubiertas
2. `/app/api/user/subscriptions/route.ts` - Estado de suscripciones
3. `/app/api/pricing/calculate/route.ts` - Cálculo de precios
4. `/app/api/billing/plan-limits/route.ts` - Límites de plan
5. `/app/api/admin/subscription-requests/route.ts` - Solicitudes admin

### Componentes de UI
6. `/src/components/billing/BillingOverview.tsx` - Vista general facturación
7. `/src/components/plan-limits/PlanLimitsCard.tsx` - Card de límites
8. `/src/components/billing/PropertySubscriptionStatus.tsx` - Estado propiedades
9. `/src/components/billing/TrialBanner.tsx` - Banner de trial
10. `/src/components/ui/TrialCountdownBanner.tsx` - Countdown trial

### Páginas
11. `/app/(dashboard)/subscriptions/page.tsx` - Página suscripciones
12. `/app/(dashboard)/account/billing/page.tsx` - Página facturación
13. `/app/(dashboard)/account/plans/page.tsx` - Página planes
14. `/app/(dashboard)/main/page.tsx` - Dashboard principal
15. `/app/(dashboard)/properties/page.tsx` - Lista propiedades

### Configuración
16. `/src/config/plans-static.ts` - Definición de planes
17. `/src/config/trial.ts` - Configuración trial
18. `/src/lib/trial-service.ts` - Servicio de trial
19. `/src/lib/plan-limits.ts` - Lógica de límites

---

## 📂 Archivos de Documentación (Prioridad Media)

20-30. Archivos .md en raíz (AUDIT, BUGS_FOUND, etc.)
31-40. Scripts de testing (.js)

---

## 📂 Archivos de Traducción (Prioridad Alta)

41. `/src/i18n/locales/en/common.json` - Inglés
42. `/src/i18n/locales/es/common.json` - Español
43. `/src/i18n/locales/fr/common.json` - Francés

---

## 🔧 Plan de Ejecución

### Fase 1: APIs (Backend Logic)
- [ ] `/app/api/user/properties-subscription/route.ts`
- [ ] `/app/api/user/subscriptions/route.ts`
- [ ] `/app/api/pricing/calculate/route.ts`
- [ ] `/app/api/billing/plan-limits/route.ts`
- [ ] `/app/api/admin/subscription-requests/route.ts`

### Fase 2: Core Components
- [ ] `/src/components/billing/BillingOverview.tsx`
- [ ] `/src/components/plan-limits/PlanLimitsCard.tsx`
- [ ] `/src/components/billing/PropertySubscriptionStatus.tsx`
- [ ] `/src/components/billing/TrialBanner.tsx`
- [ ] `/src/components/ui/TrialCountdownBanner.tsx`

### Fase 3: Dashboard Pages
- [ ] `/app/(dashboard)/subscriptions/page.tsx`
- [ ] `/app/(dashboard)/account/billing/page.tsx`
- [ ] `/app/(dashboard)/account/plans/page.tsx`
- [ ] `/app/(dashboard)/main/page.tsx`
- [ ] `/app/(dashboard)/properties/page.tsx`

### Fase 4: Config & Services
- [ ] `/src/config/plans-static.ts`
- [ ] `/src/config/trial.ts`
- [ ] `/src/lib/trial-service.ts`
- [ ] `/src/lib/plan-limits.ts`

### Fase 5: Traducciones (i18n)
- [ ] `/src/i18n/locales/en/common.json`
- [ ] `/src/i18n/locales/es/common.json`
- [ ] `/src/i18n/locales/fr/common.json`

### Fase 6: Documentación
- [ ] Archivos .md (revisar y actualizar según sea necesario)

---

## ✅ Verificación Post-Limpieza

Después de cada fase, ejecutar:

```bash
# Verificar que no quedan referencias
grep -ri "gratuito\|gratis\|free.?plan\|primera propiedad\|STARTER\|FREE" \
  --include="*.tsx" --include="*.ts" --include="*.json" \
  app/ src/ | grep -v node_modules | grep -v .next

# Verificar compilación
npm run build

# Verificar tipos
npx tsc --noEmit
```

---

## 📝 Ejemplos de Cambios

### Ejemplo 1: API Response
**ANTES:**
```typescript
return NextResponse.json({
  message: 'Primera propiedad gratis con plan STARTER',
  plan: 'STARTER'
})
```

**DESPUÉS:**
```typescript
return NextResponse.json({
  message: 'Período de prueba de 15 días activo',
  plan: null
})
```

### Ejemplo 2: UI Component
**ANTES:**
```tsx
<p>Plan actual: Starter (gratis)</p>
```

**DESPUÉS:**
```tsx
<p>Estado: Sin plan activo</p>
<Button>Elige un plan</Button>
```

### Ejemplo 3: Traducción
**ANTES:**
```json
{
  "billing.free_plan": "Plan gratuito incluido",
  "billing.first_property_free": "Primera propiedad gratis"
}
```

**DESPUÉS:**
```json
{
  "billing.trial_active": "Período de prueba activo (15 días)",
  "billing.no_plan": "Sin plan activo"
}
```

---

## 🚨 Casos Especiales

### Trial de 15 días
- **PERMITIDO:** Mencionar "período de prueba de 15 días"
- **NO PERMITIDO:** Decir que da "propiedad gratis" o "plan gratis"
- **CORRECTO:** "15 días de prueba para evaluar la plataforma"

### Features Automáticas
- **ANTES:** "Analytics básicos incluidos gratis"
- **DESPUÉS:** "Analytics básicos automáticos en todos los planes"

### Límites
- **ANTES:** "Límite de 1 propiedad gratis, luego requiere plan"
- **DESPUÉS:** "Requiere plan activo para publicar propiedades"

---

## 📊 Progreso

- ✅ **Plan creado**
- ⏳ **Fase 1: APIs** - Pendiente
- ⏳ **Fase 2: Components** - Pendiente
- ⏳ **Fase 3: Pages** - Pendiente
- ⏳ **Fase 4: Config** - Pendiente
- ⏳ **Fase 5: i18n** - Pendiente
- ⏳ **Fase 6: Docs** - Pendiente

---

**Responsable:** Claude AI  
**Estimación:** ~2-3 horas de trabajo  
**Estado:** 📋 Plan listo para ejecución
