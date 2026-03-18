# CLAUDE.md — Itineramio

Contexto persistente para Claude Code. Leer antes de tocar cualquier archivo.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router) |
| ORM | Prisma 6 + PostgreSQL |
| Auth | JWT con `jsonwebtoken` (API routes) + `jose` (middleware Edge Runtime) |
| Pagos | Stripe |
| Email | Resend + Nodemailer |
| Storage | Vercel Blob |
| Rate limiting | Upstash Redis (fallback in-memory) |
| Testing | Vitest + @testing-library/react |
| UI | Tailwind CSS + Radix UI + Framer Motion |
| i18n | i18next + react-i18next |
| Forms | react-hook-form + zod |
| State | Zustand + TanStack Query + SWR |

---

## Estructura de directorios clave

```
app/
  (auth)/          — login, register, etc.
  (dashboard)/     — rutas protegidas del host
    gestion/       — reservas, facturación, clientes, liquidaciones
  (public)/        — guías públicas de propiedades
  admin/           — panel admin interno
  api/             — ~460 route handlers
    cron/          — 6 cron jobs (ver vercel.json)
    gestion/       — APIs del módulo de gestión
    public/        — endpoints sin autenticación
    admin/         — APIs admin

src/
  components/      — 100+ componentes en 28 subdirectorios
  lib/             — 40+ módulos de utilidades
    auth.ts        — verificación JWT, getUser()
    rate-limit.ts  — checkRateLimitAsync() (usar en rutas nuevas)
    prisma.ts      — instancia singleton de Prisma

prisma/
  schema.prisma    — 128 modelos

middleware.ts      — JWT verification con jose (Edge Runtime)
```

---

## Comandos

```bash
# Desarrollo
npm run dev           # puerto 3000

# Verificación (USAR ESTO antes de commitear)
npm run check:quick   # typecheck + lint (rápido)
npm run check         # typecheck + lint + build (completo)

# Tests
npm run test          # vitest run
npm run test:watch    # vitest en modo watch

# Base de datos
npx prisma studio     # UI de base de datos
npx prisma db push    # aplicar cambios schema (dev)
npx prisma migrate dev --name <nombre>  # migración formal

# Deploy
npm run safe-push     # pre-push check + git push
```

---

## Convenciones de código

### Autenticación en API routes
```typescript
import { getUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // ...
}
```

### Rate limiting (rutas nuevas)
```typescript
import { checkRateLimitAsync } from '@/lib/rate-limit'

const { success } = await checkRateLimitAsync(identifier, { limit: 10, window: '1m' })
if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
```

### Respuestas de API
```typescript
// Éxito
return NextResponse.json({ data: result })

// Error con código
return NextResponse.json({ error: 'Mensaje claro' }, { status: 400 })
```

### Imports — usar alias `@/`
```typescript
import { prisma } from '@/lib/prisma'
import { ComponentName } from '@/components/ui/ComponentName'
```

---

## Reglas estrictas

### NUNCA hacer en APIs
- `console.log(...)` — usar `logger.ts` o eliminar
- `any` en TypeScript — tipar correctamente
- `try/catch` vacíos que silencian errores
- Acceder a `process.env.X` sin validación (usar `src/lib/env-validation.ts`)

### Testing
- Framework: Vitest
- Ubicación tests: `__tests__/`
- Setup global: `__tests__/setup.ts`
- Ejecutar antes de commitear: `npm run test`
- Nuevas APIs críticas (auth, billing, gestion) → requieren tests

### Commits
- Formato: `type: descripción en español`
- Tipos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
- Ejemplos: `feat: añade validación de IBAN`, `fix: corrige cálculo de comisión`

### "Hecho" significa
1. `npm run check:quick` pasa sin errores
2. Los tests relevantes pasan
3. No hay `console.log` nuevos en APIs
4. No hay `any` nuevos sin justificación

---

## Deuda técnica conocida (no añadir más)

- **1.495 console.logs** en APIs — pendiente limpiar en paralelo
- **TypeScript errors ignorados** — `ignoreBuildErrors: true` en next.config.js (temporal)
- **ESLint ignorado** en build — `ignoreDuringBuilds: true` en next.config.js (temporal)
- **176 tests** para ~460 APIs — cobertura insuficiente
- **TODOs críticos**: Booking parser, SSE notifications, bulk actions en reservas

---

## Flujo de autenticación

1. Login → `POST /api/auth/login` → JWT en cookie httpOnly `token`
2. Cada request → `middleware.ts` verifica JWT con `jose.jwtVerify()`
3. Token expirado → redirect a `/login` + borra cookie
4. En API routes → `getUser(req)` del `src/lib/auth.ts`
5. Admin routes → verifican `user.isAdmin === true`

---

## Sistema de slugs y propiedades

- Cada propiedad tiene `slug` único (ej: `mi-apartamento-barcelona`)
- Guía pública: `/guide/[slug]` — sin autenticación
- Gestión: `/gestion/apartamentos/[propertyId]` — autenticada
- El `propertyId` es cuid de Prisma

---

## Cron jobs activos (vercel.json)

| Endpoint | Schedule | Propósito |
|----------|----------|-----------|
| `/api/cron/guest-followup` | `0 10 * * *` | Follow-up automático a huéspedes |
| `/api/cron/verifactu-status` | `0 * * * *` | Check estado Verifactu |
| `/api/cron/demo-followup` | `0 * * * *` | Follow-up leads demo |
| `/api/cron/check-trials` | `0 */6 * * *` | Activar/expirar trials |
| `/api/cron/check-module-trials` | `0 */6 * * *` | Trials de módulos |
| `/api/cron/email-sequence` | `0 9 * * *` | Secuencias de email marketing |

---

## Variables de entorno requeridas

Ver `.env.local` (no commitear). Principales:
- `DATABASE_URL` + `DIRECT_URL` — PostgreSQL
- `JWT_SECRET` — firma de tokens
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `VERCEL_BLOB_READ_WRITE_TOKEN`
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (opcional, rate limiting)
- `DEMO_CAMPAIGN_START` — controla progresión de plazas en landing demo
