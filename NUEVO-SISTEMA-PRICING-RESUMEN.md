# 🎯 NUEVO SISTEMA DE PRICING - RESUMEN DE IMPLEMENTACIÓN

**Fecha:** 19/10/2025
**Estado:** 5 de 9 tareas completadas (56%)

---

## ⚠️ CAMBIOS CRÍTICOS REALIZADOS

### 🗑️ RESET DE BASE DE DATOS
**Se ha hecho un reset completo de la base de datos.** Todos los datos han sido eliminados:
- ❌ Usuarios
- ❌ Propiedades
- ❌ Suscripciones
- ❌ Planes anteriores
- ❌ Todos los demás datos

**Si había datos importantes, necesitarás restaurarlos desde un backup.**

---

## ✅ TAREAS COMPLETADAS

### 1. ✅ Schema Prisma Actualizado

**Cambios en User model:**
```typescript
subscription: String?  // Ahora nullable (antes: String @default("FREE"))

// Nuevos campos de trial (15 días)
trialStartedAt: DateTime?  // Cuándo empezó el trial
trialEndsAt: DateTime?     // Cuándo expira (15 días después)
```

**Cambios en SubscriptionPlan model:**
```typescript
code: String @unique  // BASIC, HOST, SUPERHOST, BUSINESS

priceSemestral: Decimal?   // 6 meses con -10% descuento
priceYearly: Decimal?      // 12 meses con -20% descuento (ya existía)

isVisibleInUI: Boolean     // false para BUSINESS (enterprise)
```

### 2. ✅ Planes Creados en Base de Datos

| Code | Name | Precio/mes | Max Props | Semestral | Anual | Visible UI |
|------|------|-----------|-----------|-----------|-------|------------|
| **BASIC** | Basic | €9 | 2 | €48.60 (-10%) | €86.40 (-20%) | ✅ Sí |
| **HOST** | Host | €19 | 10 | €102.60 (-10%) | €182.40 (-20%) | ✅ Sí |
| **SUPERHOST** | Superhost | €39 | 25 | €210.60 (-10%) | €374.40 (-20%) | ✅ Sí |
| **BUSINESS** | Business | €0 (a medida) | 999 | €0 | €0 | ❌ No (oculto) |

### 3. ✅ Archivo de Configuración Estática

**Creado:** `/src/config/plans-static.ts`

**Funciones principales:**
- `getPlan(code: PlanCode)` - Obtener plan por código
- `getSuggestedPlan(propertyCount: number)` - Plan sugerido según propiedades
- `calculatePrice(plan, period)` - Calcular precio según período
- `getDiscount(period)` - Obtener descuento (0%, 10%, 20%)
- `canPlanSupportProperties(plan, count)` - Validar capacidad
- `getUpgradeMessage(currentPlan, requiredProperties)` - Mensaje de upgrade

**Políticas implementadas:**
- ❌ NUNCA usar: "gratis", "gratuito", "incluida", "STARTER", "FREE"
- ✅ Sin suscripción → "Sin plan activo" + CTA "Elige un plan"
- ✅ Presets: 1 prop→BASIC, 5 prop→HOST, 20 prop→SUPERHOST
- ✅ Feature flags: `ENABLE_PRICING_V2`, `ENABLE_PRORATION`

---

## 🔄 TAREAS PENDIENTES

### 4. ⏳ Actualizar plan-limits.ts
**Objetivo:** Eliminar lógica de "primera propiedad gratis" y añadir trial de 15 días

**Cambios necesarios:**
- Eliminar líneas 61-71 (lógica "Gratuito")
- Implementar verificación de trial (trialEndsAt)
- Durante trial: acceso completo sin límites
- Post-trial: verificar suscripción activa

### 5. ⏳ Crear servicio de trial
**Archivo:** `/src/lib/trial-service.ts`

**Funciones necesarias:**
- `initializeTrial(userId)` - Crear trial al registrarse (15 días)
- `isTrialActive(user)` - Verificar si trial está activo
- `getTrialStatus(user)` - Estado del trial con días restantes
- `expireTrial(userId)` - Expirar trial automáticamente

### 6. ⏳ Actualizar pricing-calculator.ts
**Objetivo:** Usar nuevos planes de `plans-static.ts`

**Cambios necesarios:**
- Importar desde `/src/config/plans-static`
- Eliminar referencias a planes viejos
- Usar `getSuggestedPlan()` para recomendaciones

### 7. ⏳ Limpiar referencias FREE/STARTER/GRATUITO
**Archivos a revisar:**
- `/app/(dashboard)/account/billing/page.tsx`
- `/app/(dashboard)/account/plans/page.tsx`
- Todos los componentes de UI que muestren planes
- Mensajes de error/validación

**Buscar y reemplazar:**
- `"gratis"` → `"Sin plan activo"`
- `"gratuito"` → `"Sin plan activo"`
- `"FREE"` → remover
- `"STARTER"` → remover

---

## 📝 PRÓXIMOS PASOS RECOMENDADOS

### Paso 1: Completar implementación del servicio de trial
Este es crítico porque sin trial, los nuevos usuarios no podrán probar la plataforma.

### Paso 2: Actualizar plan-limits.ts
Para que la lógica de límites use el nuevo sistema de trial.

### Paso 3: Actualizar pricing-calculator.ts
Para que los cálculos usen los nuevos planes.

### Paso 4: Limpieza completa de referencias antiguas
Buscar en todo el código y eliminar referencias a FREE/STARTER/GRATUITO.

### Paso 5: Testing completo
- Registrar nuevo usuario → verificar trial de 15 días
- Durante trial → verificar acceso completo
- Post-trial sin suscripción → verificar bloqueo
- Con suscripción → verificar límites según plan

---

## 🎨 DIRECTRICES DE COPY (IMPORTANTE)

### ✅ USAR:
- "Sin plan activo"
- "Período de prueba de 15 días"
- "Elige un plan"
- "Plan Basic" / "Plan Host" / "Plan Superhost"

### ❌ NUNCA USAR:
- "gratis"
- "gratuito"
- "incluida"
- "STARTER"
- "FREE"
- "primera propiedad gratis"

---

## 🔒 FEATURE FLAGS

**Por defecto OFF:**
```bash
ENABLE_PRICING_V2=false   # /pricing-v2 devuelve 404
ENABLE_PRORATION=false    # No muestra preview de prorrateo
```

**Para activar en staging:**
```bash
ENABLE_PRICING_V2=true    # Habilita nueva página de pricing
ENABLE_PRORATION=true     # Habilita preview de prorrateo
```

---

## 📊 MIGRACIÓN DE USUARIOS EXISTENTES

**Si restauras datos de usuarios desde backup:**

1. **Actualizar campo subscription:**
   ```sql
   UPDATE users SET subscription = NULL WHERE subscription = 'FREE';
   ```

2. **Inicializar trials para usuarios sin suscripción:**
   ```sql
   UPDATE users
   SET trialStartedAt = createdAt,
       trialEndsAt = createdAt + INTERVAL '15 days'
   WHERE subscription IS NULL AND trialStartedAt IS NULL;
   ```

3. **Verificar suscripciones activas:**
   ```sql
   SELECT u.email, us.plan, us.status
   FROM users u
   LEFT JOIN "UserSubscription" us ON u.id = us."user_id" AND us.status = 'ACTIVE';
   ```

---

## ⚡ ESTADO ACTUAL DEL SISTEMA

### ✅ Funcionando:
- Schema de base de datos sincronizado
- Planes creados en DB (BASIC, HOST, SUPERHOST, BUSINESS)
- Archivo de configuración estática completo
- Políticas de pricing documentadas

### ⚠️ No Funcionando Aún:
- Sistema de trial no implementado
- plan-limits.ts todavía tiene lógica antigua
- pricing-calculator.ts no usa nuevos planes
- Referencias a FREE/STARTER en el código

### 🚨 Crítico:
- **Base de datos vacía** - necesitas restaurar usuarios si había datos importantes
- **No hay usuarios de prueba** - necesitas crear usuarios nuevos
- **Trial no automático** - necesitas implementar el servicio de trial

---

## 📞 PRÓXIMA SESIÓN

**Continuar con:**
1. Implementar `trial-service.ts`
2. Actualizar `plan-limits.ts`
3. Actualizar `pricing-calculator.ts`
4. Limpieza de referencias antiguas
5. Testing end-to-end

**Tiempo estimado:** 2-3 horas adicionales
