import CityLandingPage from '@/components/landing/CityLandingPage'
import type { CityData } from '@/components/landing/CityLandingPage'

const madridData: CityData = {
  city: 'Madrid',
  region: 'Comunidad de Madrid',
  heroSubtitle: 'Madrid es el mayor mercado de alquiler vacacional de Espana, con casi 16.000 listings activos. Crea un manual digital profesional para tus huespedes y reduce llamadas, incidencias y malas resenas.',

  listings: '15.872',
  occupancy: '53%',
  adr: '175$',
  revpar: '96$',

  mainLaw: 'Decreto 79/2014 de la Comunidad de Madrid',
  registrationType: 'Declaracion responsable ante la Comunidad de Madrid',
  keyRequirements: [
    'Presentar declaracion responsable en el Registro de Empresas Turisticas',
    'Disponer de cedula de habitabilidad o licencia de primera ocupacion',
    'Exhibir placa identificativa exterior normalizada',
    'Facilitar hojas de reclamaciones a los huespedes',
    'Informar a la comunidad de propietarios sobre la actividad',
    'Registrar viajeros ante la Policia Nacional (parte de viajeros)',
  ],
  penalties: 'Hasta 600.000 euros para infracciones muy graves',
  touristTax: null,

  topZones: [
    { name: 'Sol / Gran Via', reason: 'Maxima demanda turistica, ocupacion superior al 70%. Ideal para estancias cortas de 2-3 noches.' },
    { name: 'Malasana / Chueca', reason: 'Barrios de moda con alta tarifa media. Perfil de huesped joven y cosmopolita que valora lo local.' },
    { name: 'Salamanca', reason: 'Segmento premium con ADR elevado. Huespedes de negocios y compras de lujo.' },
    { name: 'La Latina / Lavapies', reason: 'Ambiente castizo y gastronomico. Buena relacion calidad-precio para el anfitrion.' },
    { name: 'Retiro / Atocha', reason: 'Proximidad al parque y estaciones AVE. Familias y viajeros de tren.' },
  ],

  highSeason: 'Marzo a Mayo y Septiembre a Octubre',
  lowSeason: 'Julio y Agosto (calor extremo reduce turismo de ocio)',
  keyEvents: [
    'San Isidro (mayo)',
    'Navidad y Cabalgata de Reyes',
    'Orgullo LGTBI (julio)',
    'Semana del Arte / ARCO (febrero)',
    'Champions League y partidos en el Bernabeu',
  ],

  guestQuestions: [
    'Como llego desde el aeropuerto Barajas al apartamento?',
    'Cual es la contrasena del WiFi?',
    'Donde puedo aparcar cerca?',
    'A que hora es el check-in y check-out?',
    'Donde puedo dejar las maletas antes del check-in?',
    'Que restaurantes recomiendas cerca?',
    'Como funciona el aire acondicionado / calefaccion?',
    'Donde esta el supermercado mas cercano?',
  ],
  whyManualHelps: 'Madrid recibe millones de turistas internacionales que llegan desde Barajas sin conocer la ciudad. Un manual digital con instrucciones de llegada, transporte, WiFi y recomendaciones reduce drasticamente las llamadas y mensajes repetitivos, especialmente durante el check-in.',

  keywords: [
    'manual digital apartamento turistico madrid',
    'vivienda turistica madrid',
    'alquiler vacacional madrid normativa',
    'airbnb madrid',
    'gestion huesped madrid',
  ],
  metaTitle: 'Manual Digital Apartamento Turistico Madrid | Itineramio',
  metaDescription: 'Crea tu manual digital para huespedes en Madrid. Normativa, requisitos y gestion de vivienda turistica. Prueba gratis 15 dias.',

  faqs: [
    {
      question: 'Necesito licencia para alquilar mi piso turistico en Madrid?',
      answer: 'Si, necesitas presentar una declaracion responsable ante el Registro de Empresas Turisticas de la Comunidad de Madrid (Decreto 79/2014). Debes disponer de cedula de habitabilidad y cumplir los requisitos de equipamiento minimo. Operar sin registro puede conllevar multas de hasta 600.000 euros.',
    },
    {
      question: 'Hay tasa turistica en Madrid?',
      answer: 'A fecha de 2026, la Comunidad de Madrid no ha implementado una tasa turistica, a diferencia de Cataluna o Baleares. Esto supone una ventaja competitiva frente a otros destinos espanoles.',
    },
    {
      question: 'Cuanto puede ganar un apartamento turistico en Madrid?',
      answer: 'Segun datos de mercado, la tarifa media diaria (ADR) en Madrid ronda los 175 dolares, con una ocupacion media del 53%. Esto puede variar segun la zona: Sol y Gran Via superan el 70% de ocupacion, mientras que barrios perifericos tienen menor demanda.',
    },
    {
      question: 'Como ayuda un manual digital con la normativa de Madrid?',
      answer: 'El manual digital de Itineramio te permite incluir las normas de convivencia, horarios de silencio y procedimientos de reciclaje que exige la normativa. Ademas, facilita el registro de viajeros al centralizar la informacion de check-in en un solo lugar.',
    },
  ],
}

export default function MadridPage() {
  return <CityLandingPage data={madridData} />
}
