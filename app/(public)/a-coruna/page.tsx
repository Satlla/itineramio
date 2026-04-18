import CityLandingPage from '@/components/landing/CityLandingPage'
import type { CityData } from '@/components/landing/CityLandingPage'

const aCorunaData: CityData = {
  city: 'A Coruna',
  region: 'Galicia',
  heroSubtitle: 'A Coruna combina ciudad historica, playa urbana y gastronomia de referencia. Con el Decreto 11/2023 de Galicia y la ordenanza municipal de 2020, la declaracion responsable es obligatoria y hay investigacion activa de irregulares. Un manual digital profesional facilita el check-in automatico y mejora la experiencia del huesped internacional.',

  listings: '700',
  occupancy: '50%',
  adr: '110€',
  revpar: '55€',

  mainLaw: 'Decreto 11/2023 Galicia - regulacion de apartamentos turisticos',
  registrationType: 'Declaracion responsable ante la Xunta de Galicia',
  keyRequirements: [
    'Presentar declaracion responsable ante la Xunta de Galicia segun Decreto 11/2023',
    'Cumplir la ordenanza municipal de A Coruna de 2020 (zonificacion por distritos)',
    'Numerosos apartamentos irregulares bajo investigacion de la Policia Local',
    'Comunicacion de datos de viajeros mediante SES.Hospedajes (muy recomendado)',
    'Inscripcion en el Registro Estatal de Alquiler Turistico (obligatorio desde julio 2025)',
    'No existe tasa turistica en A Coruna ni en Galicia',
  ],
  penalties: 'Investigacion activa de apartamentos irregulares por parte de la Policia Local. Sanciones por operar sin declaracion responsable o incumplir la zonificacion municipal.',
  touristTax: null,

  topZones: [
    { name: 'Ciudad Vieja / Plaza de Maria Pita', reason: 'Zona historica y de negocios. Alta demanda de turismo cultural y viajeros de empresa. ADR por encima de la media.' },
    { name: 'Riazor - Cristal', reason: 'Playa urbana y surf. Muy popular entre turistas jovenes y familias. Alta rotacion en verano.' },
    { name: 'Ensanche / Matogrande', reason: 'Barrio residencial moderno. Ideal para estancias largas y teletrabajadores. Buena relacion precio-ocupacion.' },
    { name: 'Monte San Pedro', reason: 'Zona de lujo con miradores excepcionales. ADR elevado y demanda de turismo premium nacional e internacional.' },
    { name: 'Oleiros / Costa Artabra', reason: 'Playas y chalés en municipio limítrofe. Popular entre familias y turismo de naturaleza.' },
  ],

  highSeason: 'Julio y Agosto',
  lowSeason: 'Diciembre a Enero',
  keyEvents: [
    'Noche de San Juan en la playa de Riazor (23 de junio)',
    'Fiestas de Maria Pita (15-19 de agosto)',
    'Rally de las Rias Baixas (agosto)',
    'Semana Santa en A Coruna',
    'Festival Noroeste Estrella Galicia (julio)',
  ],

  guestQuestions: [
    'Donde comprar percebes y mariscos frescos?',
    'Cuales son los horarios del Mercado de Abastos?',
    'Que museos no hay que perderse (Domus, Torre de Hercules)?',
    'Hay piscinas climatizadas para ninos?',
    'Donde aparcar gratis o barato en A Coruna?',
    'Donde hacer surf o windsurf?',
    'Como funciona el servicio de biciCoruna?',
    'Como llegar al centro desde el aeropuerto de Santiago?',
  ],
  whyManualHelps: 'A Coruna mezcla turismo de playa y ciudad historica con visitantes portugueses y britanicos. Un manual digital multilingue con rutas peatonales, horarios de museos, transporte urbano (tren FEVE), claves WiFi y guia de check-in automatico aumenta las valoraciones y reduce llamadas al host en un mercado con alta investigacion de irregulares.',

  keywords: [
    'manual digital apartamento turistico a coruna',
    'VUT a coruna galicia normativa',
    'Decreto 11/2023 galicia alquiler vacacional',
    'declaracion responsable xunta 2026',
    'airbnb a coruna regulacion',
  ],
  metaTitle: 'Manual Digital Apartamento Turistico A Coruna | Itineramio',
  metaDescription: 'Manual digital para VUT en A Coruna. Decreto 11/2023 Galicia, declaracion responsable, sin tasa turistica. Gestiona huespedes y cumple la normativa.',

  faqs: [
    {
      question: 'Necesito registro para alquilar mi apartamento en A Coruna en 2026?',
      answer: 'Si. El Decreto 11/2023 de Galicia obliga a presentar una declaracion responsable ante la Xunta antes de iniciar la actividad. Ademas, la ordenanza municipal de 2020 establece zonificacion especifica. La Policia Local de A Coruna investiga activamente apartamentos irregulares, por lo que operar sin declaracion responsable conlleva riesgo real de sancion.',
    },
    {
      question: 'Hay tasa turistica en A Coruna o Galicia?',
      answer: 'No. Galicia no tiene tasa turistica ni impuesto de pernoctacion. A Coruna tampoco aplica tasa municipal. Es una ventaja competitiva frente a mercados como Barcelona o Ibiza. Si es obligatorio comunicar los datos de viajeros a traves de SES.Hospedajes y al Registro Estatal desde julio 2025.',
    },
    {
      question: 'Que implica la zonificacion municipal de A Coruna para las VUT?',
      answer: 'La ordenanza municipal de 2020 de A Coruna divide la ciudad en zonas con diferente capacidad para alojamientos turisticos. Algunas zonas del centro historico tienen restricciones de densidad. Antes de iniciar la actividad conviene verificar que la zona y el tipo de inmueble son compatibles con el uso turistico segun la normativa vigente.',
    },
    {
      question: 'Como ayuda Itineramio con la normativa de Galicia?',
      answer: 'Itineramio te permite mostrar tu numero de declaracion responsable, incluir instrucciones de check-in automatico, rutas pedestres, horarios de transporte urbano (FEVE, biciCoruna) y guias en varios idiomas para visitantes portugueses y britanicos. El huesped recibe toda la informacion antes de llegar, reduciendo consultas y mejorando tus valoraciones en plataformas.',
    },
  ],
}

export default function ACorunaPage() {
  return <CityLandingPage data={aCorunaData} />
}
