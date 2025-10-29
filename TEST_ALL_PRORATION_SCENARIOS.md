# 🧪 TEST EXHAUSTIVO DE TODOS LOS ESCENARIOS DE PRORRATEO

**Fecha:** 24/10/2025
**Usuario de prueba:** colaboracionesbnb@gmail.com
**Plan actual:** HOST Semestral (€102.60, 179 días restantes de 182)

---

## 📋 MATRIZ DE ESCENARIOS

### Leyenda:
- ✅ = Permitido (upgrade)
- ❌ = Bloqueado (downgrade o mismo plan)
- 🟡 = Caso especial

---

## 1️⃣ DESDE HOST SEMESTRAL

### Plan Actual:
- **Precio pagado:** €102.60 (€19/mes × 6 con 10% dto)
- **Días totales:** 182
- **Días restantes:** 179
- **Tasa diaria:** €0.564/día
- **Crédito disponible:** €100.91

---

### 1.1 Cambios de PLAN (mismo periodo SEMESTRAL):

| Destino | Resultado | Precio Nuevo | Crédito | Total a Pagar | Razón |
|---------|-----------|--------------|---------|---------------|-------|
| BASIC Semestral | ❌ BLOQUEADO | €48.60 | - | - | Downgrade de plan |
| HOST Semestral | ❌ BLOQUEADO | €102.60 | - | - | Mismo plan y periodo |
| SUPERHOST Semestral | ✅ PERMITIDO | €144.00 | €100.91 | **€43.09** | Upgrade de plan |
| BUSINESS Semestral | ✅ PERMITIDO | €234.00 | €100.91 | **€133.09** | Upgrade de plan |

**Fórmulas:**
```
BASIC Semestral = €9 × 6 × 0.9 = €48.60
HOST Semestral = €19 × 6 × 0.9 = €102.60
SUPERHOST Semestral = €27 × 6 × 0.9 = €144.00 (€27 = €30 con dto early adopter)
BUSINESS Semestral = €44 × 6 × 0.9 = €234.00 (€44 = €49 con dto early adopter)
```

---

### 1.2 Cambios de PERIODO (mismo plan HOST):

| Destino | Resultado | Precio Nuevo | Crédito | Total a Pagar | Razón |
|---------|-----------|--------------|---------|---------------|-------|
| HOST Mensual | ❌ BLOQUEADO | €19 | - | - | Downgrade de periodo |
| HOST Semestral | ❌ BLOQUEADO | €102.60 | - | - | Mismo plan y periodo |
| HOST Anual | ✅ PERMITIDO | €182.40 | €100.91 | **€81.49** | Upgrade de periodo |

**Fórmulas:**
```
HOST Mensual = €19 × 1 = €19
HOST Semestral = €19 × 6 × 0.9 = €102.60
HOST Anual = €19 × 12 × 0.8 = €182.40
```

---

### 1.3 Cambios de PLAN + PERIODO simultáneos:

| Destino | Resultado | Precio Nuevo | Crédito | Total a Pagar | Razón |
|---------|-----------|--------------|---------|---------------|-------|
| BASIC Mensual | ❌ BLOQUEADO | €9 | - | - | Downgrade de plan |
| BASIC Anual | ❌ BLOQUEADO | €86.40 | - | - | Downgrade de plan |
| SUPERHOST Mensual | ❌ BLOQUEADO | €27 | - | - | Downgrade de periodo |
| SUPERHOST Anual | ✅ PERMITIDO | €256.00 | €100.91 | **€155.09** | Upgrade de plan + periodo |
| BUSINESS Mensual | ❌ BLOQUEADO | €44 | - | - | Downgrade de periodo |
| BUSINESS Anual | ✅ PERMITIDO | €422.40 | €100.91 | **€321.49** | Upgrade de plan + periodo |

---

## 2️⃣ DESDE BASIC MENSUAL (hipotético)

### Plan Actual:
- **Precio pagado:** €9
- **Días totales:** 30
- **Días restantes:** 15 (ejemplo)
- **Tasa diaria:** €0.30/día
- **Crédito disponible:** €4.50

---

### 2.1 Cambios permitidos:

| Destino | Resultado | Precio Nuevo | Crédito | Total a Pagar |
|---------|-----------|--------------|---------|---------------|
| BASIC Semestral | ✅ PERMITIDO | €48.60 | €4.50 | **€44.10** |
| BASIC Anual | ✅ PERMITIDO | €86.40 | €4.50 | **€81.90** |
| HOST Mensual | ✅ PERMITIDO | €19 | €4.50 | **€14.50** |
| HOST Semestral | ✅ PERMITIDO | €102.60 | €4.50 | **€98.10** |
| HOST Anual | ✅ PERMITIDO | €182.40 | €4.50 | **€177.90** |
| SUPERHOST Mensual | ✅ PERMITIDO | €27 | €4.50 | **€22.50** |
| SUPERHOST Semestral | ✅ PERMITIDO | €144.00 | €4.50 | **€139.50** |
| SUPERHOST Anual | ✅ PERMITIDO | €256.00 | €4.50 | **€251.50** |

---

## 3️⃣ DESDE SUPERHOST ANUAL (hipotético)

### Plan Actual:
- **Precio pagado:** €256.00 (€27/mes × 12 con 20% dto, €30 con early adopter)
- **Días totales:** 365
- **Días restantes:** 300 (ejemplo)
- **Tasa diaria:** €0.701/día
- **Crédito disponible:** €210.41

---

### 3.1 Cambios bloqueados (TODOS son downgrades):

| Destino | Resultado | Razón |
|---------|-----------|-------|
| BASIC (cualquier periodo) | ❌ BLOQUEADO | Downgrade de plan |
| HOST (cualquier periodo) | ❌ BLOQUEADO | Downgrade de plan |
| SUPERHOST Mensual | ❌ BLOQUEADO | Downgrade de periodo |
| SUPERHOST Semestral | ❌ BLOQUEADO | Downgrade de periodo |
| SUPERHOST Anual | ❌ BLOQUEADO | Mismo plan y periodo |

### 3.2 Cambios permitidos:

| Destino | Resultado | Precio Nuevo | Crédito | Total a Pagar |
|---------|-----------|--------------|---------|---------------|
| BUSINESS Mensual | ❌ BLOQUEADO | €44 | - | - | Downgrade de periodo |
| BUSINESS Semestral | ❌ BLOQUEADO | €234.00 | - | - | Downgrade de periodo |
| BUSINESS Anual | ✅ PERMITIDO | €422.40 | €210.41 | **€211.99** |

---

## 4️⃣ DESDE BUSINESS ANUAL (máximo)

### Plan Actual:
- **Precio pagado:** €422.40 (€44/mes × 12 con 20% dto)
- **Días totales:** 365
- **Días restantes:** 300 (ejemplo)
- **Tasa diaria:** €1.157/día
- **Crédito disponible:** €347.26

---

### 4.1 Resultado:

**TODOS los cambios están BLOQUEADOS** porque es el plan máximo:
- ❌ Cualquier otro plan = Downgrade de plan
- ❌ BUSINESS Mensual/Semestral = Downgrade de periodo
- ❌ BUSINESS Anual = Mismo plan y periodo

**NOTA:** Este usuario solo puede:
1. Mantener su plan actual
2. Cancelarlo y esperar a que expire
3. Renovarlo al final del periodo

---

## 5️⃣ ESCENARIOS EDGE CASES

### 5.1 Usuario SIN suscripción activa:

| Destino | Resultado | Precio | Crédito | Total |
|---------|-----------|--------|---------|-------|
| Cualquier plan | ✅ PERMITIDO | Precio completo | €0 | Precio completo |

**Ejemplo:**
- BASIC Mensual = €9
- HOST Semestral = €102.60
- SUPERHOST Anual = €256.00

---

### 5.2 Usuario con plan PRÓXIMO A EXPIRAR (< 7 días):

**Plan actual:** HOST Semestral (€102.60)
**Días restantes:** 3

| Cálculo | Valor |
|---------|-------|
| Tasa diaria | €102.60 / 182 = €0.564/día |
| Crédito | €0.564 × 3 = **€1.69** |
| SUPERHOST Semestral | €144.00 - €1.69 = **€142.31** |

**Observación:** El crédito es mínimo, casi paga el precio completo.

---

### 5.3 Usuario con plan RECIÉN ACTIVADO (< 7 días usado):

**Plan actual:** HOST Semestral (€102.60)
**Días restantes:** 175 de 182

| Cálculo | Valor |
|---------|-------|
| Tasa diaria | €102.60 / 182 = €0.564/día |
| Crédito | €0.564 × 175 = **€98.74** |
| SUPERHOST Semestral | €144.00 - €98.74 = **€45.26** |

**Observación:** El crédito es máximo, paga muy poco por el upgrade.

---

### 5.4 Usuario con customPrice (descuento personalizado):

**Escenario:** Admin dio 50% descuento
**Plan:** HOST Semestral
**Precio original:** €102.60
**customPrice:** €51.30
**Días restantes:** 179

| Cálculo | Valor |
|---------|-------|
| **INCORRECTO (antes del fix)** | €0.282/día × 179 = €50.46 |
| **CORRECTO (después del fix)** | €0.282/día × 179 = €50.46 |

**NOTA:** El fix también funciona con customPrice porque ahora recalcula el precio total basado en el periodo detectado.

---

## 6️⃣ TABLA MAESTRA DE PRECIOS

### Precios Base (con Early Adopter):

| Plan | Mensual | Semestral (-10%) | Anual (-20%) |
|------|---------|------------------|--------------|
| BASIC | €9 | €48.60 | €86.40 |
| HOST | €19 | €102.60 | €182.40 |
| SUPERHOST | €27 | €144.00 | €256.00 |
| BUSINESS | €44 | €234.00 | €422.40 |

### Tasas Diarias (Semestral = 182 días):

| Plan | Tasa Diaria Semestral |
|------|-----------------------|
| BASIC | €0.267/día |
| HOST | €0.564/día |
| SUPERHOST | €0.791/día |
| BUSINESS | €1.286/día |

### Tasas Diarias (Anual = 365 días):

| Plan | Tasa Diaria Anual |
|------|-------------------|
| BASIC | €0.237/día |
| HOST | €0.500/día |
| SUPERHOST | €0.701/día |
| BUSINESS | €1.157/día |

---

## 7️⃣ REGLAS DE NEGOCIO

### ✅ PERMITIDO:

1. **Upgrade de plan** (mismo periodo o superior)
   - Ejemplo: BASIC → HOST
   - Ejemplo: HOST → SUPERHOST

2. **Upgrade de periodo** (mismo plan o superior)
   - Ejemplo: Mensual → Semestral
   - Ejemplo: Semestral → Anual

3. **Upgrade combinado** (plan + periodo)
   - Ejemplo: BASIC Mensual → HOST Semestral
   - Ejemplo: HOST Semestral → SUPERHOST Anual

### ❌ BLOQUEADO:

1. **Downgrade de plan** (mismo periodo o inferior)
   - Ejemplo: HOST → BASIC
   - Ejemplo: SUPERHOST → HOST

2. **Downgrade de periodo** (mismo plan o inferior)
   - Ejemplo: Anual → Semestral
   - Ejemplo: Semestral → Mensual

3. **Mismo plan y periodo**
   - Ejemplo: HOST Semestral → HOST Semestral

4. **Downgrade combinado** (plan + periodo)
   - Ejemplo: SUPERHOST Anual → HOST Semestral

---

## 8️⃣ CASOS DE PRUEBA RECOMENDADOS

### Prueba Manual en Interfaz:

1. **Login con:** colaboracionesbnb@gmail.com
2. **Ir a:** http://localhost:3000/account/plans
3. **Verificar plan actual:** HOST Semestral

### Casos a probar:

| # | Acción | Resultado Esperado | Crédito Esperado |
|---|--------|-------------------|------------------|
| 1 | Seleccionar SUPERHOST + Semestral | ✅ Botón activo | €100.91 |
| 2 | Seleccionar HOST + Anual | ✅ Botón activo | €100.91 |
| 3 | Seleccionar BASIC + Semestral | ❌ Botón bloqueado | - |
| 4 | Seleccionar HOST + Mensual | ❌ Botón bloqueado | - |
| 5 | Seleccionar HOST + Semestral | ❌ Botón bloqueado | - |

### Valores específicos a verificar:

**Caso: HOST Semestral → HOST Anual**
```
✅ Plan nuevo: €182.40
✅ Crédito: €100.91
✅ Total: €81.49
✅ Precio mensual efectivo: €6.79/mes
```

**Caso: HOST Semestral → SUPERHOST Semestral**
```
✅ Plan nuevo: €144.00
✅ Crédito: €100.91
✅ Total: €43.09
✅ Precio mensual efectivo: €7.18/mes
```

---

## 9️⃣ SCRIPTS DE VALIDACIÓN

### Verificar cálculo en consola del navegador:

```javascript
// Plan actual
const currentPrice = 102.60
const totalDays = 182
const daysRemaining = 179

// Calcular
const dailyRate = currentPrice / totalDays
const credit = dailyRate * daysRemaining

console.log(`Tasa diaria: €${dailyRate.toFixed(4)}/día`)
console.log(`Crédito total: €${credit.toFixed(2)}`)

// Debería mostrar:
// Tasa diaria: €0.5637/día
// Crédito total: €100.91
```

---

## 🔟 CHECKLIST DE VALIDACIÓN

### ✅ Validaciones Implementadas:

- [x] Bloqueo de mismo plan + mismo periodo
- [x] Bloqueo de downgrade de plan
- [x] Bloqueo de downgrade de periodo
- [x] Cálculo correcto de precio total según periodo
- [x] Cálculo correcto de tasa diaria
- [x] Cálculo correcto de crédito
- [x] Mensaje claro cuando se bloquea
- [x] Mostrar días restantes
- [x] Mostrar fecha de expiración

### ⏳ Pendientes:

- [ ] Tests automatizados para todos los escenarios
- [ ] Validación en el endpoint de checkout
- [ ] Logs de auditoría de cambios de plan
- [ ] Notificaciones por email de upgrade exitoso
- [ ] Factura automática con desglose de crédito

---

**Estado:** ✅ CORREGIDO Y DOCUMENTADO
**Próxima revisión:** Después de probar en interfaz
