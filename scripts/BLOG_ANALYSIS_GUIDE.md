# Guía Completa de Análisis del Blog de Itineramio

Esta guía describe todos los scripts y herramientas creados para analizar los artículos del blog de Itineramio.

## 📂 Archivos Creados

### Scripts de Análisis

1. **`analyze-blog-articles.ts`** (Principal - TypeScript)
   - Script completo de análisis de todos los artículos
   - Genera reportes JSON y Markdown detallados
   - Detecta problemas de formato, SEO, y calidad de contenido

2. **`analyze-blog-simple.js`** (Alternativa - JavaScript)
   - Versión simplificada en JavaScript puro
   - No requiere compilación de TypeScript
   - Genera reportes básicos

3. **`query-blog-articles.ts`** (Consultas)
   - Herramienta CLI para consultar artículos específicos
   - Múltiples comandos para diferentes búsquedas
   - Útil para inspección rápida

### Scripts Shell

4. **`run-blog-analysis.sh`**
   - Script bash para ejecutar el análisis completo
   - Configura variables de entorno automáticamente
   - Muestra preview de los resultados

### Documentación

5. **`README-BLOG-ANALYSIS.md`**
   - Documentación completa del análisis
   - Instrucciones de uso
   - Explicación de reportes generados

6. **`BLOG_ANALYSIS_GUIDE.md`** (este archivo)
   - Guía general de todos los scripts
   - Casos de uso y ejemplos

---

## 🚀 Inicio Rápido

### Análisis Completo

```bash
# Opción 1: Script shell (más fácil)
chmod +x scripts/run-blog-analysis.sh
./scripts/run-blog-analysis.sh

# Opción 2: Directamente con TypeScript
npx ts-node scripts/analyze-blog-articles.ts

# Opción 3: Versión JavaScript
node scripts/analyze-blog-simple.js
```

### Consultas Rápidas

```bash
# Ver estadísticas generales
npx ts-node scripts/query-blog-articles.ts stats

# Top 10 artículos más vistos
npx ts-node scripts/query-blog-articles.ts top 10

# Artículos publicados
npx ts-node scripts/query-blog-articles.ts status PUBLISHED

# Artículos de una categoría
npx ts-node scripts/query-blog-articles.ts category GUIAS

# Buscar artículos
npx ts-node scripts/query-blog-articles.ts search "airbnb"

# Ver detalle de un artículo
npx ts-node scripts/query-blog-articles.ts detail mi-slug

# Encontrar artículos cortos
npx ts-node scripts/query-blog-articles.ts short 5000

# Artículos sin metadata completa
npx ts-node scripts/query-blog-articles.ts missing
```

---

## 📊 Qué Analiza

### 1. Estructura del Modelo BlogPost (Prisma)

```prisma
model BlogPost {
  id              String       @id @default(cuid())
  slug            String       @unique
  title           String
  subtitle        String?
  excerpt         String
  content         String
  coverImage      String?
  coverImageAlt   String?
  category        BlogCategory
  tags            String[]
  featured        Boolean      @default(false)
  metaTitle       String?
  metaDescription String?
  keywords        String[]
  status          BlogStatus   @default(DRAFT)
  publishedAt     DateTime?
  scheduledFor    DateTime?
  authorId        String
  authorName      String
  views           Int          @default(0)
  uniqueViews     Int          @default(0)
  readTime        Int          @default(5)
  likes           Int          @default(0)
  shares          Int          @default(0)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  authorImage     String?
}

enum BlogCategory {
  GUIAS
  MEJORES_PRACTICAS
  NORMATIVA
  AUTOMATIZACION
  MARKETING
  OPERACIONES
  CASOS_ESTUDIO
  NOTICIAS
}

enum BlogStatus {
  DRAFT
  REVIEW
  SCHEDULED
  PUBLISHED
  ARCHIVED
}
```

### 2. Análisis de Contenido

- **Formato detectado**: HTML, Markdown, Mixto, Desconocido
- **Longitud**: Total de caracteres
- **Imágenes**: Cantidad y URLs extraídas
- **Tiempo de lectura**: Minutos estimados

### 3. Detección de Problemas

#### Problemas de Formato
- ❌ Clases Tailwind sin convertir (`class="..."`)
- ❌ HTML visible como texto (`&lt;`, `&gt;`)
- ❌ Contenido muy corto (< 5000 caracteres)

#### Problemas de SEO
- ❌ Sin meta title
- ❌ Sin meta description
- ❌ Meta description muy larga (> 160 caracteres)
- ❌ Meta description muy corta (< 120 caracteres)
- ❌ Sin excerpt
- ❌ Sin keywords
- ❌ Sin imagen de portada
- ❌ Sin texto alternativo en imagen

### 4. Métricas y Rendimiento

- Views (vistas totales)
- Unique views (vistas únicas)
- Likes y shares
- Engagement (calculado)
- Top performing articles

---

## 📄 Reportes Generados

### 1. JSON Report (`/tmp/blog-articles-analysis.json`)

Estructura completa:

```json
{
  "generatedAt": "2025-12-11T...",
  "summary": {
    "totalArticles": 25,
    "byStatus": [
      { "status": "PUBLISHED", "count": 18, "percentage": 72 },
      { "status": "DRAFT", "count": 7, "percentage": 28 }
    ],
    "byCategory": [
      {
        "category": "GUIAS",
        "count": 8,
        "published": 6,
        "draft": 2,
        "avgLength": 12500,
        "avgViews": 850,
        "totalViews": 6800
      }
    ],
    "avgContentLength": 11250,
    "articlesWithIssues": 5,
    "articlesWithoutMetaDescription": 3,
    "articlesWithoutExcerpt": 2,
    "shortArticles": 4,
    "articlesWithTailwindIssues": 1,
    "articlesWithHTMLIssues": 0,
    "totalViews": 15000,
    "avgViews": 600
  },
  "articles": [
    {
      "id": "clx...",
      "slug": "guia-airbnb-2024",
      "title": "Guía Completa Airbnb 2024",
      "subtitle": "Todo lo que necesitas saber",
      "category": "GUIAS",
      "status": "PUBLISHED",
      "featured": true,
      "contentLength": 15000,
      "excerptLength": 200,
      "hasExcerpt": true,
      "contentFormat": "HTML",
      "hasUnconvertedTailwind": false,
      "hasVisibleHTML": false,
      "hasClassAttribute": false,
      "tailwindClassCount": 0,
      "coverImage": "https://...",
      "coverImageAlt": "Portada guía Airbnb",
      "imagesInContent": 5,
      "imageUrls": ["https://...", "https://..."],
      "metaTitle": "Guía Completa Airbnb 2024 | Itineramio",
      "metaDescription": "Descubre todo lo que necesitas...",
      "hasMetaTitle": true,
      "hasMetaDescription": true,
      "metaDescriptionLength": 150,
      "keywords": ["airbnb", "guía", "2024"],
      "tags": ["airbnb", "hosting"],
      "views": 1250,
      "uniqueViews": 980,
      "readTime": 8,
      "likes": 45,
      "shares": 12,
      "createdAt": "2024-01-15T...",
      "updatedAt": "2024-02-10T...",
      "publishedAt": "2024-01-20T...",
      "scheduledFor": null,
      "authorId": "...",
      "authorName": "Equipo Itineramio",
      "authorImage": "https://...",
      "isTooShort": false,
      "missingMetaData": [],
      "formatIssues": []
    }
  ]
}
```

### 2. Markdown Report (`/tmp/blog-articles-report.md`)

Secciones incluidas:

1. **Resumen Ejecutivo**
   - Total de artículos
   - Longitud promedio
   - Vistas totales y promedio

2. **Artículos por Estado**
   - Tabla con cantidad y porcentaje

3. **Artículos por Categoría**
   - Tabla con métricas detalladas

4. **Problemas Detectados**
   - Contadores de diferentes tipos de problemas

5. **Artículos con Problemas de Formato**
   - Tabla detallada de artículos problemáticos

6. **Artículos sin Meta Description**
   - Lista completa

7. **Artículos sin Excerpt**
   - Lista completa

8. **Artículos Muy Cortos**
   - Tabla con longitud exacta

9. **Artículos con Clases Tailwind**
   - Número de clases encontradas

10. **Top 10 Artículos Más Vistos**
    - Ranking con métricas

11. **Lista Completa de Artículos**
    - Tabla con todos los artículos

12. **Análisis de Formato**
    - Distribución HTML vs Markdown

13. **Análisis de Imágenes**
    - Estadísticas de cobertura

14. **Recomendaciones**
    - Priorizadas por importancia

---

## 🔍 Casos de Uso Comunes

### 1. Auditoría Completa del Blog

```bash
# Generar reporte completo
./scripts/run-blog-analysis.sh

# Ver el reporte
cat /tmp/blog-articles-report.md

# Analizar JSON con jq
cat /tmp/blog-articles-analysis.json | jq '.summary'
```

### 2. Encontrar Artículos Problemáticos

```bash
# Artículos sin meta description
npx ts-node scripts/query-blog-articles.ts missing

# Artículos muy cortos
npx ts-node scripts/query-blog-articles.ts short 5000

# Ver artículos con problemas en JSON
cat /tmp/blog-articles-analysis.json | jq '.articles[] | select(.formatIssues | length > 0)'
```

### 3. Análisis de Rendimiento

```bash
# Top artículos
npx ts-node scripts/query-blog-articles.ts top 20

# Estadísticas generales
npx ts-node scripts/query-blog-articles.ts stats

# Ver métricas en JSON
cat /tmp/blog-articles-analysis.json | jq '.summary.byCategory'
```

### 4. Inspección de Artículo Específico

```bash
# Ver detalle completo
npx ts-node scripts/query-blog-articles.ts detail mi-slug

# Buscar en JSON
cat /tmp/blog-articles-analysis.json | jq '.articles[] | select(.slug == "mi-slug")'
```

### 5. Búsqueda y Filtrado

```bash
# Buscar por texto
npx ts-node scripts/query-blog-articles.ts search "airbnb"

# Filtrar por categoría
npx ts-node scripts/query-blog-articles.ts category GUIAS

# Filtrar por status
npx ts-node scripts/query-blog-articles.ts status DRAFT
```

### 6. Análisis de Imágenes

```bash
# Ver artículos sin imagen de portada
cat /tmp/blog-articles-analysis.json | jq '.articles[] | select(.coverImage == null) | {title, slug}'

# Ver artículos sin alt text
cat /tmp/blog-articles-analysis.json | jq '.articles[] | select(.coverImage != null and .coverImageAlt == null) | {title, slug}'

# Contar imágenes por artículo
cat /tmp/blog-articles-analysis.json | jq '.articles[] | {title, images: .imagesInContent}'
```

### 7. Análisis de Categorías

```bash
# Ver distribución por categoría
cat /tmp/blog-articles-analysis.json | jq '.summary.byCategory[] | {category, count, avgViews}'

# Artículos de una categoría específica
cat /tmp/blog-articles-analysis.json | jq '.articles[] | select(.category == "GUIAS") | {title, views}'
```

### 8. Análisis de Estado

```bash
# Contar por estado
cat /tmp/blog-articles-analysis.json | jq '.summary.byStatus'

# Artículos programados
cat /tmp/blog-articles-analysis.json | jq '.articles[] | select(.scheduledFor != null) | {title, scheduledFor}'
```

---

## 📊 Queries Útiles con jq

### Problemas de SEO

```bash
# Artículos sin meta description
cat /tmp/blog-articles-analysis.json | jq '.articles[] | select(.hasMetaDescription == false) | {title, slug, status}'

# Meta descriptions muy largas
cat /tmp/blog-articles-analysis.json | jq '.articles[] | select(.metaDescriptionLength > 160) | {title, length: .metaDescriptionLength}'

# Artículos sin keywords
cat /tmp/blog-articles-analysis.json | jq '.articles[] | select(.keywords | length == 0) | {title, slug}'
```

### Análisis de Formato

```bash
# Artículos con Tailwind sin convertir
cat /tmp/blog-articles-analysis.json | jq '.articles[] | select(.hasUnconvertedTailwind == true) | {title, tailwindClasses: .tailwindClassCount}'

# Distribución de formatos
cat /tmp/blog-articles-analysis.json | jq '[.articles[].contentFormat] | group_by(.) | map({format: .[0], count: length})'

# Artículos con HTML visible
cat /tmp/blog-articles-analysis.json | jq '.articles[] | select(.hasVisibleHTML == true) | {title, slug}'
```

### Análisis de Contenido

```bash
# Artículos más largos
cat /tmp/blog-articles-analysis.json | jq '.articles | sort_by(.contentLength) | reverse | .[0:5] | .[] | {title, length: .contentLength}'

# Artículos más cortos
cat /tmp/blog-articles-analysis.json | jq '.articles | sort_by(.contentLength) | .[0:5] | .[] | {title, length: .contentLength}'

# Longitud promedio por categoría
cat /tmp/blog-articles-analysis.json | jq '.summary.byCategory[] | {category, avgLength}'
```

### Análisis de Rendimiento

```bash
# Top 5 con mejor engagement
cat /tmp/blog-articles-analysis.json | jq '.articles | sort_by(.views) | reverse | .[0:5] | .[] | {title, views, likes, shares}'

# Artículos featured
cat /tmp/blog-articles-analysis.json | jq '.articles[] | select(.featured == true) | {title, views, category}'

# Artículos con 0 vistas
cat /tmp/blog-articles-analysis.json | jq '.articles[] | select(.views == 0) | {title, slug, publishedAt}'
```

---

## 🛠️ Personalización

### Modificar Umbrales

Edita `scripts/analyze-blog-articles.ts`:

```typescript
// Cambiar longitud mínima de artículo
const isTooShort = article.content.length < 5000; // Modificar 5000

// Cambiar límite de meta description
if (metaDescriptionLength > 160) // Modificar 160
if (metaDescriptionLength < 120) // Modificar 120
```

### Agregar Nuevos Análisis

```typescript
// En la función analyzeContent()
const hasCustomIssue = /patron-regex/.test(content);

// En el objeto analysis
customCheck: hasCustomIssue,
```

### Cambiar Ruta de Salida

```typescript
// Modificar las rutas
const outputPath = '/tmp/blog-articles-analysis.json';
// Cambiar a:
const outputPath = '/path/custom/report.json';
```

---

## 🚨 Solución de Problemas

### Error de Conexión a Base de Datos

```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Establecer manualmente
export DATABASE_URL="postgresql://..."
```

### Error de Prisma Client

```bash
# Regenerar cliente
npx prisma generate

# Reinstalar dependencias
npm install
```

### Script no Ejecutable

```bash
chmod +x scripts/run-blog-analysis.sh
```

### ts-node No Encontrado

```bash
# Instalar globalmente
npm install -g ts-node typescript

# O usar con npx
npx ts-node scripts/...
```

---

## 📝 Notas Importantes

1. **Solo Lectura**: Los scripts NO modifican la base de datos
2. **Producción**: Se conectan a la base de datos de producción
3. **Archivos Temporales**: `/tmp/` se limpia al reiniciar
4. **Seguridad**: No commitear archivos con credenciales

---

## 🎯 Siguiente Pasos Recomendados

1. **Ejecutar análisis completo** para obtener baseline
2. **Revisar artículos con problemas** y priorizarlos
3. **Optimizar SEO** en artículos sin metadata
4. **Expandir artículos cortos** para mejorar calidad
5. **Convertir Tailwind** a formato apropiado
6. **Agregar imágenes** donde falten
7. **Optimizar artículos** de bajo rendimiento

---

## 📚 Recursos Adicionales

- **Prisma Schema**: `/prisma/schema.prisma`
- **Admin Blog**: `/app/admin/blog/page.tsx`
- **Public Blog**: `/app/(public)/blog/page.tsx`
- **API Routes**: `/app/api/admin/blog/`

---

*Guía creada: Diciembre 2024*
*Última actualización: 2024-12-11*
