# Backup & Disaster Recovery — Itineramio

**Última revisión:** 2026-05-01
**Mantenedor:** Alejandro Satlla
**Documento vivo:** se actualiza con cada nuevo punto de restauración crítico

---

## Cómo leer este documento

Cubre cuatro tipos de desastre y cómo recuperar:
1. Código se rompe (regresión, bug crítico, deploy malo).
2. Base de datos se rompe (corrupción, borrado accidental, migración mal).
3. Credenciales se pierden (refresh tokens, .env, password manager).
4. Pérdida total del entorno local (portátil roto, robo, etc.).

Cada sección: **qué tienes**, **cómo recuperar**, **quién hace qué**.

---

## 1. Código (Git + GitHub)

### Estado actual (2026-05-01)

- **Remoto principal**: `github.com/Satlla/itineramio.git` (origin)
- **Rama productiva**: `main`
- **Último commit before AlexAI work**: `32ae543e` (2026-04-30) — *"feat: cierra huecos de traducción automática y detecta idioma del huésped en server"*
- **Tag de backup creado**: `backup-pre-alexai-2026-05-01` apuntando a `32ae543e`

### Tags de backup históricos (pattern del repo)

```
v1.0-stable-layout
stable-2024-12-23
safe-baseline-2024-12-24
backup-pre-stripe-2025-01-03
backup-pre-ambassador-2025-01-14
safe-pre-fase1 / safe-post-fase1
safe-post-fase2 / safe-post-fase3 / safe-post-fase4
backup-pre-alexai-2026-05-01  ← actual
```

**Convención**: antes de empezar cada PR-bloque grande, crear tag `backup-pre-<nombre>-<fecha>`. Después de mergear cada Fase, crear tag `safe-post-fase<N>`.

### Cómo recuperar a un estado pasado

**Opción A — Rollback rápido en local:**
```bash
git -C /Users/alejandrosatlla/Documents/itineramio checkout backup-pre-alexai-2026-05-01
# Inspeccionar
git checkout main
git reset --hard backup-pre-alexai-2026-05-01  # destructivo, ojo
```

**Opción B — Crear rama de recuperación (no destructivo):**
```bash
git -C /Users/alejandrosatlla/Documents/itineramio checkout -b recovery-from-backup backup-pre-alexai-2026-05-01
```

**Opción C — Ver qué cambió desde un punto:**
```bash
git -C /Users/alejandrosatlla/Documents/itineramio diff backup-pre-alexai-2026-05-01..HEAD
```

### Modificaciones sin commit (estado actual a 2026-05-01)

⚠️ **Atención**: hay archivos modificados en working tree NO incluidos en `backup-pre-alexai-2026-05-01`:

```
M .DS_Store                                                  (irrelevante)
M CLAUDE.md                                                  (edición del usuario)
M app/(dashboard)/properties/[id]/zones/page.tsx
M app/api/properties/[id]/publish/route.ts
M app/api/properties/[id]/zones/[zoneId]/steps/safe/route.ts
M prisma/schema.prisma
M vercel.json
```

Y archivos sin trackear (incluyen trabajo nuevo):
```
?? .claude/agents/
?? .github/
?? .playwright-mcp/
?? UGC_Script_Elina_*
?? app/api/cron/quality-alerts-digest/
?? app/api/properties/[id]/quality-alerts/
?? app/api/quality-alerts/
?? content/BLOG_GUIDELINES.md
?? docs/BRIEF_V2_ALEXAI_BEDS24.md         ← creado por mí
?? docs/BRIEF_V3_ALEXAI_BEDS24.md         ← creado por mí
?? docs/DECISIONS_LOG.md                  ← creado por mí
?? docs/OPEN_QUESTIONS_AND_IMPROVEMENTS.md ← creado por mí
?? docs/RISKS_REGISTRY.md                 ← creado por mí
?? docs/BACKUP_AND_DISASTER_RECOVERY.md   ← este archivo
?? public/logo-black.png
?? src/lib/chatbot-quality-auditor.ts
```

**Acción requerida (Alejandro)**: commitear o stashear todo lo anterior antes de que arranque trabajo de AlexAI. Sugerencias:

```bash
# Opción 1: commitear lo nuevo (docs + quality alerts)
git -C /Users/alejandrosatlla/Documents/itineramio add docs/ src/lib/chatbot-quality-auditor.ts app/api/cron/quality-alerts-digest/ app/api/properties/[id]/quality-alerts/ app/api/quality-alerts/ content/BLOG_GUIDELINES.md public/logo-black.png .claude/agents/ .github/

git -C /Users/alejandrosatlla/Documents/itineramio commit -m "docs: brief V2/V3 AlexAI + Beds24, risks registry, decisions log + feat: quality alerts módulo en curso"

# Opción 2: stashear los cambios de archivos ya trackeados
git -C /Users/alejandrosatlla/Documents/itineramio stash push -m "wip-pre-alexai" -- CLAUDE.md "app/(dashboard)/properties/[id]/zones/page.tsx" app/api/properties/[id]/publish/route.ts app/api/properties/[id]/zones/[zoneId]/steps/safe/route.ts prisma/schema.prisma vercel.json
```

**Alejandro decide**: commit, stash o dejar tal cual (entonces Claude Code no toca esos archivos).

### Convención de ramas

- `main`: producción.
- `feature/<nombre>`: trabajo nuevo, una rama por PR grande.
- `backup/<descripcion>-<fecha>`: snapshots manuales antes de cambios arriesgados.

### Push a remoto antes de tocar nada importante

```bash
git -C /Users/alejandrosatlla/Documents/itineramio push origin main
git -C /Users/alejandrosatlla/Documents/itineramio push origin backup-pre-alexai-2026-05-01
```

⚠️ Hay archivos sin commit/sin trackear. **No pushees `main` antes de decidir qué hacer con ellos.**

---

## 2. Base de datos (Neon PostgreSQL)

### Lo que tienes

Neon ofrece **point-in-time restore** automático.

- **Plan típico Neon Free**: 7 días de retención
- **Plan típico Neon Launch**: 14-30 días según tier
- **Plan Scale**: hasta 30 días + branches

### Cómo recuperar

**Restore point-in-time:**
1. Login en https://console.neon.tech
2. Seleccionar tu proyecto Itineramio
3. Tab **Restore** o **Branches**
4. Elegir punto temporal (timestamp exacto antes del desastre)
5. **Crear nueva branch** desde ese punto (no sobrescribir `main` directamente)
6. Cambiar `DATABASE_URL` en Vercel temporalmente a la branch restaurada
7. Verificar datos
8. Si todo OK, promover branch restaurada a main

**Antes de cualquier migration arriesgada:**

```bash
# Idealmente: crear branch manual en Neon dashboard antes de migration
# Si no, anotar timestamp exacto antes de correr la migration
date -u +"%Y-%m-%dT%H:%M:%SZ"  # → guardar este timestamp
npx prisma migrate dev --name xxx
```

Si la migration rompe algo, restauras a ese timestamp.

### Acción requerida (Alejandro)

- **Verificar** plan actual de Neon y retención disponible.
- **Considerar upgrade** si Beta crece (mayor retención = más seguridad).
- **Cada Fase nueva**: crear branch manual en Neon dashboard como snapshot antes de cambios de schema grandes.

---

## 3. Deploys (Vercel)

### Lo que tienes

Vercel guarda **historial de todos los deploys**. Cada deploy es rollback con un clic.

### Cómo recuperar

1. Login en https://vercel.com/dashboard
2. Seleccionar proyecto Itineramio
3. Tab **Deployments**
4. Identificar el deploy estable previo
5. Botón **"..." → Promote to Production**

Tarda <1 minuto. Reversible.

### Convención adicional

- **Deploys con preview**: cada PR genera un preview URL único. Probar ahí antes de mergear a main.
- **No usar `npx vercel --prod`** (regla de CLAUDE.md): solo `git push` a main → deploy automático.

### Acción requerida (Alejandro)

- **Verificar acceso al dashboard Vercel** funciona (login + 2FA).
- **Confirmar que tienes guardado** el método de recovery 2FA (códigos backup).

---

## 4. Variables de entorno (`.env`)

### Lo que tienes

Las variables de entorno productivas están en **Vercel project settings**. Las locales en `.env.local` (no commiteado).

Variables críticas (de CLAUDE.md):
- `DATABASE_URL` + `DIRECT_URL` (Neon)
- `JWT_SECRET`
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `VERCEL_BLOB_READ_WRITE_TOKEN`
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (opcional)
- `DEMO_CAMPAIGN_START`

**Próximas variables a añadir (Fase 1+)**:
- `HOST_CREDENTIALS_ENCRYPTION_KEY` (cifrado refresh tokens externos)
- `BEDS24_MASTER_REFRESH_TOKEN` (cuando se genere)
- `WHATSAPP_360DIALOG_API_KEY` (cuando llegue Fase 2)
- `META_VERIFY_TOKEN` (webhooks)
- `ANTHROPIC_API_KEY` (cuando se use)

### Cómo recuperar

**Si pierdes `.env.local` en local:**
- Dashboard Vercel → Settings → Environment Variables → Pull (o copy manual)
- Recrear `.env.local` con esos valores

**Si Vercel pierde las variables (improbable):**
- Tienes que regenerar de cada servicio:
  - `JWT_SECRET`: regenerar nuevo (todos los usuarios re-login obligatorio)
  - `DATABASE_URL`: dashboard Neon
  - `STRIPE_*`: dashboard Stripe
  - `RESEND_API_KEY`: dashboard Resend
  - `BEDS24_MASTER_REFRESH_TOKEN`: regenerar invite code en Beds24, intercambiar por nuevo refresh token
  - Etc.

### Acción requerida (Alejandro) — CRÍTICA

**Hacer backup de `.env.local` HOY** en password manager seguro (1Password, Bitwarden):

```bash
# Crear copia cifrada del .env.local
cp /Users/alejandrosatlla/Documents/itineramio/.env.local /Users/alejandrosatlla/.env.itineramio.backup-2026-05-01
# Subir a password manager como nota cifrada
# Después borrar el archivo de copia
rm /Users/alejandrosatlla/.env.itineramio.backup-2026-05-01
```

**Lista de verificación**:
- [ ] `.env.local` copiado en password manager
- [ ] Acceso 2FA recovery codes Vercel guardados
- [ ] Acceso 2FA recovery codes Neon guardados
- [ ] Acceso 2FA recovery codes GitHub guardados
- [ ] Acceso 2FA recovery codes Stripe guardados

---

## 5. Credenciales externas (cuando lleguen)

### Beds24 refresh token

**Cuando lo generes** (próximos días):

1. Generar invite code en Beds24 panel.
2. Intercambiar por refresh token vía `POST /authentication/setup`.
3. **Guardar inmediatamente en password manager** como nota cifrada con fecha.
4. **NO compartir por chat, email, ni dejar en archivos sin cifrar.**
5. Añadir a Vercel env vars como `BEDS24_MASTER_REFRESH_TOKEN`.

**Si se compromete o se pierde:**
1. Revocar el comprometido en Beds24 panel (Apps → API Keys → Revoke).
2. Generar nuevo invite code.
3. Generar nuevo refresh token.
4. Actualizar Vercel env vars + `.env.local`.
5. Redeploy automático.

### WhatsApp Business (Fase 2)

- 360dialog API key: en password manager.
- Plantillas Meta aprobadas: documentar IDs en `docs/WHATSAPP_TEMPLATES.md` cuando se aprueben.
- Si Meta cierra el número: recuperación es lenta (1-2 semanas). **Nunca depender de un solo número WhatsApp Business.**

### Anthropic API key

- Siempre con límite de gasto configurado en Anthropic dashboard.
- Rotar cada 6 meses.
- Si se filtra: revocar en dashboard inmediatamente, generar nueva.

---

## 6. Documentación (Notion + repo)

### Estrategia dual

- **Repo `docs/`**: source of truth canónica, versionada con git.
- **Notion**: navegable, vive con el usuario, accesible desde móvil.

### Lo que vive solo en Notion

- Database `📋 Tareas — AlexAI + Beds24`.
- Páginas: README, ESTRATEGIA, BRAND, OPERATIONS, MARKETING, ESTADO.
- Brand assets, mood boards, content drafts.

### Lo que vive solo en repo

- Código.
- Documentos arquitectónicos (briefs V1/V2/V3).
- Risk registry, decisions log, open questions.
- Especificaciones técnicas detalladas.

### Backup de Notion

Notion tiene historial de versiones por página (90 días en plan Pro). Para backup permanente:

1. Workspace settings → **Export**
2. Format: Markdown & CSV
3. Programa export semanal en calendario
4. Guardar zips en disco externo / iCloud

**Acción requerida (Alejandro)**: configurar export mensual de Notion, guardar zip en password manager o iCloud cifrado.

---

## 7. Pérdida total del entorno local

Escenario: portátil robado, disco roto, robo en casa.

### Lo que sobrevive (cosas en cloud)

- ✅ Código: GitHub.
- ✅ Base de datos: Neon.
- ✅ Deploys: Vercel.
- ✅ Documentación arquitectónica: Notion.
- ✅ Variables de entorno: Vercel + password manager.
- ✅ Credenciales externas: password manager.

### Lo que se pierde sin backup

- ❌ Modificaciones sin commit en local.
- ❌ Archivos de configuración personal (`.zshrc`, etc.).
- ❌ Trabajo no pusheado a GitHub.

### Recovery completa (asumiendo password manager funcional)

```bash
# 1. Comprar/conseguir nuevo Mac
# 2. Login iCloud → restore configuración base
# 3. Instalar herramientas
brew install git node
brew install --cask cursor visual-studio-code

# 4. Login GitHub
gh auth login

# 5. Clone repo
git clone https://github.com/Satlla/itineramio.git ~/Documents/itineramio
cd ~/Documents/itineramio

# 6. Recuperar .env.local del password manager
# (paste contents)

# 7. Instalar deps
npm install

# 8. Verificar que funciona
npm run dev

# 9. Login a servicios externos
# - Vercel CLI: vercel login
# - Neon: web only, login con cuenta
# - Stripe: web only
# - Notion: app y web
```

**Tiempo estimado de recuperación total**: 4-8 horas si todo está bien organizado.

---

## 8. Ejercicio recomendado: simulacro trimestral

Cada 3 meses, hacer un drill:
1. Asume que pierdes acceso a tu Mac.
2. Desde otro dispositivo, intenta loguearte a: GitHub, Vercel, Neon, Notion, password manager, Stripe.
3. Si te falta algo (recovery code, 2FA backup, contraseña), corrégelo.
4. Anota en este documento la fecha del último drill.

**Último drill**: nunca / pendiente.

---

## 9. Lista de verificación para Alejandro (HOY o esta semana)

Marcar conforme se completa:

- [ ] Decidir qué hacer con archivos modificados sin commit (commit / stash / dejar).
- [ ] Push a remoto: `git push origin main` (después de decidir lo anterior).
- [ ] Push del tag: `git push origin backup-pre-alexai-2026-05-01`.
- [ ] Backup `.env.local` en password manager.
- [ ] Verificar acceso 2FA + recovery codes: GitHub, Vercel, Neon, Stripe, Notion.
- [ ] Verificar plan Neon (retención point-in-time disponible).
- [ ] Configurar export mensual de Notion.

---

## 10. Lista de verificación para Claude Code (recurrente)

Antes de cada PR-bloque grande:

- [ ] Crear tag `backup-pre-<nombre>-<fecha>` desde HEAD actual.
- [ ] Verificar que las variables de entorno necesarias están en Vercel.
- [ ] Crear branch `feature/<nombre>` desde main.
- [ ] Documentar en `DECISIONS_LOG.md` cualquier decisión arquitectónica nueva.
- [ ] Tras merge a main: crear tag `safe-post-<fase>-<fecha>`.

---

## Cierre

Este documento es vivo. Si descubres un escenario de desastre nuevo, añádelo. Si haces un drill, anota la fecha. Si añades un servicio externo nuevo (próximos meses: Beds24, WhatsApp, Anthropic), añade su procedimiento de recovery.

**Convención**: si Itineramio crece a equipo, este documento se actualiza para incluir el rol del/la **on-call** semanal y los runbooks específicos de incidente.
