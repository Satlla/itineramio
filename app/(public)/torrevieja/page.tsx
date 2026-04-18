import CityLandingPage from '@/components/landing/CityLandingPage'
import type { CityData } from '@/components/landing/CityLandingPage'

const torreviejaData: CityData = {
  city: 'Torrevieja',
  region: 'Comunitat Valenciana - Costa Blanca Sur',
  heroSubtitle: 'Torrevieja es uno de los mercados de alquiler vacacional mas activos de la Costa Blanca, con una altisima proporcion de turistas nordicos y europeos. Crea un manual digital multilingue para tus huespedes y simplifica la comunicacion sobre playas, transporte y normas locales.',

  listings: '~6.000',
  occupancy: '67%',
  adr: '110€',
  revpar: '~75€',

  mainLaw: 'Ley 15/2018 Comunitat Valenciana + ordenanza municipal 2022',
  registrationType: 'Inscripcion Registro Turistico (CPT) + licencia local municipal',
  keyRequirements: [
    'CPT (Certificado de Propiedad Turistica) obligatorio ante la Generalitat Valenciana',
    'Licencia de actividad municipal segun ordenanza de Torrevieja 2022',
    'Cumplimiento de tamano minimo establecido en la ordenanza municipal',
    'Sin moratoria total pero con requisitos de licencia local que limitan nuevas altas',
    'Registro de viajeros ante la Guardia Civil via SES.Hospedajes',
    'Registro estatal obligatorio desde julio de 2025',
  ],
  penalties: 'Sanciones por operar sin CPT ni licencia municipal. La ordenanza de 2022 endurece los requisitos de acceso a la actividad',
  touristTax: null,

  topZones: [
    { name: 'Playas Torrevieja - Las Habaneras', reason: 'Paseo maritimo principal con acceso a las mejores playas urbanas. Maxima demanda turistica y alta rotacion de reservas en temporada alta.' },
    { name: 'La Mata - Los Locos', reason: 'Zona con alta concentracion de turistas nordicos y europeos, especialmente chalets y apartamentos de larga estancia. Perfil de huesped tranquilo que busca naturaleza y playa.' },
    { name: 'Playa del Cura - Centro', reason: 'Zona urbana central con buena oferta de servicios. Alta proporcion de jubilados europeos que alquilan por periodos largos fuera de temporada alta.' },
    { name: 'Laguna de La Mata', reason: 'Entorno natural protegido con flamingos y rutas de senderismo. Perfil de huesped interesado en naturaleza y turismo activo de bajo impacto.' },
    { name: 'Orihuela Costa - Cabo Roig', reason: 'Zona cercana con urbanizaciones de nivel alto, campos de golf y playas tranquilas. Ideal para un perfil de huesped premium con mayor poder adquisitivo.' },
  ],

  highSeason: 'Julio y Agosto + Semana Santa',
  lowSeason: 'Noviembre a Febrero',
  keyEvents: [
    'Carnaval de Torrevieja (febrero - marzo)',
    'Semana Santa',
    'Hogueras de San Juan (24 de junio)',
    'Fiesta de la Sal (julio)',
    'Conciertos en la plaza del verano (julio - agosto)',
  ],

  guestQuestions: [
    'Como llego desde el aeropuerto de Murcia (RMU) o Alicante (ALC)?',
    'Cuando y donde es el mercadillo semanal?',
    'Donde hay parking gratuito cerca de la playa?',
    'Hay acceso para personas con movilidad reducida en las playas?',
    'Donde puedo alquilar coche o bicicleta?',
    'Que eventos deportivos o actividades hay durante mi estancia?',
    'Como es el clima en Torrevieja, cuantos dias de sol hay?',
    'Cuales son los mejores restaurantes de pescado fresco?',
  ],
  whyManualHelps: 'Torrevieja tiene una proporcion muy alta de huespedes extranjeros, especialmente nordicos, que frecuentemente no hablan castellano. Un manual digital con mapas de zonas de parking, transporte publico, normas de playa y ubicacion de farmacias simplifica enormemente la comunicacion y reduce las incidencias durante la estancia.',

  keywords: [
    'manual digital apartamento turistico torrevieja',
    'vivienda turistica torrevieja CPT',
    'alquiler vacacional costa blanca sur',
    'airbnb torrevieja normativa',
    'gestion huesped nordico torrevieja',
  ],
  metaTitle: 'Manual Digital Apartamento Turistico Torrevieja | Itineramio',
  metaDescription: 'Manual digital para vivienda turistica en Torrevieja. Normativa valenciana CPT, playas, lagunas y turismo nordico. Prueba gratis 15 dias.',

  faqs: [
    {
      question: 'Que normativa regula las viviendas turisticas en Torrevieja?',
      answer: 'Las viviendas turisticas en Torrevieja se regulan por la Ley 15/2018 de turismo de la Comunitat Valenciana y la ordenanza municipal de 2022. Es obligatorio obtener el CPT (Certificado de Propiedad Turistica) ante la Generalitat Valenciana y cumplir ademas con los requisitos de la licencia local municipal, que incluye un tamano minimo del inmueble.',
    },
    {
      question: 'Hay tasa turistica en Torrevieja?',
      answer: 'No. Torrevieja no ha implementado una tasa turistica para viviendas de uso turistico. La Comunitat Valenciana tampoco tiene tasa turistica autonómica a fecha de 2026, lo que supone una ventaja competitiva frente a destinos como Cataluna o Baleares.',
    },
    {
      question: 'Cuanto puede ganar un apartamento turistico en Torrevieja?',
      answer: 'Segun datos del mercado, la tarifa media diaria en Torrevieja es de aproximadamente 110 euros, con una ocupacion media del 67% y un RevPAR de unos 75 euros. La alta proporcion de turistas nordicos y europeos genera una temporada alta mas prolongada, con buena demanda incluso en Semana Santa y puentes de primavera.',
    },
    {
      question: 'Como se registran los viajeros en Torrevieja?',
      answer: 'En Torrevieja el registro de viajeros se realiza ante la Guardia Civil a traves del sistema SES.Hospedajes, disponible en la web de la Secretaria de Estado de Seguridad. Ademas, desde julio de 2025 existe la obligacion de registro en el sistema estatal de identificacion de viajeros. Es obligatorio registrar a todos los huespedes mayores de edad.',
    },
  ],
}

export default function TorreviejaPage() {
  return <CityLandingPage data={torreviejaData} />
}
