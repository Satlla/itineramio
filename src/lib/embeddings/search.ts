/**
 * Semantic zone search — finds zones similar to a given query.
 *
 * Uses pgvector cosine distance (operator <=>) with HNSW index for sub-linear
 * lookup. Returns zones ordered by similarity, optionally filtered by property
 * and similarity threshold.
 *
 * IMPORTANT: This complements the existing keyword-based ranking in
 * chatbot-utils.ts (QUERY_EXPANSIONS). It does NOT replace it. The recommended
 * pattern is:
 *   1. Run keyword ranking first (fast, free, well-known).
 *   2. If keyword score is below confidence threshold, fall back to semantic.
 *   3. Merge results (e.g. take union, dedup, re-rank by combined score).
 */

import { prisma } from '../prisma'
import { embedText } from './client'

export interface SimilarZone {
  zoneId: string
  /** Cosine similarity in [0, 1]. Higher = more similar. Computed as 1 - cosine_distance. */
  similarity: number
  /** First 200 chars of the source text used to embed this zone. Useful for debugging. */
  sourcePreview: string | null
}

export interface SearchOptions {
  /** Restrict search to zones of a specific property. Strongly recommended. */
  propertyId?: string

  /** Restrict to zones of a specific tenant (Property.hostId). Use for multi-tenant safety. */
  tenantUserId?: string

  /** Maximum results to return. Default: 5. */
  limit?: number

  /** Minimum cosine similarity threshold (0-1). Below this, results are dropped. Default: 0.3. */
  minSimilarity?: number
}

/**
 * Search zones semantically similar to the given query text.
 *
 * Returns an empty array if no zones match the threshold or the query is empty.
 * Throws only on infrastructure errors (DB down, embedding API failure).
 */
export async function searchSimilarZones(
  query: string,
  options: SearchOptions = {},
): Promise<SimilarZone[]> {
  const trimmed = query.trim()
  if (trimmed.length === 0) return []

  const { propertyId, tenantUserId, limit = 5, minSimilarity = 0.3 } = options

  // Generate embedding for the query
  const queryVector = await embedText(trimmed)
  const queryLiteral = `[${queryVector.join(',')}]`

  // Build WHERE clauses dynamically.
  // Note: Prisma's $queryRaw template literals handle parameterization safely.
  const maxDistance = 1 - minSimilarity

  if (propertyId && tenantUserId) {
    const rows = await prisma.$queryRaw<Array<{ zoneId: string; distance: number; sourcePreview: string | null }>>`
      SELECT
        ze."zoneId" AS "zoneId",
        (ze."embedding" <=> ${queryLiteral}::vector) AS distance,
        ze."sourcePreview" AS "sourcePreview"
      FROM "zone_embeddings" ze
      INNER JOIN "zones" z ON z.id = ze."zoneId"
      WHERE z."propertyId" = ${propertyId}
        AND ze."tenantUserId" = ${tenantUserId}
        AND (ze."embedding" <=> ${queryLiteral}::vector) <= ${maxDistance}
      ORDER BY ze."embedding" <=> ${queryLiteral}::vector
      LIMIT ${limit}
    `
    return rows.map(r => ({
      zoneId: r.zoneId,
      similarity: 1 - r.distance,
      sourcePreview: r.sourcePreview,
    }))
  }

  if (propertyId) {
    const rows = await prisma.$queryRaw<Array<{ zoneId: string; distance: number; sourcePreview: string | null }>>`
      SELECT
        ze."zoneId" AS "zoneId",
        (ze."embedding" <=> ${queryLiteral}::vector) AS distance,
        ze."sourcePreview" AS "sourcePreview"
      FROM "zone_embeddings" ze
      INNER JOIN "zones" z ON z.id = ze."zoneId"
      WHERE z."propertyId" = ${propertyId}
        AND (ze."embedding" <=> ${queryLiteral}::vector) <= ${maxDistance}
      ORDER BY ze."embedding" <=> ${queryLiteral}::vector
      LIMIT ${limit}
    `
    return rows.map(r => ({
      zoneId: r.zoneId,
      similarity: 1 - r.distance,
      sourcePreview: r.sourcePreview,
    }))
  }

  if (tenantUserId) {
    const rows = await prisma.$queryRaw<Array<{ zoneId: string; distance: number; sourcePreview: string | null }>>`
      SELECT
        ze."zoneId" AS "zoneId",
        (ze."embedding" <=> ${queryLiteral}::vector) AS distance,
        ze."sourcePreview" AS "sourcePreview"
      FROM "zone_embeddings" ze
      WHERE ze."tenantUserId" = ${tenantUserId}
        AND (ze."embedding" <=> ${queryLiteral}::vector) <= ${maxDistance}
      ORDER BY ze."embedding" <=> ${queryLiteral}::vector
      LIMIT ${limit}
    `
    return rows.map(r => ({
      zoneId: r.zoneId,
      similarity: 1 - r.distance,
      sourcePreview: r.sourcePreview,
    }))
  }

  // No filters: search across all (use carefully, multi-tenant exposure risk).
  // Restricted: this branch should only be used by admin tools or tests.
  const rows = await prisma.$queryRaw<Array<{ zoneId: string; distance: number; sourcePreview: string | null }>>`
    SELECT
      ze."zoneId" AS "zoneId",
      (ze."embedding" <=> ${queryLiteral}::vector) AS distance,
      ze."sourcePreview" AS "sourcePreview"
    FROM "zone_embeddings" ze
    WHERE (ze."embedding" <=> ${queryLiteral}::vector) <= ${maxDistance}
    ORDER BY ze."embedding" <=> ${queryLiteral}::vector
    LIMIT ${limit}
  `
  return rows.map(r => ({
    zoneId: r.zoneId,
    similarity: 1 - r.distance,
    sourcePreview: r.sourcePreview,
  }))
}
