# 🔍 Cómo Comprobar Artículos - Guía Rápida

## 📝 Resumen Ejecutivo (2 minutos)

Tienes **3 formas** de comprobar artículos, dependiendo de cuánto tiempo tengas:

---

## ⚡ Opción 1: Validación Automática (30 segundos)

### **Uso del Script:**

```bash
# Ejecutar validación automática
node scripts/validate-article.js tu-slug-aqui

# Ejemplo:
node scripts/validate-article.js manual-digital-apartamento-turistico-plantilla-completa-2025
```

### **Output del Script:**

```
📊 VALIDANDO ARTÍCULO: Título del Artículo

✅ PASSED (12 checks):
   Longitud: 2,600 palabras ✅
   Secciones H2: 12 ✅
   CTAs Newsletter: 3 ✅
   ...

⚠️  WARNINGS (3 issues):
   Meta Title: 68 caracteres ⚠️
   ...

❌ ERRORS (1 issues):
   Cover image: falta ❌

🎯 QUALITY SCORE: 85/100

✅ BUENO - Publicar con ajustes menores
```

### **Interpretación del Score:**

- **90-100:** ✅ Excelente → Publicar inmediatamente
- **75-89:** ✅ Bueno → Publicar con ajustes menores (10 min)
- **60-74:** ⚠️ Mejorable → Revisar y corregir (30 min)
- **<60:** ❌ No listo → Regenerar artículo

---

## 🚀 Opción 2: Checklist Rápido (2 minutos)

Si no quieres usar el script, usa este checklist manual express:

### **10 Comprobaciones Esenciales:**

1. **Abrir preview:** `/admin/blog` → Click en tu artículo draft
2. **Scroll rápido:** ¿Se ve profesional? ¿Hay suficiente espacio en blanco?
3. **Contar secciones:** ¿Hay al menos 10 secciones H2 visibles?
4. **Buscar keyword:** Cmd+F tu keyword principal → ¿Aparece 20-30 veces?
5. **Ver CTAs:** ¿Hay 3 cajas de newsletter visibles? (inicio, medio, final)
6. **Probar móvil:** DevTools → Toggle mobile view → ¿Se ve bien?
7. **Click en links:** ¿Todos los links funcionan?
8. **Ver imagen cover:** ¿Hay imagen? ¿Se ve profesional?
9. **Leer meta description:** ¿Tiene 150-160 caracteres?
10. **Test de suscripción:** ¿El formulario newsletter funciona?

**Si 8-10 son ✅ → Publicar**
**Si 6-7 son ✅ → Ajustar y publicar**
**Si <6 son ✅ → Revisar más a fondo**

---

## 📋 Opción 3: Validación Completa (10 minutos)

Para artículos importantes o si tienes dudas, usa el checklist completo:

📄 **Archivo:** `/docs/ARTICLE_VALIDATION_CHECKLIST.md`

Este incluye:
- 6 fases de validación
- 50+ puntos de verificación
- Herramientas recomendadas
- Scoreboard de calidad

---

## 🛠️ Herramientas Rápidas

### **1. Hemingway App (Legibilidad)**

```bash
# 1. Ir a: https://hemingwayapp.com/
# 2. Pegar texto del artículo
# 3. Verificar: Grade 8-10 = ✅
```

**Objetivo:** Grade 8-10 (nivel secundaria)
**Máximo aceptable:** Grade 12

---

### **2. Contador de Palabras**

```bash
# En tu terminal:
cat article.html | sed 's/<[^>]*>//g' | wc -w

# Debe ser >2,000 (ideal >2,500)
```

O simplemente en tu editor: selecciona todo el texto → mira el contador en la esquina.

---

### **3. Test de Links Rotos**

```bash
# Pegar en consola del navegador (F12):
document.querySelectorAll('a').forEach(link => {
  fetch(link.href, { method: 'HEAD' })
    .then(res => {
      if (!res.ok) console.error('❌ Link roto:', link.href)
    })
})
```

---

### **4. Test de Meta Tags**

```bash
# En /admin/blog, pegar en consola:
const title = document.querySelector('[name="metaTitle"]')?.value || ''
const desc = document.querySelector('[name="metaDescription"]')?.value || ''

console.log('Meta Title:', title.length, title.length >= 50 && title.length <= 60 ? '✅' : '⚠️')
console.log('Meta Description:', desc.length, desc.length >= 150 && desc.length <= 160 ? '✅' : '⚠️')
```

---

## 🎯 Workflow Recomendado

### **Domingo (Generación de Contenido):**

1. **10:00 AM:** IA genera artículo (automático)
2. **10:30 AM:** Recibes notificación "Draft listo"
3. **10:35 AM:** Ejecutas script validación:
   ```bash
   node scripts/validate-article.js tu-nuevo-articulo
   ```
4. **10:36 AM:** Revisas output:
   - **Score >75:** Ajustes menores en /admin/blog
   - **Score 60-75:** Corregir errores específicos
   - **Score <60:** Regenerar con prompt mejorado

5. **10:45 AM:** Publicar

**Total:** 15 minutos de tu tiempo

---

## 🚨 Errores Comunes y Cómo Solucionarlos

### **Error: "CTAs Newsletter: 0 ❌"**

**Solución rápida:**
1. Ir a `/admin/blog` → editar artículo
2. Buscar donde quieres insertar CTA (40% del artículo)
3. Pegar:
   ```html
   <NewsletterCTA variant="inline" />
   ```
4. Repetir a 70% del artículo:
   ```html
   <NewsletterCTA variant="trial" />
   ```
5. Al final:
   ```html
   <NewsletterCTA variant="box" />
   ```
6. Guardar → Re-ejecutar script validación

---

### **Error: "Longitud: 1,800 palabras ❌"**

**Solución:**
1. Identificar secciones H2 más cortas
2. Expandir con:
   - Más ejemplos específicos
   - Casos de estudio adicionales
   - FAQ más extensa
   - Checklist más detallada
3. O regenerar artículo con prompt mejorado:
   ```
   Mínimo 2,500 palabras. Cada sección H2 debe tener 200-250 palabras.
   ```

---

### **Error: "Secciones H2: 7 ❌"**

**Solución:**
1. Dividir secciones largas en 2-3 secciones
2. O añadir nuevas secciones:
   - FAQs adicionales
   - "Errores comunes a evitar"
   - "Herramientas recomendadas"
   - "Próximos pasos"

---

### **Error: "Meta Title: 68 caracteres ⚠️"**

**Solución:**
Acortar manteniendo keyword y beneficio:

❌ Malo (68 caracteres):
```
Manual Digital para Apartamento Turístico: Guía Completa 2025 Gratis
```

✅ Bueno (58 caracteres):
```
Manual Digital Apartamento Turístico 2025: Plantilla
```

---

### **Error: "Links con UTM: 0/3 ⚠️"**

**Solución:**
Añadir parámetros UTM a todos los links a itineramio.com:

❌ Malo:
```html
<a href="https://www.itineramio.com">Prueba Itineramio</a>
```

✅ Bueno:
```html
<a href="https://www.itineramio.com?utm_source=blog&utm_medium=article&utm_campaign=manual-digital">Prueba Itineramio</a>
```

---

## 📊 Métricas Post-Publicación

Una vez publicado, monitoriza en Google Analytics:

### **Primeras 24 horas:**
- [ ] Tráfico inicial >10 visitas
- [ ] Tiempo en página >3 minutos
- [ ] Tasa rebote <70%

### **Primera semana:**
- [ ] Tráfico >50 visitas
- [ ] Al menos 1 suscripción newsletter
- [ ] Compartidos en redes >5

### **Primer mes:**
- [ ] Tráfico >200 visitas
- [ ] Ranking Google para keyword principal <50
- [ ] Al menos 1 trial iniciado desde el artículo

**Si no se cumplen:** Optimizar on-page SEO o promover más en redes.

---

## 🎯 Checklist Pre-Publicación Final

Antes de hacer click en "Publicar", verifica:

- [ ] Script validación: Score >75
- [ ] Preview móvil: Se ve perfecto
- [ ] Test formulario newsletter: Funciona
- [ ] Al menos 1 link interno a otro artículo blog
- [ ] Cover image presente y optimizada
- [ ] Slug amigable (keyword-principal-año)
- [ ] Meta title 50-60 caracteres
- [ ] Meta description 150-160 caracteres
- [ ] Categoría y tags asignados
- [ ] Featured marcado (si es artículo pilar)

**Si todos ✅ → Publicar con confianza**

---

## 🔄 Mejora Continua

### **Cada 2 semanas:**
1. Revisar Google Search Console
2. Identificar artículos con buenas impresiones pero bajo CTR
3. Optimizar título y meta description
4. Re-publicar

### **Cada mes:**
1. Actualizar artículos con >500 visitas/mes
2. Añadir info nueva, datos actualizados
3. Mejorar CTAs
4. Añadir internal links a artículos nuevos

---

## 🚀 Próximos Pasos

1. **Practica:** Ejecuta el script con tu artículo actual:
   ```bash
   node scripts/validate-article.js manual-digital-apartamento-turistico-plantilla-completa-2025
   ```

2. **Mejora:** Corrige los errores detectados

3. **Automatiza:** Añade validación a tu workflow semanal

---

## 📞 Soporte

**Documentación completa:**
- Checklist detallado: `/docs/ARTICLE_VALIDATION_CHECKLIST.md`
- Setup marketing: `/docs/MARKETING_AUTOMATION_SETUP.md`
- Quick start: `/docs/QUICK_START_MARKETING.md`

**¿Dudas?** alex@itineramio.com

---

**Última actualización:** Enero 2025
