/**
 * Public surface of the embeddings module.
 *
 * Usage:
 *   import { generateZoneEmbedding, searchSimilarZones } from '@/lib/embeddings'
 *
 * Internals (client, serializer) can be imported directly for testing or
 * extension, but should not be needed by application code.
 */

export {
  generateZoneEmbedding,
  generateEmbeddingsForProperty,
  type ZoneEmbeddingResult,
} from './generator'

export {
  searchSimilarZones,
  type SimilarZone,
  type SearchOptions,
} from './search'

export { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS } from './client'
