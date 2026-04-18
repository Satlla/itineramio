import CityLandingPage from '@/components/landing/CityLandingPage'
import type { CityData } from '@/components/landing/CityLandingPage'

const valenciaData: CityData = {
  city: 'Valencia',
  region: 'Comunidad Valenciana',
  heroSubtitle: 'Valencia combina playa, cultura y gastronomia con un mercado de alquiler vacacional en crecimiento. Con la nueva regulacion que exige compatibilidad urbanistica, un manual digital profesional es clave para gestionar tus huespedes.',

  listings: '8.340',
  occupancy: '58%',
  adr: '145$',
  revpar: '84$',

  mainLaw: 'Decreto 10/2021 de la Generalitat Valenciana + Ley 7/2024',
  registrationType: 'Declaracion responsable ante Turisme Comunitat Valenciana',
  keyRequirements: [
    'Informe de compatibilidad urbanistica del Ayuntamiento',
    'Declaracion responsable ante el Registro de Turismo',
    'Cedula de habitabilidad o equivalente',
    'Limite de 10 dias minimo por estancia en determinadas zonas (segun normativa local)',
    'Registro de viajeros ante la Policia Nacional',
    'Placa identificativa exterior con numero de registro',
    'Seguro de responsabilidad civil',
  ],
  penalties: 'Hasta 600.000 euros para infracciones muy graves. Multas frecuentes de 30.000-60.000 euros por operar sin registro',
  touristTax: '2,00 euros/persona/noche (tasa turistica valenciana, desde 2024)',

  topZones: [
    { name: 'Ciutat Vella', reason: 'Centro historico con la Catedral y la Lonja. Maxima demanda turistica todo el ano.' },
    { name: 'Ruzafa', reason: 'Barrio de moda, gastronomia y vida nocturna. Perfil de huesped joven y creativo. ADR creciente.' },
    { name: 'Cabanyal / Malvarrosa', reason: 'Barrio de playa con autenticidad local. Muy demandado en verano, America\'s Cup ha impulsado la zona.' },
    { name: 'Eixample', reason: 'Zona amplia y bien conectada. Ideal para familias. Buena relacion calidad-precio.' },
    { name: 'Poblats Maritims', reason: 'Proximidad a la playa y la Marina. Crecimiento por eventos deportivos y culturales.' },
  ],

  highSeason: 'Marzo a Junio (Fallas, Semana Santa, primavera) y Septiembre a Octubre',
  lowSeason: 'Noviembre a Febrero (excepto puentes)',
  keyEvents: [
    'Las Fallas (marzo)',
    'Semana Santa Marinera',
    'America\'s Cup (segun edicion)',
    'Gran Prix de MotoGP en Cheste',
    'Noche de San Juan (junio)',
  ],

  guestQuestions: [
    'Como llego desde el aeropuerto de Manises al apartamento?',
    'Cual es la contrasena del WiFi?',
    'Donde esta la playa mas cercana?',
    'Como funciona el metro y la EMT?',
    'Donde puedo aparcar cerca?',
    'Que restaurantes de paella autentica recomiendas?',
    'Como funciona el aire acondicionado?',
    'Hay supermercado cerca?',
  ],
  whyManualHelps: 'Valencia atrae turistas por su gastronomia (paella, horchata), playas y eventos como Fallas. Los huespedes necesitan orientacion sobre transporte desde Manises, zonas de playa y recomendaciones gastronomicas. Un manual digital resuelve estas dudas antes de que te llamen.',

  keywords: [
    'manual digital vivienda turistica valencia',
    'alquiler vacacional valencia',
    'VT valencia registro',
    'compatibilidad urbanistica valencia',
    'airbnb valencia normativa',
  ],
  metaTitle: 'Manual Digital Vivienda Turistica Valencia | Itineramio',
  metaDescription: 'Manual digital para vivienda turistica en Valencia. Compatibilidad urbanistica, limite 10 dias, normativa 2026. Prueba gratis.',

  faqs: [
    {
      question: 'Que es el informe de compatibilidad urbanistica en Valencia?',
      answer: 'Es un informe que emite el Ayuntamiento de Valencia confirmando que tu vivienda se encuentra en una zona donde se permite el uso turistico segun el plan urbanistico vigente. Es requisito previo a la declaracion responsable y puede tardar varias semanas en obtenerse.',
    },
    {
      question: 'Hay limite de dias de alquiler turistico en Valencia?',
      answer: 'La normativa de la Comunidad Valenciana contempla restricciones segun la zonificacion. En algunas zonas saturadas, el Ayuntamiento puede establecer un minimo de 10 dias por estancia o limitar el numero de licencias. Consulta la normativa local actualizada.',
    },
    {
      question: 'Cuanto cuesta la tasa turistica en Valencia?',
      answer: 'Desde 2024, la Comunidad Valenciana aplica una tasa turistica de aproximadamente 2 euros por persona y noche. Es obligatorio cobrarla al huesped e ingresarla ante la Generalitat Valenciana.',
    },
    {
      question: 'Como ayuda un manual digital durante las Fallas?',
      answer: 'Durante Fallas, Valencia recibe un flujo masivo de turistas con muchas dudas sobre ruidos, cortes de trafico, horarios de mascletas y recomendaciones. Un manual digital actualizado con esta informacion reduce llamadas y mejora la experiencia del huesped en las fechas de mayor ocupacion.',
    },
  ],
}

export default function ValenciaPage() {
  return <CityLandingPage data={valenciaData} />
}
