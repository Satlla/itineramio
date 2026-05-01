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

### 1.8 — `PropertyExternalMapping` ya existe en schema

(Visto en diff de wip branch, modelo ya en schema.prisma de main).

**Implicación**: el modelo `ExternalPropertyMapping` que propusimos en V3 sección 3.2 puede ser que **ya exista parcialmente** con otro nombre. Hay que verificar si reusamos o ampliamos.

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

## 4. Estado de la auditoría

⏳ **Hecho**: estructura general, cifras reales del repo, identificación de piezas existentes relevantes.
⏳ **En curso**: lectura de archivos clave (sección 2).
⏳ **Pendiente**: schema completo, crons clave, módulo gestion, ai-setup, SES.HOSPEDAJES base.

**Estimación de cierre**: 1-2 días más de trabajo. El informe se actualizará incrementalmente.
