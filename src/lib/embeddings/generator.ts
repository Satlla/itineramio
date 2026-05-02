/**
 * Zone embedding generator — orchestrates fetching the Zone, serializing,
 * generating embedding via the provider, and upserting to the database.
 *
 * Idempotent: if the content hash matches the existing embedding row, skips
 * the API call. This makes it safe to call on every zone update without
 * burning Anthropic/OpenAI tokens unnecessarily.
 */

import { prisma } from '../prisma'
import { embedText, EMBEDDING_MODEL } from './client'
import { serializeZoneForEmbedding, hashContent } from './serializer'

export type ZoneEmbeddingResult =
  | { status: 'created'; zoneId: string }
  | { status: 'updated'; zoneId: string }
  | { status: 'skipped'; zoneId: string; reason: 'unchanged' | 'empty-content' }
  | { status: 'failed'; zoneId: string; error: string }

/**
 * Generate (or refresh) the embedding for a single Zone.
 *
 * Returns a structured result so callers can track stats without parsing exceptions.
 * The function never throws on expected failures (empty content, missing zone) —
 * those return a 'failed' or 'skipped' result instead.
 */
export async function generateZoneEmbedding(zoneId: string): Promise<ZoneEmbeddingResult> {
  // Fetch zone with steps and tenant info (Property.hostId for forward-looking tenantUserId)
  const zone = await prisma.zone.findUnique({
    where: { id: zoneId },
    include: {
      steps: { select: { title: true, content: true, type: true, order: true } },
      property: { select: { hostId: true } },
    },
  })

  if (!zone || !zone.property) {
    return { status: 'failed', zoneId, error: 'Zone or parent property not found' }
  }

  const tenantUserId = zone.property.hostId
  const sourceText = serializeZoneForEmbedding(zone)

  if (sourceText.trim().length === 0) {
    return { status: 'skipped', zoneId, reason: 'empty-content' }
  }

  const newHash = hashContent(sourceText)

  // Check if existing embedding has the same content hash → skip
  const existing = await prisma.$queryRaw<Array<{ contentHash: string }>>`
    SELECT "contentHash" FROM "zone_embeddings" WHERE "zoneId" = ${zoneId} LIMIT 1
  `

  if (existing.length > 0 && existing[0].contentHash === newHash) {
    return { status: 'skipped', zoneId, reason: 'unchanged' }
  }

  // Generate embedding
  let vector: number[]
  try {
    vector = await embedText(sourceText)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown embedding error'
    return { status: 'failed', zoneId, error: message }
  }

  // Postgres vector literal format: '[0.123,0.456,...]'
  const vectorLiteral = `[${vector.join(',')}]`
  const sourcePreview = sourceText.slice(0, 200)

  // Upsert via raw SQL because Prisma cannot directly handle Unsupported("vector(N)")
  if (existing.length > 0) {
    await prisma.$executeRaw`
      UPDATE "zone_embeddings"
      SET
        "tenantUserId"  = ${tenantUserId},
        "contentHash"   = ${newHash},
        "embedding"     = ${vectorLiteral}::vector,
        "model"         = ${EMBEDDING_MODEL},
        "sourcePreview" = ${sourcePreview},
        "updatedAt"     = CURRENT_TIMESTAMP
      WHERE "zoneId" = ${zoneId}
    `
    return { status: 'updated', zoneId }
  }

  // Insert new
  const newId = `cm${Math.random().toString(36).slice(2, 14)}${Date.now().toString(36)}`
  await prisma.$executeRaw`
    INSERT INTO "zone_embeddings"
      ("id", "zoneId", "tenantUserId", "contentHash", "embedding", "model", "sourcePreview", "createdAt", "updatedAt")
    VALUES
      (${newId}, ${zoneId}, ${tenantUserId}, ${newHash}, ${vectorLiteral}::vector, ${EMBEDDING_MODEL}, ${sourcePreview}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `

  return { status: 'created', zoneId }
}

/**
 * Generate embeddings for all zones of a property.
 * Useful for initial seeding when AlexAI is enabled on a property for the first time.
 */
export async function generateEmbeddingsForProperty(propertyId: string): Promise<{
  total: number
  created: number
  updated: number
  skipped: number
  failed: number
  details: ZoneEmbeddingResult[]
}> {
  const zones = await prisma.zone.findMany({
    where: { propertyId, status: { not: 'ARCHIVED' } },
    select: { id: true },
  })

  const results: ZoneEmbeddingResult[] = []
  for (const zone of zones) {
    results.push(await generateZoneEmbedding(zone.id))
  }

  return {
    total: zones.length,
    created: results.filter(r => r.status === 'created').length,
    updated: results.filter(r => r.status === 'updated').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    failed: results.filter(r => r.status === 'failed').length,
    details: results,
  }
}
