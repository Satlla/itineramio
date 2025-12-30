# Estrategia de Test: 3 Lead Magnets
## Objetivo: Validar captación de usuarios vía blog antes del lanzamiento (1 Enero 2026)

---

## Selección de Lead Magnets a Testear

### Criterios de selección:
1. **Volumen de búsqueda** - Keywords con tráfico potencial
2. **Intent de compra** - Usuarios que necesitan solución
3. **Diferenciación** - Lo que no ofrece la competencia
4. **Ya tienes secuencia de email** - Listo para activar

### Los 3 Lead Magnets Recomendados:

| # | Lead Magnet | Por qué | Keyword Target | Vol. Est. |
|---|-------------|---------|----------------|-----------|
| 1 | **Generador de Plantilla de Reviews** | Pain point ENORME, nadie lo tiene | "plantilla responder reseñas airbnb" | Medio-Alto |
| 2 | **Generador de Normas de Casa** | Muy buscado, fácil de crear | "normas casa airbnb plantilla" | Alto |
| 3 | **Calculadora ROI Alquiler Vacacional** | Decisores, alto intent | "rentabilidad alquiler vacacional calculadora" | Medio |

---

## Estructura del Test (90 días)

### Fase 1: Setup (Semanas 1-2)

#### Semana 1: Activar herramientas
- [ ] Activar `/hub/tools/house-rules` con lead capture
- [ ] Crear `/hub/tools/review-templates` (nuevo)
- [ ] Activar `/hub/tools/roi-calculator` con lead capture
- [ ] Conectar secuencias de email existentes

#### Semana 2: Contenido SEO
- [ ] Artículo blog: "Cómo responder reseñas negativas en Airbnb [+ Plantillas]"
- [ ] Artículo blog: "Normas de casa Airbnb: Guía + Generador gratuito"
- [ ] Artículo blog: "Calculadora rentabilidad alquiler vacacional 2025"
- [ ] Internal linking desde artículos existentes

### Fase 2: Distribución (Semanas 3-6)

#### Canales orgánicos (gratis):
- [ ] Compartir en grupos de Facebook de hosts
- [ ] Posts en LinkedIn (3x semana)
- [ ] Responder en Reddit r/AirBnB con enlace útil
- [ ] Quora: respuestas con link a herramienta
- [ ] Comentarios en blogs de la competencia

#### Contenido social:
- [ ] Carrusel Instagram: "5 errores al responder reseñas"
- [ ] Video corto: Demo de generador de normas (30s)
- [ ] Thread Twitter: "Por qué las normas claras = mejores huéspedes"

### Fase 3: Medición (Semanas 7-12)

#### KPIs a trackear:

| Métrica | Herramienta | Meta mínima |
|---------|-------------|-------------|
| Visitas a herramienta | Analytics | 500/mes |
| Leads capturados | DB/CRM | 50/mes |
| Tasa de conversión | Lead/Visita | >10% |
| Open rate emails | Resend | >40% |
| Click rate emails | Resend | >10% |
| Conversión a registro | Lead→Signup | >5% |

---

## Implementación Técnica

### 1. Review Templates Generator (NUEVO)

**Funcionalidad:**
```
Input:
- Tipo de reseña (positiva, negativa, neutral)
- Tema principal (limpieza, ubicación, comunicación, etc.)
- Nombre del huésped
- Tono (profesional, amigable, formal)

Output:
- 3 variantes de respuesta personalizadas
- Copiar al portapapeles
- Descargar como PDF (con lead capture)
```

**Lead Magnet Extra:**
- PDF: "15 Plantillas de Respuesta a Reseñas + Estrategia 5 estrellas"
- Trigger: Al generar 2+ respuestas

### 2. House Rules Generator (YA EXISTE - activar)

**Mejoras para lead capture:**
- Añadir opción "Descargar PDF profesional"
- Versión multiidioma (ES, EN, FR, DE)
- Trigger: Al completar normas

**Lead Magnet Extra:**
- PDF: "Checklist legal normas casa por comunidad autónoma"

### 3. ROI Calculator (YA EXISTE - activar)

**Mejoras para lead capture:**
- Reporte PDF personalizado con proyección 12 meses
- Comparativa "Con vs Sin Itineramio"
- Trigger: Al calcular ROI

**Lead Magnet Extra:**
- Excel: "Plantilla control gastos alquiler vacacional"

---

## Flujo de Captación

```
                    TRÁFICO
                       │
    ┌──────────────────┼──────────────────┐
    │                  │                  │
    ▼                  ▼                  ▼
[Blog SEO]      [Redes Social]      [Grupos FB]
    │                  │                  │
    └──────────────────┼──────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  HERRAMIENTA   │
              │  (uso gratis)  │
              └───────┬────────┘
                      │
                      ▼
           ┌─────────────────────┐
           │ TRIGGER LEAD CAPTURE │
           │ "Descargar PDF"     │
           │ "Guardar resultado" │
           └──────────┬──────────┘
                      │
                      ▼
              ┌───────────────┐
              │ EMAIL + NOMBRE │
              │ (Modal)       │
              └───────┬───────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │   SECUENCIA 5 EMAILS    │
        │                         │
        │ Día 0: Entrega recurso  │
        │ Día 2: Errores comunes  │
        │ Día 4: Caso de éxito    │
        │ Día 6: Recurso extra    │
        │ Día 8: Oferta producto  │
        └───────────┬─────────────┘
                    │
                    ▼
           ┌─────────────────┐
           │ REGISTRO TRIAL  │
           │ itineramio.com  │
           └─────────────────┘
```

---

## Calendario de Ejecución

### Enero 2025
| Semana | Acción | Responsable |
|--------|--------|-------------|
| 1 | Setup técnico herramientas | Dev |
| 2 | Crear artículos SEO (3) | Content |
| 3 | Diseñar PDFs lead magnets | Design |
| 4 | Activar secuencias email | Marketing |

### Febrero 2025
| Semana | Acción | Responsable |
|--------|--------|-------------|
| 5 | Lanzar en grupos FB | Marketing |
| 6 | Primeros posts LinkedIn | Marketing |
| 7 | Analizar primeros datos | Analytics |
| 8 | Optimizar según datos | All |

### Marzo 2025
| Semana | Acción | Responsable |
|--------|--------|-------------|
| 9-10 | Escalar lo que funciona | Marketing |
| 11 | A/B test copys lead capture | Marketing |
| 12 | Reporte final + decisiones | All |

---

## Métricas de Éxito (90 días)

### Éxito = Validado para escalar
| Métrica | Meta | Resultado = GO |
|---------|------|----------------|
| Leads totales | 150+ | Escalar con ads |
| Conversión a trial | 5%+ | Modelo funciona |
| CAC orgánico | <5€ | Rentable |
| NPS leads | >30 | Contenido valioso |

### Fracaso = Pivotar
| Señal | Acción |
|-------|--------|
| <50 leads en 90 días | Cambiar keywords/herramientas |
| <2% conversión trial | Revisar secuencia emails |
| >80% bounce herramienta | Mejorar UX/valor |

---

## Presupuesto Test (90 días)

| Item | Costo |
|------|-------|
| Desarrollo (ya existente) | 0€ |
| Contenido blog (3 artículos) | 0€ (in-house) |
| Diseño PDFs | 0-100€ |
| Herramientas email (Resend) | ~20€/mes |
| **TOTAL** | **60-160€** |

---

## Herramientas de Tracking

### Analytics a configurar:
1. **Google Analytics 4**
   - Eventos: `tool_used`, `lead_captured`, `email_sent`
   - Conversiones: `trial_started`

2. **Facebook Pixel** (ya tienes)
   - Lead event en LeadCaptureModal ✓

3. **Base de datos**
   - Tabla `tool_leads` con: tool_name, email, created_at, converted_at

4. **Dashboard simple**
   - Leads por herramienta/día
   - Funnel: Visita → Lead → Trial → Pago

---

## Próximos Pasos Inmediatos

### Esta semana:
1. [ ] Decidir si crear Review Templates o usar otra herramienta existente
2. [ ] Activar House Rules en el hub (cambiar href y active)
3. [ ] Activar ROI Calculator en el hub
4. [ ] Verificar que secuencias de email funcionan

### Siguiente semana:
1. [ ] Escribir primer artículo SEO (el de mayor volumen)
2. [ ] Crear PDF del lead magnet asociado
3. [ ] Configurar tracking de eventos

---

## Notas

- **Foco en validación, no perfección** - MVP de cada herramienta
- **Datos > Opiniones** - Dejar que los números decidan qué escalar
- **Iterar rápido** - Cambios semanales según resultados
- **Documentar aprendizajes** - Para el lanzamiento de enero 2026

---

*Documento creado: Diciembre 2025*
*Período de test: Enero - Marzo 2025*
*Revisión: Semanal*
