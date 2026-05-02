/**
 * scripts/test-embeddings.ts
 *
 * Manual end-to-end test for the embeddings module (PR1).
 *
 * USAGE:
 *   npx tsx scripts/test-embeddings.ts <propertyId>
 *
 * REQUIRES:
 *   - OPENAI_API_KEY in .env.local
 *   - Migration applied (npx prisma migrate deploy)
 *   - At least one zone with content for the propertyId
 *
 * SAFETY:
 *   - Read-only by default — does NOT modify zones, only ZoneEmbedding rows.
 *   - Calls OpenAI API → costs about $0.0001 per zone (text-embedding-3-small).
 *   - Recommended: run against a Neon branch, not production.
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { prisma } from '../src/lib/prisma'
import {
  generateEmbeddingsForProperty,
  searchSimilarZones,
} from '../src/lib/embeddings'

async function main() {
  const propertyId = process.argv[2]

  if (!propertyId) {
    console.error('Usage: npx tsx scripts/test-embeddings.ts <propertyId>')
    console.error('')
    console.error('Find a property ID with:')
    console.error("  npx prisma studio  → properties table")
    process.exit(1)
  }

  // Verify OPENAI_API_KEY is set
  if (!process.env.OPENAI_API_KEY) {
    console.error('ERROR: OPENAI_API_KEY missing from .env.local')
    process.exit(1)
  }

  // Verify property exists
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, hostId: true, name: true, _count: { select: { zones: true } } },
  })

  if (!property) {
    console.error(`Property not found: ${propertyId}`)
    process.exit(1)
  }

  const propertyName =
    typeof property.name === 'string'
      ? property.name
      : (property.name as { es?: string })?.es ?? '(no name)'

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Property:', propertyName)
  console.log('Property ID:', property.id)
  console.log('Host (tenant):', property.hostId)
  console.log('Zones count:', property._count.zones)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')

  // Step 1 — generate embeddings for all zones of this property
  console.log('Step 1: Generating embeddings for all zones…')
  const start = Date.now()
  const result = await generateEmbeddingsForProperty(propertyId)
  const elapsed = ((Date.now() - start) / 1000).toFixed(1)

  console.log('')
  console.log(`Done in ${elapsed}s.`)
  console.log(`  Total zones:  ${result.total}`)
  console.log(`  Created:      ${result.created}`)
  console.log(`  Updated:      ${result.updated}`)
  console.log(`  Skipped:      ${result.skipped}`)
  console.log(`  Failed:       ${result.failed}`)

  if (result.failed > 0) {
    console.log('')
    console.log('Failed details:')
    for (const r of result.details) {
      if (r.status === 'failed') {
        console.log(`  - zoneId=${r.zoneId}: ${r.error}`)
      }
    }
  }

  // Step 2 — search with a test query
  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Step 2: Searching similar zones')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const queries = [
    'cómo se enciende la calefacción',
    'a qué hora puedo entrar al apartamento',
    'la wifi no funciona',
    'dónde dejo la basura',
  ]

  for (const query of queries) {
    console.log('')
    console.log(`Query: "${query}"`)
    const matches = await searchSimilarZones(query, {
      propertyId: property.id,
      tenantUserId: property.hostId,
      limit: 3,
      minSimilarity: 0.3,
    })

    if (matches.length === 0) {
      console.log('  → no matches above threshold')
      continue
    }

    for (const m of matches) {
      const preview = m.sourcePreview?.slice(0, 80) ?? '(no preview)'
      console.log(
        `  → ${(m.similarity * 100).toFixed(1)}% | zoneId=${m.zoneId} | ${preview}…`,
      )
    }
  }

  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Done. Disconnecting from DB.')
  await prisma.$disconnect()
}

main().catch(async err => {
  console.error('FATAL:', err)
  await prisma.$disconnect()
  process.exit(1)
})
