/**
 * Tests for serializer.ts — pure logic, no DB or external API.
 */

import { describe, it, expect } from 'vitest'
import { serializeZoneForEmbedding, hashContent } from '../../../src/lib/embeddings/serializer'

describe('serializeZoneForEmbedding', () => {
  it('returns empty string for a zone with no content', () => {
    const result = serializeZoneForEmbedding({
      name: '',
      description: '',
      steps: [],
    })
    expect(result).toBe('')
  })

  it('extracts Spanish text from JSON multilang fields', () => {
    const result = serializeZoneForEmbedding({
      name: { es: 'WiFi', en: 'WiFi', fr: 'WiFi' },
      description: { es: 'Conexión a internet', en: 'Internet connection', fr: 'Connexion internet' },
      steps: [],
    })
    expect(result).toContain('WiFi')
    expect(result).toContain('Conexión a internet')
    // Non-Spanish should NOT leak into the canonical serialization
    expect(result).not.toContain('Internet connection')
  })

  it('falls back to English if Spanish is missing', () => {
    const result = serializeZoneForEmbedding({
      name: { en: 'Heating' },
      description: '',
      steps: [],
    })
    expect(result).toContain('Heating')
  })

  it('falls back to French if Spanish and English are missing', () => {
    const result = serializeZoneForEmbedding({
      name: { fr: 'Climatisation' },
      description: '',
      steps: [],
    })
    expect(result).toContain('Climatisation')
  })

  it('handles plain string fields (legacy non-multilang)', () => {
    const result = serializeZoneForEmbedding({
      name: 'Cocina',
      description: 'Información de la cocina',
      steps: [],
    })
    expect(result).toContain('Cocina')
    expect(result).toContain('Información de la cocina')
  })

  it('orders steps by `order` field', () => {
    const result = serializeZoneForEmbedding({
      name: 'Test',
      description: '',
      steps: [
        { title: { es: 'Tercero' }, content: { es: 'C' }, type: 'TEXT', order: 3 },
        { title: { es: 'Primero' }, content: { es: 'A' }, type: 'TEXT', order: 1 },
        { title: { es: 'Segundo' }, content: { es: 'B' }, type: 'TEXT', order: 2 },
      ],
    })
    const indexFirst = result.indexOf('Primero')
    const indexSecond = result.indexOf('Segundo')
    const indexThird = result.indexOf('Tercero')
    expect(indexFirst).toBeLessThan(indexSecond)
    expect(indexSecond).toBeLessThan(indexThird)
  })

  it('strips HTML tags from text', () => {
    const result = serializeZoneForEmbedding({
      name: '<strong>WiFi</strong>',
      description: '<p>Pulsa <em>configuración</em> y conecta</p>',
      steps: [],
    })
    expect(result).not.toContain('<strong>')
    expect(result).not.toContain('<p>')
    expect(result).not.toContain('<em>')
    expect(result).toContain('WiFi')
    expect(result).toContain('configuración')
  })

  it('strips markdown emphasis', () => {
    const result = serializeZoneForEmbedding({
      name: '**WiFi**',
      description: '_Importante_: ~~no funciona~~',
      steps: [],
    })
    expect(result).not.toMatch(/\*\*/)
    expect(result).not.toMatch(/^_|_$/)
    expect(result).toContain('WiFi')
    expect(result).toContain('Importante')
  })

  it('collapses repeated whitespace', () => {
    const result = serializeZoneForEmbedding({
      name: 'WiFi    \n\n   ',
      description: '   Hola\n\n\nMundo   ',
      steps: [],
    })
    expect(result).not.toMatch(/  +/)
    expect(result).not.toMatch(/\n{2,}/)
  })

  it('formats step title and content as "Title: Content"', () => {
    const result = serializeZoneForEmbedding({
      name: 'WiFi',
      description: '',
      steps: [
        { title: { es: 'Paso 1' }, content: { es: 'Conecta el router' }, type: 'TEXT', order: 1 },
      ],
    })
    expect(result).toContain('Paso 1: Conecta el router')
  })

  it('handles steps with title only (no content)', () => {
    const result = serializeZoneForEmbedding({
      name: 'WiFi',
      description: '',
      steps: [
        { title: { es: 'Importante' }, content: '', type: 'TEXT', order: 1 },
      ],
    })
    expect(result).toContain('Importante')
    expect(result).not.toContain('Importante:')
  })

  it('handles steps with content only (no title)', () => {
    const result = serializeZoneForEmbedding({
      name: 'WiFi',
      description: '',
      steps: [
        { title: '', content: { es: 'Solo contenido' }, type: 'TEXT', order: 1 },
      ],
    })
    expect(result).toContain('Solo contenido')
  })
})

describe('hashContent', () => {
  it('produces a consistent SHA256 hash', () => {
    const hash1 = hashContent('hello world')
    const hash2 = hashContent('hello world')
    expect(hash1).toBe(hash2)
    expect(hash1).toMatch(/^[a-f0-9]{64}$/)
  })

  it('produces different hashes for different content', () => {
    expect(hashContent('hello')).not.toBe(hashContent('world'))
  })

  it('handles unicode content', () => {
    const hash = hashContent('Calefacción ñ €')
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })
})
