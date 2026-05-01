# Brief V2 — Itineramio + AlexAI + Beds24

**Para:** Claude Code
**De:** Alejandro Satlla
**Fecha:** 1 de mayo de 2026
**Repositorio:** `/Users/alejandrosatlla/Documents/itineramio`
**Estado:** Fase 1 en curso (PR1 pgvector). Este documento sustituye al brief V1 y consolida las decisiones cerradas en sesión de producto del 1 de mayo.

---

## 1. Resumen ejecutivo

Itineramio deja de ser "manual digital + chatbot web" y pasa a ser **el sistema operativo completo del host español**, en tres capas integradas:

1. **Capa de conocimiento**: el manual estructurado por zonas y pasos que ya existe.
2. **Capa de inteligencia (AlexAI)**: agente IA multi-canal con memoria cross-channel y aprendizaje continuo.
3. **Capa de operaciones**: reservas, calendario, precios, compliance España, financiero, gestión de propietarios.

Diferenciadores frente a Hostaway / Hospitable / Smoopu / Avantio:

- **Cross-channel memory por reserva** (no por canal).
- **WhatsApp del host como interfaz operativa** (no app propia → diferenciador, no limitación).
- **Manual estructurado con multimedia** servido automáticamente por AlexAI.
- **Compliance España nativa**: SES.HOSPEDAJES, tasa turística, modelo 179.
- **Adapter pattern** que permite integrar cualquier PMS sin atarse a uno.
- **Modelo dual**: cliente sin PMS usa Beds24 master white-label; cliente con PMS conecta el suyo.

---

## 2. Cambios sobre el brief V1

| Decisión | V1 | V2 |
|---|---|---|
| Modelo de relación con Beds24 | BYO (cliente trae su Beds24) | **Master account de Itineramio (white-label)** + adapters PER_USER para clientes con PMS propio |
| Cobertura de canales en v1 | Solo WhatsApp | **Todos los canales** (Airbnb + Booking + Expedia + Vrbo + WhatsApp + Voice) |
| Adapter principal Fase 2 | SuiteClerk | **Beds24 Master** |
| Interfaz operativa del host | Web Itineramio | **WhatsApp Business del host** + web como centro de configuración |
| Compliance España | No contemplado | **Killer feature local** desde Fase 3 (SES.HOSPEDAJES) |
| Plan de adapters | Hostaway/Hospitable en Fase 4 | Hostaway en Fase 4 (no Fase 2), Hospitable + Avantio en Fase 5, resto bajo demanda |
| Pricing | SKU único | **Dos SKUs**: Standalone (Beds24 incluido) y Connect (BYO PMS) |
| Modos de AlexAI | "Auto + escalado" | **5 modos** (Off / Sugerencia / Auto Selectivo / Auto Total / Híbrido) + escalado obligatorio en críticos |
| App móvil | Pendiente | NO se construye app nativa. WhatsApp es interfaz. PWA en Fase 4 si tracción lo justifica |

---

## 3. Arquitectura objetivo

### 3.1 — El patrón adapter como núcleo

```
                  ┌─────────────────────────┐
                  │     Itineramio Core     │
                  │  (manual, AI, gestión)  │
                  └────────────┬────────────┘
                               │
                  ┌────────────┴────────────┐
                  │ ExternalIntegrationAdapter │  ← interface
                  │   (contrato común)         │
                  └────────────┬───────────────┘
                               │
        ┌──────────────┬───────┴───────┬──────────────┐
        │              │               │              │
   Beds24Master    Hostaway       Hospitable      Avantio
   (scope:MASTER)  (PER_USER)     (PER_USER)      (PER_USER)
        │              │               │              │
   ┌────┴────┐         │               │              │
   │ Airbnb  │         │               │              │
   │ Booking │         │               │              │
   │ Expedia │         │               │              │
   │  Vrbo   │         │               │              │
   └─────────┘
```

**Regla de diseño**: el core de Itineramio NO conoce el proveedor concreto. Solo habla con la interface. Los adapters traducen.

### 3.2 — Modelo dual de cliente

| Tipo cliente | Detección | Adapter | Quién paga channel manager |
|---|---|---|---|
| Sin PMS | "Gestiono manualmente" en onboarding | `Beds24MasterAdapter` con sub-cuenta dentro de master Itineramio | Itineramio (incluido en suscripción) |
| Con PMS existente | "Uso Hostaway/Hospitable/etc." | Adapter específico del PMS, scope=PER_USER | Cliente paga su PMS directamente |

### 3.3 — Roles del host por propiedad

Tres roles que pueden o no coincidir, deben modelarse desde Fase 1:

- **Owner**: dueño legal del inmueble. A quien se liquida.
- **Manager**: usuario de Itineramio. Quien paga la suscripción.
- **Listing host**: cuya cuenta de Airbnb/Booking está conectada.

En propiedad propia los tres son la misma persona. En co-hosting son distintos.

### 3.4 — Interfaz operativa del host

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

## 4. Modelos de datos clave

### 4.1 — `ExternalIntegration`

```prisma
model ExternalIntegration {
  id                    String   @id @default(cuid())

  scope                 ExternalIntegrationScope  // MASTER | PER_USER

  // Solo si scope = PER_USER
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

enum ExternalIntegrationScope {
  MASTER       // una sola fila para Itineramio (Beds24 master)
  PER_USER     // una fila por cliente con su PMS
}

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

### 4.2 — `ExternalPropertyMapping`

```prisma
model ExternalPropertyMapping {
  id                    String   @id @default(cuid())

  externalIntegrationId String
  externalIntegration   ExternalIntegration @relation(fields: [externalIntegrationId], references: [id])

  // Tenant (cliente Itineramio dueño de esta propiedad).
  // En scope=MASTER nos dice de qué cliente es.
  // En scope=PER_USER coincide con ExternalIntegration.ownerUserId.
  tenantUserId          String
  tenantUser            User     @relation("TenantPropertyMappings", fields: [tenantUserId], references: [id])

  itineramioPropertyId  String
  itineramioProperty    Property @relation(fields: [itineramioPropertyId], references: [id])

  externalPropertyId    String
  externalPropertyName  String?
  externalRoomId        String?
  externalSubAccountId  String?  // sub-cuenta Beds24 si scope=MASTER

  hostRole              ExternalPropertyRole
  consentConfirmed      Boolean  @default(false)
  consentMetadata       Json?    // IP, user-agent, timestamp del consentimiento

  syncEnabled           Boolean  @default(true)
  lastSyncAt            DateTime?

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@unique([externalIntegrationId, externalPropertyId])
  @@index([tenantUserId])
  @@index([itineramioPropertyId])
}

enum ExternalPropertyRole {
  OWNER
  PRIMARY_CO_HOST
  CO_HOST
}
```

**Regla**: si `hostRole != OWNER` y `consentConfirmed = false`, el adapter **bloquea sync**. Es bloqueo hard, no warning.

### 4.3 — `Reservation` (extendido sobre el actual)

```prisma
model Reservation {
  id                    String   @id @default(cuid())

  // Propiedad y huésped
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

  // Fechas
  checkInDate           DateTime
  checkOutDate          DateTime

  // Origen / canal
  externalIntegrationId String?
  externalBookingId     String?
  channel               ReservationChannel
  channelMetadata       Json?      // ID listing, sub-id habitación, etc.

  // Económico
  grossAmount           Decimal?
  otaCommission         Decimal?
  tourismTax            Decimal?
  netToHost             Decimal?
  currency              String     @default("EUR")
  paymentStatus         PaymentStatus

  // Token público para guest portal
  publicToken           String?    @unique

  // Compliance
  registroViajerosStatus RegistroViajerosStatus  @default(PENDING)
  registroViajerosSentAt DateTime?
  registroViajerosFileUrl String?

  // Lifecycle
  status                ReservationStatus
  cancelledAt           DateTime?

  // Repeat guest detection
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
  AIRBNB
  BOOKING
  EXPEDIA
  VRBO
  DIRECT
  WHATSAPP_DIRECT
  OTHER
}

enum PaymentStatus { PAID, PARTIAL, PENDING, REFUNDED }
enum ReservationStatus { CONFIRMED, CANCELLED, COMPLETED, NO_SHOW }
enum RegistroViajerosStatus { PENDING, REQUESTED, COLLECTED, SUBMITTED, FAILED }
```

### 4.4 — `GuestConversation` (rename de `ChatbotConversation`, con multi-canal)

```prisma
model GuestConversation {
  id                    String   @id @default(cuid())

  reservationId         String?
  reservation           Reservation? @relation(fields: [reservationId], references: [id])

  propertyId            String
  property              Property @relation(fields: [propertyId], references: [id])

  channel               ConversationChannel
  externalSource        String?    // "beds24", "whatsapp_direct", null
  externalThreadId      String?
  externalBookingId     String?

  // Identidad del huésped
  guestIdentity         Json?      // unificado por reserva, no por canal

  // Estado
  status                ConversationStatus
  requiresHumanReview   Boolean   @default(false)
  reviewReason          String?

  messages              GuestMessage[]

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([reservationId])
  @@index([propertyId])
}

enum ConversationChannel {
  WEB
  WHATSAPP_DIRECT
  OTA_AIRBNB
  OTA_BOOKING
  OTA_EXPEDIA
  OTA_VRBO
  VOICE
}

enum ConversationStatus { ACTIVE, RESOLVED, ESCALATED, ARCHIVED }
```

### 4.5 — `GuestMessage`

```prisma
model GuestMessage {
  id                    String   @id @default(cuid())

  conversationId        String
  conversation          GuestConversation @relation(fields: [conversationId], references: [id])

  direction             MessageDirection  // INBOUND | OUTBOUND
  body                  String
  bodyTranslated        Json?     // {"en":"...", "es":"..."}
  language              String?

  channel               ConversationChannel  // por si la conversación cruza canales
  externalMessageId     String?   @unique

  // Multimedia
  mediaUrls             String[]
  mediaTypes            String[]

  // AlexAI
  generatedByAi         Boolean   @default(false)
  aiConfidence          Float?
  aiCategory            String?   // "wifi", "checkin", "complaint", etc.
  hostEdited            Boolean   @default(false)
  hostEditDiff          Json?     // diff entre draft y enviado, para training

  createdAt             DateTime @default(now())

  @@index([conversationId, createdAt])
}

enum MessageDirection { INBOUND, OUTBOUND }
```

### 4.6 — `AiAssistantConfig` (por propiedad)

```prisma
model AiAssistantConfig {
  id                    String   @id @default(cuid())

  propertyId            String   @unique
  property              Property @relation(fields: [propertyId], references: [id])

  enabled               Boolean   @default(false)
  mode                  AiMode    @default(SUGGEST)

  // Auto Selectivo: categorías auto-aprobadas
  autoCategories        String[]   // ["wifi", "checkin", "directions", ...]

  // Híbrido por horario
  scheduleEnabled       Boolean    @default(false)
  scheduleAutoFrom      String?    // "22:00"
  scheduleAutoTo        String?    // "09:00"

  // Voz / personalidad
  toneInstructions      String?
  languages             String[]   @default(["es", "en"])

  // Escalado obligatorio (no se desactiva)
  alwaysEscalateKeywords String[]  @default(["queja", "complaint", "fuga", "leak", "emergency", "policía", "cancelar", "refund"])

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

enum AiMode {
  OFF
  SUGGEST
  AUTO_SELECTIVE
  AUTO_FULL
  HYBRID_SCHEDULE
}
```

### 4.7 — `HostNotificationChannel` (canal del host para WhatsApp)

```prisma
model HostNotificationChannel {
  id                    String   @id @default(cuid())

  userId                String
  user                  User     @relation(fields: [userId], references: [id])

  type                  HostChannelType   // WHATSAPP, EMAIL
  identifier            String              // número de tel o email
  verified              Boolean   @default(false)
  verifiedAt            DateTime?

  // WhatsApp Business: ventana 24h
  lastInboundFromHostAt DateTime?

  preferences           Json?     // qué eventos notificar, frecuencia

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([userId, type])
}

enum HostChannelType { WHATSAPP, EMAIL, SMS }
```

### 4.8 — Tabla intermedia `RawExternalMessage` (buffer antes de procesar)

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

Función: cualquier webhook entrante se guarda aquí PRIMERO, después se procesa async. Si falla el procesado, se reintenta. Garantiza que ningún mensaje se pierde.

---

## 5. Modos de AlexAI

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
3. Importes mencionados > X € → siempre escalan.
4. Misma pregunta repetida 3 veces → escala (señal de frustración).
5. Confianza < umbral en categoría no marcada como auto → escala.
6. Host puede tomar control de cualquier conversación: `[👤 Yo respondo]` desde WhatsApp o `/yo {bookingId}`.

---

## 6. Plan de fases revisado

### Fase 1 — Cimientos (en curso, 2-3 semanas)

**Objetivo:** schema y abstracciones base sin implementación de adapters todavía.

- **PR1** (en marcha): pgvector + ZoneEmbedding.
- **PR2**: `ExternalIntegrationAdapter` interface + capabilities matrix. **Diseño primero, código después.** Este PR define el contrato común sobre el que se construye todo.
- **PR3**: schema completo:
  - `ExternalIntegration` con `scope`.
  - `ExternalPropertyMapping` con `hostRole` + `consentConfirmed`.
  - `Reservation` extendido (con compliance fields).
  - `GuestConversation` con `channel`.
  - `GuestMessage` con campos AI.
  - `AiAssistantConfig`.
  - `HostNotificationChannel`.
  - `RawExternalMessage`.
  - Modelo `Owner` + roles `Manager` / `ListingHost` en `Property`.
- **PR4**: Singleton Anthropic + prompt caching + helpers de prompt.
- **PR5**: rename `ChatbotConversation → GuestConversation` con `@@map` para no migrar tabla en BD. `channel = WEB` por defecto en filas existentes.

**Sin cambios funcionales visibles para el usuario.** Itineramio sigue igual.

### Fase 2 — Beds24 Master + WhatsApp + AlexAI multi-canal (5-7 semanas)

**Objetivo:** primer adapter funcionando + AlexAI respondiendo por todos los canales.

- **PR6**: `Beds24MasterAdapter` — auth (refresh token + access token), creación de sub-cuentas via API, sync de propiedades (read-only).
- **PR7**: backfill de reservas + webhooks + dedup. Read-only durante 2 semanas.
- **PR8**: `WhatsAppHostAdapter` — conexión 360dialog/Twilio multi-tenant, plantillas pre-aprobadas, ventana 24h.
- **PR9**: pipeline AlexAI completo:
  - Recibe mensaje (cualquier canal).
  - Identifica reserva + huésped.
  - Genera draft con contexto (manual + reserva + histórico).
  - Aplica modo configurado.
  - Notifica al host por WhatsApp con botones inline.
  - Recibe respuesta del host → enruta al canal original.
- **PR10**: send mode activado. Envío real de respuestas a OTAs.
- **PR11**: workflows automáticos básicos (welcome 7 días antes, recordatorio 2 días antes, post-checkout review request).

**Beta cerrada con tus 4 propiedades + 1 clienta seleccionada.**

### Fase 3 — Compliance España + financiero básico + reviews (4-6 semanas)

- **PR12**: SES.HOSPEDAJES — solicitud de docs por canal, OCR, generación XML/JSON, envío automático.
- **PR13**: tasa turística por CCAA — cálculo + reporting.
- **PR14**: dashboard financiero del host — bruto/comisión/neto por reserva, agregado mensual.
- **PR15**: reviews automatizadas con timing optimizado por canal.
- **PR16**: detección de huéspedes repetidores + descuento reserva directa.

### Fase 4 — Hostaway adapter + PWA + gestión económica (6-8 semanas)

**Disparador**: cuando un cliente concreto pida Hostaway, no antes.

- **PR17**: `HostawayAdapter` (OAuth2, webhooks, messaging). Validación con cliente que lo pida.
- **PR18**: PWA del host — instalable, push notifications básicas, modo móvil del inbox.
- **PR19**: módulo gestión económica para co-hosting (alcance acotado tras consulta con asesor fiscal):
  - Configuración propietario por propiedad.
  - Modelo comisión (porcentaje / cuota / híbrido).
  - Liquidación mensual calculada.
  - Generación factura propietario (con asesoría fiscal previa para AEAT compliance).
  - Email automático a propietarios.

### Fase 5+ — bajo demanda

- `HospitableAdapter`, `AvantioAdapter`, `LodgifyAdapter`, `SmoobuAdapter`, etc.
- Voice (Vapi) integración.
- Analytics avanzados.
- App nativa iOS/Android (solo si tracción justifica).
- Modelo C: certificación directa Itineramio ↔ Airbnb/Booking (años 2-3).

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
9. **Observabilidad día uno**: log estructurado de cada interacción AI (prompt, respuesta, confianza, edición), métricas de aceptación de drafts, alertas de tasa de descarte.
10. **Aislamiento multi-tenant**: con `scope = MASTER`, todos los queries filtran por `tenantUserId` siempre. Tests específicos de isolation antes de merge.

---

## 8. Pricing strategy (referencia, no implementación todavía)

Dos SKUs naturales que la arquitectura habilita:

| SKU | Para quién | Incluye | Coste plataforma | Precio orientativo |
|---|---|---|---|---|
| **Itineramio Standalone** | Cliente sin PMS | Manual + AlexAI + Beds24 master white-label + compliance | ~5-10€/prop/mes (Beds24) | 50-80€/prop/mes |
| **Itineramio Connect** | Cliente con PMS propio | Manual + AlexAI + adapter del PMS del cliente + compliance | ~0€/prop/mes (cliente paga su PMS) | 30-50€/prop/mes |

Implementar SKU/billing es Fase 4-5. Por ahora suficiente con el modelo de datos preparado.

---

## 9. Operativo: Alejandro vs Claude Code

### Acciones de Alejandro (paralelo, no bloquea código)

| Tarea | Estado | Prioridad |
|---|---|---|
| Hablar con propietarios co-host | Pendiente | Esta semana — su decisión |
| Subir precios +14% en propias publicadas | Pendiente | Antes de importar a Beds24 |
| Importar 3 propiedades propias publicadas a Beds24 | Pendiente | Tras subir precios |
| Contratar Beds24 Properties Manager | Pendiente | Esta semana |
| Email a Beds24 sobre Partner Agreement (largo plazo) | Pendiente | Esta semana, sin urgencia |
| Reservar 2-3h asesoría fiscal SaaS+facturación | Pendiente | Antes de Fase 4 (gestión económica) |
| Solicitar Meta Tech Provider directo | Pendiente | No urgente |
| Generar refresh token Beds24 master con scopes correctos | Pendiente | Tras contratar Properties Manager |
| Guardar refresh token en password manager | Pendiente | Crítico — NO en chat ni email |

### Acciones de Claude Code

1. **Continuar PR1 sin cambios.** No afectado por nada de este update.
2. **Antes de PR2**: leer este documento completo, responder a las preguntas de la sección 11, esperar confirmación.
3. **PR2 priorizado**: diseño de la interface `ExternalIntegrationAdapter`. Es el activo arquitectónico más importante. 1-2 días de diseño bien hecho ahorra semanas.
4. **PR3-PR5**: schema completo según sección 4.
5. **NO arrancar Fase 2** hasta que Alejandro confirme refresh token Beds24 disponible y propietarios co-host resueltos.

---

## 10. Capabilities matrix por adapter

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

**Implicación operativa:** cuando un cliente trae un PMS con messaging limitado, AlexAI lo notifica explícitamente en onboarding y opera solo en los canales soportados. La capability matrix se consulta en runtime, no se hardcodea.

---

## 11. Preguntas para que Claude Code responda antes de PR2

1. ¿Confirmas que PR1 (pgvector) sigue tal cual? No debería verse afectado.
2. ¿Ves riesgos en el diseño de `ExternalIntegrationAdapter` como interface única para Beds24 master + adapters PER_USER? Especialmente sobre tokens (master vs per-user) y el flujo de creación de sub-cuentas.
3. ¿La rename `ChatbotConversation → GuestConversation` con `@@map` para no migrar tabla en BD te parece la opción más segura, o ves alternativa mejor?
4. Estimación realista en semanas para Fase 2 completa con Beds24 master + WhatsApp + AlexAI multi-canal + workflows básicos. Sé honesto, prefiero 7 semanas reales que 4 optimistas.
5. ¿Ves algún riesgo arquitectónico crítico que no esté contemplado, especialmente alrededor de:
   - Aislamiento multi-tenant en scope=MASTER
   - Memoria conversacional cross-channel por reserva
   - Manejo de la ventana 24h de WhatsApp Business para notificar al host
   - Bloqueo hard de co-host sin consentimiento

---

## 12. Recursos y referencias

### Beds24
- Wiki API V2: https://wiki.beds24.com/index.php/Category:API_V2
- Swagger: https://beds24.com/api/v2/
- Webhooks: https://wiki.beds24.com/index.php/Category:Webhooks
- Messaging: https://wiki.beds24.com/index.php/Category:Messaging
- Properties Manager plan: revisar pricing actual en beds24.com

### Compliance España
- SES.HOSPEDAJES: plataforma del Ministerio del Interior para registro de viajeros
- Modelo 179: declaración trimestral cesión inmuebles a AEAT

### WhatsApp Business
- 360dialog: provider recomendado para multi-tenant
- Documentación plantillas: developers.facebook.com/docs/whatsapp

### Documentación interna
- Brief V1 (este documento lo sustituye)
- ARCHITECTURE.md: pendiente actualización (Zone → Step nomenclature, no Section → Element)
- CLAUDE.md: pendiente corrección (`getAuthUser` no `getUser`)

---

## 13. Próximo paso concreto

1. Claude Code termina PR1.
2. Claude Code lee este documento y responde a las 5 preguntas de sección 11.
3. Alejandro contrata Beds24 Properties Manager esta semana.
4. Alejandro genera refresh token master y lo guarda seguro.
5. Claude Code arranca PR2 (diseño interface adapter) tras confirmación de Alejandro.

**No hay urgencia de los 14 días del trial.** El trial al expirar pasa a plan de pago, el código sigue funcionando. Lo crítico es **diseñar la interface adapter bien antes de implementar el primer adapter**.

---

**Cierre.** Este V2 cierra la visión de producto: SO completo del host, multi-PMS via adapter pattern, WhatsApp como interfaz, compliance España como diferenciador local. Plan de fases realista en 12-18 meses con shadow mode validado en cada salto.
