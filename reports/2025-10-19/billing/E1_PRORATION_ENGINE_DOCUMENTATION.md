# 📊 TAREA E1 - Documentación del Motor de Prorrateo

**Fecha:** 2025-10-19
**Estado:** DOCUMENTACIÓN COMPLETA (Motor NO activado)
**Propósito:** Documentar sistema de prorrateo para cambios de plan sin implementar lógica activa

---

## 📋 ¿Qué es el Prorrateo (Proration)?

El **prorrateo** es un sistema de facturación proporcional que ajusta el cobro a los usuarios cuando cambian su plan de suscripción a mitad del período de facturación.

### Objetivo
Garantizar que los usuarios:
- Solo paguen por el servicio que efectivamente reciben
- No sean sobrecobrados al hacer upgrades
- Reciban créditos justos al hacer downgrades
- Experimenten transiciones de plan sin fricción

---

## 🎯 Casos de Uso del Prorrateo

### 1. **UPGRADE (Añadir propiedades o cambiar a plan superior)**

**Escenario:**
- Usuario tiene plan BASIC (3 propiedades, €9/mes)
- A mitad del mes (día 15 de 30) añade 2 propiedades más
- Necesita upgrade a GROWTH (5 propiedades, €19/mes)

**Sin prorrateo (problemático):**
- Usuario paga €9 el día 1
- Usuario paga €19 el día 15
- Total: €28 en un mes → **SOBRECOBRO**

**Con prorrateo (correcto):**
- Usuario paga €9 el día 1
- El día 15 se calcula el cargo proporcional:
  - Días restantes: 15/30 = 50% del mes
  - Crédito por BASIC no usado: €9 × 50% = €4.50
  - Cargo nuevo por GROWTH: €19 × 50% = €9.50
  - Cobro inmediato: €9.50 - €4.50 = **€5.00**
- Total del mes: €9 + €5 = **€14** (justo)

### 2. **DOWNGRADE (Quitar propiedades o cambiar a plan inferior)**

**Escenario:**
- Usuario tiene plan GROWTH (5 propiedades, €19/mes)
- A mitad del mes (día 15 de 30) elimina 2 propiedades
- Puede downgrade a BASIC (3 propiedades, €9/mes)

**Sin prorrateo (problemático):**
- Usuario pagó €19 el día 1
- Usuario paga €9 el próximo mes
- Pierde €10 de lo que ya pagó → **USUARIO FRUSTRADO**

**Con prorrateo (correcto):**
- Usuario pagó €19 el día 1
- El día 15 se calcula el crédito:
  - Días restantes: 15/30 = 50% del mes
  - Crédito por GROWTH no usado: €19 × 50% = €9.50
  - Costo de BASIC para días restantes: €9 × 50% = €4.50
  - Crédito aplicado al próximo período: €9.50 - €4.50 = **€4.50**
- Próxima factura: €9 - €4.50 = **€4.50** (justo)

---

## 🔢 Fórmulas Matemáticas del Prorrateo

### Variables Base
```typescript
interface ProrationContext {
  billingPeriodStart: Date       // Inicio del período actual
  billingPeriodEnd: Date         // Fin del período actual
  changeDate: Date               // Fecha del cambio de plan
  currentPlanPrice: number       // Precio del plan actual (€/mes)
  newPlanPrice: number           // Precio del nuevo plan (€/mes)
  billingPeriod: 'monthly' | 'annual'  // Tipo de período
}
```

### Fórmula 1: Días Transcurridos y Restantes
```typescript
const totalDaysInPeriod = Math.ceil(
  (billingPeriodEnd.getTime() - billingPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
)

const daysElapsed = Math.ceil(
  (changeDate.getTime() - billingPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
)

const daysRemaining = totalDaysInPeriod - daysElapsed

const proportionRemaining = daysRemaining / totalDaysInPeriod
```

### Fórmula 2: Crédito del Plan Actual (Unused Time)
```typescript
const creditFromCurrentPlan = currentPlanPrice * proportionRemaining

// Ejemplo:
// currentPlanPrice = €19
// proportionRemaining = 0.5 (mitad del mes)
// creditFromCurrentPlan = €19 × 0.5 = €9.50
```

### Fórmula 3: Costo del Nuevo Plan (Remaining Time)
```typescript
const chargeForNewPlan = newPlanPrice * proportionRemaining

// Ejemplo:
// newPlanPrice = €9
// proportionRemaining = 0.5 (mitad del mes)
// chargeForNewPlan = €9 × 0.5 = €4.50
```

### Fórmula 4: Cobro/Crédito Inmediato
```typescript
// Para UPGRADE (newPlanPrice > currentPlanPrice)
const immediateCharge = chargeForNewPlan - creditFromCurrentPlan

// Para DOWNGRADE (newPlanPrice < currentPlanPrice)
const creditForNextPeriod = creditFromCurrentPlan - chargeForNewPlan

// Ejemplo Upgrade:
// chargeForNewPlan = €9.50 (GROWTH)
// creditFromCurrentPlan = €4.50 (BASIC)
// immediateCharge = €9.50 - €4.50 = €5.00

// Ejemplo Downgrade:
// creditFromCurrentPlan = €9.50 (GROWTH)
// chargeForNewPlan = €4.50 (BASIC)
// creditForNextPeriod = €9.50 - €4.50 = €4.50
```

---

## 💡 Ejemplos Detallados

### Ejemplo 1: Upgrade BASIC → HOST a mitad de mes

**Contexto:**
- Plan actual: BASIC (€9/mes, 3 propiedades)
- Plan nuevo: HOST (€19/mes, 5 propiedades)
- Fecha de suscripción: 1 de Octubre
- Fecha de cambio: 15 de Octubre
- Próxima factura: 1 de Noviembre
- Días en el mes: 31
- Días transcurridos: 14
- Días restantes: 17

**Cálculo:**
```typescript
const totalDays = 31
const daysElapsed = 14
const daysRemaining = 17
const proportion = 17 / 31 = 0.548 (54.8%)

const creditFromBASIC = €9 × 0.548 = €4.93
const chargeForHOST = €19 × 0.548 = €10.41

const immediateCharge = €10.41 - €4.93 = €5.48
```

**Línea de tiempo de cobros:**
- **1 Oct:** Cobro de €9.00 (BASIC mensual)
- **15 Oct:** Cobro de €5.48 (prorrateo upgrade)
- **1 Nov:** Cobro de €19.00 (HOST mensual completo)

**Total primer mes:** €9.00 + €5.48 = **€14.48**
**Verificación proporcional:** (14/31 × €9) + (17/31 × €19) = €4.06 + €10.41 = **€14.47** ✅

### Ejemplo 2: Downgrade HOST → BASIC el día 20

**Contexto:**
- Plan actual: HOST (€19/mes, 5 propiedades)
- Plan nuevo: BASIC (€9/mes, 3 propiedades)
- Fecha de suscripción: 1 de Octubre
- Fecha de cambio: 20 de Octubre
- Próxima factura: 1 de Noviembre
- Días en el mes: 31
- Días transcurridos: 19
- Días restantes: 12

**Cálculo:**
```typescript
const totalDays = 31
const daysElapsed = 19
const daysRemaining = 12
const proportion = 12 / 31 = 0.387 (38.7%)

const creditFromHOST = €19 × 0.387 = €7.35
const chargeForBASIC = €9 × 0.387 = €3.48

const creditForNextPeriod = €7.35 - €3.48 = €3.87
```

**Línea de tiempo de cobros:**
- **1 Oct:** Cobro de €19.00 (HOST mensual)
- **20 Oct:** Crédito de €3.87 guardado (no cobro inmediato)
- **1 Nov:** Cobro de €9.00 - €3.87 = **€5.13** (BASIC con crédito aplicado)

**Total primer mes:** €19.00 (pagó por servicio completo)
**Total segundo mes:** €5.13 (ajuste aplicado)

### Ejemplo 3: Upgrade BASIC → SUPERHOST en plan anual

**Contexto:**
- Plan actual: BASIC anual (€9 × 12 × 0.85 = €91.80/año, 3 propiedades)
- Plan nuevo: SUPERHOST anual (€39 × 12 × 0.85 = €398.40/año, 15 propiedades)
- Fecha de suscripción: 1 de Enero
- Fecha de cambio: 1 de Abril (3 meses transcurridos)
- Próxima factura: 1 de Enero (próximo año)
- Meses transcurridos: 3
- Meses restantes: 9

**Cálculo:**
```typescript
const totalMonths = 12
const monthsElapsed = 3
const monthsRemaining = 9
const proportion = 9 / 12 = 0.75 (75%)

const creditFromBASIC = €91.80 × 0.75 = €68.85
const chargeForSUPERHOST = €398.40 × 0.75 = €298.80

const immediateCharge = €298.80 - €68.85 = €229.95
```

**Línea de tiempo de cobros:**
- **1 Ene:** Cobro de €91.80 (BASIC anual)
- **1 Abr:** Cobro de €229.95 (prorrateo upgrade)
- **1 Ene (próximo año):** Cobro de €398.40 (SUPERHOST anual completo)

**Total primer año:** €91.80 + €229.95 = **€321.75**
**Verificación proporcional:** (3/12 × €91.80) + (9/12 × €398.40) = €22.95 + €298.80 = **€321.75** ✅

---

## 🏗️ Arquitectura del Motor de Prorrateo

### Estructura de Archivos (a crear)

```
/src/lib/billing/
├── proration-calculator.ts    # Motor de cálculo principal
├── proration-types.ts         # Tipos TypeScript
├── proration-validator.ts     # Validaciones
└── proration-stripe.ts        # Integración con Stripe API

/tests/proration/
├── proration-calculator.test.ts
├── upgrade-scenarios.test.ts
└── downgrade-scenarios.test.ts
```

### Tipos TypeScript

```typescript
// src/lib/billing/proration-types.ts

export type BillingPeriod = 'monthly' | 'annual'
export type ChangeType = 'upgrade' | 'downgrade'

export interface ProrationContext {
  userId: string
  currentSubscriptionId: string
  currentPlanId: string
  newPlanId: string
  currentPlanPrice: number
  newPlanPrice: number
  billingPeriod: BillingPeriod
  billingPeriodStart: Date
  billingPeriodEnd: Date
  changeDate: Date
}

export interface ProrationCalculation {
  changeType: ChangeType
  daysElapsed: number
  daysRemaining: number
  proportionRemaining: number
  creditFromCurrentPlan: number
  chargeForNewPlan: number
  immediateCharge: number          // > 0 para upgrades
  creditForNextPeriod: number      // > 0 para downgrades
  nextPeriodCharge: number         // Precio con crédito aplicado
  breakdown: {
    currentPlanDailyRate: number
    newPlanDailyRate: number
    unusedDays: number
    unusedCredit: number
    newPlanCost: number
  }
}

export interface ProrationResult {
  success: boolean
  calculation: ProrationCalculation | null
  error: string | null
  stripeInvoiceItemId: string | null  // Si se procesó con Stripe
}
```

### Motor de Cálculo

```typescript
// src/lib/billing/proration-calculator.ts

import { ProrationContext, ProrationCalculation, ChangeType } from './proration-types'

export class ProrationCalculator {
  /**
   * Calcula el prorrateo para un cambio de plan
   *
   * @param context - Contexto del cambio de plan
   * @returns Cálculo completo del prorrateo
   */
  static calculate(context: ProrationContext): ProrationCalculation {
    // 1. Calcular días transcurridos y restantes
    const { daysElapsed, daysRemaining, proportionRemaining } =
      this.calculateTimeProportions(context)

    // 2. Determinar tipo de cambio
    const changeType: ChangeType =
      context.newPlanPrice > context.currentPlanPrice ? 'upgrade' : 'downgrade'

    // 3. Calcular créditos y cargos
    const creditFromCurrentPlan = context.currentPlanPrice * proportionRemaining
    const chargeForNewPlan = context.newPlanPrice * proportionRemaining

    // 4. Calcular cargo/crédito inmediato
    let immediateCharge = 0
    let creditForNextPeriod = 0

    if (changeType === 'upgrade') {
      immediateCharge = chargeForNewPlan - creditFromCurrentPlan
    } else {
      creditForNextPeriod = creditFromCurrentPlan - chargeForNewPlan
    }

    // 5. Calcular próxima factura
    const nextPeriodCharge = Math.max(0, context.newPlanPrice - creditForNextPeriod)

    // 6. Breakdown detallado
    const breakdown = {
      currentPlanDailyRate: context.currentPlanPrice / this.getDaysInPeriod(context.billingPeriod),
      newPlanDailyRate: context.newPlanPrice / this.getDaysInPeriod(context.billingPeriod),
      unusedDays: daysRemaining,
      unusedCredit: creditFromCurrentPlan,
      newPlanCost: chargeForNewPlan
    }

    return {
      changeType,
      daysElapsed,
      daysRemaining,
      proportionRemaining,
      creditFromCurrentPlan,
      chargeForNewPlan,
      immediateCharge,
      creditForNextPeriod,
      nextPeriodCharge,
      breakdown
    }
  }

  /**
   * Calcula proporciones de tiempo
   */
  private static calculateTimeProportions(context: ProrationContext) {
    const ONE_DAY_MS = 1000 * 60 * 60 * 24

    const totalDays = Math.ceil(
      (context.billingPeriodEnd.getTime() - context.billingPeriodStart.getTime()) / ONE_DAY_MS
    )

    const daysElapsed = Math.ceil(
      (context.changeDate.getTime() - context.billingPeriodStart.getTime()) / ONE_DAY_MS
    )

    const daysRemaining = Math.max(0, totalDays - daysElapsed)

    const proportionRemaining = daysRemaining / totalDays

    return {
      totalDays,
      daysElapsed,
      daysRemaining,
      proportionRemaining
    }
  }

  /**
   * Obtiene días en período según tipo
   */
  private static getDaysInPeriod(period: BillingPeriod): number {
    return period === 'monthly' ? 30 : 365
  }

  /**
   * Valida que el contexto sea válido
   */
  static validate(context: ProrationContext): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (context.changeDate < context.billingPeriodStart) {
      errors.push('Change date cannot be before billing period start')
    }

    if (context.changeDate > context.billingPeriodEnd) {
      errors.push('Change date cannot be after billing period end')
    }

    if (context.currentPlanPrice < 0 || context.newPlanPrice < 0) {
      errors.push('Plan prices must be positive')
    }

    if (context.currentPlanPrice === context.newPlanPrice) {
      errors.push('Plan prices are identical - no proration needed')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}
```

---

## 🔗 Integración con Stripe

### Método de Prorrateo en Stripe

Stripe tiene soporte nativo para prorrateo automático:

```typescript
// src/lib/billing/proration-stripe.ts

import Stripe from 'stripe'
import { ProrationContext, ProrationResult } from './proration-types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export class StripeProrationService {
  /**
   * Cambia la suscripción con prorrateo automático de Stripe
   *
   * Stripe calcula automáticamente:
   * - Crédito del tiempo no usado del plan actual
   * - Cargo del nuevo plan por el tiempo restante
   * - Genera invoice item con el ajuste
   */
  static async changeSubscriptionWithProration(
    context: ProrationContext
  ): Promise<ProrationResult> {
    try {
      // 1. Obtener suscripción actual de Stripe
      const subscription = await stripe.subscriptions.retrieve(
        context.currentSubscriptionId
      )

      // 2. Actualizar suscripción con proration_behavior
      const updatedSubscription = await stripe.subscriptions.update(
        context.currentSubscriptionId,
        {
          items: [{
            id: subscription.items.data[0].id,
            price: context.newPlanId,  // Stripe Price ID del nuevo plan
          }],
          proration_behavior: 'create_prorations',  // Clave para activar prorrateo
          proration_date: Math.floor(context.changeDate.getTime() / 1000),
        }
      )

      // 3. Stripe genera automáticamente:
      // - Invoice item de crédito (negativo) por tiempo no usado
      // - Invoice item de cargo (positivo) por nuevo plan
      // - El balance se refleja en la próxima factura

      // 4. Obtener invoice items generados
      const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
        customer: subscription.customer as string,
      })

      const prorationItems = upcomingInvoice.lines.data.filter(
        item => item.proration === true
      )

      // 5. Calcular total de prorrateo
      const totalProration = prorationItems.reduce(
        (sum, item) => sum + item.amount,
        0
      ) / 100  // Stripe usa centavos

      return {
        success: true,
        calculation: null,  // Stripe maneja el cálculo internamente
        error: null,
        stripeInvoiceItemId: prorationItems[0]?.id || null
      }

    } catch (error) {
      return {
        success: false,
        calculation: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        stripeInvoiceItemId: null
      }
    }
  }

  /**
   * Preview del prorrateo SIN aplicar cambios
   *
   * Útil para mostrar al usuario cuánto pagará antes de confirmar
   */
  static async previewProration(
    context: ProrationContext
  ): Promise<{ immediateCharge: number; nextPeriodCharge: number }> {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        context.currentSubscriptionId
      )

      // Simular cambio sin aplicarlo (usando preview)
      const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
        customer: subscription.customer as string,
        subscription: context.currentSubscriptionId,
        subscription_items: [{
          id: subscription.items.data[0].id,
          price: context.newPlanId,
        }],
        subscription_proration_date: Math.floor(context.changeDate.getTime() / 1000),
      })

      const immediateCharge = upcomingInvoice.amount_due / 100
      const nextPeriodCharge = context.newPlanPrice

      return {
        immediateCharge,
        nextPeriodCharge
      }

    } catch (error) {
      throw new Error(`Failed to preview proration: ${error}`)
    }
  }
}
```

---

## 🚨 Consideraciones Importantes

### 1. **Timing del Cambio**
- **Inmediato vs Al Final del Período:**
  - **Upgrade:** Aplicar inmediatamente (usuario necesita acceso ahora)
  - **Downgrade:** Opción de aplicar al final del período (para minimizar fricción)

### 2. **Comunicación al Usuario**
```typescript
// Email template para upgrade
const upgradeEmailTemplate = `
Hola {{userName}},

Tu plan ha sido actualizado:
- Plan anterior: {{oldPlan}} ({{oldPrice}}€/mes)
- Plan nuevo: {{newPlan}} ({{newPrice}}€/mes)
- Cargo inmediato: {{prorationCharge}}€

Este cargo corresponde al tiempo restante de tu período de facturación.

Próxima factura: {{nextBillingDate}} por {{newPrice}}€

¡Gracias por confiar en nosotros!
`

// Email template para downgrade
const downgradeEmailTemplate = `
Hola {{userName}},

Tu plan será actualizado al finalizar el período actual:
- Plan actual: {{oldPlan}} ({{oldPrice}}€/mes) - Válido hasta {{currentPeriodEnd}}
- Plan nuevo: {{newPlan}} ({{newPrice}}€/mes) - Efectivo desde {{nextPeriodStart}}
- Crédito aplicado: {{prorationCredit}}€

Próxima factura: {{nextBillingDate}} por {{adjustedPrice}}€

Puedes revertir este cambio antes de {{currentPeriodEnd}}.
`
```

### 3. **Casos Especiales**

#### **Cambio múltiple en mismo período**
```typescript
// Usuario hace BASIC → HOST → SUPERHOST en mismo mes
// Solución: Solo prorratear desde BASIC → SUPERHOST (ignorar cambio intermedio)
```

#### **Cancelación con prorrateo**
```typescript
// Usuario cancela a mitad de mes
// Opciones:
// A) No hacer prorrateo (usuario mantiene acceso hasta fin de período)
// B) Hacer prorrateo y dar refund (más complejo pero más justo)
```

#### **Cupones y descuentos con prorrateo**
```typescript
// Si usuario tiene cupón del 50% aplicado:
// currentPlanPrice = €9 × 0.5 = €4.50 (precio con descuento)
// newPlanPrice = €19 × 0.5 = €9.50 (precio con descuento)
// Prorrateo se calcula sobre precios con descuento
```

---

## ✅ Estado de Implementación

### ❌ NO ACTIVADO
El motor de prorrateo está **documentado pero NO implementado activamente** en el sistema. Razones:

1. **Sistema de pagos manual aún activo** - Usuarios pagan por Bizum/transferencia
2. **Stripe no integrado todavía** - Prorrateo requiere Stripe Subscriptions API
3. **Requiere más testing** - Casos extremos y edge cases no probados aún
4. **UX no definida** - Flujo de usuario para cambios de plan no diseñado

### ✅ READY FOR IMPLEMENTATION
Cuando esté listo, los pasos serán:

1. **Implementar tipos y clases** según arquitectura documentada
2. **Integrar con Stripe API** usando `proration_behavior: 'create_prorations'`
3. **Crear tests E2E** para todos los escenarios documentados
4. **Diseñar UI de confirmación** mostrando preview de prorrateo
5. **Implementar emails transaccionales** para notificar cambios
6. **Activar gradualmente** con feature flag (similar a PRICING_V2)

---

## 📚 Referencias y Recursos

### Documentación Stripe
- [Subscription Proration](https://stripe.com/docs/billing/subscriptions/prorations)
- [Upgrade/Downgrade Best Practices](https://stripe.com/docs/billing/subscriptions/upgrade-downgrade)
- [Preview Invoice](https://stripe.com/docs/api/invoices/upcoming)

### Mejores Prácticas
- Siempre mostrar preview antes de aplicar cambio
- Comunicar claramente timing (inmediato vs fin de período)
- Guardar audit log de todos los cambios de plan
- Permitir revertir cambios (grace period de 24-48h)

---

**Estado Final:**
✅ **TAREA E1 COMPLETADA** - Motor de prorrateo completamente documentado, listo para implementación cuando Stripe esté integrado.

**Próximo paso:** Tarea E2 - Crear tests de prorrateo para validar lógica.
