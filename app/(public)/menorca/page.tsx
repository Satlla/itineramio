import CityLandingPage from '@/components/landing/CityLandingPage'
import type { CityData } from '@/components/landing/CityLandingPage'

const menorcaData: CityData = {
  city: 'Menorca',
  region: 'Islas Baleares',
  heroSubtitle: 'Menorca es un destino natural protegido con uno de los mercados de alquiler vacacional mas restringidos de Espana. El PIAT cerro el registro de nuevas plazas en 2021. Un manual digital profesional te ayuda a cumplir la ecotasa, las normativas medioambientales y a informar correctamente a tus huespedes.',

  listings: '2.500',
  occupancy: '55%',
  adr: '175€',
  revpar: '100€',

  mainLaw: 'Ley 8/2012 Baleares + PIAT - moratoria plurifamiliares',
  registrationType: 'Habilitacion turistica insular con sistema de plazas (PIAT)',
  keyRequirements: [
    'Moratoria para pisos plurifamiliares: no se pueden registrar nuevas VUT en edificios de apartamentos',
    'PIAT completo: Menorca cerro el registro de nuevas plazas turisticas en 2021',
    'Las plazas turisticas se autorizan por cupos insulares establecidos por el Consell de Menorca',
    'Cobrar y liquidar la ecotasa balear por cada huesped y noche',
    'Comunicar entradas y salidas a traves de SES.Hospedajes (plataforma policial)',
    'Inscripcion en el Registro Estatal de Alquiler Turistico (obligatorio desde julio 2025)',
  ],
  penalties: 'Registro cerrado - capacidad maxima alcanzada. No se permiten nuevas VUT en plurifamiliares. Sanciones graves por operar sin habilitacion insular vigente.',
  touristTax: 'Ecotasa balear: 2 EUR (1-3 llaves) a 3 EUR (4 llaves) por persona y noche',

  topZones: [
    { name: 'Cala Galdana', reason: 'Principal zona de playas del sur. Alta demanda familiar y de villas. ADR muy elevado en temporada alta.' },
    { name: 'Binibeca / San Jaime', reason: 'Ambiente pesquero y bohemio muy valorado. Fuerte demanda de turismo europeo de calidad.' },
    { name: 'Mao capital', reason: 'Zona urbana cerca del aeropuerto. Ideal para estancias cortas y turismo de negocios o transito.' },
    { name: 'Ciutadella', reason: 'Ciudad historica con puerto y casco antiguo. Alta demanda cultural y de turismo premium.' },
    { name: 'Son Bou / Santo Tomas', reason: 'Playas largas del sur con presencia de resorts. Muy popular en familia y estancias semanales.' },
  ],

  highSeason: 'Abril a Octubre',
  lowSeason: 'Noviembre a Marzo',
  keyEvents: [
    'Fiestas de Sant Joan en Ciutadella (23 de junio) - fiesta mas importante de la isla',
    'Fiestas de Sant Marti (17 de octubre)',
    'Menorca Vela Clasica (julio)',
    'Festival Folk de Menorca (julio)',
  ],

  guestQuestions: [
    'Donde puedo alquilar un barco o kayak?',
    'Cuales son las normas para visitar zonas protegidas de la Reserva de la Biosfera?',
    'Hay playas nudistas en Menorca?',
    'Donde probar el queso de Menorca y la ginebra Xoriguer?',
    'Es necesario coche para moverse por la isla?',
    'Hay restricciones de trafico en zonas peatonales del centro?',
    'Como llegar a las calas escondidas mas bonitas?',
    'Que es el viento Tramontana y cuando sopla?',
  ],
  whyManualHelps: 'Menorca es una isla pequena con multiples recursos naturales protegidos. Un manual digital da instrucciones claras sobre horarios de senderos, uso responsable del agua, normativa medioambiental, lineas de bus (L1-L6) y expresiones menorquinas. Reduce llamadas al host y evita problemas con la Reserva de la Biosfera.',

  keywords: [
    'manual digital apartamento turistico menorca',
    'ecotasa balear menorca',
    'PIAT menorca plazas turisticas',
    'alquiler vacacional menorca normativa',
    'airbnb menorca regulacion 2026',
  ],
  metaTitle: 'Manual Digital Apartamento Turistico Menorca | Itineramio',
  metaDescription: 'Manual digital para VUT en Menorca. Ecotasa balear, PIAT, moratoria plurifamiliares, normativa 2026. Reduce incidencias y gestiona huespedes.',

  faqs: [
    {
      question: 'Puedo abrir un nuevo apartamento turistico en Menorca en 2026?',
      answer: 'Es muy dificil. El PIAT de Menorca cerro el registro de nuevas plazas turisticas en 2021 al alcanzar la capacidad maxima insular. Ademas, existe moratoria para pisos en edificios plurifamiliares. Solo es posible operar si se adquiere una habilitacion turistica existente con sus plazas autorizadas. Consulta al Consell Insular de Menorca antes de cualquier tramite.',
    },
    {
      question: 'Cuanto es la ecotasa balear en Menorca?',
      answer: 'La ecotasa balear (Impost sobre estades turistiques) en Menorca oscila entre 2 EUR para establecimientos de 1-3 llaves y 3 EUR para los de 4 llaves, por persona y noche. Es obligatorio cobrarla al huesped y liquidarla ante la Agencia Tributaria Balear. En temporada baja puede aplicarse una reduccion del 50%.',
    },
    {
      question: 'Que es el PIAT y como afecta a los apartamentos turisticos de Menorca?',
      answer: 'El PIAT (Plan de Intervencio als Ambits de Menorca) es el instrumento de ordenacion territorial que regula, entre otros, las plazas turisticas de la isla. Establece un numero maximo de plazas para preservar el entorno natural de la Reserva de la Biosfera. Al haberse agotado el cupo, no se pueden registrar nuevas VUT salvo transmision de plazas existentes.',
    },
    {
      question: 'Como ayuda Itineramio con la normativa de Menorca?',
      answer: 'Itineramio te permite incluir en el manual digital toda la informacion obligatoria: numero de habilitacion insular, normas de la Reserva de la Biosfera, instrucciones de ecotasa, horarios de transporte publico y guias de actividades responsables. El huesped la recibe antes de llegar, reduciendo preguntas repetitivas y asegurando el cumplimiento normativo.',
    },
  ],
}

export default function MenorcaPage() {
  return <CityLandingPage data={menorcaData} />
}
