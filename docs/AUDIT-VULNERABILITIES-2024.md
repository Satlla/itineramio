# Auditoría de Seguridad y Problemas - Itineramio

**Fecha:** Diciembre 2024
**Alcance:** Análisis exhaustivo con 22+ agentes paralelos
**Nota:** Este documento sirve para ir resolviendo los problemas de forma ordenada.

---

## 🔴 CRÍTICO - Acción Inmediata

### 1. Endpoints Debug Sin Autenticación
**Estado:** ❌ Pendiente
**Riesgo:** Base de datos completamente expuesta

**Endpoints peligrosos identificados:**
```
/api/nuclear-cleanup
/api/force-delete-user
/api/clear-database
/api/reset-user
/api/debug/*
/api/test/*
/api/fix-*
```

**Total:** ~50+ endpoints debug/test sin protección

**Solución:**
- [ ] Eliminar endpoints de producción
- [ ] O añadir `requireAdminAuth()` a cada uno
- [ ] O mover a branch separado solo para desarrollo

---

### 2. JWT Secret Hardcodeado
**Estado:** ❌ Pendiente
**Riesgo:** Tokens forjables por cualquiera que lea el código

**Ubicación:** `src/lib/auth.ts`
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'itineramio-secret-key-2024'
```

**Solución:**
- [ ] Eliminar fallback hardcodeado
- [ ] Asegurar que `JWT_SECRET` esté en todas las env de Vercel
- [ ] Rotar el secret actual (invalidará sesiones existentes)

---

### 3. Credenciales en Repositorio
**Estado:** ❌ Pendiente
**Riesgo:** Cualquiera con acceso al repo tiene acceso a BD, APIs, etc.

**Archivos afectados:**
- `.env` (committeado)
- `.env.local` (committeado)
- `.env.local.bak` (con passwords)

**Contenido expuesto:**
- DATABASE_URL con password
- RESEND_API_KEY
- VERCEL_TOKEN
- Otros secrets

**Solución:**
- [ ] Añadir `.env*` a `.gitignore`
- [ ] Eliminar archivos del historial con `git filter-branch` o BFG
- [ ] Revocar y regenerar TODAS las credenciales
- [ ] Usar solo Vercel Environment Variables

---

### 4. XSS en Blog
**Estado:** ❌ Pendiente
**Riesgo:** Inyección de código malicioso en artículos

**Ubicación:** Componentes que usan `dangerouslySetInnerHTML`

**Solución:**
- [ ] Instalar `dompurify`
- [ ] Sanitizar contenido antes de renderizar:
```typescript
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
```

---

## 🟠 ALTO - Esta Semana

### 5. Schema Prisma Duplicado
**Estado:** ❌ Pendiente

**Modelos duplicados:**
| Original | Duplicado |
|----------|-----------|
| User | AcademyUser |
| QuizAttempt | AcademyUserQuizAttempt |
| Achievement | AcademyUserAchievement |
| Progress | (en ambas ramas) |

**Problemas adicionales:**
- `DailyStats` sin FK a propiedad
- Naming inconsistente (camelCase vs snake_case)

**Solución:**
- [ ] Consolidar modelos Academic en User principal
- [ ] Crear migración para mover datos
- [ ] Eliminar modelos duplicados

---

### 6. Stripe NO Implementado
**Estado:** ❌ Pendiente

**Realidad actual:**
- Solo pagos manuales (Bizum/Transferencia)
- `UserSubscription` sin campos Stripe
- Sin webhooks de Stripe
- Sin sync BD-Stripe

**Archivos con TODOs:**
- `/api/subscription/cancel`
- `/api/subscription/reactivate`

**Solución:**
- [ ] Decidir: ¿Implementar Stripe o continuar manual?
- [ ] Si Stripe: añadir campos al schema, implementar webhooks
- [ ] Documentar proceso de pagos actual

---

### 7. Dos Modelos de Pricing Incompatibles
**Estado:** ❌ Pendiente

**Modelo 1:** Plan fijo (BASIC, HOST, SUPERHOST, BUSINESS)
**Modelo 2:** Precio por propiedad dinámico

**Solución:**
- [ ] Decidir modelo único
- [ ] Eliminar código del modelo no usado
- [ ] Documentar claramente la estructura de precios

---

### 8. Emails No Funcionales
**Estado:** ❌ Pendiente

**Problemas:**
- Dominio `itineramio.com` NO verificado en Resend (error 403)
- Sin link de unsubscribe (requerido por GDPR)

**Solución:**
- [ ] Verificar dominio en Resend (DNS records)
- [ ] Añadir link unsubscribe a todos los emails
- [ ] Implementar endpoint `/api/unsubscribe`

---

## 🟡 MEDIO - Próximas Semanas

### 9. Cero Tests Automatizados
**Estado:** ❌ Pendiente

**Realidad:**
- 0 tests unitarios
- 0 tests de integración
- 0 tests E2E
- Sin CI/CD

**Solución:**
- [ ] Configurar Jest/Vitest
- [ ] Tests para funciones críticas (auth, pagos, planes)
- [ ] Configurar GitHub Actions para CI
- [ ] Añadir tests E2E con Playwright

---

### 10. ignoreBuildErrors: true
**Estado:** ❌ Pendiente

**Ubicación:** `next.config.mjs`

**Riesgo:** Errores de TypeScript se ignoran, código roto puede llegar a producción

**Solución:**
- [ ] Cambiar a `ignoreBuildErrors: false`
- [ ] Corregir todos los errores de TS que aparezcan
- [ ] Configurar `strict: true` en tsconfig.json

---

### 11. StepEditor Monolítico
**Estado:** ❌ Pendiente

**Ubicación:** Componente de ~1,216 líneas

**Solución:**
- [ ] Dividir en componentes más pequeños
- [ ] Extraer hooks personalizados
- [ ] Mejorar mantenibilidad

---

### 12. 100+ Componentes con 'use client' Innecesario
**Estado:** ❌ Pendiente

**Impacto:** Bundle JS más grande de lo necesario

**Solución:**
- [ ] Auditar cada componente
- [ ] Convertir a Server Components donde sea posible
- [ ] Optimizar hidratación

---

### 13. Sitemap Incompleto
**Estado:** ❌ Pendiente

**Problema:** ~50 páginas sin metadata, sitemap no incluye todo

**Solución:**
- [ ] Completar generateMetadata en todas las páginas
- [ ] Actualizar sitemap.xml dinámico
- [ ] Verificar con Google Search Console

---

### 14. Sin Garbage Collection de Vercel Blob
**Estado:** ❌ Pendiente

**Problema:** Archivos huérfanos se acumulan sin limpieza

**Solución:**
- [ ] Crear cron job para limpiar blobs sin referencia en BD
- [ ] Implementar soft-delete antes de eliminar

---

### 15. i18n Incompleto
**Estado:** ❌ Pendiente

**Problemas:**
- URLs no localizadas
- Blog solo en español
- Emails solo en español
- Fechas hardcodeadas a es-ES

**Solución:**
- [ ] Decidir: ¿Multi-idioma real o solo español?
- [ ] Si multi-idioma: implementar URLs localizadas
- [ ] Traducir contenido crítico

---

## 🟢 BAJO - Cuando Haya Tiempo

### 16. Security Headers Ausentes
**Estado:** ❌ Pendiente

**Headers faltantes:**
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

**Solución:**
- [ ] Añadir headers en `next.config.mjs` o middleware

---

### 17. Sin Rate Limiting
**Estado:** ❌ Pendiente

**Riesgo:** APIs vulnerables a abuse/DDoS

**Solución:**
- [ ] Implementar rate limiting con `@upstash/ratelimit`
- [ ] Configurar límites por endpoint

---

### 18. Archivos Legacy/Backup
**Estado:** ❌ Pendiente

**Archivos a eliminar:**
- `.env.local.bak`
- 6+ archivos `.backup`
- Scripts de fix/debug temporales

**Solución:**
- [ ] Eliminar archivos innecesarios
- [ ] Añadir patrones a `.gitignore`

---

### 19. 89 Instancias PrismaClient
**Estado:** ❌ Pendiente

**Problema:** Scripts crean nuevas instancias en lugar de usar singleton

**Solución:**
- [ ] Usar siempre `import prisma from '@/lib/prisma'`
- [ ] Actualizar scripts existentes

---

### 20. Estructura de Carpetas Inconsistente
**Estado:** ❌ Pendiente

**Problemas:**
- `/lib` vs `/src/lib` duplicado
- Componentes mal ubicados
- Sin convención clara

**Solución:**
- [ ] Definir estructura estándar
- [ ] Migrar archivos gradualmente

---

## ✅ RESUELTOS

### Session/Cookie Fix
**Fecha:** Diciembre 2024
**Estado:** ✅ Completado y desplegado

**Cambios:**
- `sameSite: 'none'` → `sameSite: 'lax'`
- Añadido `domain: '.itineramio.com'`
- Redirección `/` → `/main` con token

---

## Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| Líneas de código | ~172,000 |
| Endpoints API | 370+ |
| Endpoints debug/test | ~150 |
| Tests automatizados | 0 |
| Security headers | 0 |
| Modelos Prisma duplicados | 5 |

---

## Orden Recomendado de Resolución

1. **Semana 1:** Items 1-4 (Críticos de seguridad)
2. **Semana 2:** Items 5-8 (Funcionalidad core)
3. **Semana 3-4:** Items 9-15 (Calidad de código)
4. **Ongoing:** Items 16-20 (Mejoras continuas)

---

*Documento generado automáticamente - actualizar conforme se resuelvan items*
