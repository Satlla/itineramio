# 📋 PLAN DE ACCIÓN 16 SEMANAS - ITINERAMIO
## Del Plan a la Ejecución: Paso a Paso

---

## 🎯 VISIÓN GENERAL

**Objetivo:** Implementar 3 customer journeys completos, 36 artículos de blog y sistema de email marketing en 16 semanas.

**Resultado esperado al final:**
- ✅ 3 funnels funcionando al 100%
- ✅ 36 artículos publicados con SEO
- ✅ 8 secuencias de email automatizadas
- ✅ Curso de pago validado (objetivo: 100 ventas)
- ✅ Sistema escalable generando ~5,000€/mes

**Tiempo de dedicación:**
- Semanas 1-4: 30h/semana (setup intensivo)
- Semanas 5-12: 20h/semana (contenido)
- Semanas 13-16: 15h/semana (optimización)
---

## 📅 CALENDARIO EJECUTIVO

### MES 1: FUNDACIONES (Semanas 1-4)
**Prioridad: Setup técnico + Primera secuencia**
- Semana 1: Infraestructura técnica
- Semana 2: Lead magnets + Landing pages
- Semana 3: Secuencias de email
- Semana 4: Testing y lanzamiento soft

### MES 2: CONTENIDO FASE 1 (Semanas 5-8)
**Prioridad: Blog + SEO + Lead magnets**
- Semana 5: Cluster 1 - Gestión Operativa (3 artículos)
- Semana 6: Cluster 2 - Pricing (3 artículos)
- Semana 7: Cluster 3 - Experiencia (3 artículos)
- Semana 8: Cluster 4 - Marketing (3 artículos)

### MES 3: CONTENIDO FASE 2 (Semanas 9-12)
**Prioridad: Contenido avanzado + Validación curso**
- Semana 9: Cluster 5 - Análisis (3 artículos) + Encuesta curso
- Semana 10: Cluster 6 - Crisis (3 artículos) + Landing curso
- Semana 11: Cluster 7 - Escalabilidad (3 artículos) + Campaña espera
- Semana 12: Cluster 8 - Casos éxito (3 artículos) + Decisión GO/NO-GO

### MES 4: OPTIMIZACIÓN + SCALING (Semanas 13-16)
**Prioridad: Analizar, optimizar y escalar**
- Semana 13: Análisis de datos + Optimización
- Semana 14: Paid acquisition + A/B testing
- Semana 15: Upsells + Cross-sells + Referral
- Semana 16: Reporting + Plan trimestral

---

## 🗓️ PLAN SEMANAL DETALLADO

---

## SEMANA 1: INFRAESTRUCTURA TÉCNICA
**Objetivo:** Sistema funcionando end-to-end
**Tiempo:** 30 horas

### Lunes (6h)
**Tarea 1.1: Setup Email Marketing [3h]**
- [ ] Crear cuenta ConvertKit o Mailchimp
- [ ] Configurar dominio custom (emails@itineramio.com)
- [ ] Verificar DNS y DKIM
- [ ] Crear grupos/tags principales:
  - Arquetipos (8 tags)
  - Fuentes (test, qr, blog)
  - Engagement (hot, warm, cold)
  - Productos (curso_gratis, manual, curso_pago)
- [ ] Configurar preferencias anti-spam

**Tarea 1.2: Setup Analytics [3h]**
- [ ] Configurar Google Analytics 4
- [ ] Crear eventos custom:
  - test_completed
  - email_captured
  - course_started
  - course_completed
  - purchase_completed
- [ ] Configurar funnels en GA4
- [ ] Setup Mixpanel o Amplitude (opcional)
- [ ] Dashboard básico en Looker Studio

### Martes (6h)
**Tarea 1.3: Infraestructura Base de Datos [4h]**
- [ ] Crear tabla EmailSubscriber en Prisma:
```typescript
model EmailSubscriber {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  archetype     String?
  source        String   // "test" | "qr" | "blog"
  tags          String[]
  status        String   @default("active") // "active" | "unsubscribed"
  engagement    String   @default("warm") // "hot" | "warm" | "cold"

  subscribedAt  DateTime @default(now())
  lastEmailAt   DateTime?
  openRate      Float    @default(0)
  clickRate     Float    @default(0)

  purchases     Purchase[]

  @@map("email_subscribers")
}
```
- [ ] Migrar base de datos
- [ ] Crear API endpoints:
  - POST /api/email/subscribe
  - POST /api/email/unsubscribe
  - POST /api/email/tag
  - GET /api/email/stats

**Tarea 1.4: Webhook ConvertKit → DB [2h]**
- [ ] Configurar webhook de ConvertKit
- [ ] Endpoint para sincronizar datos
- [ ] Testing de sincronización

### Miércoles (6h)
**Tarea 1.5: Diseño de Plantillas Email [4h]**
- [ ] Diseñar template base en Figma
- [ ] Codificar template en HTML responsive
- [ ] Testar en 10+ clientes email:
  - Gmail (desktop y mobile)
  - Outlook
  - Apple Mail
  - Proton Mail
- [ ] Subir a ConvertKit como template

**Elementos del template:**
```
- Header con logo
- Título del email
- Cuerpo (párrafos + listas)
- CTA button (primary)
- Imagen opcional
- Separadores
- P.D.
- Footer con datos legales + unsubscribe
```

**Tarea 1.6: Formularios de Captura [2h]**
- [ ] Crear 3 formularios embebidos:
  - Test de personalidad
  - QR code generator
  - Blog lead magnets
- [ ] Design en Tailwind CSS
- [ ] Testing de integración

### Jueves (6h)
**Tarea 1.7: Landing Pages Lead Magnets [6h]**

Crear 3 landing pages base:

**LP 1: Confirmación Test Personalidad**
- [ ] /host-profile/thank-you
- [ ] Mensaje de confirmación
- [ ] "Revisa tu email en 2 minutos"
- [ ] Social share buttons
- [ ] CTA secundario: "Crea tu manual"

**LP 2: Confirmación QR Code**
- [ ] /qr/thank-you
- [ ] Descarga de QR
- [ ] Tips de uso
- [ ] CTA: "Ver ejemplo de manual completo"

**LP 3: Confirmación Lead Magnet Blog**
- [ ] /recursos/[slug]/gracias
- [ ] Descarga del recurso
- [ ] Artículos relacionados
- [ ] CTA: "Únete al curso gratuito"

### Viernes (6h)
**Tarea 1.8: Testing End-to-End [4h]**
- [ ] Test flujo completo test → email → BD
- [ ] Test formularios todos los dispositivos
- [ ] Test webhooks
- [ ] Test analytics tracking
- [ ] Documentar cualquier bug

**Tarea 1.9: Documentación Técnica [2h]**
- [ ] Documentar toda la arquitectura
- [ ] Diagramas de flujo
- [ ] Credenciales y accesos
- [ ] Guía de troubleshooting

### Entregables Semana 1
✅ ConvertKit configurado y funcionando
✅ Analytics tracking 100% implementado
✅ Base de datos sincronizada
✅ Templates de email listos
✅ Landing pages live
✅ Testing completo sin errores

---

## SEMANA 2: LEAD MAGNETS + LANDING PAGES
**Objetivo:** 8 guías PDF + landing pages específicas
**Tiempo:** 30 horas

### Lunes (7h)
**Tarea 2.1: Guías PDF Arquetipos 1-2 [7h]**

**ESTRATEGA - Guía [3.5h]**
- [ ] Título: "El Manual del Estratega: 5 KPIs que Mueven la Aguja"
- [ ] Estructura (8 páginas):
  1. Portada + introducción
  2. Tu perfil como Estratega
  3. KPI 1: RevPAN (Revenue per Available Night)
  4. KPI 2: Direct Booking Ratio
  5. KPI 3: Guest Acquisition Cost
  6. KPI 4: Net Operating Income
  7. KPI 5: Occupancy vs ADR balance
  8. Dashboard template + Conclusión
- [ ] Diseño en Canva con branding Itineramio
- [ ] Exportar PDF optimizado
- [ ] Subir a servidor

**SISTEMÁTICO - Guía [3.5h]**
- [ ] Título: "El Sistema del Sistemático: 47 Tareas Automatizables"
- [ ] Estructura (10 páginas):
  1. Portada + introducción
  2. Tu perfil como Sistemático
  3. Checklist pre-llegada (12 tareas)
  4. Checklist check-in (8 tareas)
  5. Checklist durante estancia (15 tareas)
  6. Checklist check-out (7 tareas)
  7. Checklist post-estancia (5 tareas)
  8. Herramientas recomendadas
  9. Template de SOP (Standard Operating Procedure)
  10. Conclusión + siguiente paso
- [ ] Diseño en Canva
- [ ] PDF + Excel de checklist
- [ ] Subir a servidor

### Martes (7h)
**Tarea 2.2: Guías PDF Arquetipos 3-4 [7h]**

**DIFERENCIADOR - Guía [3.5h]**
- [ ] Título: "El Playbook del Diferenciador: Storytelling que Convierte"
- [ ] Estructura (9 páginas):
  1. Portada + intro
  2. Tu perfil como Diferenciador
  3. Framework de storytelling (5 pasos)
  4. 15 ejemplos de descripciones top
  5. Cómo crear tu welcome book único
  6. Ideas de experiencias memorables
  7. Templates de mensajes con personalidad
  8. Caso de éxito: Ana de Barcelona
  9. Tu plan de acción
- [ ] Diseño + templates incluidos
- [ ] PDF + Doc editable
- [ ] Subir

**EJECUTOR - Guía [3.5h]**
- [ ] Título: "Del Modo Bombero al Modo CEO: Guía del Ejecutor"
- [ ] Estructura (8 páginas):
  1. Portada + intro
  2. Tu perfil como Ejecutor
  3. Las 5 señales de burnout
  4. Matriz de Eisenhower para anfitriones
  5. Qué delegar primero (priorización)
  6. Cómo delegar sin perder control
  7. Sistema 80/20 aplicado
  8. Plan de balance semanal
- [ ] Diseño + worksheets
- [ ] PDF + templates
- [ ] Subir

### Miércoles (7h)
**Tarea 2.3: Guías PDF Arquetipos 5-6 [7h]**

**RESOLUTOR - Guía [3.5h]**
- [ ] Título: "Playbook Anti-Crisis: 27 Situaciones Resueltas"
- [ ] Estructura (12 páginas):
  1. Portada + intro
  2. Tu perfil como Resolutor
  3. Crisis nivel 1: Menores (10 situaciones)
  4. Crisis nivel 2: Medias (10 situaciones)
  5. Crisis nivel 3: Graves (7 situaciones)
  6. Scripts de respuesta por crisis
  7. Contactos de emergencia (template)
  8. Protocolo de escalación
  9. Kit anti-crisis (qué tener siempre)
  10. Prevención: señales de alerta
  11. Caso real: Crisis evitada
  12. Conclusión
- [ ] Diseño + scripts
- [ ] PDF + Doc
- [ ] Subir

**EXPERIENCIAL - Guía [3.5h]**
- [ ] Título: "El Corazón Escalable: Automatiza lo Técnico, Amplifica lo Humano"
- [ ] Estructura (10 páginas):
  1. Portada + intro
  2. Tu perfil como Experiencial
  3. La paradoja: Automatizar para humanizar
  4. 31 momentos wow de bajo coste
  5. Welcome pack ideas (3 niveles de inversión)
  6. Sistema de seguimiento emocional
  7. Cómo recordar preferencias sin CRM
  8. Scripts para situaciones delicadas
  9. Caso: Laura y sus huéspedes fieles
  10. Tu sistema de hospitalidad
- [ ] Diseño + ideas
- [ ] PDF + checklist
- [ ] Subir

### Jueves (7h)
**Tarea 2.4: Guías PDF Arquetipos 7-8 [7h]**

**EQUILIBRADO - Guía [3.5h]**
- [ ] Título: "El Equilibrado Estratégico: De Versátil a Excepcional"
- [ ] Estructura (8 páginas):
  1. Portada + intro
  2. Tu perfil como Equilibrado
  3. Test: Descubre tu ventaja oculta
  4. Estrategia de especialización gradual
  5. Cómo mantener versatilidad + expertiz
  6. 3 casos de equilibrados exitosos
  7. Tu plan 90 días
  8. Recursos y siguiente paso
- [ ] Diseño + test
- [ ] PDF + worksheet
- [ ] Subir

**IMPROVISADOR - Guía [3.5h]**
- [ ] Título: "El Kit Anti-Caos: Estructura que Libera"
- [ ] Estructura (9 páginas):
  1. Portada + intro
  2. Tu perfil como Improvisador
  3. Los 5 sistemas NO negociables
  4. Rutinas flexibles (framework)
  5. Herramientas minimalistas
  6. Balance libertad/estructura
  7. Qué NO automatizar (mantén tu magia)
  8. Caso: El improvisador organizado
  9. Tu starter kit
- [ ] Diseño + framework
- [ ] PDF + templates
- [ ] Subir

### Viernes (2h)
**Tarea 2.5: Control de Calidad [2h]**
- [ ] Revisar las 8 guías
- [ ] Corrección de typos
- [ ] Verificar todos los links
- [ ] Test de descarga
- [ ] Crear carpeta organizada en Drive

### Entregables Semana 2
✅ 8 guías PDF profesionales (60-80 páginas totales)
✅ Templates y recursos adicionales
✅ Todo subido y accesible
✅ Links de descarga funcionando

---

## SEMANA 3: SECUENCIAS DE EMAIL
**Objetivo:** 8 secuencias completas escritas y configuradas
**Tiempo:** 25 horas

### Lunes (5h)
**Tarea 3.1: Secuencia ESTRATEGA [5h]**

Escribir 8 emails:

**Email 0 (Inmediato):** "Tu perfil completo: EL ESTRATEGA"
```
Variables dinámicas:
- {first_name}
- {archetype}
- {top_strength}
- {critical_gap}

Estructura:
- Subject: 🎯 Tu perfil completo de Anfitrión: EL ESTRATEGA
- Preview: Tu mayor fortaleza + tu brecha crítica
- Cuerpo: Resultados + Guía PDF + CTA
- CTA principal: Descargar guía
- CTA secundario: Ver artículos recomendados
```

**Email 2 (Día 2):** "Los 3 KPIs que todo Estratega debe trackear"
**Email 5 (Día 5):** "Tu curso gratuito de iniciación está listo"
**Email 8 (Día 8):** "Cómo Laura ahorró 15h/semana con esto"
**Email 12 (Día 12):** "Una pregunta rápida"
**Email 15 (Día 15):** "Tu oferta exclusiva expira en 48h"
**Email 18 (Día 18):** "Última oportunidad"
**Email 22 (Día 22):** "¿Sigues ahí? Te echo de menos"

- [ ] Escribir todos los emails
- [ ] Definir subject lines
- [ ] Crear variantes A/B para subjects
- [ ] Configurar en ConvertKit
- [ ] Añadir tags y condiciones

### Martes (5h)
**Tarea 3.2: Secuencias SISTEMÁTICO + DIFERENCIADOR [5h]**

Repetir proceso para:
- SISTEMÁTICO (8 emails)
- DIFERENCIADOR (8 emails)

Personalizar:
- Subject lines según arquetipo
- Contenido específico
- Recursos y guías propias
- CTAs adaptados

### Miércoles (5h)
**Tarea 3.3: Secuencias EJECUTOR + RESOLUTOR [5h]**

- EJECUTOR (8 emails)
- RESOLUTOR (8 emails)

### Jueves (5h)
**Tarea 3.4: Secuencias EXPERIENCIAL + EQUILIBRADO [5h]**

- EXPERIENCIAL (8 emails)
- EQUILIBRADO (8 emails)

### Viernes (5h)
**Tarea 3.5: Secuencia IMPROVISADOR + QR + Blog [5h]**

- IMPROVISADOR (8 emails)
- QR Code (4 emails)
- Blog base (6 emails)

**Total emails escritos:** 70 emails

### Entregables Semana 3
✅ 70 emails escritos y configurados
✅ Todas las secuencias en ConvertKit
✅ Tags y automatizaciones configuradas
✅ A/B tests preparados

---

## SEMANA 4: TESTING Y LANZAMIENTO
**Objetivo:** Testear todo y lanzar soft (20% tráfico)
**Tiempo:** 20 horas

### Lunes (5h)
**Tarea 4.1: Testing Interno [5h]**
- [ ] Crear 10 emails de prueba
- [ ] Suscribir con diferentes arquetipos
- [ ] Verificar que cada secuencia funciona
- [ ] Testear todos los links
- [ ] Verificar analytics tracking
- [ ] Documentar cualquier bug

### Martes (5h)
**Tarea 4.2: Beta Testing [5h]**
- [ ] Invitar a 20 beta testers reales
- [ ] 10 completan test de personalidad
- [ ] 5 crean QR code
- [ ] 5 descargan lead magnet blog
- [ ] Recoger feedback en formulario
- [ ] Iterar según feedback

### Miércoles (5h)
**Tarea 4.3: Optimizaciones [5h]**
- [ ] Ajustar copy según feedback
- [ ] Corregir bugs detectados
- [ ] Mejorar subject lines
- [ ] Optimizar CTAs
- [ ] Re-test completo

### Jueves (3h)
**Tarea 4.4: Lanzamiento Soft [3h]**
- [ ] Activar funnels al 20% del tráfico
- [ ] Monitorear primeras 24h
- [ ] Revisar métricas en tiempo real:
  - Tasa de apertura
  - Click-through rate
  - Conversión a descarga
  - Errores técnicos

### Viernes (2h)
**Tarea 4.5: Review Semana + Plan Ajustes [2h]**
- [ ] Analizar métricas primera semana
- [ ] Identificar puntos de fricción
- [ ] Crear lista de mejoras rápidas
- [ ] Si todo OK: escalar al 100% tráfico

### Entregables Semana 4
✅ Sistema funcionando sin errores
✅ 30+ usuarios reales en funnels
✅ Feedback documentado
✅ Métricas baseline establecidas
✅ Lanzamiento soft exitoso

---

## SEMANAS 5-12: CONTENIDO (36 ARTÍCULOS)
**Objetivo:** 3 artículos/semana + lead magnets + secuencias

### Estructura Estándar por Artículo

**Tiempo por artículo: 6-7 horas**

**Investigación [1h]**
- [ ] Keyword research (Ahrefs/Semrush)
- [ ] Análisis competencia (top 10 Google)
- [ ] Identificar gaps de contenido
- [ ] Outline detallado

**Escritura [3h]**
- [ ] Intro (150-200 palabras)
- [ ] 4-5 secciones (H2)
- [ ] 2-3 subsecciones por H2 (H3)
- [ ] Ejemplos prácticos
- [ ] Screenshots/imágenes
- [ ] FAQ section
- [ ] Conclusión + CTA

**Diseño y Optimización [2h]**
- [ ] Crear lead magnet asociado
- [ ] Diseñar imágenes destacadas
- [ ] Optimizar SEO on-page:
  - Title tag
  - Meta description
  - Headers optimizados
  - Internal linking
  - Alt text imágenes
- [ ] Crear Social media posts

**Publicación [1h]**
- [ ] Revisar preview
- [ ] Verificar links
- [ ] Programar publicación
- [ ] Añadir a sitemap
- [ ] Submit a Google Search Console

### SEMANA 5: CLUSTER 1 - GESTIÓN OPERATIVA
**Artículos:**

**Artículo 1: "Check-in sin Estrés: La Guía Definitiva"**
- Keyword principal: "check in airbnb"
- Lead magnet: Checklist imprimible check-in
- Tiempo: 7h

**Artículo 2: "5 Sistemas que Implementar el Primer Día"**
- Keyword: "sistemas anfitrión"
- Lead magnet: Template de SOP básico
- Tiempo: 6h

**Artículo 3: "Plantilla de Mensaje de Bienvenida Perfecta"**
- Keyword: "mensaje bienvenida airbnb"
- Lead magnet: 15 templates de mensajes
- Tiempo: 6h

**Total semana 5: 19h**

### SEMANA 6: CLUSTER 2 - PRICING
**Artículo 4:** "Cómo Calcular tu Precio Base (con Calculadora)"
**Artículo 5:** "Temporadas: Cuándo Subir y Bajar Precios"
**Artículo 6:** "El Error del 90% con el Pricing"

**Total semana 6: 19h**

### SEMANA 7: CLUSTER 3 - EXPERIENCIA
**Artículo 7:** "27 Ideas de Bienvenida de Bajo Coste"
**Artículo 8:** "Cómo Conseguir tu Primera Review de 5★"
**Artículo 9:** "Qué Incluir en tu Welcome Pack"

**Total semana 7: 19h**

### SEMANA 8: CLUSTER 4 - MARKETING
**Artículo 10:** "Tu Primera Campaña de Email Marketing"
**Artículo 11:** "Instagram para Anfitriones: Guía Práctica"
**Artículo 12:** "Cómo Conseguir Reservas Directas"

**Total semana 8: 19h**

### SEMANA 9: CLUSTER 5 - ANÁLISIS
**Artículo 13:** "Los 5 KPIs que Debes Trackear"
**Artículo 14:** "Cómo Analizar tu Competencia"
**Artículo 15:** "Decisiones Basadas en Datos"

**Total semana 9: 19h**

**+ EXTRA:**
- [ ] Enviar encuesta validación curso (2h)
- [ ] Analizar 100 respuestas (2h)

### SEMANA 10: CLUSTER 6 - CRISIS
**Artículo 16:** "Playbook: 15 Crisis y Cómo Resolverlas"
**Artículo 17:** "Qué Hacer ante una Review Negativa"
**Artículo 18:** "Huésped Problemático: Tu Protocolo"

**Total semana 10: 19h**

**+ EXTRA:**
- [ ] Crear landing validación curso (4h)
- [ ] Configurar lista de espera (2h)

### SEMANA 11: CLUSTER 7 - ESCALABILIDAD
**Artículo 19:** "Del Anfitrión al Empresario: el Salto"
**Artículo 20:** "Cuándo Comprar una Segunda Propiedad"
**Artículo 21:** "Gestión Profesional vs DIY: Números Reales"

**Total semana 11: 19h**

**+ EXTRA:**
- [ ] Campaña email lista espera (4h)
- [ ] Ads test (setup 2h + monitoreo)

### SEMANA 12: CLUSTER 8 - CASOS ÉXITO
**Artículo 22:** "De 1 a 10 Propiedades en 2 Años"
**Artículo 23:** "Cómo Laura Automatizó el 90%"
**Artículo 24:** "150k€/año: Su Sistema Completo"

**Total semana 12: 19h**

**+ EXTRA:**
- [ ] Decisión GO/NO-GO curso (4h análisis)
- [ ] Si GO: Outline completo curso (6h)

### Entregables Semanas 5-12
✅ 24 artículos publicados (2,400-3,000 palabras c/u)
✅ 24 lead magnets creados
✅ SEO optimizado al 100%
✅ Tráfico orgánico creciendo
✅ Curso de pago validado o descartado

---

## SEMANAS 13-16: OPTIMIZACIÓN + SCALING

### SEMANA 13: ANÁLISIS PROFUNDO
**Objetivo:** Entender qué funciona y qué no

**Lunes-Martes: Análisis de Datos [10h]**
- [ ] Exportar todos los datos (4 meses)
- [ ] Crear dashboard de métricas:
  - Tráfico por canal
  - Conversión por funnel
  - Email performance por arquetipo
  - Revenue por producto
  - CAC vs LTV
- [ ] Identificar top 3 performers
- [ ] Identificar top 3 bottlenecks

**Miércoles: Optimización Quick Wins [6h]**
- [ ] A/B test subject lines top 5 emails
- [ ] Mejorar copy de páginas baja conversión
- [ ] Optimizar CTAs bajo rendimiento
- [ ] Fix technical issues detectados

**Jueves-Viernes: Content Audit [8h]**
- [ ] Revisar rendimiento 24 artículos
- [ ] Actualizar top 5 para SEO
- [ ] Crear internal linking strategy
- [ ] Identificar contenido para expandir

**Total semana 13: 24h**

### SEMANA 14: PAID ACQUISITION
**Objetivo:** Escalar con ads rentables

**Lunes: Setup Google Ads [6h]**
- [ ] Crear cuenta Google Ads
- [ ] Configurar conversión tracking
- [ ] Keyword research (20 keywords)
- [ ] 3 campañas de búsqueda:
  - Manual del alojamiento
  - Automatización Airbnb
  - Curso para anfitriones
- [ ] Presupuesto test: 200€
- [ ] Escribir 5 ad copies por campaña

**Martes: Setup Facebook Ads [6h]**
- [ ] Crear Business Manager
- [ ] Instalar Facebook Pixel
- [ ] Configurar audiencias:
  - Look-alike test completado
  - Look-alike compradores
  - Interest targeting (anfitriones)
- [ ] 3 campañas:
  - Test de personalidad
  - Lead magnet descarga
  - Manual directo
- [ ] Presupuesto: 150€
- [ ] Crear 10 creatividades (Canva)

**Miércoles: Instagram + LinkedIn [4h]**
- [ ] Setup Instagram Ads (mismas audiences FB)
- [ ] Presupuesto: 100€
- [ ] Setup LinkedIn Ads (B2B angle)
- [ ] Presupuesto: 150€

**Jueves-Viernes: Monitoreo y Optimización [4h]**
- [ ] Revisar métricas diarias
- [ ] Pausar ads no rentables
- [ ] Escalar ads ganadores
- [ ] Ajustar presupuestos

**Total semana 14: 20h**

### SEMANA 15: UPSELLS Y CROSS-SELLS
**Objetivo:** Aumentar LTV de cada cliente

**Lunes: Estrategia de Bundles [5h]**
- [ ] Crear 3 bundles:
  1. Starter Pack: Test + Curso Gratis + Manual (49€)
  2. Pro Pack: Manual + Curso Pago + 30 días soporte (129€)
  3. Ultimate Pack: Todo + Consultoría 1:1 (299€)
- [ ] Diseñar páginas de bundle
- [ ] Configurar checkout con upsells

**Martes: Email Cross-Sell [5h]**
- [ ] Escribir 5 emails de cross-sell:
  - A compradores de Manual: Ofrecer curso
  - A curso gratis completado: Ofrecer curso pago
  - A test completado: Ofrecer manual
  - A curso pago: Ofrecer consultoría
  - A todos: Ofrecer bundles
- [ ] Configurar en ConvertKit
- [ ] A/B test subjects

**Miércoles: Programa de Referidos [6h]**
- [ ] Definir incentivos:
  - Referidor: 20% comisión (10€ por manual)
  - Referido: 10% descuento
- [ ] Crear página /referidos
- [ ] Sistema de tracking (código único)
- [ ] Email automático con link de referido
- [ ] Dashboard para ver referidos

**Jueves: One-Time Offers [4h]**
- [ ] OTO en thank you page test:
  - "Consigue tu manual ahora por 39€ (20% OFF)"
- [ ] OTO post-compra manual:
  - "Añade el curso por solo 79€ (20€ OFF)"
- [ ] Configurar en Stripe checkout

**Viernes: Testing [2h]**
- [ ] Test todos los flujos
- [ ] Verificar tracking de comisiones
- [ ] Enviar primer email cross-sell a base

**Total semana 15: 22h**

### SEMANA 16: REPORTING Y PLAN Q2
**Objetivo:** Cerrar trimestre y planificar siguiente

**Lunes: Dashboard Final [5h]**
- [ ] Crear dashboard ejecutivo:
  - Revenue total
  - Breakdown por producto
  - CAC por canal
  - LTV por segmento
  - Conversión por funnel
  - Email metrics
  - Content performance
- [ ] Exportar reportes
- [ ] Crear presentación

**Martes: Análisis ROI [5h]**
- [ ] Calcular ROI de cada iniciativa:
  - Email marketing: X% ROI
  - Blog/SEO: X% ROI
  - Paid ads: X% ROI
  - Lead magnets: X conversión
- [ ] Identificar mejor canal
- [ ] Identificar peor canal
- [ ] Decidir dónde invertir Q2

**Miércoles: Retrospectiva [4h]**
- [ ] ¿Qué funcionó bien?
- [ ] ¿Qué no funcionó?
- [ ] ¿Qué aprendimos?
- [ ] ¿Qué cambiaríamos?
- [ ] Documentar learnings

**Jueves: Plan Q2 [5h]**
- [ ] Objetivos trimestre 2:
  - Revenue goal
  - Usuarios goal
  - Contenido goal
- [ ] Priorización iniciativas Q2
- [ ] Presupuesto Q2
- [ ] Hiring needs
- [ ] Timeline Q2

**Viernes: Celebración + Descanso [1h]**
- [ ] Celebrar hitos conseguidos
- [ ] Compartir resultados con equipo
- [ ] Tomar 2-3 días off antes de Q2

**Total semana 16: 20h**

---

## 📊 MÉTRICAS OBJETIVO POR SEMANA

### Semanas 1-4 (Setup)
- ✅ 0 errores técnicos
- ✅ 30+ beta testers
- ✅ Email delivery rate >98%

### Semanas 5-8 (Contenido 1)
- ✅ 12 artículos publicados
- ✅ 100+ email subscribers/semana
- ✅ 500+ visitas blog/semana

### Semanas 9-12 (Contenido 2 + Validación)
- ✅ 24 artículos totales
- ✅ 200+ subscribers/semana
- ✅ 1,500+ visitas blog/semana
- ✅ 200+ lista espera curso

### Semanas 13-16 (Optimización)
- ✅ 500+ subscribers/semana
- ✅ 3,000+ visitas blog/semana
- ✅ 5-10 ventas/semana
- ✅ Revenue: 1,500-2,500€/semana

---

## 💰 INVERSIÓN TOTAL

### Software y Herramientas (4 meses)
- ConvertKit: 100€/mes × 4 = 400€
- Canva Pro: 15€/mes × 4 = 60€
- Herramientas SEO: 100€/mes × 4 = 400€
- Analytics tools: 50€/mes × 4 = 200€
**Subtotal: 1,060€**

### Contenido
- Diseñador gráfico (8 guías): 400€
- Corrector de textos: 200€
- Imágenes stock: 100€
**Subtotal: 700€**

### Ads (Semanas 13-16)
- Google Ads: 600€
- Facebook Ads: 450€
- Instagram Ads: 300€
- LinkedIn Ads: 450€
**Subtotal: 1,800€**

### Varios
- Dominios y hosting: 100€
- Imprevistos: 300€
**Subtotal: 400€**

### INVERSIÓN TOTAL: 3,960€

---

## 💵 PROYECCIÓN DE INGRESOS

### Mes 1-2 (Setup + Contenido)
- Ingresos: 500-1,000€
- Fuente: Ventas orgánicas manuales

### Mes 3 (Más contenido + Validación)
- Ingresos: 2,000-3,000€
- Fuente: Blog SEO + Email

### Mes 4 (Optimización + Scaling)
- Ingresos: 4,000-6,000€
- Fuente: Paid ads + Optimización funnels

### Total 4 meses: 6,500-10,000€
### ROI: 64% - 152%
### A partir de mes 5: 8,000-12,000€/mes

---

## ✅ CHECKLIST SEMANAL

Imprimir y usar cada semana:

```
SEMANA ___ : _____________________

PRIORIDAD 1 (Crítico):
[ ] _________________________
[ ] _________________________
[ ] _________________________

PRIORIDAD 2 (Importante):
[ ] _________________________
[ ] _________________________
[ ] _________________________

PRIORIDAD 3 (Nice to have):
[ ] _________________________
[ ] _________________________

MÉTRICAS SEMANA:
- Subscribers nuevos: ____
- Artículos publicados: ____
- Revenue: ____€
- Conversión funnel: ____%

BLOCKERS:
- _________________________
- _________________________

WINS:
- _________________________
- _________________________

LEARNINGS:
- _________________________
- _________________________

SIGUIENTE SEMANA:
- _________________________
- _________________________
```

---

## 🚨 SEÑALES DE ALERTA

**Detener y revisar si:**
- Email open rate <20%
- Conversión test → email <70%
- Bounce rate blog >70%
- CAC > LTV
- Churn >10%/mes
- Team burnout

**En estos casos:**
- Pausar producción nueva
- Focus en optimizar existente
- Analizar qué no funciona
- Iterar hasta resolver

---

## 🎯 FILOSOFÍA DE EJECUCIÓN

### Done is better than perfect
- Lanza rápido, itera después
- MVP primero, pulir después
- 80% es suficiente para v1

### Measure everything
- Sin datos, no hay decisiones
- Cada cambio, trackeado
- Weekly review non-negotiable

### Focus on bottleneck
- Identifica el cuello de botella
- Todo el esfuerzo ahí
- No optimices lo que funciona

### Ship weekly
- Algo nuevo cada semana
- Momentum es clave
- Pequeños wins suman

---

## 📞 ACCOUNTABILITY

**Check-ins:**
- Lunes 9am: Plan de semana
- Viernes 5pm: Review de semana
- Cada 2 semanas: Review con mentor/socio

**KPIs no negociables:**
- Publicar según calendario
- Métricas semanales documentadas
- ROI positivo en mes 4

---

## 🎉 CELEBRACIONES

**Hitos a celebrar:**
- ✅ Semana 1 completada sin bugs
- ✅ Primer subscriber orgánico
- ✅ Primera venta
- ✅ 100 subscribers
- ✅ 12 artículos publicados
- ✅ 1,000€ en un mes
- ✅ 24 artículos publicados
- ✅ Curso validado
- ✅ 5,000€ en un mes

**Cómo celebrar:**
- Comparte con el equipo
- Tómate medio día libre
- Documenta el win
- Agradece a quien ayudó

---

## 📚 RECURSOS NECESARIOS

### Herramientas Imprescindibles
- [ ] ConvertKit o Mailchimp
- [ ] Google Analytics
- [ ] Canva Pro
- [ ] Grammarly
- [ ] Ahrefs o Semrush
- [ ] Notion para gestión

### Skills Necesarios
- Copywriting email
- SEO básico-intermedio
- Diseño básico Canva
- Análisis de datos
- Project management

### Equipo (opcional pero recomendado)
- Corrector freelance (artículos)
- Diseñador gráfico (guías PDF)
- VA para tareas admin

---

## 🎓 PLAN B: Si Algo Sale Mal

### Scenario 1: Email deliverability issues
**Plan B:**
- Cambiar proveedor email
- Limpiar lista agresivamente
- Warm up gradual

### Scenario 2: Bajo rendimiento blog
**Plan B:**
- Doblar en paid acquisition
- Partnerships con influencers
- Guest posting en blogs grandes

### Scenario 3: Curso no validado
**Plan B:**
- Focus 100% en Manual
- Lanzar servicios consultoría
- Crear productos más pequeños (39€)

### Scenario 4: Burnout
**Plan B:**
- Pausar producción nueva
- Contratar ayuda
- Reducir scope a esencial

---

## 🚀 SIGUIENTE PASO: EMPEZAR MAÑANA

**Mañana a las 9am:**
1. Crear cuenta ConvertKit
2. Configurar dominio custom email
3. Crear primeros tags en sistema
4. Empezar a escribir primer email

**Esta noche antes de dormir:**
1. Leer este plan completo 2 veces
2. Imprimir checklist semana 1
3. Bloquear agenda próximas 4 semanas
4. Avisar a familia/amigos del sprint

---

**¿ESTÁS LISTO?**

Este plan te llevará de 0 a un sistema funcionando generando 5,000€+/mes en 16 semanas.

No es fácil. Pero es posible. Y este plan te muestra EXACTAMENTE cómo.

Ahora solo queda ejecutar.

Let's go. 🚀

---

*Plan creado: 2025-01-06*
*Inicio ejecución: [FECHA]*
*Última revisión: Cada viernes*
*Owner: Alejandro / Itineramio*
