import NormativaPage from '@/components/landing/NormativaPage'
import type { NormativaData } from '@/components/landing/NormativaPage'

const data: NormativaData = {
  ccaa: 'Cataluna',
  slug: 'cataluna',
  heroSubtitle: 'Cataluna es la comunidad con el marco regulatorio mas restrictivo de Espana para viviendas turisticas. Barcelona no permite nuevas licencias (PEUAT), ha anunciado que no renovara las 10.101 existentes en noviembre de 2028 y aplica una tasa turistica de 9,50 EUR por persona y dia. Conocer la normativa es critico tanto para quienes ya operan como para quienes evaluan la viabilidad de nuevas operaciones.',

  mainLaws: [
    {
      name: 'Llei 13/2002, de turisme de Catalunya',
      description: 'Ley base del turismo en Cataluna. Establece el marco general de la actividad turistica y las categorias de alojamiento.',
    },
    {
      name: 'Decret 75/2020, de 4 d agost',
      description: 'Desarrolla la regulacion turistica de Cataluna. Define los habitats d us turistic (HUT) como cesiones enteras por periodos iguales o inferiores a 31 dias, con requisitos de cedula de habitabilidad, mobiliario, telefono de incidencias y exhibicion visible del NIRTC.',
    },
    {
      name: 'PEUAT (Plan Especial Urbanistico de Alojamientos Turisticos)',
      description: 'Plan urbanistico de Barcelona que impide la concesion de nuevas licencias de vivienda turistica en la ciudad. El informe oficial reconoce la imposibilidad de solicitar nuevas licencias.',
    },
    {
      name: 'Decreto-ley 3/2023',
      description: 'Introduce la necesidad de licencia urbanistica previa en municipios afectados, con duracion de cinco anos. Anaden capa adicional de cumplimiento urbanistico.',
    },
  ],

  registrationType: 'Comunicacion de inicio de actividad y habilitacion municipal, con inscripcion en el Registro de Turismo de Catalunya y asignacion del NIRTC',

  registrationSteps: [
    'Presentar comunicacion de inicio de actividad ante el ayuntamiento correspondiente',
    'Obtener la habilitacion municipal para la actividad',
    'Inscripcion en el Registro de Turismo de Catalunya',
    'Obtencion del NIRTC (Numero de Inscripcion en el Registro de Turismo de Catalunya)',
    'Disponer de cedula de habitabilidad vigente',
    'Obtener licencia urbanistica previa si el municipio lo requiere (Decreto-ley 3/2023)',
    'Comunicar datos de viajeros a los Mossos d Esquadra dentro de las 24 horas',
  ],

  requirements: [
    'Cesion de la vivienda entera, no por habitaciones',
    'Periodos continuos iguales o inferiores a 31 dias',
    'Cedula de habitabilidad vigente',
    'Mobiliario y menaje suficientes',
    'Telefono de atencion de incidencias disponible',
    'Servicio de asistencia y mantenimiento de la vivienda',
    'Exhibicion visible del NIRTC, capacidad maxima y telefono de asistencia',
    'Comunicacion policial a Mossos d Esquadra (no SES.Hospedajes)',
    'Numero estatal de alquiler de corta duracion desde julio de 2025',
    'Liquidacion y pago del Impuesto sobre Estancias Turisticas',
  ],

  penalties: 'En Barcelona, el PEUAT impide la concesion de nuevas licencias. La ciudad ha anunciado que no renovara las 10.101 licencias actuales y quiere extinguir el modelo de piso turistico en noviembre de 2028.',

  touristTax: 'Desde abril de 2026, la tarifa total para HUT en Barcelona ciudad es de 9,50 EUR por persona y dia (4,50 EUR autonomicos + 5,00 EUR recargo municipal), segun la Llei 2/2026.',

  stateRegistryNote: 'Desde julio de 2025 es obligatorio el numero estatal de alquiler de corta duracion (RD 1312/2024) para publicar en plataformas. Se suma a la habilitacion autonomica.',

  travelersRegistryNote: 'En Cataluna, la comunicacion policial de datos de viajeros NO se hace por SES.Hospedajes. Se tramita a traves del web de los Mossos d Esquadra, dentro de las 24 horas del inicio del alojamiento.',

  keyChanges: [
    {
      title: 'PEUAT: imposibilidad de nuevas licencias',
      description: 'Barcelona mantiene la imposibilidad de solicitar nuevas licencias de vivienda turistica. El crecimiento reciente procedia de licencias anteriores incorporadas al censo, no de nuevas concesiones.',
    },
    {
      title: 'Extincion de licencias en noviembre de 2028',
      description: 'La ciudad de Barcelona ha anunciado que no renovara las 10.101 licencias actuales y quiere extinguir el modelo de piso turistico tal como hoy existe. Plazo limite: noviembre de 2028.',
    },
    {
      title: 'Subida de tasa turistica (Llei 2/2026)',
      description: 'Para HUT en Barcelona ciudad, la tarifa total desde abril de 2026 es de 9,50 EUR por persona y dia: 4,50 EUR autonomicos + 5,00 EUR recargo municipal. Es la tasa mas alta de Espana.',
    },
    {
      title: 'Licencia urbanistica previa (Decreto-ley 3/2023)',
      description: 'En municipios afectados, se exige licencia urbanistica previa con duracion de cinco anos, lo que anade una capa adicional de cumplimiento mas alla del registro turistico.',
    },
  ],

  citiesCovered: ['Barcelona'],

  whyManualHelps: 'En Barcelona, el manual digital no es un complemento: es casi obligatorio. Las obligaciones de convivencia y la sensibilidad vecinal son las mas altas de Espana. El manual permite comunicar normas de silencio, recogida de basuras, horarios y procedimientos de check-in de forma clara y en el idioma del huesped, reduciendo conflictos con vecinos y protegiendo las resenas.',

  keywords: [
    'normativa HUT cataluna',
    'NIRTC vivienda turistica barcelona',
    'PEUAT barcelona pisos turisticos',
    'tasa turistica barcelona 2026',
    'manual digital huespedes barcelona',
    'mossos registro viajeros barcelona',
    'fin licencias pisos turisticos barcelona 2028',
    'decret 75/2020 cataluna',
    'como legalizar HUT barcelona',
    'alternativas airbnb barcelona 2026',
  ],
  metaTitle: 'Normativa Vivienda Turistica Cataluna | Itineramio',
  metaDescription: 'Normativa HUT en Cataluna. Llei 13/2002, PEUAT Barcelona, tasa turistica 9,50 EUR y moratoria de licencias.',

  faqs: [
    {
      question: 'Se pueden obtener nuevas licencias de piso turistico en Barcelona?',
      answer: 'No. El PEUAT impide la concesion de nuevas licencias de vivienda turistica en Barcelona. Ademas, la ciudad ha anunciado que no renovara las 10.101 licencias actuales y quiere extinguir el modelo en noviembre de 2028.',
    },
    {
      question: 'Cuanto es la tasa turistica en Barcelona?',
      answer: 'Desde abril de 2026, la tarifa total para HUT en Barcelona ciudad es de 9,50 EUR por persona y dia: 4,50 EUR autonomicos mas 5,00 EUR de recargo municipal (Llei 2/2026). Es la tasa turistica mas alta de Espana.',
    },
    {
      question: 'Como se registran los viajeros en Cataluna?',
      answer: 'A diferencia del resto de Espana, en Cataluna la comunicacion policial de datos de viajeros no se hace por SES.Hospedajes sino a traves del web de los Mossos d Esquadra, dentro de las 24 horas del inicio del alojamiento.',
    },
    {
      question: 'Que es el NIRTC?',
      answer: 'Es el Numero de Inscripcion en el Registro de Turismo de Catalunya. Debe exhibirse visiblemente en la vivienda turistica junto con la capacidad maxima y el telefono de asistencia. Tambien debe aparecer en todos los anuncios.',
    },
    {
      question: 'Que pasa si tengo licencia y mi comunidad de propietarios se opone?',
      answer: 'En Cataluna, los estatutos de la comunidad inscritos en el Registro de la Propiedad pueden limitar el uso turistico. Si el acuerdo es anterior al alta, puede dar lugar a un expediente de cancelacion.',
    },
  ],
}

export default function CatalunaPage() {
  return <NormativaPage data={data} />
}
