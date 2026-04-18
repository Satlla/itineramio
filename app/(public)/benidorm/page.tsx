import CityLandingPage from '@/components/landing/CityLandingPage'
import type { CityData } from '@/components/landing/CityLandingPage'

const benidormData: CityData = {
  city: 'Benidorm',
  region: 'Comunitat Valenciana - Costa Blanca',
  heroSubtitle: 'Benidorm es un destino maduro con mas de 3.800 listings activos y 16 millones de pernoctaciones anuales. Un mercado muy profesionalizado donde el 67% de las estancias son internacionales. Crea un manual digital para tus huespedes y diferencia tu apartamento en un destino dominado por grandes hoteles.',
  listings: '3.861', occupancy: '61%', adr: '160€', revpar: '92€',
  mainLaw: 'Ley 15/2018 + Decreto 10/2021 Comunitat Valenciana',
  registrationType: 'Inscripcion en el Registro Turistico (CPT) de la Comunitat Valenciana',
  keyRequirements: ['Inscripcion obligatoria en el Registro Turistico (CPT)', 'Registro estatal de alquiler de corta duracion desde julio de 2025', 'Registro de viajeros mediante SES.Hospedajes', 'Benidorm prepara ordenanza local de VUT y refuerza inspeccion', 'VUT limitadas en Casco Antiguo', 'Informe de compatibilidad urbanistica municipal'],
  penalties: 'Sanciones por operar sin licencia. Benidorm refuerza Policia Local contra pisos ilegales y solicito delegacion de inspeccion al Consell',
  touristTax: null,
  topZones: [
    { name: 'Levante / Rincon de Loix', reason: 'Zona costera principal con playas amplias, pubs y discotecas. Turismo de ocio joven e internacional (UK, Irlanda, Alemania). Demanda muy alta.' },
    { name: 'Playa de Poniente', reason: 'Playa familiar en el oeste, ambiente tranquilo. Familias y jubilados nordicos/britanicos. Licencias mas accesibles que en Levante.' },
    { name: 'Centro urbano', reason: 'Zona centrica con acceso a ambas playas, tiendas y alojamiento mixto. Turistas espanoles e internacionales de corta estancia.' },
    { name: 'Sierra Helada / Finestrat', reason: 'Colinas con apartamentos y campos de golf. Vistas panoramicas. Golfistas y familias de larga estancia. Licencias mas accesibles.' },
    { name: 'Cala de Finestrat', reason: 'Playa y puertecito familiar. Alternativa playera en zona residencial. Turista escandinavo y espanol de mediana edad.' },
  ],
  highSeason: 'Junio a Septiembre (pico en julio-agosto)',
  lowSeason: 'Noviembre a Febrero',
  keyEvents: ['Carnaval de Benidorm (febrero)', 'Fallas de Benidorm (marzo)', 'Noche de San Juan (23 junio)', 'Virgen del Carmen (16 julio)', 'Moros y Cristianos (octubre)'],
  guestQuestions: ['Donde puedo aparcar gratis?', 'Horarios de pubs y discotecas?', 'Como llegar al aeropuerto de Alicante?', 'Horarios de check-in y check-out?', 'Hay zonas tranquilas cerca?', 'Consejos de seguridad nocturna?', 'Se paga tasa turistica?', 'Donde estan los supermercados?'],
  whyManualHelps: 'Benidorm recibe huespedes muy variados: desde jovenes fiesteros britanicos hasta parejas mayores escandinavas. Un manual digital centraliza informacion basica en ingles (transporte, ocio, normas de piscina, emergencias) y evita repeticion de instrucciones. Especialmente util dada la diversidad de perfiles y las numerosas festividades locales.',
  keywords: ['manual digital apartamento turistico benidorm', 'vivienda turistica benidorm', 'alquiler vacacional benidorm costa blanca', 'airbnb benidorm', 'gestion huesped benidorm'],
  metaTitle: 'Manual Digital Apartamento Turistico Benidorm | Itineramio',
  metaDescription: 'Crea tu manual digital para huespedes en Benidorm. Normativa, zonas y gestion de vivienda turistica en la Costa Blanca.',
  faqs: [
    { question: 'Necesito licencia para alquilar en Benidorm?', answer: 'Si. Necesitas inscribirte en el Registro Turistico (CPT) de la Comunitat Valenciana. Ademas, Benidorm prepara una ordenanza local especifica y ha reforzado la inspeccion contra pisos ilegales. Desde julio de 2025 tambien necesitas el numero estatal.' },
    { question: 'Hay tasa turistica en Benidorm?', answer: 'No. Aunque la Comunitat Valenciana aprobo una tasa turistica voluntaria municipal, Benidorm no la ha implantado a fecha de 2026.' },
    { question: 'Cuales son los meses mas rentables?', answer: 'Julio y agosto son los meses de mayor ocupacion y tarifa. Benidorm supero 3 millones de visitantes en 2025, con el 67% de estancias internacionales.' },
    { question: 'Por que necesito un manual digital en Benidorm?', answer: 'Benidorm tiene una enorme variedad de perfiles de huesped (jovenes, familias, jubilados) y muchas festividades locales. Un manual digital en ingles centraliza toda la informacion practica y reduce mensajes repetitivos.' },
  ],
}

export default function BenidormPage() {
  return <CityLandingPage data={benidormData} />
}
