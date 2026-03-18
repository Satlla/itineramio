# Feature Sync Report — Web vs App Móvil
**Generado**: 2026-03-16
**Agente**: Feature/Screen Sync
**Versión web**: Next.js 15 App Router — `/Users/alejandrosatlla/Documents/itineramio`
**Versión móvil**: Expo Router (React Native) — `/Users/alejandrosatlla/itineramio-app`

---

## 1. Mapa de pantallas Web

### Auth (`app/(auth)/`)

| Ruta | Descripción | API calls | Estado |
|------|-------------|-----------|--------|
| `/login` | Email + password, "Remember me", redirect por módulos activos. Guarda token en localStorage para PWA. Maneja `EMAIL_NOT_VERIFIED`. | `POST /api/auth/simple-login`, `GET /api/auth/module-status` | ✅ Completo |
| `/register` | Nombre, email, teléfono (obligatorio), password con indicador de fortaleza, confirmPassword, honeypot anti-bot, aceptar términos (obligatorio), consentimiento marketing (opcional), código referido, cupón demo. | `POST /api/auth/register` | ✅ Completo |
| `/forgot-password` | Formulario de email. **BUG CRÍTICO**: simula delay con `setTimeout` pero NO llama a ningún API. | ❌ No llama API | 🐛 BUG |
| `/reset-password` | Formulario nueva contraseña con token URL. | `POST /api/auth/reset-password` | ✅ Completo |
| `/verify-required` | Pantalla informativa para email no verificado. | — | ✅ Completo |

### Propiedades (`app/(dashboard)/`)

| Ruta | Descripción | API calls | Estado |
|------|-------------|-----------|--------|
| `/main` | Lista de propiedades con stats, OnboardingChecklist nuevos usuarios, UnifiedWelcomeModal, acciones (edit, share, delete, copy link), toggle publish. | `GET /api/properties`, `PUT .../publish`, `DELETE ...` | ✅ Completo |
| `/main/[propertyId]` | Detalle propiedad: zonas, pasos, previsualizar guía. | `GET /api/properties/[id]` | ✅ Completo |
| `/main/[propertyId]/zona/[zoneId]` | Detalle zona: lista de pasos, reorder. | `GET/PUT /api/properties/[id]/zones/[zoneId]` | ✅ Completo |
| `/main/[propertyId]/zona/[zoneId]/paso/[stepId]` | Editor de paso: tipo, contenido, media. | `GET/PUT /api/properties/[id]/zones/.../steps/[stepId]` | ✅ Completo |

### Gestión (`app/(dashboard)/gestion/`)

| Ruta | Descripción | API calls | Estado |
|------|-------------|-----------|--------|
| `/gestion/reservas` | Lista + vista calendario. Filtros: mes/año/propiedad/plataforma/estado. Acciones: crear, editar, eliminar, importar CSV. | `GET/POST/PUT/DELETE /api/gestion/reservations` | ✅ Completo |
| `/gestion/reservas/importar` | Import CSV/Excel con mapeo de columnas y asignación de propiedad. | `POST /api/gestion/reservations/import` | ✅ Completo |
| `/gestion/liquidaciones` | Lista con filtros (año/mes/propietario/estado/búsqueda). Totales summary. PDF download, marcar pagada, link a detalle. | `GET /api/gestion/liquidations`, `POST .../generate`, `PUT .../status` | ✅ Completo |
| `/gestion/liquidaciones/[id]` | Detalle liquidación: reservas incluidas, breakdown comisiones/retenciones, PDF, email, Excel, marcar pagada, recalcular. | `GET /api/gestion/liquidations/[id]` | ✅ Completo |
| `/gestion/facturas` | Lista con filtros año/estado/tipo. Stats (total facturado, pendiente, count, cobrado). Emitir, marcar enviada/pagada, crear rectificativa, eliminar borrador. | `GET /api/gestion/invoices`, `PUT .../status`, `POST .../issue`, `DELETE` | ✅ Completo |
| `/gestion/clientes` | CRUD completo inline modal: tipo (PERSONA_FISICA/EMPRESA), nombre/apellidos o razón social, email, NIF/CIF con validación, teléfono, retención (0%/7%/15%/19%), IBAN con validación española, dirección completa. Enviar portal. | `GET/POST/PUT/DELETE /api/gestion/owners`, `POST .../send-link` | ✅ Completo |
| `/gestion/gastos` | CRUD completo: 8 categorías, billingUnitId vs propertyId, cargar al propietario flag, proveedor, nº factura, IVA. Filtros mes/año/propiedad/categoría. | `GET/POST/PUT/DELETE /api/gestion/expenses` | ✅ Completo |
| `/gestion/rentabilidad` | Dashboard anual/mensual. Desglose por propiedad: comisiones, ocupación, ingresos, neto. | `GET /api/gestion/profitability` | ✅ Completo |
| `/gestion/perfil-gestor` | Perfil fiscal: businessName, NIF/CIF, dirección, logo, firma, IBAN, métodos de pago, series de facturación (prefijo, nº inicio, reset anual, estándar vs rectificativa). | `GET/PUT /api/gestion/invoice-config`, `GET/POST/PUT/DELETE /api/gestion/invoice-series` | ✅ Completo |
| `/gestion/integraciones` | OAuth Gmail para importar reservas Airbnb/Booking desde emails. | `GET/POST /api/gestion/integrations/gmail` | ✅ Completo |

### Otras rutas web

| Ruta | Descripción | Estado |
|------|-------------|--------|
| `/conjuntos` | Gestión de conjuntos de propiedades (agrupación). | ✅ Completo |
| `/account` | Perfil, suscripción, billing, notificaciones. | ✅ Completo |
| `/propietario/[token]` | Portal público del propietario con nav por meses. | ✅ Completo |
| `/guide/[slug]` | Guía pública de propiedad. | ✅ Completo |
| `/z/[zoneCode]` | Vista pública de zona individual. | ✅ Completo |
| `/admin` | Panel admin interno (gestión hosts, invoices). | ✅ Completo |

---

## 2. Mapa de screens App Móvil

### Auth (`app/(auth)/`)

| Ruta | Descripción | Estado vs Web |
|------|-------------|---------------|
| `login.tsx` | SplashLogo animado en primer render. Email + password con validación zod. Demo mode (`demo@itineramio.com`/`demo123`). Llama `login()` de `@/lib/auth`. | ✅ Paridad |
| `register.tsx` | Nombre, email, password, confirmPassword. **FALTA**: teléfono (requerido por API), acceptTerms (requerido), marketingConsent, código referido, soporte cupón. | ⚠️ Incompleto |
| `forgot-password.tsx` | Llama `POST /api/auth/forgot-password` correctamente via `apiPost`. | ✅ Mejor que web (web tiene BUG) |

### Propiedades (`app/(tabs)/properties/`)

| Ruta | Descripción | Estado vs Web |
|------|-------------|---------------|
| `properties/index.tsx` | Lista con thumbnail, nombre, ubicación, chips amenities, stats zonas/vistas, toggle published switch. FAB → crear. | ✅ Paridad básica |
| `properties/[id]/index.tsx` | 3 tabs: Zonas / Chatbot / Avisos. Zonas: stats, descripción, zonas list. Chatbot: placeholder. Avisos: placeholder. Bottom bar: preview, download (inactivo), add zone. | ⚠️ Parcial — Chatbot y Avisos sin implementar |
| `properties/create/` | Formulario creación propiedad. | ✅ Implementado |

### Gestión (`app/(tabs)/gestion/`)

| Ruta | Descripción | Estado vs Web |
|------|-------------|---------------|
| `gestion/index.tsx` | Hub con 3 tabs: Reservas/Liquidaciones/Clientes. Nav de mes, stats row, accesos rápidos (Gastos, Facturas, Huéspedes, Rentabilidad), banner acciones pendientes. FABs por tab. | ✅ Hub funcional |
| `gestion/reservations/[id]/index.tsx` | Detalle: header huésped, fechas, contacto, importes (hostEarnings/cleaningFee/total), código confirmación, notas. Acciones: check-in/out, editar, eliminar. | ⚠️ Sin crear reserva manual |
| `gestion/reservations/create.tsx` | Formulario crear reserva. | ✅ Implementado |
| `gestion/liquidations/[id]/index.tsx` | Detalle: propietario, periodo, total, lista reservas, recalcular (DRAFT), PDF/Email/Excel, marcar pagada. | ⚠️ Sin generar nueva liquidación desde móvil |
| `gestion/clients/index.tsx` | Lista con búsqueda, OwnerCard, send-portal (copia clipboard), delete. FAB → crear. | ⚠️ Sin IBAN/retención/NIF en formulario |
| `gestion/clients/create.tsx` | Formulario crear cliente. | ⚠️ Parcial (ver gaps en clients) |
| `gestion/clients/[id]/edit.tsx` | Formulario editar cliente. | ⚠️ Parcial |
| `gestion/expenses/index.tsx` | Lista con nav de mes, total summary, FlatList ExpenseRow (icono, concepto, badge categoría, fecha, importe, delete). FAB → crear. **Sin botón editar**. | ⚠️ Sin editar gastos, sin filtros por propiedad |
| `gestion/expenses/create.tsx` | Formulario crear gasto. | ✅ Implementado |
| `gestion/invoices/index.tsx` | Lista con selector año, total summary, InvoiceRow con chips (PDF, Emitir si DRAFT, Enviar si ISSUED/SENT, delete si DRAFT). Tap → detalle. | ⚠️ Sin crear factura manual, sin filtros avanzados |
| `gestion/invoices/[id]/index.tsx` | Detalle factura. | ✅ Implementado |
| `gestion/rentabilidad/index.tsx` | Selector 3 años, tarjeta totales, desglose por propiedad (ocupación, ingresos, comisión, neto). | ✅ Paridad |
| `gestion/guests/index.tsx` | Búsqueda por nombre/email, cards con iniciales, total estancias, total gastado. | ✅ Implementado (web no tiene pantalla dedicada equivalente) |

### Otras tabs (`app/(tabs)/`)

| Ruta | Descripción | Estado vs Web |
|------|-------------|---------------|
| `conjuntos/index.tsx` | Lista conjuntos. FAB muestra Alert "Función disponible en versión web". Delete funciona. | ⚠️ Solo lectura — crear/editar solo en web |
| `notifications.tsx` | Lista notificaciones. `useNotifications`, `useMarkNotificationsRead`. | ✅ Implementado |
| `account.tsx` | Perfil header, menú items (Notificaciones, Cuenta, Biblioteca→web, Suscripciones→web, Facturación→web, Recursos→web, Ayuda→email, Privacidad→web), logout. | ⚠️ Muchas secciones redirigen a web |

---

## 3. Tabla de Paridad

| Feature | Web | Móvil | Estado | Notas críticas |
|---------|-----|-------|--------|----------------|
| **AUTH** | | | | |
| Login email+password | ✅ | ✅ | ✅ Paridad | |
| Register completo | ✅ | ⚠️ | ⚠️ Gap | Móvil falta: teléfono, acceptTerms, referido, cupón |
| Forgot password funcional | ❌ BUG | ✅ | Móvil mejor | Web tiene setTimeout falso, móvil llama API real |
| Reset password | ✅ | ❌ | ❌ Gap | No existe en móvil |
| Verificación email | ✅ | ❌ | ❌ Gap | No existe en móvil |
| **PROPIEDADES** | | | | |
| Lista propiedades | ✅ | ✅ | ✅ Paridad | |
| Crear propiedad | ✅ | ✅ | ✅ Paridad | |
| Editar propiedad (detalle) | ✅ | ⚠️ | ⚠️ Gap | Móvil: solo Zonas funcional, Chatbot/Avisos son placeholders |
| Gestionar zonas | ✅ | ✅ | ✅ Paridad | |
| Editor de pasos | ✅ | ✅ | ✅ Paridad | |
| Publicar/despublicar | ✅ | ✅ | ✅ Paridad | |
| Copiar link guía | ✅ | ❌ | ❌ Gap | No hay opción share en móvil |
| Vista previa guía | ✅ | ✅ (web) | ⚠️ Parcial | Abre web, no nativa |
| **CONJUNTOS** | | | | |
| Listar conjuntos | ✅ | ✅ | ✅ Paridad | |
| Crear conjunto | ✅ | ❌ | ❌ Gap | Móvil muestra Alert redirige a web |
| Editar conjunto | ✅ | ❌ | ❌ Gap | |
| **GESTIÓN — RESERVAS** | | | | |
| Lista reservas | ✅ | ✅ | ✅ Paridad | |
| Vista calendario | ✅ | ❌ | ❌ Gap | Solo lista en móvil |
| Filtros avanzados | ✅ | ❌ | ❌ Gap | Móvil solo filtra por mes. Web: mes/año/propiedad/plataforma/estado |
| Crear reserva manual | ✅ | ✅ | ✅ Paridad | |
| Editar reserva | ✅ | ✅ | ✅ Paridad | |
| Detalle reserva completo | ✅ | ✅ | ✅ Paridad | |
| Importar CSV | ✅ | ❌ | ❌ Gap | Solo en web |
| Integración Gmail | ✅ | ❌ | ❌ Gap | Solo en web |
| **GESTIÓN — LIQUIDACIONES** | | | | |
| Lista liquidaciones | ✅ | ✅ | ✅ Paridad | |
| Filtros (año/mes/owner/estado) | ✅ | ❌ | ❌ Gap | Móvil solo muestra lista, sin filtros |
| Generar nueva liquidación | ✅ | ❌ | ❌ Gap | No hay botón en móvil |
| Detalle liquidación | ✅ | ✅ | ✅ Paridad | |
| PDF liquidación | ✅ | ✅ | ✅ Paridad | |
| Email liquidación | ✅ | ✅ | ✅ Paridad | |
| Excel liquidación | ✅ | ✅ | ✅ Paridad | |
| Recalcular liquidación | ✅ | ✅ | ✅ Paridad | |
| Marcar pagada | ✅ | ✅ | ✅ Paridad | |
| **GESTIÓN — FACTURAS** | | | | |
| Lista facturas | ✅ | ✅ | ✅ Paridad | |
| Filtros avanzados | ✅ | ⚠️ | ⚠️ Gap | Móvil solo tiene selector año |
| Stats (totales) | ✅ | ✅ | ✅ Paridad | |
| Emitir factura (DRAFT→ISSUED) | ✅ | ✅ | ✅ Paridad | Web pide confirmación con número preview |
| Marcar enviada/pagada | ✅ | ✅ | ✅ Paridad | |
| PDF factura | ✅ | ✅ | ✅ Paridad | |
| Crear factura manual | ✅ | ❌ | ❌ Gap | No existe en móvil |
| Rectificativa | ✅ | ❌ | ❌ Gap | No existe en móvil |
| Eliminar borrador | ✅ | ✅ | ✅ Paridad | |
| **GESTIÓN — CLIENTES** | | | | |
| Lista clientes | ✅ | ✅ | ✅ Paridad | |
| Búsqueda | ✅ | ✅ | ✅ Paridad | |
| Crear cliente completo | ✅ | ⚠️ | ⚠️ Gap | Móvil falta: NIF/CIF, IBAN, retención, dirección completa |
| Editar cliente completo | ✅ | ⚠️ | ⚠️ Gap | Mismo gap que crear |
| Eliminar cliente | ✅ | ✅ | ✅ Paridad | |
| Enviar portal propietario | ✅ | ✅ | ✅ Paridad | Móvil copia al clipboard |
| **GESTIÓN — GASTOS** | | | | |
| Lista gastos | ✅ | ✅ | ✅ Paridad | |
| Filtros (mes/año/propiedad/cat.) | ✅ | ⚠️ | ⚠️ Gap | Móvil solo filtra por mes/año |
| Crear gasto | ✅ | ✅ | ✅ Paridad | |
| Editar gasto | ✅ | ❌ | ❌ Gap | Móvil no tiene botón editar en la fila |
| Eliminar gasto | ✅ | ✅ | ✅ Paridad | |
| Campo billingUnitId | ✅ | ❓ | ❓ Verificar | No se verificó el formulario create en móvil |
| Campo cargar al propietario | ✅ | ❓ | ❓ Verificar | No se verificó el formulario create en móvil |
| **GESTIÓN — RENTABILIDAD** | | | | |
| Dashboard anual | ✅ | ✅ | ✅ Paridad | |
| Desglose por propiedad | ✅ | ✅ | ✅ Paridad | |
| Vista mensual | ✅ | ❌ | ❌ Gap | Web tiene breakdown mensual, móvil solo anual |
| **GESTIÓN — PERFIL GESTOR** | | | | |
| Datos fiscales | ✅ | ❌ | ❌ Gap | No existe pantalla en móvil |
| Upload logo | ✅ | ❌ | ❌ Gap | |
| Upload firma | ✅ | ❌ | ❌ Gap | |
| Series de facturación | ✅ | ❌ | ❌ Gap | |
| **HUÉSPEDES** | | | | |
| Lista huéspedes | ❌ Sin pantalla | ✅ | Móvil mejor | Web no tiene sección dedicada (datos solo en reservas) |
| **NOTIFICACIONES** | | | | |
| Lista notificaciones | ✅ | ✅ | ✅ Paridad | |
| Marcar leídas | ✅ | ✅ | ✅ Paridad | |
| **CUENTA** | | | | |
| Editar perfil | ✅ | ✅ | ✅ Paridad | |
| Suscripción | ✅ | ⚠️ | ⚠️ Gap | Móvil redirige a web |
| Facturación (billing) | ✅ | ⚠️ | ⚠️ Gap | Móvil redirige a web |
| Notificaciones settings | ✅ | ⚠️ | ⚠️ Gap | Móvil tiene menú item pero sin implementar |

---

## 4. Análisis UI/UX

### 4.1 Autenticación

**Web**: Experiencia completa con todos los campos necesarios, gestión de errores detallada, soporte PWA (localStorage token).

**Móvil**: Animación de splash logo bien implementada. Pero hay una inconsistencia grave en el registro: el teléfono es campo obligatorio en el API (`POST /api/auth/register`) pero no aparece en el formulario móvil. Esto puede provocar errores 400 silenciosos o usuarios registrados sin teléfono.

**El bug de forgot-password en web** (setTimeout falso sin llamada API) es un problema de UX crítico: el usuario cree que se envió el email pero nunca se envió. La app móvil lo implementa correctamente.

### 4.2 Reservas

**Web**: Vista lista + calendario con filtros completos (mes/año/propiedad/plataforma/estado). Soporte importación CSV y Gmail OAuth.

**Móvil**: Solo vista lista con filtro por mes. Para gestores con muchas propiedades, la ausencia de filtro por propiedad en móvil es un bloqueo funcional. La vista calendario no está disponible.

**Recomendación**: Añadir filtro por propiedad en la lista de reservas móvil (P0). La vista calendario es P1 dado que consume más desarrollo.

### 4.3 Liquidaciones

**Web**: Generación de nuevas liquidaciones, filtros por propietario/estado, descarga masiva.

**Móvil**: El detalle es completo (PDF, Email, Excel, recalcular, marcar pagada), pero no se pueden generar nuevas liquidaciones ni filtrar la lista. Para un gestor en movimiento, no poder generar una liquidación desde móvil es un bloqueo.

### 4.4 Facturas

**Web**: Flujo completo: crear borrador → emitir (con preview número) → enviar → cobrar → crear rectificativa.

**Móvil**: Falta crear factura manual y crear rectificativa. La emisión y marcado de estado sí funcionan. El gap crítico es la rectificativa, necesaria para devoluciones/correcciones.

### 4.5 Clientes (Propietarios)

**Web**: Formulario fiscal completo con validación española (NIF/CIF formato, IBAN formato ES).

**Móvil**: El formulario de crear/editar cliente carece de campos fiscales críticos (NIF/CIF, IBAN, retención). Sin IBAN no se pueden generar liquidaciones correctamente. Sin retención, el cálculo fiscal es incorrecto.

**Este es el gap de mayor impacto en la operativa del gestor.**

### 4.6 Gastos

**Web**: Edición completa, filtros por categoría/propiedad, campo "cargar al propietario", proveedor, nº factura, IVA.

**Móvil**: No hay botón editar en la fila de gasto. Para corregir un gasto mal introducido hay que eliminarlo y volver a crearlo. Impacto alto en UX.

### 4.7 Perfil Gestor

**Ausente completamente en móvil**. Sin acceso a series de facturación ni datos fiscales desde móvil. Bloqueo si el gestor necesita verificar su IBAN de cobro en campo.

### 4.8 Conjuntos (Property Sets)

FAB en móvil muestra un Alert que redirige a web. La creación/edición es exclusiva de web. Dado que los conjuntos son una feature secundaria, este comportamiento es aceptable a corto plazo.

---

## 5. Plan de implementación priorizado

### P0 — Crítico (bloquea operativa, implementar primero)

| # | Feature | Archivo(s) a crear/editar | Esfuerzo | Impacto |
|---|---------|--------------------------|----------|---------|
| P0.1 | **Fix formulario registro móvil** — añadir campos `phone` (required), `acceptTerms`, `marketingConsent` | `app/(auth)/register.tsx` | S | 🔴 Registros pueden fallar silenciosamente |
| P0.2 | **Completar formulario Cliente** — añadir NIF/CIF, IBAN, tipo retención, dirección, país | `app/(tabs)/gestion/clients/create.tsx`, `clients/[id]/edit.tsx` | M | 🔴 Sin IBAN no funciona facturación a propietarios |
| P0.3 | **Editar gasto** — añadir botón editar en `ExpenseRow` y ruta `expenses/[id]/edit.tsx` | `expenses/index.tsx` + nueva `expenses/[id]/edit.tsx` | S | 🔴 Corregir gastos es operativa diaria |
| P0.4 | **Generar nueva liquidación desde móvil** — botón en la lista de liquidaciones | `gestion/index.tsx` o `liquidations/create.tsx` (nueva) | M | 🟠 Gestores en movimiento no pueden generar liquidaciones |
| P0.5 | **Filtro por propiedad en reservas** — selector de propiedad en la lista | `gestion/index.tsx` | S | 🟠 Gestores con muchas propiedades no pueden filtrar |

### P1 — Alta prioridad (mejora significativa)

| # | Feature | Archivo(s) a crear/editar | Esfuerzo |
|---|---------|--------------------------|----------|
| P1.1 | **Crear factura manual** desde móvil | Nueva `invoices/create.tsx` | M |
| P1.2 | **Crear rectificativa** desde móvil | Acción en `invoices/[id]/index.tsx` | M |
| P1.3 | **Perfil gestor móvil** — datos fiscales, IBAN, series de facturación | Nueva `gestion/perfil/index.tsx` | L |
| P1.4 | **Fix forgot-password web** — reemplazar `setTimeout` falso por llamada real a `POST /api/auth/forgot-password` | `app/(auth)/forgot-password/page.tsx` | XS |
| P1.5 | **Filtros avanzados en liquidaciones** (año/mes/propietario/estado) | `gestion/index.tsx` | S |
| P1.6 | **Vista mensual en Rentabilidad** | `gestion/rentabilidad/index.tsx` | S |

### P2 — Media prioridad (mejoras de UX)

| # | Feature | Archivo(s) | Esfuerzo |
|---|---------|-----------|----------|
| P2.1 | **Vista calendario reservas** en móvil | Nueva `components/ReservationsCalendar.tsx` | L |
| P2.2 | **Filtros por categoría/propiedad en Gastos** | `expenses/index.tsx` | S |
| P2.3 | **Filtros avanzados en Facturas** (estado, tipo) | `invoices/index.tsx` | S |
| P2.4 | **Compartir link de guía** desde detalle propiedad | `properties/[id]/index.tsx` | XS |
| P2.5 | **Confirmación con preview número** al emitir factura | `invoices/index.tsx` | S |
| P2.6 | **Reset password** en app móvil (pantalla nueva + deep link) | Nueva `app/(auth)/reset-password.tsx` | M |
| P2.7 | **Verificación email** — pantalla informativa en móvil | Nueva `app/(auth)/verify-required.tsx` | XS |
| P2.8 | **Sección Notificaciones Settings** en account | `account.tsx` | S |
| P2.9 | **Tab Chatbot en propiedad** — configuración básica | `properties/[id]/index.tsx` | L |

### P3 — Baja prioridad (nice to have)

| # | Feature | Notas |
|---|---------|-------|
| P3.1 | Importar CSV en móvil | Flujo complejo con mapeo de columnas, mejor en web |
| P3.2 | Integración Gmail en móvil | OAuth flow difícil en móvil, mejor en web |
| P3.3 | Crear Conjuntos en móvil | Actualmente redirige a web — aceptable |
| P3.4 | Tab Avisos en propiedad | Placeholder actualmente |
| P3.5 | Download QR en propiedad (botón inactivo) | Botón existe pero disabled |
| P3.6 | Suscripción/Billing en móvil | Actualmente redirige a web — aceptable (Stripe) |

---

## 6. Notas técnicas

### Hooks existentes en móvil
Los siguientes hooks ya existen en `/Users/alejandrosatlla/itineramio-app/src/hooks/`:
- `useReservations`, `useReservation`, `useCreateReservation`, `useUpdateReservation`, `useDeleteReservation`
- `useLiquidations`, `useLiquidation`, `useUpdateLiquidation`, `useRecalculateLiquidation`
- `useOwners`, `useDeleteOwner` — **falta**: `useCreateOwner`, `useUpdateOwner`
- `useExpenses`, `useDeleteExpense`, `useCreateExpense` — **falta**: `useUpdateExpense`
- `useInvoices`, `useDeleteInvoice`, `useIssueInvoice`, `useSendInvoice` — **falta**: `useCreateInvoice`, `useCreateRectifyingInvoice`
- `useProfitability` — completo
- `useGuests` — completo
- `useNotifications`, `useMarkNotificationsRead` — completo
- `usePropertySets`, `useDeletePropertySet` — **falta**: `useCreatePropertySet`, `useUpdatePropertySet`

### Hooks que crear para P0
Para P0.2 (formulario cliente completo) se necesita:
```typescript
// hooks/useOwners.ts — añadir:
export function useCreateOwner() { ... }
export function useUpdateOwner(id: string) { ... }
```

Para P0.3 (editar gasto):
```typescript
// hooks/useExpenses.ts — añadir:
export function useUpdateExpense(id: string) { ... }
```

### Patrón de auth en móvil
- Token almacenado con `storageSet('token', ...)` (AsyncStorage wrapper)
- Todas las llamadas API usan `apiGet`/`apiPost`/`apiPut`/`apiDelete` de `@/lib/apiClient`
- `apiClient` adjunta el token automáticamente desde storage
- Demo mode: `user?.id === 'demo'` con datos hardcodeados

### Validación campos fiscales españoles
La web valida:
- NIF/CIF: regex `/^[A-Z][0-9]{7}[A-Z0-9]$/` para empresas, `/^[0-9]{8}[A-Z]$/` para personas
- IBAN España: debe comenzar por `ES` seguido de 22 caracteres

Al implementar P0.2 en móvil, reutilizar la misma lógica de validación.

---

*Reporte generado automáticamente por Agente 2 — Feature/Screen Sync el 2026-03-16.*
