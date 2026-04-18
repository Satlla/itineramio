import CityLandingPage from '@/components/landing/CityLandingPage'
import type { CityData } from '@/components/landing/CityLandingPage'

const cadizData: CityData = {
  city: 'Cadiz',
  region: 'Andalucia',
  heroSubtitle: 'Cadiz ha restringido fuertemente el alquiler vacacional: suspension provisional de nuevas licencias desde marzo 2025 y prohibicion de VUT en casco historico desde 2022. Con casi 1.900 listings y una ocupacion del 58%, es un mercado potente pero regulado. Si ya operas legalmente, un manual digital protege tus resenas y reduce incidencias en un casco historico con calles estrechas.',
  listings: '1.855', occupancy: '58%', adr: '135€', revpar: '77€',
  mainLaw: 'Registro Turismo Andalucia (RTA) + suspension municipal marzo 2025',
  registrationType: 'Registro en RTA + licencia municipal (suspendida para nuevos VUT desde marzo 2025)',
  keyRequirements: ['Registro obligatorio en el Registro de Turismo de Andalucia (RTA)', 'Suspension provisional de nuevas licencias VUT en toda la ciudad (marzo 2025)', 'Desde 2022 prohibido VUT en casco historico y extramuros (excepto bajos y primeras plantas)', 'Sanciones de hasta 10.000 EUR a pisos irregulares', 'Registro estatal de alquiler de corta duracion desde julio de 2025', 'Registro de viajeros mediante SES.Hospedajes'],
  penalties: 'Hasta 10.000 EUR para pisos irregulares. Suspension provisional de nuevas licencias VUT en toda la ciudad desde marzo 2025',
  touristTax: null,
  topZones: [
    { name: 'Casco Historico', reason: 'Catedral, Torre Tavira, calles peatonales. Muy demandado para turismo cultural. Parejas y grupos pequenos. Restricciones severas para nuevos VUT.' },
    { name: 'La Vina / El Mentidero', reason: 'Barrio de tapas y Carnaval. Familias y turistas espanoles. Clima tranquilo por la noche. Licencias antiguas relativamente accesibles.' },
    { name: 'Puertas de Tierra / La Caleta', reason: 'Apartamentos junto a playa centrica. Muy demandado en verano. Ideal para familias. Licencias de promociones de los 80-90.' },
    { name: 'Playa de la Victoria', reason: 'Principal playa urbana. Residencias modernas a pie de playa. Surf y sol. Gran demanda veraniega.' },
    { name: 'Extramuros Sur (Cortadura)', reason: 'Barrios residenciales tranquilos. Playa extensa. Nomadas digitales y familias que buscan precio/calidad. Licencias mas asequibles.' },
  ],
  highSeason: 'Julio a Septiembre',
  lowSeason: 'Noviembre a Febrero',
  keyEvents: ['Carnaval de Cadiz (febrero-marzo)', 'Semana Santa (marzo-abril)', 'Festival de Musica y Flamenco (julio-agosto)', 'Regatas de vela latina (verano)', 'Mercado navideno casco antiguo (diciembre)'],
  guestQuestions: ['Donde aparcar (zona azul/parkings)?', 'Como llegar a la playa y puertos?', 'Hay mercado o supermercados cerca?', 'Transporte publico (bus y tren)?', 'Normas del edificio (ruido, horarios)?', 'Donde comer buen pescado?', 'Horarios de playas (salvavidas)?', 'Como llegar desde el aeropuerto de Jerez?'],
  whyManualHelps: 'Cadiz tiene patrimonio rico y muchos turistas espanoles que valoran recomendaciones locales (tabernas, musica, chiringuitos). Un manual digital evita saturar al anfitrion con preguntas repetitivas sobre parking en calles estrechas, restaurantes y festivos municipales. Incluir traducciones para visitantes britanicos y directrices sobre recogida de basura mejora la experiencia.',
  keywords: ['manual digital apartamento turistico cadiz', 'suspension licencias turisticas cadiz', 'alquiler vacacional cadiz', 'airbnb cadiz', 'gestion huesped cadiz'],
  metaTitle: 'Manual Digital Apartamento Turistico Cadiz | Itineramio',
  metaDescription: 'Crea tu manual digital para huespedes en Cadiz. Normativa, suspension de licencias, zonas y gestion de vivienda turistica.',
  faqs: [
    { question: 'Se pueden obtener nuevas licencias VUT en Cadiz?', answer: 'Actualmente no. En marzo 2025 se anuncio la suspension provisional de nuevas licencias VUT en toda la ciudad y la reforma del PGOU para limitar definitivamente este uso. Desde 2022 ya se prohibieron en casco historico y extramuros.' },
    { question: 'Hay tasa turistica en Cadiz?', answer: 'No. Andalucia no ha implementado tasa turistica, lo que supone una ventaja frente a destinos como Barcelona o Baleares.' },
    { question: 'Cuando es el Carnaval de Cadiz?', answer: 'Entre febrero y marzo. Es el carnaval mas famoso de Espana y llena la ciudad de visitantes. La demanda de alojamiento se dispara durante esas semanas.' },
    { question: 'Como ayuda un manual digital en Cadiz?', answer: 'Cadiz tiene calles estrechas, parkings escasos y turistas que buscan recomendaciones locales autenticas. Un manual digital con mapas de parking, restaurantes de barrio y normas de convivencia reduce llamadas y mejora resenas.' },
  ],
}

export default function CadizPage() {
  return <CityLandingPage data={cadizData} />
}
