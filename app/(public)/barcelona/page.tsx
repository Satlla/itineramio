import CityLandingPage from '@/components/landing/CityLandingPage'
import type { CityData } from '@/components/landing/CityLandingPage'

const barcelonaData: CityData = {
  city: 'Barcelona',
  region: 'Cataluna',
  heroSubtitle: 'Barcelona es uno de los mercados de alquiler vacacional mas regulados de Europa. Con el PEUAT y la tasa turistica, un manual digital profesional te ayuda a cumplir la normativa y reducir incidencias vecinales.',

  listings: '18.245',
  occupancy: '61%',
  adr: '192$',
  revpar: '117$',

  mainLaw: 'PEUAT (Plan Especial Urbanistico de Alojamiento Turistico) + Decreto 159/2012 de Cataluna',
  registrationType: 'Licencia HUT (Habitatge d\'Us Turistic) del Ayuntamiento de Barcelona',
  keyRequirements: [
    'Obtener licencia HUT del distrito correspondiente (no se conceden nuevas en zona 1)',
    'Inscripcion en el Registro de Turismo de Cataluna (RTC)',
    'Cedula de habitabilidad vigente',
    'Comunicar a la comunidad de propietarios (requiere no prohibicion en estatutos)',
    'Cobrar y liquidar la tasa turistica (IEET)',
    'Parte de viajeros ante Mossos d\'Esquadra',
    'Exhibir numero de registro HUT en todos los anuncios',
  ],
  penalties: 'Hasta 600.000 euros. Barcelona ha impuesto multas de 60.000 euros por operar sin licencia',
  touristTax: '4,00 euros/persona/noche (ciudad de Barcelona, 2026)',

  topZones: [
    { name: 'Eixample', reason: 'Alta demanda, arquitectura modernista. Zona 2 del PEUAT con posibilidad limitada de nuevas licencias.' },
    { name: 'Gracia', reason: 'Barrio bohemio, muy valorado por turistas que buscan experiencia local. Licencias escasas.' },
    { name: 'Born / Ribera', reason: 'Zona premium junto a la playa y el Picasso. ADR muy elevado en estancias cortas.' },
    { name: 'Barceloneta', reason: 'Demanda maxima en verano. Sin nuevas licencias HUT, las existentes tienen alto valor.' },
    { name: 'Poble Sec / Sant Antoni', reason: 'Barrios emergentes con mejor relacion precio-licencia. Creciente interes turistico.' },
  ],

  highSeason: 'Junio a Septiembre, Semana Santa y puentes',
  lowSeason: 'Enero a Febrero',
  keyEvents: [
    'Mobile World Congress (febrero-marzo)',
    'Sant Jordi (23 abril)',
    'Primavera Sound (junio)',
    'La Merce (septiembre)',
    'Partidos del FC Barcelona en Spotify Camp Nou',
  ],

  guestQuestions: [
    'Como llego desde El Prat al apartamento?',
    'Cual es la contrasena del WiFi?',
    'A que hora puedo hacer check-in?',
    'Donde tiro la basura y como funciona el reciclaje?',
    'Que horario de silencio hay que respetar?',
    'Donde compro la tarjeta T-Casual de metro?',
    'La playa mas cercana?',
    'Hay aire acondicionado? Como se enciende?',
  ],
  whyManualHelps: 'Barcelona tiene la regulacion mas estricta de Espana en alquiler turistico. Las quejas vecinales pueden suponer la perdida de la licencia HUT. Un manual digital con normas de convivencia, horarios de silencio y gestion de basuras reduce incidencias y protege tu licencia.',

  keywords: [
    'manual digital HUT barcelona',
    'vivienda uso turistico barcelona',
    'PEUAT barcelona',
    'tasa turistica barcelona',
    'airbnb barcelona normativa',
  ],
  metaTitle: 'Manual Digital Apartamento Turistico Barcelona | Itineramio',
  metaDescription: 'Manual digital para HUT en Barcelona. PEUAT, tasa turistica, normativa 2026. Reduce incidencias vecinales. Prueba gratis.',

  faqs: [
    {
      question: 'Puedo obtener una nueva licencia HUT en Barcelona en 2026?',
      answer: 'Depende de la zona del PEUAT. En la Zona 1 (centro historico, Barceloneta) no se conceden nuevas licencias. En zonas 2 y 3 es posible con restricciones. Muchos operadores adquieren licencias existentes mediante traspaso. Consulta el plan urbanistico del distrito.',
    },
    {
      question: 'Cuanto es la tasa turistica en Barcelona?',
      answer: 'En 2026, la tasa turistica (IEET) en la ciudad de Barcelona es de aproximadamente 4 euros por persona y noche. Es obligatorio cobrarla al huesped y liquidarla trimestralmente ante la Agencia Tributaria de Cataluna.',
    },
    {
      question: 'Que pasa si recibo quejas vecinales en Barcelona?',
      answer: 'Las quejas vecinales reiteradas pueden derivar en un expediente sancionador y la revocacion de la licencia HUT. Un manual digital con normas de convivencia, horarios de silencio y protocolo de reciclaje reduce significativamente las incidencias.',
    },
    {
      question: 'Como ayuda Itineramio con el cumplimiento normativo en Barcelona?',
      answer: 'Itineramio te permite incluir normas de convivencia, horarios de silencio, protocolo de basuras y reciclaje, y toda la informacion que exige la normativa catalana. El huesped la recibe antes de llegar, lo que reduce conflictos vecinales.',
    },
  ],
}

export default function BarcelonaPage() {
  return <CityLandingPage data={barcelonaData} />
}
