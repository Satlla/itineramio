import CityLandingPage from '@/components/landing/CityLandingPage'
import type { CityData } from '@/components/landing/CityLandingPage'

const marbellaData: CityData = {
  city: 'Marbella',
  region: 'Andalucia - Costa del Sol',
  heroSubtitle: 'Marbella es uno de los mercados de alquiler vacacional mas exclusivos de Espana, con mas de 8.400 listings activos y un ADR de 390 EUR. Crea un manual digital profesional para tus huespedes internacionales y reduce llamadas, incidencias y malas resenas en un destino con frecuentes llegadas tardias.',

  listings: '8.482',
  occupancy: '58%',
  adr: '390€',
  revpar: '196€',

  mainLaw: 'Registro de Turismo de Andalucia (RTA) - Ley 13/2011',
  registrationType: 'Inscripcion obligatoria en el Registro de Turismo de Andalucia',
  keyRequirements: [
    'Inscripcion en el Registro de Turismo de Andalucia (RTA) y obtencion de numero de licencia',
    'Registro estatal de alquiler de corta duracion (RD 1312/2024) desde julio de 2025',
    'Registro de viajeros mediante SES.Hospedajes',
    'El Ayuntamiento planea registro municipal de VUT y prohibe cambio de locales a viviendas turisticas',
    'Se estudia zonificacion especialmente en Puerto Banus',
    'Se cancelaron 425 VUT irregulares en 2024',
  ],
  penalties: 'Sanciones por operar sin licencia. 425 VUT irregulares canceladas en 2024',
  touristTax: null,

  topZones: [
    { name: 'Puerto Banus / Nueva Andalucia', reason: 'Demanda de lujo, turistas internacionales. Cerca de playas, restaurantes exclusivos y yates. Familias acomodadas y parejas jovenes.' },
    { name: 'Centro historico y Paseo Maritimo', reason: 'Playa La Venus, casco antiguo, ocio nocturno y tiendas. Ideal para turismo urbano y playa. Gran demanda.' },
    { name: 'Golden Mile (Milla de Oro)', reason: 'Zona exclusiva entre Marbella y Banus. Huespedes de alto poder adquisitivo, golfistas y familias. ADR muy elevado.' },
    { name: 'San Pedro de Alcantara', reason: 'Barrio residencial con playa extensa y zonas comerciales modernas. Perfil internacional (nordicos, familias). Licencias relativamente accesibles.' },
    { name: 'Elviria / Cabopino', reason: 'Resorts y urbanizaciones familiares junto a la playa. Campos de golf. Demanda de familias y estancias largas (otono/invierno).' },
  ],

  highSeason: 'Junio a Septiembre (pico en julio-agosto)',
  lowSeason: 'Noviembre a Febrero',
  keyEvents: [
    'Feria de San Bernabe (8-14 junio)',
    'Festival Starlite (junio/julio)',
    'Procesion Virgen del Carmen (16 julio)',
    'Marbella Fashion Show (julio)',
    'Semana Santa (abril)',
  ],

  guestQuestions: [
    'Donde puedo aparcar (zona azul/gratis)?',
    'Como llego a la playa y al centro?',
    'Instrucciones de check-in (codigos de puerta)?',
    'Cual es la contrasena del WiFi?',
    'Horarios de recogida de basura?',
    'Normas de la casa (mascotas, fumar)?',
    'Mejor hora para evitar el trafico?',
    'Restaurantes y beach clubs recomendados?',
  ],
  whyManualHelps: 'Marbella atrae mucho turista internacional (britanicos, alemanes, nordicos, rusos) con llegadas tardias frecuentes. Un manual digital con instrucciones de check-in autonomo, WiFi, recomendaciones de restaurantes y beach clubs, y normas de la casa evita decenas de mensajes recurrentes. Especialmente util por la diversidad de idiomas y la complejidad de zonas como Puerto Banus.',

  keywords: [
    'manual digital apartamento turistico marbella',
    'vivienda turistica marbella',
    'alquiler vacacional marbella costa del sol',
    'airbnb marbella',
    'gestion huesped marbella',
  ],
  metaTitle: 'Manual Digital Apartamento Turistico Marbella | Itineramio',
  metaDescription: 'Crea tu manual digital para huespedes en Marbella. Normativa, zonas y gestion de vivienda turistica en la Costa del Sol.',

  faqs: [
    {
      question: 'Necesito licencia para alquilar mi piso turistico en Marbella?',
      answer: 'Si, necesitas inscribirte en el Registro de Turismo de Andalucia (RTA) y obtener numero de licencia. Ademas, desde julio de 2025, necesitas el numero estatal de alquiler de corta duracion. El Ayuntamiento de Marbella planea un registro municipal adicional y cancelo 425 VUT irregulares en 2024.',
    },
    {
      question: 'Hay tasa turistica en Marbella?',
      answer: 'No. A fecha de 2026, Andalucia no ha implementado tasa turistica. Esto supone una ventaja competitiva frente a destinos como Barcelona (9,50 EUR/persona/dia) o Baleares (ecotasa).',
    },
    {
      question: 'Cuales son las mejores zonas para alquiler vacacional en Marbella?',
      answer: 'Puerto Banus y la Milla de Oro para el segmento de lujo, el centro historico para turismo urbano, San Pedro de Alcantara para familias internacionales, y Elviria/Cabopino para estancias largas y golf. Cada zona tiene perfiles de demanda y facilidad de licencia diferentes.',
    },
    {
      question: 'Como ayuda un manual digital en Marbella?',
      answer: 'Marbella recibe mayoritariamente turistas internacionales (britanicos, alemanes, nordicos) con llegadas tardias. Un manual digital con check-in autonomo, WiFi, recomendaciones y normas en su idioma reduce drasticamente las llamadas y mejora las resenas.',
    },
  ],
}

export default function MarbellaPage() {
  return <CityLandingPage data={marbellaData} />
}
