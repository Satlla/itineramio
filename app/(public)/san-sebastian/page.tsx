import CityLandingPage from '@/components/landing/CityLandingPage'
import type { CityData } from '@/components/landing/CityLandingPage'

const sanSebastianData: CityData = {
  city: 'San Sebastian',
  region: 'Pais Vasco',
  heroSubtitle: 'San Sebastian combina dos playas urbanas, una gastronomia de referencia mundial y un calendario de festivales de primer nivel. Crea un manual digital profesional para tus huespedes y reduce las preguntas sobre pintxos, parking, surf y transporte.',

  listings: '~1.200',
  occupancy: '60%',
  adr: '165€',
  revpar: '~98€',

  mainLaw: 'Ley de turismo vasca - Registro Vasco de Empresas y Actividades Turisticas',
  registrationType: 'Comunicacion al ayuntamiento y registro en el Registro Vasco de Empresas Turisticas',
  keyRequirements: [
    'Registro en el Registro Vasco de Empresas y Actividades Turisticas',
    'Comunicacion previa al ayuntamiento de San Sebastian',
    'Codigo de actividad turistica visible en el anuncio',
    'Sin moratoria general pero flota limitada en el Casco Viejo (Parte Vieja)',
    'Partes de viajeros a la Ertzaintza (no sistema SES.Hospedajes)',
    'Registro estatal obligatorio desde julio 2025',
  ],
  penalties: 'Sanciones por operar sin registro en el Registro Vasco. Control creciente en el casco historico',
  touristTax: null,

  topZones: [
    { name: 'Parte Vieja', reason: 'Nucleo gastronimico con la mayor concentracion de bares de pintxos del mundo. Maxima demanda turistica y perfil de huesped cultural y gastronomico.' },
    { name: 'Bahia La Concha', reason: 'Playa premium considerada una de las mejores de Europa. Alta demanda en verano con un perfil de huesped de nivel adquisitivo elevado.' },
    { name: 'Gros - Zurriola', reason: 'Barrio surfer junto a la playa de Zurriola. Perfil joven, internacional y deportivo. Buena relacion calidad-precio para el anfitrion.' },
    { name: 'Antiguo - Monte Igueldo', reason: 'Zona residencial tranquila con acceso al Monte Igueldo y vistas panoramicas. Ideal para huespedes que buscan descanso y naturaleza cerca del centro.' },
    { name: 'Amara - Egia', reason: 'Barrios residenciales con precios mas asequibles y buena conexion en bus. Perfil de huesped que prioriza el precio sobre la ubicacion premium.' },
  ],

  highSeason: 'Junio a Septiembre',
  lowSeason: 'Enero a Marzo',
  keyEvents: [
    'Tamborrada (20 de enero)',
    'Jazzaldia - Festival de Jazz (julio)',
    'Semana Grande - Aste Nagusia (agosto)',
    'Festival Internacional de Cine (septiembre)',
    'Maraton de San Sebastian (noviembre)',
  ],

  guestQuestions: [
    'Donde puedo aparcar y hay zonas verdes para residentes?',
    'Como funciona el sistema de bicicletas publicas Dbizi?',
    'Que planes hay para hacer con ninos?',
    'Como subo al Monte Igueldo o al Monte Urgull?',
    'Cuales son los mejores bares de pintxos de la Parte Vieja?',
    'Hay mucho ruido por la noche cerca de los bares?',
    'Como es el clima en San Sebastian, tengo que llevar ropa de abrigo?',
    'Como me muevo durante las fiestas y los festivales?',
  ],
  whyManualHelps: 'San Sebastian tiene dos playas urbanas, decenas de restaurantes con estrella Michelin y pintxos, y un calendario de festivales muy activo. Los huespedes preguntan constantemente sobre que hacer, donde comer y como moverse. Un manual digital en euskera, castellano, ingles y frances resuelve estas dudas antes de la llegada y optimiza el proceso de check-in.',

  keywords: [
    'manual digital apartamento turistico san sebastian',
    'vivienda turistica donostia normativa',
    'alquiler vacacional san sebastian',
    'airbnb donostia san sebastian',
    'gestion huesped pais vasco',
  ],
  metaTitle: 'Manual Digital Apartamento Turistico San Sebastian | Itineramio',
  metaDescription: 'Manual digital para vivienda turistica en San Sebastian. Normativa vasca, pintxos, playas y eventos. Prueba gratis 15 dias.',

  faqs: [
    {
      question: 'Que normativa regula las viviendas turisticas en San Sebastian?',
      answer: 'Las viviendas turisticas en San Sebastian se regulan por la ley de turismo del Pais Vasco y el Registro Vasco de Empresas y Actividades Turisticas. Es necesario realizar una comunicacion previa al ayuntamiento y obtener el codigo de actividad. En la Parte Vieja existe un control especial sobre el numero de nuevas altas.',
    },
    {
      question: 'Hay tasa turistica en San Sebastian?',
      answer: 'No. San Sebastian y el Pais Vasco no han implementado una tasa turistica para viviendas de uso turistico. Si existe una tasa aplicada a pasajeros de cruceros, pero no afecta a los huespedes de apartamentos turisticos.',
    },
    {
      question: 'Cuanto puede ganar un apartamento turistico en San Sebastian?',
      answer: 'Segun datos del mercado, la tarifa media diaria en San Sebastian es de aproximadamente 165 euros, con una ocupacion media del 60% y un RevPAR de unos 98 euros. Las zonas de La Concha y la Parte Vieja tienen los precios mas altos, especialmente durante el Festival de Cine y la Semana Grande.',
    },
    {
      question: 'Es obligatorio registrar a los viajeros en San Sebastian?',
      answer: 'Si. En el Pais Vasco los partes de viajeros se comunican a la Ertzaintza, a diferencia de otras comunidades donde se usa el sistema SES.Hospedajes de la Guardia Civil o la Policia Nacional. Ademas, desde julio de 2025 existe la obligacion de registro en el sistema estatal de identificacion.',
    },
  ],
}

export default function SanSebastianPage() {
  return <CityLandingPage data={sanSebastianData} />
}
