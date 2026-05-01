# Auditoría del Codebase Itineramio — pre-AlexAI

**Fecha inicio:** 2026-05-02
**Auditor:** Claude Code
**Objetivo:** entender qué existe en el repo antes de diseñar PR2 (interface adapter) e implementar Fase 1 + 1.5.
**Estado:** ⏳ EN CURSO — primer borrador

---

## 0. Métricas reales del repo (verificadas 2026-05-02)

| Métrica | CLAUDE.md decía | Realidad | Delta |
|---|---|---|---|
| `route.ts` (endpoints API) | ~460 | **522** | +62 |
| Modelos Prisma | 128 | **130** | +2 |
| Cron jobs activos | 6 | **18** | +12 |
| Componentes (`src/components/**/*.tsx`) | "100+" | **182** | confirmado |
| `console.log` en APIs | 1.495 | **3** (legítimos) | merge cleanup ya aplicado |
| Tests files | "176 tests" | **15 archivos** | depende de cómo se cuente |

CLAUDE.md está desactualizado. Verificar y actualizar al cierre de la auditoría.

---

## 1. Hallazgos críticos que cambian el plan V3

### 1.1 — `src/lib/feature-flags.ts` ya existe

Pequeño, solo gestiona `ENABLE_PRICING_V2`. Patrón sólido (env var booleana). **Mi PR2 no creará archivo nuevo, EXTENDERÁ el existente** añadiendo `isAlexAIBetaUser(email)` para la regla de whitelist.

### 1.2 — Chatbot actual es código de producción serio (802 líneas en `chatbot-utils.ts`)

Lo que **ya hace**:
- `getLocalizedText` para multi-idioma.
- Zone ranking (probablemente keyword matching, no embeddings).
- Media collection con stepText/stepIndex/captions.
- Prompt building para LLM.
- Unanswered-question detection.

Lo que **`app/api/chatbot/route.ts` añade**:
- Rate limits sofisticados (burst 20/min, hourly 60/h, daily 150/día).
- Email de alerta de abuso a admin.
- Streaming respuesta (60s max duration).

**Implicación**: AlexAI no es desde cero. Es un upgrade del chatbot existente con:
- Multi-canal (Beds24/WhatsApp, no solo web).
- Memoria cross-channel por reserva.
- Embeddings semánticos en lugar de keyword matching.
- Modos de aprobación (SUGGEST/AUTO_*).

**Esto reduce alcance de PRs de Fase 2** porque hay base conocida.

### 1.3 — Ya hay un sistema `ai-setup` con generador de zonas

```
src/lib/ai-setup/
├── city-links-builder.ts
├── generator.ts          ← generador de contenido
├── places.ts
├── vision.ts             ← OCR/análisis de imágenes
├── zone-builders.ts
└── zone-registry.ts
```

Y `app/(dashboard)/ai-setup/` tiene UI propia.

**Implicación**: la mejora M3 propuesta en V3 ("onboarding asistido por IA — AlexAI lee listings y propone manual base") **ya tiene base parcial implementada**. Cuando AlexAI conecte con Beds24, en lugar de construir generador desde cero, **se conecta a `generator.ts` existente** alimentándolo con datos de listings importados.

### 1.4 — `src/lib/ical-parser.ts` ya existe (334 líneas)

Parser iCal completo con tipos claros (`CalendarReservation`, `ICalEvent`, `ParsedReservation`). Ya hay base para sync de calendario vía iCal (alternativa a la API Beds24 para clientes que prefieran).

**Implicación**: Itineramio puede ofrecer 3 caminos de integración de calendario:
1. Beds24 master (white-label, lo planeado).
2. PMS del cliente (Hostaway/Hospitable adapter).
3. **iCal sync directo** (sin PMS, solo URL del iCal de Airbnb/Booking) ← este NO estaba en V3 y es opción real para clientes muy pequeños.

Considerar añadir como SKU intermedio: "Itineramio Solo iCal" — sin canal manager, solo lectura de iCal pública. Margen 100%, perfecto para hosts con 1-2 propiedades. **Discutir con Alejandro**.

### 1.5 — `gestion/` es un módulo PMS-light casi completo

```
app/(dashboard)/gestion/
├── apartamentos
├── calendario
├── check-ins-hoy
├── clientes
├── facturacion
├── facturas
├── gastos
├── integraciones        ← ¿qué integra hoy?
├── liquidaciones
├── perfil-gestor
├── rentabilidad
└── reservas
```

13 sub-módulos. Esto **NO** es un módulo a construir — es un módulo a EXTENDER con datos de Beds24/AlexAI/etc.

Implicación importante para Fase 4c (gestión económica): el alcance se reduce de "construir módulo de facturación" a "alimentar módulo existente con liquidaciones automáticas calculadas desde Reservation extendida".

### 1.6 — 18 crons activos (no 6)

Crons descubiertos vs CLAUDE.md:

```
calendar-sync               ← MUY relevante para Beds24 sync
chatbot-insights            ← solapamiento con AlexAI?
check-module-trials
check-trials
demo-followup
email-sequence
generate-daily
guest-followup              ← MUY relevante (followup huéspedes)
health-check
onboarding
onboarding-reminders
publish-scheduled
seed-engagement
send-emails
send-reactivation-emails
send-sequence-emails
send-soap-opera-sequence
verifactu-status
```

**Por investigar próximos pasos:**
- `calendar-sync`: ¿qué sincroniza? Posible coexistencia con Beds24.
- `chatbot-insights`: ¿genera insights del chatbot? Si sí, probable solapamiento con `chatbot-quality-auditor.ts` (en rama wip).
- `guest-followup`: ¿qué tipo de followup hace? ¿Solapa con workflows pre/post estancia que planeamos?

### 1.7 — `app/api/integrations/` ya tiene Gmail y Meta

```
app/api/integrations/
├── gmail
└── meta
```

Hay infra OAuth ya implementada con servicios externos. **PR2 (interface adapter) debe estudiar el patrón usado aquí antes de inventar uno propio** — para mantener consistencia.

### 1.8 — `PropertyExternalMapping` ya existe en schema (verificado completo)

```prisma
model PropertyExternalMapping {
  id           String   @id @default(cuid())
  propertyId   String
  platform     String           // ← string libre, no enum
  externalId   String
  externalName String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  property     Property @relation(...)

  @@unique([propertyId, platform])
  @@unique([platform, externalId])
}
```

**Implicación**: PR3 NO crea modelo nuevo. **EXTIENDE** este existente añadiendo: `externalIntegrationId`, `externalSubAccountId`, `hostRole` (enum OWNER/CO_HOST), `consentConfirmed`, `consentMetadata Json`, `tenantUserId`, `syncEnabled`, `lastSyncAt`. Migration aditiva (todos los nuevos campos con default o nullable).

### 1.9 — `Reservation` actual es sofisticado (170 líneas en schema)

Ya tiene: `userId` (host = tenant!), `platform` (enum), `confirmationCode` (= externalBookingId), guestName/email/phone/country, `travelers Json` (= party data), checkIn/checkOut/nights, roomTotal/cleaningFee/hostEarnings, **`managerAmount` + `ownerAmount`** (soporte co-host built-in), `liquidationId`, `billingConfigId`, `importSource`, `importBatchId`, `sourceListingName`, `relatedReservationId`.

Ya tiene índices que importan: `userId`, `checkIn`, `userId+status`, `userId+checkOut`, `userId+platform+checkIn`. **El aislamiento multi-tenant en Reservation viene ya pensado** (todo filtrable por `userId`).

**Implicación CRÍTICA**: el modelo `Reservation` extendido del V3 solo necesita añadir:
- `externalIntegrationId String?` (link a ExternalIntegration cuando llegue PR3)
- `externalBookingId String?` (alias para confirmationCode si difiere)
- `registroViajerosStatus enum` + `registroViajerosSentAt` + `registroViajerosFileUrl`
- `publicToken String? @unique` (para guest portal)
- `isRepeatGuest Boolean` + `previousReservationId`

5 campos aditivos. **Reduce drásticamente el alcance de PR3**.

### 1.10 — `ChatbotConversation` actual: bien diseñada

```prisma
model ChatbotConversation {
  id, propertyId, guestId, zoneId, language, sessionId
  messages Json, unansweredQuestions Json
  guestEmail, guestName, followUpSentAt
  // relación a Property, Guest
  @@map("chatbot_conversations")
}
```

Solo le faltan los campos multi-canal del V3: `channel ConversationChannel`, `externalSource`, `externalThreadId`, `externalBookingId`, `requiresHumanReview`, `reviewReason`, `status enum`, `guestIdentity Json`. Y el rename a `GuestConversation` con `@@map("chatbot_conversations")` mantiene tabla.

### 1.11 — `Property` es un modelo gordo (60+ campos)

Tiene un campo intrigante: **`intelligence Json?`** — sin documentar en schema pero parece reservado para AI. Investigar qué uso tiene actualmente. Posible candidato para almacenar configuración AlexAI por propiedad si decidimos no crear `AiAssistantConfig` separado (decidir tras leer código que lo use).

También: `propertySetId`, `buildingId`, `organizationId` → soporte para gestores con múltiples propiedades agrupadas. **Útil para Fase 4c**.

### 1.12 — Auth helper se llama `getAuthUser`, NO `getUser` ⚠️

CLAUDE.md decía `getUser(req)`. La realidad es **`getAuthUser(request)`** (en `src/lib/auth.ts` línea 30). También existen `requireAuth`, `requireAuthOrAdmin`, `requireAdmin`.

**Implicación**: brief V3 sección 7.1 está MAL. Voy a corregirlo. Y CLAUDE.md también necesita corrección.

### 1.13 — Sistema admin con audit log

`requireAuthOrAdmin` permite a admin hacer bypass de auth normal pero **registra cada acceso** en `adminAuditLog` con: adminId, adminEmail, targetUserId, action, ipAddress, userAgent, metadata. Buena base de seguridad para multi-tenant.

### 1.14 — `Step` model simple, no hay `Element` separado

```prisma
model Step {
  id, zoneId, type, title (Json), content (Json), order, isPublished
}
```

Confirma nomenclatura del repo: **Property → Zone → Step**. NO hay un nivel `Element` separado. El brief V3 ya estaba alineado.

### 1.15 — Chatbot zone ranking NO usa embeddings, usa `QUERY_EXPANSIONS`

`src/lib/chatbot-utils.ts` tiene un diccionario gigante de ~600 expansiones manuales. Ejemplos:
- `wifi` → `[wi-fi, internet, password, contrasena, clave, red, network, conexion]`
- `calefaccion` → `[climatizacion, calor, temperatura, termostato, radiador, heating, aire]`
- `puerta` → `[check, llave, acceso, entrada, door, lockbox, codigo]`

Cada query del huésped se expande con sinónimos antes de buscar en zonas. Funciona bien pero tiene 3 limitaciones:
1. Solo cubre lo que está hardcoded (no detecta sinónimos nuevos).
2. No entiende intención semántica compleja ("dónde dejo las llaves cuando me voy").
3. No funciona para idiomas no contemplados (alemán, italiano).

**pgvector lo COMPLEMENTA, no lo reemplaza**:
- `QUERY_EXPANSIONS` sigue como primer match (rápido, gratis, conocido).
- pgvector busca similitud semántica como fallback cuando QUERY_EXPANSIONS no acierta.
- Esto es la arquitectura correcta — keyword search + semantic search en cascada.

PR1 ahora se reframe: **añadir capa semántica complementaria, no reemplazo**. Sigue siendo 3-5 días pero con menos riesgo.

---

## 2. Próximos archivos a leer (sigo investigando)

### 2.1 — Lógica del chatbot
- [ ] `src/lib/chatbot-utils.ts` (802 líneas) — leer completo
- [ ] `app/api/chatbot/route.ts` — leer completo (parte queda por leer)
- [ ] `app/api/chatbot/check/route.ts`
- [ ] `app/api/chatbot/collect-email/route.ts`
- [ ] `app/api/chatbot/error-log/route.ts`
- [ ] `app/api/properties/[id]/chatbot/conversations/route.ts`
- [ ] `app/api/properties/[id]/chatbot/insights/route.ts`
- [ ] `app/api/properties/[id]/chatbot-health/route.ts`
- [ ] `app/api/properties/[id]/chatbot-qa/route.ts`
- [ ] `app/(dashboard)/properties/[id]/chatbot/page.tsx`

### 2.2 — Ai-setup (generador de zonas existente)
- [ ] `src/lib/ai-setup/generator.ts`
- [ ] `src/lib/ai-setup/zone-registry.ts`
- [ ] `src/lib/ai-setup/zone-builders.ts`
- [ ] `src/lib/ai-setup/vision.ts`

### 2.3 — Crons relevantes
- [ ] `app/api/cron/calendar-sync/route.ts`
- [ ] `app/api/cron/chatbot-insights/route.ts`
- [ ] `app/api/cron/guest-followup/route.ts`
- [ ] `app/api/cron/verifactu-status/route.ts`

### 2.4 — Gestión existente
- [ ] `app/(dashboard)/gestion/integraciones/page.tsx`
- [ ] `app/(dashboard)/gestion/calendario/`
- [ ] `app/(dashboard)/gestion/reservas/`
- [ ] `app/(dashboard)/gestion/liquidaciones/`
- [ ] `app/api/gestion/` (estructura completa)

### 2.5 — Modelos Prisma relevantes
- [ ] `ChatbotConversation` (línea 2324)
- [ ] `Property` y sus relaciones
- [ ] `Reservation` (estructura actual)
- [ ] `Zone`, `Step`, `Element`
- [ ] `PropertyExternalMapping` (existe ya)
- [ ] `User` y permisos

### 2.6 — Auth y middleware
- [ ] `src/lib/auth.ts`
- [ ] `middleware.ts`
- [ ] `src/lib/admin-auth.ts`
- [ ] `src/lib/api-keys.ts`

### 2.7 — SES.HOSPEDAJES existente
- [ ] `docs/ses-hospedajes-integracion.md`
- [ ] Buscar implementación parcial si existe

---

## 3. Implicaciones provisionales para el plan V3

### 3.1 — PR1 (pgvector) cambia ligeramente

Ya no es "construir desde cero búsqueda semántica". Es "mejorar el zone ranking actual de `chatbot-utils.ts` con embeddings". El alcance se mantiene (3-5 días) pero el riesgo de incompatibilidad es menor.

### 3.2 — PR2 (interface adapter) debe seguir patrón existente

Estudiar `app/api/integrations/gmail/` y `app/api/integrations/meta/` antes de diseñar `ExternalIntegrationAdapter`. Reutilizar OAuth helpers, encryption, webhooks que ya existan.

### 3.3 — PR3 (schema) tiene que coexistir

Algunos modelos pueden ya existir parcialmente (`PropertyExternalMapping`). Verificar antes de añadir nuevos.

### 3.4 — Fase 4c reducida significativamente

El módulo `gestion/` con 13 sub-módulos ya cubre 60-70% de lo que planeábamos construir. Fase 4c se convierte en "extender gestion/ con liquidaciones automáticas alimentadas por Reservation con datos OTA".

### 3.5 — Posible nuevo SKU "iCal-only"

Cliente con 1-2 propiedades, sin PMS, sin Beds24 master. Solo conecta URLs iCal de Airbnb/Booking → Itineramio importa reservas (read-only) → AlexAI responde por WhatsApp directo (sin canal OTA outbound). Pricing: 15-20€/prop/mes, margen ~85%.

---

## 4. Hallazgos del bloque 2 (auth, middleware, crons, SES, ai-setup)

### 4.1 — `chatbot-insights` cron (300s duration) ya hace análisis profundo

Cada ejecución:
- Clasifica topics con regex (parecido a QUERY_EXPANSIONS): check-in, wifi, restaurantes, transporte, climatización, emergencia, etc.
- Detecta perfil del huésped: tipo (pareja/familia/amigos), si tiene niños, idioma, food preferences (vegetariano, marisco, gourmet, económico).
- Agrega counts y profiles por propiedad/host.

**Implicación crítica**: la **mejora M2 propuesta** ("Score de salud del manual") **YA está en parte aquí**. AlexAI no debe construir esto desde cero. Debe **leer de `chatbot-insights` + `chatbot-quality-auditor.ts`** y unificar la salida.

### 4.2 — `guest-followup` cron es un workflow post-stay funcional

Diario 10am UTC:
- Encuentra conversaciones de hace 24-48h con `guestEmail`.
- Manda follow-up email automático.
- Marca `followUpSentAt` para no duplicar.

**Implicación**: **PR11 (workflows pre/post estancia) ya tiene base implementada**. Patrón a copiar/extender:
- Job scheduling con cron Vercel.
- Filtro por timestamp + flag de "ya enviado".
- Resend para email.
- Prisma para tracking.

PR11 se reduce de "construir scheduler desde cero" a "extender el patrón existente con más eventos (welcome, recordatorio, etc.)".

### 4.3 — `calendar-sync` cron está DESACTIVADO ⚠️

```typescript
return NextResponse.json({
  message: 'Calendar sync cron temporarily disabled',
  ...
})
```

Stub. No sincroniza nada hoy. Cuando llegue Beds24, hay que decidir:
- Reactivar este cron y meter lógica de sync Beds24, O
- Dejarlo como stub y crear `beds24-sync` separado.

Recomendación: **reactivar este cron** para mantener consistencia, renombrarlo si necesario.

### 4.4 — `middleware.ts` — sistema multi-panel ya existe

Manejo de 3 sistemas auth distintos:
- **Usuarios normales**: cookie `auth-token`, JWT verify con `JWT_SECRET`.
- **Admin**: cookie `admin-token`, `ADMIN_JWT_SECRET`, ruta `/admin`.
- **SATLLABOT panel**: cookie `satllabot-token`, `SATLLABOT_PANEL_SECRET`, ruta `/satllabot`. ← Es otro producto del usuario, NO es Itineramio.

Rutas protegidas con redirect a `/login`:
```
/main, /properties, /property-sets, /analytics, /account,
/media-library, /gestion/, /ai-setup
```

Slug rewriting para URLs limpias. El middleware ya es robusto.

**Implicación para AlexAI**:
- UI nueva irá bajo rutas protegidas (probablemente `/properties/[id]/alexai`, `/main/alexai-inbox`, etc.).
- API skipea middleware → cada endpoint hace su propia auth con `getAuthUser`.
- Para gating por whitelist email, en cada componente UI/API hacemos check tras `getAuthUser`.

### 4.5 — SES.HOSPEDAJES: doc técnica COMPLETA pero sin código

`docs/ses-hospedajes-integracion.md` es exhaustivo:
- Dos opciones de integración (SOAP directo Ministerio vs REST seshospedajes.es intermediario).
- 14 campos obligatorios por huésped (incluido el "número de soporte" — 3 chars del reverso DNI, considerado el más problemático).
- 8 campos transacción (referencia, fechas, tipo pago, titular medio pago, IBAN/tarjeta).
- Plazos: 24h confirmación, 3 años conservación.
- Tabla de diferencias por CCAA (cuerpo policial, sistema).

**No hay implementación en código** (búsqueda solo arroja menciones en blog/sitemap).

**Implicación para PR12 (Fase 3)**: doc técnica exhaustiva ya está. Implementación tarda 1-2 semanas siguiendo el doc, no 4 semanas de research + diseño + código.

### 4.6 — ai-setup `generator.ts` es el cerebro del wizard de manuales

Orquestador que:
1. Genera **zonas esenciales** (check-in, check-out, wifi, house-rules, emergency, recycling) con templates trilingues pre-built.
2. Genera **zonas user-defined** (uploads con descripción): user escribe, AI perfecciona texto + traduce.
3. Genera **zonas location** (directions): dinámicas de Google Places, ES → Claude Haiku traduce.
4. Genera **nearby recommendations** (farmacia, hospital, parking): OSM free data por defecto.

**Coste**: ~€0.05-0.10 por manual. Ya optimizado (no usa Vision AI, solo text improvement + translation).

Imports clave: `zone-content-templates.ts`, `zone-builders.ts` (16 builders), `zone-registry.ts` (APPLIANCE_REGISTRY, etc.).

**Implicación**: cuando un cliente conecte Beds24 (Fase 2), AlexAI puede llamar a `generator.ts` con datos del listing importado para auto-generar manual base. Mejora M3 reducida a un "pegamento" entre adapter Beds24 y generador existente.

### 4.7 — `getAuthUser` tiene `email` en el JWT payload

```typescript
export interface JWTPayload {
  userId: string
  email: string         // ← está aquí
  role: string
  isAdmin?: boolean
}
```

**Implicación**: el helper `isAlexAIBetaUser(user.email)` puede leer directamente del JWT decodificado, sin DB query adicional. Latencia cero. Patrón:

```typescript
const user = await getAuthUser(req)
if (!user || !isAlexAIBetaUser(user.email)) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
```

---

## 5. Implicaciones REVISADAS para los PRs de Fase 1+1.5

Aquí cambia bastante el plan tras la auditoría:

### PR1 — pgvector + ZoneEmbedding
**Antes V3**: 3-5 días, "construir búsqueda semántica desde cero".
**Después auditoría**: 3-4 días, "**capa semántica complementaria** sobre QUERY_EXPANSIONS existente". El ranking actual sigue funcionando como first match; pgvector como fallback semántico cuando keyword no acierta.

### PR2 — Interface `ExternalIntegrationAdapter`
**Antes V3**: 2-3 días, "diseñar interface desde cero".
**Después auditoría**: 3-4 días, "diseñar interface estudiando patrón existente en `app/api/integrations/{gmail, meta}` para mantener consistencia + considerar reutilización de helpers OAuth/encryption existentes". Más cuidadoso pero mismo orden de magnitud.

### PR3 — Schema completo
**Antes V3**: 3-4 días, "9 modelos nuevos".
**Después auditoría**: 2-3 días, "**extender modelos existentes**":
- `PropertyExternalMapping`: añadir 5 campos (externalIntegrationId, externalSubAccountId, hostRole, consentConfirmed, consentMetadata, tenantUserId, syncEnabled, lastSyncAt).
- `Reservation`: añadir 5 campos (externalIntegrationId, externalBookingId, registroViajerosStatus, publicToken, isRepeatGuest).
- `ChatbotConversation`: añadir 7 campos + rename con `@@map`.
- Crear NUEVOS: `ExternalIntegration`, `AiAssistantConfig`, `HostNotificationChannel`, `RawExternalMessage`, `GuestConsent`.

5 modelos nuevos + extensiones a 3 existentes. Más simple.

### PR4 — Anthropic singleton + caching
Sin cambios. 2-3 días. Realmente parte de cero (no veo cliente Anthropic en el repo, solo OpenAI en algunos endpoints).

### PR5 — Rename `ChatbotConversation → GuestConversation`
Sin cambios. 1 día con `@@map`.

### PR-MT — Tenant isolation primitives
**Antes V3**: 1.5-2 semanas.
**Después auditoría**: **2-2.5 semanas**. Razón: descubrí que el repo NO tiene primitivas de aislamiento explícitas — cada query confía en filtros ad-hoc `WHERE userId = ?`. Para `scope=MASTER` con sub-cuentas Beds24 esto NO basta. Necesitamos:
- `withTenant(userId)` helper que inyecta filtros automáticamente.
- Middleware `requireTenantContext` para rutas API que tocan datos cross-tenant.
- Logger con `tenantUserId` automático.
- Suite de tests anti-leak.
- Auditoría manual de queries existentes que ya tocarán datos AlexAI.

Más alcance del que pensaba. **Es la inversión más importante del Fase 1**.

---

## 6. Total revisado Fase 1 + 1.5

| Fase | Antes V3 | Tras auditoría |
|---|---|---|
| PR1 | 3-5 días | 3-4 días |
| PR2 | 2-3 días | 3-4 días |
| PR3 | 3-4 días | 2-3 días |
| PR4 | 2-3 días | 2-3 días |
| PR5 | 1 día | 1 día |
| PR-MT | 1.5-2 semanas (~10 días) | 2-2.5 semanas (~12 días) |
| **Total** | ~3-3.5 semanas | **~3-3.5 semanas** |

Total similar pero con confianza mucho mayor de que las estimaciones son realistas. Y además, **Fase 2 baja por la base existente que descubrí** (chatbot infra serio, guest-followup pattern, generator existente, SES doc completa).

---

## 7. Próximos archivos a leer (segundo round, no urgente)

- [ ] `chatbot-utils.ts` líneas 240-802 (lógica completa de prompt building + scoring).
- [ ] `app/api/properties/[id]/chatbot/insights/route.ts`.
- [ ] `app/api/cron/verifactu-status/route.ts` (estado actual de Verifactu).
- [ ] `app/(dashboard)/gestion/integraciones/page.tsx`.
- [ ] `app/api/integrations/gmail/` y `meta/` (patrón OAuth a reutilizar).
- [ ] `src/lib/ai-setup/zone-registry.ts` y `zone-builders.ts`.
- [ ] `src/lib/billing/`, `src/lib/gestion/`.

Estimación: 4-6h adicionales para cerrar el report definitivo.

---

## 8. Acciones inmediatas derivadas de la auditoría

1. **Actualizar CLAUDE.md** con métricas reales y `getAuthUser` (no `getUser`).
2. **Corregir brief V3 sección 7.1** (mismo punto: `getAuthUser`).
3. **Marcar tarea TIN-29** (Actualizar CLAUDE.md) como In progress.
4. **Decidir si SKU "iCal-only" entra al brief** o lo dejamos fuera por foco.
5. **Clarificar relación con `chatbot-quality-auditor.ts`** (en wip): este archivo solapa con `chatbot-insights` cron + lo que AlexAI haría. Decidir antes de mergear wip a main.

---

## 9. Estado de la auditoría

✅ **Hecho**: estructura, métricas, modelos clave, auth, middleware, crons principales, SES doc, ai-setup orchestrator, chatbot core (parcial), feature-flags existing.
⏳ **Pendiente**: chatbot prompt building completo, integraciones gestion, OAuth patterns Gmail/Meta, billing modules, Verifactu actual.

Suficiente para arrancar PR1 con confianza. El segundo round es nice-to-have, no bloqueante.
