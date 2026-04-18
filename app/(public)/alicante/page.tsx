import CityLandingPage from '@/components/landing/CityLandingPage'
import type { CityData } from '@/components/landing/CityLandingPage'

const alicanteData: CityData = {
  city: 'Alicante',
  region: 'Comunitat Valenciana',
  heroSubtitle: 'Alicante combina playa urbana y casco historico con una demanda turistica creciente. Crea un manual digital profesional para tus huespedes y reduce las preguntas repetitivas sobre playas, parking y transporte.',

  listings: '~3.500',
  occupancy: '66%',
  adr: '111€',
  revpar: '~73€',

  mainLaw: 'Ley 15/2018, Decreto 10/2021, Decreto-ley 9/2024',
  registrationType: 'Alta telematica + informe de compatibilidad urbanistica',
  keyRequirements: [
    'Licencia de ocupacion o cedula de habitabilidad',
    'Referencia catastral del inmueble',
    'Seguro de responsabilidad civil',
    'Informe de compatibilidad urbanistica municipal',
    'Distintivo visible en el exterior del alojamiento',
    'Registro de viajeros ante la Policia Nacional',
  ],
  penalties: 'Desde 10.000€ (leves) hasta 100.000€ (graves) y 600.000€ (muy graves)',
  touristTax: 'No vigente en la Comunitat Valenciana',

  topZones: [
    { name: 'Centro - Explanada', reason: 'Maxima demanda turistica, proximidad al puerto y paseo de la Explanada. Ideal para estancias cortas y turismo urbano.' },
    { name: 'Casco Antiguo / Santa Cruz', reason: 'Barrio historico con encanto, junto al Castillo de Santa Barbara. Perfil de huesped cultural que busca autenticidad.' },
    { name: 'Ensanche - Diputacion', reason: 'Zona comercial y bien conectada con servicios. Buena relacion calidad-precio para el anfitrion.' },
    { name: 'Playa de San Juan', reason: 'Principal playa urbana de Alicante. Alta demanda en verano, familias y estancias mas largas.' },
    { name: 'Cabo de las Huertas / PAU5', reason: 'Zona residencial tranquila con acceso a calas. Perfil de huesped que busca descanso y naturaleza.' },
  ],

  highSeason: 'Mayo a Septiembre, pico en Julio y Agosto',
  lowSeason: 'Noviembre a Febrero, con repunte en Semana Santa',
  keyEvents: [
    'Hogueras de San Juan (junio)',
    'Semana Santa Alicante',
    'Festival de Musica Electronica',
    'Feria de Navidad y Reyes',
  ],

  guestQuestions: [
    'Cual es la mejor playa cerca del apartamento?',
    'Donde puedo aparcar y cuanto cuesta?',
    'Como llego desde el aeropuerto al alojamiento?',
    'Que restaurantes de arroz recomiendas?',
    'Necesito coche para moverme por Alicante?',
    'Como funciona el tranvia a Playa de San Juan?',
    'Cual es la contrasena del WiFi?',
    'A que hora es el check-in?',
  ],
  whyManualHelps: 'Alicante tiene una divergencia clave entre la zona de playa y el centro urbano. Los huespedes preguntan constantemente sobre como llegar a las playas, el tranvia, el parking y los restaurantes locales. Un manual digital bien organizado por zonas reduce drasticamente estas consultas repetitivas y mejora la experiencia del huesped desde antes de su llegada.',

  keywords: [
    'manual digital apartamento turistico alicante',
    'vivienda turistica alicante',
    'alquiler vacacional alicante normativa',
    'airbnb alicante',
    'gestion huesped alicante',
    'ley 15/2018 vivienda turistica',
    'playa san juan alquiler',
  ],
  metaTitle: 'Manual Digital Apartamento Turistico Alicante | Itineramio',
  metaDescription: 'Manual digital para vivienda turistica en Alicante. Normativa, playas, parking. Prueba gratis 15 dias.',

  faqs: [
    {
      question: 'Que normativa regula las viviendas turisticas en Alicante?',
      answer: 'Las viviendas turisticas en Alicante se regulan por la Ley 15/2018 de turismo de la Comunitat Valenciana, el Decreto 10/2021 y el Decreto-ley 9/2024. Es necesario obtener un informe de compatibilidad urbanistica del ayuntamiento y realizar el alta telematica en el registro autonómico.',
    },
    {
      question: 'Hay tasa turistica en Alicante?',
      answer: 'No. A fecha de 2026, la Comunitat Valenciana no ha implementado una tasa turistica. Esto supone un ahorro para los huespedes respecto a destinos como Barcelona o Baleares.',
    },
    {
      question: 'Cuanto puede ganar un apartamento turistico en Alicante?',
      answer: 'Segun datos del mercado, la tarifa media diaria (ADR) en Alicante es de aproximadamente 111 euros, con una ocupacion media del 66% y un RevPAR de unos 73 euros. Las zonas de playa como San Juan tienen mayor demanda en verano.',
    },
    {
      question: 'Es necesario coche en Alicante para los huespedes?',
      answer: 'Depende de la ubicacion del alojamiento. En el centro y Playa de San Juan, el tranvia conecta bien ambas zonas. Para calas y alrededores como el Cabo de las Huertas, un coche es mas comodo. El manual digital permite explicar esto segun la zona de tu apartamento.',
    },
  ],
}

export default function AlicantePage() {
  return <CityLandingPage data={alicanteData} />
}
