# Brief V3 — Itineramio + AlexAI + Beds24

**Para:** Claude Code
**De:** Alejandro Satlla
**Fecha:** 1 de mayo de 2026
**Repositorio:** `/Users/alejandrosatlla/Documents/itineramio`
**Estado:** Fase 1 en curso (PR1 pgvector). Este V3 sustituye al V2 (`BRIEF_V2_ALEXAI_BEDS24.md` queda archivado como histórico).

---

## 0. Changelog V2 → V3

Cambios introducidos tras revisión de Alejandro y carga del `CLAUDE.md` del repo:

| Cambio | Motivo |
|---|---|
| Estimación Fase 2 ajustada de 5-7 sem → **12-16 semanas hábiles**, con desglose honesto por PR y riesgos identificados | Estimación V2 era optimista. V3 incluye buffer realista (Meta plantillas, iteración Beta, code review) |
| Nueva **Fase 1.5 — `PR-MT`: Tenant isolation primitives** antes de PR6 | Aislamiento multi-tenant no se puede improvisar PR a PR. Requiere primitivas dedicadas + suite de tests + auditoría |
| **Validación legal Beds24 Master** marcada como bloqueante para PR6 (no para PR2-PR5) | Compromiso comercial multi-tenant requiere confirmación escrita de Beds24. Plan B (PER_USER puro) preparado si dicen no |
| Fase 4 separada en **4a (PWA), 4b (Hostaway), 4c (gestión económica)** independientes | Cada sub-fase tiene drivers distintos. 4c con precondiciones explícitas |
| Fase 4c **postergada hasta 10-20 clientes piloto + asesor fiscal contratado + epígrafe verificado** | Módulo regulado de facturación AEAT no se construye sobre suposiciones |
| **SES.HOSPEDAJES** mantiene Fase 3 pero **bloqueada por consulta legal previa** (Alejandro se ocupa) | Es regulado, no se implementa sin asesoría |
| **Modelo 179 movido a Fase 5+** | Solo necesario cuando hay gestión económica activa con propietarios terceros |
| **Restricciones operativas del repo** integradas como sección 7.1 (no `console.log` en APIs nuevas, no `any`, tests críticos, `npm run check:quick`, commits en español, solo `git push`) | Reflejan reglas estrictas del `CLAUDE.md` ya existente |
| Fase 4c reducida en alcance: **integrar AlexAI + reservas externas con módulo `gestion/` existente**, no construir desde cero | El repo ya tiene `app/(dashboard)/gestion/` con reservas/facturación/clientes/liquidaciones y cron `verifactu-status` |
| Estimación tenant isolation explícita: **3-4 semanas adicionales** sumadas a Fase 2 | Suele subestimarse. Trabajo dedicado + distribuido + auditoría final |

---

## 1. Resumen ejecutivo

Itineramio deja de ser "manual digital + chatbot web" y pasa a ser **el sistema operativo completo del host español**, en tres capas integradas:

1. **Capa de conocimiento**: el manual estructurado por zonas y pasos que ya existe.
2. **Capa de inteligencia (AlexAI)**: agente IA multi-canal con memoria cross-channel y aprendizaje continuo.
3. **Capa de operaciones**: reservas, calendario, precios, compliance España, financiero, gestión de propietarios.

Diferenciadores frente a Hostaway / Hospitable / Smoobu / Avantio:

- **Cross-channel memory por reserva** (no por canal).
- **WhatsApp del host como interfaz operativa** (no app propia → diferenciador, no limitación).
- **Manual estructurado con multimedia** servido automáticamente por AlexAI.
- **Compliance España nativa**: SES.HOSPEDAJES, tasa turística, modelo 179.
- **Adapter pattern** que permite integrar cualquier PMS sin atarse a uno.
- **Modelo dual**: cliente sin PMS usa Beds24 master white-label (sujeto a validación legal); cliente con PMS conecta el suyo.

---

## 2. Arquitectura objetivo

### 2.1 — Adapter pattern como núcleo

```
                  ┌─────────────────────────┐
                  │     Itineramio Core     │
                  │  (manual, AI, gestión)  │
                  └────────────┬────────────┘
                               │
                  ┌────────────┴────────────┐
                  │ ExternalIntegrationAdapter │  ← interface (PR2)
                  │   (contrato común)         │
                  └────────────┬───────────────┘
                               │
        ┌──────────────┬───────┴───────┬──────────────┐
        │              │               │              │
   Beds24Master    Hostaway       Hospitable      Avantio
   (scope:MASTER)  (PER_USER)     (PER_USER)      (PER_USER)
   PR6+            Fase 4b        Fase 5          Fase 5
```

**Regla de diseño**: el core de Itineramio NO conoce el proveedor concreto. Solo habla con la interface. Los adapters traducen.

### 2.2 — Modelo dual de cliente

| Tipo cliente | Detección | Adapter | Quién paga channel manager |
|---|---|---|---|
| Sin PMS | "Gestiono manualmente" en onboarding | `Beds24MasterAdapter` con sub-cuenta dentro de master Itineramio (sujeto a validación legal Beds24) | Itineramio (incluido en suscripción) |
| Con PMS existente | "Uso Hostaway/Hospitable/etc." | Adapter específico del PMS, scope=PER_USER | Cliente paga su PMS directamente |

### 2.3 — Roles del host por propiedad

Tres roles que pueden o no coincidir, deben modelarse desde Fase 1:

- **Owner**: dueño legal del inmueble. A quien se liquida.
- **Manager**: usuario de Itineramio. Quien paga la suscripción.
- **Listing host**: cuya cuenta de Airbnb/Booking está conectada.

### 2.4 — Interfaz operativa del host

```
┌─────────────────────────────┐
│   Itineramio Web (PWA)      │ ← centro de configuración + analytics
│   - Manual editor           │
│   - AlexAI settings         │
│   - Reportes                │
│   - Conversaciones histórico│
└─────────────────────────────┘
            ▲
            │ usa para configurar
            │
        ┌───┴───┐
        │ Host  │
        └───┬───┘
            │ opera diariamente
            ▼
┌─────────────────────────────┐
│  WhatsApp Business del host │ ← interfaz operativa
│  - Recibe mensajes (todos)  │
│  - Aprueba/edita drafts     │
│  - Responde libre           │
│  - Recibe alertas críticas  │
│  - Comandos: /auto /silencia│
└─────────────────────────────┘
```

---

## 3. Modelos de datos clave

### 3.1 — `ExternalIntegration`

```prisma
model ExternalIntegration {
  id                    String   @id @default(cuid())

  scope                 ExternalIntegrationScope  // MASTER | PER_USER

  ownerUserId           String?
  owner                 User?    @relation(fields: [ownerUserId], references: [id])

  provider              ExternalProvider

  encryptedCredentials  String   // cifrado con HOST_CREDENTIALS_ENCRYPTION_KEY
  capabilities          Json     // capability flags por adapter

  status                IntegrationStatus
  lastSyncAt            DateTime?
  webhookSecret         String?

  externalAccountId     String?

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  mappings              ExternalPropertyMapping[]

  @@unique([scope, ownerUserId, provider])
}

enum ExternalIntegrationScope { MASTER, PER_USER }

enum ExternalProvider {
  BEDS24
  HOSTAWAY
  HOSPITABLE
  AVANTIO
  AVIRATO
  ICNEA
  LODGIFY
  SMOOBU
  GUESTY
  SUITECLERK
  WUBOOK
}

enum IntegrationStatus {
  ACTIVE
  ERROR_AUTH
  ERROR_SYNC
  PAUSED
  DISCONNECTED
}
```

### 3.2 — `ExternalPropertyMapping`

```prisma
model ExternalPropertyMapping {
  id                    String   @id @default(cuid())

  externalIntegrationId String
  externalIntegration   ExternalIntegration @relation(fields: [externalIntegrationId], references: [id])

  tenantUserId          String
  tenantUser            User     @relation("TenantPropertyMappings", fields: [tenantUserId], references: [id])

  itineramioPropertyId  String
  itineramioProperty    Property @relation(fields: [itineramioPropertyId], references: [id])

  externalPropertyId    String
  externalPropertyName  String?
  externalRoomId        String?
  externalSubAccountId  String?

  hostRole              ExternalPropertyRole
  consentConfirmed      Boolean  @default(false)
  consentMetadata       Json?

  syncEnabled           Boolean  @default(true)
  lastSyncAt            DateTime?

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@unique([externalIntegrationId, externalPropertyId])
  @@index([tenantUserId])
  @@index([itineramioPropertyId])
}

enum ExternalPropertyRole { OWNER, PRIMARY_CO_HOST, CO_HOST }
```

**Regla**: si `hostRole != OWNER` y `consentConfirmed = false`, el adapter **bloquea sync** a nivel BD. Bloqueo hard, no warning.

### 3.3 — `Reservation` (extendido sobre el actual)

```prisma
model Reservation {
  id                    String   @id @default(cuid())

  propertyId            String
  property              Property @relation(fields: [propertyId], references: [id])

  guestName             String
  guestEmail            String?
  guestPhone            String?
  guestCountry          String?
  guestLanguage         String?
  partyAdults           Int?
  partyChildren         Int?
  specialRequests       String?

  checkInDate           DateTime
  checkOutDate          DateTime

  externalIntegrationId String?
  externalBookingId     String?
  channel               ReservationChannel
  channelMetadata       Json?

  grossAmount           Decimal?
  otaCommission         Decimal?
  tourismTax            Decimal?
  netToHost             Decimal?
  currency              String     @default("EUR")
  paymentStatus         PaymentStatus

  publicToken           String?    @unique

  registroViajerosStatus RegistroViajerosStatus  @default(PENDING)
  registroViajerosSentAt DateTime?
  registroViajerosFileUrl String?

  status                ReservationStatus
  cancelledAt           DateTime?

  isRepeatGuest         Boolean    @default(false)
  previousReservationId String?

  conversations         GuestConversation[]

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@unique([externalIntegrationId, externalBookingId])
  @@index([propertyId, checkInDate])
  @@index([guestEmail])
  @@index([guestPhone])
}

enum ReservationChannel {
  AIRBNB, BOOKING, EXPEDIA, VRBO, DIRECT, WHATSAPP_DIRECT, OTHER
}
enum PaymentStatus { PAID, PARTIAL, PENDING, REFUNDED }
enum ReservationStatus { CONFIRMED, CANCELLED, COMPLETED, NO_SHOW }
enum RegistroViajerosStatus { PENDING, REQUESTED, COLLECTED, SUBMITTED, FAILED }
```

### 3.4 — `GuestConversation` (rename de `ChatbotConversation` con `@@map`)

```prisma
model GuestConversation {
  id                    String   @id @default(cuid())

  reservationId         String?
  reservation           Reservation? @relation(fields: [reservationId], references: [id])

  propertyId            String
  property              Property @relation(fields: [propertyId], references: [id])

  channel               ConversationChannel
  externalSource        String?
  externalThreadId      String?
  externalBookingId     String?

  guestIdentity         Json?

  status                ConversationStatus
  requiresHumanReview   Boolean   @default(false)
  reviewReason          String?

  messages              GuestMessage[]

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([reservationId])
  @@index([propertyId])
  @@map("chatbot_conversations")  // mantener tabla original, evita migración pesada
}

enum ConversationChannel {
  WEB, WHATSAPP_DIRECT, OTA_AIRBNB, OTA_BOOKING, OTA_EXPEDIA, OTA_VRBO, VOICE
}
enum ConversationStatus { ACTIVE, RESOLVED, ESCALATED, ARCHIVED }
```

### 3.5 — `GuestMessage`

```prisma
model GuestMessage {
  id                    String   @id @default(cuid())

  conversationId        String
  conversation          GuestConversation @relation(fields: [conversationId], references: [id])

  direction             MessageDirection
  body                  String
  bodyTranslated        Json?
  language              String?

  channel               ConversationChannel
  externalMessageId     String?   @unique

  mediaUrls             String[]
  mediaTypes            String[]

  generatedByAi         Boolean   @default(false)
  aiConfidence          Float?
  aiCategory            String?
  hostEdited            Boolean   @default(false)
  hostEditDiff          Json?

  createdAt             DateTime @default(now())

  @@index([conversationId, createdAt])
}

enum MessageDirection { INBOUND, OUTBOUND }
```

### 3.6 — `AiAssistantConfig` (por propiedad)

```prisma
model AiAssistantConfig {
  id                    String   @id @default(cuid())

  propertyId            String   @unique
  property              Property @relation(fields: [propertyId], references: [id])

  enabled               Boolean   @default(false)
  mode                  AiMode    @default(SUGGEST)

  autoCategories        String[]

  scheduleEnabled       Boolean    @default(false)
  scheduleAutoFrom      String?
  scheduleAutoTo        String?

  toneInstructions      String?
  languages             String[]   @default(["es", "en"])

  alwaysEscalateKeywords String[]  @default(["queja", "complaint", "fuga", "leak", "emergency", "policía", "cancelar", "refund"])

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

enum AiMode { OFF, SUGGEST, AUTO_SELECTIVE, AUTO_FULL, HYBRID_SCHEDULE }
```

### 3.7 — `HostNotificationChannel`

```prisma
model HostNotificationChannel {
  id                    String   @id @default(cuid())

  userId                String
  user                  User     @relation(fields: [userId], references: [id])

  type                  HostChannelType
  identifier            String
  verified              Boolean   @default(false)
  verifiedAt            DateTime?

  lastInboundFromHostAt DateTime?

  preferences           Json?

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([userId, type])
}

enum HostChannelType { WHATSAPP, EMAIL, SMS }
```

### 3.8 — `RawExternalMessage` (buffer)

```prisma
model RawExternalMessage {
  id                    String   @id @default(cuid())

  externalIntegrationId String
  externalBookingId     String?
  externalMessageId     String   @unique

  channel               ConversationChannel
  direction             MessageDirection
  body                  String
  rawPayload            Json

  processed             Boolean   @default(false)
  processedAt           DateTime?
  processingError       String?

  receivedAt            DateTime  @default(now())

  @@index([processed, receivedAt])
}
```

---

## 4. Modos de AlexAI

| Modo | Auto-responde | Sugiere | Notifica al host |
|------|---------------|---------|------------------|
| OFF | Nunca | No | Solo te reenvía mensajes tal cual |
| SUGGEST | Nunca | Sí | Cada mensaje con draft sugerido |
| AUTO_SELECTIVE | En categorías marcadas | En el resto | Auto: aviso resumen / Resto: con draft |
| AUTO_FULL | Casi todo | No | Solo escalados críticos + resumen diario |
| HYBRID_SCHEDULE | Según horario | Según horario | Según horario configurado |

**Reglas no negociables (independientes del modo):**

1. Mensajes con keywords críticas → **siempre** escalan al host.
2. Huéspedes marcados VIP → siempre escalan.
3. Importes mencionados > umbral → siempre escalan.
4. Misma pregunta repetida 3 veces → escala.
5. Confianza < umbral en categoría no marcada como auto → escala.
6. Host puede tomar control en cualquier momento.

---

## 5. Plan de fases revisado (V3)

### Fase 1 — Cimientos (PR1-PR5, 2-3 semanas)

**Objetivo:** schema y abstracciones base sin implementación de adapters todavía.

- **PR1** (en marcha): pgvector + ZoneEmbedding.
- **PR2**: `ExternalIntegrationAdapter` interface + capabilities matrix. **Diseño primero, código después.**
- **PR3**: schema completo con todos los modelos de sección 3.
- **PR4**: Singleton Anthropic + prompt caching + helpers de prompt.
- **PR5**: rename `ChatbotConversation → GuestConversation` con `@@map`.

**Sin cambios funcionales visibles para el usuario.**

### Fase 1.5 — Tenant Isolation Primitives (`PR-MT`, 1.5-2 semanas)

**Bloqueante para Fase 2. NO se arranca PR6 sin esto en sitio.**

- Helper `withTenant(tenantUserId)` que envuelve queries Prisma con filtro obligatorio.
- Middleware `requireTenantContext` para rutas API que tocan datos cross-tenant.
- Inyección de `tenantUserId` en logger context (todos los logs estructurados llevan tenant).
- Wrapper de cache tenant-aware (Upstash Redis con prefix por tenant).
- Suite de tests de aislamiento:
  - Cross-tenant leak prevention en queries Prisma.
  - Cross-tenant leak en webhooks (mensaje de Tenant A no debe llegar a Tenant B).
  - Cross-tenant leak en background jobs.
  - Fuzz testing automatizado (intentos sintéticos de acceder a `tenantUserId` ajeno).
- Documentación interna: `docs/MULTI_TENANT_ARCHITECTURE.md` con reglas para todo PR futuro que toque datos.

**Trabajo distribuido posterior** (no es PR-MT, son días sumados a PRs posteriores):
- Cada PR de Fase 2 que toca datos: +0.5-1 día dedicado a verificar isolation.
- Code review con foco en isolation: ~2-3 días distribuidos.
- Auditoría final al cerrar Fase 2: 3-5 días.

### Fase 2 — Beds24 Master + WhatsApp + AlexAI multi-canal (PR6-PR11, **12-16 semanas**)

**Objetivo:** primer adapter funcional + AlexAI respondiendo por todos los canales.

**Precondiciones (bloqueantes):**
- ✅ `PR-MT` (tenant isolation) en main.
- ✅ Validación legal Beds24 Master por escrito (ver sección 9). Si no llega luz verde, pasamos todos los clientes a `scope=PER_USER` y mantenemos modelo BYO.
- ✅ Refresh token Beds24 master generado y guardado (Alejandro).

**Desglose por PR:**

| PR | Trabajo | Estimación honesta | Riesgos |
|---|---|---|---|
| **PR6** | `Beds24MasterAdapter`: auth (refresh+access tokens, race conditions, cifrado), creación sub-cuentas vía API, sync propiedades read-only, UI de mapeo | **8-12 días** | Endpoint creación sub-cuentas puede no estar bien documentado |
| **PR7** | Backfill reservas con paginación + rate limits, webhooks con verificación firma + retry + dedup, tabla `RawExternalMessage` | **7-10 días** | Edge cases reservas modificadas/canceladas retroactivamente |
| **PR8** | `WhatsAppHostAdapter` con 360dialog, plantillas pre-aprobadas con Meta, gestión ventana 24h, multi-tenant routing | **10-15 días** | **Aprobación plantillas Meta: 2-7 días bloqueantes** |
| **PR9** | Pipeline AlexAI: identificación reserva, retrieval contexto (manual+histórico), draft generation con Anthropic + caching, aplicación modos, notificación host con botones inline | **10-14 días** | Iteración con Beta real, ajuste prompts |
| **PR10** | Send mode activado: routing respuesta del host al canal original, manejo formato por canal, multimedia | **5-7 días** | Quirks por canal (Airbnb filtra links, etc.) |
| **PR11** | Workflows pre/post estancia: scheduler, timezone-aware, templates por idioma, idempotencia | **6-9 días** | Manejo correcto timezones por propiedad |

**Total bruto: 46-67 días hábiles = 9-13 semanas hábiles.**

**Total con buffer realista (Beta iteration, code review, holidays, Meta wait, integration debug): 12-16 semanas.**

**Total Fase 2 con tenant isolation distribuido + auditoría final: 15-20 semanas.**

Beta cerrada con tus 4 propiedades + 1 clienta seleccionada al final de Fase 2.

### Fase 3 — Compliance España + financiero básico + reviews (PR12-PR16, 4-6 semanas)

**Precondición**: Alejandro completa consulta legal sobre SES.HOSPEDAJES antes de PR12. PR12 NO arranca sin luz verde legal.

- **PR12**: SES.HOSPEDAJES — solicitud docs por canal, OCR, generación XML/JSON, envío al portal del Ministerio.
- **PR13**: tasa turística por CCAA — cálculo + reporting.
- **PR14**: dashboard financiero — bruto/comisión/neto por reserva, agregado mensual. Aprovechar módulo `gestion/` existente.
- **PR15**: reviews automatizadas con timing optimizado por canal.
- **PR16**: detección huéspedes repetidores + descuento reserva directa.

### Fase 4a — PWA del host (3-4 semanas)

- PWA instalable en home screen.
- Push notifications básicas (limitadas en iOS, completas Android).
- Modo móvil del inbox (visualización threadeada cómoda en pantalla pequeña).
- Sincronización offline básica del manual.

### Fase 4b — HostawayAdapter (3-5 semanas)

**Disparador**: cuando un cliente concreto pida Hostaway, no antes.

- `HostawayAdapter` (OAuth2, webhooks, messaging).
- Validación con cliente real durante 2 semanas en shadow mode.
- Activación progresiva.

### Fase 4c — Gestión económica (postergada)

**Precondiciones explícitas (todas obligatorias):**
- ✅ 10-20 clientes piloto operativos en Itineramio.
- ✅ Asesor fiscal contratado especializado en SaaS + facturación turística.
- ✅ Epígrafe IAE/autónomo verificado.
- ✅ Diseño AEAT-compliant validado por asesor.

**Alcance reducido (no es construir desde cero):**
- Itineramio ya tiene `app/(dashboard)/gestion/` con reservas, facturación, clientes, liquidaciones y cron `verifactu-status`.
- Trabajo: integrar `Reservation` (con datos OTA) + AlexAI con módulo gestión existente. Configuración de propietario por propiedad, modelo comisión, generación de liquidaciones automáticas, factura propietario AEAT-compliant.

**Estimación una vez precondiciones cumplidas: 6-8 semanas.**

### Fase 5+ — Bajo demanda

- `HospitableAdapter`, `AvantioAdapter`, `LodgifyAdapter`, `SmoobuAdapter`.
- Modelo 179 (declaración trimestral cesión inmuebles a AEAT).
- Voice (Vapi).
- Analytics avanzados.
- App nativa iOS/Android (solo si tracción justifica).
- Modelo C: certificación directa Itineramio ↔ Airbnb/Booking (años 2-3).

---

## 6. Capabilities matrix por adapter

| Capability | Beds24 | Hostaway | Hospitable | Avantio | Lodgify | Smoobu |
|---|---|---|---|---|---|---|
| supportsReservations | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| supportsMessagingAirbnb | ✅ | ✅ | ✅ | ⚠️ | ❌ | ❌ |
| supportsMessagingBooking | ✅ | ✅ | ⚠️ | ⚠️ | ❌ | ❌ |
| supportsMessagingExpedia | ✅ | ⚠️ | ❌ | ⚠️ | ❌ | ❌ |
| supportsMessagingVrbo | ✅ | ✅ | ⚠️ | ❌ | ❌ | ❌ |
| supportsCalendarSync | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| supportsBookingWebhooks | ✅ | ✅ | ✅ | ⚠️ polling | ⚠️ | ✅ |
| supportsPriceSync | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| supportsMultiAccountMaster | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| supportsMediaInMessages | ✅ | ✅ | ⚠️ | ❌ | ❌ | ❌ |

La capability matrix se consulta en runtime, no se hardcodea. El onboarding del cliente debe avisar honestamente cuando un PMS limita el alcance (p.ej. Lodgify: AlexAI solo puede operar en WhatsApp y voz, no en OTAs).

---

## 7. Reglas de migración y seguridad (no negociables)

1. **Aditivo only**: nunca borrar/modificar columnas existentes en producción. Solo añadir.
2. **Feature flag por propiedad**: `Property.alexaiEnabled = false` por defecto. Nada se activa sin opt-in explícito.
3. **Shadow mode antes de auto**: AlexAI empieza en `SUGGEST` siempre. Nunca arranca en auto en propiedades de cliente externo.
4. **Beta con propiedades propias primero**: las 4 de Alejandro durante 2-4 semanas antes de tocar cliente externo.
5. **Beds24 read-only las primeras 2 semanas**: sync entrante validado antes de activar `POST /bookings/messages`.
6. **Endpoints versionados**: nuevo trabajo bajo `/api/alexai/*` o `/api/v2/*`. Endpoints existentes intactos.
7. **Backups antes de cada migration prod**: snapshot Neon point-in-time. Rollback documentado por PR.
8. **Co-host: bloqueo hard**, no warning. `consentConfirmed = false` → sync pausado en BD, no por UI.
9. **Observabilidad día uno**: log estructurado con `tenantUserId` de cada interacción AI (prompt, respuesta, confianza, edición), métricas de aceptación de drafts, alertas de tasa de descarte.
10. **Aislamiento multi-tenant**: con `scope=MASTER`, todos los queries filtran por `tenantUserId` siempre vía `withTenant()` helper. Tests específicos de isolation antes de merge.

### 7.1 — Restricciones operativas del repo (de `CLAUDE.md`)

Aplicables a todo PR futuro:

- **Sin `console.log` en APIs nuevas** — usar `logger.ts` o eliminar. (Verificado 2026-05-01: solo 3 console.logs en repo, todos legítimos en `logger.ts` y `error-logger.ts`. CLAUDE.md decía 1.495 — desactualizado tras merge de `feat/cleanup-console-logs-schema-indexes`.)
- **Sin `any` en TypeScript** — tipar correctamente.
- **Sin `try/catch` vacíos** que silencien errores.
- **Acceso a `process.env`** solo vía `src/lib/env-validation.ts`.
- **Auth en API routes**: `getUser(req)` de `src/lib/auth.ts`.
- **Rate limiting en rutas nuevas**: `checkRateLimitAsync()` de `@/lib/rate-limit`.
- **Tests obligatorios** para nuevas APIs críticas (auth, billing, gestión, AlexAI pipeline).
- **Pre-commit**: `npm run check:quick` debe pasar sin errores.
- **Commits**: formato `type: descripción en español`. Tipos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.
- **Deploy**: solo `git push` (deploy automático Vercel). NO usar `npx vercel --prod`. Acumular cambios en commits cuando sea posible.
- **UI**: sin emojis como iconos. Usar `lucide-react` o SVG. Emojis OK solo en notificaciones push (WhatsApp del host) y contenido editorial.

---

## 8. Pricing strategy (referencia, no implementación todavía)

### 8.1 — Coste Beds24 verificado (2026-05-01)

Tarifas oficiales públicas (https://beds24.com/pricing.html), modelo pay-as-you-go sin contratos:

| Concepto | Coste |
|---|---|
| Cuenta base con 1 unidad | **15,50€/mes** |
| Propiedad adicional | **3,00€/mes** |
| Unidad/habitación adicional dentro de propiedad multi-unit | 1,00€/mes |
| Canal conectado (1 link = 1 categoría × 1 OTA) | **0,55€/mes** |
| Usuario adicional con login | 2,00€/mes |
| SMS notificaciones | 0,10€/msg |
| Booking engine subdomain | 19,00€/mes |
| Onboarding personal (one-time) | desde 79€ |

**Coste por propiedad a escala (sin reseller agreement):**

| Volumen | Coste mensual total | Coste por propiedad |
|---|---|---|
| 4 propiedades × 4 OTAs (caso Alejandro) | ~33,30€/mes | 8,33€/prop |
| 100 propiedades × 4 OTAs | ~533€/mes | 5,33€/prop |
| 500 propiedades × 4 OTAs | ~2.612€/mes | 5,22€/prop |

**Estado actual cuenta master Itineramio (ID 165548)**: 12,90€ visible en Account Usage al 2026-05-01 (sin propiedades importadas todavía, sin canales activos). Pendiente confirmación con soporte sobre qué representa exactamente.

**Reseller program**: confirma que existe formalmente. Términos comerciales NO públicos — minimum monthly fee, descuentos por volumen y contrato modelo se obtienen aplicando vía https://beds24.com/reseller.html o support ticket. Pendiente aplicar (ver sección 9.3).

### 8.2 — SKUs de Itineramio (techo de precio real ~25€/prop/mes)

**Restricción de mercado** (Alejandro, 2026-05-01): el techo realista de pricing en mercado español para este perfil de cliente es **~25€/propiedad/mes**. Cifras superiores no son cobrables sin canibalizar la propuesta de valor frente a competencia local + hosts pequeños sensibles al precio.

| SKU | Para quién | Coste plataforma estimado | Precio techo | Margen bruto |
|---|---|---|---|---|
| **Itineramio Standalone** | Cliente sin PMS (Beds24 incluido) | 5,50€/prop (Beds24) + 3-7€ (Anthropic) + 1-3€ (WhatsApp) + 1€ (hosting) = **10,50-16,50€/prop/mes** | 25€/prop/mes | **8,50-14,50€/prop (34-58%)** |
| **Itineramio Connect** | Cliente con PMS propio | 3-7€ (Anthropic) + 1-3€ (WhatsApp) + 1€ (hosting) = **5-11€/prop/mes** | 25€/prop/mes | **14-20€/prop (56-80%)** |

**Implicaciones del techo de 25€:**

1. **Standalone tiene margen apretado** (34-58%). A escala bajo (1-10 propiedades por cliente) el coste fijo de Beds24 (cuenta base 15,50€) hace que cliente pequeño sea poco rentable o deficitario. **Standalone necesita reseller agreement con descuentos de volumen para ser viable**.

2. **Connect es claramente más rentable** (56-80% margen). Sin coste Beds24, cualquier propiedad es marginal positiva.

3. **Estrategia comercial sugerida** (a discutir):
   - Empujar Connect al segmento profesional (gestores con PMS propio).
   - Standalone solo a clientes pequeños donde 25€ es asumible y el coste Beds24 se prorratea sobre suficientes canales activos.
   - Buscar reseller agreement con Beds24 para bajar coste a ~3,5-4€/prop a escala (40% margen mejor).

4. **Pricing tiered con volumen**: para gestores con 50+ propiedades, 25€ × 50 = 1.250€/mes ya es serio. Hostaway aplica descuentos progresivos. Itineramio debe seguir el mismo modelo.

5. **Límite operativo del Standalone con Beds24**: si un cliente tiene 1-2 propiedades, el coste base Beds24 (15,50€ que se carga aunque no haya canales) hace que el margen sea casi 0 o negativo. **Considerar mínimo de 3 propiedades para aceptar Standalone**, o tarifa setup.

Implementar billing diferenciado es Fase 4-5. Por ahora suficiente con modelo de datos preparado y conocimiento de coste real.

---

## 9. Operativo: Alejandro vs Claude Code

### 9.1 — Acciones de Alejandro (paralelo, no bloquea PR2-PR5)

**Tracking en vivo**: ver database `📋 Tareas — AlexAI + Beds24` en Notion (bajo DEVELOPMENT). Las tareas se mueven a "Done" conforme se completan.

| Tarea | Estado | Bloquea | Prioridad |
|---|---|---|---|
| Email a Beds24 (Reseller program inquiry) | ✅ Enviado 2026-05-01 | Decisión Standalone vs Connect | Crítica |
| Contratar Beds24 Properties Manager | En curso (decisión tomada: contratar igualmente) | Refresh token + PR6 | Esta semana |
| Subir precios +14% en 4 propias publicadas | Pendiente | Importar a Beds24 | Esta semana |
| Importar 4 propiedades propias a Beds24 master | Pendiente | PR6 testing | Tras precios |
| Generar refresh token Beds24 master con scopes correctos | Pendiente | PR6 | Tras contratar |
| Guardar refresh token en password manager | Pendiente | — | Crítico — NO en chat ni email |
| Esperar respuesta Beds24 al email Reseller | En curso | Decisión Standalone viable | 2-7 días típico, hasta 2 semanas |
| Consulta legal sobre SES.HOSPEDAJES y GDPR | Pendiente | PR12 | Antes de Fase 3 |
| 2-3h asesoría fiscal SaaS + facturación reseller | Pendiente | Cobrar a clientes externos | Antes de Fase 4c |
| Solicitar Meta Tech Provider directo | Pendiente | Optimización WhatsApp | No urgente |
| Validar mercado: 5-10 entrevistas hosts reales | Pendiente | Confianza en PMF | Antes de mucho desarrollo Fase 2 |
| Definir T&C + Política Privacidad GDPR | Pendiente | Cobrar a primer cliente externo | Antes de Fase 4c |

**Cambios respecto V3 inicial:**
- ❌ "Hablar con propietarios co-host" eliminada del operativo. Decisión personal de Alejandro al margen del producto. Las propiedades co-host (Llamas, Casa Azul, Juan, Norma, Forni) **no entran en Beta personal de Alejandro**. Solo las 4 propias publicadas.
- ✅ Beds24 Properties Manager contratado **independientemente de respuesta del email Reseller** — sirve para multi-tenant si aprueban, o como PMS personal de Alejandro si no. No-regrets.

### 9.2 — Acciones de Claude Code

1. **Continuar PR1 sin cambios.** No afectado por nada de este update.
2. **Antes de PR2**: leer este V3 completo, responder a las preguntas de sección 11, esperar confirmación.
3. **PR2 priorizado**: diseño de la interface `ExternalIntegrationAdapter`. Activo arquitectónico crítico. 1-2 días de diseño bien hecho ahorra semanas.
4. **PR3-PR5**: schema completo según sección 3.
5. **PR-MT (Fase 1.5)**: tenant isolation primitives. **Bloqueante para Fase 2.**
6. **NO arrancar PR6** hasta que Alejandro confirme:
   - Refresh token Beds24 disponible.
   - Respuesta Beds24 al email Reseller (define si Standalone es viable comercialmente como multi-tenant, o si pasamos a `scope=PER_USER` puro como Plan B).

### 9.3 — Template email a Beds24 sobre validación legal

**A enviar por Alejandro a `support@beds24.com` esta semana:**

> *Subject: Commercial multi-tenant white-label use under Properties Manager — confirmation request*
>
> *Hi Beds24 team,*
>
> *We are Itineramio, a Spanish SaaS platform for short-term rental hosts. We are building on top of Beds24 as our channel manager infrastructure.*
>
> *Our intended commercial model: Itineramio holds a Properties Manager account; our customers' properties are hosted as sub-accounts within our master account; our customers never sign up directly with Beds24, never log into Beds24's UI, and never see Beds24 in their billing — they pay Itineramio a single monthly subscription that includes the channel manager service. Itineramio API-manages everything centrally on their behalf via our master account credentials.*
>
> *Could you confirm in writing whether this commercial multi-tenant white-label model is permitted under your standard Properties Manager plan, or whether it requires a Reseller / Partner Agreement?*
>
> *If a Partner Agreement is required, what are the prerequisites (volume, account standing, etc.) and approximate timeline for approval?*
>
> *We want this confirmation before committing engineering effort to the architecture.*
>
> *Many thanks,*
> *Alejandro Satlla — Founder, Itineramio*

**Posibles respuestas y acción técnica:**

| Respuesta | Acción |
|---|---|
| ✅ Permitido bajo Properties Manager estándar | Procede con `scope=MASTER` en producción |
| ⚠️ Permitido pero requiere Partner Agreement | Negocia el acuerdo. PR6 puede arrancar implementación, pero NO se activan clientes externos hasta firmar |
| ❌ No permitido | **Plan B**: solo `scope=PER_USER`. Arquitectura ya lo soporta, **no perdemos código**. Cambia operativa: cliente trae su Beds24 con onboarding asistido |

---

## 10. Preguntas para Claude Code antes de arrancar PR2

(Las respuestas se anotan aquí cuando Claude Code las dé.)

1. ¿Confirmas que PR1 (pgvector) sigue tal cual? No debería verse afectado.
2. ¿Ves riesgos en el diseño de `ExternalIntegrationAdapter` como interface única para Beds24 master + adapters PER_USER? Especialmente sobre tokens (master vs per-user) y el flujo de creación de sub-cuentas.
3. ¿La rename `ChatbotConversation → GuestConversation` con `@@map` te parece la opción más segura, o ves alternativa mejor?
4. ¿Tu estimación 12-16 semanas para Fase 2 + 3-4 semanas adicionales de tenant isolation distribuido encaja con tu lectura del repo, o ves recortes posibles sin sacrificar calidad?
5. ¿Ves algún riesgo arquitectónico crítico no contemplado, especialmente alrededor de:
   - Aislamiento multi-tenant en `scope=MASTER`
   - Memoria conversacional cross-channel por reserva
   - Manejo de la ventana 24h de WhatsApp Business para notificar al host
   - Bloqueo hard de co-host sin consentimiento

---

## 11. Recursos y referencias

### Beds24
- Wiki API V2: https://wiki.beds24.com/index.php/Category:API_V2
- Swagger: https://beds24.com/api/v2/
- Webhooks: https://wiki.beds24.com/index.php/Category:Webhooks
- Messaging: https://wiki.beds24.com/index.php/Category:Messaging
- Properties Manager pricing: revisar en beds24.com cuando llegue el momento de contratar

### Compliance España
- SES.HOSPEDAJES (registro viajeros)
- Modelo 179 (declaración trimestral cesión inmuebles a AEAT) — Fase 5+

### WhatsApp Business
- 360dialog (provider recomendado para multi-tenant)
- Documentación plantillas: developers.facebook.com/docs/whatsapp

### Documentación interna del repo
- `CLAUDE.md` — contexto persistente (auth, stack, reglas)
- `docs/SCHEMA-CHANGES-GESTION.md` — cambios pendientes en módulo gestión (cruzar con Fase 4c)
- `docs/ses-hospedajes-integracion.md` — base previa de SES (cruzar con PR12)
- `BRIEF_V2_ALEXAI_BEDS24.md` — versión anterior, archivada

---

## 12. Próximo paso concreto

**Secuencia bloqueante:**

1. ✅ Claude Code termina PR1.
2. ✅ Claude Code lee este V3 y responde a las 5 preguntas de sección 10.
3. Alejandro envía email validación legal a Beds24 (sección 9.3).
4. Alejandro contrata Beds24 Properties Manager.
5. Claude Code arranca PR2 (diseño interface adapter) — **no requiere validación legal todavía**.
6. Claude Code arranca PR3, PR4, PR5 (schema, Anthropic singleton, rename).
7. Claude Code arranca **PR-MT (Fase 1.5)** tenant isolation primitives.
8. Espera respuesta validación legal Beds24.
9. Si validación OK: arranca PR6 (Beds24MasterAdapter scope=MASTER).
10. Si validación NO: arranca PR6 (Beds24MasterAdapter scope=PER_USER, modelo BYO asistido).

**Lo importante**: PR2 hasta PR-MT son agnósticos al modelo Beds24 (MASTER vs PER_USER). Avanzan en paralelo sin esperar.

---

**Cierre.** V3 cierra con estimaciones honestas, validación legal explícita, isolation como tarea de primera clase, y plan de fases que respeta la deuda técnica del repo. El producto sigue siendo el mismo: SO completo del host español, multi-PMS via adapter pattern, WhatsApp como interfaz, compliance España como diferenciador local.
