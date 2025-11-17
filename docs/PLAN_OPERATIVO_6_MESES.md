# Plan Operativo - Itineramio (6 Meses)

**Inicio:** Mañana
**Objetivo:** Llegar a break-even y validar product-market fit
**Break-even:** 35 clientes pagando 49€/mes = 1.715€ MRR

---

## 🎯 NÚMEROS REALES PARA GANAR DINERO

### Costes Fijos Mensuales (Mínimo Viable)

| Concepto | Coste/mes |
|----------|-----------|
| Hosting (Vercel Pro) | 20€ |
| Base de datos (Supabase Pro) | 25€ |
| Resend (Email) | 20€ |
| Dominio + SSL | 2€ |
| **Herramientas básicas** | **67€/mes** |

### Costes Variables (Marketing)

| Concepto | Fase 1 (Mes 1-2) | Fase 2 (Mes 3-4) | Fase 3 (Mes 5-6) |
|----------|-------------------|-------------------|-------------------|
| Google Ads | 200€ | 400€ | 600€ |
| Meta Ads | 0€ | 300€ | 500€ |
| Contenido (copywriter) | 300€ | 400€ | 600€ |
| **TOTAL MARKETING** | **500€** | **1.100€** | **1.700€** |

**TOTAL COSTES MES 1-2:** 567€/mes
**TOTAL COSTES MES 3-4:** 1.167€/mes
**TOTAL COSTES MES 5-6:** 1.767€/mes

### Clientes Necesarios por Fase

**ARPU (Average Revenue Per User):** 49€/mes

| Fase | Costes | Clientes para Break-Even | MRR Break-Even |
|------|--------|--------------------------|----------------|
| Mes 1-2 | 567€ | **12 clientes** | 588€ |
| Mes 3-4 | 1.167€ | **24 clientes** | 1.176€ |
| Mes 5-6 | 1.767€ | **36 clientes** | 1.764€ |

### Funnel de Conversión Realista

Para conseguir 36 clientes en Mes 6:

```
10.000 visitas web/mes
    ↓ 5% completan test
500 tests completados/mes
    ↓ 6% empiezan trial
30 trials/mes
    ↓ 40% convierten
12 nuevos clientes/mes
```

**Clientes acumulados Mes 6:** ~50 clientes (si retention es 90%)
**MRR Mes 6:** 2.450€
**Beneficio Mes 6:** 683€/mes

---

## 📅 TU DÍA 1 (MAÑANA) - CHECKLIST OPERATIVO

### 🌅 Mañana (9:00 - 13:00)

#### Prioridad #1: Dashboard de Admin (CRÍTICO)
**¿Qué necesitas?**
- Panel para gestionar artículos del blog
- CRUD completo (crear, editar, borrar, publicar/despublicar)
- Preview antes de publicar
- SEO fields (title, description, keywords)
- Sistema de categorías

**Acción:**
```bash
# Voy a crear el admin dashboard AHORA
# Ruta: /admin/blog/editor
```

#### Prioridad #2: Email Day 0 (Bienvenida)
**¿Qué necesitas?**
- Se envía inmediatamente tras completar test
- Contenido: Bienvenida + resumen resultado + descarga lead magnet
- Incluir en `/api/host-profile/submit/route.ts`

**Acción:** Lo implemento ahora

#### Prioridad #3: Tracking Básico
**¿Qué necesitas?**
- GA4 events en cada CTA de emails
- Conversiones en dashboard de admin
- Métricas por arquetipo

**Acción:** Setup GA4 básico

### 🌆 Tarde (14:00 - 18:00)

#### Prioridad #4: Primer Artículo REAL
**¿Cuál?** Caso de Laura (el storytelling del email día 7)

**Template:**
```markdown
# De 1.800€/mes a 3.200€/mes (Misma Propiedad)

## El Problema
[Historia de Laura, 300 palabras]

## El Descubrimiento
[Qué estaba haciendo mal, 400 palabras]

## Los 3 Cambios
1. Pricing (600 palabras)
2. Fotos profesionales (500 palabras)
3. Automatización (500 palabras)

## Resultados
[Timeline, números, gráficas - 400 palabras]

## Conclusión + CTA
[200 palabras]
```

**Total:** 2.900 palabras
**Tiempo:** 3-4 horas (si escribes tú)
**Coste:** 150€ (si contratas copywriter)

#### Prioridad #5: Lead Magnet MVP
**¿Cuál?** Dashboard de KPIs para ESTRATEGA (Google Sheets)

**Incluye:**
- 5 métricas: RevPAR, ADR, Occupancy, GAC, LTV
- Fórmulas automáticas
- Gráfica mensual
- Instrucciones de uso

**Tiempo:** 2 horas
**Coste:** 0€ (lo haces tú)

---

## 📆 PLAN SEMANAL (Rutina Operativa)

### Semana Tipo (20h trabajo)

#### LUNES (4h) - Contenido
- [ ] Escribir/publicar 1 artículo blog (o coordinar con copywriter)
- [ ] Crear 1 lead magnet o mejorar existente
- [ ] Revisar analytics de semana anterior

#### MARTES (4h) - Marketing Orgánico
- [ ] 3 posts LinkedIn con contenido educativo + link test
- [ ] 2 reels Instagram (tips rápidos)
- [ ] 1 thread Twitter sobre gestión Airbnb
- [ ] Responder comentarios y DMs

#### MIÉRCOLES (3h) - Ads + Optimización
- [ ] Revisar métricas Google Ads
- [ ] Ajustar bids y keywords
- [ ] Crear 2 variantes de creative para Meta Ads
- [ ] A/B test de landing pages

#### JUEVES (4h) - Producto + Soporte
- [ ] Responder emails de trials (crucial)
- [ ] Llamada con 2-3 usuarios (feedback)
- [ ] Mejorar onboarding según feedback
- [ ] Actualizar artículos según preguntas frecuentes

#### VIERNES (3h) - Métricas + Planning
- [ ] Dashboard ejecutivo (métricas semanales)
- [ ] Identificar bottlenecks del funnel
- [ ] Planificar semana siguiente
- [ ] Newsletter semanal (si aplica)

#### SÁBADO/DOMINGO - Descanso (o 2h extras si necesario)

---

## 🗓️ ROADMAP 6 MESES CON HITOS

### MES 1: FUNDACIÓN (Semanas 1-4)

**Objetivo:** Sistema funcionando + primeros 5 clientes

#### Semana 1 - SETUP TÉCNICO
- [x] Admin dashboard para blog (CRUD completo)
- [x] Email Day 0 (bienvenida automática)
- [x] GA4 tracking básico
- [x] Landing page del blog optimizada
- [ ] Sistema de preview de artículos antes de publicar

**Entregable:** Admin panel funcionando

#### Semana 2 - CONTENIDO BASE
- [ ] Artículo: Caso de Laura (2.900 palabras)
- [ ] Artículo: RevPAR vs Ocupación (2.500 palabras)
- [ ] Lead magnet: Dashboard KPIs (Google Sheets)
- [ ] Lead magnet: Checklist automatizaciones (PDF)

**Entregable:** 2 artículos publicados + 2 lead magnets

#### Semana 3 - PRIMEROS TESTS
- [ ] Invitar 20 conocidos a hacer el test
- [ ] Recopilar feedback sobre emails
- [ ] Ajustar copy según feedback
- [ ] Publicar artículo 3: Diferenciación Airbnb

**Entregable:** 20 tests completados + feedback

#### Semana 4 - LANZAMIENTO SUAVE
- [ ] Google Ads: 200€ en keywords comerciales
- [ ] 10 posts LinkedIn + artículos
- [ ] Partnerships: contactar 5 influencers
- [ ] Publicar artículo 4: Delegación

**Hito Mes 1:**
✅ 100 tests completados
✅ 5 trials activos
✅ 2 clientes de pago
✅ **MRR: 98€** (objetivo: 588€)
✅ 4 artículos publicados

**Gap:** -490€ (normal, es inversión)

---

### MES 2: TRACCIÓN (Semanas 5-8)

**Objetivo:** Validar canales de adquisición + 10 clientes

#### Semana 5 - CONTENIDO ESPECÍFICO
- [ ] Artículos 5-6: Prevención + Experiencia Huésped
- [ ] Lead magnets: 2 más (Pack SOPs + Kit Diferenciación)
- [ ] Video: Tutorial manual digital (YouTube)
- [ ] Case study completo de 1 cliente real

#### Semana 6 - ESCALAR ORGÁNICO
- [ ] 15 posts LinkedIn (aumentar frecuencia)
- [ ] Guest post en blog de turismo
- [ ] Webinar gratuito: "Automatiza tu Airbnb en 1h"
- [ ] Email a base actual: refer a friend (10% descuento)

#### Semana 7 - ESCALAR PAID
- [ ] Google Ads: subir a 400€
- [ ] Meta Ads: lanzar con 200€
- [ ] Retargeting pixel activado
- [ ] Lookalike audience de clientes actuales

#### Semana 8 - OPTIMIZACIÓN
- [ ] A/B test: subject lines (3 variantes)
- [ ] A/B test: landing trial (2 diseños)
- [ ] Análisis: qué arquetipo convierte mejor
- [ ] Ajustar presupuesto ads a top performer

**Hito Mes 2:**
✅ 400 tests completados acumulados
✅ 20 trials (10 nuevos este mes)
✅ 10 clientes de pago
✅ **MRR: 490€** (objetivo: 588€)
✅ 8 artículos publicados

**Gap:** -77€ (cerca de break-even Fase 1)

---

### MES 3: CRECIMIENTO (Semanas 9-12)

**Objetivo:** Break-even Fase 2 + 25 clientes

#### Semana 9 - CONTENIDO AVANZADO
- [ ] Artículos 9-10: Sistemas Flexibles + Gestión Eficiente
- [ ] Ebook: "Guía Completa del Anfitrión Eficiente" (50 páginas)
- [ ] Video case study: Entrevista con Laura
- [ ] Podcast: Invitar a 2 hosts top

#### Semana 10 - PARTNERSHIPS
- [ ] Colaboración con 3 blogs de turismo
- [ ] Afiliados: programa 20% comisión primer mes
- [ ] Co-marketing con PMS (Guesty, Hospitable)
- [ ] Evento presencial: meetup hosts Barcelona/Madrid

#### Semana 11 - ESCALAR ADS
- [ ] Google Ads: 600€
- [ ] Meta Ads: 500€
- [ ] YouTube Ads: test con 200€
- [ ] LinkedIn Ads: test con 200€

#### Semana 12 - PRODUCTO
- [ ] Feature nueva basada en feedback top 3
- [ ] Mejorar onboarding (reducir tiempo a valor)
- [ ] Email de reactivación para churned users
- [ ] Encuesta NPS a todos los clientes

**Hito Mes 3:**
✅ 1.200 tests completados acumulados
✅ 50 trials acumulados (25 nuevos)
✅ 25 clientes de pago
✅ **MRR: 1.225€** (objetivo: 1.176€)
✅ 10 artículos publicados
✅ **BREAK-EVEN FASE 2 alcanzado** 🎉

**Beneficio:** +58€

---

### MES 4: CONSOLIDACIÓN (Semanas 13-16)

**Objetivo:** Optimizar CAC + 40 clientes

#### Semana 13-14 - OPTIMIZACIÓN FUNNEL
- [ ] Identificar punto de fuga del funnel
- [ ] Mejorar email con peor open rate
- [ ] Mejorar página con peor conversión
- [ ] Implementar chat en vivo en trial

#### Semana 15-16 - ESCALAR LO QUE FUNCIONA
- [ ] Doblar presupuesto en canal con mejor ROI
- [ ] Crear 5 variantes de creative ganador
- [ ] Expandir keywords de ads exitosas
- [ ] Aumentar frecuencia de contenido orgánico

**Hito Mes 4:**
✅ 2.000 tests completados acumulados
✅ 40 clientes de pago
✅ **MRR: 1.960€**
✅ Retention >85%

**Beneficio:** +793€

---

### MES 5: EXPANSIÓN (Semanas 17-20)

**Objetivo:** Nuevos canales + 60 clientes

#### Semana 17-18 - NUEVOS CANALES
- [ ] Podcast propio (4 episodios)
- [ ] Newsletter semanal externa (Substack)
- [ ] TikTok: cuenta dedicada
- [ ] Telegram/WhatsApp: comunidad exclusiva

#### Semana 19-20 - ESCALAR EQUIPO
- [ ] Contratar VA para RRSS (20h/semana)
- [ ] Contratar copywriter fijo (2 artículos/semana)
- [ ] Automatizar reportes con Zapier
- [ ] Delegar soporte tier 1

**Hito Mes 5:**
✅ 3.500 tests completados acumulados
✅ 60 clientes de pago
✅ **MRR: 2.940€**

**Beneficio:** +1.173€

---

### MES 6: ESCALA (Semanas 21-24)

**Objetivo:** Product-Market Fit confirmado + 80 clientes

#### Semana 21-22 - PRODUCTO PREMIUM
- [ ] Tier premium: 99€/mes (funcionalidades extra)
- [ ] Servicio de consultoría: 300€ one-time
- [ ] Templates premium: marketplace
- [ ] API para integraciones

#### Semana 23-24 - PREPARAR SERIE A / BOOTSTRAPPING
- [ ] Documentar métricas para inversores
- [ ] Deck de inversión (si aplica)
- [ ] Roadmap producto 12 meses
- [ ] Hiring plan para Q2

**Hito Mes 6:**
✅ 6.000 tests completados acumulados
✅ 80 clientes de pago
✅ **MRR: 3.920€**
✅ Churn <10%
✅ CAC recuperado <4 meses
✅ **BREAK-EVEN TOTAL** 🚀

**Beneficio:** +2.153€

---

## 📊 DASHBOARD DE MÉTRICAS (Necesitas Implementar)

### Panel de Admin - Vista Ejecutiva

**Ruta:** `/admin/dashboard`

```typescript
// Métricas en tiempo real
interface DashboardMetrics {
  // FUNNEL
  testsCompletedToday: number
  testsCompletedThisWeek: number
  testsCompletedThisMonth: number

  trialsActiveNow: number
  trialsStartedThisWeek: number
  conversionRateTestToTrial: number // %

  customersTotal: number
  customersNewThisMonth: number
  conversionRateTrialToCustomer: number // %

  // REVENUE
  mrr: number // Monthly Recurring Revenue
  arr: number // Annual Recurring Revenue
  churnRate: number // %
  ltv: number // Lifetime Value

  // EMAILS
  emailsSentThisWeek: number
  openRateAverage: number // %
  clickRateAverage: number // %
  unsubscribeRate: number // %

  // PER EMAIL
  emailMetrics: {
    day0: { sent: number, opened: number, clicked: number }
    day3: { sent: number, opened: number, clicked: number }
    day7: { sent: number, opened: number, clicked: number }
    day10: { sent: number, opened: number, clicked: number }
    day14: { sent: number, opened: number, clicked: number }
  }

  // PER ARQUETIPO
  archetypeMetrics: {
    [key: string]: {
      tests: number
      trials: number
      customers: number
      conversionRate: number // %
    }
  }

  // MARKETING
  trafficSources: {
    organic: number
    paid: number
    social: number
    direct: number
    referral: number
  }

  cac: number // Customer Acquisition Cost

  // CONTENT
  blogPosts: number
  blogViews: number
  avgTimeOnPage: number // seconds
  topArticles: Array<{ slug: string, views: number }>
}
```

### Panel de Blog - Gestión Contenido

**Ruta:** `/admin/blog`

**Funcionalidades:**
- ✅ Listar todos los artículos (tabla con filtros)
- ✅ Crear nuevo artículo (editor WYSIWYG o Markdown)
- ✅ Editar artículo existente
- ✅ Preview antes de publicar
- ✅ Publicar/Despublicar con un click
- ✅ SEO fields (title, description, keywords, OG image)
- ✅ Programar publicación futura
- ✅ Ver analytics del artículo (views, time on page, conversions)
- ✅ Clonar artículo (para hacer variantes)
- ✅ Exportar/Importar artículos (backup)

**Campos del artículo:**
```typescript
interface BlogPost {
  id: string
  title: string
  slug: string
  content: string // HTML o Markdown
  excerpt: string
  coverImage: string
  author: string
  category: 'GUIAS' | 'MEJORES_PRACTICAS' | 'NORMATIVA' | etc
  tags: string[]

  // SEO
  metaTitle: string
  metaDescription: string
  keywords: string[]
  ogImage: string

  // Estado
  status: 'draft' | 'published' | 'scheduled'
  publishedAt: Date | null
  scheduledFor: Date | null

  // Analytics
  views: number
  avgTimeOnPage: number
  conversions: number // cuántos hicieron test desde este artículo

  // Timestamps
  createdAt: Date
  updatedAt: Date
}
```

---

## 📝 MANTENIMIENTO DE ARTÍCULOS EVERGREEN

### Estrategia de Actualización

**Artículos Evergreen = 80% del tráfico**
Necesitan mantenimiento cada 6 meses

### Calendario de Revisión

```markdown
# Checklist Revisión Trimestral (Q1, Q2, Q3, Q4)

## Datos a Actualizar
- [ ] Estadísticas y números (siempre actualizar año)
- [ ] Precios de herramientas mencionadas
- [ ] Screenshots (si hay cambios de UI)
- [ ] Links rotos (usar herramienta de broken links)
- [ ] Legislación (especialmente normativa)

## SEO
- [ ] Posición en Google (objetivo: top 10)
- [ ] Keywords: añadir nuevas según trends
- [ ] Competencia: qué están haciendo otros
- [ ] Internal links: asegurar que apunten a nuevos artículos

## Contenido
- [ ] Añadir sección "Actualizado en [Fecha]"
- [ ] Casos nuevos si aplica
- [ ] Nuevas herramientas que hayan salido
- [ ] FAQ: añadir preguntas que recibes por email

## Conversión
- [ ] CTAs: revisar si siguen funcionando
- [ ] Lead magnets: actualizar si hay versión nueva
- [ ] A/B test: probar nueva versión del CTA
```

### Sistema de Alertas Automáticas

**Implementar:**
- Email cuando artículo tenga >6 meses sin actualizar
- Alert cuando artículo baje de top 10 en Google
- Notificación cuando link externo esté roto
- Dashboard con "artículos que necesitan atención"

---

## 📈 PRODUCCIÓN DE CONTENIDO

### ¿Cuántos Artículos a la Semana?

#### Fase 1 (Mes 1-2): **1 artículo/semana**
- Foco en calidad, no cantidad
- Tiempo: 4-6 horas/artículo (si escribes tú)
- Objetivo: construir biblioteca base (8 artículos core)

#### Fase 2 (Mes 3-4): **2 artículos/semana**
- 1 evergreen largo (2.500+ palabras)
- 1 táctico corto (1.200 palabras)
- Contratar copywriter parcial

#### Fase 3 (Mes 5-6): **3 artículos/semana**
- Copywriter full-time o 2 part-time
- 2 evergreen + 1 noticia/trend
- Más video content (YouTube)

### Tipos de Artículos

**80% Evergreen (Siempre relevante)**
- Guías completas
- Casos de estudio
- Tutoriales paso a paso
- Comparativas de herramientas

**20% Temporal (Trend-jacking)**
- Cambios en legislación
- Nuevas features de Airbnb
- Tendencias del mercado
- Seasonal (verano/invierno)

---

## 🚨 QUÉ FALTA TÉCNICAMENTE

### CRÍTICO (Hacer Esta Semana)

1. **Admin Dashboard para Blog**
   - CRUD completo de artículos
   - Editor de contenido (Markdown o WYSIWYG)
   - Preview antes de publicar
   - SEO fields
   - Sistema de categorías y tags

2. **Email Day 0 (Bienvenida)**
   - Se envía automáticamente tras test
   - Incluye resumen resultado
   - Link a descarga de lead magnet
   - Adelanto de próximos emails

3. **Sistema de Lead Magnets**
   - Storage de archivos (S3 o Vercel Blob)
   - Links de descarga con token
   - Tracking de descargas
   - Admin panel para subir/editar

4. **Analytics Dashboard**
   - Integración GA4
   - Métricas de funnel en tiempo real
   - Gráficas de conversión
   - Breakdown por arquetipo

### IMPORTANTE (Hacer Este Mes)

5. **Sistema de Comentarios en Blog**
   - Para engagement
   - Responder dudas = contenido
   - Social proof

6. **Newsletter Signup**
   - Popup al salir (exit intent)
   - Inline en artículos
   - Lead magnet como incentivo

7. **Sitemap Automático**
   - Para SEO
   - Actualización automática

8. **Schema Markup**
   - ArticleSchema en blog posts
   - OrganizationSchema
   - FAQSchema si aplica

### NICE TO HAVE (Hacer Próximos 3 Meses)

9. **A/B Testing Built-in**
   - Subject lines
   - Landing pages
   - CTAs

10. **Chatbot con IA**
    - Responder preguntas frecuentes
    - Cualificar leads
    - Ofrecer trial

11. **Programa de Afiliados**
    - Dashboard para afiliados
    - Tracking de referrals
    - Pago automático comisiones

12. **API Pública**
    - Webhooks para integraciones
    - Documentación
    - API keys management

---

## 🎯 CHECKLIST: ¿ESTÁS LISTO PARA EMPEZAR MAÑANA?

### Técnico
- [ ] Admin dashboard blog funcionando
- [ ] Email Day 0 implementado
- [ ] GA4 básico configurado
- [ ] Sistema de lead magnets (aunque sea básico)
- [ ] Tracking de conversiones

### Contenido
- [ ] Template de artículo definido
- [ ] Primeros 2 artículos listos para publicar
- [ ] 1 lead magnet disponible
- [ ] Copy de emails revisado y aprobado

### Marketing
- [ ] Cuenta Google Ads creada y configurada
- [ ] Pixel de Meta Ads instalado
- [ ] Perfiles de RRSS optimizados
- [ ] Calendario editorial primera semana

### Operaciones
- [ ] Dashboard de métricas accesible
- [ ] Proceso de respuesta a emails definido
- [ ] Calendario bloqueado (20h/semana dedicadas)
- [ ] Herramientas de productividad configuradas

---

## 💡 RESPUESTAS A TUS PREGUNTAS

### ¿Cómo promociono estos funnels?

**Semana 1-2: Organic + Network**
- LinkedIn: 3 posts/semana con contenido + link test
- Tu red: pedir a 50 conocidos que hagan test y compartan
- Grupos Facebook de Airbnb: aportar valor + link test (no spam)

**Semana 3-4: Paid Ads Inicio**
- Google Ads: 200€ en keywords "software gestion airbnb", "manual digital airbnb"
- Landing: página con test como lead magnet

**Mes 2+: Escalar**
- Aumentar presupuesto ads según ROI
- Partnerships con influencers
- Guest posts en blogs

### ¿Cómo compruebo que los emails están bien escritos?

**Antes de enviar:**
1. Envíate a ti mismo (ver en móvil + desktop)
2. Revisor ortográfico (Grammarly, LanguageTool)
3. Leer en voz alta (detectas frases raras)
4. Pedir a 2-3 personas que lean y den feedback

**Después de enviar:**
1. Revisar open rate (benchmark: >40%)
2. Revisar click rate (benchmark: >8%)
3. Leer replies (qué confundió, qué resonó)
4. A/B test variantes

### ¿Cómo modifico y mantengo artículos?

**Sistema:**
1. Admin panel → editas directamente
2. Guardas como draft
3. Preview para ver cómo queda
4. Publicas cuando estés conforme

**Calendario:**
- Revisión trimestral de top 10 artículos
- Update cuando cambie algo relevante (ley, precio herramienta)
- Añadir sección "Actualizado en [Fecha]" al inicio

### ¿Cuántos clientes potenciales necesito?

**Para llegar a 36 clientes (break-even Mes 6):**
- 6.000 tests completados acumulados
- ~1.000 tests/mes en Mes 6
- ~300-400 visitas/día a la web

**Embudo:**
```
10.000 visitas
  → 500 tests (5%)
    → 30 trials (6%)
      → 12 clientes (40%)
```

### ¿Qué mantenimiento necesito?

**Diario (30 min):**
- Responder emails de trials
- Revisar métricas clave (dashboard)
- Moderar comentarios del blog

**Semanal (4h):**
- Crear/publicar 1 artículo
- Gestionar ads (ajustar bids)
- Contenido RRSS (posts, reels)

**Mensual (8h):**
- Análisis profundo de métricas
- Actualizar 2-3 artículos antiguos
- Planning contenido mes siguiente
- Llamadas con clientes (feedback)

**Trimestral (2 días):**
- Revisión estrategia completa
- Actualización roadmap producto
- Deep dive en competencia
- Planificación siguiente trimestre

---

## 🚀 PRIMERA ACCIÓN: LO IMPLEMENTO AHORA

Voy a crear:

1. **Admin Dashboard para Blog** - CRUD completo
2. **Email Day 0** - Bienvenida automática
3. **Panel de Analytics** - Métricas básicas
4. **Sistema de Lead Magnets** - Upload y descarga

¿Arrancamos? 💪
