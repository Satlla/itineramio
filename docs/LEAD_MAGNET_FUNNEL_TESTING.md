# Lead Magnet Funnel - Testing Guide

## Estado Actual
TODO el sistema P0 (crítico) está completamente implementado y listo para probar.

## Componentes Implementados

### 1. Landing Pages
- ✅ `/recursos` - Catálogo de las 8 guías
- ✅ `/recursos/[slug]` - Landing page individual con form

### 2. Backend
- ✅ `/api/email/subscribe` - Procesa suscripciones y genera tokens
- ✅ `/src/lib/tokens.ts` - Sistema de tokens con validación
- ✅ `/src/lib/resend.ts` - Función `sendLeadMagnetEmail()`

### 3. Download Flow
- ✅ `/recursos/[slug]/download` - Página de descarga con validación de token
- ✅ `/recursos/[slug]/gracias` - Thank you page (fallback)

### 4. Email & PDFs
- ✅ Email template con link de descarga
- ✅ 8 PDFs profesionales generados en `/public/downloads/`

## Flujo de Testing End-to-End

### Test 1: Flujo Completo de Nuevo Suscriptor

1. **Acceder a landing page**
   ```
   http://localhost:3000/recursos/estratega-5-kpis
   ```

2. **Completar formulario**
   - Ingresar email de prueba (ej: `test+estratega@example.com`)
   - Click en "Descargar guía gratis"

3. **Verificar redirección**
   - Debe redirigir a: `/recursos/estratega-5-kpis/download?token=XXXXXX`
   - Token debe estar presente en la URL

4. **Verificar página de descarga**
   - ✅ Se muestra el nombre del suscriptor (o "anfitrión" si no hay nombre)
   - ✅ Botón de descarga presente
   - ✅ Link funcional al PDF
   - ✅ CTA a registro/demo visible

5. **Descargar PDF**
   - Click en "Descargar PDF ahora"
   - Debe iniciar descarga de `estratega-5-kpis.pdf` (774KB, 8 páginas)

6. **Verificar email**
   - Check inbox del email usado
   - ✅ Email recibido con asunto: "📥 Tu guía está lista: El Manual del Estratega"
   - ✅ Botón de descarga presente en email
   - ✅ Link funciona (mismo token que en redirección)

7. **Verificar base de datos**
   ```sql
   SELECT * FROM emailSubscriber WHERE email = 'test+estratega@example.com';
   ```
   - ✅ `downloadedGuide` = true
   - ✅ `currentJourneyStage` = 'guide_downloaded'
   - ✅ `engagementScore` = 'hot' (si antes era 'cold', debería subir a 'warm')
   - ✅ `lastEngagement` actualizado

### Test 2: Suscriptor Existente

1. **Repetir flujo con mismo email**
   - Usar el mismo email del Test 1

2. **Verificar comportamiento**
   - ✅ Debe enviar email nuevamente con nuevo token
   - ✅ Debe redirigir correctamente
   - ✅ Debe mostrar mensaje "Ya estás suscrito" en respuesta API

### Test 3: Token Validation

1. **Token válido**
   - Usar token de descarga válido → debe funcionar

2. **Token inválido**
   ```
   /recursos/estratega-5-kpis/download?token=invalid123
   ```
   - ✅ Debe redirigir a `/recursos/estratega-5-kpis?error=token_invalid`

3. **Sin token**
   ```
   /recursos/estratega-5-kpis/download
   ```
   - ✅ Debe redirigir a `/recursos/estratega-5-kpis`

4. **Token de otro lead magnet**
   - Usar token de estratega en página de sistemático
   - ✅ Debe redirigir con error `token_mismatch`

### Test 4: Token Expiration (Opcional - requiere modificar timestamp)

1. **Simular token expirado**
   - Modificar timestamp en token para que sea > 30 días atrás
   - ✅ Debe rechazar token

## Tests por Cada Arquetipo

Repetir Test 1 para cada uno de los 8 lead magnets:

- [ ] `/recursos/estratega-5-kpis`
- [ ] `/recursos/sistematico-47-tareas`
- [ ] `/recursos/diferenciador-storytelling`
- [ ] `/recursos/ejecutor-modo-ceo`
- [ ] `/recursos/resolutor-27-crisis`
- [ ] `/recursos/experiencial-corazon-escalable`
- [ ] `/recursos/equilibrado-versatil-excepcional`
- [ ] `/recursos/improvisador-kit-anti-caos`

## Comandos Útiles

### Ver logs del servidor
```bash
# Terminal con npm run dev
# Ver console.logs del backend
```

### Verificar email en Resend Dashboard
```
https://resend.com/emails
```

### Consultar base de datos
```bash
# Conectarse a Prisma Studio
npx prisma studio
```

### Generar nuevos PDFs (si es necesario)
```bash
npx tsx scripts/generate-pdfs.ts all
```

## Checklist Final

### ✅ Funcionalidad Básica
- [ ] Form captura email correctamente
- [ ] Token se genera y valida correctamente
- [ ] Email se envía con link correcto
- [ ] PDFs se descargan correctamente
- [ ] Base de datos se actualiza correctamente

### ✅ Manejo de Errores
- [ ] Tokens inválidos redirigen correctamente
- [ ] Suscriptores inactivos no pueden descargar
- [ ] Emails duplicados se manejan correctamente

### ✅ UX
- [ ] Redirección inmediata post-submit
- [ ] Mensajes de éxito claros
- [ ] Loading states en botones
- [ ] Mobile responsive

## Próximos Pasos (P1 - Mejoras)

Una vez completado P0, implementar:

1. **Integración con Test de Personalidad**
   - Recomendar lead magnet según resultado
   - Pre-llenar archetype en metadata

2. **Cross-selling**
   - Mostrar otros lead magnets relacionados
   - "También te puede interesar..."

3. **Analytics**
   - Track conversión por arquetipo
   - Funnel analytics en dashboard

4. **Email Sequences**
   - Day 3: Caso de éxito
   - Day 7: Consejos adicionales
   - Day 14: Urgencia trial
