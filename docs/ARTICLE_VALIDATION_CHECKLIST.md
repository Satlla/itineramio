# ✅ Checklist de Validación de Artículos

## 📋 Proceso de Revisión (10 minutos por artículo)

Este checklist garantiza que cada artículo publicado cumple con los estándares de calidad de Itineramio.

---

## 🎯 FASE 1: Validación de Contenido (3 minutos)

### **1.1. Longitud y Estructura**

- [ ] **Longitud:** Mínimo 2,000 palabras (ideal 2,500-3,000)
- [ ] **Párrafos:** Máximo 4 líneas por párrafo
- [ ] **H2:** Mínimo 10 secciones
- [ ] **H3:** Al menos 2-3 subsecciones por cada 2 H2
- [ ] **Listas:** Bullets en lugar de párrafos largos donde sea posible
- [ ] **Espaciado:** Suficiente espacio en blanco (no pared de texto)

**Herramienta rápida:**
```bash
# Contar palabras (debe ser >2000)
cat article.html | sed 's/<[^>]*>//g' | wc -w

# Contar H2 (debe ser >10)
grep -o '<h2' article.html | wc -l

# Contar H3 (debe ser >15)
grep -o '<h3' article.html | wc -l
```

---

### **1.2. Calidad del Contenido**

- [ ] **Datos específicos:** Números concretos, no generalidades
  - ❌ Malo: "Muchos anfitriones tienen problemas"
  - ✅ Bueno: "El 73% de anfitriones reciben +3 llamadas por reserva"

- [ ] **Ejemplos reales:** Al menos 2 casos de estudio con nombres y datos
  - Ejemplo: "Laura, 5 apartamentos Valencia: redujo llamadas 86%"

- [ ] **Sin contradicciones:** Verificar que los datos son consistentes
  - Si dices "86% reducción" en un sitio, usa la misma cifra en todo el artículo

- [ ] **Tono apropiado:** Cercano pero profesional
  - ❌ Evitar: Demasiado informal o demasiado corporativo
  - ✅ Usar: "vamos a ver", "te recomendamos", "nuestros datos muestran"

- [ ] **Sin errores fácticos:** Verificar precios, fechas, datos de competencia
  - Comprobar precios de competidores mencionados
  - Verificar que normativas citadas sean actuales

---

### **1.3. Valor Real para el Usuario**

- [ ] **Accionable:** El usuario puede implementar lo aprendido HOY
- [ ] **Completo:** Responde todas las preguntas posibles sobre el tema
- [ ] **Actualizado:** Información de 2025, no datos obsoletos
- [ ] **Honesto:** Menciona alternativas, no solo Itineramio

---

## 🔍 FASE 2: Validación SEO (2 minutos)

### **2.1. Keyword Principal**

- [ ] **En H1:** Keyword aparece en el título principal
  - Ejemplo: "Manual Digital para **Apartamento Turístico**"

- [ ] **En primer párrafo:** Keyword en primeras 100 palabras
- [ ] **En 3+ H2:** Keyword o variaciones en al menos 3 subtítulos
- [ ] **En URL:** Slug contiene keyword
  - Ejemplo: `/blog/manual-digital-apartamento-turistico-...`

- [ ] **Densidad correcta:** 1-2% de densidad de keyword
  - **Calcular:** (Keyword mentions / Total palabras) × 100
  - Ejemplo: 30 menciones / 2,500 palabras = 1.2% ✅

**Herramienta automática:**
```bash
# Contar menciones de keyword
grep -io "apartamento turístico" article.html | wc -l

# Calcular densidad
# (Resultado anterior / palabras totales) × 100
```

---

### **2.2. Keywords Relacionadas**

- [ ] **Long-tail incluidas:** 5-7 variaciones de keyword
  - Ejemplo para "manual digital apartamento turistico":
    * manual bienvenida apartamento
    * guía huéspedes apartamento turístico
    * welcome book digital
    * manual digital airbnb

- [ ] **LSI Keywords:** Palabras semánticamente relacionadas
  - check-in, huéspedes, alojamiento, anfitrión, etc.

---

### **2.3. Meta Tags**

- [ ] **Meta Title:** 50-60 caracteres, incluye keyword + beneficio
  - ✅ Ejemplo: "Manual Digital Apartamento Turístico 2025: Plantilla Gratis"
  - ❌ Malo: "Cómo hacer manuales digitales para apartamentos turísticos en España"

- [ ] **Meta Description:** 150-160 caracteres, incluye keyword + CTA
  - ✅ Ejemplo: "Crea un manual digital profesional para tu apartamento turístico con nuestra plantilla gratuita. Reduce llamadas 86%. Guía completa 2025."

- [ ] **Keywords array:** 6-8 keywords relevantes

**Test rápido:**
```javascript
// Pegar en consola del navegador en /admin/blog
const title = document.querySelector('[name="metaTitle"]').value
const desc = document.querySelector('[name="metaDescription"]').value

console.log('Title length:', title.length, title.length >= 50 && title.length <= 60 ? '✅' : '❌')
console.log('Description length:', desc.length, desc.length >= 150 && desc.length <= 160 ? '✅' : '❌')
```

---

### **2.4. Internal & External Links**

- [ ] **Internal links:** Mínimo 2-3 links a otros artículos del blog
  - Siempre que menciones un tema ya cubierto en otro artículo

- [ ] **External links:** 2-3 links a fuentes autorizadas
  - Estudios, estadísticas oficiales, herramientas mencionadas
  - Usar `rel="nofollow"` solo para enlaces comerciales

- [ ] **Anchor text descriptivo:** No usar "click aquí"
  - ❌ Malo: "Para más info [haz click aquí]"
  - ✅ Bueno: "Descubre cómo [automatizar tu Airbnb completamente]"

---

## 📝 FASE 3: Validación de Formato (2 minutos)

### **3.1. HTML Limpio**

- [ ] **Tags cerrados:** Todos los tags HTML están cerrados correctamente
- [ ] **Jerarquía correcta:** H2 → H3 → H4 (no saltar niveles)
- [ ] **Sin H1:** Solo hay H1 en el layout, no en content
- [ ] **Listas correctas:** `<ul>` y `<li>` bien estructurados

**Test automático:**
```bash
# Validar HTML
echo 'Tu HTML aquí' | tidy -errors -quiet
# Si devuelve errores → corregir antes de publicar
```

---

### **3.2. Imágenes**

- [ ] **Cover image:** Imagen principal de alta calidad (1200×630 mínimo)
- [ ] **Alt text:** Todas las imágenes tienen alt descriptivo
  - ✅ Bueno: "Dashboard de Itineramio mostrando manual digital de apartamento"
  - ❌ Malo: "imagen1.jpg"

- [ ] **Optimizadas:** Peso <500KB por imagen
- [ ] **Formato correcto:** WebP o JPEG (no PNG pesadas)

**Herramienta:**
```bash
# Comprimir imágenes antes de subir
convert input.jpg -quality 85 output.jpg
```

---

### **3.3. CTAs y Newsletter**

- [ ] **CTA inline:** 1 CTA a mitad del artículo (40-50%)
  - `<NewsletterCTA variant="inline" />`

- [ ] **CTA trial:** 1 CTA fuerte antes del final (70-80%)
  - `<NewsletterCTA variant="trial" />`

- [ ] **CTA final:** 1 CTA al final del artículo
  - `<NewsletterCTA variant="box" />`

- [ ] **Links UTM:** Todos los links a itineramio.com tienen UTM tags
  - `?utm_source=blog&utm_medium=article&utm_campaign=keyword-principal`

---

## 🎨 FASE 4: Validación de Experiencia (2 minutos)

### **4.1. Legibilidad**

- [ ] **Nivel de lectura:** Grado 8-10 (secundaria)
  - Usar herramienta: https://hemingwayapp.com/
  - Verde/Amarillo = ✅ | Rojo = ❌ (reescribir)

- [ ] **Frases cortas:** Máximo 20-25 palabras por frase
- [ ] **Voz activa:** Preferir voz activa vs pasiva
  - ❌ Pasiva: "El manual fue creado por el anfitrión"
  - ✅ Activa: "El anfitrión creó el manual"

**Test automático:**
Pega tu texto en: https://hemingwayapp.com/
- **Objetivo:** Grade 8-10
- **Máximo:** Grade 12

---

### **4.2. Mobile-First**

- [ ] **Preview móvil:** Verificar en vista móvil del navegador
  - Chrome DevTools → Toggle device toolbar (Cmd+Shift+M)
  - Probar en iPhone SE (375×667) y Pixel 5 (393×851)

- [ ] **Párrafos legibles:** No más de 4 líneas en móvil
- [ ] **Imágenes responsive:** Se ven bien en pantalla pequeña
- [ ] **CTAs visibles:** Botones accesibles con el pulgar

---

### **4.3. Tiempo de Carga**

- [ ] **First Contentful Paint:** <1.8 segundos
- [ ] **Largest Contentful Paint:** <2.5 segundos
- [ ] **Total page load:** <3 segundos

**Test:**
```bash
# Usar Lighthouse en Chrome DevTools
# Performance score debe ser >90
```

O usar: https://pagespeed.web.dev/

---

## 🚨 FASE 5: Validación de Compliance (1 minuto)

### **5.1. Legal y Ético**

- [ ] **Sin plagio:** Contenido 100% original
  - Test: https://www.copyscape.com/ (gratis 10 checks/mes)
  - O: https://plagiarismdetector.net/

- [ ] **Fuentes citadas:** Enlaces a estudios/estadísticas mencionadas
- [ ] **Sin spam:** No más de 2 menciones de Itineramio por 1,000 palabras
- [ ] **GDPR compliant:** Emails capturados con consentimiento explícito

---

### **5.2. Competencia y Marca**

- [ ] **Competidores mencionados honestamente:** No difamar
- [ ] **Comparaciones justas:** Datos actualizados y verificables
- [ ] **Tono profesional:** Respeto hacia competencia
- [ ] **Brand voice:** Consistente con guías de marca Itineramio

---

## 🎯 FASE 6: Pre-Publicación Final (1 minuto)

### **6.1. Checklist Técnico**

- [ ] **Preview funcionando:** Vista previa se ve correcta en /admin/blog
- [ ] **Slug correcto:** URL amigable y con keyword
  - Formato: `keyword-principal-año` o `keyword-principal-guia-completa`
  - Ejemplo: `manual-digital-apartamento-turistico-plantilla-completa-2025`

- [ ] **Categoría asignada:** Artículo en categoría correcta
  - Guías, Automatización, Marketing, Operaciones, etc.

- [ ] **Tags correctos:** 4-6 tags relevantes
- [ ] **Featured:** Marcar si es artículo pilar
- [ ] **Publish date:** Programado para día/hora óptimo
  - Mejor: Martes/Miércoles/Jueves a las 9-10 AM

---

### **6.2. Test de Links**

- [ ] **Todos los links funcionan:** No hay 404s
  - Usar: https://www.deadlinkchecker.com/

- [ ] **Links externos abren en nueva pestaña:** `target="_blank"`
- [ ] **Links UTM correctos:** Tracking configurado

**Test rápido:**
```javascript
// Pegar en consola del navegador
document.querySelectorAll('a').forEach(link => {
  fetch(link.href, { method: 'HEAD' })
    .then(res => {
      if (!res.ok) console.error('Broken link:', link.href)
    })
})
```

---

### **6.3. Test de Conversión**

- [ ] **CTAs visibles:** Al menos 3 CTAs bien posicionados
- [ ] **Formulario email funciona:** Test de suscripción
- [ ] **Botones clicables:** Todos los CTAs tienen hover effect
- [ ] **Trial link funciona:** Link a registro/prueba correctamente

**Test manual:**
1. Suscribirse al newsletter con email de prueba
2. Verificar email de confirmación llega
3. Click en link trial
4. Verificar redirección correcta a página registro

---

## 📊 SCOREBOARD DE CALIDAD

Usa este scoring para decidir si publicar:

| Criterio | Peso | Tu Score | Máximo |
|----------|------|----------|--------|
| **Contenido** | 30% | __/30 | 30 |
| - Longitud >2,500 palabras | | __/5 | 5 |
| - Estructura (H2/H3) completa | | __/5 | 5 |
| - Datos específicos y casos reales | | __/10 | 10 |
| - Valor accionable | | __/5 | 5 |
| - Tono apropiado | | __/5 | 5 |
| **SEO** | 25% | __/25 | 25 |
| - Keyword en lugares clave | | __/10 | 10 |
| - Meta tags optimizados | | __/5 | 5 |
| - Internal/external links | | __/5 | 5 |
| - LSI keywords | | __/5 | 5 |
| **Formato** | 20% | __/20 | 20 |
| - HTML limpio | | __/5 | 5 |
| - Imágenes optimizadas | | __/5 | 5 |
| - CTAs bien posicionados | | __/5 | 5 |
| - Mobile responsive | | __/5 | 5 |
| **Experiencia** | 15% | __/15 | 15 |
| - Legibilidad (Hemingway) | | __/5 | 5 |
| - Tiempo de carga <3s | | __/5 | 5 |
| - Sin errores técnicos | | __/5 | 5 |
| **Compliance** | 10% | __/10 | 10 |
| - Sin plagio | | __/5 | 5 |
| - Legal/Ético | | __/5 | 5 |
| **TOTAL** | 100% | **__/100** | **100** |

### **Decisión de Publicación:**

- **90-100 puntos:** ✅ Excelente - Publicar inmediatamente
- **75-89 puntos:** ✅ Bueno - Publicar con ajustes menores
- **60-74 puntos:** ⚠️ Mejorable - Revisar y mejorar antes de publicar
- **<60 puntos:** ❌ No publicar - Reescribir o generar nuevo

---

## 🤖 SCRIPT DE VALIDACIÓN AUTOMÁTICA

Puedes automatizar muchas de estas comprobaciones. Aquí tienes un script:

### **Instalación:**

```bash
npm install --save-dev html-validator cheerio
```

### **Script de validación:**

Guardar como `/scripts/validate-article.js`:

```javascript
const fs = require('fs')
const cheerio = require('cheerio')

function validateArticle(htmlContent) {
  const $ = cheerio.load(htmlContent)
  const report = {
    passed: [],
    warnings: [],
    errors: []
  }

  // 1. Contar palabras
  const text = $('body').text().replace(/\s+/g, ' ')
  const wordCount = text.split(' ').length

  if (wordCount >= 2500) {
    report.passed.push(`✅ Word count: ${wordCount} words`)
  } else {
    report.warnings.push(`⚠️ Word count: ${wordCount} words (min 2,500)`)
  }

  // 2. Verificar estructura H2/H3
  const h2Count = $('h2').length
  const h3Count = $('h3').length

  if (h2Count >= 10) {
    report.passed.push(`✅ H2 sections: ${h2Count}`)
  } else {
    report.errors.push(`❌ H2 sections: ${h2Count} (min 10)`)
  }

  if (h3Count >= 15) {
    report.passed.push(`✅ H3 subsections: ${h3Count}`)
  } else {
    report.warnings.push(`⚠️ H3 subsections: ${h3Count} (recommended 15+)`)
  }

  // 3. Verificar que no hay H1
  const h1Count = $('h1').length
  if (h1Count === 0) {
    report.passed.push(`✅ No H1 in content (correct)`)
  } else {
    report.errors.push(`❌ Found ${h1Count} H1 tags (should be 0)`)
  }

  // 4. Verificar imágenes tienen alt
  let imagesWithoutAlt = 0
  $('img').each((i, img) => {
    if (!$(img).attr('alt')) {
      imagesWithoutAlt++
    }
  })

  if (imagesWithoutAlt === 0) {
    report.passed.push(`✅ All images have alt text`)
  } else {
    report.errors.push(`❌ ${imagesWithoutAlt} images missing alt text`)
  }

  // 5. Verificar CTAs newsletter
  const ctaCount = (htmlContent.match(/NewsletterCTA/g) || []).length

  if (ctaCount >= 3) {
    report.passed.push(`✅ Newsletter CTAs: ${ctaCount}`)
  } else {
    report.warnings.push(`⚠️ Newsletter CTAs: ${ctaCount} (recommended 3)`)
  }

  // 6. Verificar links externos
  const externalLinks = $('a[href^="http"]').length

  if (externalLinks >= 2) {
    report.passed.push(`✅ External links: ${externalLinks}`)
  } else {
    report.warnings.push(`⚠️ External links: ${externalLinks} (min 2 recommended)`)
  }

  // 7. Verificar párrafos largos
  let longParagraphs = 0
  $('p').each((i, p) => {
    const words = $(p).text().split(' ').length
    if (words > 100) {
      longParagraphs++
    }
  })

  if (longParagraphs === 0) {
    report.passed.push(`✅ No overly long paragraphs`)
  } else {
    report.warnings.push(`⚠️ ${longParagraphs} paragraphs >100 words (consider breaking)`)
  }

  // Generar reporte
  console.log('\n📊 ARTICLE VALIDATION REPORT\n')
  console.log('='.repeat(50))

  if (report.passed.length > 0) {
    console.log('\n✅ PASSED:')
    report.passed.forEach(msg => console.log(`  ${msg}`))
  }

  if (report.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:')
    report.warnings.forEach(msg => console.log(`  ${msg}`))
  }

  if (report.errors.length > 0) {
    console.log('\n❌ ERRORS:')
    report.errors.forEach(msg => console.log(`  ${msg}`))
  }

  // Calcular score
  const totalChecks = report.passed.length + report.warnings.length + report.errors.length
  const score = Math.round((report.passed.length / totalChecks) * 100)

  console.log('\n' + '='.repeat(50))
  console.log(`\n🎯 QUALITY SCORE: ${score}/100\n`)

  if (score >= 90) {
    console.log('✅ EXCELLENT - Ready to publish!')
  } else if (score >= 75) {
    console.log('✅ GOOD - Publish with minor fixes')
  } else if (score >= 60) {
    console.log('⚠️  NEEDS IMPROVEMENT - Review before publishing')
  } else {
    console.log('❌ NOT READY - Rewrite or regenerate')
  }

  return score >= 75
}

// Uso
const htmlFile = process.argv[2]
if (!htmlFile) {
  console.error('Usage: node validate-article.js <html-file>')
  process.exit(1)
}

const htmlContent = fs.readFileSync(htmlFile, 'utf8')
const isValid = validateArticle(htmlContent)

process.exit(isValid ? 0 : 1)
```

### **Uso del script:**

```bash
# Guardar HTML del artículo en un archivo
node scripts/validate-article.js article.html
```

---

## 🎯 QUICK VALIDATION (2 minutos)

Si tienes poco tiempo, usa esta versión express:

### **Checklist Rápido:**

1. [ ] **Longitud >2,000 palabras**
2. [ ] **Keyword en H1 + primer párrafo**
3. [ ] **10+ secciones H2**
4. [ ] **2 casos de estudio con datos**
5. [ ] **3 CTAs newsletter**
6. [ ] **Sin errores HTML evidentes**
7. [ ] **Test en móvil (se ve bien)**
8. [ ] **Links funcionan**
9. [ ] **Meta tags completos**
10. [ ] **Hemingway App grade 8-10**

**Si todos ✅ → Publicar**

---

## 📞 Cuando Delegar la Validación

**Si generas >4 artículos/mes**, considera:

1. **Contratar revisor freelance** (€20-30/artículo)
   - Plataformas: Upwork, Fiverr, Workana
   - Perfil: Copywriter SEO en español

2. **Usar herramientas de pago:**
   - **Grammarly Premium** (€12/mes): Corrección automática
   - **Clearscope** (€170/mes): Optimización SEO automática
   - **Surfer SEO** (€59/mes): Content scoring

3. **VA (Asistente Virtual):**
   - Tiempo parcial: €300-500/mes
   - Tareas: Validar checklist, programar publicación, responder comentarios

---

**Última actualización:** Enero 2025
**Mantenido por:** Equipo Itineramio
