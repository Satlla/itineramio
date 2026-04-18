import NormativaPage from '@/components/landing/NormativaPage'
import type { NormativaData } from '@/components/landing/NormativaPage'

const data: NormativaData = {
  ccaa: 'Islas Baleares',
  slug: 'baleares',
  heroSubtitle: 'Baleares tiene una de las barreras de entrada regulatorias mas altas de Espana para el alquiler turistico. El sistema gira sobre plazas turisticas, zonificacion y habilitacion insular/municipal, con una moratoria severa que prohibe nuevas plazas en viviendas plurifamiliares. El Impuesto sobre Estancias Turisticas (ITS) se anade a la carga operativa. Sin embargo, el producto legal bien operado tiene un alto poder de fijacion de precios.',

  mainLaws: [
    {
      name: 'Ley 8/2012, de turismo de las Illes Balears',
      description: 'Ley base del turismo balear, modificada por la Ley 6/2017 y cambios posteriores. Establece el sistema de plazas turisticas, zonificacion y habilitacion insular y municipal para operar legalmente.',
    },
    {
      name: 'Decreto de contencion turistica',
      description: 'Confirma la prohibicion de nuevas plazas turisticas en viviendas plurifamiliares en todas las islas. Palma ha sido la ciudad balear mas restrictiva.',
    },
    {
      name: 'Decreto-ley 4/2025',
      description: 'Aparece en el consolidado de la ley del impuesto sobre estancias turisticas, actualizando el marco fiscal aplicable a viviendas turisticas.',
    },
  ],

  registrationType: 'Habilitacion turistica autonomico-insular con sistema de plazas turisticas y zonificacion',

  registrationSteps: [
    'Verificar la disponibilidad de plazas turisticas en la zona y tipologia de vivienda',
    'Obtener la habilitacion turistica del consejo insular o municipio correspondiente',
    'Inscripcion en el registro de turismo balear',
    'Cumplir con las obligaciones del Impuesto sobre Estancias Turisticas (ITS)',
    'Obtener el numero estatal de alquiler de corta duracion (desde julio de 2025)',
    'Registrar viajeros mediante SES.Hospedajes',
  ],

  requirements: [
    'Habilitacion turistica autonomico-insular',
    'Disponibilidad de plazas turisticas en la zona',
    'Zona permitida segun la zonificacion vigente',
    'Seguro de responsabilidad civil',
    'Registro de viajeros mediante SES.Hospedajes',
    'Cumplimiento del Impuesto sobre Estancias Turisticas (ITS)',
    'Numero estatal de alquiler de corta duracion desde julio de 2025',
    'Viviendas plurifamiliares: prohibicion de nuevas plazas en todas las islas',
  ],

  penalties: 'Endurecimiento sancionador y de control para oferta ilegal. Rango sancionador cerrado por tipologia concreta: [VERIFICAR].',

  touristTax: 'Impuesto sobre Estancias Turisticas (ITS). Aplica a viviendas turisticas de vacaciones y estancias turisticas en viviendas. Importe exacto por categoria: [VERIFICAR] - Se recomienda consultar la calculadora oficial del portal ITS del Govern de les Illes Balears.',

  stateRegistryNote: 'Desde julio de 2025 es obligatorio el numero estatal de alquiler de corta duracion (RD 1312/2024) para publicar en plataformas. Se suma a la habilitacion autonomico-insular.',

  travelersRegistryNote: 'La obligacion de comunicacion de datos de viajeros del RD 933/2021 se canaliza por SES.Hospedajes del Ministerio del Interior.',

  keyChanges: [
    {
      title: 'Prohibicion de nuevas plazas en plurifamiliares',
      description: 'El decreto de contencion turistica confirma la prohibicion de nuevas plazas turisticas en viviendas plurifamiliares en todas las islas. Palma es la ciudad con mayor restriccion.',
    },
    {
      title: 'Actualizacion del ITS',
      description: 'El Decreto-ley 4/2025 actualiza el marco del Impuesto sobre Estancias Turisticas, que afecta directamente a la operativa y costes de las viviendas turisticas.',
    },
    {
      title: 'Endurecimiento del control',
      description: 'La oferta ilegal afronta un endurecimiento sancionador y de control creciente, con mayor capacidad inspectora por parte de las administraciones insulares y municipales.',
    },
    {
      title: 'Palma: la ciudad mas restrictiva',
      description: 'Palma de Mallorca ha sido la ciudad balear con mayores restricciones a la vivienda turistica en plurifamiliar, siendo referencia del nivel de contention balear.',
    },
  ],

  citiesCovered: ['Palma de Mallorca', 'Ibiza', 'Menorca'],

  whyManualHelps: 'En Baleares, y especialmente en Palma, el manual digital es casi imprescindible. El huesped mezcla imaginario de isla con logisticas urbanas, y cualquier error de convivencia pesa mucho mas en una plaza politicamente hipersensible a la turistificacion. El manual ayuda a ordenar expectativas, comunicar normas de convivencia, ruido, piscina, parking y check-in de forma clara y en el idioma del huesped.',

  keywords: [
    'normativa alquiler turistico baleares',
    'ley 8/2012 turismo baleares',
    'plazas turisticas palma mallorca',
    'moratoria alquiler vacacional palma',
    'ITS impuesto estancias turisticas',
    'licencia vivienda turistica baleares',
    'como saber si puedo alquilar turistico palma',
    'registro turismo baleares',
    'vivienda turistica ibiza normativa',
    'manual digital huespedes palma mallorca',
  ],
  metaTitle: 'Normativa Alquiler Turistico Baleares | Itineramio',
  metaDescription: 'Normativa de alquiler turistico en Baleares. Ley 8/2012, plazas turisticas, moratoria, ITS y requisitos.',

  faqs: [
    {
      question: 'Puedo abrir una nueva vivienda turistica en Palma?',
      answer: 'Es extremadamente dificil. Existe una prohibicion de nuevas plazas turisticas en viviendas plurifamiliares en todas las islas, y Palma es la ciudad con mayores restricciones. Si tu vivienda es unifamiliar, podrias tener opciones dependiendo de la zona y disponibilidad de plazas.',
    },
    {
      question: 'Que es el sistema de plazas turisticas?',
      answer: 'Baleares regula la oferta turistica mediante un sistema de plazas. No basta con registrar la vivienda: debe haber plazas disponibles en tu zona y tipologia. El consejo insular o municipio gestiona la asignacion de plazas.',
    },
    {
      question: 'Cuanto es el Impuesto sobre Estancias Turisticas?',
      answer: 'El ITS se aplica a todas las estancias turisticas en Baleares, incluidas viviendas turisticas. El importe exacto varia por categoria. Se recomienda consultar la calculadora oficial del portal ITS del Govern de les Illes Balears para obtener la tarifa actualizada.',
    },
    {
      question: 'Que pasa si alquilo sin habilitacion en Baleares?',
      answer: 'La oferta ilegal afronta un endurecimiento sancionador y de control creciente. Las administraciones insulares y municipales han incrementado su capacidad inspectora. Las sanciones pueden ser severas.',
    },
    {
      question: 'Por que necesito un manual digital en Baleares?',
      answer: 'Baleares es una plaza politicamente hipersensible a la turistificacion. Cualquier incidencia de convivencia pesa mas que en otros destinos. El manual digital ayuda a comunicar normas, gestionar expectativas y reducir conflictos vecinales, protegiendo tu licencia y tus resenas.',
    },
  ],
}

export default function BalearesPage() {
  return <NormativaPage data={data} />
}
