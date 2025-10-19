# PERF Implementation Notes

## PERF-N1: Lazy Loading de Vídeos
**Status**: ✅ Implementado (pendiente push limpio)

**Problema**: La rama `perf/n1-lazy-video-clean` no puede pushearse limpiamente debido a:
1. Main local 63 commits adelante de `origin/main`
2. GitHub Secret Scanning detecta Stripe API keys en commits antiguos de la historia
3. El diff incluye cambios de contenido adicionales al lazy loading

**Solución requerida**:
1. Sincronizar `main` local con `origin/main` primero
2. O aplicar PERF-N1 manualmente sobre una base limpia de `origin/main`

**Archivos de PERF-N1**:
- `src/components/ui/VideoLazy.tsx` - Componente lazy loading
- `scripts/make-video-poster.ts` - Generador de posters
- `public/videos/*-poster.webp` - 6 posters optimizados (401KB total)
- `.env.staging` - Feature flags
- `app/page.tsx` - Migración de 6 videos a VideoLazy

**Impacto esperado**:
- TTI: -2s (3.5s → 1.5s mobile)
- Transfer inicial: -26MB (27MB → 0.4MB)
- Posters: 401KB vs 27MB videos = 98.5% reducción

---

## PERF-N2: Migración a Next/Image
**Status**: ⚠️ N/A - No aplicable

**Razón**: La homepage actual (`origin/main`) es video-céntrica, sin imágenes estáticas para migrar.

**Análisis**:
```bash
# Búsqueda de imágenes en homepage
grep -r "<img" app/page.tsx  # 0 resultados
grep -r "background-image" app/page.tsx  # 0 resultados
```

**Configuración actual**:
- Next.js image domains ya configurados en `next.config.js` (línea 28-30)
- Dominio Vercel blob storage habilitado: `k1f4x7ksxbn13s8z.public.blob.vercel-storage.com`
- Uploads dinámicos en `/public/uploads/` son user-generated, no site assets

**Conclusión**: No hay optimización de Next/Image necesaria para la homepage actual.
Si en el futuro se añaden imágenes de marketing/hero, aplicar entonces.

**Registrado**: 2025-10-19
**Decision**: Marcar PERF-N2 como N/A y proceder a PERF-N3

---

## PERF-N3: Cache Headers Optimizados
**Status**: ⏳ Próximo

**Objetivo**: Implementar cache-control estratégico sin comprometer seguridad

**Requisitos** (del ADR-0002):
1. ✅ Mantener CSP/HSTS existentes (no tocar)
2. ✅ Excluir de caché: `/api/**`, `/auth/**`, `/dashboard/**`
3. ✅ Caché pública en: `/`, `/pricing`, `/_next/static/**`, `/images/**`, `/videos/**`
4. ⚠️ Requiere revisión de Security team antes de habilitar

**Configuración actual** (`next.config.js`):
- Security headers ya implementados (líneas 38-66)
- Cache ligero en páginas: `public, max-age=0, must-revalidate` (línea 105)
- Cache agresivo en static assets: `public, max-age=31536000, immutable` (líneas 69-80)
- API sin cache: `no-cache, no-store, must-revalidate` (líneas 86-88)

**Plan de implementación**:
1. Crear `perf/n3-cache-headers` branch
2. Añadir cache-control mejorado para páginas públicas
3. Feature flag: `ENABLE_PERF_CACHE_HEADERS` (default: false)
4. Solicitar review de Security antes de habilitar

---

## Estado General

| Optimización | Status | Impacto | Flag | Revisión |
|--------------|--------|---------|------|----------|
| PERF-N1 | ✅ Implementado | TTI -2s, -26MB | `NEXT_PUBLIC_ENABLE_VIDEO_LAZY=false` | Pendiente push limpio |
| PERF-N2 | ⚠️ N/A | - | - | No aplicable |
| PERF-N3 | ⏳ En preparación | TBD | `ENABLE_PERF_CACHE_HEADERS=false` | Pendiente Security |

**Próximos pasos**:
1. Resolver sync de `main` local con `origin/main`
2. Push limpio de PERF-N1 sin historial de secretos
3. Implementar PERF-N3 con flag deshabilitado
4. Coordinar con Security para revisión de cache headers

---

**Última actualización**: 2025-10-19 12:00
**Responsable**: DEV Lead (Performance)
