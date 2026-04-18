import CityLandingPage from '@/components/landing/CityLandingPage'
import type { CityData } from '@/components/landing/CityLandingPage'

const ibizaData: CityData = {
  city: 'Ibiza',
  region: 'Islas Baleares',
  heroSubtitle: 'Ibiza tiene una de las regulaciones mas restrictivas de Espana: moratoria de licencias VUT, prohibicion en plurifamiliares y ecotasa. Con solo 686 listings activos pero un ADR de 390 EUR, el producto legal bien operado tiene alto poder de pricing. Si ya operas legalmente, un manual digital maximiza la experiencia y protege tus resenas.',
  listings: '686', occupancy: '50%', adr: '390€', revpar: '178€',
  mainLaw: 'Ley 8/2012 Baleares + moratoria insular de licencias VUT',
  registrationType: 'Habilitacion turistica insular - sistema de plazas turisticas',
  keyRequirements: ['Moratoria insular de licencias VUT vigente', 'Solo se permiten VUT en casas unifamiliares rurales', 'Licencia VUT inactiva 3 anos caduca automaticamente', 'Multas de hasta 400.000 EUR por incumplimiento', 'Ibiza ciudad prohibe nuevos VUT en casco historico y extramuros', 'Ecotasa balear obligatoria (2-4 EUR/persona/noche)'],
  penalties: 'Hasta 400.000 EUR. Moratoria impide nuevas licencias en edificios plurifamiliares. Solo unifamiliares rurales',
  touristTax: 'Ecotasa balear: 2 EUR por persona y noche para viviendas turisticas (2-4 EUR segun categoria)',
  topZones: [
    { name: 'Dalt Vila', reason: 'Casco historico fortificado (UNESCO). Muy demandado por turistas de alto poder adquisitivo. Parejas y familias internacionales. Oferta legal muy limitada.' },
    { name: 'Playa d en Bossa', reason: 'Mayor densidad de clubs (Ushuaia, Hi). Turistas jovenes de 20-35 anos, grupos de amigos. Demanda altisima en verano.' },
    { name: 'Sant Antoni de Portmany', reason: 'Puestas de sol, Sunset Strip, ambiente hippie chic. Parejas jovenes y familias. Buena demanda estival.' },
    { name: 'Santa Eulalia / Es Canar', reason: 'Entorno tranquilo y familiar. Turistas nordicos y espanoles de clase media-alta. Chiringuitos y ambiente relajado.' },
    { name: 'Sant Josep - Costa Oeste', reason: 'Bonitas calas (Tarida, Comte). Familias y parejas con coche. Licencias solo en villas independientes.' },
  ],
  highSeason: 'Mayo a Septiembre (pico julio-agosto)',
  lowSeason: 'Noviembre a Marzo',
  keyEvents: ['Feria Medieval Dalt Vila (mayo)', 'Flower Power Pacha (abril)', 'Virgen del Carmen (16 julio)', 'Closing parties clubs (septiembre)', 'Ibiza Marathon (diciembre)'],
  guestQuestions: ['Como llego a Formentera?', 'Donde puedo aparcar?', 'Horarios de tiendas y restaurantes?', 'Consejos para el calor y el sol?', 'Restaurantes locales y horarios espanoles?', 'Check-in tardio (vuelos nocturnos)?', 'Normas de basura y reciclaje?', 'Tours de fiestas y seguridad?'],
  whyManualHelps: 'El 75% de visitantes de Ibiza son extranjeros con necesidades muy variadas (charters de barco, clubs, tarifas de autobus, uso de electricidad/agua). Huespedes que llegan a la 1 a.m. despues de una fiesta necesitan check-in autonomo. Un manual digital en su idioma agiliza la entrada y comunica normativas locales especificas.',
  keywords: ['manual digital apartamento turistico ibiza', 'moratoria viviendas turisticas ibiza', 'normativa alquiler ibiza 2026', 'airbnb ibiza', 'gestion huesped ibiza'],
  metaTitle: 'Manual Digital Apartamento Turistico Ibiza | Itineramio',
  metaDescription: 'Crea tu manual digital para huespedes en Ibiza. Moratoria, ecotasa, normativa y gestion de vivienda turistica.',
  faqs: [
    { question: 'Puedo abrir una nueva vivienda turistica en Ibiza?', answer: 'Es muy dificil. Hay moratoria insular vigente que prohibe nuevas VUT en edificios plurifamiliares. Solo se permiten en casas unifamiliares rurales. Ibiza ciudad prohibe nuevos VUT en todo el casco historico y extramuros.' },
    { question: 'Cuanto es la ecotasa en Ibiza?', answer: 'La ecotasa balear es de 2 EUR por persona y noche para viviendas turisticas, pudiendo llegar a 4 EUR segun la categoria del alojamiento. El propietario la recauda y la ingresa.' },
    { question: 'Que pasa si mi licencia esta inactiva?', answer: 'Si una licencia VUT lleva inactiva 3 anos, caduca automaticamente. Las multas por operar sin licencia pueden alcanzar los 400.000 EUR.' },
    { question: 'Por que necesito un manual digital en Ibiza?', answer: 'El 75% de los visitantes son extranjeros. Las llegadas tardias son frecuentes. Un manual digital con check-in autonomo, informacion en su idioma y normativas locales (reciclaje, ruido, convivencia) es casi imprescindible para operar profesionalmente.' },
  ],
}

export default function IbizaPage() {
  return <CityLandingPage data={ibizaData} />
}
