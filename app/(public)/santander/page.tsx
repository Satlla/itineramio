import CityLandingPage from '@/components/landing/CityLandingPage'
import type { CityData } from '@/components/landing/CityLandingPage'

const santanderData: CityData = {
  city: 'Santander',
  region: 'Cantabria',
  heroSubtitle: 'Santander combina ciudad historica, playas de surf y acceso a los Picos de Europa. Con la Ley 16/2014 de Cantabria y los planes de inspeccion municipales desde 2023, operar con registro actualizado es imprescindible. Un manual digital profesional mejora la experiencia del huesped y protege tu actividad.',

  listings: '800',
  occupancy: '53%',
  adr: '110€',
  revpar: '60€',

  mainLaw: 'Ley 16/2014 Cantabria - Registro de alojamientos turisticos',
  registrationType: 'Registro ante la Direccion General de Turismo de Cantabria',
  keyRequirements: [
    'Registro obligatorio ante la Direccion General de Turismo de Cantabria segun Ley 16/2014',
    'Licencias obligatorias para VUT desde 2023, con planes de inspeccion activos',
    'Multas a apartamentos ilegales en vigor desde 2023',
    'Comunicacion de datos de viajeros a traves de SES.Hospedajes',
    'Inscripcion en el Registro Estatal de Alquiler Turistico (obligatorio desde julio 2025)',
    'No existe moratoria ni cupo de plazas en Cantabria',
    'No hay tasa turistica en Cantabria',
  ],
  penalties: 'Multas a VUT ilegales. Planes de inspeccion municipal activos desde 2023. Sanciones por operar sin registro o sin licencia en vigor.',
  touristTax: null,

  topZones: [
    { name: 'Centro historico / Paseo Pereda', reason: 'Zona de la bahia y la Catedral. Alta demanda de turismo cultural y de negocios. ADR por encima de la media.' },
    { name: 'Puertochico / playas urbanas', reason: 'Muy popular entre surfistas y amantes de la vela. Estancias activas con alta rotacion.' },
    { name: 'Peniacastillo / Fuentes', reason: 'Zona tranquila y economica, ideal para familias. Buena relacion precio-ocupacion.' },
    { name: 'El Sardinero / La Magdalena', reason: 'Playa premium de Santander. Demanda familiar alta en verano. Uno de los ADR mas elevados de la ciudad.' },
    { name: 'Valdenoja / Pinares', reason: 'Barrio residencial y verde. Preferido para estancias largas de teletrabajadores y turismo slow.' },
  ],

  highSeason: 'Junio a Septiembre',
  lowSeason: 'Noviembre a Febrero',
  keyEvents: [
    'Semana Grande de Santander (agosto)',
    'Festival Internacional de Musica de Santander (julio)',
    'Festival de Jazz de Santander (octubre)',
    'Expoarte (septiembre)',
    'Regatas de vela en la bahia (verano)',
  ],

  guestQuestions: [
    'Como funciona la Santander Card para el transporte publico?',
    'Cuales son los horarios de comida locales?',
    'Donde estan los mejores restaurantes de mariscos y anchoas?',
    'Que planes hay para ninos en Santander?',
    'Cuales son las playas mas accesibles para personas con movilidad reducida?',
    'Como comprar entradas para festivales y eventos?',
    'Donde estan los mejores miradores con vistas a los Picos de Europa?',
    'Como llegar a playas cercanas como Laredo o Suances?',
  ],
  whyManualHelps: 'Santander recibe principalmente turismo espanol de regiones cercanas que valora los detalles locales. Un manual digital con rutas de costa, maridajes de vinos de Cantabria, informacion del tiempo, normativa de playas protegidas, horarios de bus y datos del biciSantander ahorra tiempo al host y mejora la valoracion del huesped.',

  keywords: [
    'manual digital apartamento turistico santander',
    'VUT santander cantabria normativa',
    'Ley 16/2014 cantabria alquiler vacacional',
    'licencia turistica santander 2026',
    'airbnb santander regulacion',
  ],
  metaTitle: 'Manual Digital Apartamento Turistico Santander | Itineramio',
  metaDescription: 'Manual digital para VUT en Santander. Ley 16/2014 Cantabria, licencias obligatorias, sin tasa turistica. Gestiona tus huespedes con profesionalidad.',

  faqs: [
    {
      question: 'Necesito registro para alquilar mi apartamento en Santander en 2026?',
      answer: 'Si. La Ley 16/2014 de Cantabria obliga a registrar todo alojamiento turistico ante la Direccion General de Turismo de la comunidad. Desde 2023 hay planes de inspeccion activos y multas a apartamentos que operan sin licencia. El registro es previo al inicio de la actividad y debe exhibirse en todos los anuncios.',
    },
    {
      question: 'Hay tasa turistica en Santander o Cantabria?',
      answer: 'No. Cantabria no tiene tasa turistica ni impuesto de pernoctacion. Tampoco existe en el municipio de Santander. Es una ventaja competitiva respecto a otras comunidades como Cataluna o Baleares. No obstante, si es obligatorio comunicar los datos de viajeros a SES.Hospedajes.',
    },
    {
      question: 'Que pasa si alquilo mi apartamento sin registro en Santander?',
      answer: 'Desde 2023, la Administracion de Cantabria y el Ayuntamiento de Santander han intensificado las inspecciones. Operar sin registro puede suponer multas que van desde cientos hasta miles de euros segun la gravedad de la infraccion. Plataformas como Airbnb colaboran con las autoridades compartiendo datos de anuncios sin numero de registro.',
    },
    {
      question: 'Como ayuda Itineramio con la normativa de Cantabria?',
      answer: 'Itineramio te permite mostrar tu numero de registro de Cantabria en el manual digital, incluir normas de convivencia, informacion de transporte local (Santander Card, biciSantander), rutas de costa y acceso a playas protegidas. El huesped recibe toda la informacion antes de su llegada, reduciendo consultas y mejorando las valoraciones.',
    },
  ],
}

export default function SantanderPage() {
  return <CityLandingPage data={santanderData} />
}
