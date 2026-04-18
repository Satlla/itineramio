import CityLandingPage from '@/components/landing/CityLandingPage'
import type { CityData } from '@/components/landing/CityLandingPage'

const lasPalmasData: CityData = {
  city: 'Las Palmas de Gran Canaria',
  region: 'Canarias',
  heroSubtitle: 'Las Palmas es un destino de invierno europeo con alta demanda de teletrabajadores y nomadas digitales. Crea un manual digital que resuelva las dudas practicas de estancias medias y largas.',

  listings: '4.240',
  occupancy: '61%',
  adr: '116,9$',
  revpar: '68,1$',

  mainLaw: 'Decreto 113/2015, Ley 6/2025 de ordenacion del turismo de Canarias',
  registrationType: 'Declaracion responsable + inscripcion en el Registro General Turistico de Canarias',
  keyRequirements: [
    'Presentar declaracion responsable de inicio de actividad',
    'Inscripcion en el Registro General Turistico de Canarias',
    'Cedula de habitabilidad o licencia de primera ocupacion',
    'Seguro de responsabilidad civil',
    'Placa identificativa exterior',
    'Registro de viajeros ante la Policia Nacional',
    'Cumplir requisitos de equipamiento minimo',
  ],
  penalties: 'Hasta 600.000€ por infracciones muy graves segun Ley 6/2025',
  touristTax: 'No vigente en Canarias (en debate parlamentario)',

  topZones: [
    { name: 'Las Canteras', reason: 'Playa urbana de referencia, la zona con mayor demanda turistica. Ideal para estancias cortas y teletrabajo con vistas al mar.' },
    { name: 'Mesa y Lopez / Santa Catalina', reason: 'Zona comercial y de ocio. Buena conectividad, cerca del puerto y la playa. Perfil variado de huespedes.' },
    { name: 'Triana', reason: 'Barrio comercial historico con arquitectura modernista. Ambiente local y gastronomico. Creciente demanda.' },
    { name: 'Vegueta', reason: 'Casco historico colonial, Patrimonio de la Humanidad. Perfil cultural, estancias cortas y turismo de calidad.' },
    { name: 'Alcaravaneras', reason: 'Zona residencial junto a la playa de Alcaravaneras. Tranquila, con servicios. Ideal para estancias largas y teletrabajo.' },
  ],

  highSeason: 'Octubre a Marzo (temporada inversa al Mediterraneo: invierno europeo)',
  lowSeason: 'Junio a Septiembre (los europeos prefieren playas continentales)',
  keyEvents: [
    'Carnaval de Las Palmas (febrero-marzo)',
    'Festival Internacional de Cine',
    'Festival de Musica de Canarias (enero-febrero)',
    'Fiestas de San Juan (junio)',
    'WOMAD Las Palmas (noviembre)',
  ],

  guestQuestions: [
    'La playa de Las Canteras es segura para banarse?',
    'Hay buena conexion WiFi para teletrabajar?',
    'Donde esta el supermercado mas cercano?',
    'Donde puedo aparcar cerca del alojamiento?',
    'Que excursiones puedo hacer desde Las Palmas?',
    'Como funciona el transporte publico?',
    'Donde hay cafeterias con buena conexion para trabajar?',
    'Necesito coche en Las Palmas?',
  ],
  whyManualHelps: 'Las Palmas tiene un perfil unico: muchos huespedes son teletrabajadores o nomadas digitales con estancias medias y largas. Necesitan informacion practica de barrio (supermercados, coworkings, lavanderia, gimnasios) mas que atracciones turisticas. Un manual digital organizado por zonas resuelve estas consultas antes de que el huesped las haga, reduciendo mensajes y mejorando la experiencia.',

  keywords: [
    'manual digital vivienda vacacional las palmas',
    'vivienda vacacional las palmas gran canaria',
    'alquiler vacacional canarias normativa',
    'ley 6/2025 canarias turismo',
    'airbnb las palmas',
    'teletrabajo las palmas',
    'nomadas digitales canarias',
  ],
  metaTitle: 'Manual Digital Vivienda Vacacional Las Palmas | Itineramio',
  metaDescription: 'Manual digital para vivienda vacacional en Las Palmas. Ley 6/2025, declaracion responsable. Prueba gratis.',

  faqs: [
    {
      question: 'Que normativa regula las viviendas vacacionales en Las Palmas?',
      answer: 'Las viviendas vacacionales en Las Palmas se regulan por el Decreto 113/2015 y la nueva Ley 6/2025 de ordenacion del turismo de Canarias. Se requiere presentar una declaracion responsable e inscribirse en el Registro General Turistico de Canarias antes de iniciar la actividad.',
    },
    {
      question: 'Hay tasa turistica en Canarias?',
      answer: 'A fecha de 2026, Canarias no tiene implementada una tasa turistica, aunque esta en debate parlamentario. Esto supone una ventaja competitiva frente a Baleares o Cataluna.',
    },
    {
      question: 'Cual es la mejor temporada para alquilar en Las Palmas?',
      answer: 'La temporada alta en Las Palmas es de octubre a marzo, inversa al Mediterraneo. Los turistas europeos buscan el clima templado de invierno canario (18-24 grados). El verano es temporada baja porque los europeos prefieren playas continentales.',
    },
    {
      question: 'Es Las Palmas buen destino para nomadas digitales?',
      answer: 'Si, Las Palmas es uno de los destinos preferidos de nomadas digitales en Europa. La fibra optica esta muy extendida, hay numerosos coworkings, la zona horaria es compatible con Europa, y el coste de vida es razonable. Un manual digital puede incluir informacion sobre coworkings, cafeterias con WiFi y servicios practicos.',
    },
  ],
}

export default function LasPalmasPage() {
  return <CityLandingPage data={lasPalmasData} />
}
