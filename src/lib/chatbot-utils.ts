/**
 * chatbot-utils.ts
 * Core logic for the guest-facing chatbot: zone ranking, media collection,
 * prompt building, and unanswered-question detection.
 * Extracted here so these functions can be unit-tested without importing
 * the full Next.js API route.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MediaItem {
  type: 'IMAGE' | 'VIDEO'
  url: string
  caption?: string
  stepText?: string
  stepIndex?: number
}

// ---------------------------------------------------------------------------
// getLocalizedText
// ---------------------------------------------------------------------------

export function getLocalizedText(value: unknown, language: string): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const raw = obj[language] ?? obj['es'] ?? obj['en'] ?? obj['fr'] ?? '';
    if (typeof raw === 'string') return raw;
    if (raw && typeof raw === 'object') {
      const inner = (raw as Record<string, unknown>)['text'] ?? (raw as Record<string, unknown>)['content'] ?? '';
      return typeof inner === 'string' ? inner : '';
    }
    return '';
  }
  return '';
}

// ---------------------------------------------------------------------------
// QUERY_EXPANSIONS
// Maps common short guest questions to extra search terms.
// IMPORTANT: Only expand topic-specific words, NOT question words like "como",
// "qué", "cuándo", etc. Expanding interrogatives causes false zone matches.
// ---------------------------------------------------------------------------

export const QUERY_EXPANSIONS: Record<string, string[]> = {

  // ── CHECK-IN / ENTRADA ──────────────────────────────────────────────────
  checkin:      ['check', 'entrada', 'acceso', 'llegada', 'llave', 'key', 'door', 'puerta', 'codigo', 'code'],
  'check-in':   ['check', 'entrada', 'acceso', 'llegada', 'llave', 'puerta'],
  entro:        ['check', 'entrada', 'acceso', 'llave', 'puerta', 'llegada'],
  entrar:       ['check', 'entrada', 'acceso', 'llave', 'puerta', 'llegada'],
  entre:        ['check', 'entrada', 'acceso', 'llave', 'puerta'],
  entramos:     ['check', 'entrada', 'acceso', 'llave', 'puerta'],
  entras:       ['check', 'entrada', 'acceso', 'llave', 'puerta'],
  ingreso:      ['check', 'entrada', 'acceso', 'llave'],
  ingresar:     ['check', 'entrada', 'acceso', 'llave'],
  abrir:        ['check', 'llave', 'puerta', 'acceso', 'entrada', 'door', 'codigo'],
  abre:         ['check', 'llave', 'puerta', 'acceso', 'entrada', 'door'],
  abro:         ['check', 'llave', 'puerta', 'acceso', 'entrada'],
  open:         ['check', 'llave', 'puerta', 'acceso', 'entrada', 'door'],
  acceder:      ['check', 'acceso', 'entrada', 'llave', 'puerta', 'llegada'],
  accedo:       ['check', 'acceso', 'entrada', 'llave', 'puerta'],
  llego:        ['check', 'llegada', 'acceso', 'entrada', 'llave'],
  llegar:       ['check', 'llegada', 'acceso', 'entrada', 'llave'],
  llegada:      ['check', 'entrada', 'acceso', 'llave'],
  llegamos:     ['check', 'llegada', 'acceso', 'entrada', 'llave'],
  llegare:      ['check', 'llegada', 'acceso', 'entrada'],
  entrada:      ['check', 'acceso', 'llave', 'puerta', 'door'],
  acceso:       ['check', 'entrada', 'llave', 'puerta', 'door'],
  puerta:       ['check', 'llave', 'acceso', 'entrada', 'door', 'lockbox', 'codigo'],
  door:         ['puerta', 'acceso', 'entrada', 'llave', 'key', 'check', 'lockbox', 'codigo'],
  key:          ['llave', 'acceso', 'check', 'entrada', 'puerta', 'door', 'lockbox', 'codigo'],
  keys:         ['llave', 'acceso', 'check', 'entrada', 'puerta', 'door'],
  llave:        ['acceso', 'check', 'entrada', 'puerta', 'door', 'lockbox', 'codigo'],
  lockbox:      ['llave', 'check', 'entrada', 'puerta', 'codigo', 'caja'],
  codigo:       ['check', 'llave', 'entrada', 'puerta', 'acceso', 'lockbox'],
  code:         ['check', 'llave', 'entrada', 'puerta', 'acceso', 'lockbox', 'codigo'],
  pin:          ['check', 'codigo', 'llave', 'acceso', 'puerta', 'entrada'],
  caja:         ['check', 'lockbox', 'llave', 'entrada', 'acceso'],
  instrucciones:['check', 'entrada', 'acceso', 'salida', 'normas'],
  instruccion:  ['check', 'entrada', 'acceso', 'salida'],
  // NOTE: 'como' is a Spanish question word — do NOT expand it. See route.ts comment.

  // ── CHECK-OUT / SALIDA ──────────────────────────────────────────────────
  checkout:     ['salida', 'departure', 'leaving', 'leave', 'irse', 'marcharse', 'dejar'],
  'check-out':  ['salida', 'departure', 'leaving', 'irse', 'marcharse'],
  salgo:        ['salida', 'checkout', 'irse', 'marcharse', 'departure'],
  salir:        ['salida', 'checkout', 'irse', 'marcharse', 'departure', 'leaving'],
  sale:         ['salida', 'checkout', 'irse'],
  salimos:      ['salida', 'checkout', 'irse', 'marcharse'],
  marcho:       ['salida', 'checkout', 'irse', 'marcharse'],
  marcharme:    ['salida', 'checkout', 'irse', 'marcharse'],
  marchamos:    ['salida', 'checkout', 'irse', 'marcharse'],
  irse:         ['salida', 'checkout', 'departure', 'leaving'],
  irme:         ['salida', 'checkout', 'departure', 'leaving'],
  irnos:        ['salida', 'checkout', 'departure', 'leaving'],
  leave:        ['salida', 'checkout', 'departure', 'leaving', 'irse'],
  leaving:      ['salida', 'checkout', 'departure', 'irse'],
  departure:    ['salida', 'checkout', 'leaving', 'irse'],
  salida:       ['checkout', 'departure', 'leaving', 'irse'],
  dejar:        ['salida', 'checkout', 'irse', 'llave'],
  dejo:         ['salida', 'checkout', 'llave', 'irse'],
  dejamos:      ['salida', 'checkout', 'llave', 'irse'],

  // ── WIFI / INTERNET ─────────────────────────────────────────────────────
  wifi:         ['wifi', 'wi-fi', 'internet', 'password', 'contrasena', 'clave', 'red', 'network', 'conexion'],
  'wi-fi':      ['wifi', 'internet', 'password', 'contrasena', 'clave'],
  internet:     ['wifi', 'wi-fi', 'internet', 'password', 'contrasena', 'red', 'conexion'],
  password:     ['wifi', 'wi-fi', 'internet', 'contrasena', 'clave'],
  contrasena:   ['wifi', 'wi-fi', 'internet', 'clave', 'password'],
  clave:        ['wifi', 'wi-fi', 'internet', 'contrasena', 'password'],
  red:          ['wifi', 'wi-fi', 'internet', 'red', 'network', 'conexion'],
  network:      ['wifi', 'wi-fi', 'internet', 'red', 'conexion'],
  conexion:     ['wifi', 'wi-fi', 'internet', 'red'],
  conectar:     ['wifi', 'wi-fi', 'internet', 'conexion', 'red'],
  conecto:      ['wifi', 'wi-fi', 'internet', 'conexion'],
  conectarse:   ['wifi', 'wi-fi', 'internet', 'conexion'],

  // ── PARKING / COCHE ─────────────────────────────────────────────────────
  parking:      ['parking', 'aparcamiento', 'coche', 'garaje', 'car', 'garage', 'aparcar', 'estacionamiento'],
  aparcar:      ['parking', 'aparcamiento', 'coche', 'garaje', 'estacionamiento'],
  aparcamiento: ['parking', 'coche', 'garaje', 'aparcar', 'estacionamiento'],
  coche:        ['parking', 'aparcamiento', 'garaje', 'car', 'garage'],
  car:          ['parking', 'aparcamiento', 'coche', 'garaje', 'garage'],
  garaje:       ['parking', 'aparcamiento', 'coche', 'car', 'garage'],
  garage:       ['parking', 'aparcamiento', 'coche', 'garaje', 'car'],

  // ── COCINA / ELECTRODOMÉSTICOS ──────────────────────────────────────────
  cocina:         ['cocina', 'kitchen', 'cocinar', 'vitro', 'horno', 'microondas', 'nevera', 'frigorifico', 'cafetera'],
  kitchen:        ['cocina', 'cocinar', 'vitro', 'horno', 'microondas', 'cooking', 'oven'],
  cocinar:        ['cocina', 'kitchen', 'vitro', 'horno', 'microondas', 'placa', 'fuegos'],
  cocinamos:      ['cocina', 'kitchen', 'vitro', 'horno'],
  vitroceramica:  ['cocina', 'vitro', 'placa', 'induccion', 'kitchen', 'fuegos'],
  vitro:          ['cocina', 'vitroceramica', 'placa', 'induccion', 'kitchen'],
  induccion:      ['cocina', 'vitroceramica', 'vitro', 'placa', 'kitchen'],
  placa:          ['cocina', 'vitroceramica', 'vitro', 'induccion', 'kitchen', 'fuegos'],
  fuegos:         ['cocina', 'vitro', 'placa', 'kitchen'],
  horno:          ['cocina', 'kitchen', 'oven', 'cocinar'],
  oven:           ['horno', 'cocina', 'kitchen', 'cooking'],
  microondas:     ['cocina', 'kitchen', 'microwave'],
  microwave:      ['microondas', 'cocina', 'kitchen'],
  nevera:         ['cocina', 'kitchen', 'frigorifico', 'fridge', 'refrigerador'],
  frigorifico:    ['cocina', 'kitchen', 'nevera', 'fridge', 'refrigerador'],
  fridge:         ['nevera', 'frigorifico', 'cocina', 'kitchen', 'refrigerador'],
  cafetera:       ['cocina', 'kitchen', 'cafe', 'coffee', 'capsula', 'nespresso'],
  cafe:           ['cafetera', 'cocina', 'coffee', 'capsula', 'nespresso', 'desayuno'],
  coffee:         ['cafetera', 'cocina', 'cafe', 'kitchen'],
  nespresso:      ['cafetera', 'cocina', 'cafe', 'coffee', 'capsula'],
  capsula:        ['cafetera', 'cocina', 'cafe', 'coffee', 'nespresso'],
  lavavajillas:   ['cocina', 'kitchen', 'dishwasher', 'fregar'],
  dishwasher:     ['lavavajillas', 'cocina', 'kitchen', 'fregar'],
  fregar:         ['lavavajillas', 'cocina', 'kitchen'],
  lavadora:       ['lavadora', 'laundry', 'washing', 'lavar', 'ropa', 'lavanderia'],
  washing:        ['lavadora', 'laundry', 'lavar', 'lavanderia'],
  laundry:        ['lavadora', 'washing', 'lavar', 'lavanderia'],
  lavar:          ['lavadora', 'laundry', 'washing', 'lavanderia'],
  lavanderia:     ['lavadora', 'laundry', 'washing', 'lavar'],

  // ── AIRE ACONDICIONADO / CALEFACCIÓN ────────────────────────────────────
  aire:           ['aire', 'acondicionado', 'climatizacion', 'temperatura', 'frio', 'calor', 'calefaccion', 'ac'],
  acondicionado:  ['aire', 'climatizacion', 'temperatura', 'frio', 'calor', 'ac'],
  calefaccion:    ['calefaccion', 'calor', 'temperatura', 'termostato', 'radiador', 'heating'],
  calor:          ['aire', 'acondicionado', 'calefaccion', 'temperatura', 'termostato', 'ventilador'],
  frio:           ['aire', 'acondicionado', 'calefaccion', 'temperatura', 'calor'],
  temperatura:    ['aire', 'acondicionado', 'calefaccion', 'termostato', 'calor', 'frio'],
  termostato:     ['calefaccion', 'temperatura', 'calor', 'frio', 'aire'],
  heating:        ['calefaccion', 'calor', 'temperatura', 'termostato'],
  climatizacion:  ['aire', 'acondicionado', 'calefaccion', 'temperatura'],

  // ── PISCINA / JACUZZI / TERRAZA ──────────────────────────────────────────
  piscina:        ['piscina', 'pool', 'bano', 'nadar', 'jacuzzi', 'spa'],
  pool:           ['piscina', 'nadar', 'bano', 'jacuzzi', 'spa'],
  nadar:          ['piscina', 'pool', 'bano', 'playa'],
  jacuzzi:        ['piscina', 'jacuzzi', 'spa', 'bano'],
  terraza:        ['terraza', 'balcon', 'patio', 'exterior', 'jardin'],
  balcon:         ['terraza', 'balcon', 'patio', 'exterior'],
  jardin:         ['terraza', 'jardin', 'patio', 'exterior'],

  // ── NORMAS / REGLAS ─────────────────────────────────────────────────────
  normas:         ['normas', 'reglas', 'rules', 'prohibido', 'permitido', 'casa'],
  reglas:         ['normas', 'reglas', 'rules', 'prohibido', 'permitido'],
  rules:          ['normas', 'reglas', 'prohibido', 'permitido'],
  prohibido:      ['normas', 'reglas', 'rules', 'prohibido'],
  mascotas:       ['normas', 'reglas', 'mascotas', 'perro', 'gato', 'animales', 'pets'],
  pets:           ['normas', 'mascotas', 'perro', 'gato', 'animales'],
  fumar:          ['normas', 'reglas', 'fumar', 'tabaco', 'smoking'],
  smoking:        ['normas', 'reglas', 'fumar', 'tabaco'],
  ruido:          ['normas', 'reglas', 'ruido', 'silencio', 'musica'],
  silencio:       ['normas', 'reglas', 'ruido', 'silencio'],
  fiesta:         ['normas', 'reglas', 'fiesta', 'ruido'],
  party:          ['normas', 'reglas', 'fiesta', 'ruido'],

  // ── BASURA / RECICLAJE ───────────────────────────────────────────────────
  basura:         ['basura', 'reciclaje', 'residuos', 'contenedor', 'cubo', 'trash', 'recycling'],
  reciclaje:      ['basura', 'reciclaje', 'residuos', 'contenedor'],
  trash:          ['basura', 'reciclaje', 'residuos', 'contenedor'],
  recycling:      ['reciclaje', 'basura', 'residuos'],

  // ── RESTAURANTES / COMIDA ────────────────────────────────────────────────
  comer:          ['restaurante', 'restaurant', 'comida', 'cenar', 'food', 'tapas', 'bar', 'gastronomia'],
  cenar:          ['restaurante', 'restaurant', 'cena', 'dinner', 'food', 'comida'],
  almorzar:       ['restaurante', 'restaurant', 'almuerzo', 'lunch', 'food', 'comida'],
  desayunar:      ['restaurante', 'cafeteria', 'cafe', 'breakfast', 'desayuno'],
  comida:         ['restaurante', 'restaurant', 'comer', 'food', 'tapas', 'gastronomia'],
  food:           ['restaurante', 'restaurant', 'comida', 'comer', 'tapas', 'bar'],
  tapas:          ['restaurante', 'bar', 'tapas', 'comida', 'food'],
  bar:            ['restaurante', 'bar', 'tapas', 'comida', 'cafe'],
  dinner:         ['restaurante', 'cenar', 'cena', 'comida', 'food'],
  lunch:          ['restaurante', 'almorzar', 'almuerzo', 'comida', 'food'],
  breakfast:      ['cafe', 'cafeteria', 'desayuno', 'desayunar', 'restaurante'],
  brunch:         ['cafe', 'cafeteria', 'desayuno', 'restaurante'],

  // ── TURISMO / QUÉ VER / ACTIVIDADES ─────────────────────────────────────
  ver:            ['visitas', 'turismo', 'monumentos', 'lugares', 'actividades', 'pasear'],
  visitar:        ['visitas', 'turismo', 'monumentos', 'lugares', 'actividades'],
  visitas:        ['turismo', 'monumentos', 'lugares', 'actividades', 'pasear'],
  turismo:        ['visitas', 'monumentos', 'lugares', 'actividades', 'pasear'],
  museo:          ['visitas', 'turismo', 'museos', 'monumentos', 'lugares'],
  actividades:    ['visitas', 'turismo', 'actividades', 'pasear', 'ocio'],
  playa:          ['playa', 'mar', 'arena', 'bano', 'nadar', 'beach'],
  beach:          ['playa', 'mar', 'arena', 'bano', 'nadar'],
  mar:            ['playa', 'beach', 'nadar', 'bano'],
  hacer:          ['actividades', 'visitas', 'turismo', 'ocio'],

  // ── SUPERMERCADO / COMPRAS ───────────────────────────────────────────────
  supermercado:   ['supermercado', 'compras', 'tienda', 'mercado', 'shopping'],
  compras:        ['supermercado', 'tienda', 'mercado', 'shopping', 'comprar'],
  farmacia:       ['farmacia', 'medicamentos', 'pastillas', 'medico'],

  // ── TRANSPORTE ───────────────────────────────────────────────────────────
  bus:            ['bus', 'autobus', 'transporte', 'metro', 'parada'],
  metro:          ['metro', 'transporte', 'bus', 'parada', 'estacion'],
  taxi:           ['taxi', 'transporte', 'uber', 'cab'],
  transporte:     ['bus', 'metro', 'taxi', 'transporte', 'uber'],
  aeropuerto:     ['aeropuerto', 'airport', 'vuelo', 'transporte'],
  airport:        ['aeropuerto', 'transporte', 'taxi', 'bus'],

  // ── DIRECCIÓN / UBICACIÓN ────────────────────────────────────────────────
  address:        ['llegar', 'llegada', 'ubicacion', 'location', 'directions', 'calle', 'street', 'mapa'],
  location:       ['llegar', 'llegada', 'ubicacion', 'directions', 'mapa'],
  where:          ['llegar', 'llegada', 'ubicacion', 'location', 'mapa'],
  directions:     ['llegar', 'llegada', 'ubicacion', 'mapa', 'calle'],

  // ── EQUIPAJE / MALETAS ───────────────────────────────────────────────────
  luggage:        ['equipaje', 'maleta', 'storage', 'consigna', 'bag', 'maletas'],
  bag:            ['equipaje', 'maleta', 'storage', 'consigna', 'luggage'],
  storage:        ['equipaje', 'maleta', 'consigna', 'luggage', 'almacen'],
  maleta:         ['equipaje', 'storage', 'consigna', 'luggage', 'maletas'],
  equipaje:       ['maleta', 'storage', 'consigna', 'luggage', 'maletas'],

  // ── TOALLAS / ROPA DE CAMA ───────────────────────────────────────────────
  toallas:        ['toallas', 'ropa', 'cama', 'sabanas', 'limpieza', 'towels'],
  towels:         ['toallas', 'ropa', 'cama', 'sabanas', 'limpieza'],
  sabanas:        ['toallas', 'ropa', 'cama', 'sabanas', 'cama'],
  cama:           ['sabanas', 'toallas', 'ropa', 'cama'],

  // ── EMERGENCIAS ─────────────────────────────────────────────────────────
  emergencia:     ['emergencias', 'urgencias', 'medico', 'hospital', 'incendio', 'policia'],
  emergencias:    ['urgencias', 'medico', 'hospital', 'incendio', 'policia'],
  urgencias:      ['emergencias', 'medico', 'hospital'],
  incendio:       ['emergencias', 'urgencias', 'evacuacion', 'salida'],

  // ── RECOMENDACIONES GENÉRICAS ────────────────────────────────────────────
  sitios:         ['restaurante', 'visitas', 'lugares', 'recomendacion', 'actividades'],
  lugares:        ['restaurante', 'visitas', 'sitios', 'recomendacion', 'actividades'],
  recomienda:     ['restaurante', 'visitas', 'lugares', 'sitios', 'recomendacion'],
  recomendacion:  ['restaurante', 'visitas', 'lugares', 'sitios'],
  cerca:          ['restaurante', 'visitas', 'lugares', 'supermercado', 'farmacia'],
  mejor:          ['restaurante', 'visitas', 'lugares', 'recomendacion'],
  mejores:        ['restaurante', 'visitas', 'lugares', 'recomendacion'],

  // ── FRANCÉS ─────────────────────────────────────────────────────────────
  entrer:         ['check', 'entrada', 'acceso', 'llave', 'puerta'],
  sortir:         ['salida', 'checkout', 'irse', 'departure'],
  partons:        ['salida', 'checkout', 'irse', 'departure'],
  partir:         ['salida', 'checkout', 'irse'],
  part:           ['salida', 'checkout', 'departure'], // fr: "on part" = we're leaving
  arriver:        ['check', 'llegada', 'acceso', 'entrada'],
  manger:         ['restaurante', 'restaurant', 'comida', 'comer', 'food'],
  voir:           ['visitas', 'turismo', 'monumentos', 'lugares'],
  stationnement:  ['parking', 'aparcamiento', 'coche', 'garaje'],
  cle:            ['llave', 'check', 'entrada', 'acceso', 'puerta'],
  voiture:        ['parking', 'aparcamiento', 'coche', 'garaje'],
};

// ---------------------------------------------------------------------------
// rankZonesByRelevance
// ---------------------------------------------------------------------------

export function rankZonesByRelevance(message: string, zones: unknown[], language: string): unknown[] {
  const normalize = (s: string) =>
    String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const rawWords = normalize(message).split(/\s+/).filter(w => w.length > 2);

  const expandedWords = [...rawWords];
  for (const word of rawWords) {
    const extras = QUERY_EXPANSIONS[word];
    if (extras) expandedWords.push(...extras.map(normalize));
  }
  const words = [...new Set(expandedWords)];

  // Only WiFi is unconditionally relevant — check-in/llegada removed because they
  // boosted the check-in zone for every query regardless of topic.
  const ALWAYS_RELEVANT = ['wifi', 'wi-fi'];

  const scored = (zones as any[]).map((zone: any) => {
    const zoneName = normalize(getLocalizedText(zone.name, language) || '');
    let score = 0;

    for (const word of words) {
      if (zoneName.includes(word)) {
        score += 15;
      } else if (zoneName.length >= 4 && word.includes(zoneName)) {
        score += 15;
      }
    }

    for (const step of (zone.steps || [])) {
      const content = step.content as any;
      const title = normalize(getLocalizedText(step.title, language) || '');
      const text = normalize(getLocalizedText(content, language) || '');
      const combined = `${title} ${text}`;
      for (const word of words) {
        if (combined.includes(word)) score += 4;
      }
    }

    for (const term of ALWAYS_RELEVANT) {
      if (zoneName.includes(term)) score += 2;
    }

    const hasMedia = (zone.steps || []).some((step: any) => {
      const content = step.content as any;
      const stepType = (step.type || '').toUpperCase();
      return content?.mediaUrl && (stepType === 'IMAGE' || stepType === 'VIDEO');
    });
    if (hasMedia) score += 1;

    return { zone, score };
  });

  scored.sort((a, b) => b.score - a.score || (a.zone.order ?? 0) - (b.zone.order ?? 0));

  const hasAnyMatch = scored[0]?.score > 0;
  const filtered = hasAnyMatch ? scored.filter(s => s.score > 0) : scored;

  // When the top zone has a strong name match (≥15), apply relative threshold:
  // discard zones scoring < 40% of the top score to avoid unrelated zones
  // (e.g. check-in getting a media bonus) polluting the context.
  const topScore = scored[0]?.score ?? 0;
  const relevantFiltered = topScore >= 15
    ? filtered.filter(s => s.score >= topScore * 0.4)
    : filtered;

  const top5 = relevantFiltered.slice(0, 5);

  // Guarantee at least one media zone — but ONLY from relevantFiltered (i.e. within the
  // relevance threshold). If the threshold was applied and no relevant zone has media,
  // we do NOT add an unrelated zone as bonus — showing check-in videos when someone
  // asks about the ceramic hob is worse than showing no media at all.
  const thresholdWasApplied = topScore >= 15;
  const hasMediaZone = top5.some(s =>
    (s.zone.steps || []).some((step: any) => {
      const content = step.content as any;
      const t = (step.type || '').toUpperCase();
      return content?.mediaUrl && (t === 'IMAGE' || t === 'VIDEO');
    })
  );
  if (!hasMediaZone) {
    // Only look for a bonus zone within the already-filtered relevant set.
    // If the threshold was applied, don't fall back to the broader filtered list.
    const bonusPool = thresholdWasApplied ? relevantFiltered : filtered;
    const bonus = bonusPool.find(s =>
      !top5.includes(s) &&
      (s.zone.steps || []).some((step: any) => {
        const content = step.content as any;
        const t = (step.type || '').toUpperCase();
        return content?.mediaUrl && (t === 'IMAGE' || t === 'VIDEO');
      })
    );
    if (bonus) top5.push(bonus);
  }

  return top5.map(s => ({ ...s.zone, _relevanceScore: s.score }));
}

// ---------------------------------------------------------------------------
// collectRelevantMedia
// ---------------------------------------------------------------------------

export function collectRelevantMedia(zones: unknown[], language: string): MediaItem[] {
  if (!(zones as any[]).length) return [];

  let bestItems: MediaItem[] = [];
  let bestScore = -1;

  for (const zone of zones as any[]) {
    if (zone.type === 'RECOMMENDATIONS') continue;
    const score = zone._relevanceScore ?? 0;
    if (score < 1) continue;

    const items: MediaItem[] = [];
    let stepNumber = 0;

    for (const step of (zone.steps || [])) {
      const content = step.content as any;
      if (!content?.mediaUrl) continue;
      const stepType = (step.type || '').toUpperCase();
      if (stepType !== 'IMAGE' && stepType !== 'VIDEO') continue;

      stepNumber++;
      const title = getLocalizedText(step.title, language) || '';
      const contentText = getLocalizedText(content, language) || '';
      const stepText = contentText || title || undefined;

      items.push({
        type: stepType as 'IMAGE' | 'VIDEO',
        url: content.mediaUrl,
        caption: title || getLocalizedText(zone.name, language) || '',
        stepText,
        stepIndex: stepNumber,
      });
      if (items.length >= 8) break;
    }

    if (items.length > 0 && score > bestScore) {
      bestScore = score;
      bestItems = items;
    }
  }

  return bestItems;
}

// ---------------------------------------------------------------------------
// detectUnansweredQuestion
// ---------------------------------------------------------------------------

export function detectUnansweredQuestion(aiResponse: string, _language: string): boolean {
  const lower = String(aiResponse || '').toLowerCase();

  const fallbackPhrases = [
    // Spanish
    'no tengo información',
    'no tengo esa información',
    'no tengo información específica',
    'no dispongo de esa información',
    'no dispongo de información',
    'no cuento con esa información',
    'no tengo los detalles',
    'contacta al anfitrión',
    'contacta directamente',
    'te recomiendo que contactes',
    'lo siento, no tengo',
    'lo siento, no dispongo',
    // English
    'contact the host',
    'contact your host',
    "don't have that information",
    "don't have specific information",
    "don't have information",
    "do not have specific information",
    "i don't have information",
    "i don't have the specific",
    "i'm sorry, but i don't",
    'i recommend contacting',
    // French
    "contactez l'hôte",
    "je n'ai pas cette information",
    "je ne dispose pas de cette information",
    "je n'ai pas d'information",
  ];

  return fallbackPhrases.some(phrase => lower.includes(phrase));
}
