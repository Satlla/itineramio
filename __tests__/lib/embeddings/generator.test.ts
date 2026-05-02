/**
 * Tests for generator.ts — mocks Prisma and the OpenAI client.
 *
 * Validates:
 *   - Returns 'failed' when zone or property is missing.
 *   - Returns 'skipped' when content is empty.
 *   - Returns 'skipped' when contentHash matches existing embedding.
 *   - Returns 'created' on first generation.
 *   - Returns 'updated' when content changed.
 *   - Returns 'failed' on embedding API errors.
 *   - tenantUserId is correctly extracted from Property.hostId.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the prisma module BEFORE importing generator
vi.mock('../../../src/lib/prisma', () => ({
  prisma: {
    zone: {
      findUnique: vi.fn(),
    },
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
  },
}))

// Mock the embedding client
vi.mock('../../../src/lib/embeddings/client', async () => {
  const actual = await vi.importActual<typeof import('../../../src/lib/embeddings/client')>(
    '../../../src/lib/embeddings/client',
  )
  return {
    ...actual,
    embedText: vi.fn(),
  }
})

import { generateZoneEmbedding } from '../../../src/lib/embeddings/generator'
import { prisma } from '../../../src/lib/prisma'
import { embedText, EMBEDDING_DIMENSIONS } from '../../../src/lib/embeddings/client'

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

function makeFakeVector(): number[] {
  return Array.from({ length: EMBEDDING_DIMENSIONS }, (_, i) => i / EMBEDDING_DIMENSIONS)
}

function mockZone(overrides: Partial<{ name: unknown; description: unknown; steps: unknown[]; hostId: string }> = {}) {
  return {
    id: 'zone-test',
    name: overrides.name ?? { es: 'WiFi' },
    description: overrides.description ?? { es: 'Conexión a internet' },
    steps: overrides.steps ?? [
      { title: { es: 'Paso 1' }, content: { es: 'Conecta el router' }, type: 'TEXT', order: 1 },
    ],
    property: { hostId: overrides.hostId ?? 'user-host-1' },
  }
}

describe('generateZoneEmbedding', () => {
  it('returns failed when zone is not found', async () => {
    vi.mocked(prisma.zone.findUnique).mockResolvedValue(null as never)

    const result = await generateZoneEmbedding('nonexistent')
    expect(result.status).toBe('failed')
    if (result.status === 'failed') {
      expect(result.error).toContain('not found')
    }
  })

  it('returns failed when zone has no parent property', async () => {
    vi.mocked(prisma.zone.findUnique).mockResolvedValue({
      ...mockZone(),
      property: null,
    } as never)

    const result = await generateZoneEmbedding('orphan-zone')
    expect(result.status).toBe('failed')
  })

  it('returns skipped/empty-content when serialized text is empty', async () => {
    vi.mocked(prisma.zone.findUnique).mockResolvedValue(
      mockZone({ name: '', description: '', steps: [] }) as never,
    )

    const result = await generateZoneEmbedding('zone-empty')
    expect(result.status).toBe('skipped')
    if (result.status === 'skipped') {
      expect(result.reason).toBe('empty-content')
    }
    expect(embedText).not.toHaveBeenCalled()
  })

  it('returns skipped/unchanged when contentHash matches existing', async () => {
    const zone = mockZone()
    vi.mocked(prisma.zone.findUnique).mockResolvedValue(zone as never)

    // First, compute the same hash that the generator will compute.
    // Easiest: run once with a mocked $queryRaw returning empty (forcing creation),
    // capture the hash that gets stored, then mock $queryRaw to return that hash.
    // Simpler approach: just trust the implementation and mock with same hash directly.
    // We import the hashContent helper to compute exactly what the generator will compute.
    const { serializeZoneForEmbedding, hashContent } = await import(
      '../../../src/lib/embeddings/serializer'
    )
    const expectedHash = hashContent(serializeZoneForEmbedding(zone))

    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ contentHash: expectedHash }] as never)

    const result = await generateZoneEmbedding(zone.id)
    expect(result.status).toBe('skipped')
    if (result.status === 'skipped') {
      expect(result.reason).toBe('unchanged')
    }
    expect(embedText).not.toHaveBeenCalled()
  })

  it('returns created when no existing embedding', async () => {
    const zone = mockZone()
    vi.mocked(prisma.zone.findUnique).mockResolvedValue(zone as never)
    vi.mocked(prisma.$queryRaw).mockResolvedValue([] as never)
    vi.mocked(embedText).mockResolvedValue(makeFakeVector())
    vi.mocked(prisma.$executeRaw).mockResolvedValue(1 as never)

    const result = await generateZoneEmbedding(zone.id)
    expect(result.status).toBe('created')
    expect(embedText).toHaveBeenCalledTimes(1)
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1)
  })

  it('returns updated when existing has different hash', async () => {
    const zone = mockZone()
    vi.mocked(prisma.zone.findUnique).mockResolvedValue(zone as never)
    // Old hash that does NOT match — forces update path
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ contentHash: 'OLD_HASH_DIFFERENT' }] as never)
    vi.mocked(embedText).mockResolvedValue(makeFakeVector())
    vi.mocked(prisma.$executeRaw).mockResolvedValue(1 as never)

    const result = await generateZoneEmbedding(zone.id)
    expect(result.status).toBe('updated')
    expect(embedText).toHaveBeenCalledTimes(1)
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1)
  })

  it('returns failed when embedText throws', async () => {
    const zone = mockZone()
    vi.mocked(prisma.zone.findUnique).mockResolvedValue(zone as never)
    vi.mocked(prisma.$queryRaw).mockResolvedValue([] as never)
    vi.mocked(embedText).mockRejectedValue(new Error('OpenAI API down'))

    const result = await generateZoneEmbedding(zone.id)
    expect(result.status).toBe('failed')
    if (result.status === 'failed') {
      expect(result.error).toContain('OpenAI API down')
    }
    // Should NOT attempt to write embedding when generation failed
    expect(prisma.$executeRaw).not.toHaveBeenCalled()
  })

  it('uses Property.hostId as tenantUserId', async () => {
    const zone = mockZone({ hostId: 'tenant-user-xyz' })
    vi.mocked(prisma.zone.findUnique).mockResolvedValue(zone as never)
    vi.mocked(prisma.$queryRaw).mockResolvedValue([] as never)
    vi.mocked(embedText).mockResolvedValue(makeFakeVector())

    let capturedTenantUserId: string | undefined
    vi.mocked(prisma.$executeRaw).mockImplementation((async (
      _strings: TemplateStringsArray,
      ...values: unknown[]
    ) => {
      // values for INSERT: [newId, zoneId, tenantUserId, contentHash, vectorLiteral, EMBEDDING_MODEL, sourcePreview]
      // We capture index 2 (tenantUserId)
      if (typeof values[2] === 'string') capturedTenantUserId = values[2]
      return 1
    }) as unknown as typeof prisma.$executeRaw)

    await generateZoneEmbedding(zone.id)
    expect(capturedTenantUserId).toBe('tenant-user-xyz')
  })
})
