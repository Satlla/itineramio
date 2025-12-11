# Script de Enlaces Internos Estratégicos

## Descripción

Este script agrega enlaces internos estratégicos a artículos huérfanos del blog de Itineramio para mejorar el SEO interno y la navegabilidad.

## Características

- **Inserción Contextual**: Busca texto específico en los artículos y convierte palabras clave en enlaces
- **Búsqueda Inteligente**: Si no encuentra el texto exacto, busca variaciones (mayúsculas/minúsculas)
- **Sección Relacionada**: Si no puede insertar contextualmente, agrega una sección de artículo relacionado al final
- **Prevención de Duplicados**: Verifica que no existan enlaces previos al artículo objetivo
- **Estilos Consistentes**: Todos los enlaces usan el color `#6366f1` con subrayado
- **Logging Detallado**: Reporta el progreso y errores durante la ejecución

## Artículos Objetivo (Huérfanos)

El script agrega enlaces a estos 5 artículos huérfanos:

1. **Del Modo Bombero al Modo CEO: Framework** (9 vistas)
   - Slug: `del-modo-bombero-al-modo-ceo-framework`
   - Enlaces desde: caso-laura, automatizacion-anfitriones, operaciones-check-in

2. **Automatización Airbnb: Recupera 8 Horas** (9 vistas)
   - Slug: `automatizacion-airbnb-recupera-8-horas-semanales`
   - Enlaces desde: mensajes-automaticos-airbnb, stack-tecnologico, primer-mes-anfitrion

3. **RevPAR vs Ocupación: La Métrica que Cambia Todo** (8 vistas)
   - Slug: `revpar-vs-ocupacion-metrica-que-cambia-todo`
   - Enlaces desde: optimizar-precio, caso-laura, 10-trucos-marketing

4. **Metodología y Fuentes de Datos de Itineramio** (8 vistas)
   - Slug: `metodologia-fuentes-datos-itineramio`
   - Enlaces desde: caso-laura, revpar-vs-ocupacion, optimizar-precio

5. **Automatización para Anfitriones: Ahorra 15 Horas** (0 vistas)
   - Slug: `automatizacion-anfitriones-airbnb`
   - Enlaces desde: mensajes-automaticos-booking, stack-tecnologico, operaciones-check-in

## Cómo Funciona

### 1. Inserción Contextual

El script busca texto específico en los artículos fuente y lo convierte en un enlace:

**Antes:**
```html
<p>Laura dejó de apagar fuegos y empezó a escalar su negocio.</p>
```

**Después:**
```html
<p>Laura <a href="/blog/del-modo-bombero-al-modo-ceo-framework" style="color: #6366f1; text-decoration: underline;">dejó de apagar fuegos</a> y empezó a escalar su negocio.</p>
```

### 2. Sección Relacionada (Fallback)

Si no encuentra el texto para inserción contextual, agrega una sección al final:

```html
<div style="margin-top: 3rem; padding: 1.5rem; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #6366f1;">
  <h3 style="margin-top: 0; color: #1f2937; font-size: 1.25rem;">📚 Artículo Relacionado</h3>
  <p style="margin-bottom: 0;">
    <a href="/blog/del-modo-bombero-al-modo-ceo-framework" style="color: #6366f1; text-decoration: underline; font-weight: 600;">Del Modo Bombero al Modo CEO: Framework</a>
  </p>
</div>
```

## Uso

### Requisitos Previos

```bash
npm install @prisma/client cheerio
```

### Ejecutar el Script

```bash
# Desde la raíz del proyecto
npx tsx scripts/add-internal-links.ts
```

### Analizar Artículos Huérfanos (Opcional)

Para ver una lista actualizada de artículos huérfanos antes de ejecutar:

1. Abre el archivo `scripts/add-internal-links.ts`
2. Descomenta la línea en la función `main()`:
   ```typescript
   // await analyzeOrphans();  // <- Descomenta esta línea
   ```
3. Ejecuta el script

## Configuración

### Agregar Nuevos Enlaces

Edita el array `linkPlacements` en el script:

```typescript
const linkPlacements: LinkPlacement[] = [
  {
    targetSlug: 'articulo-huerfano',
    targetTitle: 'Título del Artículo Huérfano',
    placements: [
      {
        sourceSlug: 'articulo-donde-agregar-enlace',
        searchText: 'texto a buscar en el artículo',
        linkText: 'texto que se convertirá en enlace',
      },
      // Más enlaces...
    ],
  },
  // Más artículos...
];
```

### Cambiar Color de Enlaces

Modifica la constante `LINK_COLOR`:

```typescript
const LINK_COLOR = '#6366f1'; // Cambiar a tu color preferido
```

## Salida del Script

```
🔗 AGREGANDO ENLACES INTERNOS ESTRATÉGICOS

================================================================================

📋 Configuración:
   - Artículos huérfanos a promocionar: 5
   - Total de enlaces a agregar: 15
   - Color de enlaces: #6366f1

================================================================================

🎯 Procesando: Del Modo Bombero al Modo CEO: Framework
   Slug: del-modo-bombero-al-modo-ceo-framework
   Enlaces a agregar: 3

   📝 Caso Laura: De 1,800€ a 3,200€/mes - Historia Completa
      ✅ Enlace agregado exitosamente
   📝 Automatización para Anfitriones: Guía Completa
      ✅ Enlace agregado exitosamente
   📝 Operaciones Eficientes: Check-in Sin Estrés
      ⏭️  Ya contiene enlace al artículo objetivo, omitiendo...

...

================================================================================

📊 RESUMEN FINAL

✅ Enlaces agregados: 13
📝 Artículos modificados: 13
❌ Errores: 0

================================================================================

🎉 Proceso completado!
```

## Verificación Post-Ejecución

Después de ejecutar el script, verifica:

1. **En la Base de Datos**:
   ```bash
   npx tsx scripts/analyze-blog-links.ts
   ```
   - Debe mostrar menos artículos huérfanos
   - Los 5 artículos objetivo deben tener enlaces entrantes

2. **En el Blog**:
   - Visita los artículos fuente modificados
   - Verifica que los enlaces se vean correctamente
   - Prueba que los enlaces funcionen

3. **SEO**:
   - Verifica en Google Search Console después de unos días
   - Los artículos huérfanos deberían empezar a recibir tráfico interno

## Estrategia de Linking Interno

### Criterios de Selección

- **Relevancia temática**: Enlaces desde artículos de la misma categoría
- **Flujo natural**: El enlace debe tener sentido en el contexto
- **Autoridad**: Preferir enlaces desde artículos con más tráfico
- **Distribución**: 2-3 enlaces entrantes por artículo huérfano

### Artículos Fuente Seleccionados

Los artículos fuente fueron elegidos porque:

1. **Alto tráfico**: Artículos con más vistas que pueden pasar autoridad
2. **Relevancia**: Contenido relacionado temáticamente
3. **Contexto natural**: El enlace fluye naturalmente en el contenido

## Troubleshooting

### Error: "No se encontró el artículo"

**Causa**: El slug del artículo fuente no existe en la base de datos

**Solución**: Verifica que el slug sea correcto:
```bash
npx tsx scripts/list-all-blog-articles.ts
```

### Error: "No se encontró el texto"

**Causa**: El texto de búsqueda no existe en el artículo fuente

**Solución**:
1. Lee el artículo fuente para encontrar texto similar
2. Actualiza `searchText` en la configuración
3. O deja que el script agregue la sección relacionada automáticamente

### No se Agregó el Enlace

**Causa**: Ya existe un enlace al artículo objetivo

**Solución**: Esto es intencional para evitar duplicados. No requiere acción.

## Mantenimiento

### Actualizar Enlaces Periódicamente

Ejecuta el análisis de huérfanos cada mes:

```bash
# Ver artículos huérfanos actuales
npx tsx scripts/analyze-blog-links.ts
```

### Monitorear Métricas

Después de 2-4 semanas, revisa:
- Vistas de los artículos huérfanos (deberían aumentar)
- Tasa de rebote (debería disminuir)
- Tiempo en el sitio (debería aumentar)

## Notas Técnicas

### Dependencias

- **Prisma**: ORM para acceso a la base de datos
- **Cheerio**: Parser HTML para manipular el contenido
- **TypeScript**: Tipado estático para mayor seguridad

### Seguridad

- El script verifica que no se sobrescriban enlaces existentes
- No modifica el contenido HTML fuera de los enlaces
- Usa transacciones de base de datos para integridad

### Performance

- Procesa artículos secuencialmente para evitar sobrecarga
- Tiempo de ejecución estimado: 5-10 segundos
- No requiere downtime del sitio

## Changelog

### Versión 1.0 (2024-12-11)

- Versión inicial
- Soporte para 5 artículos huérfanos
- 15 enlaces internos configurados
- Inserción contextual + fallback a sección relacionada
- Logging detallado
- Prevención de duplicados

## Contacto

Para preguntas o mejoras, contacta al equipo de desarrollo de Itineramio.
