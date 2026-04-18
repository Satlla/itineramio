import NormativaPage from '@/components/landing/NormativaPage'
import type { NormativaData } from '@/components/landing/NormativaPage'

const data: NormativaData = {
  ccaa: 'Comunitat Valenciana',
  slug: 'comunitat-valenciana',
  heroSubtitle: 'La Comunitat Valenciana ha endurecido significativamente la regulacion de viviendas turisticas con el Decreto-ley 9/2024, que introduce un limite de 10 dias continuados por arrendatario. Ademas, exige informe de compatibilidad urbanistica municipal, registro telematico y exhibicion del numero de registro. Conoce todos los requisitos para operar legalmente en Valencia, Alicante y el resto de la comunidad.',

  mainLaws: [
    {
      name: 'Ley 15/2018, de 7 de junio',
      description: 'Ley de turismo, ocio y hospitalidad de la Comunitat Valenciana. Establece el marco general del sector turistico y las obligaciones de los alojamientos.',
    },
    {
      name: 'Decreto 10/2021, de 22 de enero',
      description: 'Regula las viviendas de uso turistico en la Comunitat Valenciana: requisitos de registro, equipamiento, seguro de responsabilidad civil y obligaciones de informacion.',
    },
    {
      name: 'Decreto-ley 9/2024, de 2 de agosto',
      description: 'Endurece el regimen de viviendas de uso turistico. Introduce el limite de 10 dias continuados a un mismo arrendatario como definicion de VUT y refuerza las sanciones.',
    },
  ],

  registrationType: 'Tramitacion 100% telematica ante el Registro de Turismo de la Comunitat Valenciana',

  registrationSteps: [
    'Solicitar informe favorable de compatibilidad urbanistica al ayuntamiento correspondiente',
    'Obtener licencia de ocupacion o cedula de habitabilidad de la vivienda',
    'Verificar la referencia catastral unica del inmueble',
    'Contratar seguro de responsabilidad civil',
    'Realizar la tramitacion telematica de alta en el Registro de Turismo',
    'Obtener e instalar el distintivo obligatorio visible',
    'Incluir el numero de registro en toda publicidad y anuncios',
  ],

  requirements: [
    'Cesion de la vivienda entera, nunca por habitaciones',
    'Licencia de ocupacion o cedula de habitabilidad en vigor',
    'Referencia catastral unica del inmueble',
    'Seguro de responsabilidad civil',
    'Informe favorable de compatibilidad urbanistica municipal',
    'Distintivo visible en el exterior de la vivienda',
    'Publicidad obligatoria del numero de registro en todos los anuncios',
    'Cesion maxima de 10 dias continuados a un mismo arrendatario',
    'Registro de viajeros mediante SES.Hospedajes',
    'Numero estatal de alquiler de corta duracion desde julio de 2025',
  ],

  penalties: 'Hasta 10.000 EUR para infracciones leves, de 10.001 a 100.000 EUR para graves, y de 100.001 a 600.000 EUR para muy graves. Ejercer sin comunicar el inicio de actividad o sin habilitacion se considera infraccion muy grave.',

  touristTax: null,

  stateRegistryNote: 'Desde julio de 2025 es obligatorio el numero estatal de alquiler de corta duracion (RD 1312/2024) para publicar en plataformas. Este requisito se suma a la habilitacion autonomica y no la sustituye.',

  travelersRegistryNote: 'La obligacion de comunicacion de datos de viajeros del RD 933/2021 se canaliza por SES.Hospedajes del Ministerio del Interior.',

  keyChanges: [
    {
      title: 'Limite de 10 dias continuados',
      description: 'El Decreto-ley 9/2024 establece que solo se conceptuan como VUT los inmuebles cedidos por un tiempo igual o inferior a 10 dias continuados a un mismo arrendatario. Es uno de los cambios mas restrictivos del panorama nacional.',
    },
    {
      title: 'Moratoria municipal parcialmente anulada',
      description: 'El TSJCV anulo parcialmente la moratoria del Ayuntamiento de Valencia sobre licencias de cambio de uso, aunque mantuvo validada la suspension en licencias de edificacion.',
    },
    {
      title: 'Comunidades de propietarios',
      description: 'Si la comunidad de propietarios tenia estatutos inscritos limitando el uso turistico antes del alta, puede dar lugar a expediente de cancelacion o baja de la vivienda turistica.',
    },
    {
      title: 'Mas de 101.200 VUT registradas',
      description: 'El Registro de Turismo contaba con mas de 101.200 viviendas a diciembre de 2024 en toda la comunidad, antes del proceso de depuracion en curso.',
    },
  ],

  citiesCovered: ['Valencia', 'Alicante', 'Benidorm', 'Torrevieja'],

  whyManualHelps: 'La Comunitat Valenciana combina turismo urbano y de playa, lo que genera muchas preguntas de los huespedes sobre distancias, transporte y logistica. En Valencia el huesped quiere saber como llegar a la playa desde el centro; en Alicante, si necesita coche. Un manual digital reduce drasticamente estas consultas repetitivas y mejora la experiencia, especialmente con huespedes internacionales gracias a la traduccion automatica a su idioma.',

  keywords: [
    'normativa vivienda turistica valencia',
    'licencia vivienda turistica alicante',
    'limite 10 dias alquiler turistico valencia',
    'informe compatibilidad urbanistica VUT',
    'registro turismo comunitat valenciana',
    'requisitos vivienda turistica valencia 2026',
    'multas piso turistico valencia',
    'SES hospedajes valencia',
    'decreto 10/2021 comunitat valenciana',
    'manual digital huespedes valencia',
  ],
  metaTitle: 'Normativa Vivienda Turistica Valencia | Itineramio',
  metaDescription: 'Normativa de vivienda turistica en la Comunitat Valenciana. Ley 15/2018, limite 10 dias, requisitos y sanciones.',

  faqs: [
    {
      question: 'Que es el limite de 10 dias en la Comunitat Valenciana?',
      answer: 'El Decreto-ley 9/2024 establece que se consideran viviendas de uso turistico los inmuebles cedidos por un tiempo igual o inferior a 10 dias continuados a un mismo arrendatario. Alquileres mas largos al mismo inquilino se regulan por otra normativa. Es uno de los limites mas restrictivos de Espana.',
    },
    {
      question: 'Que es el informe de compatibilidad urbanistica?',
      answer: 'Es un informe que debe emitir el ayuntamiento correspondiente confirmando que el inmueble es compatible con el uso de vivienda turistica segun el planeamiento urbanistico municipal. Sin este informe favorable no se puede dar de alta la vivienda en el Registro de Turismo.',
    },
    {
      question: 'Cuanto cuestan las multas por operar sin licencia?',
      answer: 'Las sanciones van desde 10.000 EUR para infracciones leves hasta 600.000 EUR para muy graves. Ejercer la actividad sin comunicar el inicio o sin habilitacion se califica como infraccion muy grave.',
    },
    {
      question: 'Hay tasa turistica en la Comunitat Valenciana?',
      answer: 'A fecha de 2026 no existe tasa turistica autonomica en vigor en la Comunitat Valenciana, a diferencia de Cataluna o Baleares.',
    },
    {
      question: 'Puede mi comunidad de propietarios impedir el uso turistico?',
      answer: 'Si. Si la comunidad de propietarios aprobo estatutos que limitan el uso turistico e inscribio dicho acuerdo en el Registro de la Propiedad antes del alta de la vivienda turistica, puede dar lugar a un expediente de cancelacion o baja.',
    },
  ],
}

export default function ComunitatValencianaPage() {
  return <NormativaPage data={data} />
}
