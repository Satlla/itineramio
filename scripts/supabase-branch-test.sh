#!/usr/bin/env bash
#
# scripts/supabase-branch-test.sh
#
# Crea un branch Supabase para probar migrations / código sin tocar producción,
# espera a que la branch esté ACTIVE_HEALTHY, sustituye DATABASE_URL/DIRECT_URL
# en .env temporalmente, y al final restaura .env y borra la branch.
#
# El test concreto se pasa como comando al script. Ejemplo:
#
#   ./scripts/supabase-branch-test.sh \
#     --branch-name pr1-pgvector-test \
#     --apply-migration \
#     --test-cmd "npx tsx scripts/test-embeddings.ts <propertyId>"
#
# REQUIERE en .env:
#   - SUPABASE_ACCESS_TOKEN (Personal Access Token de Supabase)
#   - DATABASE_URL, DIRECT_URL (los actuales de producción)
#
# DISEÑO:
#   - Trap EXIT para garantizar restore de .env aunque algo falle.
#   - --keep-branch para inspeccionar manualmente sin borrar.
#   - --no-cleanup para dejar el branch (útil debugging).
#
# AUTORÍA: parte de la infra de testing repetible para PR1, PR2, PR-MT, etc.

set -euo pipefail

# ─── Defaults ───────────────────────────────────────────────────────────────

PROJECT_REF="${SUPABASE_PROJECT_REF:-scgbdfltemsthgwianbl}"
BRANCH_NAME=""
APPLY_MIGRATION=0
TEST_CMD=""
KEEP_BRANCH=0
NO_CLEANUP=0
ENV_FILE=".env"
TS=$(date +%Y%m%d-%H%M%S)
ENV_BACKUP=".env.backup-${TS}"

# ─── Args ───────────────────────────────────────────────────────────────────

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch-name)    BRANCH_NAME="$2"; shift 2 ;;
    --apply-migration) APPLY_MIGRATION=1; shift ;;
    --test-cmd)       TEST_CMD="$2"; shift 2 ;;
    --keep-branch)    KEEP_BRANCH=1; shift ;;
    --no-cleanup)     NO_CLEANUP=1; shift ;;
    --project-ref)    PROJECT_REF="$2"; shift 2 ;;
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

# ─── Cleanup trap ───────────────────────────────────────────────────────────

CLEANUP_DONE=0
cleanup() {
  if [[ "$CLEANUP_DONE" -eq 1 ]]; then return; fi
  CLEANUP_DONE=1
  local ec=$?
  echo
  echo "[CLEANUP] (exit code $ec)"

  # Restore .env always
  if [[ -f "$ENV_BACKUP" ]]; then
    echo "[CLEANUP] Restoring .env from $ENV_BACKUP"
    cp "$ENV_BACKUP" "$ENV_FILE"
    rm "$ENV_BACKUP"
  fi

  # Delete branch unless asked to keep
  if [[ "$NO_CLEANUP" -eq 0 && "$KEEP_BRANCH" -eq 0 ]]; then
    if [[ -n "${BRANCH_REF:-}" ]]; then
      echo "[CLEANUP] Deleting Supabase branch $BRANCH_REF"
      supabase branches delete "$BRANCH_REF" --project-ref "$PROJECT_REF" --yes 2>/dev/null || true
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

# ─── Login Supabase CLI ─────────────────────────────────────────────────────

echo "[1/8] Login Supabase CLI..."
echo "$SUPABASE_ACCESS_TOKEN" | supabase login --token "$SUPABASE_ACCESS_TOKEN" 2>&1 | tail -2

# ─── Crear branch ───────────────────────────────────────────────────────────

echo "[2/8] Creating branch '$BRANCH_NAME' on project $PROJECT_REF..."
supabase branches create "$BRANCH_NAME" --project-ref "$PROJECT_REF"

echo "[3/8] Resolving branch ref..."
BRANCH_REF=$(supabase branches list --project-ref "$PROJECT_REF" --output json \
  | python3 -c "import sys, json; data=json.load(sys.stdin); branches=data if isinstance(data, list) else [data]; print([b['id'] for b in branches if b.get('name')=='$BRANCH_NAME'][0])")
echo "    branch ref: $BRANCH_REF"

# ─── Esperar ACTIVE_HEALTHY ─────────────────────────────────────────────────

echo "[4/8] Waiting for branch to become ACTIVE_HEALTHY (typical 1-2 min)..."
for i in {1..30}; do
  STATUS=$(supabase branches get "$BRANCH_REF" --project-ref "$PROJECT_REF" --output json \
    | python3 -c "import sys, json; print(json.load(sys.stdin).get('status','UNKNOWN'))" 2>/dev/null || echo "UNKNOWN")
  echo "    [$i] status: $STATUS"
  if [[ "$STATUS" == "ACTIVE_HEALTHY" ]]; then
    break
  fi
  sleep 10
done

if [[ "$STATUS" != "ACTIVE_HEALTHY" ]]; then
  echo "ERROR: branch did not become ACTIVE_HEALTHY (last status: $STATUS)" >&2
  exit 1
fi

# ─── Obtener connection strings ─────────────────────────────────────────────

echo "[5/8] Fetching branch connection strings..."
BRANCH_DETAILS=$(supabase branches get "$BRANCH_REF" --project-ref "$PROJECT_REF" --output json)
BRANCH_DB_URL=$(echo "$BRANCH_DETAILS" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('postgres_url') or d.get('database',{}).get('url') or '')")

if [[ -z "$BRANCH_DB_URL" ]]; then
  echo "ERROR: could not extract postgres_url from branch details" >&2
  echo "Raw response:" >&2
  echo "$BRANCH_DETAILS" | head -50 >&2
  exit 1
fi

echo "    branch DATABASE_URL obtained (length ${#BRANCH_DB_URL})"

# Pooled vs direct: Supabase typically returns direct. Build pooled by replacing port 5432 → 6543 if needed.
POOLED_URL="${BRANCH_DB_URL/:5432/:6543}"
if [[ "$POOLED_URL" == "$BRANCH_DB_URL" ]]; then
  POOLED_URL="$BRANCH_DB_URL"
fi

# ─── Backup .env ────────────────────────────────────────────────────────────

echo "[6/8] Backup .env to $ENV_BACKUP"
cp "$ENV_FILE" "$ENV_BACKUP"

# ─── Sustituir DATABASE_URL/DIRECT_URL ──────────────────────────────────────

echo "[7/8] Patching .env with branch URLs..."
python3 - <<PYEOF
import re, os
path = os.environ.get('ENV_FILE', '.env')
with open(path) as f:
    content = f.read()
new_db = os.environ['POOLED_URL']
new_dir = os.environ['BRANCH_DB_URL']
content = re.sub(r'^DATABASE_URL=.*$', f'DATABASE_URL="{new_db}"', content, flags=re.MULTILINE)
content = re.sub(r'^DIRECT_URL=.*$', f'DIRECT_URL="{new_dir}"', content, flags=re.MULTILINE)
with open(path, 'w') as f:
    f.write(content)
print("    .env patched")
PYEOF

# ─── Apply migration if requested ───────────────────────────────────────────

if [[ "$APPLY_MIGRATION" -eq 1 ]]; then
  echo "[8/8] Applying Prisma migrations against branch..."
  set -a; source "$ENV_FILE"; set +a
  npx prisma migrate deploy
  npx prisma generate
fi

# ─── Test command ───────────────────────────────────────────────────────────

if [[ -n "$TEST_CMD" ]]; then
  echo
  echo "─── Running test command ──────────────────────────────────────────"
  echo "$ $TEST_CMD"
  echo
  set -a; source "$ENV_FILE"; set +a
  eval "$TEST_CMD"
fi

echo
echo "─── Branch test complete. .env will restore on exit. ───────────────"
