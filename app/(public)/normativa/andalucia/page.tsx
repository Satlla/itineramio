import NormativaPage from '@/components/landing/NormativaPage'
import type { NormativaData } from '@/components/landing/NormativaPage'

const data: NormativaData = {
  ccaa: 'Andalucia',
  slug: 'andalucia',
  heroSubtitle: 'Andalucia alberga tres de los mercados turisticos mas potentes de Espana: Sevilla, Malaga y Granada. El Decreto 28/2016 regula las viviendas con fines turisticos con requisitos de registro, equipamiento y comunicacion de viajeros. La actividad inspectora se ha intensificado y Andalucia es una de las CCAA con mas denegaciones del registro estatal en 2025-2026.',

  mainLaws: [
    {
      name: 'Decreto 28/2016, de 2 de febrero',
      description: 'Regulacion de las viviendas con fines turisticos de la Comunidad Autonoma de Andalucia. Establece los requisitos de inscripcion, equipamiento minimo, hojas de reclamaciones y obligaciones de informacion. [VERIFICAR consolidado exacto y posibles ajustes reglamentarios 2025-2026]',
    },
  ],

  registrationType: 'Inscripcion en el Registro de Turismo de Andalucia mediante declaracion responsable',

  registrationSteps: [
    'Presentar la inscripcion en el Registro de Turismo de Andalucia',
    'Cumplir los requisitos de equipamiento minimo establecidos por el Decreto 28/2016',
    'Disponer de hojas de reclamaciones a disposicion de los huespedes',
    'Registrar viajeros mediante SES.Hospedajes (RD 933/2021)',
    'Obtener el numero estatal de alquiler de corta duracion desde julio de 2025',
  ],

  requirements: [
    'Registro/autorizacion turistica autonomica en el Registro de Turismo de Andalucia',
    'Equipamiento minimo segun Decreto 28/2016',
    'Hojas de reclamaciones disponibles para los huespedes',
    'Registro de viajeros mediante SES.Hospedajes',
    'Numero estatal de alquiler de corta duracion desde julio de 2025',
    'Licencia de ocupacion o cedula de habitabilidad',
    'Limpieza del alojamiento a la entrada y salida de los huespedes',
    'Informacion turistica de la zona en un lugar visible',
  ],

  penalties: 'Andalucia es una de las CCAA con mas solicitudes denegadas del registro estatal en 2025-2026. El rango sancionador autonomico exacto aplicable a VFT: [VERIFICAR en fuente oficial].',

  touristTax: null,

  stateRegistryNote: 'Desde julio de 2025 es obligatorio el numero estatal de alquiler de corta duracion (RD 1312/2024) para publicar en plataformas. Andalucia esta entre las comunidades con mas denegaciones del registro estatal.',

  travelersRegistryNote: 'La obligacion de comunicacion de datos de viajeros del RD 933/2021 se canaliza por SES.Hospedajes del Ministerio del Interior.',

  keyChanges: [
    {
      title: 'Alta tasa de denegaciones del registro estatal',
      description: 'Andalucia aparece junto con Comunidad Valenciana, Cataluna y Canarias entre las CCAA con mas solicitudes denegadas del registro estatal de arrendamientos de corta duracion en 2025-2026.',
    },
    {
      title: 'Intensificacion de la actividad inspectora',
      description: 'La presion regulatoria ha aumentado significativamente, especialmente en Malaga, donde el discurso y control sobre cambios de uso y saturacion turistica se ha endurecido.',
    },
    {
      title: 'Presion en Malaga por restricciones de uso',
      description: 'Malaga es la ciudad andaluza con mayor presion normativa local sobre cambios de uso y saturacion turistica, aunque no existe una referencia municipal unica consolidada como en Barcelona o Valencia. [VERIFICAR]',
    },
  ],

  citiesCovered: ['Sevilla', 'Malaga', 'Granada', 'Cadiz', 'Marbella'],

  whyManualHelps: 'En Andalucia, el manual digital es clave por la diversidad de perfiles de huesped y la estacionalidad. En Sevilla y Granada, el aire acondicionado es critico y las instrucciones sobre calor, silencio y acceso peatonal al centro reducen incidencias. En Malaga, la mezcla de city break, crucerista, workation y playa requiere informacion muy segmentada. Un manual digital automatiza las respuestas a las preguntas mas frecuentes: parking, aeropuerto, restaurantes y horarios de monumentos.',

  keywords: [
    'normativa vivienda turistica andalucia',
    'decreto 28/2016 vivienda fines turisticos',
    'licencia piso turistico sevilla',
    'registro apartamento turistico malaga',
    'vivienda turistica granada',
    'multas piso turistico andalucia',
    'requisitos VFT andalucia 2026',
    'SES hospedajes andalucia',
    'manual digital huespedes sevilla',
    'airbnb legal malaga',
  ],
  metaTitle: 'Normativa Vivienda Turistica Andalucia | Itineramio',
  metaDescription: 'Normativa de vivienda turistica en Andalucia. Decreto 28/2016, registro, requisitos y sanciones para Sevilla, Malaga y Granada.',

  faqs: [
    {
      question: 'Que ley regula las viviendas turisticas en Andalucia?',
      answer: 'La referencia principal es el Decreto 28/2016, de 2 de febrero, de las viviendas con fines turisticos de Andalucia. Establece los requisitos de registro, equipamiento minimo, hojas de reclamaciones y obligaciones de informacion para operar legalmente.',
    },
    {
      question: 'Es obligatorio registrar viajeros en Andalucia?',
      answer: 'Si. El RD 933/2021 obliga a comunicar los datos de viajeros a traves de SES.Hospedajes del Ministerio del Interior. Este requisito se suma al registro autonomico y al nuevo numero estatal de alquiler de corta duracion vigente desde julio de 2025.',
    },
    {
      question: 'Hay tasa turistica en Andalucia?',
      answer: 'A fecha de 2026 no existe tasa turistica en Andalucia, a diferencia de Cataluna o Baleares. Esto supone una ventaja competitiva para los anfitriones andaluces.',
    },
    {
      question: 'Cuales son los meses mas rentables en Andalucia?',
      answer: 'Depende de la ciudad. En Sevilla y Granada, los meses mas rentables son abril y mayo (Semana Santa, Feria, primavera). En Malaga, la temporada alta es de abril a octubre. Julio y agosto penalizan en ciudades de interior por calor extremo.',
    },
    {
      question: 'Como ayuda un manual digital a cumplir la normativa?',
      answer: 'El manual digital de Itineramio permite incluir las normas de convivencia, horarios de silencio, instrucciones de check-in y toda la informacion que exige la normativa. Ademas, centraliza la comunicacion con el huesped y reduce incidencias con vecinos.',
    },
  ],
}

export default function AndaluciaPage() {
  return <NormativaPage data={data} />
}
