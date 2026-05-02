#!/usr/bin/env bash
#
# scripts/supabase-branch-test.sh
#
# Crea un branch Supabase para probar migrations / código sin tocar producción,
# espera a que esté ACTIVE_HEALTHY, parchea DATABASE_URL/DIRECT_URL en .env
# con las connection strings de la branch (pooler), opcionalmente aplica
# migrations Prisma y un comando de test, y al final restaura .env y borra
# la branch.
#
# REQUIERE en .env:
#   - SUPABASE_ACCESS_TOKEN (Personal Access Token de Supabase)
#   - DATABASE_URL, DIRECT_URL (los actuales de producción — se usan como backup)
#
# DISEÑO:
#   - Trap EXIT garantiza restore de .env aunque algo falle.
#   - --keep-branch para inspección manual sin borrar.
#   - --no-cleanup para dejar branch (útil debugging).
#   - Usa Management API REST (api.supabase.com) para datos que la CLI mascara
#     (password de la branch, host del pooler).
#   - Usa Session pooler (puerto 5432 del pooler) como DIRECT_URL — la direct
#     connection nativa (db.X.supabase.co:5432) es IPv6-only sin IPv4 add-on.
#   - Marca migraciones existentes como `applied` antes de `migrate deploy`
#     porque la branch viene con schema parcial pero `_prisma_migrations` vacío.
#
# EJEMPLO:
#   ./scripts/supabase-branch-test.sh \
#     --branch-name pr2-adapter-test \
#     --apply-migration \
#     --test-cmd "npx tsx scripts/test-adapter.ts"

set -euo pipefail

# ─── Defaults ───────────────────────────────────────────────────────────────

PROJECT_REF="${SUPABASE_PROJECT_REF:-scgbdfltemsthgwianbl}"
SUPABASE_API="https://api.supabase.com"
BRANCH_NAME=""
APPLY_MIGRATION=0
TEST_CMD=""
KEEP_BRANCH=0
NO_CLEANUP=0
ENV_FILE=".env"
TS=$(date +%Y%m%d-%H%M%S)
ENV_BACKUP=".env.backup-${TS}"
WAIT_INTERVAL=8
WAIT_MAX_TRIES=30

# ─── Args ───────────────────────────────────────────────────────────────────

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch-name)     BRANCH_NAME="$2"; shift 2 ;;
    --apply-migration) APPLY_MIGRATION=1; shift ;;
    --test-cmd)        TEST_CMD="$2"; shift 2 ;;
    --keep-branch)     KEEP_BRANCH=1; shift ;;
    --no-cleanup)      NO_CLEANUP=1; shift ;;
    --project-ref)     PROJECT_REF="$2"; shift 2 ;;
    -h|--help)
      sed -n '2,30p' "$0"
      exit 0
      ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$BRANCH_NAME" ]]; then
  BRANCH_NAME="claude-test-${TS}"
fi

# ─── Validaciones ───────────────────────────────────────────────────────────

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE no existe en cwd ($(pwd))" >&2
  exit 1
fi

if ! grep -q "^SUPABASE_ACCESS_TOKEN=" "$ENV_FILE"; then
  echo "ERROR: SUPABASE_ACCESS_TOKEN missing from $ENV_FILE" >&2
  echo "Generate one at https://supabase.com/dashboard/account/tokens" >&2
  exit 1
fi

if ! command -v supabase &>/dev/null; then
  echo "ERROR: supabase CLI no instalado. brew install supabase/tap/supabase" >&2
  exit 1
fi

if ! command -v curl &>/dev/null; then
  echo "ERROR: curl no instalado." >&2
  exit 1
fi

if ! command -v python3 &>/dev/null; then
  echo "ERROR: python3 no instalado." >&2
  exit 1
fi

# ─── Helpers ────────────────────────────────────────────────────────────────

api_get() {
  local path="$1"
  curl -sS -f -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" "$SUPABASE_API$path"
}

# ─── Cleanup trap ───────────────────────────────────────────────────────────

CLEANUP_DONE=0
cleanup() {
  if [[ "$CLEANUP_DONE" -eq 1 ]]; then return; fi
  CLEANUP_DONE=1
  local ec=$?
  echo
  echo "[CLEANUP] (exit code $ec)"

  if [[ -f "$ENV_BACKUP" ]]; then
    echo "[CLEANUP] Restoring $ENV_FILE from $ENV_BACKUP"
    cp "$ENV_BACKUP" "$ENV_FILE"
    rm "$ENV_BACKUP"
  fi

  if [[ "$NO_CLEANUP" -eq 0 && "$KEEP_BRANCH" -eq 0 ]]; then
    if [[ -n "${BRANCH_NAME:-}" ]]; then
      echo "[CLEANUP] Deleting Supabase branch $BRANCH_NAME"
      supabase branches delete "$BRANCH_NAME" --project-ref "$PROJECT_REF" --yes 2>/dev/null || true
    fi
  else
    echo "[CLEANUP] Branch kept (--keep-branch o --no-cleanup)"
  fi

  echo "[CLEANUP] Done."
  exit $ec
}
trap cleanup EXIT INT TERM

# ─── Source .env (sin imprimir secrets) ─────────────────────────────────────

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

# ─── 1. Login Supabase CLI ──────────────────────────────────────────────────

echo "[1/9] Login Supabase CLI..."
supabase login --token "$SUPABASE_ACCESS_TOKEN" 2>&1 | tail -1

# ─── 2. Crear branch ────────────────────────────────────────────────────────

echo "[2/9] Creating branch '$BRANCH_NAME' on project $PROJECT_REF..."
supabase branches create "$BRANCH_NAME" --project-ref "$PROJECT_REF" 2>&1 | tail -3

# ─── 3. Resolver branch_id y branch_project_ref ─────────────────────────────

echo "[3/9] Resolving branch metadata..."
BRANCH_META=$(supabase branches list --project-ref "$PROJECT_REF" --output json \
  | python3 -c "
import sys, json
data = json.load(sys.stdin)
b = [x for x in (data if isinstance(data, list) else [data]) if x.get('name') == '$BRANCH_NAME'][0]
print(b['id'], b['project_ref'])
")
BRANCH_ID=$(echo "$BRANCH_META" | awk '{print $1}')
BRANCH_PROJECT_REF=$(echo "$BRANCH_META" | awk '{print $2}')
echo "    branch_id          : $BRANCH_ID"
echo "    branch_project_ref : $BRANCH_PROJECT_REF"

# ─── 4. Esperar a ACTIVE_HEALTHY ────────────────────────────────────────────

echo "[4/9] Waiting for branch to become ACTIVE_HEALTHY..."
STATUS="UNKNOWN"
for i in $(seq 1 $WAIT_MAX_TRIES); do
  STATUS=$(supabase branches list --project-ref "$PROJECT_REF" --output json 2>/dev/null \
    | python3 -c "
import sys, json
data = json.load(sys.stdin)
b = [x for x in (data if isinstance(data, list) else [data]) if x.get('name') == '$BRANCH_NAME'][0]
print(b.get('preview_project_status', 'UNKNOWN'))
" 2>/dev/null || echo "UNKNOWN")
  echo "    [$i/$WAIT_MAX_TRIES] preview_project_status: $STATUS"
  if [[ "$STATUS" == "ACTIVE_HEALTHY" ]]; then
    break
  fi
  sleep $WAIT_INTERVAL
done

if [[ "$STATUS" != "ACTIVE_HEALTHY" ]]; then
  echo "ERROR: branch did not become ACTIVE_HEALTHY (last status: $STATUS)" >&2
  exit 1
fi

# ─── 5. Obtener db_pass real (Management API REST) ──────────────────────────

echo "[5/9] Fetching branch credentials via Management API..."
BRANCH_DETAIL=$(api_get "/v1/branches/$BRANCH_ID")
DB_PASS=$(echo "$BRANCH_DETAIL" | python3 -c "import sys, json; print(json.load(sys.stdin)['db_pass'])")
if [[ -z "$DB_PASS" ]]; then
  echo "ERROR: could not extract db_pass from branch detail" >&2
  exit 1
fi
echo "    db_pass: ****** (length ${#DB_PASS})"

# ─── 6. Obtener pooler host (Management API REST) ──────────────────────────

echo "[6/9] Fetching pooler config..."
POOLER_CONFIG=$(api_get "/v1/projects/$BRANCH_PROJECT_REF/config/database/pooler")
POOLER_HOST=$(echo "$POOLER_CONFIG" | python3 -c "
import sys, json
data = json.load(sys.stdin)
arr = data if isinstance(data, list) else [data]
print(arr[0]['db_host'])
")
POOLER_USER=$(echo "$POOLER_CONFIG" | python3 -c "
import sys, json
data = json.load(sys.stdin)
arr = data if isinstance(data, list) else [data]
print(arr[0]['db_user'])
")
echo "    pooler_host: $POOLER_HOST"
echo "    pooler_user: $POOLER_USER"

# Transaction pooler (DATABASE_URL) — port 6543, transaction mode
TX_URL="postgresql://${POOLER_USER}:${DB_PASS}@${POOLER_HOST}:6543/postgres?pgbouncer=true&connection_limit=1"
# Session pooler (DIRECT_URL) — port 5432 on pooler, IPv4-compatible.
# We avoid db.X.supabase.co:5432 because it's IPv6-only without IPv4 add-on.
SESS_URL="postgresql://${POOLER_USER}:${DB_PASS}@${POOLER_HOST}:5432/postgres"

# ─── 7. Backup .env y parchear ──────────────────────────────────────────────

echo "[7/9] Backup .env and patch DATABASE_URL/DIRECT_URL..."
cp "$ENV_FILE" "$ENV_BACKUP"

ENV_FILE="$ENV_FILE" TX_URL="$TX_URL" SESS_URL="$SESS_URL" python3 - <<'PYEOF'
import os, re
path = os.environ['ENV_FILE']
tx = os.environ['TX_URL']
sess = os.environ['SESS_URL']
with open(path) as f:
    content = f.read()
content = re.sub(r'^DATABASE_URL=.*$', f'DATABASE_URL="{tx}"',  content, flags=re.MULTILINE)
content = re.sub(r'^DIRECT_URL=.*$',   f'DIRECT_URL="{sess}"', content, flags=re.MULTILINE)
with open(path, 'w') as f:
    f.write(content)
PYEOF
echo "    .env patched (DATABASE_URL → tx pooler, DIRECT_URL → session pooler)"

# ─── 8. Aplicar migrations Prisma (si solicitado) ───────────────────────────

if [[ "$APPLY_MIGRATION" -eq 1 ]]; then
  echo "[8/9] Applying Prisma migrations against branch..."
  set -a; source "$ENV_FILE"; set +a

  # La branch viene con el schema de producción ya aplicado, pero la tabla
  # `_prisma_migrations` está vacía. `migrate deploy` por sí solo intentaría
  # re-aplicar todas desde cero y chocaría con "type already exists".
  #
  # Solución: marcamos todas las migrations existentes como `applied` EXCEPTO
  # la última (que es la del PR a probar). Luego `migrate deploy` solo aplica
  # la última, que es lo que queremos validar.
  # Solo directorios — excluye migration_lock.toml y otros archivos sueltos.
  LATEST_MIG=$(find prisma/migrations -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort | tail -1)
  echo "    Latest migration (PR under test): $LATEST_MIG"
  echo "    Marking older migrations as applied (idempotent)..."
  for mig_dir in prisma/migrations/*/; do
    mig_name=$(basename "$mig_dir")
    if [[ "$mig_name" == "$LATEST_MIG" ]]; then
      continue
    fi
    npx prisma migrate resolve --applied "$mig_name" 2>&1 | tail -1
  done

  echo "    Applying $LATEST_MIG via migrate deploy..."
  npx prisma migrate deploy 2>&1 | tail -10
  npx prisma generate 2>&1 | tail -3
fi

# ─── 9. Test command ────────────────────────────────────────────────────────

if [[ -n "$TEST_CMD" ]]; then
  echo
  echo "─── [9/9] Running test command ────────────────────────────────────"
  echo "$ $TEST_CMD"
  echo
  set -a; source "$ENV_FILE"; set +a
  eval "$TEST_CMD"
fi

echo
echo "─── Branch test complete. .env will restore on exit. ──────────────"
