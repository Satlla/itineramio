import NormativaPage from '@/components/landing/NormativaPage'
import type { NormativaData } from '@/components/landing/NormativaPage'

const data: NormativaData = {
  ccaa: 'Canarias',
  slug: 'canarias',
  heroSubtitle: 'Canarias cuenta desde 2025 con dos referencias legales: el Decreto 113/2015 y la nueva Ley 6/2025 de Ordenacion Sostenible del Uso Turistico de Viviendas. El sistema de declaracion responsable permite un inicio de actividad agil, pero el endurecimiento sancionador y los controles se han intensificado. Cubre los mercados de Las Palmas de Gran Canaria y Tenerife Sur, dos de las plazas vacacionales mas potentes del pais con demanda casi anual.',

  mainLaws: [
    {
      name: 'Decreto 113/2015, de 22 de mayo',
      description: 'Reglamento de viviendas vacacionales de Canarias. Establece los requisitos basicos de inscripcion, equipamiento y operacion de viviendas vacacionales en las islas.',
    },
    {
      name: 'Ley 6/2025, de 10 de diciembre',
      description: 'Ley de Ordenacion Sostenible del Uso Turistico de Viviendas. Gran novedad canaria: desde 2025 ya no es solo un decreto, sino tambien una ley que refuerza el marco regulatorio, el regimen sancionador y la sostenibilidad del modelo.',
    },
  ],

  registrationType: 'Declaracion responsable en sede electronica del Gobierno de Canarias, con inscripcion en el Registro General Turistico',

  registrationSteps: [
    'Presentar declaracion responsable a traves de la sede electronica del Gobierno de Canarias',
    'Recibir el documento acreditativo de inscripcion para iniciar la actividad de inmediato',
    'Quedar inscrito en el Registro General Turistico de Canarias',
    'Obtener el numero estatal de alquiler de corta duracion (desde julio de 2025)',
    'Registrar viajeros mediante SES.Hospedajes',
  ],

  requirements: [
    'Declaracion responsable ante el Gobierno de Canarias',
    'Inscripcion en el Registro General Turistico',
    'Cumplimiento de los requisitos de la Ley 6/2025',
    'Registro de viajeros mediante SES.Hospedajes (RD 933/2021)',
    'Numero estatal de alquiler de corta duracion desde julio de 2025',
    'Equipamiento y condiciones de habitabilidad adecuados',
    'Seguro de responsabilidad civil',
  ],

  penalties: 'Endurecimiento sancionador con la nueva Ley 6/2025. Rango sancionador concreto por tipologia: [VERIFICAR].',

  touristTax: null,

  stateRegistryNote: 'Desde julio de 2025 es obligatorio el numero estatal de alquiler de corta duracion (RD 1312/2024) para publicar en plataformas. Se suma a la inscripcion en el Registro General Turistico canario.',

  travelersRegistryNote: 'La obligacion de comunicacion de datos de viajeros del RD 933/2021 se canaliza por SES.Hospedajes del Ministerio del Interior.',

  keyChanges: [
    {
      title: 'Nueva Ley 6/2025 de Ordenacion Sostenible',
      description: 'Canarias ya no se regula solo por decreto: la Ley 6/2025 refuerza el marco legal, el regimen sancionador y establece criterios de sostenibilidad para el uso turistico de viviendas.',
    },
    {
      title: 'Endurecimiento sancionador',
      description: 'La nueva ley endurece las sanciones y los mecanismos de control sobre la oferta ilegal de viviendas vacacionales en las islas.',
    },
    {
      title: 'Fragmentacion municipal en Tenerife Sur',
      description: 'En el sur de Tenerife, el mercado se fragmenta entre los municipios de Arona y Adeje, cada uno con sus propias particularidades urbanisticas. Cualquier operacion debe tener en cuenta el municipio concreto.',
    },
  ],

  citiesCovered: ['Las Palmas de Gran Canaria', 'Tenerife Sur (Arona, Adeje)', 'Lanzarote', 'Fuerteventura'],

  whyManualHelps: 'Canarias atrae mucho teletrabajo y estancias medias, con huespedes que esperan informacion practica muy concreta sobre el barrio, playas, supermercados y parking. En Tenerife Sur, el manual digital es especialmente util para gestionar auto check-in, normas de urbanizacion y complejo, piscina, parking y pautas de convivencia multinacional. En Las Palmas, el valor esta en playa urbana, teletrabajo, transporte y excursiones.',

  keywords: [
    'normativa vivienda vacacional canarias',
    'decreto 113/2015 canarias',
    'ley 6/2025 vivienda vacacional',
    'declaracion responsable canarias',
    'registro general turistico las palmas',
    'vivienda vacacional tenerife sur',
    'airbnb legal canarias 2026',
    'SES hospedajes canarias',
    'manual digital huespedes las palmas',
    'rentabilidad alquiler vacacional costa adeje',
  ],
  metaTitle: 'Normativa Vivienda Vacacional Canarias | Itineramio',
  metaDescription: 'Normativa de vivienda vacacional en Canarias. Decreto 113/2015, Ley 6/2025, declaracion responsable y requisitos.',

  faqs: [
    {
      question: 'Que leyes regulan las viviendas vacacionales en Canarias?',
      answer: 'Dos referencias principales: el Decreto 113/2015 (reglamento de viviendas vacacionales) y la nueva Ley 6/2025 de Ordenacion Sostenible del Uso Turistico de Viviendas. Desde 2025, Canarias cuenta con una ley propia ademas del decreto.',
    },
    {
      question: 'Como me registro como vivienda vacacional en Canarias?',
      answer: 'Mediante declaracion responsable en la sede electronica del Gobierno de Canarias. El sistema devuelve el documento acreditativo de inscripcion y permite iniciar la actividad de inmediato tras la inscripcion en el Registro General Turistico.',
    },
    {
      question: 'Hay diferencias entre Las Palmas y Tenerife Sur?',
      answer: 'La normativa autonomica es la misma, pero en Tenerife Sur el mercado se fragmenta entre municipios como Arona y Adeje, cada uno con sus particularidades urbanisticas. Es importante verificar el municipio concreto donde se ubica la vivienda.',
    },
    {
      question: 'Hay tasa turistica en Canarias?',
      answer: 'A fecha de 2026 no existe tasa turistica en Canarias, lo que supone una ventaja competitiva frente a destinos como Barcelona o Baleares.',
    },
    {
      question: 'Cual es la temporada alta en Canarias?',
      answer: 'La estacionalidad en Canarias es mucho mas plana que en el Mediterraneo peninsular. La temporada con mayor demanda suele ser octubre a marzo (invierno europeo), pero la ocupacion se mantiene relativamente estable todo el ano.',
    },
  ],
}

export default function CanariasPage() {
  return <NormativaPage data={data} />
}
