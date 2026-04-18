import CityLandingPage from '@/components/landing/CityLandingPage'
import type { CityData } from '@/components/landing/CityLandingPage'

const malagaData: CityData = {
  city: 'Malaga',
  region: 'Andalucia',
  heroSubtitle: 'Malaga es la puerta de entrada a la Costa del Sol y uno de los mercados de alquiler vacacional con mayor crecimiento en Espana. Con aeropuerto internacional y turismo de sol y playa, un manual digital es esencial para gestionar el flujo constante de huespedes.',

  listings: '10.150',
  occupancy: '62%',
  adr: '155$',
  revpar: '96$',

  mainLaw: 'Decreto 28/2016 de Viviendas con Fines Turisticos de Andalucia',
  registrationType: 'Declaracion responsable ante el Registro de Turismo de Andalucia (RTA)',
  keyRequirements: [
    'Declaracion responsable ante el Registro de Turismo de Andalucia',
    'Licencia de ocupacion o cedula de habitabilidad',
    'Climatizacion obligatoria (calefaccion y refrigeracion)',
    'Botiquin de primeros auxilios',
    'Hojas de reclamaciones a disposicion del huesped',
    'Informacion turistica de la zona',
    'Registro de viajeros ante la Policia Nacional',
    'El Ayuntamiento de Malaga exige requisitos adicionales de zonificacion desde 2024',
  ],
  penalties: 'Hasta 150.000 euros para infracciones muy graves. El Ayuntamiento de Malaga ha intensificado inspecciones desde 2024',
  touristTax: null,

  topZones: [
    { name: 'Centro Historico', reason: 'Calle Larios, Picasso, Alcazaba. Maxima demanda todo el ano. ADR premium y alta ocupacion.' },
    { name: 'Malagueta', reason: 'Playa urbana de referencia. Combina playa y centro. Muy demandado en verano y fines de semana.' },
    { name: 'Soho', reason: 'Barrio de las artes, en plena transformacion. Perfil joven y cultural. Precios en ascenso.' },
    { name: 'Pedregalejo / El Palo', reason: 'Barrio de playa con espiritu de pueblo. Espetos, chiringuitos y ambiente local. Familias y estancias largas.' },
    { name: 'Teatinos / Universidad', reason: 'Zona residencial bien conectada. Precio mas asequible, ideal para nomadas digitales y estancias medias.' },
  ],

  highSeason: 'Junio a Septiembre (sol y playa) y Semana Santa',
  lowSeason: 'Noviembre a Febrero (aunque el clima suave mantiene demanda base)',
  keyEvents: [
    'Semana Santa (procesiones de gran tradicion)',
    'Feria de Malaga (agosto)',
    'Festival de Cine de Malaga (marzo)',
    'Noche en Blanco (mayo)',
    'Eventos en el Puerto y Muelle Uno',
  ],

  guestQuestions: [
    'Como llego desde el aeropuerto de Malaga al apartamento?',
    'Cual es la contrasena del WiFi?',
    'Donde esta la playa mas cercana?',
    'Donde puedo comer espetos de sardinas?',
    'Como funciona el aire acondicionado?',
    'Hay parking cerca o zona de aparcamiento?',
    'Como llego al centro desde aqui andando o en bus?',
    'Que excursiones puedo hacer desde Malaga (Ronda, Nerja, Granada)?',
  ],
  whyManualHelps: 'Malaga recibe millones de turistas internacionales a traves de su aeropuerto, muchos de ellos britanicos, alemanes y nordicos que no hablan espanol. Un manual digital multilingue con instrucciones de llegada desde el aeropuerto, funcionamiento del AC y recomendaciones locales es imprescindible.',

  keywords: [
    'manual digital apartamento turistico malaga',
    'VFT malaga registro',
    'alquiler vacacional costa del sol',
    'vivienda turistica malaga',
    'airbnb malaga normativa',
  ],
  metaTitle: 'Manual Digital Apartamento Turistico Malaga | Itineramio',
  metaDescription: 'Manual digital para vivienda turistica en Malaga. Normativa andaluza, mejores barrios, aeropuerto. Prueba gratis.',

  faqs: [
    {
      question: 'Que necesito para registrar un VFT en Malaga?',
      answer: 'Debes presentar una declaracion responsable ante el Registro de Turismo de Andalucia (Decreto 28/2016). Ademas, desde 2024, el Ayuntamiento de Malaga exige requisitos adicionales de zonificacion que limitan nuevas licencias en determinadas zonas del centro. Necesitas licencia de ocupacion, AC obligatorio y botiquin.',
    },
    {
      question: 'Hay tasa turistica en Malaga?',
      answer: 'A fecha de 2026, Andalucia no ha implementado tasa turistica. Sin embargo, la Junta de Andalucia ha debatido su introduccion. Actualmente, operar en Malaga no conlleva este coste adicional para el huesped.',
    },
    {
      question: 'Es rentable el alquiler vacacional en Malaga?',
      answer: 'Malaga tiene una ocupacion media del 62% con una tarifa media diaria de 155 dolares, resultando en un RevPAR de 96 dolares. Las zonas del centro y Malagueta superan estos promedios. El clima suave mantiene demanda incluso en temporada baja.',
    },
    {
      question: 'Por que un manual digital es especialmente util en Malaga?',
      answer: 'Malaga recibe turismo internacional masivo (britanicos, alemanes, nordicos) que a menudo no habla espanol. Un manual digital multilingue con instrucciones de llegada desde el aeropuerto, uso del AC, playas cercanas y recomendaciones de espetos ahorra decenas de mensajes por estancia.',
    },
  ],
}

export default function MalagaPage() {
  return <CityLandingPage data={malagaData} />
}
