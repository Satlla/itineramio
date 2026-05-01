# Dudas Abiertas + Mejoras Adicionales

**Documento vivo.** Surface de ideas que no están en V3 pero merecen atención.

---

## Parte A — Mejoras adicionales no contempladas en V3

### M1 — Email digest semanal/quincenal al host
Resumen automático cada lunes con valor entregado: *"Esta semana AlexAI gestionó 87 mensajes, te ahorró ~14h, los tópicos más preguntados fueron wifi, check-in, parking. Hubo 3 escalados que tuviste que gestionar tú."*
**Por qué**: refuerzo positivo del valor del producto. Reduce churn.
**Coste**: bajo (template + cron + agregaciones simples).
**Cuándo**: Fase 3 o como add-on de Fase 2.

### M2 — Score de "salud del manual"
Itineramio detecta qué preguntas escalan o tienen baja confianza por propiedad y propone al host: *"Tu manual no cubre 'cómo usar la lavadora' — 4 huéspedes preguntaron en 2 semanas. ¿Añadir zona?"*
**Por qué**: convierte feedback operativo en mejora del producto del cliente.
**Cuándo**: Fase 3.

### M3 — Onboarding asistido por IA al conectar PMS
Cuando un nuevo cliente conecta Hostaway/Beds24, AlexAI lee sus listings y propone manual base auto-generado. Reduce tiempo de onboarding de horas a minutos.
**Por qué**: la creación de manual es la mayor fricción de adopción. AlexAI puede pre-rellenarlo desde datos OTA.
**Cuándo**: Fase 4-5.

### M4 — Marketplace de templates de manual entre hosts (anonimizado)
*"Los 5 hosts más activos de Alicante recomiendan estas 12 zonas para piso turístico costero."* Network effect.
**Por qué**: viralidad + retención. Plantillas comunitarias.
**Cuándo**: Fase 5+.

### M5 — Dynamic pricing assistant básico
Análisis de Beds24 + ocupación + competencia → AlexAI sugiere ajustes: *"Tienes 3 noches libres en agosto, baja precio 8%."*
**Por qué**: valor incremental gratuito. No compite con Beyond/Wheelhouse (revenue management completo).
**Cuándo**: Fase 5+.

### M6 — Auto-respuesta de reviews públicos
AlexAI puede contestar reviews en Airbnb/Booking en nombre del host con su tono.
**Por qué**: reviews tarda mucho a los hosts, pierden impacto si se contestan tarde.
**Cuándo**: Fase 4-5.

### M7 — Smart escalation routing
Si host no responde a alerta crítica en 5 minutos → AlexAI escala automáticamente al co-host, limpiador, o llama por teléfono (Vapi outbound).
**Por qué**: protección frente a host no disponible en momento crítico.
**Cuándo**: Fase 5 (cuando esté Vapi).

### M8 — Modo demo interactivo para leads
Lead prueba AlexAI sin registrarse, hablando con un manual ficticio.
**Por qué**: reduce fricción de venta dramáticamente.
**Cuándo**: Fase 3-4 (paralelo a marketing).

### M9 — Deep link de WhatsApp en manual público
El manual público de cada propiedad tiene un botón "Habla con AlexAI por WhatsApp" que abre WhatsApp con el bot pre-cargado.
**Por qué**: empuja al huésped al canal con mejor UX (multimedia nativa).
**Cuándo**: Fase 2.

### M10 — Backup / export del manual del cliente
Botón "descargar todo mi manual" en JSON/PDF.
**Por qué**: reduce miedo al lock-in. Cumple GDPR (right to data portability).
**Cuándo**: Fase 3.

### M11 — Portal del propietario (Fase 4c)
Cuando el gestor maneja propiedades de propietarios terceros, esos propietarios tienen un login restringido donde ven SUS propiedades, ingresos, reviews.
**Por qué**: mejora relación gestor-propietario, transparencia, retención.
**Cuándo**: Fase 4c.

### M12 — A/B testing del tono de respuesta
Itineramio prueba 2 versiones de respuesta a misma pregunta, mide outcome (booking conversion, review score).
**Por qué**: mejora continua basada en datos.
**Cuándo**: Fase 5+.

### M13 — Programa de partners limpiadores
Integración con servicios de limpieza locales (que AlexAI ya coordina) → revenue share.
**Por qué**: revenue stream secundario + valor para el host.
**Cuándo**: Fase 5+.

### M14 — Recommendations API
El manual ya tiene "recomendaciones de la zona" (restaurantes, etc.). API para terceros (apps de turismo) → revenue stream secundario.
**Por qué**: monetización del activo manual.
**Cuándo**: Fase 5+ (cuando manual tenga masa crítica).

### M15 — Memoria de huéspedes repetidores con preferencias
*"Pedro vino hace 6 meses, le encantó el restaurante X que recomendaste, dale la bienvenida con eso."*
**Por qué**: hospitalidad personalizada que humaniza la IA.
**Cuándo**: Fase 3 (necesita historial acumulado).

---

## Parte B — Dudas estratégicas pendientes

### Q1 — Modelo de negocio del Itineramio Manual gratuito
El chatbot web actual de Itineramio. ¿Sigue gratuito o se vuelve premium con AlexAI? ¿Cómo gestionar el churn de free → pago?

### Q2 — Quién es customer support cuando AlexAI falla
Si AlexAI da respuesta mala y host se queja, ¿quién contesta? ¿Tú? ¿Equipo? No escala más allá de 20-30 clientes sin gente dedicada.

### Q3 — Plan de retiro si AlexAI no funciona como esperamos
¿Qué pasa si en 6 meses la calidad no es suficiente para auto-respuesta? ¿Pivot a SUGGEST permanente? ¿Devolución a clientes?

### Q4 — Relación con Itineramio actual (chatbot web)
¿El chatbot web actual desaparece, se mantiene, o se conecta a AlexAI? Si se mantiene, ¿son dos productos distintos?

### Q5 — Cohabitación con módulo `gestion/` existente
Ya hay `app/(dashboard)/gestion/` con reservas/facturación/clientes/liquidaciones. ¿Cómo se reconcilia con `Reservation` extendida del nuevo schema? ¿Migración? ¿Coexistencia?

### Q6 — Estado real de Verifactu / SII en el repo
Hay cron `verifactu-status` y migración `add_verifactu_support`. ¿Está realmente funcionando o es placeholder? ¿Quién es el cliente?

### Q7 — Naming: AlexAI vs alternativas
¿Por qué AlexAI específicamente? ¿No confunde con tu nombre (Alejandro)? Considerar alternativas: ItinerAI, Tina (asistente turismo), nombres neutros que no se asocien a una persona.

### Q8 — Propiedad intelectual del manual
Si cliente se va, ¿se lleva el manual? ¿Lo borras? ¿Lo conservas? Tema legal + UX.

### Q9 — Política de cancelación / refunds
Cliente cancela mid-month. ¿Refund parcial? Beds24 ya está pagado al mes. Política a definir.

### Q10 — Onboarding del host: Beta vs producto final
Durante Beta lo haces tú a mano. ¿Cuándo y cómo lo automatizas? Es trabajo en sí.

### Q11 — Regulación turística cambiando
Madrid, Barcelona endureciendo. ¿Cómo afecta TAM? ¿Se adapta a otros mercados (PT, IT, GR)?

### Q12 — B2C vs B2B del producto
Itineramio actual sirve a hosts individuales (B2C-ish). El nuevo apunta más al gestor profesional (B2B). ¿Cómo gestionar el cambio sin perder hosts pequeños actuales?

### Q13 — Equipo a futuro
Plan para añadir personas: customer success, ventas, dev. Sin plan, escalas hasta techo del founder.

### Q14 — Capital / runway
¿Itineramio se autofinancia con clientes Beta + tus propiedades, o necesita inversión? Capital limita roadmap.

### Q15 — Branding y posicionamiento
Cambio de "manual digital + chatbot" a "SO completo del host" es repositioning grande. ¿Cómo comunicarlo a usuarios actuales sin perderlos?

---

## Cómo procesar este documento

- **Mejoras (M1-M15)**: revisar al cierre de cada fase, decidir cuáles entran en la siguiente.
- **Dudas (Q1-Q15)**: convertir cada una en decisión documentada en `DECISIONS_LOG.md` cuando se cierre.
