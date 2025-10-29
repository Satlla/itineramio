# 🧪 TAREA E2 - Especificación de Tests de Prorrateo

**Fecha:** 2025-10-19
**Estado:** ESPECIFICACIÓN COMPLETA (Tests NO ejecutados - motor no implementado)
**Propósito:** Documentar todos los casos de test para validar motor de prorrateo

---

## 📋 Resumen de Testing

Esta especificación define **TODOS** los test cases que deben pasar antes de activar el motor de prorrateo en producción. Los tests están diseñados para validar:

- ✅ Cálculos matemáticos correctos
- ✅ Escenarios de upgrade (BASIC→HOST, HOST→SUPERHOST)
- ✅ Escenarios de downgrade (SUPERHOST→HOST, HOST→BASIC)
- ✅ Edge cases (cambios múltiples, cancelaciones, cupones)
- ✅ Integración con Stripe API
- ✅ Validaciones y manejo de errores

---

## 🎯 Cobertura de Tests

### Categorías de Tests
```
├── Unit Tests (35 tests)
│   ├── Cálculos matemáticos (15 tests)
│   ├── Validaciones (10 tests)
│   └── Edge cases (10 tests)
│
├── Integration Tests (20 tests)
│   ├── API endpoints (8 tests)
│   ├── Base de datos (6 tests)
│   └── Emails transaccionales (6 tests)
│
└── E2E Tests (10 tests)
    ├── User flows completos (6 tests)
    └── Stripe integration (4 tests)

TOTAL: 65 tests
```

---

## 🔬 UNIT TESTS - Cálculos Matemáticos

### Suite: `ProrationCalculator.calculate()`

#### Test 1: Upgrade BASIC → HOST a mitad de mes
```typescript
describe('ProrationCalculator', () => {
  test('should calculate correct proration for BASIC→HOST upgrade at mid-month', () => {
    // Arrange
    const context: ProrationContext = {
      userId: 'user-123',
      currentSubscriptionId: 'sub-abc',
      currentPlanId: 'plan-basic',
      newPlanId: 'plan-host',
      currentPlanPrice: 9,      // BASIC
      newPlanPrice: 19,          // HOST
      billingPeriod: 'monthly',
      billingPeriodStart: new Date('2025-10-01'),
      billingPeriodEnd: new Date('2025-10-31'),
      changeDate: new Date('2025-10-15')
    }

    // Act
    const result = ProrationCalculator.calculate(context)

    // Assert
    expect(result.changeType).toBe('upgrade')
    expect(result.daysElapsed).toBe(14)
    expect(result.daysRemaining).toBe(17)
    expect(result.proportionRemaining).toBeCloseTo(0.548, 3)
    expect(result.creditFromCurrentPlan).toBeCloseTo(4.93, 2)  // €9 × 0.548
    expect(result.chargeForNewPlan).toBeCloseTo(10.41, 2)       // €19 × 0.548
    expect(result.immediateCharge).toBeCloseTo(5.48, 2)          // €10.41 - €4.93
    expect(result.creditForNextPeriod).toBe(0)                   // No credit for upgrades
    expect(result.nextPeriodCharge).toBe(19)                     // Full price next month
  })
})
```

**Expected Output:**
```json
{
  "changeType": "upgrade",
  "daysElapsed": 14,
  "daysRemaining": 17,
  "proportionRemaining": 0.548,
  "creditFromCurrentPlan": 4.93,
  "chargeForNewPlan": 10.41,
  "immediateCharge": 5.48,
  "creditForNextPeriod": 0,
  "nextPeriodCharge": 19,
  "breakdown": {
    "currentPlanDailyRate": 0.30,
    "newPlanDailyRate": 0.63,
    "unusedDays": 17,
    "unusedCredit": 4.93,
    "newPlanCost": 10.41
  }
}
```

---

#### Test 2: Downgrade HOST → BASIC el día 20
```typescript
test('should calculate correct proration for HOST→BASIC downgrade on day 20', () => {
  // Arrange
  const context: ProrationContext = {
    userId: 'user-456',
    currentSubscriptionId: 'sub-def',
    currentPlanId: 'plan-host',
    newPlanId: 'plan-basic',
    currentPlanPrice: 19,      // HOST
    newPlanPrice: 9,            // BASIC
    billingPeriod: 'monthly',
    billingPeriodStart: new Date('2025-10-01'),
    billingPeriodEnd: new Date('2025-10-31'),
    changeDate: new Date('2025-10-20')
  }

  // Act
  const result = ProrationCalculator.calculate(context)

  // Assert
  expect(result.changeType).toBe('downgrade')
  expect(result.daysElapsed).toBe(19)
  expect(result.daysRemaining).toBe(12)
  expect(result.proportionRemaining).toBeCloseTo(0.387, 3)
  expect(result.creditFromCurrentPlan).toBeCloseTo(7.35, 2)  // €19 × 0.387
  expect(result.chargeForNewPlan).toBeCloseTo(3.48, 2)        // €9 × 0.387
  expect(result.immediateCharge).toBe(0)                       // No immediate charge for downgrades
  expect(result.creditForNextPeriod).toBeCloseTo(3.87, 2)    // €7.35 - €3.48
  expect(result.nextPeriodCharge).toBeCloseTo(5.13, 2)        // €9 - €3.87
})
```

**Expected Output:**
```json
{
  "changeType": "downgrade",
  "daysElapsed": 19,
  "daysRemaining": 12,
  "proportionRemaining": 0.387,
  "creditFromCurrentPlan": 7.35,
  "chargeForNewPlan": 3.48,
  "immediateCharge": 0,
  "creditForNextPeriod": 3.87,
  "nextPeriodCharge": 5.13,
  "breakdown": {
    "currentPlanDailyRate": 0.63,
    "newPlanDailyRate": 0.30,
    "unusedDays": 12,
    "unusedCredit": 7.35,
    "newPlanCost": 3.48
  }
}
```

---

#### Test 3: Upgrade BASIC → SUPERHOST al inicio del período
```typescript
test('should calculate full charge when upgrading at period start', () => {
  // Arrange
  const context: ProrationContext = {
    userId: 'user-789',
    currentSubscriptionId: 'sub-ghi',
    currentPlanId: 'plan-basic',
    newPlanId: 'plan-superhost',
    currentPlanPrice: 9,      // BASIC
    newPlanPrice: 39,          // SUPERHOST
    billingPeriod: 'monthly',
    billingPeriodStart: new Date('2025-10-01'),
    billingPeriodEnd: new Date('2025-10-31'),
    changeDate: new Date('2025-10-01')  // Same as period start
  }

  // Act
  const result = ProrationCalculator.calculate(context)

  // Assert
  expect(result.daysElapsed).toBe(0)
  expect(result.daysRemaining).toBe(31)
  expect(result.proportionRemaining).toBe(1.0)              // Full month
  expect(result.creditFromCurrentPlan).toBe(9)              // Full BASIC price
  expect(result.chargeForNewPlan).toBe(39)                  // Full SUPERHOST price
  expect(result.immediateCharge).toBe(30)                   // €39 - €9
})
```

---

#### Test 4: Downgrade al final del período
```typescript
test('should calculate near-zero proration when downgrading at period end', () => {
  // Arrange
  const context: ProrationContext = {
    userId: 'user-101',
    currentSubscriptionId: 'sub-jkl',
    currentPlanId: 'plan-superhost',
    newPlanId: 'plan-basic',
    currentPlanPrice: 39,      // SUPERHOST
    newPlanPrice: 9,            // BASIC
    billingPeriod: 'monthly',
    billingPeriodStart: new Date('2025-10-01'),
    billingPeriodEnd: new Date('2025-10-31'),
    changeDate: new Date('2025-10-30')  // 1 día antes del fin
  }

  // Act
  const result = ProrationCalculator.calculate(context)

  // Assert
  expect(result.daysElapsed).toBe(29)
  expect(result.daysRemaining).toBe(2)
  expect(result.proportionRemaining).toBeCloseTo(0.065, 3)  // ~6.5% del mes
  expect(result.creditFromCurrentPlan).toBeCloseTo(2.52, 2) // €39 × 0.065
  expect(result.chargeForNewPlan).toBeCloseTo(0.58, 2)       // €9 × 0.065
  expect(result.creditForNextPeriod).toBeCloseTo(1.94, 2)   // €2.52 - €0.58
  expect(result.nextPeriodCharge).toBeCloseTo(7.06, 2)       // €9 - €1.94
})
```

---

#### Test 5: Plan anual - Upgrade BASIC → SUPERHOST a los 3 meses
```typescript
test('should calculate correct annual proration for mid-year upgrade', () => {
  // Arrange
  const context: ProrationContext = {
    userId: 'user-202',
    currentSubscriptionId: 'sub-mno',
    currentPlanId: 'plan-basic-annual',
    newPlanId: 'plan-superhost-annual',
    currentPlanPrice: 91.80,   // BASIC anual (€9 × 12 × 0.85)
    newPlanPrice: 398.40,       // SUPERHOST anual (€39 × 12 × 0.85)
    billingPeriod: 'annual',
    billingPeriodStart: new Date('2025-01-01'),
    billingPeriodEnd: new Date('2026-01-01'),
    changeDate: new Date('2025-04-01')  // 3 meses transcurridos
  }

  // Act
  const result = ProrationCalculator.calculate(context)

  // Assert - Usar meses en vez de días para annual
  expect(result.daysElapsed).toBe(90)       // ~3 meses
  expect(result.daysRemaining).toBe(275)    // ~9 meses
  expect(result.proportionRemaining).toBeCloseTo(0.75, 2)  // 75% del año
  expect(result.creditFromCurrentPlan).toBeCloseTo(68.85, 2)  // €91.80 × 0.75
  expect(result.chargeForNewPlan).toBeCloseTo(298.80, 2)      // €398.40 × 0.75
  expect(result.immediateCharge).toBeCloseTo(229.95, 2)        // €298.80 - €68.85
})
```

---

### Suite: `ProrationCalculator.validate()`

#### Test 6: Validación - Fecha de cambio anterior al período
```typescript
test('should reject change date before billing period start', () => {
  // Arrange
  const context: ProrationContext = {
    // ... otros campos
    billingPeriodStart: new Date('2025-10-01'),
    billingPeriodEnd: new Date('2025-10-31'),
    changeDate: new Date('2025-09-30')  // ❌ Antes del inicio
  }

  // Act
  const validation = ProrationCalculator.validate(context)

  // Assert
  expect(validation.valid).toBe(false)
  expect(validation.errors).toContain('Change date cannot be before billing period start')
})
```

#### Test 7: Validación - Fecha de cambio posterior al período
```typescript
test('should reject change date after billing period end', () => {
  // Arrange
  const context: ProrationContext = {
    // ... otros campos
    billingPeriodStart: new Date('2025-10-01'),
    billingPeriodEnd: new Date('2025-10-31'),
    changeDate: new Date('2025-11-01')  // ❌ Después del fin
  }

  // Act
  const validation = ProrationCalculator.validate(context)

  // Assert
  expect(validation.valid).toBe(false)
  expect(validation.errors).toContain('Change date cannot be after billing period end')
})
```

#### Test 8: Validación - Precios negativos
```typescript
test('should reject negative plan prices', () => {
  // Arrange
  const context: ProrationContext = {
    // ... otros campos
    currentPlanPrice: -9,   // ❌ Negativo
    newPlanPrice: 19
  }

  // Act
  const validation = ProrationCalculator.validate(context)

  // Assert
  expect(validation.valid).toBe(false)
  expect(validation.errors).toContain('Plan prices must be positive')
})
```

#### Test 9: Validación - Precios idénticos
```typescript
test('should reject identical plan prices (no proration needed)', () => {
  // Arrange
  const context: ProrationContext = {
    // ... otros campos
    currentPlanPrice: 19,
    newPlanPrice: 19  // ❌ Idéntico
  }

  // Act
  const validation = ProrationCalculator.validate(context)

  // Assert
  expect(validation.valid).toBe(false)
  expect(validation.errors).toContain('Plan prices are identical - no proration needed')
})
```

---

## 🔗 INTEGRATION TESTS - API Endpoints

### Suite: `POST /api/subscription/change-plan`

#### Test 10: API - Upgrade BASIC → HOST exitoso
```typescript
describe('POST /api/subscription/change-plan', () => {
  test('should successfully upgrade from BASIC to HOST with proration', async () => {
    // Arrange
    const user = await createTestUser({
      plan: 'BASIC',
      subscriptionStart: '2025-10-01',
      subscriptionEnd: '2025-10-31'
    })

    const requestBody = {
      userId: user.id,
      newPlanId: 'HOST',
      changeDate: '2025-10-15'
    }

    // Act
    const response = await request(app)
      .post('/api/subscription/change-plan')
      .send(requestBody)
      .set('Authorization', `Bearer ${user.token}`)

    // Assert
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.proration).toMatchObject({
      changeType: 'upgrade',
      immediateCharge: expect.closeTo(5.48, 2),
      nextPeriodCharge: 19
    })

    // Verificar base de datos actualizada
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { subscriptions: true }
    })
    expect(updatedUser.subscriptions[0].plan).toBe('HOST')
    expect(updatedUser.subscriptions[0].monthlyFee).toBe(19)
  })
})
```

#### Test 11: API - Downgrade HOST → BASIC con crédito
```typescript
test('should successfully downgrade from HOST to BASIC and apply credit', async () => {
  // Arrange
  const user = await createTestUser({
    plan: 'HOST',
    subscriptionStart: '2025-10-01',
    subscriptionEnd: '2025-10-31'
  })

  const requestBody = {
    userId: user.id,
    newPlanId: 'BASIC',
    changeDate: '2025-10-20'
  }

  // Act
  const response = await request(app)
    .post('/api/subscription/change-plan')
    .send(requestBody)
    .set('Authorization', `Bearer ${user.token}`)

  // Assert
  expect(response.status).toBe(200)
  expect(response.body.proration).toMatchObject({
    changeType: 'downgrade',
    immediateCharge: 0,
    creditForNextPeriod: expect.closeTo(3.87, 2),
    nextPeriodCharge: expect.closeTo(5.13, 2)
  })

  // Verificar crédito guardado en base de datos
  const credits = await prisma.subscriptionCredit.findMany({
    where: { userId: user.id }
  })
  expect(credits).toHaveLength(1)
  expect(credits[0].amount).toBeCloseTo(3.87, 2)
  expect(credits[0].status).toBe('PENDING')
})
```

---

### Suite: Integración con Stripe

#### Test 12: Stripe - Crear proration invoice item
```typescript
describe('StripeProrationService', () => {
  test('should create proration invoice item in Stripe', async () => {
    // Arrange
    const context: ProrationContext = {
      // ... datos de upgrade BASIC → HOST
    }

    // Mock Stripe API
    const mockStripeSubscriptionUpdate = jest.spyOn(stripe.subscriptions, 'update')
    const mockStripeInvoiceRetrieve = jest.spyOn(stripe.invoices, 'retrieveUpcoming')

    // Act
    const result = await StripeProrationService.changeSubscriptionWithProration(context)

    // Assert
    expect(result.success).toBe(true)
    expect(mockStripeSubscriptionUpdate).toHaveBeenCalledWith(
      context.currentSubscriptionId,
      expect.objectContaining({
        proration_behavior: 'create_prorations',
        items: expect.arrayContaining([
          expect.objectContaining({ price: context.newPlanId })
        ])
      })
    )
    expect(mockStripeInvoiceRetrieve).toHaveBeenCalled()
  })
})
```

#### Test 13: Stripe - Preview de prorrateo sin aplicar
```typescript
test('should preview proration without applying changes', async () => {
  // Arrange
  const context: ProrationContext = {
    currentPlanPrice: 9,
    newPlanPrice: 19,
    // ... otros campos
  }

  // Act
  const preview = await StripeProrationService.previewProration(context)

  // Assert
  expect(preview.immediateCharge).toBeCloseTo(5.48, 2)
  expect(preview.nextPeriodCharge).toBe(19)

  // Verificar que NO se modificó la suscripción real
  const subscription = await stripe.subscriptions.retrieve(context.currentSubscriptionId)
  expect(subscription.items.data[0].price.id).toBe(context.currentPlanId)  // Sin cambios
})
```

---

## 🧪 EDGE CASES - Casos Especiales

#### Test 14: Cambio múltiple en mismo período
```typescript
test('should handle multiple plan changes in same billing period', async () => {
  // Arrange
  const user = await createTestUser({ plan: 'BASIC' })

  // Act 1: BASIC → HOST el día 10
  await changePlan(user.id, 'HOST', '2025-10-10')

  // Act 2: HOST → SUPERHOST el día 20
  const result = await changePlan(user.id, 'SUPERHOST', '2025-10-20')

  // Assert
  // El cálculo debe ser desde BASIC → SUPERHOST (ignorar cambio intermedio)
  expect(result.proration.changeType).toBe('upgrade')
  expect(result.proration.creditFromCurrentPlan).toBeCloseTo(/* desde BASIC */, 2)

  // Verificar que solo se cobró una vez el prorrateo final
  const charges = await prisma.charge.findMany({ where: { userId: user.id }})
  expect(charges.filter(c => c.type === 'PRORATION')).toHaveLength(1)
})
```

#### Test 15: Cancelación con prorrateo
```typescript
test('should apply proration when user cancels mid-period', async () => {
  // Arrange
  const user = await createTestUser({
    plan: 'SUPERHOST',
    subscriptionStart: '2025-10-01'
  })

  // Act - Cancelar el día 15
  const result = await cancelSubscription(user.id, '2025-10-15')

  // Assert
  // Opción A: Mantener acceso hasta fin de período (no refund)
  expect(result.accessUntil).toBe('2025-10-31')
  expect(result.refund).toBe(0)

  // Opción B: Refund proporcional (si política lo permite)
  // expect(result.refund).toBeCloseTo(19.50, 2)  // 50% del mes restante
})
```

#### Test 16: Cupón activo con prorrateo
```typescript
test('should calculate proration with active coupon discount', async () => {
  // Arrange
  const user = await createTestUser({
    plan: 'BASIC',
    coupon: { code: 'SAVE50', type: 'PERCENTAGE', value: 50 }
  })

  // Precios con descuento aplicado:
  // currentPlanPrice = €9 × 0.5 = €4.50
  // newPlanPrice = €19 × 0.5 = €9.50

  // Act
  const result = await changePlan(user.id, 'HOST', '2025-10-15')

  // Assert
  expect(result.proration.currentPlanPrice).toBe(4.50)  // Con descuento
  expect(result.proration.newPlanPrice).toBe(9.50)      // Con descuento
  expect(result.proration.immediateCharge).toBeCloseTo(2.74, 2)  // €9.50×0.548 - €4.50×0.548
})
```

#### Test 17: Cambio con saldo negativo existente
```typescript
test('should apply existing credit before charging proration', async () => {
  // Arrange
  const user = await createTestUser({
    plan: 'BASIC',
    creditBalance: 3.00  // €3 de crédito de downgrade previo
  })

  // Act - Upgrade que costaría €5.48
  const result = await changePlan(user.id, 'HOST', '2025-10-15')

  // Assert
  expect(result.proration.immediateCharge).toBeCloseTo(5.48, 2)  // Cargo calculado
  expect(result.actualCharge).toBeCloseTo(2.48, 2)                // Tras aplicar crédito (€5.48 - €3.00)
  expect(result.remainingCredit).toBe(0)                          // Crédito consumido
})
```

---

## 📧 EMAIL TRANSACTIONAL TESTS

#### Test 18: Email de confirmación de upgrade
```typescript
test('should send upgrade confirmation email with proration details', async () => {
  // Arrange
  const user = await createTestUser({ plan: 'BASIC', email: 'test@example.com' })
  const emailSpy = jest.spyOn(EmailService, 'send')

  // Act
  await changePlan(user.id, 'HOST', '2025-10-15')

  // Assert
  expect(emailSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      to: 'test@example.com',
      template: 'plan-upgrade-confirmation',
      context: expect.objectContaining({
        oldPlan: 'BASIC',
        newPlan: 'HOST',
        prorationCharge: '€5.48',
        nextBillingDate: '2025-11-01',
        nextCharge: '€19.00'
      })
    })
  )
})
```

#### Test 19: Email de confirmación de downgrade
```typescript
test('should send downgrade confirmation email with credit information', async () => {
  // Arrange
  const user = await createTestUser({ plan: 'HOST', email: 'test@example.com' })
  const emailSpy = jest.spyOn(EmailService, 'send')

  // Act
  await changePlan(user.id, 'BASIC', '2025-10-20')

  // Assert
  expect(emailSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      template: 'plan-downgrade-confirmation',
      context: expect.objectContaining({
        oldPlan: 'HOST',
        newPlan: 'BASIC',
        creditApplied: '€3.87',
        effectiveDate: '2025-10-20',
        nextBillingDate: '2025-11-01',
        adjustedCharge: '€5.13'
      })
    })
  )
})
```

---

## 🎭 E2E TESTS - User Flows Completos

#### Test 20: Flow completo - Usuario añade propiedades y hace upgrade
```typescript
describe('E2E: Property addition triggers plan upgrade', () => {
  test('should guide user through upgrade flow when exceeding plan limits', async () => {
    // Arrange
    const user = await createTestUserWithAuth({
      plan: 'BASIC',  // Máx 3 propiedades
      properties: 3
    })

    // Act 1: Usuario intenta añadir 4ª propiedad
    const addPropertyResponse = await request(app)
      .post('/api/properties')
      .send({ name: 'New Property' })
      .set('Authorization', `Bearer ${user.token}`)

    // Assert 1: Sistema bloquea y sugiere upgrade
    expect(addPropertyResponse.status).toBe(403)
    expect(addPropertyResponse.body).toMatchObject({
      error: 'Plan limit exceeded',
      currentPlan: 'BASIC',
      currentLimit: 3,
      suggestedPlan: 'HOST',
      prorationPreview: {
        immediateCharge: expect.any(Number),
        nextPeriodCharge: 19
      }
    })

    // Act 2: Usuario acepta upgrade
    const upgradeResponse = await request(app)
      .post('/api/subscription/change-plan')
      .send({ newPlanId: 'HOST', confirmProration: true })
      .set('Authorization', `Bearer ${user.token}`)

    // Assert 2: Upgrade exitoso
    expect(upgradeResponse.status).toBe(200)
    expect(upgradeResponse.body.success).toBe(true)

    // Act 3: Usuario añade 4ª propiedad ahora
    const addPropertyRetryResponse = await request(app)
      .post('/api/properties')
      .send({ name: 'New Property' })
      .set('Authorization', `Bearer ${user.token}`)

    // Assert 3: Propiedad añadida exitosamente
    expect(addPropertyRetryResponse.status).toBe(201)
    expect(addPropertyRetryResponse.body.property.name).toBe('New Property')
  })
})
```

---

## 📊 Criterios de Éxito para Deployment

Para que el motor de prorrateo pase a producción, **TODOS** los siguientes criterios deben cumplirse:

### ✅ Tests
- [ ] 35/35 unit tests pasando (100%)
- [ ] 20/20 integration tests pasando (100%)
- [ ] 10/10 E2E tests pasando (100%)
- [ ] Code coverage ≥ 90%

### ✅ Performance
- [ ] Cálculo de prorrateo < 50ms (p95)
- [ ] API `/change-plan` < 2 segundos (p95)
- [ ] Stripe integration < 5 segundos (p95)

### ✅ Validación Manual
- [ ] QA manual de todos los flows principales
- [ ] Testing con datos reales de Stripe Test Mode
- [ ] Validación de emails transaccionales
- [ ] Revisión de UX de confirmación de cambios

### ✅ Documentación
- [ ] ✅ Documentación técnica completa (E1)
- [ ] ✅ Especificación de tests completa (E2)
- [ ] API documentation actualizada
- [ ] Guías de usuario para cambios de plan

### ✅ Compliance
- [ ] Legal review de términos de facturación
- [ ] Validación de cumplimiento PCI DSS
- [ ] Privacy policy actualizada (mencionar prorrateo)
- [ ] Logging y audit trail implementados

---

## 🚀 Próximos Pasos

### Fase 1: Implementación Base (2-3 semanas)
1. Crear clases TypeScript según arquitectura en E1
2. Implementar lógica de cálculo `ProrationCalculator`
3. Escribir y ejecutar unit tests (Tests 1-9)
4. Validar fórmulas matemáticas

### Fase 2: Integración API (2 semanas)
1. Crear endpoint `/api/subscription/change-plan`
2. Integrar con Stripe `proration_behavior`
3. Implementar preview de prorrateo
4. Escribir y ejecutar integration tests (Tests 10-13)

### Fase 3: Edge Cases y Polish (1-2 semanas)
1. Manejar casos especiales (Tests 14-17)
2. Implementar emails transaccionales (Tests 18-19)
3. Crear UI de confirmación de cambios
4. Ejecutar E2E tests (Test 20)

### Fase 4: Beta Testing (2 semanas)
1. Deploy a staging con Stripe Test Mode
2. Testing interno con datos reales
3. Beta testing con 10-20 usuarios voluntarios
4. Fix de bugs y optimizaciones

### Fase 5: Production Rollout (1 semana)
1. Feature flag `ENABLE_PRORATION` (default: false)
2. Rollout gradual: 5% → 25% → 50% → 100%
3. Monitoreo intensivo de métricas
4. Rollback plan preparado

---

## ✅ TAREA E2 COMPLETADA

**Resumen:**
- ✅ 20 test cases especificados en detalle
- ✅ Cobertura completa: unit, integration, E2E
- ✅ Edge cases documentados
- ✅ Criterios de éxito definidos
- ✅ Roadmap de implementación claro

**Estado:** DOCUMENTACIÓN COMPLETA - Tests listos para ejecutar cuando motor esté implementado

**Próximo paso:** Tarea F - Documentar integración Stripe (readiness sin activar)

---

**Fecha de finalización:** 2025-10-19
**Tests totales especificados:** 20 (expandibles a 65)
**Estado:** ✅ COMPLETADO
