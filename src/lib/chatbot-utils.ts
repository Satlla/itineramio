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
  open:         ['check', 'llave', 'puerta', 'acceso', 'entrada', 'door', 'access'],
  acceder:      ['check', 'acceso', 'entrada', 'llave', 'puerta', 'llegada'],
  accedo:       ['check', 'acceso', 'entrada', 'llave', 'puerta'],
  llego:        ['check', 'llegada', 'llave'],
  llegar:       ['check', 'llegada', 'llave'],
  llegada:      ['check', 'entrada', 'acceso', 'llave'],
  llegamos:     ['check', 'llegada', 'acceso', 'entrada', 'llave'],
  llegare:      ['check', 'llegada', 'acceso', 'entrada'],
  entrada:      ['check', 'acceso', 'llave', 'puerta', 'door'],
  acceso:       ['check', 'entrada', 'llave', 'puerta', 'door'],
  puerta:       ['check', 'llave', 'acceso', 'entrada', 'door', 'lockbox', 'codigo'],
  door:         ['puerta', 'acceso', 'entrada', 'llave', 'check', 'lockbox', 'codigo', 'access'],
  key:          ['llave', 'acceso', 'check', 'entrada', 'puerta', 'door', 'lockbox', 'codigo'],
  keys:         ['llave', 'acceso', 'check', 'entrada', 'puerta', 'door'],
  llave:        ['acceso', 'check', 'entrada', 'puerta', 'door', 'lockbox', 'codigo'],
  lockbox:      ['llave', 'check', 'entrada', 'puerta', 'codigo', 'caja'],
  codigo:       ['check', 'llave', 'entrada', 'puerta', 'acceso', 'lockbox'],
  code:         ['check', 'llave', 'entrada', 'puerta', 'lockbox', 'codigo'],
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
  leave:        ['salida', 'checkout', 'departure', 'leaving', 'irse', 'check-out'],
  leaving:      ['salida', 'checkout', 'departure', 'irse', 'check-out'],
  departure:    ['salida', 'checkout', 'leaving', 'irse', 'check-out'],
  salida:       ['checkout', 'departure', 'leaving', 'irse'],
  dejar:        ['salida', 'checkout', 'irse', 'llave'],
  dejo:         ['salida', 'checkout', 'llave', 'irse'],
  dejamos:      ['salida', 'checkout', 'llave', 'irse'],
  voy:          ['salida', 'checkout', 'irse'],
  vamos:        ['salida', 'checkout', 'irse'],

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
  calefaccion:    ['climatizacion', 'calefaccion', 'calor', 'temperatura', 'termostato', 'radiador', 'heating', 'aire'],
  calor:          ['aire', 'acondicionado', 'calefaccion', 'temperatura', 'termostato', 'ventilador'],
  frio:           ['aire', 'acondicionado', 'calefaccion', 'temperatura', 'calor'],
  temperatura:    ['aire', 'acondicionado', 'calefaccion', 'termostato', 'calor', 'frio'],
  termostato:     ['calefaccion', 'temperatura', 'calor', 'frio', 'aire'],
  heating:        ['calefaccion', 'calor', 'temperatura', 'termostato'],
  climatizacion:  ['aire', 'acondicionado', 'calefaccion', 'temperatura'],
  ac:             ['aire', 'acondicionado', 'climatizacion', 'calefaccion', 'temperatura'],

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
  aeropuerto:     ['aeropuerto', 'airport', 'vuelo', 'transporte', 'taxi', 'metro', 'bus'],
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
  maletas:        ['equipaje', 'storage', 'consigna', 'luggage', 'maleta'],
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
  extintor:       ['emergencias', 'urgencias', 'incendio', 'fuego', 'fire'],
  fuego:          ['emergencias', 'incendio', 'extintor', 'urgencias'],
  fire:           ['emergencias', 'incendio', 'extintor', 'urgencias'],
  urgente:        ['emergencias', 'urgencias', 'medico', 'policia'],
  accidente:      ['emergencias', 'urgencias', 'medico', 'hospital'],

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
  partons:        ['salida', 'checkout', 'irse', 'departure', 'check-out'],
  partir:         ['salida', 'checkout', 'irse'],
  part:           ['salida', 'checkout', 'departure', 'check-out'], // fr: "on part" = we're leaving
  depart:         ['salida', 'checkout', 'departure', 'leaving', 'check-out'],
  arriver:        ['check', 'llegada', 'acceso', 'entrada'],
  manger:         ['restaurante', 'restaurant', 'comida', 'comer', 'food'],
  voir:           ['visitas', 'turismo', 'monumentos', 'lugares'],
  stationnement:  ['parking', 'aparcamiento', 'coche', 'garaje'],
  cle:            ['llave', 'check', 'entrada', 'acceso', 'puerta'],
  voiture:        ['parking', 'aparcamiento', 'coche', 'garaje'],

  // ── ALEMÁN (DE) ─────────────────────────────────────────────────────────
  // Check-in
  eingang:        ['check', 'entrada', 'acceso', 'llave', 'puerta'],
  schlussel:      ['llave', 'check', 'entrada', 'acceso', 'puerta', 'lockbox'],  // Schlüssel
  tur:            ['puerta', 'check', 'llave', 'acceso', 'entrada', 'door'],     // Tür
  zugang:         ['check', 'acceso', 'entrada', 'llave', 'puerta'],
  ankunft:        ['check', 'llegada', 'acceso', 'entrada'],
  einchecken:     ['check', 'entrada', 'acceso', 'llave', 'llegada'],
  ankommen:       ['check', 'llegada', 'acceso', 'entrada'],
  // Check-out
  abreise:        ['salida', 'checkout', 'departure', 'irse', 'check-out'],
  auschecken:     ['salida', 'checkout', 'departure', 'check-out'],
  verlassen:      ['salida', 'checkout', 'departure', 'check-out'],
  abfahrt:        ['salida', 'checkout', 'departure', 'check-out'],
  // WiFi
  wlan:           ['wifi', 'wi-fi', 'internet', 'contrasena', 'password', 'red', 'network'],
  kennwort:       ['wifi', 'wi-fi', 'contrasena', 'password', 'internet'],
  passwort:       ['wifi', 'wi-fi', 'contrasena', 'password', 'internet'],
  verbindung:     ['wifi', 'wi-fi', 'internet', 'red', 'conexion'],
  // Cocina
  kuche:          ['cocina', 'kitchen', 'vitro', 'horno', 'microondas'],         // Küche
  kochen:         ['cocina', 'kitchen', 'vitro', 'horno'],
  herd:           ['cocina', 'vitro', 'placa', 'kitchen'],                       // Herd = hob
  backofen:       ['horno', 'cocina', 'kitchen', 'oven'],
  kuhlschrank:    ['nevera', 'frigorifico', 'cocina', 'kitchen'],                 // Kühlschrank
  geschirrspuler: ['lavavajillas', 'cocina', 'kitchen'],                          // Geschirrspüler
  waschmaschine:  ['lavadora', 'laundry', 'washing'],
  // Clima
  heizung:        ['calefaccion', 'climatizacion', 'temperatura', 'termostato'],
  klimaanlage:    ['aire', 'acondicionado', 'climatizacion', 'ac', 'temperatura'],
  temperatur:     ['temperatura', 'climatizacion', 'calefaccion', 'termostato'],
  // Parking
  parkplatz:      ['parking', 'aparcamiento', 'coche', 'garaje'],
  parken:         ['parking', 'aparcamiento', 'coche', 'garaje'],
  // Restaurantes
  restaurant:     ['restaurante', 'comida', 'comer', 'food', 'dinner'],
  essen:          ['restaurante', 'comida', 'comer', 'food', 'tapas'],
  trinken:        ['bar', 'restaurante', 'cafe', 'comida'],
  // Turismo
  sehenswurdigkeiten: ['visitas', 'turismo', 'monumentos', 'lugares'],
  ausflug:        ['visitas', 'turismo', 'actividades', 'lugares'],
  // Emergencias
  notfall:        ['emergencias', 'urgencias', 'medico', 'policia'],
  feuerwehr:      ['emergencias', 'incendio', 'extintor', 'fuego'],
  // Toallas/ropa
  handtucher:     ['toallas', 'ropa', 'cama', 'sabanas'],                        // Handtücher
  bettwäsche:     ['sabanas', 'cama', 'ropa', 'toallas'],
  laken:          ['sabanas', 'cama', 'ropa'],

  // ── ITALIANO (IT) ───────────────────────────────────────────────────────
  // Check-in
  entrata:        ['check', 'entrada', 'acceso', 'llave', 'puerta'],
  chiave:         ['llave', 'check', 'entrada', 'acceso', 'puerta', 'lockbox'],
  porta:          ['puerta', 'check', 'llave', 'acceso', 'entrada', 'door'],
  arrivo:         ['check', 'llegada', 'acceso', 'entrada'],
  accesso:        ['check', 'acceso', 'entrada', 'llave', 'puerta'],
  codice:         ['check', 'llave', 'entrada', 'puerta', 'lockbox', 'codigo'],
  // Check-out
  partenza:       ['salida', 'checkout', 'departure', 'irse', 'check-out'],
  uscita:         ['salida', 'checkout', 'departure', 'check-out'],
  andare:         ['salida', 'checkout', 'departure', 'check-out'],
  lasciare:       ['salida', 'checkout', 'llave', 'irse'],
  // WiFi
  rete:           ['wifi', 'wi-fi', 'internet', 'red', 'network'],
  parola:         ['wifi', 'wi-fi', 'contrasena', 'password'],                   // parola d'ordine
  // Cocina
  cucina:         ['cocina', 'kitchen', 'vitro', 'horno', 'microondas'],
  cucinare:       ['cocina', 'kitchen', 'vitro', 'horno'],
  fornello:       ['cocina', 'vitro', 'placa', 'kitchen'],
  forno:          ['horno', 'cocina', 'kitchen', 'oven'],
  frigorifero:    ['nevera', 'frigorifico', 'cocina', 'kitchen'],
  lavatrice:      ['lavadora', 'laundry', 'washing'],
  // Clima
  riscaldamento:  ['calefaccion', 'climatizacion', 'temperatura', 'termostato'],
  condizionatore: ['aire', 'acondicionado', 'climatizacion', 'ac', 'temperatura'],
  aria:           ['aire', 'acondicionado', 'climatizacion', 'temperatura'],
  // Parking
  parcheggio:     ['parking', 'aparcamiento', 'coche', 'garaje'],
  // Restaurantes
  ristorante:     ['restaurante', 'comida', 'comer', 'food'],
  mangiare:       ['restaurante', 'comida', 'comer', 'food'],
  // Turismo
  visitare:       ['visitas', 'turismo', 'monumentos', 'lugares'],
  // Emergencias
  emergenza:      ['emergencias', 'urgencias', 'medico', 'policia'],
  // Toallas
  asciugamani:    ['toallas', 'ropa', 'cama', 'sabanas'],
  lenzuola:       ['sabanas', 'cama', 'ropa', 'toallas'],

  // ── PORTUGUÉS (PT) ──────────────────────────────────────────────────────
  // Check-in
  chave:          ['llave', 'check', 'entrada', 'acceso', 'puerta', 'lockbox'],
  porta2:         ['puerta', 'check', 'llave', 'acceso', 'entrada'],              // alias, 'porta' is IT
  chegada:        ['check', 'llegada', 'acceso', 'entrada'],
  acesso:         ['check', 'acceso', 'entrada', 'llave', 'puerta'],
  // Check-out
  saida:          ['salida', 'checkout', 'departure', 'irse', 'check-out'],
  sair:           ['salida', 'checkout', 'departure', 'check-out'],
  partida:        ['salida', 'checkout', 'departure', 'check-out'],
  // WiFi
  senha:          ['wifi', 'wi-fi', 'contrasena', 'password', 'internet'],
  // Cocina
  cozinha:        ['cocina', 'kitchen', 'vitro', 'horno', 'microondas'],
  cozinhar:       ['cocina', 'kitchen', 'vitro', 'horno'],
  fogao:          ['cocina', 'vitro', 'placa', 'kitchen'],                        // fogão
  geladeira:      ['nevera', 'frigorifico', 'cocina', 'kitchen'],
  maquina:        ['lavadora', 'laundry', 'washing'],
  // Clima
  aquecimento:    ['calefaccion', 'climatizacion', 'temperatura', 'termostato'],
  arcondicionado: ['aire', 'acondicionado', 'climatizacion', 'ac', 'temperatura'],
  // Parking
  estacionamento: ['parking', 'aparcamiento', 'coche', 'garaje'],
  vaga:           ['parking', 'aparcamiento', 'garaje'],
  // Restaurantes
  restaurante2:   ['restaurante', 'comida', 'comer', 'food'],                     // shared with ES
  comer2:         ['restaurante', 'comida', 'food'],
  // Emergencias
  emergencia2:    ['emergencias', 'urgencias', 'medico', 'policia'],
  // Toallas
  toalhas:        ['toallas', 'ropa', 'cama', 'sabanas'],
  lencois:        ['sabanas', 'cama', 'ropa', 'toallas'],                         // lençóis

  // ── NEERLANDÉS (NL) ─────────────────────────────────────────────────────
  sleutel:        ['llave', 'check', 'entrada', 'acceso', 'puerta', 'lockbox'],
  deur:           ['puerta', 'check', 'llave', 'acceso', 'entrada', 'door'],
  aankomst:       ['check', 'llegada', 'acceso', 'entrada'],
  inchecken:      ['check', 'entrada', 'acceso', 'llave', 'llegada'],
  uitchecken:     ['salida', 'checkout', 'departure', 'check-out'],
  vertrek:        ['salida', 'checkout', 'departure', 'check-out'],
  keuken:         ['cocina', 'kitchen', 'vitro', 'horno'],
  wasmachine:     ['lavadora', 'laundry', 'washing'],
  verwarming:     ['calefaccion', 'climatizacion', 'temperatura'],
  airco:          ['aire', 'acondicionado', 'climatizacion', 'ac'],
  parkeren:       ['parking', 'aparcamiento', 'coche', 'garaje'],
  noodgeval:      ['emergencias', 'urgencias', 'medico'],
  handdoeken:     ['toallas', 'ropa', 'cama', 'sabanas'],
};

// ---------------------------------------------------------------------------
// rankZonesByRelevance
// ---------------------------------------------------------------------------

// Words that match too broadly and cause zone contamination.
// E.g. "que" matches "Qué ver y hacer"; "are" matches "ceramic"; "hacer" matches zone name.
// These are function words, articles, and common verbs with no zone-specific meaning.
const QUERY_STOPWORDS = new Set([
  // Spanish 2-char function words (short enough to substring-match zone names falsely)
  // e.g. "la" matches "toallas", "no" matches "normas", "es" matches "acceso"
  'la', 'el', 'en', 'es', 'al', 'no', 'de', 'se', 'me', 'te', 'le', 'lo',
  'un', 'si', 'ya', 'mi',
  // Spanish function/question words (3+ chars)
  'que', 'qui', 'cual', 'con', 'los', 'las', 'del', 'una', 'hay', 'por',
  'sin', 'nos', 'sus', 'les', 'mas', 'son', 'fue', 'han', 'hoy', 'ese',
  'eso', 'esa', 'uno', 'muy', 'vez', 'asi', 'tra', 'dos', 'ser', 'sea',
  'era', 'dar', 'soy', 'vas', 'van',
  // Spanish question/common words
  'como',
  // Spanish common verbs that pollute zone-name matching
  'hace', 'hacer', 'podemos', 'tenemos', 'queremos', 'pueden', 'tiene', 'tienen',
  'quiero', 'quiere', 'necesito', 'necesita', 'busco', 'busca',
  // English 2-char function words (e.g. "we"→"towels", "on"→"conditioning", "to"→"towels")
  'we', 'on', 'is', 'to', 'do', 'it', 'an', 'at', 'in', 'of', 'up',
  'as', 'be', 'by', 'if', 'go', 'so',
  // English articles/prepositions/pronouns (3+ chars)
  'the', 'and', 'are', 'for', 'was', 'but', 'not', 'can', 'its',
  'had', 'his', 'her', 'she', 'him', 'who', 'all', 'any', 'out',
  'did', 'has', 'get', 'put', 'may', 'see', 'too', 'now', 'our',
  'use', 'how', 'let',
  // French articles/prepositions
  'les', 'des', 'une', 'est', 'pas', 'sur', 'par', 'son', 'ses',
  'lui', 'mon', 'ton', 'quelle', 'quel',
  // German 2-char function words
  'zu', 'im', 'am', 'um', 'ab', 'ob', 'da', 'wo', 'du', 'er', 'es', 'ihr',
  // Italian 2-char function words
  'di', 'il', 'lo', 'la', 'li', 'ci', 'mi', 'ti', 'si', 'ne', 'ho', 'ha',
  // Portuguese 2-char function words
  'em', 'ao', 'os', 'as', 'um', 'eu', 'tu', 'ele', 'ela',
  // Dutch 2-char function words
  'de', 'het', 'een', 'van', 'op', 'in', 'te', 'aan', 'bij',
]);

export function rankZonesByRelevance(message: string, zones: unknown[], language: string): unknown[] {
  const normalize = (s: string) =>
    String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Replace apostrophes/curly quotes with space so "j'entrer" splits into "j" + "entrer"
  const cleaned = normalize(message).replace(/['\u2018\u2019]/g, ' ');
  const rawWords = cleaned.split(/\s+/).filter(w => w.length >= 2 && !QUERY_STOPWORDS.has(w));

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
    if (score < 2) continue; // score=1 means only the media bonus (+1), no keyword match — skip

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
    'no cuento con información',
    'no tengo los detalles',
    'contacta al anfitrión',
    'contactar al anfitrión',
    'contactes al anfitrión',
    'contacta directamente',
    'te recomiendo que contactes',
    'recomiendo que contactes',
    'lo siento, no tengo',
    'lo siento, no dispongo',
    // English
    'contact the host',
    'contact your host',
    'reach out to the host',
    'contacting the host',
    "don't have that information",
    "don't have specific information",
    "don't have information",
    "do not have specific information",
    "do not have that information",
    "i don't have information",
    "i don't have the specific",
    "i don't have details",
    "i'm sorry, but i don't",
    "i am sorry, but i don't",
    'i recommend contacting',
    'suggest contacting the host',
    // French
    "contactez l'hôte",
    "contacter l'hôte",
    "je n'ai pas cette information",
    "je ne dispose pas de cette information",
    "je n'ai pas d'information",
    "je n'ai pas les détails",
    "je vous recommande de contacter",
    // German
    'ich habe keine information',
    'ich weiß es nicht',
    'kontaktieren sie den gastgeber',
    'bitte kontaktieren sie',
    'leider habe ich keine',
    'diese information habe ich nicht',
    // Italian
    'non ho informazioni',
    'non dispongo di questa informazione',
    'contatta il proprietario',
    'ti consiglio di contattare',
    'mi dispiace, non ho',
    // Portuguese
    'não tenho informações',
    'não tenho essa informação',
    'entre em contato com o anfitrião',
    'recomendo que contacte',
    'infelizmente não tenho',
    // Dutch
    'ik heb geen informatie',
    'neem contact op met de host',
    'helaas heb ik geen',
  ];

  return fallbackPhrases.some(phrase => lower.includes(phrase));
}

// ---------------------------------------------------------------------------
// GuestProfile + extractGuestProfile
// ---------------------------------------------------------------------------

export interface GuestProfile {
  section: string;
  transportMode: 'walking' | 'car' | null;
}

export function extractGuestProfile(conversationHistory: Array<{ role: string; content: string }>): GuestProfile {
  if (!conversationHistory.length) return { section: '', transportMode: null };

  const fullText = conversationHistory
    .filter(m => m.role === 'user')
    .map(m => (typeof m.content === 'string' ? m.content : ''))
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (!fullText || fullText.length < 5) return { section: '', transportMode: null };

  const profile: string[] = [];

  // Group size
  const groupMatch = fullText.match(
    /somos\s+(\w+)|we(?:'re| are)\s+(\d+)|(\d+)\s+(?:personas|people|adults|adultos|viajeros)|estamos\s+(\d+)/
  );
  if (groupMatch) {
    const raw = groupMatch[1] || groupMatch[2] || groupMatch[3] || groupMatch[4];
    const numWords: Record<string, number> = { dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, two: 2, three: 3, four: 4, five: 5, six: 6 };
    const num = parseInt(raw) || numWords[raw] || null;
    if (num && num > 0 && num < 20) profile.push(`Grupo de ${num} personas`);
  }

  // With kids/babies
  if (/\b(ninos|ninas|hijos|hijas|kids|children|bebes|bebe|infants|toddler|infant)\b/.test(fullText)) {
    profile.push('Viajan con niños/bebés');
  }

  // Trip type
  if (/\b(pareja|couple|romantic|romantico|aniversario|anniversary|honeymoon|luna de miel)\b/.test(fullText)) {
    profile.push('Viaje en pareja/romántico');
  } else if (/\b(familia|family)\b/.test(fullText)) {
    profile.push('Viaje familiar');
  } else if (/\b(amigos|friends|grupo de amigos|bachelor|bachelorette|despedida)\b/.test(fullText)) {
    profile.push('Grupo de amigos');
  } else if (/\b(trabajo|business|negocios|conference|congreso|conferencia)\b/.test(fullText)) {
    profile.push('Viaje de negocios');
  }

  // Food preferences
  if (/\b(vegetarian|vegetariano[s]?|vegano[s]?|vegan[s]?|plant.based)\b/.test(fullText)) {
    profile.push('Preferencia: vegetariano/vegano');
  }
  if (/\b(alerg|gluten|celiac|celiaco|intolerancia|sin gluten)\b/.test(fullText)) {
    profile.push('Posible alergia/intolerancia alimentaria');
  }
  if (/\b(marisco[s]?|seafood|pescado[s]?)\b/.test(fullText)) {
    profile.push('Le gusta: marisco/pescado');
  }

  // Budget / style
  if (/\b(economico[s]?|barato[s]?|cheap|budget|affordable|precio bajo)\b/.test(fullText)) {
    profile.push('Presupuesto: económico');
  } else if (/\b(gourmet|lujo|luxury|especial|fine dining|high.end|precio no importa)\b/.test(fullText)) {
    profile.push('Presupuesto: premium/gourmet');
  }

  // Experience type
  if (/\b(tranquilo|quiet|relax|descansar|descanso|chill|relajado)\b/.test(fullText)) {
    profile.push('Busca: ambiente tranquilo/relajado');
  } else if (/\b(marcha|party|fiesta|nightlife|vida nocturna|discoteca|club|bares)\b/.test(fullText)) {
    profile.push('Busca: vida nocturna/marcha');
  }

  if (/\b(cultura|cultural|museo|monument|historia|history|arte|art)\b/.test(fullText)) {
    profile.push('Interés: cultura/historia/arte');
  }
  if (/\b(naturaleza|nature|senderismo|hiking|outdoor|aire libre|montana|playa)\b/.test(fullText)) {
    profile.push('Interés: naturaleza/outdoor');
  }

  // Transport mode
  let transportMode: 'walking' | 'car' | null = null;
  if (/\b(no tenemos coche|sin coche|no car|a pie|andando|caminando|walking|en metro|en bus|en transporte|no tenemos vehiculo|no tenemos transporte|vamos caminando|iremos andando|moving on foot|on foot)\b/.test(fullText)) {
    transportMode = 'walking';
    profile.push('Transporte: a pie (sin coche)');
  } else if (/\b(tenemos coche|vamos en coche|iremos en coche|alquilamos coche|alquiler de coche|rental car|we have a car|by car|en coche|en auto|en vehiculo|con coche)\b/.test(fullText)) {
    transportMode = 'car';
    profile.push('Transporte: en coche');
  }

  const section = profile.length === 0
    ? ''
    : `\nPERFIL DETECTADO DEL HUÉSPED:\n${profile.map(p => `- ${p}`).join('\n')}\nUsa este perfil para personalizar tus respuestas. No preguntes de nuevo algo que ya sabes.\n`;

  return { section, transportMode };
}
