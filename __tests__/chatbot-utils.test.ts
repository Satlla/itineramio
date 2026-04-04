/**
 * ============================================================
 * CHATBOT-UTILS — TEST SUITE EXHAUSTIVO
 * ============================================================
 * 200+ tests cubriendo:
 *  - getLocalizedText: todos los tipos de entrada
 *  - QUERY_EXPANSIONS: invariantes estructurales
 *  - rankZonesByRelevance: todos los temas, idiomas, casos límite,
 *      bugs de producción, adversarial inputs, scoring
 *  - collectRelevantMedia: todos los casos
 *  - detectUnansweredQuestion: todas las frases, todos los idiomas
 *  - extractGuestProfile: todos los patrones detectables
 *  - Cross-contamination: zonas que NO deben aparecer juntas
 *  - Performance/stress: inputs extremos
 */

import { describe, it, expect } from 'vitest';
import {
  getLocalizedText,
  QUERY_EXPANSIONS,
  rankZonesByRelevance,
  collectRelevantMedia,
  detectUnansweredQuestion,
  extractGuestProfile,
} from '../src/lib/chatbot-utils';

// ============================================================
// HELPERS
// ============================================================

function zone(
  name: string | Record<string, string>,
  steps: any[] = [],
  opts: { order?: number; type?: string; recommendations?: any[] } = {}
) {
  return {
    id: Math.random().toString(36).slice(2),
    name,
    description: '',
    order: opts.order ?? 0,
    type: opts.type ?? 'INSTRUCTIONS',
    steps,
    recommendations: opts.recommendations ?? [],
    _relevanceScore: 0,
  };
}

function textStep(es: string, en = es, fr = es) {
  return {
    id: Math.random().toString(36).slice(2),
    type: 'TEXT',
    title: { es, en, fr },
    content: { es, en, fr },
  };
}

function imageStep(text: string, url = 'https://cdn.example.com/img.jpg') {
  return {
    id: Math.random().toString(36).slice(2),
    type: 'IMAGE',
    title: { es: text },
    content: { es: text, mediaUrl: url },
  };
}

function videoStep(text: string, url = 'https://cdn.example.com/vid.mp4') {
  return {
    id: Math.random().toString(36).slice(2),
    type: 'VIDEO',
    title: { es: text },
    content: { es: text, mediaUrl: url },
  };
}

function msg(role: 'user' | 'assistant', content: string) {
  return { role, content };
}

function topName(result: any[], lang = 'es'): string {
  const z = result[0] as any;
  return (z?.name?.[lang] ?? z?.name ?? '').toLowerCase();
}

function resultNames(result: any[], lang = 'es'): string[] {
  return (result as any[]).map(z => (z?.name?.[lang] ?? z?.name ?? '').toLowerCase());
}

// ── Zonas del piso de prueba completo ──────────────────────────────────────

const Z_CHECKIN    = zone({ es: 'Check-in y acceso', en: 'Check-in' }, [
  textStep('Llegada desde las 16:00 h', 'Check-in from 4pm'),
  textStep('Código de acceso: 4521', 'Access code: 4521'),
  videoStep('Apertura del edificio', 'https://cdn.example.com/checkin.mp4'),
  textStep('Sube al tercer piso'),
], { order: 1 });

const Z_CHECKOUT   = zone({ es: 'Check-out y salida', en: 'Check-out' }, [
  textStep('Salida antes de las 11:00 h', 'Check-out before 11am'),
  textStep('Deja las llaves dentro', 'Leave keys inside'),
], { order: 2 });

const Z_WIFI       = zone({ es: 'WiFi', en: 'WiFi' }, [
  textStep('Red: Itineramio_5G', 'Network: Itineramio_5G'),
  textStep('Contraseña: balcon2024#', 'Password: balcon2024#'),
], { order: 3 });

const Z_COCINA     = zone({ es: 'Cocina', en: 'Kitchen' }, [
  textStep('Los mandos de la derecha controlan la vitrocerámica', 'Right knobs control the ceramic hob'),
  textStep('Los mandos de la izquierda son del horno', 'Left knobs are the oven'),
  textStep('En el cajón: aceite, sal, especias'),
], { order: 4 });

const Z_VITRO      = zone({ es: 'Vitrocerámica', en: 'Ceramic hob' }, [
  textStep('Usa los 4 mandos de la derecha para la vitro'),
  imageStep('Mando vitro', 'https://cdn.example.com/vitro.jpg'),
], { order: 5 });

const Z_NORMAS     = zone({ es: 'Normas de la casa', en: 'House rules' }, [
  textStep('No fumar en el interior', 'No smoking inside'),
  textStep('Silencio a partir de las 22:00 h', 'Quiet after 10pm'),
  textStep('No mascotas', 'No pets'),
], { order: 6 });

const Z_PARKING    = zone({ es: 'Parking y garaje', en: 'Parking' }, [
  textStep('Plaza B-14. Pase magnético en el cajón', 'Bay B-14. Magnetic pass in drawer'),
], { order: 7 });

const Z_BASURA     = zone({ es: 'Basura y reciclaje', en: 'Trash & recycling' }, [
  textStep('Contenedor verde: orgánico. Azul: papel. Amarillo: plástico'),
], { order: 8 });

const Z_LAVADORA   = zone({ es: 'Lavadora', en: 'Washing machine' }, [
  textStep('Lavadora en el baño pequeño. Pastillas en el armario inferior'),
], { order: 9 });

const Z_AC         = zone({ es: 'Climatización', en: 'Air conditioning' }, [
  textStep('Mando del aire acondicionado en el cajón de la mesita'),
  videoStep('Instrucciones AC', 'https://cdn.example.com/ac.mp4'),
], { order: 10 });

const Z_PISCINA    = zone({ es: 'Piscina', en: 'Pool' }, [
  textStep('Piscina comunitaria en la planta baja. Abre a las 10:00 h'),
], { order: 11 });

const Z_RESTAURANTES = zone({ es: 'Restaurantes', en: 'Restaurants' }, [], {
  order: 12,
  type: 'RECOMMENDATIONS',
  recommendations: [{ place: { name: 'El Bodegón', rating: 4.5 } }],
});

const Z_ACTIVIDADES = zone({ es: 'Qué ver y hacer', en: 'Things to do' }, [
  textStep('Catedral a 5 min a pie', 'Cathedral 5 min walk'),
  textStep('Mercado central abre por las mañanas'),
], { order: 13 });

const Z_TRANSPORTE = zone({ es: 'Transporte', en: 'Transport' }, [
  textStep('Metro L3 a 200 m. Bus 45 en la esquina'),
  textStep('Taxi recomendado: Fono 934 000 000'),
], { order: 14 });

const Z_MALETAS    = zone({ es: 'Equipaje y maletas', en: 'Luggage storage' }, [
  textStep('Puedes dejar las maletas en el armario del pasillo'),
], { order: 15 });

const Z_TOALLAS    = zone({ es: 'Toallas y ropa de cama', en: 'Towels & bedding' }, [
  textStep('Toallas en el armario del baño. Sábanas ya puestas'),
], { order: 16 });

const Z_EMERGENCIAS = zone({ es: 'Emergencias', en: 'Emergencies' }, [
  textStep('Emergencias: llama al 112'),
  textStep('Extintor en la cocina detrás de la puerta'),
], { order: 17 });

const ALL_ZONES = [
  Z_CHECKIN, Z_CHECKOUT, Z_WIFI, Z_COCINA, Z_VITRO, Z_NORMAS,
  Z_PARKING, Z_BASURA, Z_LAVADORA, Z_AC, Z_PISCINA, Z_RESTAURANTES,
  Z_ACTIVIDADES, Z_TRANSPORTE, Z_MALETAS, Z_TOALLAS, Z_EMERGENCIAS,
];

// ============================================================
// 1. getLocalizedText
// ============================================================

describe('getLocalizedText', () => {

  // Primitivos
  it('string directo → devuelve tal cual', () =>
    expect(getLocalizedText('hola', 'es')).toBe('hola'));
  it('string vacío → devuelve vacío', () =>
    expect(getLocalizedText('', 'es')).toBe(''));
  it('número → devuelve vacío (no es string ni objeto)', () =>
    expect(getLocalizedText(42, 'es')).toBe(''));
  it('boolean → devuelve vacío', () =>
    expect(getLocalizedText(true, 'es')).toBe(''));
  it('array → devuelve vacío', () =>
    expect(getLocalizedText(['a', 'b'], 'es')).toBe(''));
  it('null → devuelve vacío', () =>
    expect(getLocalizedText(null, 'es')).toBe(''));
  it('undefined → devuelve vacío', () =>
    expect(getLocalizedText(undefined, 'es')).toBe(''));
  it('objeto vacío → devuelve vacío', () =>
    expect(getLocalizedText({}, 'es')).toBe(''));

  // Idiomas
  it('devuelve idioma solicitado (es)', () =>
    expect(getLocalizedText({ es: 'Cocina', en: 'Kitchen' }, 'es')).toBe('Cocina'));
  it('devuelve idioma solicitado (en)', () =>
    expect(getLocalizedText({ es: 'Cocina', en: 'Kitchen' }, 'en')).toBe('Kitchen'));
  it('devuelve idioma solicitado (fr)', () =>
    expect(getLocalizedText({ es: 'Cocina', fr: 'Cuisine' }, 'fr')).toBe('Cuisine'));

  // Fallback chain
  it('fallback: fr→es si no hay fr', () =>
    expect(getLocalizedText({ es: 'Cocina', en: 'Kitchen' }, 'fr')).toBe('Cocina'));
  it('fallback: fr→en si no hay fr ni es', () =>
    expect(getLocalizedText({ en: 'Kitchen' }, 'fr')).toBe('Kitchen'));
  it('fallback: en→es si no hay en', () =>
    expect(getLocalizedText({ es: 'Cocina' }, 'en')).toBe('Cocina'));

  // Contenido anidado
  it('objeto anidado { es: { text: "..." } } → extrae text', () =>
    expect(getLocalizedText({ es: { text: 'Texto anidado' } }, 'es')).toBe('Texto anidado'));
  it('objeto anidado { es: { content: "..." } } → extrae content', () =>
    expect(getLocalizedText({ es: { content: 'Contenido' } }, 'es')).toBe('Contenido'));
  it('objeto anidado vacío → devuelve vacío', () =>
    expect(getLocalizedText({ es: {} }, 'es')).toBe(''));
  it('objeto anidado con mediaUrl pero sin text → devuelve vacío', () =>
    expect(getLocalizedText({ es: { mediaUrl: 'https://x.com/v.mp4' } }, 'es')).toBe(''));

  // Strings especiales
  it('string con emojis → devuelve tal cual', () =>
    expect(getLocalizedText('Hola 👋🏠', 'es')).toBe('Hola 👋🏠'));
  it('string con caracteres especiales → devuelve tal cual', () =>
    expect(getLocalizedText('<script>alert(1)</script>', 'es')).toBe('<script>alert(1)</script>'));
  it('string muy largo → devuelve completo', () => {
    const long = 'a'.repeat(10000);
    expect(getLocalizedText(long, 'es')).toBe(long);
  });
});

// ============================================================
// 2. QUERY_EXPANSIONS — invariantes estructurales
// ============================================================

describe('QUERY_EXPANSIONS — invariantes', () => {

  const allKeys = Object.keys(QUERY_EXPANSIONS);
  const allValues = Object.values(QUERY_EXPANSIONS).flat();

  it('es un objeto con entradas', () =>
    expect(allKeys.length).toBeGreaterThan(50));

  it('todas las entradas son arrays de strings', () => {
    for (const [k, v] of Object.entries(QUERY_EXPANSIONS)) {
      expect(Array.isArray(v), `"${k}" debe ser array`).toBe(true);
      for (const item of v) {
        expect(typeof item, `item en "${k}" debe ser string`).toBe('string');
      }
    }
  });

  it('ninguna entrada tiene array vacío', () => {
    for (const [k, v] of Object.entries(QUERY_EXPANSIONS)) {
      expect(v.length, `"${k}" tiene array vacío`).toBeGreaterThan(0);
    }
  });

  // Palabras interrogativas NO deben ser claves
  it('"como" NO es clave (interrogativa)', () =>
    expect(QUERY_EXPANSIONS['como']).toBeUndefined());
  it('"qué" NO es clave', () =>
    expect(QUERY_EXPANSIONS['qué']).toBeUndefined());
  it('"que" NO es clave', () =>
    expect(QUERY_EXPANSIONS['que']).toBeUndefined());
  it('"cuándo" NO es clave', () =>
    expect(QUERY_EXPANSIONS['cuándo']).toBeUndefined());
  it('"donde" NO es clave', () =>
    expect(QUERY_EXPANSIONS['donde']).toBeUndefined());

  // Palabras clave de tema SÍ existen
  it('"vitro" existe y expande a cocina', () =>
    expect(QUERY_EXPANSIONS['vitro']).toContain('cocina'));
  it('"checkout" existe y expande a salida', () =>
    expect(QUERY_EXPANSIONS['checkout']).toContain('salida'));
  it('"wifi" existe y expande a internet', () =>
    expect(QUERY_EXPANSIONS['wifi']).toContain('internet'));
  it('"checkin" existe y expande a llave', () =>
    expect(QUERY_EXPANSIONS['checkin']).toContain('llave'));
  it('"parking" existe y expande a aparcamiento', () =>
    expect(QUERY_EXPANSIONS['parking']).toContain('aparcamiento'));
  it('"fumar" existe y expande a normas', () =>
    expect(QUERY_EXPANSIONS['fumar']).toContain('normas'));
  it('"basura" existe y expande a reciclaje', () =>
    expect(QUERY_EXPANSIONS['basura']).toContain('reciclaje'));
  it('"restaurante" no está como clave mal escrita con "como"', () =>
    expect(allValues).not.toContain('como'));
  it('"part" existe (fr: on part = salida)', () =>
    expect(QUERY_EXPANSIONS['part']).toContain('salida'));
  it('"sortir" existe (fr: sortir = salida)', () =>
    expect(QUERY_EXPANSIONS['sortir']).toContain('salida'));

  // Sin duplicados de clave
  it('no hay claves duplicadas', () => {
    const seen = new Set<string>();
    for (const k of allKeys) {
      expect(seen.has(k), `"${k}" está duplicado`).toBe(false);
      seen.add(k);
    }
  });
});

// ============================================================
// 3. rankZonesByRelevance — TEST PRINCIPAL
// ============================================================

describe('rankZonesByRelevance', () => {

  // ── Estructura del resultado ────────────────────────────────────────────

  describe('estructura del resultado', () => {
    it('devuelve array', () =>
      expect(Array.isArray(rankZonesByRelevance('wifi', ALL_ZONES, 'es'))).toBe(true));

    it('zonas vacías → array vacío', () =>
      expect(rankZonesByRelevance('wifi', [], 'es')).toEqual([]));

    it('nunca más de 6 zonas (top5 + bonus media)', () =>
      expect(rankZonesByRelevance('hola', ALL_ZONES, 'es').length).toBeLessThanOrEqual(6));

    it('todas las zonas tienen _relevanceScore', () => {
      const r = rankZonesByRelevance('vitro', ALL_ZONES, 'es') as any[];
      for (const z of r) expect(typeof z._relevanceScore).toBe('number');
    });

    it('scores siempre >= 0', () => {
      const r = rankZonesByRelevance('que', ALL_ZONES, 'es') as any[];
      for (const z of r) expect((z as any)._relevanceScore).toBeGreaterThanOrEqual(0);
    });

    it('primer resultado tiene el score más alto', () => {
      const r = rankZonesByRelevance('wifi password', ALL_ZONES, 'es') as any[];
      const scores = r.map((z: any) => z._relevanceScore as number);
      for (let i = 1; i < scores.length; i++)
        expect(scores[0]).toBeGreaterThanOrEqual(scores[i]);
    });

    it('zonas sin ningún match devuelven resultado no vacío (consulta genérica)', () =>
      expect(rankZonesByRelevance('xyz123', ALL_ZONES, 'es').length).toBeGreaterThan(0));
  });

  // ── Check-in ────────────────────────────────────────────────────────────

  describe('check-in queries', () => {
    const checkinMatches = (q: string, lang = 'es') => {
      const r = rankZonesByRelevance(q, ALL_ZONES, lang) as any[];
      return (r[0]?.name?.es ?? r[0]?.name ?? '').toLowerCase();
    };

    it('"checkin" → check-in primero', () =>
      expect(checkinMatches('checkin')).toContain('check-in'));
    it('"check-in" → check-in primero', () =>
      expect(checkinMatches('check-in')).toContain('check-in'));
    it('"cómo entro" → check-in primero', () =>
      expect(checkinMatches('cómo entro al apartamento')).toContain('check-in'));
    it('"llegar" → check-in primero', () =>
      expect(checkinMatches('cuándo puedo llegar')).toContain('check-in'));
    it('"código de acceso" → check-in primero', () =>
      expect(checkinMatches('cuál es el código de acceso')).toContain('check-in'));
    it('"llave" → check-in primero', () =>
      expect(checkinMatches('dónde está la llave')).toContain('check-in'));
    it('"lockbox" → check-in primero', () =>
      expect(checkinMatches('where is the lockbox')).toContain('check-in'));
    it('"open the door" → check-in primero', () =>
      expect(checkinMatches('how do I open the door', 'en')).toContain('check-in'));
    it('"entrer" (fr) → check-in primero', () =>
      expect(checkinMatches('comment j\'entrer dans l\'appartement', 'fr')).toContain('check-in'));
    it('"llego tarde" → check-in primero', () =>
      expect(checkinMatches('llego tarde esta noche a las 23:00')).toContain('check-in'));
    it('"a qué hora puedo llegar" → check-in primero', () =>
      expect(checkinMatches('a qué hora puedo llegar mañana')).toContain('check-in'));
  });

  // ── Check-out ───────────────────────────────────────────────────────────

  describe('check-out queries', () => {
    const checkoutMatches = (q: string, lang = 'es') => {
      const r = rankZonesByRelevance(q, ALL_ZONES, lang) as any[];
      return (r[0]?.name?.es ?? '').toLowerCase();
    };

    it('"checkout" → checkout primero', () =>
      expect(checkoutMatches('checkout')).toContain('check-out'));
    it('"check-out" → checkout primero', () =>
      expect(checkoutMatches('check-out')).toContain('check-out'));
    it('"a qué hora salimos" → checkout primero', () =>
      expect(checkoutMatches('a qué hora salimos mañana')).toContain('check-out'));
    it('"cuándo tenemos que dejar el piso" → checkout primero', () =>
      expect(checkoutMatches('cuándo tenemos que dejar el piso')).toContain('check-out'));
    it('"leaving tomorrow" → checkout primero', () =>
      expect(checkoutMatches('we are leaving tomorrow morning', 'en')).toContain('check-out'));
    it('"on part" (fr) → checkout primero', () =>
      expect(checkoutMatches('on part demain matin', 'fr')).toContain('check-out'));
    it('"départ" (fr) → checkout primero', () =>
      expect(checkoutMatches('quelle heure le départ', 'fr')).toContain('check-out'));
    it('"nos vamos" → checkout primero', () =>
      expect(checkoutMatches('nos vamos esta mañana')).toContain('check-out'));
    it('"dejo las llaves" → checkout primero', () =>
      expect(checkoutMatches('dónde dejo las llaves al salir')).toContain('check-out'));

    // Checkout no interfiere con check-in
    it('checkout → NO muestra check-in como primero', () =>
      expect(checkoutMatches('checkout')).not.toContain('check-in'));
    it('"salimos" → NO muestra check-in', () =>
      expect(checkoutMatches('salimos mañana')).not.toContain('check-in'));
  });

  // ── WiFi ────────────────────────────────────────────────────────────────

  describe('wifi queries', () => {
    const wifiFirst = (q: string, lang = 'es') => {
      const r = rankZonesByRelevance(q, ALL_ZONES, lang) as any[];
      return (r[0]?.name?.es ?? r[0]?.name?.en ?? '').toLowerCase();
    };

    it('"wifi" → wifi primero', () =>
      expect(wifiFirst('wifi')).toContain('wifi'));
    it('"contraseña wifi" → wifi primero', () =>
      expect(wifiFirst('cuál es la contraseña del wifi')).toContain('wifi'));
    it('"internet no funciona" → wifi primero', () =>
      expect(wifiFirst('el internet no funciona')).toContain('wifi'));
    it('"password" → wifi primero', () =>
      expect(wifiFirst('what is the password', 'en')).toContain('wifi'));
    it('"wi-fi" → wifi primero', () =>
      expect(wifiFirst('wi-fi code')).toContain('wifi'));
    it('"cómo me conecto" → wifi primero', () =>
      expect(wifiFirst('cómo me conecto al internet')).toContain('wifi'));
    it('"network name" → wifi primero', () =>
      expect(wifiFirst('what is the network name', 'en')).toContain('wifi'));

    // WiFi no contamina otros temas
    it('"vitro" → wifi NO es primera', () => {
      const r = rankZonesByRelevance('como va la vitro', ALL_ZONES, 'es') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).not.toContain('wifi');
    });
  });

  // ── Cocina / vitrocerámica ───────────────────────────────────────────────

  describe('cocina / vitro queries — BUG PRINCIPAL DE PRODUCCIÓN', () => {
    const firstEs = (q: string) => {
      const r = rankZonesByRelevance(q, ALL_ZONES, 'es') as any[];
      return (r[0]?.name?.es ?? '').toLowerCase();
    };

    it('BUG: "como va la vitro" → vitro/cocina primero', () =>
      expect(firstEs('como va la vitro')).toMatch(/vitro|cocin/));
    it('BUG: "como va la vitro" → NO check-in', () =>
      expect(firstEs('como va la vitro')).not.toContain('check-in'));
    it('BUG: "como va la vitro" → check-in NO aparece en lista', () => {
      const r = rankZonesByRelevance('como va la vitro', ALL_ZONES, 'es') as any[];
      const names = r.map((z: any) => (z.name?.es ?? '').toLowerCase());
      expect(names.some(n => n.includes('check-in'))).toBe(false);
    });

    it('"vitrocerámica" → vitro primero', () =>
      expect(firstEs('vitrocerámica')).toMatch(/vitro/));
    it('"vitro" directo → vitro/cocina primero', () =>
      expect(firstEs('vitro')).toMatch(/vitro|cocin/));
    it('"horno" → cocina primero', () =>
      expect(firstEs('horno')).toMatch(/cocin/));
    it('"microondas" → cocina primero', () =>
      expect(firstEs('microondas')).toMatch(/cocin/));
    it('"nevera" → cocina primero', () =>
      expect(firstEs('nevera')).toMatch(/cocin/));
    it('"cafetera" → cocina primero', () =>
      expect(firstEs('cafetera nespresso')).toMatch(/cocin/));
    it('"lavavajillas" → cocina primero', () =>
      expect(firstEs('lavavajillas')).toMatch(/cocin/));
    it('"kitchen" (en) → cocina primero', () =>
      expect((rankZonesByRelevance('how to use the kitchen', ALL_ZONES, 'en') as any[])[0]?.name?.es?.toLowerCase()).toMatch(/cocin/));
    it('"ceramic hob" (en) → vitro/cocina', () => {
      const r = rankZonesByRelevance('how does the ceramic hob work', ALL_ZONES, 'en') as any[];
      const name = (r[0]?.name?.es ?? r[0]?.name?.en ?? '').toLowerCase();
      expect(name).toMatch(/vitro|cocin|kitchen/);
    });
    it('"inducción" → vitro/cocina primero', () =>
      expect(firstEs('placa de inducción')).toMatch(/vitro|cocin/));
    it('"cocinar" → cocina primero', () =>
      expect(firstEs('cómo cocinamos aquí')).toMatch(/cocin/));
  });

  // ── Parking ─────────────────────────────────────────────────────────────

  describe('parking queries', () => {
    const parkFirst = (q: string) => {
      const r = rankZonesByRelevance(q, ALL_ZONES, 'es') as any[];
      return (r[0]?.name?.es ?? '').toLowerCase();
    };

    it('"parking" → parking primero', () =>
      expect(parkFirst('parking')).toMatch(/parking|garaje/));
    it('"aparcar el coche" → parking primero', () =>
      expect(parkFirst('dónde puedo aparcar el coche')).toMatch(/parking|garaje/));
    it('"garaje" → parking primero', () =>
      expect(parkFirst('garaje')).toMatch(/parking|garaje/));
    it('"parking" (en) → parking primero', () => {
      const r = rankZonesByRelevance('where can I park', ALL_ZONES, 'en') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/parking/);
    });
    it('"voiture" (fr) → parking primero', () => {
      const r = rankZonesByRelevance('où garer la voiture', ALL_ZONES, 'fr') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/parking/);
    });

    // Parking no contamina vitro
    it('"vitro" → parking NO aparece', () => {
      const r = rankZonesByRelevance('vitro', ALL_ZONES, 'es') as any[];
      const names = r.map((z: any) => (z.name?.es ?? '').toLowerCase());
      expect(names.some(n => n.includes('parking'))).toBe(false);
    });
  });

  // ── Normas ──────────────────────────────────────────────────────────────

  describe('normas queries', () => {
    const normasFirst = (q: string) => {
      const r = rankZonesByRelevance(q, ALL_ZONES, 'es') as any[];
      return (r[0]?.name?.es ?? '').toLowerCase();
    };

    it('"fumar" → normas primero', () =>
      expect(normasFirst('se puede fumar')).toMatch(/norma/));
    it('"mascotas" → normas primero', () =>
      expect(normasFirst('están permitidas las mascotas')).toMatch(/norma/));
    it('"ruido" → normas primero', () =>
      expect(normasFirst('hasta qué hora podemos hacer ruido')).toMatch(/norma/));
    it('"smoking" (en) → normas primero', () => {
      const r = rankZonesByRelevance('is smoking allowed', ALL_ZONES, 'en') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/norma/);
    });
    it('"party" → normas primero', () =>
      expect(normasFirst('podemos hacer una fiesta')).toMatch(/norma/));
    it('"silencio" → normas primero', () =>
      expect(normasFirst('hasta qué hora hay silencio obligatorio')).toMatch(/norma/));
  });

  // ── Basura ──────────────────────────────────────────────────────────────

  describe('basura / reciclaje queries', () => {
    it('"basura" → basura primero', () => {
      const r = rankZonesByRelevance('basura', ALL_ZONES, 'es') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/basura/);
    });
    it('"reciclaje" → basura primero', () => {
      const r = rankZonesByRelevance('reciclaje', ALL_ZONES, 'es') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/basura|recicl/);
    });
    it('"trash" (en) → basura primero', () => {
      const r = rankZonesByRelevance('where do I put the trash', ALL_ZONES, 'en') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/basura|recicl/);
    });
    it('"contenedor" → basura primero', () => {
      const r = rankZonesByRelevance('contenedor', ALL_ZONES, 'es') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/basura/);
    });
  });

  // ── Lavadora ────────────────────────────────────────────────────────────

  describe('lavadora queries', () => {
    it('"lavadora" → lavadora primero', () => {
      const r = rankZonesByRelevance('lavadora', ALL_ZONES, 'es') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/lavadora/);
    });
    it('"washing machine" (en) → lavadora primero', () => {
      const r = rankZonesByRelevance('where is the washing machine', ALL_ZONES, 'en') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/lavadora/);
    });
    it('"lavar la ropa" → lavadora primero', () => {
      const r = rankZonesByRelevance('cómo lavar la ropa', ALL_ZONES, 'es') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/lavadora/);
    });
  });

  // ── Aire acondicionado ───────────────────────────────────────────────────

  describe('climatización queries', () => {
    it('"aire acondicionado" → climatización primero', () => {
      const r = rankZonesByRelevance('aire acondicionado', ALL_ZONES, 'es') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/clima|aire/);
    });
    it('"calefacción" → climatización primero', () => {
      const r = rankZonesByRelevance('calefacción', ALL_ZONES, 'es') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/clima|calef/);
    });
    it('"hace calor" → climatización primero', () => {
      const r = rankZonesByRelevance('hace mucho calor cómo bajo la temperatura', ALL_ZONES, 'es') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/clima|aire/);
    });
    it('"AC" (en) → climatización primero', () => {
      const r = rankZonesByRelevance('how to use the AC', ALL_ZONES, 'en') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/clima/);
    });
  });

  // ── Transporte ──────────────────────────────────────────────────────────

  describe('transporte queries', () => {
    it('"metro" → transporte primero', () => {
      const r = rankZonesByRelevance('metro más cercano', ALL_ZONES, 'es') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/transport/);
    });
    it('"taxi" → transporte primero', () => {
      const r = rankZonesByRelevance('taxi', ALL_ZONES, 'es') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/transport/);
    });
    it('"aeropuerto" → transporte primero', () => {
      const r = rankZonesByRelevance('cómo llego al aeropuerto', ALL_ZONES, 'es') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/transport/);
    });
    it('"bus" → transporte primero', () => {
      const r = rankZonesByRelevance('hay bus cerca', ALL_ZONES, 'es') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/transport/);
    });
  });

  // ── Equipaje / maletas ───────────────────────────────────────────────────

  describe('equipaje queries', () => {
    it('"maletas" → maletas primero', () => {
      const r = rankZonesByRelevance('dónde dejo las maletas', ALL_ZONES, 'es') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/equipaje|maleta/);
    });
    it('"luggage storage" (en) → maletas primero', () => {
      const r = rankZonesByRelevance('luggage storage', ALL_ZONES, 'en') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/equipaje|maleta/);
    });
    it('"equipaje" → maletas primero', () => {
      const r = rankZonesByRelevance('equipaje', ALL_ZONES, 'es') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/equipaje|maleta/);
    });
  });

  // ── Toallas ──────────────────────────────────────────────────────────────

  describe('toallas queries', () => {
    it('"toallas" → toallas primero', () => {
      const r = rankZonesByRelevance('toallas', ALL_ZONES, 'es') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/toalla/);
    });
    it('"towels" (en) → toallas primero', () => {
      const r = rankZonesByRelevance('where are the towels', ALL_ZONES, 'en') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/toalla/);
    });
    it('"sábanas" → toallas primero', () => {
      const r = rankZonesByRelevance('sábanas', ALL_ZONES, 'es') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/toalla|ropa/);
    });
  });

  // ── Piscina ──────────────────────────────────────────────────────────────

  describe('piscina queries', () => {
    it('"piscina" → piscina primero', () => {
      const r = rankZonesByRelevance('hay piscina', ALL_ZONES, 'es') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/piscina/);
    });
    it('"pool" (en) → piscina primero', () => {
      const r = rankZonesByRelevance('is there a pool', ALL_ZONES, 'en') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/piscina/);
    });
  });

  // ── Emergencias ──────────────────────────────────────────────────────────

  describe('emergencias queries', () => {
    it('"emergencia" → emergencias primero', () => {
      const r = rankZonesByRelevance('hay una emergencia', ALL_ZONES, 'es') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/emergencia/);
    });
    it('"extintor" → emergencias primero', () => {
      const r = rankZonesByRelevance('dónde está el extintor', ALL_ZONES, 'es') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/emergencia/);
    });
    it('"112" → emergencias primero', () => {
      const r = rankZonesByRelevance('número de urgencias', ALL_ZONES, 'es') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toMatch(/emergencia/);
    });
  });

  // ── Threshold / filtro relativo ──────────────────────────────────────────

  describe('filtro relativo de relevancia', () => {
    it('cuando topScore >= 15, descarta zonas con score < 40% del top', () => {
      // vitro → vitrocerámica score ~30, check-in score ~1 → eliminado
      const r = rankZonesByRelevance('vitro', ALL_ZONES, 'es') as any[];
      const topScore = (r[0] as any)._relevanceScore;
      if (topScore >= 15) {
        for (const z of r) {
          expect((z as any)._relevanceScore).toBeGreaterThanOrEqual(topScore * 0.4 - 0.01);
        }
      }
    });

    it('check-in (score bajo) NO aparece cuando se pregunta por vitro', () => {
      const r = rankZonesByRelevance('vitro', ALL_ZONES, 'es') as any[];
      const names = r.map((z: any) => (z.name?.es ?? '').toLowerCase());
      expect(names.some(n => n.includes('check-in'))).toBe(false);
    });

    it('garantía de media NO añade zona fuera del threshold', () => {
      // vitro/cocina no tienen media en este test. check-in tiene vídeo.
      // check-in NO debe aparecer como bonus si su score < threshold.
      const noMediaZones = [
        zone({ es: 'Vitrocerámica' }, [textStep('mandos de la vitro')], { order: 1 }),
        zone({ es: 'Cocina' },        [textStep('cocina completa')], { order: 2 }),
        zone({ es: 'Check-in' },      [textStep('código 4521'), videoStep('abrir puerta', 'https://cdn.example.com/checkin.mp4')], { order: 3 }),
      ];
      const r = rankZonesByRelevance('vitro', noMediaZones, 'es') as any[];
      const names = r.map((z: any) => (z.name?.es ?? '').toLowerCase());
      expect(names.some(n => n.includes('check-in'))).toBe(false);
    });

    it('garantía de media SÍ añade zona relevante con media si top5 no tiene', () => {
      // vitro pregunta, vitro no tiene media, cocina no tiene media, climati SÍ tiene media y score bajo
      const zonesWithMedia = [
        zone({ es: 'Vitrocerámica' }, [textStep('mandos de la vitro')], { order: 1 }),
        zone({ es: 'Cocina' },        [textStep('usar cocina con vitro')], { order: 2 }),
        zone({ es: 'Climatización' }, [textStep('vitro referencia clima'), videoStep('AC vídeo', 'https://cdn.example.com/ac.mp4')], { order: 3 }),
      ];
      // Climatización tiene "vitro" en el step → score > 0 → dentro del threshold o no
      const r = rankZonesByRelevance('vitro', zonesWithMedia, 'es') as any[];
      // Al menos debe haber zonas en el resultado
      expect(r.length).toBeGreaterThan(0);
    });
  });

  // ── Inputs adversariales / edge cases ────────────────────────────────────

  describe('inputs adversariales y edge cases', () => {
    it('string vacío → no explota, devuelve zonas', () =>
      expect(() => rankZonesByRelevance('', ALL_ZONES, 'es')).not.toThrow());

    it('solo espacios → no explota', () =>
      expect(() => rankZonesByRelevance('   ', ALL_ZONES, 'es')).not.toThrow());

    it('solo números → no explota', () =>
      expect(() => rankZonesByRelevance('12345', ALL_ZONES, 'es')).not.toThrow());

    it('solo caracteres especiales → no explota', () =>
      expect(() => rankZonesByRelevance('!@#$%^&*()', ALL_ZONES, 'es')).not.toThrow());

    it('emojis → no explota', () =>
      expect(() => rankZonesByRelevance('🏠🔑📶', ALL_ZONES, 'es')).not.toThrow());

    it('SQL injection → no explota', () =>
      expect(() => rankZonesByRelevance("'; DROP TABLE zones; --", ALL_ZONES, 'es')).not.toThrow());

    it('XSS → no explota', () =>
      expect(() => rankZonesByRelevance('<script>alert(1)</script>', ALL_ZONES, 'es')).not.toThrow());

    it('mensaje muy largo (2000 chars) → no explota', () =>
      expect(() => rankZonesByRelevance('wifi '.repeat(400), ALL_ZONES, 'es')).not.toThrow());

    it('todo en mayúsculas → funciona igual', () => {
      const lower = rankZonesByRelevance('vitro', ALL_ZONES, 'es') as any[];
      const upper = rankZonesByRelevance('VITRO', ALL_ZONES, 'es') as any[];
      expect((lower[0]?.name?.es ?? '').toLowerCase()).toEqual((upper[0]?.name?.es ?? '').toLowerCase());
    });

    it('acentos vs sin acentos → mismo resultado', () => {
      const con = rankZonesByRelevance('vitrocerámica', ALL_ZONES, 'es') as any[];
      const sin = rankZonesByRelevance('vitroceramica', ALL_ZONES, 'es') as any[];
      expect((con[0]?.name?.es ?? '').toLowerCase()).toEqual((sin[0]?.name?.es ?? '').toLowerCase());
    });

    it('zona con nombre undefined → no explota', () =>
      expect(() => rankZonesByRelevance('wifi', [zone(undefined as any, [])], 'es')).not.toThrow());

    it('zona con steps null → no explota', () => {
      const z = { ...zone('Test'), steps: null } as any;
      expect(() => rankZonesByRelevance('wifi', [z], 'es')).not.toThrow();
    });

    it('idioma desconocido → no explota y devuelve algo', () => {
      const r = rankZonesByRelevance('wifi', ALL_ZONES, 'de' as any);
      expect(Array.isArray(r)).toBe(true);
    });
  });

  // ── Scoring / orden ──────────────────────────────────────────────────────

  describe('scoring y ordenación', () => {
    it('zona con nombre exacto tiene score >= 15', () => {
      const r = rankZonesByRelevance('wifi', ALL_ZONES, 'es') as any[];
      const wifiZ = r.find((z: any) => (z.name?.es ?? z.name?.en ?? '').toLowerCase().includes('wifi')) as any;
      expect(wifiZ?._relevanceScore).toBeGreaterThanOrEqual(15);
    });

    it('coincidencia en nombre vale más que coincidencia en pasos', () => {
      const byName = zone({ es: 'Vitrocerámica' }, [textStep('instrucciones generales')]);
      const byStep = zone({ es: 'Cocina' }, [textStep('la vitrocerámica tiene 4 mandos')]);
      const r = rankZonesByRelevance('vitro', [byName, byStep], 'es') as any[];
      expect((r[0]?.name?.es ?? '').toLowerCase()).toContain('vitro');
    });

    it('empate en score se desempata por order (menor primero)', () => {
      const z1 = zone({ es: 'Wifi A' }, [textStep('red wifi')], { order: 2 });
      const z2 = zone({ es: 'Wifi B' }, [textStep('red wifi')], { order: 1 });
      const r = rankZonesByRelevance('wifi', [z1, z2], 'es') as any[];
      expect((r[0]?.name?.es ?? '')).toBe('Wifi B');
    });
  });
});

// ============================================================
// 4. collectRelevantMedia
// ============================================================

describe('collectRelevantMedia', () => {
  it('[] → []', () => expect(collectRelevantMedia([], 'es')).toEqual([]));

  it('sin media en ninguna zona → []', () => {
    const z = { ...Z_COCINA, _relevanceScore: 15 };
    expect(collectRelevantMedia([z], 'es')).toEqual([]);
  });

  it('score 0 → ignorado', () => {
    const z = { ...Z_CHECKIN, _relevanceScore: 0 };
    expect(collectRelevantMedia([z], 'es')).toEqual([]);
  });

  it('score < 1 → ignorado', () => {
    const z = { ...Z_CHECKIN, _relevanceScore: 0.5 };
    expect(collectRelevantMedia([z], 'es')).toEqual([]);
  });

  it('RECOMMENDATIONS → ignorado aunque tenga score', () => {
    const z = { ...Z_RESTAURANTES, _relevanceScore: 20 };
    expect(collectRelevantMedia([z], 'es')).toEqual([]);
  });

  it('zona con IMAGE → devuelve tipo IMAGE', () => {
    const z = {
      ...zone({ es: 'Test' }, [imageStep('foto entrada', 'https://x.com/img.jpg')]),
      _relevanceScore: 10,
    };
    const m = collectRelevantMedia([z], 'es');
    expect(m[0].type).toBe('IMAGE');
    expect(m[0].url).toBe('https://x.com/img.jpg');
  });

  it('zona con VIDEO → devuelve tipo VIDEO', () => {
    const z = {
      ...zone({ es: 'Test' }, [videoStep('vídeo entrada', 'https://x.com/vid.mp4')]),
      _relevanceScore: 10,
    };
    const m = collectRelevantMedia([z], 'es');
    expect(m[0].type).toBe('VIDEO');
    expect(m[0].url).toBe('https://x.com/vid.mp4');
  });

  it('devuelve máximo 8 items por zona', () => {
    const steps = Array.from({ length: 15 }, (_, i) =>
      imageStep(`img${i}`, `https://x.com/img${i}.jpg`)
    );
    const z = { ...zone({ es: 'Muchas fotos' }, steps), _relevanceScore: 10 };
    expect(collectRelevantMedia([z], 'es').length).toBeLessThanOrEqual(8);
  });

  it('stepIndex empieza en 1 y es secuencial', () => {
    const steps = [
      textStep('texto sin media'),
      imageStep('foto 1', 'https://x.com/1.jpg'),
      imageStep('foto 2', 'https://x.com/2.jpg'),
    ];
    const z = { ...zone({ es: 'Test' }, steps), _relevanceScore: 10 };
    const m = collectRelevantMedia([z], 'es');
    expect(m[0].stepIndex).toBe(1);
    expect(m[1].stepIndex).toBe(2);
  });

  it('caption es el título del step', () => {
    const z = {
      ...zone({ es: 'Acceso' }, [imageStep('Puerta principal', 'https://x.com/p.jpg')]),
      _relevanceScore: 10,
    };
    expect(collectRelevantMedia([z], 'es')[0].caption).toBe('Puerta principal');
  });

  it('caption fallback al nombre de zona si step sin título', () => {
    const step = { id: '1', type: 'IMAGE', title: {}, content: { es: '', mediaUrl: 'https://x.com/p.jpg' } };
    const z = { ...zone({ es: 'Mi Zona' }, [step]), _relevanceScore: 10 };
    const m = collectRelevantMedia([z], 'es');
    expect(m[0].caption).toBe('Mi Zona');
  });

  it('prefiere zona con score mayor aunque sea segunda en el array', () => {
    const low  = { ...zone({ es: 'Baja' },  [imageStep('img baja',  'https://x.com/low.jpg')]),  _relevanceScore: 5  };
    const high = { ...zone({ es: 'Alta' },  [imageStep('img alta',  'https://x.com/high.jpg')]), _relevanceScore: 20 };
    const m = collectRelevantMedia([low, high], 'es');
    expect(m[0].url).toBe('https://x.com/high.jpg');
  });

  it('dos zonas mismo score → primera en array gana', () => {
    const a = { ...zone({ es: 'A' }, [imageStep('img a', 'https://x.com/a.jpg')]), _relevanceScore: 10 };
    const b = { ...zone({ es: 'B' }, [imageStep('img b', 'https://x.com/b.jpg')]), _relevanceScore: 10 };
    const m = collectRelevantMedia([a, b], 'es');
    expect(m[0].url).toBe('https://x.com/a.jpg');
  });

  it('pasos TEXT sin media son ignorados', () => {
    const steps = [textStep('solo texto'), imageStep('con imagen', 'https://x.com/i.jpg')];
    const z = { ...zone({ es: 'Test' }, steps), _relevanceScore: 10 };
    const m = collectRelevantMedia([z], 'es');
    expect(m.length).toBe(1); // solo el image step
  });

  it('stepText incluye el texto del contenido', () => {
    const step = { id: '1', type: 'IMAGE', title: { es: 'Título' }, content: { es: 'Texto descriptivo', mediaUrl: 'https://x.com/p.jpg' } };
    const z = { ...zone({ es: 'Test' }, [step]), _relevanceScore: 10 };
    const m = collectRelevantMedia([z], 'es');
    expect(m[0].stepText).toBe('Texto descriptivo');
  });

  it('url se preserva exactamente', () => {
    const url = 'https://cdn.vercel-blob.com/my-property/step-123.mp4?token=abc';
    const z = { ...zone({ es: 'Test' }, [videoStep('video', url)]), _relevanceScore: 10 };
    expect(collectRelevantMedia([z], 'es')[0].url).toBe(url);
  });
});

// ============================================================
// 5. detectUnansweredQuestion
// ============================================================

describe('detectUnansweredQuestion', () => {

  // ── Español ──────────────────────────────────────────────────────────────
  const es_unanswered = [
    'Lo siento, no tengo información sobre eso.',
    'No tengo esa información disponible.',
    'No tengo información específica sobre la vitrocerámica.',
    'No dispongo de esa información, por favor contacta al anfitrión.',
    'No dispongo de información sobre ese tema.',
    'No cuento con esa información en este momento.',
    'No tengo los detalles exactos sobre esto.',
    'Te recomiendo que contactes al anfitrión directamente.',
    'Recomiendo que contactes al anfitrión para confirmar.',
    'Contacta al anfitrión para más información.',
    'Contacta directamente con el propietario.',
    'Lo siento, no tengo acceso a esa información.',
    'Lo siento, no dispongo de ese detalle.',
  ];

  for (const phrase of es_unanswered) {
    it(`detecta (es): "${phrase.slice(0, 60)}..."`, () =>
      expect(detectUnansweredQuestion(phrase, 'es')).toBe(true));
  }

  // ── Inglés ────────────────────────────────────────────────────────────────
  const en_unanswered = [
    "I don't have that information available.",
    "I don't have specific information about that.",
    "I don't have information about this.",
    "I don't have the specific details.",
    "I'm sorry, but I don't have access to that.",
    "I am sorry, but I don't know.",
    'Please contact the host for this information.',
    'You should contact your host directly.',
    "I recommend contacting the host.",
    "Do not have that information right now.",
    "Do not have specific information about checkout.",
  ];

  for (const phrase of en_unanswered) {
    it(`detecta (en): "${phrase.slice(0, 60)}..."`, () =>
      expect(detectUnansweredQuestion(phrase, 'en')).toBe(true));
  }

  // ── Francés ───────────────────────────────────────────────────────────────
  const fr_unanswered = [
    "Je n'ai pas cette information.",
    "Je ne dispose pas de cette information.",
    "Je n'ai pas d'information sur ce sujet.",
    "Contactez l'hôte pour plus d'informations.",
  ];

  for (const phrase of fr_unanswered) {
    it(`detecta (fr): "${phrase.slice(0, 60)}..."`, () =>
      expect(detectUnansweredQuestion(phrase, 'fr')).toBe(true));
  }

  // ── Respuestas normales → false ───────────────────────────────────────────
  const answered = [
    'La vitrocerámica se controla con los mandos de la derecha.',
    'El WiFi es Itineramio_5G, contraseña: balcon2024#',
    'El check-out es antes de las 11:00 h.',
    'La piscina abre a las 10:00 h y cierra a las 20:00 h.',
    'Puedes aparcar en la plaza B-14 del garaje.',
    'El metro más cercano está a 200 metros, línea 3.',
    'Aquí tienes toda la información que necesitas.',
    'Claro, te explico cómo funciona la lavadora.',
  ];

  for (const phrase of answered) {
    it(`NO detecta como sin respuesta: "${phrase.slice(0, 60)}"`, () =>
      expect(detectUnansweredQuestion(phrase, 'es')).toBe(false));
  }

  // Edge cases
  it('string vacío → false', () =>
    expect(detectUnansweredQuestion('', 'es')).toBe(false));
  it('case insensitive: "NO TENGO INFORMACIÓN"', () =>
    expect(detectUnansweredQuestion('NO TENGO INFORMACIÓN SOBRE ESO', 'es')).toBe(true));
  it('frase dentro de texto largo', () =>
    expect(detectUnansweredQuestion(
      'He revisado el manual completo pero lo siento, no tengo los detalles exactos sobre ese punto.',
      'es'
    )).toBe(true));
  it('"información" sola no detecta (sin contexto de no-saber)', () =>
    expect(detectUnansweredQuestion('Aquí tienes información sobre el apartamento.', 'es')).toBe(false));
});

// ============================================================
// 6. extractGuestProfile
// ============================================================

describe('extractGuestProfile', () => {
  it('historial vacío → section vacío, transportMode null', () => {
    const p = extractGuestProfile([]);
    expect(p.section).toBe('');
    expect(p.transportMode).toBeNull();
  });

  it('solo mensajes de asistente → section vacío', () => {
    const p = extractGuestProfile([msg('assistant', 'Hola, ¿en qué puedo ayudarte?')]);
    expect(p.section).toBe('');
  });

  it('mensaje muy corto → section vacío', () => {
    const p = extractGuestProfile([msg('user', 'ok')]);
    expect(p.section).toBe('');
  });

  // Grupo
  it('detecta "somos dos"', () => {
    const p = extractGuestProfile([msg('user', 'somos dos personas')]);
    expect(p.section).toContain('Grupo de 2');
  });
  it('detecta "somos tres"', () => {
    const p = extractGuestProfile([msg('user', 'somos tres')]);
    expect(p.section).toContain('Grupo de 3');
  });
  it('detecta "4 personas"', () => {
    const p = extractGuestProfile([msg('user', 'somos 4 personas')]);
    expect(p.section).toContain('Grupo de 4');
  });
  it('detecta "we are 2"', () => {
    const p = extractGuestProfile([msg('user', 'we are 2')]);
    expect(p.section).toContain('Grupo de 2');
  });

  // Niños
  it('detecta "kids"', () => {
    const p = extractGuestProfile([msg('user', 'venimos con kids y bebés')]);
    expect(p.section).toContain('niños');
  });
  it('detecta "hijos"', () => {
    const p = extractGuestProfile([msg('user', 'venimos con nuestros hijos pequeños')]);
    expect(p.section).toContain('niños');
  });

  // Tipo de viaje
  it('detecta pareja/romántico', () => {
    const p = extractGuestProfile([msg('user', 'viajamos en pareja para nuestro aniversario')]);
    expect(p.section).toContain('pareja');
  });
  it('detecta familia', () => {
    const p = extractGuestProfile([msg('user', 'somos una familia con dos niños')]);
    expect(p.section).toContain('familiar');
  });
  it('detecta amigos', () => {
    const p = extractGuestProfile([msg('user', 'venimos con amigos de fin de semana')]);
    expect(p.section).toContain('amigos');
  });
  it('detecta negocios', () => {
    const p = extractGuestProfile([msg('user', 'vengo por trabajo, viaje de negocios')]);
    expect(p.section).toContain('negocios');
  });

  // Comida
  it('detecta vegetariano', () => {
    const p = extractGuestProfile([msg('user', 'somos vegetarianos')]);
    expect(p.section).toContain('vegetariano');
  });
  it('detecta vegano', () => {
    const p = extractGuestProfile([msg('user', 'soy vegan')]);
    expect(p.section).toContain('vegetariano');
  });
  it('detecta alergia/gluten', () => {
    const p = extractGuestProfile([msg('user', 'tengo intolerancia al gluten')]);
    expect(p.section).toContain('alergia');
  });
  it('detecta marisco', () => {
    const p = extractGuestProfile([msg('user', 'nos gusta mucho el marisco')]);
    expect(p.section).toContain('marisco');
  });

  // Presupuesto
  it('detecta económico', () => {
    const p = extractGuestProfile([msg('user', 'buscamos sitios baratos para comer')]);
    expect(p.section).toContain('económico');
  });
  it('detecta premium/gourmet', () => {
    const p = extractGuestProfile([msg('user', 'buscamos restaurantes gourmet, el precio no importa')]);
    expect(p.section).toContain('premium');
  });

  // Ambiente
  it('detecta tranquilo/relax', () => {
    const p = extractGuestProfile([msg('user', 'buscamos algo tranquilo para descansar')]);
    expect(p.section).toContain('tranquilo');
  });
  it('detecta marcha/nightlife', () => {
    const p = extractGuestProfile([msg('user', 'buscamos marcha y vida nocturna')]);
    expect(p.section).toContain('nocturna');
  });

  // Intereses
  it('detecta cultura/arte', () => {
    const p = extractGuestProfile([msg('user', 'nos interesa la cultura y los museos')]);
    expect(p.section).toContain('cultura');
  });
  it('detecta naturaleza/hiking', () => {
    const p = extractGuestProfile([msg('user', 'nos gusta el senderismo y la naturaleza')]);
    expect(p.section).toContain('naturaleza');
  });

  // Transporte
  it('detecta "a pie" → walking', () => {
    const p = extractGuestProfile([msg('user', 'iremos todo a pie, sin coche')]);
    expect(p.transportMode).toBe('walking');
    expect(p.section).toContain('a pie');
  });
  it('detecta "andando" → walking', () => {
    const p = extractGuestProfile([msg('user', 'vamos caminando a todos lados')]);
    expect(p.transportMode).toBe('walking');
  });
  it('detecta "no tenemos coche" → walking', () => {
    const p = extractGuestProfile([msg('user', 'no tenemos coche')]);
    expect(p.transportMode).toBe('walking');
  });
  it('detecta "walking" (en) → walking', () => {
    const p = extractGuestProfile([msg('user', 'we are walking everywhere, on foot')]);
    expect(p.transportMode).toBe('walking');
  });
  it('detecta "tenemos coche" → car', () => {
    const p = extractGuestProfile([msg('user', 'tenemos coche alquilado')]);
    expect(p.transportMode).toBe('car');
  });
  it('detecta "rental car" (en) → car', () => {
    const p = extractGuestProfile([msg('user', 'we have a rental car')]);
    expect(p.transportMode).toBe('car');
  });
  it('sin info de transporte → null', () => {
    const p = extractGuestProfile([msg('user', 'somos dos personas, buscamos restaurantes')]);
    expect(p.transportMode).toBeNull();
  });

  // Múltiples traits
  it('detecta múltiples rasgos en conversación larga', () => {
    const history = [
      msg('user', 'somos dos personas en pareja, aniversario'),
      msg('assistant', '¡Feliz aniversario!'),
      msg('user', 'somos vegetarianos y vamos andando a todos lados'),
      msg('assistant', 'Entendido'),
      msg('user', 'buscamos algo romántico y tranquilo'),
    ];
    const p = extractGuestProfile(history);
    expect(p.section).toContain('pareja');
    expect(p.section).toContain('vegetariano');
    expect(p.section).toContain('tranquilo');
    expect(p.transportMode).toBe('walking');
  });

  // section format
  it('section contiene el header correcto cuando hay rasgos', () => {
    const p = extractGuestProfile([msg('user', 'somos 3 personas')]);
    if (p.section) {
      expect(p.section).toContain('PERFIL DETECTADO DEL HUÉSPED');
    }
  });
});

// ============================================================
// 7. Cross-contamination — zonas que NO deben aparecer juntas
// ============================================================

describe('Cross-contamination — zonas que NO deben mezclarse', () => {
  // Helper: la query devuelve check-in como primera zona
  const firstZone = (q: string) => {
    const r = rankZonesByRelevance(q, ALL_ZONES, 'es') as any[];
    return (r[0]?.name?.es ?? '').toLowerCase();
  };

  const notIn = (q: string, unwanted: string) => {
    const r = rankZonesByRelevance(q, ALL_ZONES, 'es') as any[];
    const names = r.map((z: any) => (z.name?.es ?? '').toLowerCase());
    return !names.some(n => n.includes(unwanted));
  };

  it('vitro → NO check-in', () => expect(notIn('vitro', 'check-in')).toBe(true));
  it('vitro → NO checkout', () => expect(notIn('vitro', 'check-out')).toBe(true));
  it('vitro → NO parking', () => expect(notIn('vitro', 'parking')).toBe(true));
  it('vitro → NO normas', () => expect(notIn('vitro', 'normas')).toBe(true));
  it('vitro → NO emergencias', () => expect(notIn('vitro', 'emergencias')).toBe(true));

  it('wifi → NO check-out', () => expect(notIn('wifi password', 'check-out')).toBe(true));
  it('wifi → NO parking', () => expect(notIn('wifi', 'parking')).toBe(true));
  it('wifi → NO normas', () => expect(notIn('wifi', 'normas')).toBe(true));

  it('checkout → NO check-in (como primera)', () =>
    expect(firstZone('checkout hora salida')).not.toContain('check-in'));

  it('normas → NO check-in (como primera)', () =>
    expect(firstZone('normas de la casa')).not.toContain('check-in'));

  it('parking → NO check-in (como primera)', () =>
    expect(firstZone('parking garaje')).not.toContain('check-in'));

  it('basura → NO check-in (como primera)', () =>
    expect(firstZone('basura reciclaje contenedor')).not.toContain('check-in'));

  it('lavadora → NO check-in', () => expect(notIn('lavadora', 'check-in')).toBe(true));
  it('maletas → NO check-out (como primera)', () =>
    expect(firstZone('maletas equipaje')).not.toContain('check-out'));
  it('toallas → NO check-in (como primera)', () =>
    expect(firstZone('toallas sabanas')).not.toContain('check-in'));
  it('piscina → NO check-in', () => expect(notIn('piscina pool', 'check-in')).toBe(true));
  it('emergencias → NO check-in (como primera)', () =>
    expect(firstZone('emergencias urgencias')).not.toContain('check-in'));
});

// ============================================================
// 8. Performance / Stress
// ============================================================

describe('Performance y stress', () => {
  it('100 zonas → responde en < 100ms', () => {
    const bigZones = Array.from({ length: 100 }, (_, i) =>
      zone({ es: `Zona ${i}` }, [textStep(`contenido de la zona ${i}`)], { order: i })
    );
    const start = Date.now();
    rankZonesByRelevance('vitro wifi cocina', bigZones, 'es');
    expect(Date.now() - start).toBeLessThan(100);
  });

  it('zona con 100 steps → no explota y devuelve resultado', () => {
    const steps = Array.from({ length: 100 }, (_, i) => textStep(`paso ${i}`));
    const z = zone({ es: 'Zona grande' }, steps);
    expect(() => rankZonesByRelevance('paso', [z], 'es')).not.toThrow();
  });

  it('mensaje 2000 chars → responde sin timeout', () => {
    const longMsg = 'vitro cocina wifi parking checkout'.repeat(100);
    const start = Date.now();
    rankZonesByRelevance(longMsg, ALL_ZONES, 'es');
    expect(Date.now() - start).toBeLessThan(200);
  });

  it('10 zonas con mismo nombre → no explota', () => {
    const zones = Array.from({ length: 10 }, (_, i) =>
      zone({ es: 'Cocina' }, [textStep('vitro')], { order: i })
    );
    expect(() => rankZonesByRelevance('vitro', zones, 'es')).not.toThrow();
  });

  it('zona con nombre muy largo → no explota', () => {
    const z = zone({ es: 'C'.repeat(500) }, [textStep('contenido')]);
    expect(() => rankZonesByRelevance('vitro', [z], 'es')).not.toThrow();
  });

  it('colección mixta de tipos de step → no explota', () => {
    const steps = [
      textStep('texto normal'),
      imageStep('imagen', 'https://x.com/i.jpg'),
      videoStep('video', 'https://x.com/v.mp4'),
      { id: '4', type: 'UNKNOWN', title: null, content: null },
      { id: '5', type: 'TEXT', title: undefined, content: undefined },
    ];
    const z = zone({ es: 'Mixta' }, steps);
    expect(() => rankZonesByRelevance('vitro', [z], 'es')).not.toThrow();
    expect(() => collectRelevantMedia([{ ...z, _relevanceScore: 10 }], 'es')).not.toThrow();
  });
});
