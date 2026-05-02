# Session Handoff — AlexAI + Beds24 Project

**Última actualización:** 2026-05-02 (sesión Claude Code activa)
**Mantenedor humano:** Alejandro Satlla (alejandrosatlla@gmail.com)
**Repositorio:** `/Users/alejandrosatlla/Documents/itineramio`

---

## Propósito de este documento

Si esta sesión de Claude Code se cuelga, otro Claude debe poder continuar leyendo SOLO este archivo + los referenciados. No tiene que repasar todo el chat anterior.

---

## 1. Visión del proyecto

Itineramio deja de ser "manual digital + chatbot web" y pasa a ser **el sistema operativo completo del host español**. Tres capas:

1. **Conocimiento**: manual estructurado por zonas y pasos (existe).
2. **Inteligencia (AlexAI)**: agente IA multi-canal con memoria cross-channel (en construcción).
3. **Operaciones**: reservas, calendario, precios, compliance España, financiero (parcialmente existe en `gestion/`).

Diferenciadores: cross-channel memory, WhatsApp del host como interfaz operativa, compliance España nativa, adapter pattern multi-PMS.

---

## 2. Documentación canónica (leer en orden)

Todos en `docs/` del repo:

1. **`BRIEF_V3_ALEXAI_BEDS24.md`** — fuente única de verdad. Plan completo de fases, modelos de datos, reglas de migración.
2. **`CODEBASE_AUDIT_REPORT.md`** — qué existe ya en el repo (chatbot serio, gestion/, Verifactu, OAuth Gmail, etc.). Reduce alcance de muchas fases.
3. **`DECISIONS_LOG.md`** — D1-D19. Decisiones cerradas y por qué.
4. **`RISKS_REGISTRY.md`** — 12 riesgos ordenados por severidad + mitigaciones.
5. **`OPEN_QUESTIONS_AND_IMPROVEMENTS.md`** — 15 mejoras + 15 dudas pendientes.
6. **`BACKUP_AND_DISASTER_RECOVERY.md`** — procedimientos de backup/restore. ⚠️ CONTIENE ERROR: dice Neon pero la BD real es Supabase. Corregir.
7. **`BRIEF_V2_ALEXAI_BEDS24.md`** — histórico, sustituido por V3.

Notion (bajo página DEVELOPMENT del workspace Itineramio):
- 📘 Brief V3 (Resumen): https://app.notion.com/p/3535ada2c241810887d7ce3ef1246882
- 🛡️ Registro de Riesgos: https://app.notion.com/p/3535ada2c2418191819be5597dca625d
- 📜 Log de Decisiones: https://app.notion.com/p/3535ada2c24181309a4dd3eb5f9f4e2d
- ❓ Dudas + Mejoras: https://app.notion.com/p/3535ada2c24181a1a633f549705160d5
- 📋 Tareas (database): https://app.notion.com/p/471026724ff8467086b052a2f148adcc

---

## 3. Estado actual de Git

### Branches en remoto (GitHub Satlla/itineramio)

```
main                                           df730105 (con docs nuevos)
feature/pgvector-zone-embeddings               944550ad (PR1, NO mergeado)
wip/quality-alerts-and-misc-2026-05-02         b7471bc9 (working dir antiguo del usuario, sin migración)
tag backup-pre-alexai-2026-05-01               32ae543e (punto de restauración)
```

### Branches solo locales

Mismas que remoto + algunas backup-* antiguas no relevantes.

### main al inicio de la sesión

Estaba en commit `32ae543e`. Avanzó a `df730105` con commits de docs (todos seguros, .md puros). NO se modificó código de producción.

### feature/pgvector-zone-embeddings

PR1 — pgvector + ZoneEmbedding. 4 commits encima de main. Crear PR draft en:
https://github.com/Satlla/itineramio/pull/new/feature/pgvector-zone-embeddings

---

## 4. Qué se ha hecho en esta sesión

### Documentación arquitectónica (commits en main)

1. Brief V3 con plan de fases, modelos, reglas.
2. Risk registry, decisions log V1-V19, open questions.
3. Disaster recovery doc (con error: dice Neon, es Supabase).
4. Audit report del codebase (3 bloques).
5. Corrección `getUser` → `getAuthUser` en CLAUDE.md y brief V3.
6. Database de tareas en Notion + 36 tareas iniciales.

### Decisiones cerradas (D15-D19, ver DECISIONS_LOG.md)

- **D15**: whitelist `ALEXAI_BETA_USERS` para Beta privada.
- **D16**: SKU "iCal-only" descartado.
- **D17**: encryption tokens externos con env var `HOST_CREDENTIALS_ENCRYPTION_KEY` separada (no reusar JWT_SECRET).
- **D18**: chatbot existente NO se toca (regla "no la líes").
- **D19**: calendar sync solo con datos reales de plataformas (no iCal genérico).

### PR1 implementado (rama feature/pgvector-zone-embeddings)

- Schema: extensión pgvector + modelo ZoneEmbedding con `vector(1536)` + `tenantUserId @index`.
- Migration SQL aditiva en `prisma/migrations/20260502_add_pgvector_zone_embeddings/`.
- Helpers en `src/lib/embeddings/`: client (fetch nativo a OpenAI), serializer (Zone→ES texto), generator (idempotente vía SHA256), search (cosine similarity con HNSW).
- Tests: 33 pasan (15 serializer + 10 client mocked + 8 generator mocked).
- Script manual de prueba: `scripts/test-embeddings.ts`.
- README del módulo en `src/lib/embeddings/README.md`.

**Migration NO aplicada a BD todavía.** PR1 mergeable a main sin tocar producción.

### Acciones operativas hechas por usuario

- ✅ Email Reseller a Beds24 enviado (User account ticket) 2026-05-01. Esperando respuesta.

---

## 5. Estado en este momento de la sesión

### Tareas pendientes inmediatas (Alejandro)

1. **Decisión sobre cómo probar PR1 end-to-end** (en curso):
   - Tu BD real está en **Supabase** (no Neon como asumí inicialmente).
   - Verificar plan Supabase (Free vs Pro) — Free no tiene branching nativo.
   - Decidir entre opciones documentadas en este chat (ver punto 6).

### Tareas pendientes de Claude Code

1. **Corregir docs que dicen "Neon"** y deben decir "Supabase":
   - `docs/BACKUP_AND_DISASTER_RECOVERY.md` (sección 2 — Base de datos).
   - `docs/CODEBASE_AUDIT_REPORT.md` (cualquier mención).
2. **Esperar decisión Alejandro sobre Supabase plan + cómo probar PR1**.
3. Si OK, ejecutar `npx prisma migrate deploy` contra branch/proyecto de test.
4. Ejecutar `npx tsx scripts/test-embeddings.ts <propertyId>`.
5. Si test OK, mergear PR1 a main.

### Tareas que vienen después de PR1 mergeado

PR2 — Diseño interface `ExternalIntegrationAdapter` (2-3 días).
PR3 — Schema completo (modelos sección 3 V3) (2-3 días).
PR4 — Anthropic singleton + prompt caching (2-3 días).
PR5 — Rename `ChatbotConversation → GuestConversation` con `@@map` (1 día).
PR-MT — Tenant isolation primitives (12-13 días, BLOQUEANTE para Fase 2).

Después: Fase 2 — Beds24 master + WhatsApp + AlexAI multi-canal (12-15 semanas).

---

## 6. Decisión pendiente del usuario en este momento

**Pregunta abierta**: ¿Plan Supabase Free o Pro?

Opciones de prueba PR1 según respuesta:

| Plan Supabase | Opción recomendada |
|---|---|
| Pro+ | Supabase Branching nativo. Crea branch en dashboard. Cambias DATABASE_URL temporalmente. Pruebas. |
| Free | (a) NO probar end-to-end ahora, dejar PR1 mergeable con los 33 tests mocked. (b) Crear proyecto Supabase nuevo vacío + datos sintéticos. (c) Postgres local con Docker. |

**Si opción (a) Free + no probar end-to-end ahora**: PR1 sigue siendo seguro mergeable. Test real cuando llegue PR9 que lo necesite, momento en que se decide pagar Supabase Pro o migrar a Neon.

---

## 7. Datos críticos del entorno

### Variables de entorno

`.env` (en repo, no `.env.local`):
- `OPENAI_API_KEY` — ya configurada ✅
- `DATABASE_URL` — Supabase pooler, eu-north-1
- `DIRECT_URL` — Supabase direct
- `JWT_SECRET` — secret de auth

`.env` que faltan para PR1+ (cuando lleguen):
- `ALEXAI_BETA_USERS=alejandrosatlla@gmail.com` (PR2 — feature flag whitelist).
- `HOST_CREDENTIALS_ENCRYPTION_KEY=<random 32 bytes hex>` (PR3 — cifrado tokens externos).
- `BEDS24_MASTER_REFRESH_TOKEN=<refresh token>` (PR6 — cuando Alejandro contrate Beds24).

### Stack del repo

- Next.js 15 (App Router)
- Prisma 6.9.0 + Postgres (Supabase)
- JWT auth con `getAuthUser` en `src/lib/auth.ts` (NO `getUser`)
- Vercel deploy automático con `git push`
- Tests Vitest

### Métricas reales del repo (verificadas 2026-05-02)

- 522 endpoints API (no 460 como dice CLAUDE.md desactualizado).
- 131 modelos Prisma (no 128).
- 18 cron jobs activos (no 6).
- 3 console.logs legítimos (no 1.495 — ya se limpiaron en branch mergeada).

---

## 8. Reglas operativas no negociables

Listadas completas en `BRIEF_V3_ALEXAI_BEDS24.md` sección 7. Resumen crítico:

1. **Aditivo only** en migraciones. Nunca borrar/modificar columnas existentes.
2. **Whitelist `ALEXAI_BETA_USERS`** — todo lo nuevo (AlexAI, Beds24, etc.) gateado por env var. Solo `alejandrosatlla@gmail.com` ve cosas nuevas. Aplicado en 3 capas: APIs (404), UI (return null), crons (filter user.email).
3. **Feature flag por propiedad**: `Property.alexaiEnabled = false` por defecto.
4. **Shadow mode antes de auto**: AlexAI empieza en `SUGGEST` siempre.
5. **Beta con propiedades propias primero** (4 de Alejandro).
6. **Beds24 read-only las primeras 2 semanas** antes de activar send.
7. **Endpoints versionados**: nuevo trabajo bajo `/api/alexai/*` o `/api/v2/*`. Endpoints existentes intactos.
8. **Backups antes de cada migration prod**: snapshot point-in-time.
9. **Co-host bloqueo hard**: `consentConfirmed = false` → sync pausado a nivel BD.
10. **Observabilidad día uno**: log con `tenantUserId` siempre.
11. **Aislamiento multi-tenant**: `withTenant()` helper obligatorio en `scope=MASTER`.

Restricciones del repo (de CLAUDE.md sección 7.1 del brief V3):
- Sin `console.log` en APIs nuevas → usar `logger.ts`.
- Sin `any` en TypeScript.
- Auth: `getAuthUser(request)` de `@/lib/auth`.
- Rate limiting: `checkRateLimitAsync()` de `@/lib/rate-limit`.
- Tests obligatorios para auth/billing/gestion/AlexAI.
- Pre-commit: `npm run check:quick` debe pasar.
- Commits: `type: descripción en español`.
- Deploy: solo `git push` (no `npx vercel --prod`).
- UI: sin emojis como iconos. Lucide-react o SVG. Emojis OK solo en notificaciones push (WhatsApp host).

---

## 9. Cosas que descubrimos en la auditoría que cambian el plan

(Detalle completo en `CODEBASE_AUDIT_REPORT.md`)

1. **Chatbot existente es código serio (802 líneas + 600 keywords expansion 6+ idiomas)**. AlexAI lo COMPLEMENTA, no reemplaza. Regla D18.
2. **Sistema `ai-setup` ya genera manuales** (templates, generator.ts, zone-builders.ts). Mejora M3 (onboarding asistido por IA) ya parcial.
3. **`gestion/` tiene 13 sub-módulos**. Fase 4c reducida 6-8 sem → 3-4 sem.
4. **Verifactu AEAT en producción con tests**. Fase 4c facturación ya cubierta.
5. **OAuth Gmail con CSRF state + AES-256-GCM encryption** — patrón a copiar para Beds24 PR6.
6. **`PropertyExternalMapping` ya existe** — extender en PR3, no recrear.
7. **`Reservation` con `userId`+`managerAmount`+`ownerAmount` ya soporta multi-tenant + co-host económico**.
8. **`feature-flags.ts` ya existe** — extender para `isAlexAIBetaUser` en PR2.
9. **Cron `calendar-sync` está stub desactivado**. Reactivar al llegar Beds24 (D19).
10. **Repo NO tiene primitivas de aislamiento explícitas** → PR-MT más caro (12-13 días).

---

## 10. Cosas a NO tocar bajo ningún concepto

1. **`/api/chatbot/route.ts`** — chatbot producción (regla D18).
2. **`src/lib/chatbot-utils.ts`** — keywords + ranking producción (regla D18).
3. **Working tree del usuario** — si hay cambios sin commit, no los stashees ni commitees sin permiso.
4. **`backup-pre-alexai-2026-05-01` tag** — punto de restauración inmutable.
5. **Schema sin migration aditiva** — si cambias schema, migration aditiva o no se hace.
6. **BD producción Supabase** — no aplicar migrations sin branch o backup confirmado.

---

## 11. Cómo continuar si la sesión se cuelga

1. Lee este archivo entero.
2. Lee `BRIEF_V3_ALEXAI_BEDS24.md` (es la fuente de verdad).
3. Ejecuta `git status` + `git log -5` para ver estado actual.
4. Comprueba que estás en `main` o `feature/pgvector-zone-embeddings` según contexto.
5. Sigue desde la sección 5 ("Estado actual") + 6 ("Decisión pendiente") arriba.
6. Si no estás seguro de algo, **pregunta a Alejandro antes de actuar**. Especialmente:
   - Antes de tocar BD producción.
   - Antes de modificar archivos en working tree que no son tuyos.
   - Antes de mergear ramas a main.

---

## 12. Documentos a corregir (deuda menor)

1. `docs/BACKUP_AND_DISASTER_RECOVERY.md` — sección 2 dice "Neon", debe decir **"Supabase"**.
2. `CLAUDE.md` — métricas desactualizadas (1.495 console.logs, 460 endpoints, 128 modelos, 6 crons → debe ser 3, 522, 131, 18). Pendiente de actualizar globalmente.
3. `docs/CODEBASE_AUDIT_REPORT.md` — verificar si menciona Neon en algún punto.
