/**
 * Zone serializer — turns a Zone (with its Steps) into plain text suitable for
 * embedding generation.
 *
 * Strategy:
 *   - Use the Spanish version (es) as canonical. Multilang is handled at query
 *     time by translating the query to Spanish before searching.
 *   - Concatenate name + description + each step title + each step content.
 *   - Strip HTML/markdown formatting (embeddings work better on plain text).
 */

import crypto from 'crypto'

interface JsonText {
  es?: string
  en?: string
  fr?: string
  [lang: string]: string | undefined
}

interface SerializableStep {
  title: unknown
  content: unknown
  type: string
  order: number
}

interface SerializableZone {
  name: unknown
  description: unknown
  steps: SerializableStep[]
}

/**
 * Pull the Spanish text from a multi-lang JSON value, with English/French fallbacks.
 * Mirrors getLocalizedText in chatbot-utils.ts but always prefers 'es'.
 */
function getCanonicalText(value: unknown): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const obj = value as JsonText
    return obj.es ?? obj.en ?? obj.fr ?? ''
  }
  return ''
}

/**
 * Strip basic HTML tags and markdown emphasis from text.
 * Keeps the meaning, removes noise that confuses embeddings.
 */
function stripFormatting(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ') // HTML tags
    .replace(/[*_~`]+/g, '') // markdown emphasis
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim()
}

/**
 * Serialize a Zone (with its Steps) into a single text blob for embedding.
 *
 * Format:
 *   <zone name>
 *   <zone description>
 *
 *   <step 1 title>: <step 1 content>
 *   <step 2 title>: <step 2 content>
 *   ...
 */
export function serializeZoneForEmbedding(zone: SerializableZone): string {
  const parts: string[] = []

  const name = stripFormatting(getCanonicalText(zone.name))
  if (name) parts.push(name)

  const description = stripFormatting(getCanonicalText(zone.description))
  if (description) parts.push(description)

  // Sort steps by order, then concatenate title + content
  const sortedSteps = [...zone.steps].sort((a, b) => a.order - b.order)
  for (const step of sortedSteps) {
    const stepTitle = stripFormatting(getCanonicalText(step.title))
    const stepContent = stripFormatting(getCanonicalText(step.content))

    if (stepTitle && stepContent) {
      parts.push(`${stepTitle}: ${stepContent}`)
    } else if (stepTitle) {
      parts.push(stepTitle)
    } else if (stepContent) {
      parts.push(stepContent)
    }
  }

  return parts.join('\n')
}

/**
 * Compute SHA256 hash of the serialized text. Used to detect content changes
 * and skip regeneration when nothing relevant has changed.
 */
export function hashContent(text: string): string {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex')
}
