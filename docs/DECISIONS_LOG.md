# Log de Decisiones — Itineramio + AlexAI + Beds24

**Documento vivo.** Se actualiza con cada decisión arquitectónica o estratégica relevante.

---

## D1 — Beds24 como adapter principal en lugar de SuiteClerk
**Fecha**: 2026-05-01 (sesión V2)
**Decisión**: Beds24 sustituye a SuiteClerk como adapter PMS principal en Fase 2.
**Por qué**: SuiteClerk no expone messaging API. Beds24 sí, con cobertura Airbnb + Booking + Expedia + Vrbo certificada (Preferred+ Software Partner Airbnb 2025, Booking Premier 10 años, Elite Expedia, Preferred Vrbo).
**Alternativas consideradas**: WuBook (solo Airbnb messaging), Hostaway/Hospitable (mismo nivel pero Beds24 tiene mejor cobertura España).
**Impacto**: cobertura 100% de canales del huésped en v1, no solo WhatsApp.

## D2 — Modelo B (white-label master) en lugar de Modelo A (BYO)
**Fecha**: 2026-05-01 (sesión V2/V3)
**Decisión**: Itineramio contrata Beds24 Properties Manager como cuenta master. Clientes viven en sub-cuentas y nunca ven Beds24.
**Por qué**: UX dramáticamente más simple. Onboarding único. Cliente percibe Itineramio como SaaS completo, no como capa sobre Beds24.
**Alternativas consideradas**:
- Modelo A (BYO Beds24 por cliente): UX peor pero menor riesgo arquitectónico.
- Modelo C (certificación directa Itineramio↔OTAs): inviable hoy, requiere 500-1000+ propiedades operativas y 2-3 años.

**Sujeto a**: validación legal de Beds24 (R1). Plan B preparado: si dicen no, switch a `scope=PER_USER` puro sin perder código.

## D3 — Adapter pattern con `ExternalIntegrationAdapter` interface
**Fecha**: 2026-05-01
**Decisión**: el core de Itineramio NO conoce el proveedor concreto. Habla con interface común. Adapters por proveedor.
**Por qué**: añadir un proveedor nuevo en el futuro = 1-2 semanas, no 2 meses. Permite servir tanto a clientes con PMS propio (Hostaway, Hospitable, etc.) como sin PMS (Beds24 master).
**Implicación**: PR2 prioriza diseño de interface antes de implementar Beds24. 2-3 días bien invertidos.

## D4 — WhatsApp del host como interfaz operativa principal
**Fecha**: 2026-05-01
**Decisión**: Itineramio NO construye app móvil propia. WhatsApp Business del host es la interfaz operativa diaria. Itineramio web es centro de configuración + analytics.
**Por qué**:
- Hostaway/Hospitable/Smoobu compiten con apps móviles propias. Construir igual = competir desde atrás.
- Host ya pasa el día en WhatsApp. Cero fricción.
- Notificaciones nativas, cross-platform por defecto.
- Convierte limitación (no app) en posicionamiento ("tu host AI vive en tu WhatsApp").

**Alternativas consideradas**: PWA, app nativa iOS+Android, app web responsive. Roadmap: PWA en Fase 4a, app nativa solo si tracción justifica (año 2+).

## D5 — Cobertura compliance España como diferenciador local
**Fecha**: 2026-05-01
**Decisión**: SES.HOSPEDAJES (registro viajeros), tasa turística por CCAA, modelo 179 son features de primera clase, no add-ons.
**Por qué**: ningún competidor americano (Hospitable, Hostaway) lo hace bien. Defensa local real frente a Avantio/Icnea españoles que no tienen IA.
**Implicación**: Fase 3 incluye SES.HOSPEDAJES (con consulta legal previa de Alejandro). Modelo 179 movido a Fase 5+.

## D6 — Modos múltiples de AlexAI (no binario on/off)
**Fecha**: 2026-05-01
**Decisión**: AlexAI tiene 5 modos: OFF / SUGGEST / AUTO_SELECTIVE / AUTO_FULL / HYBRID_SCHEDULE. Reglas de escalado obligatorio en críticos no desactivables.
**Por qué**: la confianza se construye gradualmente y por categorías. Forzar binary auto/manual rompe la adopción.
**Implicación**: el host pasa progresivamente de SUGGEST a AUTO_SELECTIVE a AUTO_FULL conforme valida calidad. Cada edición de draft es training data.

## D7 — Dos SKUs de pricing (Standalone vs Connect)
**Fecha**: 2026-05-01
**Decisión**: Itineramio Standalone (50-80€/prop/mes, Beds24 incluido) para clientes sin PMS. Itineramio Connect (30-50€/prop/mes, BYO PMS) para clientes con PMS existente.
**Por qué**: la arquitectura adapter habilita esta segmentación naturalmente. Cada SKU cubre un segmento de mercado distinto sin canibalizarse.
**Implicación**: implementar billing diferenciado en Fase 4-5. Por ahora suficiente con modelo de datos preparado.

## D8 — Aditivo only en migraciones (no negociable)
**Fecha**: 2026-05-01
**Decisión**: nunca borrar/modificar columnas existentes en producción. Solo añadir.
**Por qué**: Itineramio en producción ya tiene usuarios reales (incluido Alejandro + clienta). El miedo a romper era legítimo, esta regla lo elimina.
**Implicación**: rename `ChatbotConversation → GuestConversation` se hace con `@@map` (cambio lógico, tabla BD intacta), no con ALTER TABLE.

## D9 — `PR-MT` (tenant isolation primitives) como Fase 1.5 dedicada
**Fecha**: 2026-05-01 (sesión V3)
**Decisión**: tenant isolation no es trabajo distribuido, es PR dedicado bloqueante para PR6.
**Por qué**: improvisar isolation PR a PR = bug en producción = data leak entre clientes. Coste ~3-4 semanas adicionales que SE SUMAN a Fase 2.
**Alternativas consideradas**: hacerlo distribuido en cada PR. Descartado: las primitivas se quedan inconsistentes y los tests no se centralizan.

## D10 — Estimación honesta Fase 2 (12-16 semanas, no 5-7)
**Fecha**: 2026-05-01 (sesión V3)
**Decisión**: estimación V3 reconoce 12-16 semanas para PR6-PR11 (15-20 semanas con tenant isolation distribuido + auditoría final).
**Por qué**: la estimación V2 (5-7 semanas) era optimista. V3 incluye buffer realista (Beta iteration, code review, espera plantillas Meta hasta 7 días, edge cases Beds24, etc.).
**Implicación**: si se necesita acortar plazo, recortar alcance (posponer PR11 workflows a Fase 3) en lugar de meter prisa al equipo.

## D11 — Validación legal Beds24 como bloqueante explícito
**Fecha**: 2026-05-01 (sesión V3)
**Decisión**: PR6 (implementación Beds24MasterAdapter) no arranca sin confirmación escrita de Beds24 sobre uso comercial multi-tenant.
**Por qué**: comprometer arquitectura sin validación = código tirado si dicen no.
**Mitigación**: PR2-PR5 + PR-MT son agnósticos al modelo, pueden avanzar en paralelo a la espera. Plan B (PER_USER puro) preparado.

## D12 — Fase 4 split en sub-fases independientes
**Fecha**: 2026-05-01 (sesión V3)
**Decisión**: Fase 4 se divide en 4a (PWA), 4b (HostawayAdapter), 4c (gestión económica). 4c con precondiciones explícitas.
**Por qué**: cada sub-fase tiene drivers distintos. 4c es módulo regulado de facturación AEAT, no se construye sobre suposiciones.
**Precondiciones 4c**: 10-20 clientes piloto operativos + asesor fiscal contratado + epígrafe IAE verificado + diseño AEAT-compliant validado.
**Hallazgo importante**: el repo ya tiene `app/(dashboard)/gestion/` con reservas/facturación/clientes/liquidaciones y cron `verifactu-status`. Fase 4c es **integrar AlexAI + reservas externas con módulo existente**, no construir desde cero.

## D13 — Co-host: bloqueo hard, no warning
**Fecha**: 2026-05-01
**Decisión**: si `hostRole != OWNER` y `consentConfirmed = false`, el adapter bloquea sync a nivel BD.
**Por qué**: checkbox auto-atestado de "tengo consentimiento del propietario" es legalmente flojo. Bloqueo BD es defensa real.
**Implicación**: la UI muestra disclaimer + checkbox, pero la BD enforce el bloqueo. Tampering de UI no salta el bloqueo.

## D14 — Documentación desactualizada en CLAUDE.md detectada
**Fecha**: 2026-05-01 (sesión V3 verificación)
**Hallazgo**: CLAUDE.md decía 1.495 console.logs / 460 endpoints / 128 modelos / 176 tests. Realidad: 3 console.logs (legítimos) / 525 endpoints / 131 modelos / 15 archivos test.
**Implicación**: la deuda técnica es menor de lo que asumíamos. Estimación 12-16 semanas ligeramente optimizable. Auditoría rápida del repo antes de PR2 recomendada.

---

## Decisiones pendientes de tomar

- **D-pend-1**: política de propiedad del manual cuando cliente se va.
- **D-pend-2**: política de cancelación / refunds parciales.
- **D-pend-3**: customer support escalation (cuándo y cómo añadir personas).
- **D-pend-4**: estrategia de comunicación a usuarios actuales sobre cambio de positioning ("manual digital" → "SO completo del host").
- **D-pend-5**: branding — confirmar nombre AlexAI vs alternativas. ¿Por qué AlexAI y no ItinerAI o similar?
