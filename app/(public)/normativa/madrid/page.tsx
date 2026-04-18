import NormativaPage from '@/components/landing/NormativaPage'
import type { NormativaData } from '@/components/landing/NormativaPage'

const data: NormativaData = {
  ccaa: 'Comunidad de Madrid',
  slug: 'madrid',
  heroSubtitle: 'Madrid es el mayor mercado de alquiler vacacional de Espana, con casi 16.000 listings activos y una presion regulatoria e inspectora creciente. La comunidad registro 3.053 bajas de viviendas turisticas en 2025 y 341 mas en los dos primeros meses de 2026. Conocer la normativa es imprescindible para operar legalmente en un mercado con doble plano de cumplimiento: turistico-autonomico y urbanistico-municipal.',

  mainLaws: [
    {
      name: 'Decreto 79/2014, de 10 de julio',
      description: 'Norma base de la Comunidad de Madrid sobre apartamentos turisticos y viviendas de uso turistico. Regula el alta mediante declaracion responsable, requisitos de equipamiento y obligaciones de los anfitriones.',
    },
    {
      name: 'Actualizacion anunciada en marzo de 2026',
      description: 'La comunidad anuncio cambios para reforzar equipamiento minimo, tamanos de estancias, ocupacion maxima, prohibicion en VPO y potestad municipal para limitar densidades por edificio o zona. Ademas, la declaracion responsable la debe presentar el titular de la actividad, no necesariamente el propietario.',
    },
  ],

  registrationType: 'Declaracion responsable ante la Direccion General de Turismo de la Comunidad de Madrid',

  registrationSteps: [
    'Presentar declaracion responsable de inicio de actividad de vivienda de uso turistico en la sede de la Comunidad de Madrid',
    'Disponer de cedula de habitabilidad o licencia de primera ocupacion',
    'Exhibir placa identificativa exterior normalizada',
    'Dar de alta la vivienda en el Registro de Empresas Turisticas',
    'Obtener el numero estatal de alquiler de corta duracion (desde julio de 2025)',
    'Registrar viajeros mediante SES.Hospedajes',
  ],

  requirements: [
    'Declaracion responsable ante el Registro de Empresas Turisticas',
    'Cedula de habitabilidad o licencia de primera ocupacion',
    'Placa identificativa exterior normalizada',
    'Hojas de reclamaciones a disposicion de los huespedes',
    'Informar a la comunidad de propietarios sobre la actividad',
    'Registro de viajeros ante la Policia Nacional (SES.Hospedajes)',
    'Numero estatal de alquiler de corta duracion desde julio de 2025',
    'Cumplimiento urbanistico municipal (doble plano de cumplimiento)',
  ],

  penalties: 'Rango sancionador autonomico exacto vigente para VUT: [VERIFICAR]. La comunidad registro 3.053 bajas en 2025 y 341 mas en los dos primeros meses de 2026, lo que refleja una actividad inspectora muy intensa.',

  touristTax: null,

  stateRegistryNote: 'Desde julio de 2025 es obligatorio el numero estatal de alquiler de corta duracion (RD 1312/2024) para publicar en plataformas. Se suma a la habilitacion autonomica y no la sustituye.',

  travelersRegistryNote: 'La obligacion de comunicacion de datos de viajeros del RD 933/2021 se canaliza por SES.Hospedajes del Ministerio del Interior.',

  keyChanges: [
    {
      title: 'Declaracion responsable por titular de actividad',
      description: 'El cambio relevante de 2026 es que la declaracion responsable la debe presentar el titular de la actividad y no necesariamente el propietario del inmueble.',
    },
    {
      title: 'Refuerzo de equipamiento y limites',
      description: 'La actualizacion anunciada en marzo de 2026 incluye equipamiento minimo, tamanos de estancias, ocupacion maxima, prohibicion en VPO y potestad municipal para limitar densidades por edificio o zona.',
    },
    {
      title: 'Actividad inspectora intensificada',
      description: 'La comunidad registro 3.053 bajas de viviendas turisticas en 2025 y 341 mas en los dos primeros meses de 2026. Mas de 16.000 pisos podrian estar operando sin licencia segun fuentes sectoriales y publicas.',
    },
    {
      title: 'Doble plano de cumplimiento',
      description: 'En Madrid conviven el cumplimiento turistico-autonomico y el urbanistico-municipal. Existe un dataset oficial de viviendas con licencia urbanistica actualizado a marzo de 2026.',
    },
  ],

  citiesCovered: ['Madrid'],

  whyManualHelps: 'Madrid recibe millones de turistas internacionales que llegan desde Barajas sin conocer la ciudad. Las estancias son cortas y las preguntas se concentran en transporte aeropuerto-centro, restricciones urbanas, parking y check-in complejo en areas centricas. Un manual digital con instrucciones de llegada, transporte, WiFi y recomendaciones reduce drasticamente las llamadas y mensajes repetitivos.',

  keywords: [
    'normativa vivienda turistica madrid',
    'decreto 79/2014 madrid',
    'declaracion responsable vivienda turistica madrid',
    'licencia piso turistico madrid',
    'registro SES hospedajes madrid',
    'abrir airbnb legal madrid 2026',
    'requisitos vivienda turistica comunidad de madrid',
    'multas piso turistico madrid',
    'manual digital huespedes madrid',
    'que barrio es mejor para alquiler turistico madrid',
  ],
  metaTitle: 'Normativa Vivienda Turistica Madrid | Itineramio',
  metaDescription: 'Normativa de vivienda turistica en Madrid. Decreto 79/2014, declaracion responsable, requisitos y sanciones actualizadas.',

  faqs: [
    {
      question: 'Necesito licencia para alquilar mi piso turistico en Madrid?',
      answer: 'Si. Necesitas presentar una declaracion responsable ante el Registro de Empresas Turisticas de la Comunidad de Madrid (Decreto 79/2014). Ademas, desde julio de 2025, necesitas el numero estatal de alquiler de corta duracion para publicar en plataformas.',
    },
    {
      question: 'Hay tasa turistica en Madrid?',
      answer: 'A fecha de 2026, la Comunidad de Madrid no ha implementado una tasa turistica, a diferencia de Cataluna o Baleares. Esto supone una ventaja competitiva frente a otros destinos espanoles.',
    },
    {
      question: 'Que pasa si opero sin registro en Madrid?',
      answer: 'La actividad inspectora se ha intensificado significativamente. La comunidad registro 3.053 bajas en 2025. Operar sin registro expone a sanciones economicas y al cierre de la actividad.',
    },
    {
      question: 'Quien debe presentar la declaracion responsable?',
      answer: 'Desde 2026, la declaracion responsable la debe presentar el titular de la actividad, que no tiene por que ser necesariamente el propietario del inmueble. Este es un cambio relevante respecto a la normativa anterior.',
    },
    {
      question: 'Como ayuda un manual digital a cumplir la normativa?',
      answer: 'El manual digital de Itineramio permite incluir normas de convivencia, horarios de silencio, instrucciones de check-in y procedimientos de reciclaje que exige la normativa. Ademas, facilita la comunicacion con huespedes internacionales gracias a la traduccion automatica.',
    },
  ],
}

export default function MadridNormativaPage() {
  return <NormativaPage data={data} />
}
