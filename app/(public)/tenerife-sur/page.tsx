import CityLandingPage from '@/components/landing/CityLandingPage'
import type { CityData } from '@/components/landing/CityLandingPage'

const tenerifeSurData: CityData = {
  city: 'Tenerife Sur',
  region: 'Canarias',
  heroSubtitle: 'Tenerife Sur concentra mas de 8.900 alojamientos vacacionales entre Costa Adeje, Arona y el sur de la isla. Crea un manual digital que resuelva el auto check-in, normas de complejo y la barrera idiomatica.',

  listings: '~8.955',
  occupancy: '47-67%',
  adr: '146-218$',
  revpar: '~97$',

  mainLaw: 'Decreto 113/2015, Ley 6/2025 de ordenacion del turismo de Canarias',
  registrationType: 'Declaracion responsable canaria + inscripcion en Registro General Turistico',
  keyRequirements: [
    'Declaracion responsable de inicio de actividad turistica',
    'Inscripcion en el Registro General Turistico de Canarias',
    'Licencia de primera ocupacion o cedula de habitabilidad',
    'Seguro de responsabilidad civil',
    'Placa identificativa exterior',
    'Cumplir normativa de la comunidad de propietarios o complejo',
    'Registro de viajeros ante la Policia Nacional',
  ],
  penalties: 'Hasta 600.000€ por infracciones muy graves segun Ley 6/2025',
  touristTax: 'No vigente en Canarias (en debate parlamentario)',

  topZones: [
    { name: 'Costa Adeje', reason: 'Zona premium del sur de Tenerife. Resorts, playas de arena, alta tarifa media. Perfil familiar y de alto poder adquisitivo.' },
    { name: 'Playa de las Americas', reason: 'Zona de ocio nocturno y turismo masivo. Alta ocupacion todo el ano, perfil joven y europeo.' },
    { name: 'Los Cristianos', reason: 'Ambiente familiar y tranquilo con puerto. Estancias mas largas, jubilados europeos en invierno.' },
    { name: 'El Medano', reason: 'Destino de windsurf y kitesurf. Perfil deportivo y alternativo. Creciente demanda de nomadas digitales.' },
    { name: 'Golf del Sur', reason: 'Zona de complejos residenciales con campo de golf. Huespedes de larga estancia, perfil britanico y nordico.' },
  ],

  highSeason: 'Todo el ano, con especial fuerza en invierno europeo (noviembre a marzo)',
  lowSeason: 'No tiene temporada baja marcada. Menor demanda relativa en mayo-junio.',
  keyEvents: [
    'Carnaval de Tenerife (febrero-marzo)',
    'Fiestas patronales de Adeje y Arona',
    'Ironman Tenerife',
    'Festival de Jazz de Adeje',
    'Temporada de avistamiento de cetaceos (todo el ano)',
  ],

  guestQuestions: [
    'Necesito alquilar coche en Tenerife Sur?',
    'Como llego del aeropuerto al apartamento?',
    'Cuales son las mejores playas cercanas?',
    'Que excursiones puedo hacer (Teide, ballenas)?',
    'Cuales son las normas del complejo o urbanizacion?',
    'Como funciona la piscina comunitaria?',
    'Donde estan los supermercados mas cercanos?',
    'Hay farmacia y centro medico cerca?',
  ],
  whyManualHelps: 'Tenerife Sur tiene tres retos unicos: el auto check-in es muy comun (el anfitrion no esta presente), los complejos residenciales tienen normas especificas (piscina, ruido, basuras) que varian entre urbanizaciones, y la clientela es multinacional (britanicos, alemanes, nordicos). Un manual digital multilingue con las normas del complejo y guia practica elimina la mayoria de las llamadas y mensajes.',

  keywords: [
    'manual digital alquiler vacacional tenerife sur',
    'vivienda vacacional tenerife',
    'alquiler turistico costa adeje',
    'airbnb tenerife sur',
    'los cristianos alquiler vacacional',
    'playa americas apartamento turistico',
    'arona vivienda vacacional',
  ],
  metaTitle: 'Manual Digital Alquiler Vacacional Tenerife Sur | Itineramio',
  metaDescription: 'Manual digital para vivienda vacacional en Tenerife Sur. Costa Adeje, Arona, Los Cristianos. Prueba gratis.',

  faqs: [
    {
      question: 'Que normativa se aplica a las viviendas vacacionales en Tenerife Sur?',
      answer: 'Las viviendas vacacionales en Tenerife se regulan por el Decreto 113/2015 y la nueva Ley 6/2025 de turismo de Canarias. Se requiere declaracion responsable e inscripcion en el Registro General Turistico. Ademas, muchos complejos residenciales tienen sus propias normas internas que tambien deben cumplirse.',
    },
    {
      question: 'Como gestionar el auto check-in en Tenerife Sur?',
      answer: 'El auto check-in es muy habitual en Tenerife Sur porque muchos anfitriones no residen en la zona. Un manual digital de Itineramio permite enviar automaticamente las instrucciones de llegada, codigos de acceso y normas del complejo antes de que el huesped aterrice. Esto elimina la necesidad de estar presente.',
    },
    {
      question: 'Es necesario coche en Tenerife Sur?',
      answer: 'Para zonas turisticas como Costa Adeje, Playa de las Americas y Los Cristianos, es posible moverse a pie o en autobus. Sin embargo, para visitar el Teide, pueblos del interior o playas alejadas, un coche de alquiler es muy recomendable. El manual digital puede incluir informacion sobre alquiler de coches y parking.',
    },
    {
      question: 'En que idiomas deberia estar el manual en Tenerife Sur?',
      answer: 'La clientela de Tenerife Sur es mayoritariamente britanica, alemana, nordica y espanola. Un manual en espanol e ingles cubre la mayor parte. El chatbot de Itineramio detecta automaticamente el idioma del huesped y responde en consecuencia.',
    },
  ],
}

export default function TenerifeSurPage() {
  return <CityLandingPage data={tenerifeSurData} />
}
