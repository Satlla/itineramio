# Cambios de Schema: Sistema de Módulos y BillingUnit

## Resumen

Este documento describe los cambios necesarios en el schema de Prisma para:
1. Sistema de módulos independientes (MANUALES y GESTION)
2. Trials separados por módulo
3. BillingUnit como entidad central de Gestión (separada de Property)

---

## 1. Enum ModuleType (actualizar)

```prisma
// ANTES
enum ModuleType {
  MANUALES
  GESTION      // @deprecated - usar FACTURAMIO
  FACTURAMIO   // Nuevo nombre para el módulo de facturación
}

// DESPUÉS
enum ModuleType {
  MANUALES     // Manuales digitales, QR, zonas
  GESTION      // Gestión económica: facturación, reservas, propietarios
}
```

**Nota**: Eliminamos FACTURAMIO. El módulo se llama GESTION en código, "Gestión" en UI.

---

## 2. Nuevo Enum ModuleStatus

```prisma
enum ModuleStatus {
  INACTIVE    // No activado, no trial
  TRIAL       // En período de prueba (15 días)
  ACTIVE      // Pagado y activo
  LOCKED      // Trial expirado sin pagar
}
```

---

## 3. UserModule (actualizar)

```prisma
model UserModule {
  id                   String       @id @default(cuid())
  userId               String
  moduleType           ModuleType

  // Estado del módulo
  status               ModuleStatus @default(INACTIVE)

  // Trial (empieza cuando el usuario activa, no al registrarse)
  trialStartedAt       DateTime?    // Cuándo activó el trial
  trialEndsAt          DateTime?    // Cuándo expira (15 días después)

  // Suscripción de pago
  activatedAt          DateTime?    // Cuándo empezó a pagar
  canceledAt           DateTime?
  expiresAt            DateTime?    // Cuándo expira la suscripción
  stripeSubscriptionId String?      @unique

  // Solo para MANUALES (planes con límite de propiedades)
  subscriptionPlanId   String?

  createdAt            DateTime     @default(now())
  updatedAt            DateTime     @updatedAt

  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscriptionPlan SubscriptionPlan? @relation(fields: [subscriptionPlanId], references: [id])

  @@unique([userId, moduleType])
  @@index([userId, status])
  @@map("user_modules")
}
```

---

## 4. Nueva Entidad: BillingUnit

Entidad central de Gestión. Puede existir:
- **Vinculada a Property**: hereda nombre/ciudad/imagen del manual
- **Independiente**: tiene sus propios datos (apartamento solo para facturación)

```prisma
// Unidad de facturación (apartamento en Gestión)
// Puede estar vinculada a una Property de Manuales o ser independiente
model BillingUnit {
  id         String  @id @default(cuid())
  userId     String  // Usuario gestor

  // Link opcional a Property de Manuales
  propertyId String? @unique

  // Datos propios (usados si no hay propertyId)
  name         String?  // Nombre del apartamento
  city         String?  // Ciudad
  profileImage String?  // Imagen

  // Propietario
  ownerId    String?

  // Nombres en plataformas (para matching de reservas)
  airbnbNames  String[] @default([])
  bookingNames String[] @default([])
  vrboNames    String[] @default([])

  // Configuración de ingresos
  incomeReceiver IncomeReceiver @default(OWNER)

  // Comisión de gestión
  commissionType  CommissionType @default(PERCENTAGE)
  commissionValue Decimal        @default(0)
  commissionVat   Decimal        @default(21)

  // Limpieza
  cleaningType         CleaningType         @default(FIXED_PER_RESERVATION)
  cleaningValue        Decimal              @default(0)
  cleaningVatIncluded  Boolean              @default(true)
  cleaningFeeRecipient CleaningFeeRecipient @default(MANAGER)
  cleaningFeeSplitPct  Decimal?

  // Cargo fijo mensual
  monthlyFee        Decimal @default(0)
  monthlyFeeVat     Decimal @default(21)
  monthlyFeeConcept String?

  // Fiscalidad por defecto
  defaultVatRate       Decimal @default(21)
  defaultRetentionRate Decimal @default(0)

  // Preferencias de factura
  invoiceDetailLevel InvoiceDetailLevel @default(DETAILED)
  singleConceptText  String?

  // iCal sync
  icalUrl      String?
  lastIcalSync DateTime?

  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relaciones
  user         User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  property     Property?         @relation(fields: [propertyId], references: [id])
  owner        PropertyOwner?    @relation(fields: [ownerId], references: [id])
  reservations Reservation[]
  expenses     PropertyExpense[]

  @@index([userId])
  @@index([ownerId])
  @@map("billing_units")
}
```

---

## 5. Actualizar User (añadir relación)

```prisma
model User {
  // ... campos existentes ...

  // Añadir:
  billingUnits BillingUnit[]
}
```

---

## 6. Actualizar Reservation

```prisma
model Reservation {
  // ANTES
  billingConfigId String
  billingConfig   PropertyBillingConfig @relation(...)

  // DESPUÉS
  billingUnitId   String
  billingUnit     BillingUnit @relation(fields: [billingUnitId], references: [id])

  // Mantener billingConfigId temporalmente para migración (nullable)
  billingConfigId String? // @deprecated
}
```

---

## 7. Actualizar PropertyExpense

```prisma
model PropertyExpense {
  // ANTES
  billingConfigId String
  billingConfig   PropertyBillingConfig @relation(...)

  // DESPUÉS
  billingUnitId   String
  billingUnit     BillingUnit @relation(fields: [billingUnitId], references: [id])

  // Mantener billingConfigId temporalmente
  billingConfigId String? // @deprecated
}
```

---

## 8. Actualizar ClientInvoice

```prisma
model ClientInvoice {
  // ANTES
  propertyId String?

  // DESPUÉS (añadir)
  billingUnitId String?
  billingUnit   BillingUnit? @relation(fields: [billingUnitId], references: [id])
}
```

---

## 9. PropertyBillingConfig (deprecar)

Mantener la tabla por compatibilidad pero marcar como deprecated:

```prisma
// @deprecated - Usar BillingUnit en su lugar
// Esta tabla se mantiene temporalmente para migración
model PropertyBillingConfig {
  // ... sin cambios, pero añadir comentario de deprecated
}
```

---

## Migración de Datos

### Paso 1: Crear BillingUnit desde PropertyBillingConfig

```sql
INSERT INTO billing_units (
  id, user_id, property_id, owner_id,
  airbnb_names, booking_names, vrbo_names,
  income_receiver, commission_type, commission_value, commission_vat,
  cleaning_type, cleaning_value, cleaning_vat_included,
  cleaning_fee_recipient, cleaning_fee_split_pct,
  monthly_fee, monthly_fee_vat, monthly_fee_concept,
  default_vat_rate, default_retention_rate,
  invoice_detail_level, single_concept_text,
  ical_url, last_ical_sync,
  is_active, created_at, updated_at
)
SELECT
  pbc.id, -- Usar mismo ID para facilitar migración
  p.host_id,
  pbc.property_id,
  pbc.owner_id,
  pbc.airbnb_names,
  pbc.booking_names,
  pbc.vrbo_names,
  pbc.income_receiver,
  pbc.commission_type,
  pbc.commission_value,
  pbc.commission_vat,
  pbc.cleaning_type,
  pbc.cleaning_value,
  pbc.cleaning_vat_included,
  pbc.cleaning_fee_recipient,
  pbc.cleaning_fee_split_pct,
  pbc.monthly_fee,
  pbc.monthly_fee_vat,
  pbc.monthly_fee_concept,
  pbc.default_vat_rate,
  pbc.default_retention_rate,
  pbc.invoice_detail_level,
  pbc.single_concept_text,
  pbc.ical_url,
  pbc.last_ical_sync,
  pbc.is_active,
  pbc.created_at,
  pbc.updated_at
FROM property_billing_configs pbc
JOIN properties p ON p.id = pbc.property_id;
```

### Paso 2: Actualizar Reservation

```sql
-- Añadir columna
ALTER TABLE reservations ADD COLUMN billing_unit_id TEXT;

-- Copiar datos (billingConfigId = billingUnitId porque usamos mismo ID)
UPDATE reservations SET billing_unit_id = billing_config_id;

-- Crear FK
ALTER TABLE reservations
ADD CONSTRAINT fk_reservation_billing_unit
FOREIGN KEY (billing_unit_id) REFERENCES billing_units(id);
```

### Paso 3: Actualizar PropertyExpense

```sql
ALTER TABLE property_expenses ADD COLUMN billing_unit_id TEXT;
UPDATE property_expenses SET billing_unit_id = billing_config_id;
ALTER TABLE property_expenses
ADD CONSTRAINT fk_expense_billing_unit
FOREIGN KEY (billing_unit_id) REFERENCES billing_units(id);
```

### Paso 4: Migrar UserModule a nuevos estados

```sql
-- Usuarios con trial activo de Manuales (legacy)
UPDATE user_modules
SET status = 'TRIAL',
    trial_started_at = u.trial_started_at,
    trial_ends_at = u.trial_ends_at
FROM users u
WHERE user_modules.user_id = u.id
AND user_modules.module_type = 'MANUALES'
AND u.trial_ends_at > NOW()
AND user_modules.status != 'ACTIVE';

-- Usuarios con suscripción activa
UPDATE user_modules
SET status = 'ACTIVE'
WHERE stripe_subscription_id IS NOT NULL
AND status = 'TRIAL';
```

---

## Lógica de Acceso (requireModule)

### Para Manuales (rutas públicas)

```typescript
async function requireModuleManuales(hostId: string): Promise<boolean> {
  const module = await prisma.userModule.findUnique({
    where: { userId_moduleType: { userId: hostId, moduleType: 'MANUALES' } }
  })

  // Activo si: TRIAL (no expirado) o ACTIVE
  if (!module) return false
  if (module.status === 'ACTIVE') return true
  if (module.status === 'TRIAL' && module.trialEndsAt && module.trialEndsAt > new Date()) {
    return true
  }
  return false
}
```

### Para Gestión (crear/importar)

```typescript
async function requireModuleGestion(userId: string): Promise<boolean> {
  const module = await prisma.userModule.findUnique({
    where: { userId_moduleType: { userId, moduleType: 'GESTION' } }
  })

  if (!module) return false
  if (module.status === 'ACTIVE') return true
  if (module.status === 'TRIAL' && module.trialEndsAt && module.trialEndsAt > new Date()) {
    return true
  }
  return false
}
```

---

## Nombres de Apartamento (lógica de display)

```typescript
function getBillingUnitDisplayName(unit: BillingUnit & { property?: Property }): string {
  // Si tiene Property vinculada, usar nombre de Property
  if (unit.property) {
    return unit.property.name
  }
  // Si no, usar nombre propio
  return unit.name || 'Sin nombre'
}
```

---

## Checklist de Implementación

- [ ] Actualizar schema.prisma con cambios
- [ ] Generar migración de Prisma
- [ ] Ejecutar script de migración de datos
- [ ] Actualizar APIs de Gestión para usar BillingUnit
- [ ] Actualizar componentes UI
- [ ] Implementar requireModule para rutas públicas
- [ ] Actualizar onboarding text: "Itineramio Gestión"
- [ ] Cambiar navbar: "Facturamio" → "Gestión"
- [ ] Tests
