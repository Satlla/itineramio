# `src/lib/embeddings/`

Semantic search over zone manual content. Complements the existing
keyword-based ranking in `src/lib/chatbot-utils.ts` (`QUERY_EXPANSIONS`).

**Status:** Foundation (PR1). The chatbot in production is NOT modified.
This module is used by AlexAI (Beta, gated by `ALEXAI_BETA_USERS`).

---

## When to use this

The existing chatbot has a keyword expansion dictionary with ~600 entries
covering 6+ languages. It works well for typical queries (`wifi`, `parking`,
`check-in`). It struggles when the user asks something abstract or in a
language we don't have keywords for.

This module adds a **complementary** semantic layer:

- Keyword search (`chatbot-utils.ts`) is fast, free, and well-known.
- Semantic search (this module) catches abstract or unusual phrasings.
- Best practice: run keyword first, fall back to semantic when keyword
  confidence is low.

## Setup

### 1. Environment

```bash
OPENAI_API_KEY=sk-...
```

Required for embedding generation. Add to Vercel + `.env.local`.

### 2. Database extension

The migration in `prisma/migrations/20260502_add_pgvector_zone_embeddings/`
creates the `vector` extension. Apply with:

```bash
npx prisma migrate dev   # local
# or
npx prisma migrate deploy   # production (review first)
```

If your Neon plan does not have pgvector available by default, contact
support or upgrade the project.

### 3. Generate embeddings for existing zones

There is no automatic batch backfill in PR1. Generate manually for a
property:

```typescript
import { generateEmbeddingsForProperty } from '@/lib/embeddings'

const result = await generateEmbeddingsForProperty('property-id-here')
console.log(result)  // { total, created, updated, skipped, failed, details }
```

A scheduled job for automatic regeneration on zone updates lands in PR2 / PR9.

## Usage

### Generating an embedding

```typescript
import { generateZoneEmbedding } from '@/lib/embeddings'

const result = await generateZoneEmbedding('zone-id')
// → { status: 'created' | 'updated' | 'skipped' | 'failed', ... }
```

The function is idempotent: it computes a SHA256 hash of the source content
and skips API calls if the hash matches the existing embedding.

### Searching similar zones

```typescript
import { searchSimilarZones } from '@/lib/embeddings'

const results = await searchSimilarZones('how do I turn on the heating?', {
  propertyId: 'property-id-here',
  tenantUserId: 'host-user-id',  // recommended for safety
  limit: 5,
  minSimilarity: 0.4,  // 0-1, higher = stricter
})
// → [{ zoneId, similarity, sourcePreview }, ...]
```

**ALWAYS pass `tenantUserId` in production.** Without it, results can leak
across tenants.

## Design notes

### Why OpenAI text-embedding-3-small?

- 1536 dimensions, $0.02 per million tokens (very cheap).
- Industry standard, broad language coverage.
- Easy to swap (see `client.ts`) if Voyage / Cohere prove better.

### Why pgvector + HNSW?

- HNSW gives sub-linear query time → suitable for production latency.
- `vector_cosine_ops` matches OpenAI embeddings (cosine similarity).
- Native to Postgres → no separate vector DB to maintain.

### Why hash-based skip?

- Embeddings cost money per call (cents at small scale, dollars at large).
- Most zone updates don't change the canonical text (e.g. visual edits).
- SHA256 over the serialized text catches every meaningful change.

### Multi-language strategy

Embeddings generated in **Spanish only** (canonical). Queries in other
languages should be translated to Spanish before searching. This keeps the
embedding space coherent.

## Files

| File | Purpose |
|---|---|
| `client.ts` | OpenAI client + thin wrapper. Swap providers here. |
| `serializer.ts` | Zone → plain text. Pure logic, easy to unit test. |
| `generator.ts` | Orchestrator: fetch zone, serialize, embed, upsert. |
| `search.ts` | Semantic search via pgvector cosine distance. |
| `index.ts` | Public surface re-exports. |

## Testing

Unit tests for serializer (pure logic) at
`__tests__/lib/embeddings/serializer.test.ts`. Run with:

```bash
npm run test
```

Integration tests (with real DB + OpenAI) are out of scope for PR1.
They land in PR2 when AlexAI pipeline begins consuming this module.
