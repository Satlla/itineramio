/**
 * Auto-translation utility using Anthropic Claude Haiku API.
 * Translates Spanish text to English and French for zone names and step content.
 * Graceful degradation: if the API key is missing or the API fails, saves without translations.
 */

interface TranslatableField {
  es?: string
  en?: string
  fr?: string
  [key: string]: any
}

interface TranslationResult {
  en: string
  fr: string
}

/**
 * Translate an array of fields from Spanish to English and French.
 * Only translates fields where `en` or `fr` are empty/missing AND `es` has content.
 * Returns a new array with translations merged in (does not mutate input).
 */
export async function translateFields(fields: TranslatableField[]): Promise<TranslatableField[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return fields
  }

  // Collect indices and Spanish texts that need translation
  const toTranslate: { index: number; text: string; needsEn: boolean; needsFr: boolean }[] = []

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i]
    const esText = (field.es || '').trim()
    if (!esText) continue

    const needsEn = !field.en || !field.en.trim()
    const needsFr = !field.fr || !field.fr.trim()

    if (needsEn || needsFr) {
      toTranslate.push({ index: i, text: esText, needsEn, needsFr })
    }
  }

  if (toTranslate.length === 0) {
    return fields
  }

  try {
    const translations = await callTranslationAPI(
      apiKey,
      toTranslate.map(t => t.text)
    )

    // Merge translations back into a copy of the fields
    const result = fields.map(f => ({ ...f }))

    for (let i = 0; i < toTranslate.length; i++) {
      const { index, needsEn, needsFr } = toTranslate[i]
      const translation = translations[i]
      if (!translation) continue

      if (needsEn && translation.en) {
        result[index].en = translation.en
      }
      if (needsFr && translation.fr) {
        result[index].fr = translation.fr
      }
    }

    return result
  } catch (error) {
    console.error('[translate] Translation failed, saving without translations:', error)
    return fields
  }
}

/**
 * Translate steps array in-place. Handles title and content fields,
 * preserving mediaUrl, linkUrl, and all other non-translatable properties.
 * Returns a new array with translations merged in.
 */
export async function translateSteps(steps: any[]): Promise<any[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return steps
  }

  // Collect all translatable fields from titles and contents
  const titleFields: TranslatableField[] = []
  const contentFields: TranslatableField[] = []

  for (const step of steps) {
    const title = step.title || {}
    const content = step.content || {}
    titleFields.push({
      es: typeof title === 'string' ? title : title.es || '',
      en: typeof title === 'string' ? '' : title.en || '',
      fr: typeof title === 'string' ? '' : title.fr || '',
    })
    contentFields.push({
      es: typeof content === 'string' ? content : content.es || '',
      en: typeof content === 'string' ? '' : content.en || '',
      fr: typeof content === 'string' ? '' : content.fr || '',
    })
  }

  // Translate titles and contents in a single batch
  const allFields = [...titleFields, ...contentFields]
  const translatedAll = await translateFields(allFields)

  const translatedTitles = translatedAll.slice(0, titleFields.length)
  const translatedContents = translatedAll.slice(titleFields.length)

  // Map translations back onto steps
  return steps.map((step, i) => {
    const origTitle = typeof step.title === 'string' ? { es: step.title } : (step.title || {})
    const origContent = typeof step.content === 'string' ? { es: step.content } : (step.content || {})

    return {
      ...step,
      title: {
        ...origTitle,
        en: translatedTitles[i].en || origTitle.en || '',
        fr: translatedTitles[i].fr || origTitle.fr || '',
      },
      content: {
        ...origContent,
        en: translatedContents[i].en || origContent.en || '',
        fr: translatedContents[i].fr || origContent.fr || '',
      },
    }
  })
}

/**
 * Call the Anthropic API to translate an array of Spanish texts to EN and FR.
 */
async function callTranslationAPI(apiKey: string, texts: string[]): Promise<TranslationResult[]> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: buildTranslationPrompt(texts),
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'unknown')
    throw new Error(`Anthropic API error ${response.status}: ${errorBody}`)
  }

  const data = await response.json()
  const content = data.content?.[0]?.text

  if (!content) {
    throw new Error('Empty response from Anthropic API')
  }

  // Parse JSON from the response — handle possible markdown code fences
  const jsonStr = content.replace(/```json\s*\n?/g, '').replace(/```\s*$/g, '').trim()
  const parsed = JSON.parse(jsonStr)

  if (!Array.isArray(parsed) || parsed.length !== texts.length) {
    throw new Error(`Expected array of ${texts.length} translations, got ${Array.isArray(parsed) ? parsed.length : typeof parsed}`)
  }

  return parsed as TranslationResult[]
}

function buildTranslationPrompt(texts: string[]): string {
  const numbered = texts.map((t, i) => `[${i}] ${t}`).join('\n')

  return `Translate the following Spanish texts to English (en) and French (fr).

RULES:
- Preserve ALL emojis exactly as they appear
- Preserve ALL markdown formatting (**bold**, *italic*, links, lists, etc.)
- Preserve ALL URLs, phone numbers, email addresses, and codes exactly as they are
- Preserve proper nouns (names of places, people, brands) without translating them
- If a text is already in English or French, still provide both translations
- Keep the same tone and register as the original
- Do NOT add or remove any information

TEXTS:
${numbered}

Respond with ONLY a JSON array (no markdown fences, no explanation). Each element must have "en" and "fr" keys.
Example for 2 texts: [{"en": "...", "fr": "..."}, {"en": "...", "fr": "..."}]`
}
