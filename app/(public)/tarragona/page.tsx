import CityLandingPage from '@/components/landing/CityLandingPage'
import type { CityData } from '@/components/landing/CityLandingPage'

const tarragonaData: CityData = {
  city: 'Tarragona',
  region: 'Cataluna',
  heroSubtitle: 'Tarragona combina un extraordinario patrimonio romano declarado Patrimonio de la Humanidad con playas a pocos minutos del centro historico. Crea un manual digital profesional para tus huespedes y reduce las preguntas sobre monumentos, horarios y transporte.',

  listings: '~900',
  occupancy: '50%',
  adr: '100€',
  revpar: '~50€',

  mainLaw: 'Llei 13/2002 + Decret 75/2020 Catalunya - NIRTC',
  registrationType: 'Comunicacion inicio actividad + inscripcion Registro Turismo Catalunya (NIRTC)',
  keyRequirements: [
    'NIRTC (Numero d\'Inscripcio al Registre de Turisme de Catalunya) obligatorio',
    'Comunicacion de inicio de actividad a la Generalitat de Catalunya',
    'Tasa turistica catalana aplicable por persona y noche',
    'Registro de viajeros ante los Mossos d\'Esquadra (no sistema SES.Hospedajes)',
    'PEUAT de Tarragona en tramitacion, puede limitar futuras licencias',
    'Registro estatal obligatorio desde julio de 2025',
  ],
  penalties: 'Sanciones por operar sin NIRTC. El PEUAT en tramitacion puede limitar el otorgamiento de nuevas licencias en determinadas zonas',
  touristTax: 'Tasa turistica catalana: 1-4 EUR por persona y noche segun categoria de alojamiento',

  topZones: [
    { name: 'Casco Historico - Part Alta', reason: 'Zona arqueologica con la Catedral y el Foro Romano. Maxima demanda de turismo cultural y patrimonio UNESCO. Perfil de huesped adulto y con poder adquisitivo medio-alto.' },
    { name: 'Rambla Nova - Puerto', reason: 'Eje comercial y de ocio con acceso a la playa del Miracle. Buena conexion con el centro historico y el paseo maritimo. Alta demanda de turismo familiar.' },
    { name: 'Playa Miracle - San Salvador', reason: 'Zona costera familiar con acceso directo a la playa. Alta demanda en temporada de verano, especialmente para familias con ninos.' },
    { name: 'Altafulla - Tamarit', reason: 'Pueblos costeros con encanto a pocos kilometros de Tarragona. Perfil de huesped que busca tranquilidad y autenticidad con el mar cerca.' },
    { name: 'Els Pallaresos', reason: 'Zona residencial tranquila en el area metropolitana de Tarragona. Precios mas asequibles y ambiente local, con buena conexion al centro.' },
  ],

  highSeason: 'Junio a Septiembre',
  lowSeason: 'Noviembre a Marzo',
  keyEvents: [
    'Sant Jordi (23 de abril)',
    'Curtas de Minusica - Festival de cortometrajes (julio)',
    'Festival Internacional de Musica de Tarragona (verano)',
    'Festividad de Santa Tecla - Fiesta Mayor (23 de septiembre)',
    'Temporada de cruceros MSC y otros (verano)',
  ],

  guestQuestions: [
    'Donde puedo aparcar en el centro de Tarragona?',
    'Que museos y monumentos estan abiertos y en que horario?',
    'Necesito coche para moverme por Tarragona y la costa?',
    'Que actividades hay para hacer con ninos?',
    'A que hora abre y cierra la Catedral de Tarragona?',
    'Donde compro productos tipicos y artesania local?',
    'Como funciona el puerto de cruceros de Tarragona?',
    'Cuales son las normas de la playa del Miracle?',
  ],
  whyManualHelps: 'Tarragona tiene un patrimonio romano excepcional y playas a distancia a pie del centro historico. Los huespedes preguntan constantemente sobre itinerarios turisticos, horarios de monumentos y como moverse sin coche. Un manual digital bien organizado con mapas, horarios actualizados y recomendaciones de transporte reduce drasticamente estas consultas repetitivas.',

  keywords: [
    'manual digital apartamento turistico tarragona',
    'vivienda turistica tarragona NIRTC',
    'alquiler vacacional tarragona cataluna',
    'airbnb tarragona normativa',
    'gestion huesped tarragona patrimonio romano',
  ],
  metaTitle: 'Manual Digital Apartamento Turistico Tarragona | Itineramio',
  metaDescription: 'Manual digital para vivienda turistica en Tarragona. Normativa catalana NIRTC, patrimonio romano, playas y tasa turistica. Prueba gratis 15 dias.',

  faqs: [
    {
      question: 'Que normativa regula las viviendas turisticas en Tarragona?',
      answer: 'Las viviendas turisticas en Tarragona se regulan por la Llei 13/2002 de turisme de Catalunya y el Decret 75/2020. Es obligatorio obtener el NIRTC (Numero d\'Inscripcio al Registre de Turisme de Catalunya) antes de iniciar la actividad. Tarragona esta tramitando ademas un PEUAT propio que podria limitar nuevas licencias en determinadas zonas.',
    },
    {
      question: 'Hay tasa turistica en Tarragona?',
      answer: 'Si. Tarragona aplica la tasa turistica de la Generalitat de Catalunya, que oscila entre 1 y 4 euros por persona y noche segun la categoria del alojamiento. El anfitrion es responsable de recaudarla e ingresarla a la administracion a traves del sistema TAXCAT.',
    },
    {
      question: 'Cuanto puede ganar un apartamento turistico en Tarragona?',
      answer: 'Segun datos del mercado, la tarifa media diaria en Tarragona es de aproximadamente 100 euros, con una ocupacion media del 50% y un RevPAR de unos 50 euros. Las zonas de la Part Alta y la playa del Miracle tienen la mayor demanda, especialmente en verano y durante la temporada de cruceros.',
    },
    {
      question: 'Es obligatorio registrar a los viajeros en Tarragona?',
      answer: 'Si. En Cataluna los partes de viajeros se comunican a los Mossos d\'Esquadra, a diferencia de otras comunidades donde se usa el sistema SES.Hospedajes de la Guardia Civil. Ademas, desde julio de 2025 existe la obligacion de registro en el sistema estatal de identificacion de viajeros.',
    },
  ],
}

export default function TarragonaPage() {
  return <CityLandingPage data={tarragonaData} />
}
