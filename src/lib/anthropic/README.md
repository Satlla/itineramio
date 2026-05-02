# `src/lib/anthropic` — Singleton del SDK de Anthropic + helpers AlexAI

Cliente Claude para usar desde AlexAI (PR4 del roadmap). En este PR solo se entrega la infraestructura: singleton del SDK, helper con prompt caching configurado, errores tipados y tests.

**No se usa en runtime todavía.** Los endpoints existentes (`app/api/admin/blog/generate-ai/route.ts`, `app/api/cron/generate-daily/route.ts`) NO se tocan en este PR. Cuando se decida migrarlos, basta con sustituir el `fetch('https://api.anthropic.com/v1/messages')` por `getAnthropicClient().messages.create(...)`.

---

## Decisiones de diseño

### Singleton lazy
Cada `new Anthropic()` crea su propio HTTP keep-alive pool. En un servidor con muchas rutas que usan AlexAI conviene compartir un único pool entre llamadas para amortizar conexiones y socket reuse. Lazy init evita pagar el coste cuando ningún path activo lo necesita.

### Prompt caching como ciudadano de primera

`createCachedMessage` configura `cache_control: ephemeral` en dos sitios:

1. **System prompt** → cachea el system (y tools, si las hubiera) por 5 min (o 1h).
2. **Bloque de contexto del manual de propiedad** (primer mensaje de usuario) → cachea ese contexto durante una conversación con varias preguntas seguidas sobre la misma propiedad.

El mensaje del huésped va al final, sin marker — no contamina el cache.

**Invariante crítica**: el system prompt y el contexto deben ser **deterministas**. No interpolar `Date.now()`, UUIDs ni nada que cambie request a request — eso invalida el cache silenciosamente y `cacheReadInputTokens` queda en 0 sin error.

### Modelo: Sonnet 4.6 por defecto

`claude-sonnet-4-6` es el balance correcto coste/inteligencia/latencia para responder a huéspedes. No usar Opus por defecto — caro y latente para texto conversacional. Si AlexAI se enfrenta a un caso complejo (ej. resolver disputa, escalar con razonamiento), el caller puede pasar `model: 'claude-opus-4-7'` ad hoc.

### Adaptive thinking opt-in (no por default)

Para responder a un huésped por WhatsApp lo importante es la latencia. Adaptive thinking añade segundos de razonamiento. Por eso el default es `thinking: 'disabled'`; el caller pasa `thinking: 'adaptive'` cuando AlexAI realmente debe pensar antes de contestar.

Nota: en Sonnet 4.6 la sintaxis correcta es `thinking: {type: 'adaptive'}` — `budget_tokens` está deprecado en 4.6 y completamente removido en Opus 4.7.

### Errores tipados

- `AnthropicMissingApiKeyError` — propio, lanzado desde el singleton si falta la env var.
- Para errores HTTP del SDK (auth, rate limit, bad request, etc.), usamos las clases del propio SDK (`Anthropic.AuthenticationError`, `Anthropic.RateLimitError`, etc.) que ya son `instanceof` chequeables.
- `classifyAnthropicError(err)` devuelve un código discriminante (`'auth'`, `'rate_limit'`, `'overloaded'`, …) por si el caller prefiere un `switch` sobre string en lugar de cadena de `instanceof`.

---

## Uso

### Caso típico: AlexAI responde a un huésped

```typescript
import { createCachedMessage } from '@/lib/anthropic'

const result = await createCachedMessage({
  systemPrompt: ALEXAI_SYSTEM_PROMPT, // texto frozen, mismo en todos los requests
  propertyContext: buildPropertyContext(property), // estable durante la conversación
  guestMessage: '¿A qué hora es el check-in?',
})

console.log(result.text)
console.log('cache hit:', result.usage.cacheReadInputTokens > 0)
```

### Conversación multi-turn

```typescript
import type Anthropic from '@anthropic-ai/sdk'

const history: Anthropic.MessageParam[] = [
  { role: 'user', content: '¿A qué hora es el check-in?' },
  { role: 'assistant', content: 'A las 16:00. ¿Llegas más tarde?' },
]

const result = await createCachedMessage({
  systemPrompt: ALEXAI_SYSTEM_PROMPT,
  propertyContext: buildPropertyContext(property),
  conversationHistory: history,
  guestMessage: 'Sí, sobre las 22h. ¿Cómo entro?',
})
```

### Recovery de errores

```typescript
import { classifyAnthropicError } from '@/lib/anthropic'

try {
  const r = await createCachedMessage({ ... })
  return r.text
} catch (err) {
  switch (classifyAnthropicError(err)) {
    case 'rate_limit':
      // backoff + retry
      break
    case 'overloaded':
      // backoff + retry o degradar a respuesta canned
      break
    case 'auth':
    case 'missing_api_key':
      // alertar — no reintentar
      throw err
    default:
      throw err
  }
}
```

---

## Tests

```bash
npm test -- --run __tests__/lib/anthropic/
```

Los tests usan mocks del SDK de Anthropic (no hacen llamadas reales).

---

## Reglas operativas (recordatorio)

Aplicables cuando este módulo se empiece a importar en runtime:

- **Whitelist `ALEXAI_BETA_USERS`**: APIs que llamen aquí deben gatear con `isAlexAIBetaUser(user.email)` (ver `src/lib/feature-flags.ts`, PR2).
- **Feature flag por propiedad**: `Property.alexaiEnabled = false` por defecto (PR3).
- **Sin `console.log`**: usar `logger.ts`.
- **Observabilidad**: log estructurado con `tenantUserId` y métricas de cache hit rate (`cacheReadInputTokens > 0`).

Ver `docs/BRIEF_V3_ALEXAI_BEDS24.md` sección 7.
