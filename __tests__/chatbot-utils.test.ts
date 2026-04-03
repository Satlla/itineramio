/**
 * Tests exhaustivos para chatbot-utils.ts
 *
 * Cubren los fallos reales detectados en producción:
 * - "como va la vitro" mezclaba check-in con cocina
 * - El LLM decía "no tengo info" sobre vitro pero mostraba check-in
 * - Zonas con score bajo (media bonus) contaminaban el contexto
 * - La garantía de media reintroducía zonas filtradas
 */

import { describe, it, expect } from 'vitest';
import {
  getLocalizedText,
  rankZonesByRelevance,
  collectRelevantMedia,
  detectUnansweredQuestion,
  QUERY_EXPANSIONS,
} from '../src/lib/chatbot-utils';

// ---------------------------------------------------------------------------
// Helpers para construir zonas de prueba
// ---------------------------------------------------------------------------

function makeZone(overrides: {
  id?: string;
  name: string | Record<string, string>;
  order?: number;
  type?: string;
  steps?: any[];
  recommendations?: any[];
  _relevanceScore?: number;
}) {
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2),
    name: overrides.name,
    description: '',
    order: overrides.order ?? 0,
    type: overrides.type ?? 'INSTRUCTIONS',
    steps: overrides.steps ?? [],
    recommendations: overrides.recommendations ?? [],
    _relevanceScore: overrides._relevanceScore ?? 0,
  };
}

function makeStep(text: string, mediaUrl?: string, type = 'TEXT') {
  return {
    title: { es: text },
    content: { es: text, ...(mediaUrl ? { mediaUrl } : {}) },
    type: mediaUrl ? (type === 'TEXT' ? 'IMAGE' : type) : 'TEXT',
    id: Math.random().toString(36).slice(2),
  };
}

function makeVideoStep(text: string, mediaUrl: string) {
  return {
    title: { es: text },
    content: { es: text, mediaUrl },
    type: 'VIDEO',
    id: Math.random().toString(36).slice(2),
  };
}

// ── Zonas realistas ──────────────────────────────────────────────────────────

const zoneCheckin = makeZone({
  name: { es: 'Check-in y acceso', en: 'Check-in and access' },
  order: 1,
  steps: [
    makeStep('Entra desde las 16:00 h'),
    makeStep('El código de acceso se enviará antes de tu llegada'),
    makeVideoStep('Apertura remota del edificio', 'https://example.com/checkin.mp4'),
    makeStep('Sube al tercer piso. Código: 123456'),
  ],
});

const zoneCocina = makeZone({
  name: { es: 'Cocina', en: 'Kitchen' },
  order: 2,
  steps: [
    makeStep('Los mandos de la derecha controlan la vitrocerámica'),
    makeStep('Los mandos de la izquierda son del horno'),
    makeStep('En el cajón encontrarás aceite, sal y especias'),
  ],
});

const zoneVitro = makeZone({
  name: { es: 'Vitrocerámica', en: 'Ceramic hob' },
  order: 3,
  steps: [
    makeStep('Usa los mandos de la derecha para la vitro'),
    makeStep('No dejes nada encima cuando no la uses'),
  ],
});

const zoneWifi = makeZone({
  name: { es: 'WiFi', en: 'WiFi' },
  order: 4,
  steps: [
    makeStep('Red: Itineramio_5G'),
    makeStep('Contraseña: balcon2024#'),
  ],
});

const zoneNormas = makeZone({
  name: { es: 'Normas de la casa', en: 'House rules' },
  order: 5,
  steps: [
    makeStep('No fumar en el interior'),
    makeStep('Silencio a partir de las 22:00 h'),
  ],
});

const zoneCheckout = makeZone({
  name: { es: 'Check-out y salida', en: 'Check-out' },
  order: 6,
  steps: [
    makeStep('Deja las llaves dentro antes de salir'),
    makeStep('El check-out es antes de las 11:00 h'),
  ],
});

const zoneParking = makeZone({
  name: { es: 'Parking', en: 'Parking' },
  order: 7,
  steps: [
    makeStep('Plaza B-14. El pase magnético está en el cajón'),
  ],
});

const zoneRecomendaciones = makeZone({
  name: { es: 'Restaurantes', en: 'Restaurants' },
  type: 'RECOMMENDATIONS',
  order: 8,
  recommendations: [{ place: { name: 'El Bodegón' } }],
});

const ALL_ZONES = [
  zoneCheckin,
  zoneCocina,
  zoneVitro,
  zoneWifi,
  zoneNormas,
  zoneCheckout,
  zoneParking,
  zoneRecomendaciones,
];

// ===========================================================================
// getLocalizedText
// ===========================================================================

describe('getLocalizedText', () => {
  it('devuelve string directamente', () => {
    expect(getLocalizedText('hola', 'es')).toBe('hola');
  });

  it('devuelve el idioma solicitado', () => {
    expect(getLocalizedText({ es: 'Cocina', en: 'Kitchen' }, 'en')).toBe('Kitchen');
  });

  it('cae a español si no existe el idioma', () => {
    expect(getLocalizedText({ es: 'Cocina' }, 'fr')).toBe('Cocina');
  });

  it('cae a inglés si no hay español ni francés', () => {
    expect(getLocalizedText({ en: 'Kitchen' }, 'fr')).toBe('Kitchen');
  });

  it('maneja contenido anidado { es: { text: "..." } }', () => {
    expect(getLocalizedText({ es: { text: 'Texto anidado' } }, 'es')).toBe('Texto anidado');
  });

  it('devuelve vacío para null/undefined', () => {
    expect(getLocalizedText(null, 'es')).toBe('');
    expect(getLocalizedText(undefined, 'es')).toBe('');
  });

  it('devuelve vacío para objeto vacío', () => {
    expect(getLocalizedText({}, 'es')).toBe('');
  });
});

// ===========================================================================
// QUERY_EXPANSIONS — invariantes clave
// ===========================================================================

describe('QUERY_EXPANSIONS', () => {
  it('"como" NO existe como clave (palabra interrogativa)', () => {
    expect(QUERY_EXPANSIONS['como']).toBeUndefined();
  });

  it('"vitro" expande a cocina y vitroceramica', () => {
    expect(QUERY_EXPANSIONS['vitro']).toContain('cocina');
    expect(QUERY_EXPANSIONS['vitro']).toContain('vitroceramica');
  });

  it('"wifi" expande a internet y contrasena', () => {
    expect(QUERY_EXPANSIONS['wifi']).toContain('internet');
    expect(QUERY_EXPANSIONS['wifi']).toContain('contrasena');
  });

  it('"checkin" expande a check y llave', () => {
    expect(QUERY_EXPANSIONS['checkin']).toContain('check');
    expect(QUERY_EXPANSIONS['checkin']).toContain('llave');
  });

  it('"checkout" expande a salida y departure', () => {
    expect(QUERY_EXPANSIONS['checkout']).toContain('salida');
    expect(QUERY_EXPANSIONS['checkout']).toContain('departure');
  });

  it('ninguna expansión contiene "como" como valor', () => {
    const allValues = Object.values(QUERY_EXPANSIONS).flat();
    expect(allValues).not.toContain('como');
  });
});

// ===========================================================================
// rankZonesByRelevance — el corazón del sistema
// ===========================================================================

describe('rankZonesByRelevance', () => {

  // ── Bug real: "como va la vitro" ──────────────────────────────────────────

  it('BUG REAL: "como va la vitro" → cocina/vitro primero, NO check-in', () => {
    const result = rankZonesByRelevance('como va la vitro', ALL_ZONES, 'es') as any[];
    const first = result[0];
    const firstName = (first.name?.es || first.name || '').toLowerCase();
    // La primera zona debe ser cocina o vitrocerámica
    expect(
      firstName.includes('cocina') || firstName.includes('vitro')
    ).toBe(true);
    // Check-in NO debe ser la primera
    expect(firstName).not.toContain('check');
  });

  it('BUG REAL: "como va la vitro" → check-in no aparece en resultado', () => {
    const result = rankZonesByRelevance('como va la vitro', ALL_ZONES, 'es') as any[];
    const names = result.map((z: any) => (z.name?.es || z.name || '').toLowerCase());
    const hasCheckin = names.some(n => n.includes('check-in') || n.includes('acceso'));
    expect(hasCheckin).toBe(false);
  });

  it('BUG REAL: filtro relativo — check-in no entra si topScore >= 15 y su score < 40%', () => {
    // check-in tiene score ~2 (media bonus) vs vitro ~15+ (nombre)
    const result = rankZonesByRelevance('vitrocerámica', ALL_ZONES, 'es') as any[];
    const hasCheckin = (result as any[]).some((z: any) =>
      (z.name?.es || z.name || '').toLowerCase().includes('check')
    );
    expect(hasCheckin).toBe(false);
  });

  // ── Consultas de check-in ─────────────────────────────────────────────────

  it('"cómo entro" → check-in primero', () => {
    const result = rankZonesByRelevance('cómo entro al apartamento', ALL_ZONES, 'es') as any[];
    const firstName = (result[0].name?.es || '').toLowerCase();
    expect(firstName).toContain('check');
  });

  it('"checkin a qué hora" → check-in primero', () => {
    const result = rankZonesByRelevance('checkin a qué hora puedo llegar', ALL_ZONES, 'es') as any[];
    const firstName = (result[0].name?.es || '').toLowerCase();
    expect(firstName).toContain('check');
  });

  it('"cuál es el código de acceso" → check-in primero', () => {
    const result = rankZonesByRelevance('cuál es el código de acceso', ALL_ZONES, 'es') as any[];
    const firstName = (result[0].name?.es || '').toLowerCase();
    expect(firstName).toContain('check');
  });

  // ── Consultas de WiFi ─────────────────────────────────────────────────────

  it('"wifi password" → WiFi primero', () => {
    const result = rankZonesByRelevance('wifi password', ALL_ZONES, 'es') as any[];
    const firstName = (result[0].name?.es || result[0].name?.en || '').toLowerCase();
    expect(firstName).toContain('wifi');
  });

  it('"cuál es la contraseña del wifi" → WiFi primero', () => {
    const result = rankZonesByRelevance('cuál es la contraseña del wifi', ALL_ZONES, 'es') as any[];
    const firstName = (result[0].name?.es || result[0].name?.en || '').toLowerCase();
    expect(firstName).toContain('wifi');
  });

  it('"no me conecto a internet" → WiFi primero', () => {
    const result = rankZonesByRelevance('no me conecto a internet', ALL_ZONES, 'es') as any[];
    const firstName = (result[0].name?.es || result[0].name?.en || '').toLowerCase();
    expect(firstName).toContain('wifi');
  });

  // ── Consultas de check-out ────────────────────────────────────────────────

  it('"checkout hora" → checkout primero', () => {
    const result = rankZonesByRelevance('checkout hora', ALL_ZONES, 'es') as any[];
    const firstName = (result[0].name?.es || '').toLowerCase();
    expect(firstName).toContain('check-out');
  });

  it('"a qué hora salimos" → checkout primero', () => {
    const result = rankZonesByRelevance('a qué hora salimos mañana', ALL_ZONES, 'es') as any[];
    const firstName = (result[0].name?.es || '').toLowerCase();
    expect(firstName).toContain('check-out');
  });

  it('"checkout no interfiere con checkin" cuando preguntas salida', () => {
    const result = rankZonesByRelevance('checkout', ALL_ZONES, 'es') as any[];
    const firstName = (result[0].name?.es || '').toLowerCase();
    expect(firstName).toContain('check-out');
    expect(firstName).not.toContain('check-in');
  });

  // ── Consultas de cocina ───────────────────────────────────────────────────

  it('"cocina" → zona cocina primero', () => {
    const result = rankZonesByRelevance('cocina', ALL_ZONES, 'es') as any[];
    const firstName = (result[0].name?.es || '').toLowerCase();
    expect(firstName).toContain('cocin');
  });

  it('"horno" → zona cocina primero', () => {
    const result = rankZonesByRelevance('horno', ALL_ZONES, 'es') as any[];
    const firstName = (result[0].name?.es || '').toLowerCase();
    expect(firstName).toContain('cocin');
  });

  it('"kitchen" (inglés) → zona cocina primero', () => {
    const result = rankZonesByRelevance('how do I use the kitchen', ALL_ZONES, 'en') as any[];
    const firstNameEs = (result[0].name?.es || '').toLowerCase();
    expect(firstNameEs).toContain('cocin');
  });

  // ── Consultas de parking ──────────────────────────────────────────────────

  it('"parking" → zona parking primero', () => {
    const result = rankZonesByRelevance('parking', ALL_ZONES, 'es') as any[];
    const firstName = (result[0].name?.es || result[0].name?.en || '').toLowerCase();
    expect(firstName).toContain('parking');
  });

  it('"dónde aparco el coche" → parking primero', () => {
    const result = rankZonesByRelevance('dónde aparco el coche', ALL_ZONES, 'es') as any[];
    const firstName = (result[0].name?.es || result[0].name?.en || '').toLowerCase();
    expect(firstName).toContain('parking');
  });

  // ── Consultas de normas ───────────────────────────────────────────────────

  it('"se puede fumar" → normas primero', () => {
    const result = rankZonesByRelevance('se puede fumar', ALL_ZONES, 'es') as any[];
    const firstName = (result[0].name?.es || '').toLowerCase();
    expect(firstName).toContain('norma');
  });

  it('"mascotas permitidas" → normas primero', () => {
    const result = rankZonesByRelevance('están permitidas las mascotas', ALL_ZONES, 'es') as any[];
    const firstName = (result[0].name?.es || '').toLowerCase();
    expect(firstName).toContain('norma');
  });

  // ── Consultas genéricas ───────────────────────────────────────────────────

  it('consulta genérica sin match → devuelve zonas (no vacío)', () => {
    const result = rankZonesByRelevance('hola', ALL_ZONES, 'es') as any[];
    expect(result.length).toBeGreaterThan(0);
  });

  it('mensaje vacío → devuelve zonas', () => {
    const result = rankZonesByRelevance('', ALL_ZONES, 'es') as any[];
    expect(result.length).toBeGreaterThan(0);
  });

  it('zonas vacías → devuelve array vacío', () => {
    const result = rankZonesByRelevance('vitro', [], 'es');
    expect(result).toEqual([]);
  });

  // ── Top 5 limit ───────────────────────────────────────────────────────────

  it('nunca devuelve más de 6 zonas (top5 + bonus media)', () => {
    const result = rankZonesByRelevance('hola', ALL_ZONES, 'es') as any[];
    expect(result.length).toBeLessThanOrEqual(6);
  });

  // ── Relevance score adjunto ───────────────────────────────────────────────

  it('todas las zonas devueltas tienen _relevanceScore', () => {
    const result = rankZonesByRelevance('vitro', ALL_ZONES, 'es') as any[];
    for (const z of result) {
      expect(typeof (z as any)._relevanceScore).toBe('number');
    }
  });

  it('la primera zona tiene el score más alto', () => {
    const result = rankZonesByRelevance('wifi', ALL_ZONES, 'es') as any[];
    const scores = result.map((z: any) => z._relevanceScore as number);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[0]).toBeGreaterThanOrEqual(scores[i]);
    }
  });

  // ── Idiomas ───────────────────────────────────────────────────────────────

  it('query en inglés "how do I check out" → checkout primero', () => {
    const result = rankZonesByRelevance('how do I check out', ALL_ZONES, 'en') as any[];
    const firstName = (result[0].name?.en || result[0].name?.es || '').toLowerCase();
    expect(firstName).toContain('check-out');
  });

  it('query en francés "sortir" → checkout primero', () => {
    const result = rankZonesByRelevance('sortir demain', ALL_ZONES, 'fr') as any[];
    const firstName = (result[0].name?.es || '').toLowerCase();
    expect(firstName).toContain('check-out');
  });

  // ── Filtro relativo ───────────────────────────────────────────────────────

  it('filtro relativo: zona con score < 40% del top se excluye cuando top >= 15', () => {
    // Cocina score ~15+, check-in score ~2 (media bonus) → check-in excluido
    const result = rankZonesByRelevance('vitro', ALL_ZONES, 'es') as any[];
    const scores = result.map((z: any) => z._relevanceScore as number);
    const topScore = scores[0];
    if (topScore >= 15) {
      for (const score of scores) {
        expect(score).toBeGreaterThanOrEqual(topScore * 0.4);
      }
    }
  });

  // ── Zona con nombre exacto ────────────────────────────────────────────────

  it('zona con nombre exacto "WiFi" tiene score >= 15', () => {
    const result = rankZonesByRelevance('wifi', ALL_ZONES, 'es') as any[];
    const wifiZone = result.find((z: any) =>
      (z.name?.es || z.name?.en || '').toLowerCase().includes('wifi')
    ) as any;
    expect(wifiZone).toBeDefined();
    expect(wifiZone._relevanceScore).toBeGreaterThanOrEqual(15);
  });
});

// ===========================================================================
// collectRelevantMedia
// ===========================================================================

describe('collectRelevantMedia', () => {
  it('devuelve vacío si no hay zonas', () => {
    expect(collectRelevantMedia([], 'es')).toEqual([]);
  });

  it('devuelve vacío si ninguna zona tiene media', () => {
    const zones = [
      { ...zoneCocina, _relevanceScore: 15 },
      { ...zoneNormas, _relevanceScore: 10 },
    ];
    expect(collectRelevantMedia(zones, 'es')).toEqual([]);
  });

  it('devuelve media de la zona con score más alto', () => {
    const zones = [
      { ...zoneCheckin, _relevanceScore: 20 }, // tiene video
      { ...zoneCocina, _relevanceScore: 5 },    // sin media
    ];
    const media = collectRelevantMedia(zones, 'es');
    expect(media.length).toBeGreaterThan(0);
    expect(media[0].url).toBe('https://example.com/checkin.mp4');
  });

  it('ignora zonas de tipo RECOMMENDATIONS', () => {
    const zones = [
      { ...zoneRecomendaciones, _relevanceScore: 20 },
      { ...zoneCheckin, _relevanceScore: 15 },
    ];
    const media = collectRelevantMedia(zones, 'es');
    // debe venir de checkin, no de recomendaciones
    expect(media[0]?.url).toBe('https://example.com/checkin.mp4');
  });

  it('ignora zonas con score < 1', () => {
    const zones = [
      { ...zoneCheckin, _relevanceScore: 0 },
    ];
    expect(collectRelevantMedia(zones, 'es')).toEqual([]);
  });

  it('devuelve máximo 8 items por zona', () => {
    const steps = Array.from({ length: 15 }, (_, i) =>
      makeStep(`Paso ${i}`, `https://example.com/img${i}.jpg`)
    );
    const zone = { ...makeZone({ name: 'Test', steps }), _relevanceScore: 10 };
    const media = collectRelevantMedia([zone], 'es');
    expect(media.length).toBeLessThanOrEqual(8);
  });

  it('type es IMAGE o VIDEO según el step', () => {
    const zones = [{ ...zoneCheckin, _relevanceScore: 15 }];
    const media = collectRelevantMedia(zones, 'es');
    for (const item of media) {
      expect(['IMAGE', 'VIDEO']).toContain(item.type);
    }
  });

  it('incluye stepIndex (1-based)', () => {
    const zones = [{ ...zoneCheckin, _relevanceScore: 15 }];
    const media = collectRelevantMedia(zones, 'es');
    expect(media[0].stepIndex).toBe(1);
  });

  it('prefiere zona con mayor score aunque aparezca después en el array', () => {
    const lowZone = makeZone({
      name: 'Zona Baja',
      steps: [makeStep('Imagen baja', 'https://example.com/low.jpg')],
      _relevanceScore: 5,
    });
    const highZone = makeZone({
      name: 'Zona Alta',
      steps: [makeStep('Video alto', 'https://example.com/high.mp4')],
      _relevanceScore: 20,
    });
    // lowZone primero en array, highZone después
    const media = collectRelevantMedia([lowZone, highZone], 'es');
    expect(media[0].url).toBe('https://example.com/high.mp4');
  });
});

// ===========================================================================
// detectUnansweredQuestion
// ===========================================================================

describe('detectUnansweredQuestion', () => {
  it('detecta "no tengo información" en español', () => {
    expect(detectUnansweredQuestion('Lo siento, no tengo información sobre eso.', 'es')).toBe(true);
  });

  it('detecta "contacta al anfitrión"', () => {
    expect(detectUnansweredQuestion('Te recomiendo que contactes al anfitrión.', 'es')).toBe(true);
  });

  it('detecta frase en inglés "contact the host"', () => {
    expect(detectUnansweredQuestion("I don't have that information, please contact the host.", 'en')).toBe(true);
  });

  it('detecta frase en francés', () => {
    expect(detectUnansweredQuestion("Je n'ai pas cette information.", 'fr')).toBe(true);
  });

  it('retorna false para respuesta normal', () => {
    expect(detectUnansweredQuestion('La vitrocerámica se controla con los mandos de la derecha.', 'es')).toBe(false);
  });

  it('retorna false para respuesta vacía', () => {
    expect(detectUnansweredQuestion('', 'es')).toBe(false);
  });

  it('es case-insensitive', () => {
    expect(detectUnansweredQuestion('NO TENGO INFORMACIÓN ESPECÍFICA sobre eso.', 'es')).toBe(true);
  });

  it('detecta "lo siento, no tengo"', () => {
    expect(detectUnansweredQuestion('Lo siento, no tengo los detalles exactos.', 'es')).toBe(true);
  });

  it('detecta variante inglesa "i\'m sorry, but i don\'t"', () => {
    expect(detectUnansweredQuestion("I'm sorry, but I don't have that information available.", 'en')).toBe(true);
  });
});

// ===========================================================================
// Tests de integración: queries reales de producción
// ===========================================================================

describe('Queries reales de producción', () => {

  it('"como va la vitro ??" → vitro/cocina, nunca check-in', () => {
    const result = rankZonesByRelevance('como va la vitro ??', ALL_ZONES, 'es') as any[];
    expect(result.length).toBeGreaterThan(0);
    const first = result[0] as any;
    const name = (first.name?.es || '').toLowerCase();
    expect(name.includes('vitro') || name.includes('cocin')).toBe(true);
    expect(name).not.toContain('check-in');
  });

  it('"wifi password por favor" → solo wifi, no check-in', () => {
    const result = rankZonesByRelevance('wifi password por favor', ALL_ZONES, 'es') as any[];
    const firstName = (result[0].name?.es || result[0].name?.en || '').toLowerCase();
    expect(firstName).toContain('wifi');
    expect(firstName).not.toContain('check');
  });

  it('"a qué hora es el checkout" → solo checkout, no check-in', () => {
    const result = rankZonesByRelevance('a qué hora es el checkout', ALL_ZONES, 'es') as any[];
    const firstName = (result[0].name?.es || '').toLowerCase();
    expect(firstName).toContain('check-out');
    expect(firstName).not.toContain('check-in');
  });

  it('"how does the ceramic hob work" (inglés) → cocina/vitro', () => {
    const result = rankZonesByRelevance('how does the ceramic hob work', ALL_ZONES, 'en') as any[];
    const first = result[0] as any;
    const name = (first.name?.es || first.name?.en || '').toLowerCase();
    // debe matchear vitro/cocina
    expect(name.includes('vitro') || name.includes('cocin') || name.includes('kitchen')).toBe(true);
  });

  it('"on part demain, comment ferme-t-on" (francés) → checkout/salida', () => {
    const result = rankZonesByRelevance('on part demain, comment ferme-t-on', ALL_ZONES, 'fr') as any[];
    const firstName = (result[0].name?.es || '').toLowerCase();
    // "part" expande a salida a través de "partir"
    expect(firstName.includes('check-out') || firstName.includes('salida')).toBe(true);
  });

  it('"ruido hasta qué hora" → normas, no check-in', () => {
    const result = rankZonesByRelevance('ruido hasta qué hora podemos hacer', ALL_ZONES, 'es') as any[];
    const firstName = (result[0].name?.es || '').toLowerCase();
    expect(firstName).toContain('norma');
  });

  it('"dónde aparco" → parking, no check-in', () => {
    const result = rankZonesByRelevance('dónde aparco el coche', ALL_ZONES, 'es') as any[];
    const firstName = (result[0].name?.es || result[0].name?.en || '').toLowerCase();
    expect(firstName).toContain('parking');
  });
});
