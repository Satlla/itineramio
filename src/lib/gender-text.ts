/**
 * Funciones helper para adaptar texto según género del usuario
 */

export type Gender = 'M' | 'F' | 'O' | null

interface GenderedText {
  m: string  // Masculino
  f: string  // Femenino
  o: string  // Otro/Neutral
}

/**
 * Retorna el texto apropiado según el género
 */
export function getGenderedText(gender: Gender | undefined, texts: GenderedText): string {
  if (!gender || gender === 'O') {
    return texts.o
  }
  return gender === 'M' ? texts.m : texts.f
}

// Palabras comunes con género
export const GENDERED_WORDS = {
  bienvenido: { m: 'bienvenido', f: 'bienvenida', o: 'bienvenid@' },
  listo: { m: 'listo', f: 'lista', o: 'list@' },
  nuevo: { m: 'nuevo', f: 'nueva', o: 'nuev@' },
  anfitrion: { m: 'anfitrión', f: 'anfitriona', o: 'anfitrión/a' },
  querido: { m: 'querido', f: 'querida', o: 'querid@' },
  estimado: { m: 'estimado', f: 'estimada', o: 'estimad@' },
  el: { m: 'el', f: 'la', o: '' },
  un: { m: 'un', f: 'una', o: 'un/a' },
  tu: { m: 'tu', f: 'tu', o: 'tu' }, // Sin cambio
}

/**
 * Helper rápido para palabras comunes
 */
export function genderWord(word: keyof typeof GENDERED_WORDS, gender: Gender | undefined): string {
  return getGenderedText(gender, GENDERED_WORDS[word])
}

/**
 * Ejemplo de uso en emails:
 *
 * const welcomeText = `${genderWord('bienvenido', gender)} a Itineramio`
 * // Resulta en: "bienvenido a Itineramio" o "bienvenida a Itineramio"
 *
 * const readyText = `Tu guía está ${genderWord('listo', gender)}`
 * // Resulta en: "Tu guía está lista" o "Tu guía está listo"
 */
