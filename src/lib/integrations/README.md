# `src/lib/integrations` — External Integration Adapters

Contrato común para que el core de Itineramio interactúe con cualquier PMS / channel manager (Beds24, Hostaway, Hospitable, Avantio, Lodgify, Smoobu, etc.) sin acoplarse al proveedor.

**Estado actual (PR2)**: solo contratos (interfaces, tipos, capability matrix). Cero implementaciones de adapters todavía. Las implementaciones llegan en:

- **PR6+** — `Beds24MasterAdapter` (scope=MASTER, multi-tenant)
- **Fase 4b** — `HostawayAdapter` (PER_USER)
- **Fase 5** — Hospitable, Avantio, Lodgify, Smoobu (PER_USER)

---

## Regla de diseño

> El core de Itineramio NUNCA importa un adapter concreto. Solo habla con la interface `ExternalIntegrationAdapter`. Los adapters traducen entre el modelo normalizado de Itineramio y la API/quirks de cada proveedor.

Este módulo es la frontera. Cruzarla con conocimiento específico de un proveedor (ej. `if (provider === 'BEDS24')` en `app/`) es una violación del contrato y debe revisarse en code review.

---

## Estructura

```
src/lib/integrations/
  types.ts         — interface ExternalIntegrationAdapter + tipos normalizados
  capabilities.ts  — AdapterCapabilities + matriz por proveedor
  index.ts         — barrel export (lo que el resto del repo consume)
  README.md        — este archivo
```

---

## Uso típico (cuando haya adapters implementados)

```typescript
import {
  ExternalIntegrationAdapter,
  hasCapability,
  PROVIDER_CAPABILITIES,
} from '@/lib/integrations'

// El core recibe un adapter ya construido (factory en futura PR).
function syncReservations(adapter: ExternalIntegrationAdapter) {
  const caps = adapter.getCapabilities()

  if (!hasCapability(caps, 'supportsReservations')) {
    // Degradar gracefully — avisar al usuario que este PMS no soporta sync.
    return
  }

  return adapter.pullReservations({ modifiedSince: lastSyncAt })
}
```

---

## Capabilities matrix

`PROVIDER_CAPABILITIES` declara qué soporta cada proveedor (full / partial / none) para cada feature: reservas, mensajería por canal (Airbnb / Booking / Expedia / VRBO), webhooks, sync calendario, etc.

La matriz se consulta en runtime, no se hardcodea. El onboarding del cliente debe avisar honestamente cuando un PMS limita el alcance (p.ej. Lodgify: AlexAI solo puede operar en WhatsApp y voz, no en OTAs).

Cuando se implementa un adapter concreto, su `getCapabilities()` debe devolver el mismo objeto que `PROVIDER_CAPABILITIES[provider]` salvo que el adapter detecte en runtime que ciertas capabilities están degradadas para esa cuenta concreta (ej. plan limitado del proveedor).

---

## Errores tipados

Los adapters concretos deben lanzar errores tipados de los que están en `types.ts`:

| Error | Cuándo | Recovery del core |
|---|---|---|
| `AdapterAuthError` | Credenciales inválidas, token expirado sin refresh posible | Marcar `IntegrationStatus.ERROR_AUTH`, notificar usuario |
| `AdapterRateLimitError` | API rate limit hit | Backoff + retry según `retryAfterSeconds` |
| `AdapterCapabilityError` | El core llamó a una operación no soportada por este adapter | Bug del core — log + alertar (no debería ocurrir si caps se respetan) |
| `AdapterNotImplementedError` | Método del contrato sin implementar (placeholder) | Solo en desarrollo, no debe llegar a prod |
| `AdapterTenantMismatchError` | Operación cross-tenant detectada (scope=MASTER) | Bug crítico — abortar inmediatamente, log de seguridad |
| `AdapterConsentRequiredError` | `consentConfirmed=false` en mapping co-host | Pausar sync, pedir consentimiento al owner |

---

## Decisiones cerradas relacionadas

- **D17** — Credenciales externas se cifran con env var `HOST_CREDENTIALS_ENCRYPTION_KEY` separada (no reusar `JWT_SECRET`). Se descifran en el adapter context, nunca persisten en plano.
- **D18** — El chatbot existente (`src/lib/chatbot-utils.ts`, `app/api/chatbot/route.ts`) NO se toca. AlexAI lo COMPLEMENTA, no lo reemplaza.
- **D19** — Calendar sync solo con datos reales de plataformas conectadas. Sin iCal genérico.

Ver `docs/DECISIONS_LOG.md` para contexto completo.

---

## Reglas operativas (de `docs/BRIEF_V3_ALEXAI_BEDS24.md` sección 7)

Aplicables a cualquier adapter futuro:

1. **Aditivo only**: el schema crece, nunca rompe.
2. **Whitelist `ALEXAI_BETA_USERS`**: APIs y crons del módulo gateadas por `isAlexAIBetaUser(user.email)` (ver `src/lib/feature-flags.ts`).
3. **Feature flag por propiedad**: `Property.alexaiEnabled = false` por defecto.
4. **Shadow mode antes de auto**: empezamos en `SUGGEST` siempre.
5. **Co-host bloqueo hard**: `consentConfirmed=false` → sync pausado a nivel BD.
6. **Aislamiento multi-tenant**: en `scope=MASTER`, todos los queries filtran por `tenantUserId` siempre vía `withTenant()` helper (PR-MT).
7. **Observabilidad día uno**: log estructurado con `tenantUserId` en cada operación del adapter.
