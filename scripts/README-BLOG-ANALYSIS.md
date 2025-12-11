# Análisis Completo de Artículos del Blog

Este script analiza **TODOS** los artículos del blog de Itineramio en la base de datos y genera reportes detallados.

## 🎯 Qué Analiza

El script examina cada artículo y extrae:

### 📊 Información Básica
- Título, slug, categoría, status
- Fechas de creación, actualización y publicación
- Información del autor

### 📝 Análisis de Contenido
- Longitud del contenido (en caracteres)
- Formato detectado: HTML, Markdown, Mixto o Desconocido
- Número de imágenes en el contenido
- URLs de todas las imágenes
- Tiempo de lectura estimado

### 🔍 Detección de Problemas de Formato
- ❌ Clases Tailwind sin convertir (busca `class="..."`)
- ❌ HTML visible como texto (entidades HTML: `&lt;`, `&gt;`, etc.)
- ❌ Contenido muy corto (< 5000 caracteres)
- ❌ Meta description demasiado larga (> 160 caracteres)
- ❌ Meta description demasiado corta (< 120 caracteres)

### 🖼️ Análisis de Imágenes
- Imagen de portada (coverImage)
- Texto alternativo (coverImageAlt)
- Imágenes dentro del contenido
- URLs de todas las imágenes encontradas

### 📈 SEO y Metadata
- Meta título (metaTitle)
- Meta descripción (metaDescription)
- Excerpt (resumen)
- Keywords (palabras clave)
- Tags (etiquetas)

### 📊 Métricas de Rendimiento
- Número de vistas totales
- Vistas únicas
- Likes y shares
- Artículos destacados (featured)

## 🚀 Cómo Ejecutar

### Opción 1: Script Shell (Recomendado)

```bash
# Hacer el script ejecutable
chmod +x scripts/run-blog-analysis.sh

# Ejecutar el análisis
./scripts/run-blog-analysis.sh
```

### Opción 2: Directamente con ts-node

```bash
# Establecer la variable de entorno
export DATABASE_URL="postgresql://postgres.scgbdfltemsthgwianbl:Bolero1492*@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&schema=public"

# Ejecutar el script
npx ts-node scripts/analyze-blog-articles.ts
```

### Opción 3: Con npm script (después de agregar a package.json)

```bash
npm run analyze:blog
```

## 📄 Archivos Generados

### 1. `/tmp/blog-articles-analysis.json`

Archivo JSON completo con todos los datos de cada artículo. Incluye:

```json
{
  "generatedAt": "2025-12-11T...",
  "summary": {
    "totalArticles": 25,
    "byStatus": [...],
    "byCategory": [...],
    "avgContentLength": 12500,
    "articlesWithIssues": 5,
    ...
  },
  "articles": [
    {
      "id": "...",
      "slug": "guia-completa-...",
      "title": "Guía Completa...",
      "category": "GUIAS",
      "status": "PUBLISHED",
      "contentLength": 15000,
      "contentFormat": "HTML",
      "hasUnconvertedTailwind": false,
      "hasVisibleHTML": false,
      "imagesInContent": 5,
      "imageUrls": [...],
      "metaDescription": "...",
      "views": 1250,
      "uniqueViews": 980,
      ...
    },
    ...
  ]
}
```

**Uso:**
```bash
# Ver el JSON formateado
cat /tmp/blog-articles-analysis.json | jq .

# Ver solo el resumen
cat /tmp/blog-articles-analysis.json | jq '.summary'

# Ver artículos con problemas
cat /tmp/blog-articles-analysis.json | jq '.articles[] | select(.formatIssues | length > 0)'
```

### 2. `/tmp/blog-articles-report.md`

Reporte en Markdown con tablas y estadísticas. Incluye:

- **Resumen ejecutivo** con estadísticas clave
- **Artículos por estado** (PUBLISHED, DRAFT, etc.)
- **Artículos por categoría** con métricas
- **Problemas detectados** con contadores
- **Tablas detalladas:**
  - Artículos con problemas de formato
  - Artículos sin meta description
  - Artículos sin excerpt
  - Artículos muy cortos
  - Artículos con clases Tailwind
  - Top 10 artículos más vistos
  - Lista completa de artículos
- **Análisis de formato** (HTML vs Markdown)
- **Análisis de imágenes**
- **Recomendaciones** priorizadas

**Uso:**
```bash
# Ver el reporte en terminal
cat /tmp/blog-articles-report.md

# Ver en un viewer de Markdown
open /tmp/blog-articles-report.md

# Buscar artículos con problemas específicos
grep "Tailwind" /tmp/blog-articles-report.md
```

## 📊 Estadísticas Generadas

### Por Estado
- Total de artículos PUBLISHED
- Total de artículos DRAFT
- Total de artículos REVIEW
- Total de artículos SCHEDULED
- Total de artículos ARCHIVED
- Porcentaje de cada estado

### Por Categoría
- GUIAS
- MEJORES_PRACTICAS
- NORMATIVA
- AUTOMATIZACION
- MARKETING
- OPERACIONES
- CASOS_ESTUDIO
- NOTICIAS

Para cada categoría:
- Cantidad total
- Artículos publicados
- Artículos en borrador
- Longitud promedio
- Vistas promedio
- Vistas totales

### Problemas Detectados
- Artículos con problemas de formato
- Artículos sin meta description
- Artículos sin excerpt
- Artículos muy cortos (< 5000 caracteres)
- Artículos con clases Tailwind sin convertir
- Artículos con HTML visible como texto

## 🔧 Troubleshooting

### Error: "Cannot find module '@prisma/client'"

```bash
npm install
npx prisma generate
```

### Error: "Connection refused"

Verifica que la `DATABASE_URL` sea correcta y que tengas acceso a la base de datos.

### Error: "Permission denied"

```bash
chmod +x scripts/run-blog-analysis.sh
```

## 📝 Notas Importantes

1. **No modifica la base de datos**: El script solo lee datos, nunca modifica nada
2. **Conexión a producción**: Se conecta a la base de datos de producción (Supabase)
3. **Archivos en /tmp**: Los reportes se guardan en `/tmp/` que se limpia al reiniciar el sistema
4. **Tiempo de ejecución**: Depende del número de artículos (aproximadamente 1-2 segundos por artículo)

## 🎨 Personalización

Para modificar el análisis, edita el archivo:
```
scripts/analyze-blog-articles.ts
```

Puedes cambiar:
- Umbrales de longitud mínima (actualmente 5000 caracteres)
- Patrones de detección de problemas
- Formato de los reportes
- Ruta de salida de los archivos

## 📞 Soporte

Si encuentras problemas o necesitas ayuda, contacta al equipo de desarrollo.
