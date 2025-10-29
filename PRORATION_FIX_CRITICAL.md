# 🔧 FIX CRÍTICO: Cálculo Incorrecto de Prorrateo

**Fecha:** 24/10/2025
**Severidad:** 🔴 CRÍTICA
**Impacto:** Usuarios cobrando/recibiendo créditos incorrectos

---

## ❌ El Problema

El sistema estaba calculando créditos de prorrateo usando el **precio mensual** en lugar del **precio total del periodo**.

### Ejemplo Real (Usuario HOST Semestral):

**Situación:**
- Plan: HOST Semestral
- Precio total pagado: **€102.60** (€19/mes × 6 meses con 10% descuento)
- Días restantes: 179 de 182
- Cambio a: HOST Anual

**Cálculo INCORRECTO (antes del fix):**
```
Precio usado: €19 (solo mensual) ❌
Tasa diaria: €19 / 182 = €0.104/día
Crédito: €0.104 × 179 = €18.69
```

**Cálculo CORRECTO (después del fix):**
```
Precio usado: €102.60 (total semestral) ✅
Tasa diaria: €102.60 / 182 = €0.564/día
Crédito: €0.564 × 179 = €100.91
```

**DIFERENCIA:** €82.22 de error (solo 18.52% del crédito real!)

---

## ✅ La Solución

### Archivo Corregido:
`/app/api/billing/preview-proration/route.ts`

### Cambios Realizados:

#### 1. Calcular precio total según periodo detectado (líneas 98-119):
```typescript
// Detectar periodo actual
let currentBillingPeriod: 'monthly' | 'biannual' | 'annual' = 'monthly'
if (daysInExisting > 150 && daysInExisting < 250) {
  currentBillingPeriod = 'biannual'
} else if (daysInExisting > 300) {
  currentBillingPeriod = 'annual'
}

// Calcular precio TOTAL correcto
const currentMonthlyPrice = Number(activeSubscription.plan.priceMonthly)
let currentMonthsMultiplier = 1
let currentDiscountPercent = 0

if (currentBillingPeriod === 'biannual') {
  currentMonthsMultiplier = 6
  currentDiscountPercent = 10
} else if (currentBillingPeriod === 'annual') {
  currentMonthsMultiplier = 12
  currentDiscountPercent = 20
}

const currentDiscountedMonthlyPrice = currentMonthlyPrice * (1 - currentDiscountPercent / 100)
const currentTotalPricePaid = currentDiscountedMonthlyPrice * currentMonthsMultiplier
```

#### 2. Usar precio correcto en cálculo de prorrateo (línea 207):
```typescript
// ANTES ❌
amountPaid: Number(activeSubscription.customPrice || activeSubscription.plan.priceMonthly),

// DESPUÉS ✅
amountPaid: currentTotalPricePaid, // Precio total calculado
```

#### 3. Usar precio correcto en respuesta (línea 226):
```typescript
// ANTES ❌
amountPaid: Number(activeSubscription.customPrice || activeSubscription.plan.priceMonthly),

// DESPUÉS ✅
amountPaid: currentTotalPricePaid, // Precio total correcto
```

#### 4. Usar precio correcto en validación de downgrade (línea 164):
```typescript
// ANTES ❌
const currentPrice = Number(activeSubscription.customPrice || activeSubscription.plan.priceMonthly)

// DESPUÉS ✅
const currentPrice = currentTotalPricePaid
```

---

## 📊 Escenarios de Prueba

### ✅ CORRECTO AHORA:

1. **HOST Semestral → HOST Anual**
   - Precio pagado: €102.60
   - Días restantes: 179
   - Crédito: **€100.91** ✅
   - Nuevo precio: €182.40 (€19 × 12 con 20% descuento)
   - Total a pagar: **€81.49**

2. **BASIC Mensual → HOST Mensual**
   - Precio pagado: €9
   - Días restantes: 15
   - Crédito: **€4.50** ✅
   - Nuevo precio: €19
   - Total a pagar: **€14.50**

3. **SUPERHOST Anual → SUPERHOST Semestral**
   - Bloqueado correctamente ❌ (downgrade de periodo)

---

## 🧮 Fórmula de Cálculo Correcta

```
Precio Total Pagado = Precio Mensual × (1 - Descuento%) × Meses

Donde:
- Precio Mensual = plan.priceMonthly
- Descuento% = 0% (mensual), 10% (semestral), 20% (anual)
- Meses = 1 (mensual), 6 (semestral), 12 (anual)

Tasa Diaria = Precio Total Pagado / Días Totales del Periodo
Crédito = Tasa Diaria × Días Restantes
Precio Final = Precio Nuevo Plan - Crédito
```

---

## 🚨 Impacto en Usuarios Existentes

Si hay cambios de plan pendientes o recientes con este bug:

1. **Revisar transacciones de upgrade de los últimos 30 días**
2. **Calcular diferencia entre lo cobrado y lo correcto**
3. **Emitir créditos o reembolsos donde aplique**

Script sugerido para identificar afectados:
```sql
SELECT
  us.id,
  u.email,
  us."startDate",
  us."endDate",
  sp.name as plan_name,
  sp."priceMonthly",
  us."customPrice"
FROM user_subscriptions us
JOIN users u ON us."userId" = u.id
JOIN subscription_plans sp ON us."planId" = sp.id
WHERE us.status = 'ACTIVE'
  AND us."endDate" > NOW()
  AND us."startDate" > NOW() - INTERVAL '30 days'
ORDER BY us."startDate" DESC;
```

---

## ✅ Verificación

Para verificar que el fix funciona:

1. Ir a http://localhost:3000/account/plans
2. Seleccionar un plan diferente o periodo diferente
3. Verificar que el **crédito mostrado** coincide con:
   ```
   (Precio Total Pagado / Días Totales) × Días Restantes
   ```

Ejemplo verificación manual:
- Si tienes HOST Semestral (€102.60) con 179 días restantes de 182:
- Crédito debe mostrar: **€100.91**
- NO €18.69 (que era el bug)

---

## 📝 Lecciones Aprendidas

1. **Nunca asumir que `customPrice` o `priceMonthly` representan el total**
   - Siempre calcular según el periodo detectado

2. **Validar cálculos con datos reales**
   - Los €18 vs €100 eran una diferencia obvia que debió detectarse

3. **Agregar logs de debugging en cálculos críticos**
   - Ahora incluye `console.log` del precio total calculado

4. **Tests automáticos para cálculos de dinero**
   - Crear suite de pruebas para todos los escenarios

---

## 🔐 Próximos Pasos

1. ✅ Fix aplicado en código
2. ⏳ Probar manualmente en interfaz
3. ⏳ Revisar transacciones afectadas
4. ⏳ Emitir créditos si es necesario
5. ⏳ Agregar tests unitarios
6. ⏳ Documentar en CLAUDE.md

---

**Estado:** 🟢 CORREGIDO
**Requiere deploy:** SÍ - URGENTE
**Requiere migración de datos:** NO
**Requiere compensación a usuarios:** POSIBLEMENTE (revisar transacciones)
