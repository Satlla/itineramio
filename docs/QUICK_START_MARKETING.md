# 🚀 Quick Start - Marketing Itineramio

## 📝 Resumen Ejecutivo (5 minutos de lectura)

Este documento te da los pasos EXACTOS para implementar todo el sistema de automatización de marketing.

---

## 🎯 Objetivo Final

**Generar €3,600 MRR en 12 meses mediante content marketing automatizado.**

---

## ⚡ Setup Rápido (2 horas)

### **Paso 1: Google Search Console (10 min)**

```bash
1. Ir a: https://search.google.com/search-console
2. Añadir propiedad: itineramio.com
3. Verificar con HTML tag (ya incluido en el código)
4. Enviar sitemap: https://itineramio.com/sitemap.xml
```

### **Paso 2: Unsplash API - Imágenes Gratis (5 min)**

```bash
1. Registrar: https://unsplash.com/developers
2. Crear app "Itineramio Blog"
3. Copiar Access Key
4. Añadir a .env.local:
   UNSPLASH_ACCESS_KEY=tu_key_aqui
```

### **Paso 3: Brevo - Email Marketing (15 min)**

```bash
1. Registrar: https://brevo.com
2. Verificar dominio itineramio.com
3. Crear template newsletter
4. API key a .env.local:
   BREVO_API_KEY=tu_key_aqui
```

### **Paso 4: Buffer - Social Media (10 min)**

```bash
1. Registrar: https://buffer.com
2. Conectar LinkedIn + Facebook
3. API key a .env.local:
   BUFFER_ACCESS_TOKEN=tu_key_aqui
```

### **Paso 5: Make.com - Automatización (30 min)**

```bash
1. Registrar: https://make.com
2. Importar 3 escenarios desde /docs/make-scenarios/
   - generate-weekly-content.json
   - schedule-social-media.json
   - weekly-report.json
3. Activar escenarios
```

### **Paso 6: Claude API - Generación Contenido (5 min)**

```bash
1. Obtener key: https://console.anthropic.com
2. Añadir a .env.local:
   ANTHROPIC_API_KEY=sk-ant-xxxxx
```

---

## 📅 Rutina Semanal

### **DOMINGO (2 horas) - Content Creation Day**

**10:00 - 11:00:** Revisar analytics
```bash
1. Google Analytics → Tráfico semana
2. Search Console → Keywords ganando posiciones
3. Anotar insights
```

**11:00 - 11:30:** Generar artículo
```bash
1. Abrir Make.com scenario "Generate Content"
2. Run manually (o esperar trigger automático 10 AM)
3. Esperar 5 min → Draft creado
```

**11:30 - 12:00:** Revisar y publicar
```bash
1. Ir a /admin/blog
2. Revisar draft IA
3. Ajustar CTAs
4. Publicar
```

**12:00 - 12:30:** Programar redes sociales
```bash
1. Make.com auto-genera 7 posts
2. Buffer los programa automáticamente
3. Verificar calendario Buffer
```

### **LUNES-VIERNES (30 min/día) - Mantenimiento**

- Responder comentarios redes (<15 min)
- Monitorizar engagement (<10 min)
- Responder emails newsletter (<5 min)

### **VIERNES (18:00) - Review & Plan**

```bash
1. Recibes reporte automático por email
2. Revisar métricas (10 min)
3. Ajustar estrategia próxima semana si es necesario
```

---

## 🎨 Contenido Ya Creado ✅

### **Artículo 1 (LIVE):**
- **Título:** Manual Digital para Apartamento Turístico: Plantilla Completa 2025
- **Keyword:** "manual digital apartamento turistico" (140 búsquedas/mes)
- **Palabras:** 2,500+
- **CTAs:** 3 estratégicos
- **URL:** https://itineramio.com/blog/manual-digital-apartamento-turistico-plantilla-completa-2025

### **Landing Page (LIVE):**
- Sección destacada de funcionalidades empresariales
- Conjuntos de Propiedades destacado
- Sistema de Avisos destacado
- Métricas de valor (95%, 50+, 30s)

---

## 📊 Próximos 4 Artículos

### **Semana 2:**
- **Título:** Automatizar Airbnb: Guía Completa 2025
- **Keyword:** "automatizar airbnb" (110 búsquedas/mes)
- **Status:** Por generar este domingo

### **Semana 3:**
- **Título:** Check-in Apartamento Turístico: Protocolo Perfecto
- **Keyword:** "check in apartamento turistico" (90 búsquedas/mes)

### **Semana 4:**
- **Título:** Precio Apartamento Turístico: Calculadora 2025
- **Keyword:** "precio apartamento turistico" (320 búsquedas/mes)

### **Semana 5:**
- **Título:** Normativa VUT 2025: Guía Actualizada por CCAA
- **Keyword:** "normativa vut 2025" (280 búsquedas/mes)

---

## 🎯 KPIs - Dashboard Semanal

Estos son los números que debes ver crecer cada semana:

| Métrica | Semana 1 | Mes 1 | Mes 3 | Mes 6 | Mes 12 |
|---------|----------|-------|-------|-------|--------|
| **Tráfico orgánico** | 100 | 500 | 2,000 | 5,000 | 10,000 |
| **Newsletter subs** | 10 | 50 | 200 | 500 | 1,000 |
| **Keywords Top 10** | 1 | 3 | 8 | 15 | 30 |
| **Trials/mes** | 2 | 5 | 15 | 30 | 60 |
| **Conversión trial** | 10% | 15% | 20% | 25% | 30% |
| **MRR** | €20 | €60 | €400 | €1,200 | €3,600 |

---

## 🚨 Red Flags - Cuándo Preocuparse

### ❌ **Semana 4 y tráfico <200/mes**
**Solución:**
- Revisar indexación Google Search Console
- Compartir más en Facebook groups
- Guest post en blogs de nicho

### ❌ **Mes 2 y Newsletter <30 suscriptores**
**Solución:**
- Añadir más CTAs inline en artículos
- Crear lead magnet descargable (PDF)
- Pop-up exit intent (con cuidado)

### ❌ **Mes 3 y 0 trials**
**Solución:**
- Revisar CTAs (demasiado escondidos?)
- Mejorar landing page
- Añadir testimonios reales
- Crear demo en vídeo

---

## 🛠️ Herramientas - Stack Mínimo

### **Gratis (€0/mes):**
- Google Search Console
- Google Analytics 4
- Unsplash API (50 requests/hora)
- Brevo (300 emails/día)
- Buffer (3 canales)
- Make.com (1,000 ops/mes)

### **De Pago (€13/mes):**
- Claude API (~€3-5/mes para tu volumen)
- Notion Pro (~€8/mes) - opcional

**Total inicial: ~€5/mes**

---

## 📞 Soporte

### **Documentación Completa:**
- Archivo maestro: `/docs/MARKETING_AUTOMATION_SETUP.md`
- Prompts IA: `/docs/prompts/`
- Make scenarios: `/docs/make-scenarios/`

### **Dudas:**
- Email: alex@itineramio.com
- Telegram: @alexsalazar (agrégame)

---

## ✅ Checklist Pre-Launch

Antes de empezar la máquina de contenido, verifica:

- [ ] Google Search Console verificado y sitemap enviado
- [ ] Unsplash API configurada y testeada
- [ ] Brevo cuenta creada y dominio verificado
- [ ] Buffer conectado a LinkedIn + Facebook
- [ ] Make.com escenarios importados y activos
- [ ] Claude API key en .env.local
- [ ] Primer artículo publicado ✅ (YA HECHO)
- [ ] Landing page actualizada ✅ (YA HECHO)
- [ ] Componente Newsletter funcionando ✅ (YA HECHO)

---

**Let's go! 🚀**

Tu único trabajo ahora: **Ejecutar cada domingo 2 horas y dejar que el sistema trabaje por ti.**
