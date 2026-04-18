import CityLandingPage from '@/components/landing/CityLandingPage'
import type { CityData } from '@/components/landing/CityLandingPage'

const sevillaData: CityData = {
  city: 'Sevilla',
  region: 'Andalucia',
  heroSubtitle: 'Sevilla es la capital del turismo andaluz, con Feria de Abril, Semana Santa y temperaturas que exigen instrucciones claras sobre el aire acondicionado. Un manual digital profesional mejora la experiencia y reduce llamadas.',

  listings: '7.920',
  occupancy: '56%',
  adr: '135$',
  revpar: '76$',

  mainLaw: 'Decreto 28/2016 de Viviendas con Fines Turisticos de Andalucia',
  registrationType: 'Declaracion responsable ante el Registro de Turismo de Andalucia (RTA)',
  keyRequirements: [
    'Declaracion responsable ante el Registro de Turismo de Andalucia',
    'Licencia de ocupacion o cedula de habitabilidad',
    'Disponer de hojas de reclamaciones',
    'Climatizacion obligatoria: calefaccion y refrigeracion',
    'Botiquin de primeros auxilios',
    'Informacion turistica de la zona a disposicion del huesped',
    'Registro de viajeros ante la Policia Nacional',
    'Comunicar a la comunidad de propietarios',
  ],
  penalties: 'Hasta 150.000 euros para infracciones muy graves en Andalucia',
  touristTax: null,

  topZones: [
    { name: 'Santa Cruz', reason: 'Barrio historico junto a la Catedral y el Alcazar. Maxima ocupacion y ADR premium todo el ano.' },
    { name: 'Triana', reason: 'Barrio con caracter propio al otro lado del Guadalquivir. Flamenco, ceramica y gastronomia. Muy buscado.' },
    { name: 'Alameda de Hercules', reason: 'Zona de moda con vida nocturna. Perfil joven e internacional. Buena rentabilidad.' },
    { name: 'Macarena', reason: 'Autenticidad sevillana a buen precio. Proximidad a monumentos y buena conexion.' },
    { name: 'Nervion', reason: 'Zona comercial y de negocios. Turismo deportivo (Sanchez-Pizjuan) y estancias medias.' },
  ],

  highSeason: 'Marzo a Mayo (Semana Santa, Feria) y Octubre a Noviembre',
  lowSeason: 'Julio y Agosto (temperaturas superiores a 40 grados)',
  keyEvents: [
    'Semana Santa (marzo-abril)',
    'Feria de Abril',
    'Noche en Blanco (octubre)',
    'Bienal de Flamenco (anos pares)',
    'Partidos del Sevilla FC y Betis',
  ],

  guestQuestions: [
    'Como llego desde el aeropuerto San Pablo al apartamento?',
    'Cual es la contrasena del WiFi?',
    'Como funciona el aire acondicionado? (pregunta numero 1 en verano)',
    'Donde puedo ver flamenco autentico?',
    'Como llego a la Catedral / Alcazar desde aqui?',
    'Donde puedo aparcar?',
    'Hay alguna terraza o bar cerca para tapear?',
    'Que debo saber sobre la Feria de Abril?',
  ],
  whyManualHelps: 'En Sevilla, el calor extremo en verano genera constantes preguntas sobre el aire acondicionado. Durante Semana Santa y Feria, los huespedes necesitan informacion sobre itinerarios, cortes de trafico y recomendaciones. Un manual digital con estas instrucciones reduce drasticamente las llamadas.',

  keywords: [
    'manual digital apartamento turistico sevilla',
    'VFT sevilla registro',
    'alquiler vacacional sevilla',
    'decreto 28/2016 andalucia',
    'airbnb sevilla normativa',
  ],
  metaTitle: 'Manual Digital Apartamento Turistico Sevilla | Itineramio',
  metaDescription: 'Manual digital para alquiler turistico en Sevilla. Gestiona check-in, AC y Feria de Abril. Prueba gratis 15 dias.',

  faqs: [
    {
      question: 'Que necesito para registrar mi vivienda turistica en Sevilla?',
      answer: 'Debes presentar una declaracion responsable ante el Registro de Turismo de Andalucia (Decreto 28/2016). Necesitas licencia de ocupacion, climatizacion obligatoria (AC y calefaccion), botiquin y hojas de reclamaciones. El proceso es relativamente agil comparado con Barcelona.',
    },
    {
      question: 'Es obligatorio tener aire acondicionado en un VFT en Sevilla?',
      answer: 'Si, el Decreto 28/2016 exige que las VFT dispongan de sistema de climatizacion adecuado tanto para frio como para calor. En Sevilla, con temperaturas que superan los 40 grados en verano, es imprescindible tanto legal como comercialmente.',
    },
    {
      question: 'Hay tasa turistica en Sevilla?',
      answer: 'A fecha de 2026, Andalucia no ha implementado una tasa turistica, a diferencia de Cataluna o la Comunidad Valenciana. Esto supone un ahorro para el huesped y una ventaja competitiva para los anfitriones sevillanos.',
    },
    {
      question: 'Como preparo mi manual digital para la Feria de Abril?',
      answer: 'Durante la Feria, incluye en tu manual informacion sobre acceso al recinto ferial, transporte nocturno, horarios de casetas, y normas de ruido en el barrio. Los huespedes que visitan Sevilla en Feria valoran enormemente esta informacion local.',
    },
  ],
}

export default function SevillaPage() {
  return <CityLandingPage data={sevillaData} />
}
