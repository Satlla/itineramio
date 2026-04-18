import CityLandingPage from '@/components/landing/CityLandingPage'
import type { CityData } from '@/components/landing/CityLandingPage'

const palmaData: CityData = {
  city: 'Palma de Mallorca',
  region: 'Illes Balears',
  heroSubtitle: 'Palma es uno de los destinos mas regulados de Espana con moratoria activa y el impuesto ITS. Crea un manual digital que facilite la convivencia vecinal y cumpla con la normativa balear.',

  listings: '2.279',
  occupancy: '64%',
  adr: '287,5$',
  revpar: '164,6$',

  mainLaw: 'Ley 8/2012, Ley 6/2017, Decreto-ley 4/2025',
  registrationType: 'Habilitacion insular/municipal + asignacion de plazas turisticas',
  keyRequirements: [
    'Habilitacion del Consell Insular de Mallorca',
    'Cumplir zonificacion (PIAT/PZAT): prohibido en plurifamiliar',
    'Adquirir plazas turisticas (bolsa de plazas)',
    'Certificado energetico minimo D',
    'Registro de viajeros ante la Policia',
    'Cobro y liquidacion del ITS (Impuesto Estancias Turisticas)',
    'Cumplir normas de convivencia y ruido',
  ],
  penalties: 'Hasta 400.000€ por infracciones muy graves. Moratoria severa en viviendas plurifamiliares.',
  touristTax: 'ITS (Impuesto Estancias Turisticas): entre 1€ y 4€ por noche segun temporada',

  topZones: [
    { name: 'Casco Antiguo (La Lonja)', reason: 'Zona historica premium con la Catedral y La Lonja. ADR muy alto, perfil cultural y gastronomico. Regulacion estricta.' },
    { name: 'Santa Catalina', reason: 'Barrio de moda con mercado gastronomico. Alta demanda de huespedes jovenes y cosmopolitas. Buena rentabilidad.' },
    { name: 'Paseo Maritimo', reason: 'Frente al puerto deportivo. Perfil de huesped premium y nautico. Estancias medias y altas tarifas.' },
    { name: 'Portixol - Molinar', reason: 'Antiguo barrio de pescadores reconvertido. Ambiente local y tranquilo. Creciente demanda.' },
    { name: 'Ciudad Jardin', reason: 'Zona residencial con playa propia. Familias y estancias mas largas. Menor saturacion turistica.' },
  ],

  highSeason: 'Mayo a Octubre, con pico en Julio y Agosto',
  lowSeason: 'Noviembre a Marzo, con algo de demanda en Navidad',
  keyEvents: [
    'Sant Sebastia (enero)',
    'Semana Santa',
    'Nit de Sant Joan (junio)',
    'Festes de la Beata (octubre)',
    'Regattas y eventos nauticos',
  ],

  guestQuestions: [
    'Donde estan las mejores playas cerca de Palma?',
    'Donde puedo aparcar en el centro?',
    'Como llego del aeropuerto al apartamento?',
    'Hay restricciones de ruido en el edificio?',
    'Que excursiones puedo hacer por la isla?',
    'Donde alquilo un coche o moto?',
    'Cual es la contrasena del WiFi?',
    'Como funciona la recogida de basura?',
  ],
  whyManualHelps: 'Palma vive una hipersensibilidad hacia la turistificacion, con regulaciones cada vez mas estrictas y tension vecinal. Un manual digital bien hecho no solo informa al huesped sobre como llegar y el WiFi, sino que comunica las normas de convivencia, horarios de silencio y reglas del edificio, reduciendo conflictos con los vecinos y protegiendo tu licencia.',

  keywords: [
    'manual digital alquiler turistico palma',
    'vivienda turistica palma de mallorca',
    'alquiler vacacional mallorca normativa',
    'ITS impuesto estancias turisticas',
    'moratoria turistica palma',
    'airbnb palma regulacion',
    'ley 8/2012 baleares',
  ],
  metaTitle: 'Manual Digital Alquiler Turistico Palma | Itineramio',
  metaDescription: 'Manual digital para vivienda turistica en Palma de Mallorca. Moratoria, ITS, convivencia. Prueba gratis.',

  faqs: [
    {
      question: 'Puedo alquilar mi piso turistico en Palma de Mallorca?',
      answer: 'Depende del tipo de vivienda. Desde el Decreto-ley 4/2025, las viviendas en edificios plurifamiliares (pisos) estan prohibidas para alquiler turistico en Palma. Solo se permite en viviendas unifamiliares o adosadas, sujetas a la obtencion de habilitacion del Consell Insular y la compra de plazas turisticas.',
    },
    {
      question: 'Que es el ITS y cuanto hay que cobrar?',
      answer: 'El ITS (Impuesto sobre Estancias Turisticas) es una tasa que deben pagar todos los huespedes en Baleares. Oscila entre 1€ y 4€ por noche y persona segun la temporada y el tipo de alojamiento. El anfitrion es responsable de cobrarlo y liquidarlo trimestralmente.',
    },
    {
      question: 'Cual es la rentabilidad de un alquiler vacacional en Palma?',
      answer: 'Palma tiene una de las tarifas medias mas altas de Espana: ADR de 287,5$ con una ocupacion del 64% y un RevPAR de 164,6$. Sin embargo, los costes regulatorios (plazas, ITS, seguros) son tambien significativos.',
    },
    {
      question: 'Como ayuda un manual digital con los problemas de convivencia en Palma?',
      answer: 'El manual digital de Itineramio permite incluir las normas del edificio, horarios de silencio, gestion de basuras y reglas de uso de zonas comunes. El huesped las recibe antes de llegar, lo que reduce quejas vecinales y protege tu habilitacion turistica.',
    },
  ],
}

export default function PalmaPage() {
  return <CityLandingPage data={palmaData} />
}
