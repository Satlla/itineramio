/**
 * Builds a static "Información útil" zone with tourist map links,
 * public transport info (city-specific), parking tips, and emergency numbers.
 * No API calls needed — everything is based on verified public links.
 */

import { type TrilingualZoneConfig } from './zone-builders'

// ─── City-specific transport data ───

interface CityTransportInfo {
  /** Official transport app name */
  appName: string
  /** Official website URL */
  website: string
  /** Brief description of what the app covers */
  covers: { es: string; en: string; fr: string }
}

/**
 * Major cities with their official transport apps/websites.
 * Keys are lowercase city names for matching.
 */
const CITY_TRANSPORT: Record<string, CityTransportInfo> = {
  madrid: {
    appName: 'Mi Transporte Madrid (CRTM)',
    website: 'https://www.crtm.es',
    covers: { es: 'metro, bus, cercanías', en: 'metro, bus, commuter trains', fr: 'métro, bus, trains de banlieue' },
  },
  barcelona: {
    appName: 'TMB App',
    website: 'https://www.tmb.cat',
    covers: { es: 'metro, bus, Bicing', en: 'metro, bus, Bicing', fr: 'métro, bus, Bicing' },
  },
  valencia: {
    appName: 'EMT Valencia',
    website: 'https://www.emtvalencia.es',
    covers: { es: 'bus, metro, Valenbisi', en: 'bus, metro, Valenbisi', fr: 'bus, métro, Valenbisi' },
  },
  sevilla: {
    appName: 'AppTUSSAM',
    website: 'https://www.tussam.es',
    covers: { es: 'bus, tranvía, compra de billetes', en: 'bus, tram, ticket purchase', fr: 'bus, tramway, achat de billets' },
  },
  málaga: {
    appName: 'EMT Málaga',
    website: 'https://www.emtmalaga.es',
    covers: { es: 'bus, tiempos reales, Málaga Bici', en: 'bus, real-time, Málaga Bici', fr: 'bus, temps réel, Málaga Bici' },
  },
  malaga: {
    appName: 'EMT Málaga',
    website: 'https://www.emtmalaga.es',
    covers: { es: 'bus, tiempos reales, Málaga Bici', en: 'bus, real-time, Málaga Bici', fr: 'bus, temps réel, Málaga Bici' },
  },
  bilbao: {
    appName: 'Bilbobus + Metro Bilbao',
    website: 'https://www.ctb.eus',
    covers: { es: 'bus, metro, tranvía, Bizkaibus', en: 'bus, metro, tram, Bizkaibus', fr: 'bus, métro, tramway, Bizkaibus' },
  },
  zaragoza: {
    appName: 'Zaragoza Rutas',
    website: 'https://www.consorciozaragoza.es',
    covers: { es: 'bus, tranvía, cercanías', en: 'bus, tram, commuter trains', fr: 'bus, tramway, trains de banlieue' },
  },
  alicante: {
    appName: 'Alicante Bus (Vectalia)',
    website: 'https://alicante.vectalia.es',
    covers: { es: 'bus, TRAM, tiempos reales', en: 'bus, TRAM, real-time', fr: 'bus, TRAM, temps réel' },
  },
  'palma de mallorca': {
    appName: 'EMT Palma',
    website: 'https://www.emtpalma.cat',
    covers: { es: 'bus urbano, mapa de líneas', en: 'city bus, route map', fr: 'bus urbain, plan des lignes' },
  },
  palma: {
    appName: 'EMT Palma',
    website: 'https://www.emtpalma.cat',
    covers: { es: 'bus urbano, mapa de líneas', en: 'city bus, route map', fr: 'bus urbain, plan des lignes' },
  },
  granada: {
    appName: 'Transporte Urbano Granada',
    website: 'https://ctagr.es',
    covers: { es: 'bus, metro, líneas y horarios', en: 'bus, metro, routes and schedules', fr: 'bus, métro, lignes et horaires' },
  },
  'san sebastián': {
    appName: 'Dbus',
    website: 'https://dbus.eus',
    covers: { es: 'bus urbano (4 idiomas)', en: 'city bus (4 languages)', fr: 'bus urbain (4 langues)' },
  },
  donostia: {
    appName: 'Dbus',
    website: 'https://dbus.eus',
    covers: { es: 'bus urbano (4 idiomas)', en: 'city bus (4 languages)', fr: 'bus urbain (4 langues)' },
  },
  santander: {
    appName: 'TUSantander',
    website: 'https://tus.santander.es',
    covers: { es: 'bus, tiempos reales, planificador', en: 'bus, real-time, route planner', fr: 'bus, temps réel, planificateur' },
  },
  cádiz: {
    appName: 'Consorcio Cádiz',
    website: 'https://cmtbc.es',
    covers: { es: 'bus, tren, barco', en: 'bus, train, boat', fr: 'bus, train, bateau' },
  },
  cadiz: {
    appName: 'Consorcio Cádiz',
    website: 'https://cmtbc.es',
    covers: { es: 'bus, tren, barco', en: 'bus, train, boat', fr: 'bus, train, bateau' },
  },
  'a coruña': {
    appName: 'iTranvías',
    website: 'https://tranviascoruna.com',
    covers: { es: 'bus urbano, multilingüe', en: 'city bus, multilingual', fr: 'bus urbain, multilingue' },
  },
}

function getCityTransport(city: string): CityTransportInfo | null {
  return CITY_TRANSPORT[city.toLowerCase().trim()] ?? null
}

// ─── Parking apps by country ───

interface ParkingAppInfo {
  apps: { name: string; description: { es: string; en: string; fr: string }; website: string }[]
  tip: { es: string; en: string; fr: string }
}

const COUNTRY_PARKING: Record<string, ParkingAppInfo> = {
  España: {
    apps: [
      { name: 'EasyPark', description: { es: 'Pagar zona azul/verde + buscar parking', en: 'Pay street parking + find parking', fr: 'Payer stationnement + trouver parking' }, website: 'https://www.easypark.com/en-es' },
      { name: 'ElParking', description: { es: 'Reservar parking con descuento (hasta -70%)', en: 'Book parking with discount (up to -70%)', fr: 'Réserver parking avec réduction (jusqu\'à -70%)' }, website: 'https://elparking.com' },
    ],
    tip: { es: 'Zona azul = máx. 2h. Zona verde = residentes (más barata para ellos). Busca "parkings subterráneos" en Google Maps para alternativas sin límite de tiempo.', en: 'Blue zone = max 2h. Green zone = residents (cheaper for them). Search "underground parking" on Google Maps for alternatives with no time limit.', fr: 'Zone bleue = max 2h. Zone verte = résidents (moins cher pour eux). Cherchez "parkings souterrains" sur Google Maps pour des alternatives sans limite de temps.' },
  },
  France: {
    apps: [
      { name: 'PayByPhone', description: { es: 'Pago de aparcamiento en +260 ciudades', en: 'Street parking payment in 260+ cities', fr: 'Paiement stationnement dans +260 villes' }, website: 'https://www.paybyphone.com' },
      { name: 'EasyPark', description: { es: 'Buscar y pagar parking', en: 'Find and pay parking', fr: 'Trouver et payer le stationnement' }, website: 'https://www.easypark.com/en-fr' },
    ],
    tip: { es: 'En muchas ciudades francesas el aparcamiento en zona azul requiere disco horario (disque de stationnement).', en: 'In many French cities, blue zone parking requires a parking disc (disque de stationnement).', fr: 'Dans de nombreuses villes, le stationnement en zone bleue nécessite un disque de stationnement.' },
  },
  Portugal: {
    apps: [
      { name: 'Via Verde Estacionar', description: { es: 'Pago de aparcamiento en 60+ municipios', en: 'Parking payment in 60+ municipalities', fr: 'Paiement stationnement dans 60+ municipalités' }, website: 'https://www.viaverde.pt' },
      { name: 'Telpark', description: { es: 'Zona regulada en 11 ciudades', en: 'Regulated zones in 11 cities', fr: 'Zones réglementées dans 11 villes' }, website: 'https://www.telpark.com' },
    ],
    tip: { es: 'Telpark funciona igual que en España — misma app para ambos países.', en: 'Telpark works the same as in Spain — same app for both countries.', fr: 'Telpark fonctionne comme en Espagne — même app pour les deux pays.' },
  },
  Italia: {
    apps: [
      { name: 'EasyPark', description: { es: 'La más usada en Italia (+2.200 ciudades)', en: 'Most used in Italy (2,200+ cities)', fr: 'La plus utilisée en Italie (+2 200 villes)' }, website: 'https://www.easypark.com/en-it' },
      { name: 'Telepass', description: { es: 'Peajes + aparcamiento', en: 'Tolls + parking', fr: 'Péages + stationnement' }, website: 'https://www.telepass.com' },
    ],
    tip: { es: 'Cuidado con las ZTL (Zona a Traffico Limitato) en los centros históricos — acceso restringido con multas de +100€.', en: 'Watch out for ZTL (Limited Traffic Zones) in historic centers — restricted access with fines over €100.', fr: 'Attention aux ZTL (Zone à Trafic Limité) dans les centres historiques — accès restreint avec amendes de +100€.' },
  },
  'United Kingdom': {
    apps: [
      { name: 'RingGo', description: { es: 'La más popular en UK (+500 ciudades)', en: 'Most popular in UK (500+ cities)', fr: 'La plus populaire au UK (+500 villes)' }, website: 'https://ringgo.co.uk' },
      { name: 'JustPark', description: { es: 'Reservar plazas (incluye driveways privados)', en: 'Book spaces (includes private driveways)', fr: 'Réserver des places (inclut allées privées)' }, website: 'https://www.justpark.com' },
    ],
    tip: { es: 'Las líneas amarillas simples = prohibido aparcar a ciertas horas. Dobles = prohibido siempre. Lee las señales.', en: 'Single yellow lines = no parking at certain times. Double = no parking ever. Read the signs.', fr: 'Lignes jaunes simples = stationnement interdit à certaines heures. Doubles = interdit toujours. Lisez les panneaux.' },
  },
  Alemania: {
    apps: [
      { name: 'EasyPark', description: { es: 'Pagar zona regulada (+1.000 ciudades)', en: 'Pay regulated zones (1,000+ cities)', fr: 'Payer zones réglementées (+1 000 villes)' }, website: 'https://www.easypark.com/en-de' },
    ],
    tip: { es: 'Necesitas un Parkscheibe (disco de aparcamiento) para zonas de tiempo limitado. Se compra en gasolineras o supermercados.', en: 'You need a Parkscheibe (parking disc) for time-limited zones. Buy one at gas stations or supermarkets.', fr: 'Vous avez besoin d\'un Parkscheibe (disque de stationnement) pour les zones à durée limitée. En vente dans les stations-service ou supermarchés.' },
  },
}

function getParkingInfo(country: string): ParkingAppInfo | null {
  if (COUNTRY_PARKING[country]) return COUNTRY_PARKING[country]
  const normalized = country.toLowerCase().trim()
  const mapped = COUNTRY_ALIASES[normalized]
  if (mapped && COUNTRY_PARKING[mapped]) return COUNTRY_PARKING[mapped]
  return null
}

// ─── Emergency numbers by country ───

interface EmergencyInfo {
  countryName: { es: string; en: string; fr: string }
  numbers: { number: string; label: { es: string; en: string; fr: string } }[]
  tip: { es: string; en: string; fr: string }
}

const EMERGENCY_DATA: Record<string, EmergencyInfo> = {
  España: {
    countryName: { es: 'España', en: 'Spain', fr: 'Espagne' },
    numbers: [
      { number: '112', label: { es: 'Emergencias generales (policía, bomberos, ambulancia)', en: 'General emergencies (police, fire, ambulance)', fr: 'Urgences générales (police, pompiers, ambulance)' } },
      { number: '091', label: { es: 'Policía Nacional', en: 'National Police', fr: 'Police Nationale' } },
      { number: '061', label: { es: 'Urgencias sanitarias', en: 'Medical emergencies', fr: 'Urgences médicales' } },
      { number: '080', label: { es: 'Bomberos', en: 'Fire department', fr: 'Pompiers' } },
    ],
    tip: { es: 'El **112** funciona desde cualquier teléfono, incluso sin SIM.', en: '**112** works from any phone, even without a SIM card.', fr: 'Le **112** fonctionne depuis n\'importe quel téléphone, même sans carte SIM.' },
  },
  France: {
    countryName: { es: 'Francia', en: 'France', fr: 'France' },
    numbers: [
      { number: '112', label: { es: 'Emergencias europeas', en: 'European emergencies', fr: 'Urgences européennes' } },
      { number: '15', label: { es: 'SAMU (urgencias médicas)', en: 'SAMU (medical emergencies)', fr: 'SAMU (urgences médicales)' } },
      { number: '17', label: { es: 'Policía', en: 'Police', fr: 'Police' } },
      { number: '18', label: { es: 'Bomberos', en: 'Fire department', fr: 'Pompiers' } },
    ],
    tip: { es: 'El **112** funciona en toda la Unión Europea.', en: '**112** works across the entire European Union.', fr: 'Le **112** fonctionne dans toute l\'Union européenne.' },
  },
  Portugal: {
    countryName: { es: 'Portugal', en: 'Portugal', fr: 'Portugal' },
    numbers: [
      { number: '112', label: { es: 'Emergencias generales', en: 'General emergencies', fr: 'Urgences générales' } },
      { number: '808 200 204', label: { es: 'Línea de salud (SNS 24)', en: 'Health line (SNS 24)', fr: 'Ligne santé (SNS 24)' } },
    ],
    tip: { es: 'El **112** funciona en toda la Unión Europea.', en: '**112** works across the entire European Union.', fr: 'Le **112** fonctionne dans toute l\'Union européenne.' },
  },
  Italia: {
    countryName: { es: 'Italia', en: 'Italy', fr: 'Italie' },
    numbers: [
      { number: '112', label: { es: 'Emergencias generales (Carabinieri)', en: 'General emergencies (Carabinieri)', fr: 'Urgences générales (Carabinieri)' } },
      { number: '113', label: { es: 'Policía', en: 'Police', fr: 'Police' } },
      { number: '118', label: { es: 'Urgencias sanitarias', en: 'Medical emergencies', fr: 'Urgences médicales' } },
      { number: '115', label: { es: 'Bomberos', en: 'Fire department', fr: 'Pompiers' } },
    ],
    tip: { es: 'El **112** funciona en toda la Unión Europea.', en: '**112** works across the entire European Union.', fr: 'Le **112** fonctionne dans toute l\'Union européenne.' },
  },
  'United Kingdom': {
    countryName: { es: 'Reino Unido', en: 'United Kingdom', fr: 'Royaume-Uni' },
    numbers: [
      { number: '999', label: { es: 'Emergencias generales (policía, bomberos, ambulancia)', en: 'General emergencies (police, fire, ambulance)', fr: 'Urgences générales (police, pompiers, ambulance)' } },
      { number: '112', label: { es: 'Emergencias europeas (también funciona)', en: 'European emergencies (also works)', fr: 'Urgences européennes (fonctionne aussi)' } },
      { number: '111', label: { es: 'Urgencias sanitarias no graves (NHS)', en: 'Non-emergency medical (NHS)', fr: 'Urgences médicales non graves (NHS)' } },
    ],
    tip: { es: 'Tanto el **999** como el **112** funcionan en Reino Unido.', en: 'Both **999** and **112** work in the United Kingdom.', fr: 'Le **999** et le **112** fonctionnent tous les deux au Royaume-Uni.' },
  },
  Alemania: {
    countryName: { es: 'Alemania', en: 'Germany', fr: 'Allemagne' },
    numbers: [
      { number: '112', label: { es: 'Emergencias generales (bomberos y ambulancia)', en: 'General emergencies (fire and ambulance)', fr: 'Urgences générales (pompiers et ambulance)' } },
      { number: '110', label: { es: 'Policía', en: 'Police', fr: 'Police' } },
    ],
    tip: { es: 'El **112** funciona en toda la Unión Europea.', en: '**112** works across the entire European Union.', fr: 'Le **112** fonctionne dans toute l\'Union européenne.' },
  },
  Grecia: {
    countryName: { es: 'Grecia', en: 'Greece', fr: 'Grèce' },
    numbers: [
      { number: '112', label: { es: 'Emergencias generales', en: 'General emergencies', fr: 'Urgences générales' } },
      { number: '100', label: { es: 'Policía', en: 'Police', fr: 'Police' } },
      { number: '166', label: { es: 'Ambulancia', en: 'Ambulance', fr: 'Ambulance' } },
      { number: '199', label: { es: 'Bomberos', en: 'Fire department', fr: 'Pompiers' } },
    ],
    tip: { es: 'El **112** funciona en toda la Unión Europea.', en: '**112** works across the entire European Union.', fr: 'Le **112** fonctionne dans toute l\'Union européenne.' },
  },
  México: {
    countryName: { es: 'México', en: 'Mexico', fr: 'Mexique' },
    numbers: [
      { number: '911', label: { es: 'Emergencias generales', en: 'General emergencies', fr: 'Urgences générales' } },
      { number: '066', label: { es: 'Policía (algunos estados)', en: 'Police (some states)', fr: 'Police (certains états)' } },
      { number: '065', label: { es: 'Cruz Roja', en: 'Red Cross', fr: 'Croix-Rouge' } },
    ],
    tip: { es: 'El **911** es el número unificado de emergencias en todo México.', en: '**911** is the unified emergency number across Mexico.', fr: 'Le **911** est le numéro d\'urgence unifié dans tout le Mexique.' },
  },
  Colombia: {
    countryName: { es: 'Colombia', en: 'Colombia', fr: 'Colombie' },
    numbers: [
      { number: '123', label: { es: 'Emergencias generales', en: 'General emergencies', fr: 'Urgences générales' } },
      { number: '132', label: { es: 'Bomberos', en: 'Fire department', fr: 'Pompiers' } },
      { number: '144', label: { es: 'Cruz Roja', en: 'Red Cross', fr: 'Croix-Rouge' } },
    ],
    tip: { es: 'El **123** funciona en todo el territorio colombiano.', en: '**123** works throughout Colombia.', fr: 'Le **123** fonctionne dans tout le territoire colombien.' },
  },
  Argentina: {
    countryName: { es: 'Argentina', en: 'Argentina', fr: 'Argentine' },
    numbers: [
      { number: '911', label: { es: 'Emergencias generales (policía)', en: 'General emergencies (police)', fr: 'Urgences générales (police)' } },
      { number: '107', label: { es: 'SAME (urgencias médicas)', en: 'SAME (medical emergencies)', fr: 'SAME (urgences médicales)' } },
      { number: '100', label: { es: 'Bomberos', en: 'Fire department', fr: 'Pompiers' } },
    ],
    tip: { es: 'El **911** es el número principal de emergencias en Argentina.', en: '**911** is the main emergency number in Argentina.', fr: 'Le **911** est le numéro principal d\'urgence en Argentine.' },
  },
  'Estados Unidos': {
    countryName: { es: 'Estados Unidos', en: 'United States', fr: 'États-Unis' },
    numbers: [
      { number: '911', label: { es: 'Emergencias generales (policía, bomberos, ambulancia)', en: 'General emergencies (police, fire, ambulance)', fr: 'Urgences générales (police, pompiers, ambulance)' } },
      { number: '988', label: { es: 'Línea de crisis de salud mental', en: 'Suicide & Crisis Lifeline', fr: 'Ligne de crise santé mentale' } },
    ],
    tip: { es: 'El **911** funciona en todo Estados Unidos y Canadá.', en: '**911** works throughout the United States and Canada.', fr: 'Le **911** fonctionne dans tous les États-Unis et le Canada.' },
  },
}

// ─── Country aliases ───

const COUNTRY_ALIASES: Record<string, string> = {
  'españa': 'España',
  'spain': 'España',
  'espagne': 'España',
  'france': 'France',
  'francia': 'France',
  'portugal': 'Portugal',
  'italy': 'Italia',
  'italia': 'Italia',
  'italie': 'Italia',
  'united kingdom': 'United Kingdom',
  'uk': 'United Kingdom',
  'reino unido': 'United Kingdom',
  'royaume-uni': 'United Kingdom',
  'germany': 'Alemania',
  'alemania': 'Alemania',
  'allemagne': 'Alemania',
  'deutschland': 'Alemania',
  'greece': 'Grecia',
  'grecia': 'Grecia',
  'grèce': 'Grecia',
  'méxico': 'México',
  'mexico': 'México',
  'mexique': 'México',
  'colombia': 'Colombia',
  'colombie': 'Colombia',
  'argentina': 'Argentina',
  'argentine': 'Argentina',
  'estados unidos': 'Estados Unidos',
  'united states': 'Estados Unidos',
  'usa': 'Estados Unidos',
  'états-unis': 'Estados Unidos',
  'eeuu': 'Estados Unidos',
  'ee.uu.': 'Estados Unidos',
}

function resolveCountry(country: string): string {
  if (EMERGENCY_DATA[country]) return country
  const normalized = country.toLowerCase().trim()
  return COUNTRY_ALIASES[normalized] ?? country
}

function getEmergencyInfo(country: string): EmergencyInfo {
  const resolved = resolveCountry(country)
  if (EMERGENCY_DATA[resolved]) return EMERGENCY_DATA[resolved]
  return {
    countryName: { es: country, en: country, fr: country },
    numbers: [
      { number: '112', label: { es: 'Emergencias generales', en: 'General emergencies', fr: 'Urgences générales' } },
    ],
    tip: { es: 'El **112** es el número de emergencias en la mayoría de países europeos.', en: '**112** is the emergency number in most European countries.', fr: 'Le **112** est le numéro d\'urgence dans la plupart des pays européens.' },
  }
}

// ─── Main builder ───

export function buildCityInfoZone(
  city: string,
  lat: number,
  lng: number,
  country: string = 'España'
): TrilingualZoneConfig {
  const encodedCity = encodeURIComponent(city)
  const tourismSearchUrl = `https://www.google.com/maps/search/oficina+de+turismo+${encodedCity}/@${lat},${lng},13z`
  const transitUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`
  const transitSearchUrl = `https://www.google.com/maps/search/transporte+público+${encodedCity}/@${lat},${lng},13z`
  const pharmacySearchUrl = `https://www.google.com/maps/search/farmacia/@${lat},${lng},14z`
  const hospitalSearchUrl = `https://www.google.com/maps/search/hospital+urgencias/@${lat},${lng},14z`
  const parkingSearchUrl = `https://www.google.com/maps/search/parking/@${lat},${lng},14z`

  const resolvedCountry = resolveCountry(country)
  const emergency = getEmergencyInfo(country)
  const cityTransport = getCityTransport(city)
  const parking = getParkingInfo(resolvedCountry)

  const numbersEs = emergency.numbers.map(n => `📞 **${n.number}** — ${n.label.es}`).join('\n')
  const numbersEn = emergency.numbers.map(n => `📞 **${n.number}** — ${n.label.en}`).join('\n')
  const numbersFr = emergency.numbers.map(n => `📞 **${n.number}** — ${n.label.fr}`).join('\n')

  // ─── Build transport step (city-specific when available) ───

  let transportEs: string, transportEn: string, transportFr: string

  if (cityTransport) {
    transportEs = `🚌 **Transporte público en ${city}**\n\n📱 **App oficial:** ${cityTransport.appName}\n🌐 **Web:** [${cityTransport.website}](${cityTransport.website})\n📋 **Incluye:** ${cityTransport.covers.es}\n\n📍 **Google Maps** también muestra rutas en tiempo real:\n[Cómo llegar en transporte público](${transitUrl})\n\n🔍 **Paradas cercanas:** [Ver en mapa](${transitSearchUrl})\n\n💡 Descarga la app **${cityTransport.appName}** para ver horarios exactos y tiempos de espera.`
    transportEn = `🚌 **Public transport in ${city}**\n\n📱 **Official app:** ${cityTransport.appName}\n🌐 **Website:** [${cityTransport.website}](${cityTransport.website})\n📋 **Includes:** ${cityTransport.covers.en}\n\n📍 **Google Maps** also shows real-time routes:\n[Get directions by public transport](${transitUrl})\n\n🔍 **Nearby stops:** [See on map](${transitSearchUrl})\n\n💡 Download the **${cityTransport.appName}** app for exact schedules and wait times.`
    transportFr = `🚌 **Transports en commun à ${city}**\n\n📱 **App officielle:** ${cityTransport.appName}\n🌐 **Site web:** [${cityTransport.website}](${cityTransport.website})\n📋 **Inclut:** ${cityTransport.covers.fr}\n\n📍 **Google Maps** affiche aussi les itinéraires en temps réel:\n[Itinéraire en transport en commun](${transitUrl})\n\n🔍 **Arrêts à proximité:** [Voir sur la carte](${transitSearchUrl})\n\n💡 Téléchargez l'app **${cityTransport.appName}** pour les horaires exacts et temps d'attente.`
  } else {
    transportEs = `🚌 **Transporte público en ${city}**\n\n📱 **Google Maps** te muestra rutas en tiempo real:\n[Cómo llegar en transporte público](${transitUrl})\n\n🔍 **Paradas y estaciones cercanas:**\n[Ver transporte en la zona](${transitSearchUrl})\n\n💡 **Consejo:** En Google Maps, selecciona el icono de transporte público (🚌) para ver todas las líneas y horarios.`
    transportEn = `🚌 **Public transport in ${city}**\n\n📱 **Google Maps** shows real-time routes:\n[Get directions by public transport](${transitUrl})\n\n🔍 **Nearby stops and stations:**\n[See transport in the area](${transitSearchUrl})\n\n💡 **Tip:** In Google Maps, select the public transport icon (🚌) to see all routes and schedules.`
    transportFr = `🚌 **Transports en commun à ${city}**\n\n📱 **Google Maps** affiche les itinéraires en temps réel:\n[Itinéraire en transport en commun](${transitUrl})\n\n🔍 **Arrêts et stations à proximité:**\n[Voir les transports dans la zone](${transitSearchUrl})\n\n💡 **Conseil:** Dans Google Maps, sélectionnez l'icône transport en commun (🚌) pour voir toutes les lignes et horaires.`
  }

  // ─── Build steps ───

  const steps: TrilingualZoneConfig['steps'] = [
    {
      type: 'text',
      title: { es: 'Mapa turístico', en: 'Tourist map', fr: 'Plan touristique' },
      content: {
        es: `🗺️ **Mapa turístico de ${city}**\n\n📍 **Google Maps offline:** Abre Google Maps → busca "${city}" → toca "Descargar" para usar sin datos\n\n🏛️ **Oficina de turismo:** [Ver en mapa](${tourismSearchUrl})\n\n💡 **Consejo:** Descarga el mapa offline antes de salir. Funciona sin WiFi ni datos móviles.`,
        en: `🗺️ **${city} tourist map**\n\n📍 **Google Maps offline:** Open Google Maps → search "${city}" → tap "Download" to use without data\n\n🏛️ **Tourist office:** [See on map](${tourismSearchUrl})\n\n💡 **Tip:** Download the offline map before heading out. Works without WiFi or mobile data.`,
        fr: `🗺️ **Plan touristique de ${city}**\n\n📍 **Google Maps hors ligne:** Ouvrez Google Maps → cherchez "${city}" → appuyez sur "Télécharger" pour utiliser sans données\n\n🏛️ **Office de tourisme:** [Voir sur la carte](${tourismSearchUrl})\n\n💡 **Conseil:** Téléchargez la carte hors ligne avant de sortir. Fonctionne sans WiFi ni données mobiles.`,
      },
    },
    {
      type: 'text',
      title: { es: 'Transporte público', en: 'Public transport', fr: 'Transports en commun' },
      content: { es: transportEs, en: transportEn, fr: transportFr },
    },
  ]

  // ─── Parking step (only if we have country-specific data) ───

  if (parking) {
    const appsListEs = parking.apps.map(a => `📱 **[${a.name}](${a.website})** — ${a.description.es}`).join('\n')
    const appsListEn = parking.apps.map(a => `📱 **[${a.name}](${a.website})** — ${a.description.en}`).join('\n')
    const appsListFr = parking.apps.map(a => `📱 **[${a.name}](${a.website})** — ${a.description.fr}`).join('\n')

    steps.push({
      type: 'text',
      title: { es: 'Aparcamiento', en: 'Parking', fr: 'Stationnement' },
      content: {
        es: `🅿️ **Aparcamiento en ${city}**\n\n${appsListEs}\n\n🔍 **Parkings cercanos:** [Ver en Google Maps](${parkingSearchUrl})\n\n💡 ${parking.tip.es}`,
        en: `🅿️ **Parking in ${city}**\n\n${appsListEn}\n\n🔍 **Nearby parking:** [See on Google Maps](${parkingSearchUrl})\n\n💡 ${parking.tip.en}`,
        fr: `🅿️ **Stationnement à ${city}**\n\n${appsListFr}\n\n🔍 **Parkings à proximité:** [Voir sur Google Maps](${parkingSearchUrl})\n\n💡 ${parking.tip.fr}`,
      },
    })
  }

  // ─── Emergency numbers step ───

  steps.push({
    type: 'text',
    title: { es: 'Números de emergencia', en: 'Emergency numbers', fr: "Numéros d'urgence" },
    content: {
      es: `🚨 **Números de emergencia en ${emergency.countryName.es}**\n\n${numbersEs}\n\n🏥 **Hospitales cercanos:** [Ver en mapa](${hospitalSearchUrl})\n💊 **Farmacias cercanas:** [Ver en mapa](${pharmacySearchUrl})\n\n💡 ${emergency.tip.es}`,
      en: `🚨 **Emergency numbers in ${emergency.countryName.en}**\n\n${numbersEn}\n\n🏥 **Nearby hospitals:** [See on map](${hospitalSearchUrl})\n💊 **Nearby pharmacies:** [See on map](${pharmacySearchUrl})\n\n💡 ${emergency.tip.en}`,
      fr: `🚨 **Numéros d'urgence en ${emergency.countryName.fr}**\n\n${numbersFr}\n\n🏥 **Hôpitaux à proximité:** [Voir sur la carte](${hospitalSearchUrl})\n💊 **Pharmacies à proximité:** [Voir sur la carte](${pharmacySearchUrl})\n\n💡 ${emergency.tip.fr}`,
    },
  })

  return {
    name: {
      es: 'Información útil',
      en: 'Useful Information',
      fr: 'Informations utiles',
    },
    icon: 'info',
    description: {
      es: `Mapas, transporte, aparcamiento y emergencias en ${city}`,
      en: `Maps, transport, parking and emergencies in ${city}`,
      fr: `Plans, transports, stationnement et urgences à ${city}`,
    },
    steps,
    needsTranslation: false,
  }
}
