import CityLandingPage from '@/components/landing/CityLandingPage'
import type { CityData } from '@/components/landing/CityLandingPage'

const granadaData: CityData = {
  city: 'Granada',
  region: 'Andalucia',
  heroSubtitle: 'Granada combina el encanto del Albaicin con la demanda constante de la Alhambra. Crea un manual digital que guie a tus huespedes por calles estrechas, cuestas y accesos complejos.',

  listings: '4.647',
  occupancy: '56%',
  adr: '122,2$',
  revpar: '65,7$',

  mainLaw: 'Decreto 28/2016 de viviendas con fines turisticos de Andalucia',
  registrationType: 'Registro en el Registro de Turismo de Andalucia (RTA)',
  keyRequirements: [
    'Inscripcion en el Registro de Turismo de Andalucia (RTA)',
    'Licencia de ocupacion o cedula de habitabilidad',
    'Cumplir requisitos de equipamiento y habitabilidad',
    'Facilitar hojas de reclamaciones',
    'Exhibir placa identificativa normalizada',
    'Registro de viajeros ante la Policia Nacional',
    'Informar a la comunidad de propietarios',
  ],
  penalties: 'Hasta 150.000€ por infracciones muy graves segun normativa andaluza',
  touristTax: null,

  topZones: [
    { name: 'Centro - Catedral', reason: 'Maxima demanda turistica, junto a la Catedral y la zona comercial. Alta ocupacion y buena tarifa media. Acceso facil.' },
    { name: 'Realejo', reason: 'Barrio historico junto a la Alhambra con ambiente local. Buena relacion calidad-precio para el anfitrion. Menos saturado.' },
    { name: 'Albaicin', reason: 'Patrimonio de la Humanidad con vistas a la Alhambra. ADR premium pero acceso complejo: calles estrechas, cuestas, sin parking.' },
    { name: 'Camino de Ronda', reason: 'Zona universitaria y residencial bien conectada. Perfil joven, estudiantes y estancias medias. Precios moderados.' },
    { name: 'Zaidin', reason: 'Barrio residencial con buena conectividad. Menor demanda turistica pero costes bajos. Ideal para estancias largas.' },
  ],

  highSeason: 'Marzo a Abril (Semana Santa), Octubre y puentes festivos',
  lowSeason: 'Julio y Agosto (calor extremo, temperaturas superiores a 35 grados)',
  keyEvents: [
    'Semana Santa de Granada',
    'Festival de Musica y Danza (junio-julio)',
    'Corpus Christi y Feria del Corpus',
    'Dia de la Toma (2 de enero)',
    'Temporada de esqui en Sierra Nevada (diciembre-abril)',
  ],

  guestQuestions: [
    'Como llego a la Alhambra desde el apartamento?',
    'Donde puedo aparcar en Granada?',
    'Como subo al Albaicin con maletas?',
    'Es posible ir a Sierra Nevada desde Granada?',
    'Donde puedo ver flamenco autentico?',
    'Que restaurantes recomiendas en el centro?',
    'Como funciona el minibus del Albaicin?',
    'Cual es la contrasena del WiFi?',
  ],
  whyManualHelps: 'Granada tiene un casco historico con calles estrechas, pendientes pronunciadas y accesos complejos, especialmente en el Albaicin. Los huespedes llegan con maletas sin saber como acceder al alojamiento, donde dejar el coche o como subir las cuestas. Un manual digital con instrucciones visuales de llegada, alternativas de parking y consejos para la Alhambra resuelve estas consultas criticas y evita las llamadas de panico al llegar.',

  keywords: [
    'manual digital apartamento turistico granada',
    'vivienda turistica granada',
    'alquiler vacacional granada normativa',
    'decreto 28/2016 andalucia',
    'airbnb granada albaicin',
    'gestion huesped granada',
    'alhambra apartamento turistico',
  ],
  metaTitle: 'Manual Digital Apartamento Turistico Granada | Itineramio',
  metaDescription: 'Manual digital para alquiler turistico en Granada. Albaicin, Alhambra, normativa. Prueba gratis 15 dias.',

  faqs: [
    {
      question: 'Que normativa regula las viviendas turisticas en Granada?',
      answer: 'Las viviendas con fines turisticos en Granada se regulan por el Decreto 28/2016 de Andalucia. Es necesario inscribirse en el Registro de Turismo de Andalucia (RTA) antes de iniciar la actividad. Los requisitos incluyen licencia de ocupacion, equipamiento minimo y placa identificativa.',
    },
    {
      question: 'Hay tasa turistica en Granada?',
      answer: 'No. A fecha de 2026, Andalucia no ha implementado una tasa turistica. Esto supone una ventaja frente a destinos como Barcelona, Baleares o Valencia que si la aplican.',
    },
    {
      question: 'Como gestionar un alojamiento turistico en el Albaicin?',
      answer: 'El Albaicin presenta retos unicos: calles estrechas sin acceso para vehiculos, cuestas pronunciadas y accesos complejos. Un manual digital es especialmente util aqui para incluir instrucciones detalladas de llegada, punto exacto de descarga de maletas, parking mas cercano y como usar el minibus C31/C32 que sube al barrio.',
    },
    {
      question: 'Cuando es mejor temporada para alquilar en Granada?',
      answer: 'La temporada alta en Granada es atipica: marzo-abril (Semana Santa), octubre y puentes festivos son los meses de mayor demanda. Julio y agosto son temporada baja por el calor extremo (mas de 35 grados). La temporada de esqui en Sierra Nevada (diciembre-abril) tambien genera demanda adicional.',
    },
  ],
}

export default function GranadaPage() {
  return <CityLandingPage data={granadaData} />
}
