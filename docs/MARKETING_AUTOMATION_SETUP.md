# 🚀 Itineramio - Sistema de Automatización de Marketing

## 📋 Índice

1. [Stack Tecnológico](#stack-tecnológico)
2. [Configuración Google Search Console](#configuración-google-search-console)
3. [Customer Journey Map](#customer-journey-map)
4. [Calendario Editorial](#calendario-editorial)
5. [Automatización Semanal](#automatización-semanal)
6. [Integraciones y APIs](#integraciones-y-apis)
7. [Flujo de Trabajo Domingos](#flujo-de-trabajo-domingos)
8. [Reportes Viernes/Sábado](#reportes-viernes-sábado)

---

## 🛠️ Stack Tecnológico

### **1. Gestión de Contenido**

#### Notion (Gratis - Recomendado)
- **Uso:** Calendario editorial, planificación semanal
- **Setup:**
  1. Crear cuenta en https://notion.so
  2. Duplicar template de calendario editorial (ver sección más abajo)
  3. Conectar con Make.com para automatizaciones

#### Airtable (Alternativa)
- **Uso:** Base de datos de contenido más estructurada
- **Ventaja:** Mejores vistas (kanban, calendario, galería)
- **Precio:** Gratis hasta 1,200 registros

---

### **2. Automatización de Workflows**

#### Make.com (Recomendado) ✅
- **Precio:** Gratis hasta 1,000 operaciones/mes
- **Uso:** Automatizar TODO el proceso
- **Flujos a configurar:**

```
1. Domingo → Generar artículos semanales con Claude AI
2. Lunes-Viernes → Publicar en redes sociales (programado)
3. Viernes → Generar reporte semanal automático
4. Cada nuevo artículo → Distribuir multi-canal
```

**Setup inicial:**
1. Registrar en https://make.com
2. Conectar servicios:
   - Google Sheets (para calendario)
   - Claude API (para generación contenido)
   - Buffer/Hootsuite (para social media)
   - Gmail (para reportes)
3. Importar escenarios desde `/docs/make-scenarios/`

#### Zapier (Alternativa más simple)
- **Precio:** Gratis hasta 100 zaps/mes
- **Más fácil pero menos potente**

---

### **3. Generación de Contenido con IA**

#### Claude API (Anthropic) ✅
- **Precio:** Pay-as-you-go (~$3-5/mes para tu volumen)
- **Uso:** Generar artículos completos de 2,000+ palabras
- **Setup:**
  1. Obtener API key: https://console.anthropic.com
  2. Añadir a variables de entorno:
     ```bash
     ANTHROPIC_API_KEY=sk-ant-xxxxx
     ```
  3. Usar prompts optimizados en `/docs/prompts/`

#### ChatGPT API (Alternativa)
- **Precio:** $20/mes ChatGPT Plus + API
- **Ventaja:** Más conocido, más plugins

---

### **4. Imágenes Automáticas**

#### Unsplash API (Gratis) ✅
- **Límite:** 50 requests/hora
- **Setup:**
  1. Registrar en https://unsplash.com/developers
  2. Crear app y obtener Access Key
  3. Añadir a `.env.local`:
     ```bash
     UNSPLASH_ACCESS_KEY=xxxxx
     ```
  4. Usar helper en `src/utils/unsplash.ts`

**Código para integrar:**
```typescript
// src/utils/unsplash.ts
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

export async function getUnsplashImage(query: string) {
  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${query}&per_page=1`,
    {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    }
  )
  const data = await response.json()
  return data.results[0]?.urls?.regular || null
}
```

#### DALL-E API (Premium)
- **Precio:** $0.02 por imagen (1024x1024)
- **Uso:** Solo si necesitas imágenes custom específicas

---

### **5. Email Marketing**

#### Brevo (ex-Sendinblue) ✅ RECOMENDADO
- **Precio:** Gratis hasta 300 emails/día
- **Por qué:** Mejor para Europa, GDPR compliant
- **Setup:**
  1. Registrar en https://brevo.com
  2. Verificar dominio (itineramio.com)
  3. Crear template de newsletter
  4. API key a `.env.local`:
     ```bash
     BREVO_API_KEY=xxxxx
     ```

**Integración:**
```typescript
// app/api/newsletter/send/route.ts
import { Brevo } from '@getbrevo/brevo'

const brevo = new Brevo({
  apiKey: process.env.BREVO_API_KEY
})

export async function sendNewsletter(subject: string, content: string) {
  await brevo.transactionalEmails.sendEmail({
    to: [{ email: 'subscribers@itineramio.com' }],
    subject,
    htmlContent: content,
    sender: {
      name: 'Itineramio',
      email: 'hola@itineramio.com'
    }
  })
}
```

#### Resend (Alternativa moderna)
- **Precio:** Gratis hasta 3,000 emails/mes
- **Más developer-friendly**

---

### **6. Social Media Management**

#### Buffer (Recomendado) ✅
- **Precio:** Gratis hasta 3 canales
- **Canales a conectar:**
  - LinkedIn (empresa + perfil personal)
  - Facebook (página + grupos)
  - Twitter
- **Setup:**
  1. Registrar en https://buffer.com
  2. Conectar cuentas sociales
  3. API key para Make.com:
     ```bash
     BUFFER_ACCESS_TOKEN=xxxxx
     ```

#### Hootsuite (Alternativa más completa)
- **Precio:** $99/mes (más caro pero más potente)

---

### **7. Analytics & SEO**

#### Google Search Console ✅ OBLIGATORIO
- **Precio:** Gratis
- **Ver configuración detallada:** [Sección específica abajo](#configuración-google-search-console)

#### Google Analytics 4 ✅
- **Precio:** Gratis
- **Ya configurado en tu web**

#### Plausible Analytics (Alternativa privacy-first)
- **Precio:** €9/mes
- **Ventaja:** Más simple, GDPR compliant sin cookies

---

## 🔍 Configuración Google Search Console

### **Paso 1: Verificar Propiedad**

1. Ir a https://search.google.com/search-console
2. Añadir propiedad: `https://itineramio.com`
3. **Método de verificación recomendado:** HTML tag

Añade este tag al `<head>` de `app/layout.tsx`:

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="TU_CODIGO_AQUI" />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

4. Click "Verificar"

### **Paso 2: Enviar Sitemap**

Tu sitemap está auto-generado en: `https://itineramio.com/sitemap.xml`

En Search Console:
1. Ir a "Sitemaps" (menú izquierda)
2. Añadir sitemap: `https://itineramio.com/sitemap.xml`
3. Enviar

### **Paso 3: Configurar Inspección de URLs**

Para cada artículo nuevo:
1. Ir a "Inspección de URL"
2. Pegar URL: `https://itineramio.com/blog/tu-slug`
3. Click "Solicitar indexación"

**Automatizar con API:**
```bash
# Envía URL a Google para indexación rápida
curl -X POST \
  "https://indexing.googleapis.com/v3/urlNotifications:publish" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://itineramio.com/blog/nuevo-articulo",
    "type": "URL_UPDATED"
  }'
```

### **Paso 4: Monitorizar Keywords**

Ir a "Rendimiento" y añadir filtros:
- Páginas: `/blog/*`
- Consultas: Tus keywords objetivo

---

## 🗺️ Customer Journey Map

### **FASE 1: Awareness (Descubrimiento)**

**Objetivo:** El usuario descubre Itineramio

**Canales:**
- 🔍 **Google Search** → Busca "manual digital apartamento turistico"
- 👥 **Facebook Groups** → Ve post en grupo de propietarios Airbnb
- 💼 **LinkedIn** → Ve post sobre automatización hotelera
- 📧 **Newsletter** → Lee artículo compartido por colega

**Contenido:**
- Artículos blog SEO-optimizados
- Posts en redes sociales (valor, no venta)
- Comentarios en grupos aportando valor

**Resultado esperado:** Click al blog de Itineramio

---

### **FASE 2: Interest (Interés)**

**Objetivo:** Leer el artículo y entender el problema que resuelve

**Experiencia:**
1. Landing en artículo (ej: "Manual Digital: Plantilla 2025")
2. Lee contenido de valor (2,000+ palabras)
3. Ve que Itineramio resuelve su problema específico
4. **Primer CTA (30% contenido):** Newsletter inline
   - "¿Quieres más guías como esta?"
   - Input email + subscribe
5. Sigue leyendo
6. **Segundo CTA (70% contenido):** Trial box destacado
   - "Prueba Itineramio 15 días gratis"
   - Sin tarjeta
7. Lee hasta el final

**Resultado esperado:**
- **Opción A:** Se suscribe a newsletter (lead capturado)
- **Opción B:** Click "Prueba gratis" (conversión directa)
- **Opción C:** Sale (remarketing)

---

### **FASE 3: Consideration (Consideración)**

**Objetivo:** El usuario evalúa si Itineramio es para él

**Si se suscribió a newsletter:**

**Email 1 (Inmediato):** Welcome + Valor
```
Asunto: ✅ Bienvenido - Tu guía gratuita está lista
Contenido:
- Gracias por suscribirte
- Link a descargable (PDF manual digital)
- CTA suave: "¿Quieres ver cómo Itineramio hace esto automático?"
```

**Email 2 (Día 3):** Caso de éxito
```
Asunto: Cómo Laura redujo sus llamadas en un 86%
Contenido:
- Caso real con datos
- Antes/Después
- CTA: "Empieza tu prueba de 15 días"
```

**Email 3 (Día 7):** Comparativa
```
Asunto: Itineramio vs Otros (comparativa honesta)
Contenido:
- Touch Stay vs Itineramio
- Notion vs Itineramio
- Por qué Itineramio es mejor para España
- CTA: "Pruébalo gratis"
```

**Email 4 (Día 14):** Urgencia suave
```
Asunto: ¿Sigues perdiendo tiempo con consultas repetitivas?
Contenido:
- Recordatorio del problema
- Demo en vídeo (2 min)
- CTA: "15 días gratis - sin tarjeta"
```

**Si click "Prueba gratis" directo:**
- Registro en 1 minuto
- Onboarding interactivo
- Primer manual creado en 10 minutos

---

### **FASE 4: Trial (Prueba)**

**Objetivo:** Activar al usuario en los primeros 7 días

**Día 1:** Email bienvenida trial
```
Asunto: 🎉 ¡Bienvenido a Itineramio! Empieza aquí
Contenido:
- Vídeo tutorial 3 min
- "Crea tu primer manual en 10 min"
- Soporte: WhatsApp directo
```

**Día 3:** Check engagement
- Si NO ha creado propiedades → Email motivación
- Si SÍ ha creado → Email tips avanzados

**Día 7:** Halfway
```
Asunto: Ya llevas 7 días - ¿Qué tal la experiencia?
Contenido:
- Feedback form
- Ofrecer call 15 min si tiene dudas
- Mostrar stats: "Has ahorrado X horas"
```

**Día 12:** Pre-conversion
```
Asunto: Quedan 3 días de tu prueba
Contenido:
- Recordatorio fin trial
- Oferta especial: 20% dto primer mes
- Testimonios
- CTA: "Continuar con Itineramio"
```

---

### **FASE 5: Conversion (Conversión)**

**Objetivo:** De trial a cliente de pago

**Día 14:** Email recordatorio
```
Asunto: Tu prueba termina hoy - ¿Continuamos?
Contenido:
- Resumen de lo conseguido en 15 días
- "Has ahorrado X horas"
- "Tus huéspedes han accedido X veces"
- CTA grande: "Suscribirme ahora"
- Oferta: 20% dto primer mes (código: TRIAL20)
```

**Si no convierte:** Remarketing
- Email día 16: "¿Qué pasó?"
- Ofrecer call discovery
- Entender objeciones

---

### **FASE 6: Retention (Retención)**

**Objetivo:** Mantener al cliente feliz y comprometido

**Mes 1-3 (Honeymoon):**
- Email semanal con tips
- Nuevas features
- Invitación a comunidad (grupo privado Facebook)

**Mes 4-6 (Growth):**
- Caso de éxito mensual
- Webinar exclusivo clientes
- Early access nuevas features

**Mes 7-12 (Loyalty):**
- Programa referidos (20% comisión recurrente)
- Invitación a beta testers
- Testimonial request (con incentivo)

---

### **FASE 7: Advocacy (Evangelización)**

**Objetivo:** Convertir clientes en promotores

**Acciones:**
1. **Programa de Afiliados:**
   - 20% recurrente de por vida
   - Dashboard de stats
   - Material marketing listo

2. **Testimonios:**
   - Video testimonial → Regalo €50 Amazon
   - Caso de estudio completo → 3 meses gratis

3. **Comunidad:**
   - Grupo privado Telegram/WhatsApp
   - Eventos trimestrales online
   - Early access features

---

## 📅 Calendario Editorial - Template

### **Estructura Semanal**

| Día | Contenido | Canal | Objetivo |
|-----|-----------|-------|----------|
| **Lunes** | Post LinkedIn (artículo nuevo) | LinkedIn | Awareness B2B |
| **Martes** | Carrusel Instagram (tips) | Instagram | Engagement |
| **Miércoles** | Artículo blog nuevo | Blog + Newsletter | SEO + Leads |
| **Jueves** | Post Facebook grupos | Facebook | Community |
| **Viernes** | Video corto (tip rápido) | LinkedIn + Insta | Viralidad |
| **Sábado** | Repost mejor contenido semana | Twitter | Reciclaje |
| **Domingo** | Preparación semana siguiente | - | Planning |

### **Calendario Mensual - Keywords Prioritarias**

#### **Semana 1:**
- **Artículo:** Manual digital apartamento turístico (YA HECHO ✅)
- **Keyword:** "manual digital apartamento turistico" (140 búsquedas/mes)

#### **Semana 2:**
- **Artículo:** Cómo automatizar Airbnb
- **Keyword:** "automatizar airbnb" (110 búsquedas/mes)

#### **Semana 3:**
- **Artículo:** Plantilla check-in apartamento turístico
- **Keyword:** "check in apartamento turistico" (90 búsquedas/mes)

#### **Semana 4:**
- **Artículo:** Precio apartamento turístico: Cómo calcularlo
- **Keyword:** "precio apartamento turistico" (320 búsquedas/mes)

**Repetir ciclo** con keywords de tu MARKETING_MASTER_PLAN.md

---

## 🤖 Automatización Semanal

### **DOMINGOS - Planning & Automation Day**

**9:00 - 10:00: Revisión semana anterior**
1. Abrir Google Analytics
2. Ver tráfico blog semana pasada
3. Identificar artículo con más tráfico
4. Anotar keywords que funcionaron

**10:00 - 11:30: Generación de contenido**

**Escenario Make.com:** "Generate Weekly Content"

**Flujo automático:**
```
1. Trigger: Domingo 10:00 AM
2. Google Sheets: Leer keyword de la semana
3. Claude API: Generar artículo 2,000+ palabras
   Prompt: "Crea artículo SEO sobre [keyword] siguiendo estructura de manual-digital-apartamento-turistico-plantilla-completa-2025"
4. Unsplash API: Buscar imagen cover
5. Crear draft en Prisma (blog_posts)
6. Gmail: Enviar notificación "Artículo draft listo para revisar"
```

**11:30 - 12:30: Revisión y publicación**
1. Abrir /admin/blog
2. Revisar draft generado por IA
3. Ajustar si es necesario
4. Añadir CTAs newsletter (inline + box)
5. Publicar

**12:30 - 13:00: Programación redes sociales**

**Escenario Make.com:** "Schedule Social Media Week"

**Flujo:**
```
1. Trigger: Artículo publicado
2. Claude API: Generar 7 posts para redes sociales
   - 3 LinkedIn (lunes, miércoles, viernes)
   - 2 Facebook (martes, jueves)
   - 2 Instagram captions (martes, viernes)
3. Buffer API: Programar todos los posts
4. Gmail: Confirmación "Semana programada ✅"
```

---

## 📊 Reportes Viernes/Sábado

### **VIERNES 18:00 - Reporte Automático Semanal**

**Escenario Make.com:** "Weekly Report"

**Fuentes de datos:**
1. Google Analytics 4 API
2. Google Search Console API
3. Prisma (blog stats)
4. Newsletter subscribers

**Métricas a incluir:**

```markdown
# 📈 Reporte Semanal Marketing - [Fecha]

## 🌐 Tráfico Web
- Visitantes únicos: X (+Y% vs semana anterior)
- Páginas vistas: X
- Tiempo promedio: X min
- Tasa rebote: X%

## 📝 Blog Performance
- Artículos publicados: X
- Lecturas totales: X
- Artículo más leído: [Título] (X vistas)
- CTR newsletter: X%

## 🔍 SEO
- Impresiones Google: X
- Clicks desde Google: X
- CTR medio: X%
- Posición media: X
- Keywords en Top 10: X

## 📧 Newsletter
- Nuevos suscriptores: X
- Total suscriptores: X
- Tasa de apertura: X%
- Tasa de click: X%

## 💰 Conversiones
- Trials iniciados: X
- Trial → Pago: X
- Churn: X%
- MRR: €X

## 📱 Social Media
- LinkedIn followers: X (+Y)
- Engagement rate: X%
- Post con más interacción: [Link]

## 🎯 Acciones Semana Próxima
- [ ] Keyword a trabajar: [keyword]
- [ ] Test A/B: [descripción]
- [ ] Mejora sugerida: [acción]
```

**Envío:**
- Gmail a tu email personal
- Slack notification (si lo usas)
- Guardar en Notion

---

## 🔌 Integraciones y APIs - Resumen

### **Variables de Entorno (.env.local)**

```bash
# ========================================
# MARKETING AUTOMATION
# ========================================

# Google Search Console
GOOGLE_SEARCH_CONSOLE_SITE_URL=https://itineramio.com

# Claude AI (Anthropic)
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Unsplash (Imágenes)
UNSPLASH_ACCESS_KEY=xxxxx

# Email Marketing (Brevo)
BREVO_API_KEY=xxxxx

# Social Media (Buffer)
BUFFER_ACCESS_TOKEN=xxxxx

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
GOOGLE_SEARCH_CONSOLE_CLIENT_ID=xxxxx
GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET=xxxxx

# Make.com Webhooks
MAKE_WEBHOOK_GENERATE_CONTENT=https://hook.eu1.make.com/xxxxx
MAKE_WEBHOOK_SOCIAL_SCHEDULE=https://hook.eu1.make.com/xxxxx
MAKE_WEBHOOK_WEEKLY_REPORT=https://hook.eu1.make.com/xxxxx
```

---

## 💡 Prompts Optimizados para Claude AI

### **Prompt: Generar Artículo Blog**

Guardar en: `docs/prompts/generate-blog-article.md`

```markdown
Eres un experto en marketing de contenidos para propietarios de apartamentos turísticos en España. Vas a crear un artículo completo optimizado para SEO.

KEYWORD OBJETIVO: [keyword]
BÚSQUEDAS/MES: [volumen]
DIFICULTAD SEO: [score]

ESTRUCTURA REQUERIDA:
1. Título gancho con keyword principal
2. Introducción con estadísticas reales
3. 10-12 secciones H2 con H3 anidados
4. Casos reales con datos específicos
5. Checklist descargable
6. FAQs
7. CTA final a Itineramio

ESTILO:
- Tono: Cercano pero profesional
- Longitud: 2,500+ palabras
- Usa bullets y ejemplos
- Datos específicos (no genéricos)
- Primera persona plural ("vamos a ver", "nuestros datos")

MENCIONES ITINERAMIO:
- Mención natural en sección de herramientas
- Comparativa honesta con competidores
- CTA suave: "Prueba 15 días gratis"
- Link: https://www.itineramio.com?utm_source=blog&utm_medium=article&utm_campaign=[keyword]

IMPORTANTE:
- NO seas vendedor agresivo
- Valor primero, venta después
- Menciona alternativas (ser honesto)
- Datos y casos reales

Genera el artículo completo en formato HTML listo para insertar en el campo "content" de la base de datos.
```

### **Prompt: Posts Redes Sociales**

```markdown
Has escrito un artículo de blog sobre: [título artículo]
URL: [url]

Crea 7 posts para redes sociales para promocionarlo durante la semana:

LINKEDIN (3 posts):
- Post 1 (Lunes): Anuncio artículo nuevo con hook fuerte
- Post 2 (Miércoles): Extracto del artículo con insight valioso
- Post 3 (Viernes): Pregunta abierta que genera debate

FACEBOOK (2 posts para grupos):
- Post 1 (Martes): Valor puro, sin link (para evitar spam)
- Post 2 (Jueves): Link al artículo con call to action

INSTAGRAM (2 captions):
- Post 1 (Martes): Carrusel 5 slides (dame textos de cada slide)
- Post 2 (Viernes): Reel idea (guión 30 segundos)

FORMATO DE SALIDA:
JSON con esta estructura:
{
  "linkedin": [...],
  "facebook": [...],
  "instagram": [...]
}
```

---

## 📈 KPIs a Monitorizar

### **Semana 1-4: Fase Tracción**
- Artículos publicados: 4/mes mínimo
- Tráfico orgánico: >500 visitas/mes
- Newsletter subscribers: >50

### **Mes 2-3: Fase Crecimiento**
- Tráfico orgánico: >2,000 visitas/mes
- Keywords en Top 10: >5
- Newsletter subscribers: >200
- Trials iniciados: >10/mes

### **Mes 4-6: Fase Escalado**
- Tráfico orgánico: >5,000 visitas/mes
- Keywords en Top 10: >15
- Newsletter subscribers: >500
- Trials → Pago: >20%
- MRR: >€1,000

### **Mes 7-12: Fase Consolidación**
- Tráfico orgánico: >10,000 visitas/mes
- Keywords en Top 10: >30
- Newsletter subscribers: >1,000
- MRR: >€3,000

---

## 🚨 Troubleshooting

### **Problema: Artículos no indexan en Google**
**Solución:**
1. Verificar sitemap.xml accesible
2. Enviar URL manualmente en Search Console
3. Verificar robots.txt no bloquee /blog
4. Añadir internal links desde otros artículos

### **Problema: Bajo engagement redes sociales**
**Solución:**
1. Testear diferentes horarios publicación
2. Más contenido visual (menos texto)
3. Preguntas abiertas para generar comentarios
4. Responder TODOS los comentarios en <2h

### **Problema: Newsletter baja tasa apertura**
**Solución:**
1. A/B test subject lines
2. Enviar martes/jueves (mejor que lunes/viernes)
3. Personalizar con nombre
4. Segmentar por interés

---

## ✅ Checklist Semanal

### **Domingos:**
- [ ] Revisar analytics semana anterior
- [ ] Generar artículo nuevo con IA (revisar y ajustar)
- [ ] Programar 7 posts redes sociales
- [ ] Actualizar calendario editorial Notion

### **Lunes-Viernes:**
- [ ] Responder comentarios redes sociales (<2h)
- [ ] Monitorizar engagement posts
- [ ] Responder emails newsletter

### **Viernes:**
- [ ] Revisar reporte automático
- [ ] Identificar mejoras para próxima semana
- [ ] Actualizar backlog ideas contenido

---

## 📚 Recursos Adicionales

- **Calendario Editorial:** `/docs/calendario-editorial-notion.md`
- **Prompts IA:** `/docs/prompts/`
- **Make.com Scenarios:** `/docs/make-scenarios/`
- **Branding Kit:** `/docs/branding/`

---

**Última actualización:** Enero 2025
**Mantenido por:** Equipo Itineramio
**Dudas:** alex@itineramio.com
