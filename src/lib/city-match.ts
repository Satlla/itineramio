/**
 * City name aliases for bilingual / alternate spellings.
 * Each group contains all variants that should be treated as the same city.
 */
const CITY_ALIASES: string[][] = [
  ['alicante', 'alacant'],
  ['valencia', 'valència'],
  ['palma', 'palma de mallorca'],
  ['a coruña', 'a coruña', 'la coruña', 'coruña'],
  ['san sebastián', 'donostia', 'donostia-san sebastián'],
  ['bilbao', 'bilbo'],
  ['gerona', 'girona'],
  ['lérida', 'lleida'],
  ['tarragona', 'tarragona'],
  ['castellón', 'castelló de la plana', 'castellón de la plana'],
  ['murcia', 'múrcia'],
  ['ibiza', 'eivissa'],
  ['mahón', 'maó'],
]

/**
 * Returns true if two city names refer to the same city,
 * handling bilingual names, alternate spellings, and substring matches.
 */
export function citiesMatch(a: string, b: string): boolean {
  const na = a.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const nb = b.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  if (na === nb) return true
  if (na.includes(nb) || nb.includes(na)) return true

  // Check alias groups
  for (const group of CITY_ALIASES) {
    const normGroup = group.map(c => c.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    const aInGroup = normGroup.some(v => v === na || v.includes(na) || na.includes(v))
    const bInGroup = normGroup.some(v => v === nb || v.includes(nb) || nb.includes(v))
    if (aInGroup && bInGroup) return true
  }

  return false
}
