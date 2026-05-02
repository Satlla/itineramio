# Testing PRs contra branches Supabase (procedimiento canónico)

**Mantenedor:** equipo Itineramio
**Vigente desde:** 2026-05-02 (revisado 2026-05-02 tras validación de PR1)
**Aplica a:** PR1, PR2, PR-MT, PR3-PR5 y todos los PRs futuros que requieran probar contra una BD con datos reales sin tocar producción.

## Cambios respecto a la versión inicial

Tras validar PR1 (pgvector), se identificaron 5 problemas que impedían que el script funcionara automáticamente. El script `scripts/supabase-branch-test.sh` ya está corregido. Resumen de cambios:

1. **Polling de status**: usa `preview_project_status` (no `status`, que es estado de migration deployment).
2. **Password de la branch**: la CLI mascara la password con `******`. El script usa la **Management API REST** (`GET https://api.supabase.com/v1/branches/{id}`) que devuelve `db_pass` real con el access token.
3. **Pooler host dinámico**: se obtiene de `GET /v1/projects/{ref}/config/database/pooler` (no asume `aws-0-eu-north-1` — varía por cuenta).
4. **`DIRECT_URL` usa session pooler**: la direct connection (`db.X.supabase.co:5432`) es **IPv6-only** sin IPv4 add-on. El script construye `DIRECT_URL` apuntando al puerto 5432 del **pooler host** (IPv4-compatible).
5. **Migrations en branch sin data**: la branch viene con schema parcial pero `_prisma_migrations` vacío. El script marca todas las migraciones existentes como `applied` con `prisma migrate resolve` (excepto la última, que es la del PR a probar) y solo entonces hace `migrate deploy`.

---

## Por qué este flujo

Producción está en Supabase Pro ($25/mes). El plan Pro incluye **branching nativo** — clonar la BD entera (con datos) en una branch aislada en ~1 min. Es la forma correcta y profesional de probar:

- Migrations Prisma con datos reales antes de aplicar a producción.
- Scripts que generan/leen datos (embeddings, backfills, sync con APIs externas).
- Cualquier PR que toque schema, queries críticas o lógica multi-tenant.

**Producción NUNCA se modifica durante un test**. La branch es aislada.

---

## Pre-requisitos (una sola vez por máquina)

1. **Supabase CLI**:
   ```bash
   brew install supabase/tap/supabase
   ```

2. **Personal Access Token** en `.env`:
   - Genera uno en https://supabase.com/dashboard/account/tokens.
   - Nombre sugerido: `claude-code-itineramio` (o el que prefieras).
   - Pega en `.env`:
     ```
     SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxxxxxxx
     ```

3. **Confirmar project ref** del proyecto Itineramio:
   - Sale del `DATABASE_URL` actual (parte después de `postgres.<project-ref>:`).
   - Actual: `scgbdfltemsthgwianbl`.
   - Si cambia, actualizar el default en `scripts/supabase-branch-test.sh`.

---

## Uso del script `scripts/supabase-branch-test.sh`

### Caso 1 — Test E2E completo automático (recomendado)

```bash
./scripts/supabase-branch-test.sh \
  --branch-name pr1-pgvector-test \
  --apply-migration \
  --test-cmd "npx tsx scripts/test-embeddings.ts <propertyId>"
```

Lo que hace, en orden:
1. Login en Supabase con tu access token.
2. Crea branch `pr1-pgvector-test`.
3. Resuelve `branch_id` y `branch_project_ref` desde `branches list`.
4. Espera hasta `preview_project_status == ACTIVE_HEALTHY` (~30-60 seg).
5. Obtiene `db_pass` real via Management API REST (la CLI lo mascara).
6. Obtiene host del pooler via Management API REST.
7. **Backup automático de `.env`** a `.env.backup-<timestamp>`.
8. Sustituye en `.env`: `DATABASE_URL` → transaction pooler (puerto 6543), `DIRECT_URL` → session pooler (puerto 5432 del pooler host, IPv4-compatible).
9. Marca migraciones antiguas como `applied` con `prisma migrate resolve --applied`, luego ejecuta `prisma migrate deploy` que solo aplica la migration nueva del PR.
10. Ejecuta el comando de test contra la branch.
11. **Trap EXIT** restaura `.env` desde el backup, ocurra lo que ocurra (incluso si el test rompe, Ctrl+C, o error).
12. Borra la branch para no pagar por instancia inactiva.

### Caso 2 — Crear branch sin tests automáticos

Útil para inspección manual:

```bash
./scripts/supabase-branch-test.sh \
  --branch-name pr1-pgvector-test \
  --apply-migration \
  --keep-branch
```

Crea la branch, aplica migration, **NO la borra al salir**, y restaura `.env` automáticamente. Después puedes inspeccionar manualmente con Prisma Studio o psql usando las strings de la branch (las verás en Supabase dashboard).

Importante: tras inspección manual, **borra la branch** para no acumular costes:
```bash
supabase branches delete <branch-ref> --project-ref scgbdfltemsthgwianbl --yes
```

### Caso 3 — Solo aplicar migration sin test custom

```bash
./scripts/supabase-branch-test.sh \
  --branch-name test-migration-only \
  --apply-migration
```

Útil para validar que una migration no rompe nada antes de producción.

---

## Procedimiento manual (si el script falla o quieres control fino)

### Paso 1 — Crear branch desde web

1. https://supabase.com/dashboard/project/scgbdfltemsthgwianbl/branches
2. **"Create branch"** → nombre + crea.
3. Espera ~1-2 min.

### Paso 2 — Obtener connection string

1. Sidebar → **Database** → **Connection string** (estando dentro de la branch).
2. Copia "Transaction" pooler (puerto 6543) → será tu `DATABASE_URL`.
3. Copia "Direct" (puerto 5432) → será tu `DIRECT_URL`.

### Paso 3 — Backup `.env` y editar

```bash
cp .env .env.backup-pre-test
# Editar .env y reemplazar DATABASE_URL + DIRECT_URL
```

### Paso 4 — Aplicar migration y testear

```bash
npx prisma migrate deploy
npx prisma generate
# Tu test concreto:
npx tsx scripts/test-embeddings.ts <propertyId>
```

### Paso 5 — Restaurar y borrar branch

```bash
cp .env.backup-pre-test .env
rm .env.backup-pre-test
# En Supabase dashboard → Branches → eliminar la branch creada
```

---

## Costes Supabase branching

- **Branch creation**: incluido en Pro ($25/mes base).
- **Compute mientras la branch está activa**: ~$0.01-0.05 por hora según tier.
- **Storage**: cuenta hacia tu límite total del plan (8 GB en Pro).

**Para minimizar costes**:
- Crea branch → testea → borra. Total <30 min = unos cents.
- NUNCA dejes branches activas sin uso.
- Usa `--keep-branch` solo para inspección puntual y bórrala después.

---

## Recovery si algo va mal

### `.env` quedó con strings de branch (test interrumpido sin restore)

Comprueba si hay backup:
```bash
ls -la .env.backup-*
```

Si hay, restaura el más reciente:
```bash
cp .env.backup-<timestamp> .env
rm .env.backup-<timestamp>
```

Si no hay backup, recupera DATABASE_URL/DIRECT_URL desde Vercel (Settings → Environment Variables).

### Branch quedó sin borrar

Lista todas:
```bash
supabase branches list --project-ref scgbdfltemsthgwianbl
```

Borra:
```bash
supabase branches delete <branch-ref> --project-ref scgbdfltemsthgwianbl --yes
```

### Test rompió la BD branch

No problem. **La branch es aislada de producción**. Bórrala y crea una nueva.

---

## Checklist antes de cada test

- [ ] `SUPABASE_ACCESS_TOKEN` válido en `.env`.
- [ ] `OPENAI_API_KEY` válido en `.env` (si el test usa embeddings).
- [ ] Branch actual de git es la rama feature del PR a probar.
- [ ] No hay otros backups `.env.backup-*` viejos sin restaurar (`ls -la .env.backup-*`).
- [ ] Has commiteado o stasheado cambios pendientes.

---

## Cuándo usar branches y cuándo no

**Sí usar branches**:
- Migrations Prisma con cambios destructivos potenciales (DROP, ALTER que cambia tipos).
- Tests E2E con datos reales.
- Validación de scripts de backfill antes de producción.
- Cualquier PR Fase 2+ (Beds24 sync, AlexAI pipeline).

**No usar branches**:
- Tests unitarios con mocks (corre `npm run test` y listo).
- Cambios de docs.
- Refactor sin cambios de schema o lógica BD.

---

## Referencias

- Supabase Branching docs: https://supabase.com/docs/guides/platform/branching
- Supabase CLI: https://supabase.com/docs/guides/cli
- Personal Access Tokens: https://supabase.com/dashboard/account/tokens
