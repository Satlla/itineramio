# 🚀 Sistema de Análisis del Blog de Itineramio

## 📖 Empieza Aquí

Este sistema te permite analizar **TODOS** los artículos del blog de Itineramio con un solo comando.

---

## ⚡ Uso Rápido

### 1️⃣ Análisis Completo (Recomendado)

```bash
./scripts/run-blog-analysis.sh
```

**Esto genera:**
- ✅ `/tmp/blog-articles-analysis.json` - Datos completos en JSON
- ✅ `/tmp/blog-articles-report.md` - Reporte detallado en Markdown

---

### 2️⃣ Consultas Rápidas

```bash
# Ver estadísticas generales
./scripts/blog-quick-checks.sh stats

# Top 10 artículos más vistos
./scripts/blog-quick-checks.sh top

# Artículos publicados
./scripts/blog-quick-checks.sh published

# Artículos en borrador
./scripts/blog-quick-checks.sh draft

# Artículos sin metadata
./scripts/blog-quick-checks.sh missing

# Artículos muy cortos
./scripts/blog-quick-checks.sh short

# Buscar artículos
./scripts/blog-quick-checks.sh search "airbnb"

# Ver detalle de un artículo
./scripts/blog-quick-checks.sh detail mi-slug
```

---

## 📊 Qué Analiza

| Categoría | Análisis |
|-----------|----------|
| **Contenido** | Longitud, formato (HTML/Markdown), imágenes, tiempo de lectura |
| **SEO** | Meta title, meta description, excerpt, keywords, tags |
| **Formato** | Clases Tailwind sin convertir, HTML visible, problemas de formato |
| **Imágenes** | Portada, texto alternativo, imágenes en contenido |
| **Métricas** | Vistas, vistas únicas, likes, shares, engagement |
| **Estado** | PUBLISHED, DRAFT, REVIEW, SCHEDULED, ARCHIVED |
| **Categorías** | GUIAS, MEJORES_PRACTICAS, NORMATIVA, AUTOMATIZACION, etc. |

---

## 📄 Reportes Generados

### JSON Report (`/tmp/blog-articles-analysis.json`)

Archivo JSON con:
- Resumen con estadísticas agregadas
- Array completo con TODOS los artículos analizados
- Ideal para procesamiento automático

**Ver con jq:**
```bash
cat /tmp/blog-articles-analysis.json | jq .
cat /tmp/blog-articles-analysis.json | jq '.summary'
cat /tmp/blog-articles-analysis.json | jq '.articles[] | select(.formatIssues | length > 0)'
```

### Markdown Report (`/tmp/blog-articles-report.md`)

Reporte legible con:
- ✅ Resumen ejecutivo
- ✅ Tablas por estado y categoría
- ✅ Artículos con problemas
- ✅ Top 10 más vistos
- ✅ Lista completa de artículos
- ✅ Recomendaciones priorizadas

**Ver en terminal:**
```bash
cat /tmp/blog-articles-report.md
```

---

## 🔍 Problemas Detectados

El análisis identifica automáticamente:

- ❌ Artículos sin meta description
- ❌ Artículos sin excerpt
- ❌ Artículos muy cortos (< 5000 caracteres)
- ❌ Clases Tailwind sin convertir (`class="..."`)
- ❌ HTML visible como texto (`&lt;`, `&gt;`)
- ❌ Meta description muy larga (> 160 caracteres)
- ❌ Meta description muy corta (< 120 caracteres)
- ❌ Artículos sin imagen de portada
- ❌ Artículos sin texto alternativo en imagen
- ❌ Artículos sin keywords

---

## 📚 Documentación Completa

| Archivo | Descripción |
|---------|-------------|
| `START_HERE.md` | **Este archivo** - Inicio rápido |
| `RESUMEN_SCRIPTS_BLOG.md` | Resumen ejecutivo de todos los scripts |
| `BLOG_ANALYSIS_GUIDE.md` | Guía completa con casos de uso y ejemplos |
| `README-BLOG-ANALYSIS.md` | Documentación detallada del análisis |

---

## 🛠️ Scripts Disponibles

### Scripts Principales

| Script | Lenguaje | Uso |
|--------|----------|-----|
| `analyze-blog-articles.ts` | TypeScript | Análisis completo (principal) |
| `analyze-blog-simple.js` | JavaScript | Versión simplificada |
| `query-blog-articles.ts` | TypeScript | Consultas CLI interactivas |

### Scripts Shell

| Script | Descripción |
|--------|-------------|
| `run-blog-analysis.sh` | Ejecuta análisis completo |
| `blog-quick-checks.sh` | Verificaciones rápidas |

---

## 💡 Ejemplos de Uso

### Encontrar artículos problemáticos

```bash
# Artículos sin meta description
./scripts/blog-quick-checks.sh missing

# Artículos muy cortos
./scripts/blog-quick-checks.sh short

# Ver en JSON
cat /tmp/blog-articles-analysis.json | jq '.articles[] | select(.formatIssues | length > 0) | {title, issues: .formatIssues}'
```

### Análisis de rendimiento

```bash
# Top artículos
./scripts/blog-quick-checks.sh top

# Ver en JSON
cat /tmp/blog-articles-analysis.json | jq '.articles | sort_by(.views) | reverse | .[0:5] | .[] | {title, views, category}'
```

### Buscar artículos específicos

```bash
# Buscar por texto
./scripts/blog-quick-checks.sh search "airbnb"

# Ver detalle completo
./scripts/blog-quick-checks.sh detail guia-airbnb-2024
```

### Análisis por categoría

```bash
# Ver artículos de una categoría
cat /tmp/blog-articles-analysis.json | jq '.articles[] | select(.category == "GUIAS") | {title, views, status}'

# Estadísticas por categoría
cat /tmp/blog-articles-analysis.json | jq '.summary.byCategory'
```

---

## 🎯 Workflow Recomendado

### 1. Ejecutar Análisis Inicial

```bash
./scripts/run-blog-analysis.sh
```

### 2. Revisar Reporte

```bash
cat /tmp/blog-articles-report.md
```

### 3. Identificar Prioridades

```bash
# Ver artículos sin metadata
./scripts/blog-quick-checks.sh missing

# Ver artículos cortos
./scripts/blog-quick-checks.sh short
```

### 4. Consultar Artículos Específicos

```bash
# Ver detalle de artículo problemático
./scripts/blog-quick-checks.sh detail slug-del-articulo
```

### 5. Implementar Mejoras

- Agregar meta descriptions faltantes
- Expandir artículos muy cortos
- Optimizar SEO
- Agregar imágenes donde falten

### 6. Re-ejecutar Análisis

```bash
./scripts/run-blog-analysis.sh
```

---

## 🔧 Configuración

### Primera vez

```bash
# Hacer scripts ejecutables
chmod +x scripts/run-blog-analysis.sh
chmod +x scripts/blog-quick-checks.sh

# Ejecutar análisis
./scripts/run-blog-analysis.sh
```

### Requisitos

- Node.js instalado
- Acceso a la base de datos (configurado automáticamente)
- Dependencias de npm instaladas (`npm install`)

---

## 📊 Estadísticas Generadas

El análisis genera automáticamente:

### Totales
- Total de artículos
- Artículos por estado (PUBLISHED, DRAFT, etc.)
- Artículos por categoría
- Artículos featured

### Promedios
- Longitud promedio de contenido
- Vistas promedio por artículo
- Tiempo de lectura promedio

### Problemas
- Artículos con problemas de formato
- Artículos sin metadata completa
- Artículos muy cortos
- Artículos con bajo rendimiento

### Top Rankings
- Top 10 artículos más vistos
- Artículos con más engagement
- Categorías más populares

---

## ⚠️ Notas Importantes

1. **Solo Lectura**: Los scripts NO modifican la base de datos
2. **Producción**: Se conectan a la base de datos de producción
3. **Archivos Temporales**: Los reportes se guardan en `/tmp/`
4. **Seguridad**: Las credenciales están en los scripts (no commitear cambios)

---

## 🚨 Solución de Problemas

### Script no ejecuta

```bash
chmod +x scripts/run-blog-analysis.sh
chmod +x scripts/blog-quick-checks.sh
```

### Error de Prisma

```bash
npm install
npx prisma generate
```

### Error de ts-node

```bash
npm install -g ts-node typescript
# O usar con npx:
npx ts-node scripts/...
```

---

## 📞 Ayuda Rápida

### Ver todos los comandos disponibles

```bash
./scripts/blog-quick-checks.sh help
```

### Consultas avanzadas

```bash
npx ts-node scripts/query-blog-articles.ts
```

### Ver documentación completa

```bash
cat scripts/BLOG_ANALYSIS_GUIDE.md
```

---

## ✅ Checklist

- [ ] Scripts ejecutables (`chmod +x`)
- [ ] Ejecutar análisis completo
- [ ] Revisar reporte Markdown
- [ ] Identificar artículos problemáticos
- [ ] Priorizar correcciones
- [ ] Implementar mejoras
- [ ] Re-ejecutar análisis

---

## 🎉 ¡Listo!

Ya puedes analizar todos los artículos del blog con un solo comando.

**Empezar ahora:**
```bash
./scripts/run-blog-analysis.sh
```

Para más información, consulta:
- `RESUMEN_SCRIPTS_BLOG.md` - Resumen ejecutivo
- `BLOG_ANALYSIS_GUIDE.md` - Guía completa
- `README-BLOG-ANALYSIS.md` - Documentación detallada

---

**Última actualización**: Diciembre 2024
