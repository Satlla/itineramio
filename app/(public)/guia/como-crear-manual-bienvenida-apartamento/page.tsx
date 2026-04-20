import Link from 'next/link'
import { ItineramioLogo } from '@/components/ui/ItineramioLogo'
import {
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  FileText,
  Smartphone,
  QrCode,
  Clock,
  Globe,
  BarChart3,
  AlertTriangle,
} from 'lucide-react'

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Como crear un manual de bienvenida para tu apartamento turistico',
  description: 'Tutorial completo para crear un manual de bienvenida profesional: que incluir, formato ideal y herramientas.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Define las secciones esenciales', text: 'Check-in, WiFi, electrodomesticos, normas, check-out, recomendaciones y emergencias.' },
    { '@type': 'HowToStep', position: 2, name: 'Organiza por zonas del apartamento', text: 'Entrada, cocina, bano, dormitorio, zona comun. El huesped busca por donde esta, no por tema.' },
    { '@type': 'HowToStep', position: 3, name: 'Anade fotos y videos', text: 'Una foto de donde esta el router vale mas que un parrafo explicandolo.' },
    { '@type': 'HowToStep', position: 4, name: 'Elige el formato digital correcto', text: 'Evita PDF. Usa formato web accesible desde movil sin instalar nada.' },
    { '@type': 'HowToStep', position: 5, name: 'Envia automaticamente con cada reserva', text: 'Configura el envio del link en tu mensaje de bienvenida programado.' },
  ],
}

const sections = [
  { name: 'Check-in', items: ['Direccion exacta con enlace a Google Maps', 'Como llegar desde aeropuerto/estacion', 'Codigo de acceso o instrucciones de llave', 'Video del recorrido puerta a puerta'], essential: true },
  { name: 'WiFi', items: ['Nombre de la red', 'Contrasena', 'Ubicacion del router', 'Que hacer si no funciona'], essential: true },
  { name: 'Cocina', items: ['Como funciona la vitroceramica/induccion', 'Donde estan los utensilios', 'Si el agua es potable', 'Donde estan las bolsas de basura'], essential: true },
  { name: 'Climatizacion', items: ['Como funciona el aire acondicionado', 'Donde esta el mando', 'Temperatura recomendada', 'Calefaccion en invierno'], essential: true },
  { name: 'Normas', items: ['Horarios de silencio', 'Normas de convivencia del edificio', 'Donde tirar la basura y reciclaje', 'Politica de mascotas y fumadores'], essential: true },
  { name: 'Check-out', items: ['Hora limite', 'Donde dejar las llaves', 'Lista de cosas a revisar', 'Consigna de maletas si necesitan'], essential: true },
  { name: 'Recomendaciones', items: ['Restaurantes cercanos', 'Supermercado mas proximo', 'Transporte publico', 'Planes y actividades'], essential: false },
  { name: 'Emergencias', items: ['Numero de contacto del anfitrion', 'Horario de atencion', 'Numeros de emergencia (112)', 'Ubicacion del botiquin'], essential: true },
]

const formats = [
  { name: 'PDF en Google Drive', pros: 'Gratis', cons: 'No se lee bien en movil, no se actualiza en tiempo real, el huesped tiene que descargarlo', verdict: 'No recomendado' },
  { name: 'Notion / Google Docs', pros: 'Gratis, facil de editar', cons: 'Aspecto poco profesional, sin QR, sin analytics, sin traduccion', verdict: 'Aceptable para empezar' },
  { name: 'Herramienta especializada', pros: 'QR por zona, IA, traduccion automatica, analytics, aspecto profesional', cons: 'Coste mensual (desde 9 EUR)', verdict: 'Recomendado para hosts profesionales' },
]

export default function ManualBienvenidaPage() {
  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />

      <nav className="border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2"><ItineramioLogo size="md" showText /></Link>
          <Link href="/register" className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800">Prueba gratis</Link>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 pt-6">
        <nav className="flex text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900 transition-colors">Inicio</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-gray-900">Guia</span>
        </nav>
      </div>

      <header className="mx-auto max-w-4xl px-6 pt-12 pb-12">
        <p className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-4">Guia practica</p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl leading-tight">
          Como crear un manual de bienvenida para tu apartamento
        </h1>
        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
          Un buen manual de bienvenida elimina el 80% de las preguntas de tus huespedes, protege
          tus resenas y te da tranquilidad. Lo malo es que hacerlo bien en Word o Notion lleva horas
          y el resultado no suele ser profesional. Esta guia te explica que incluir, como organizarlo
          y las herramientas para crearlo rapido.
        </p>
      </header>

      {/* What to include */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Que debe incluir tu manual</h2>
          <p className="text-gray-600 mb-8">Estas son las 8 secciones que todo manual profesional necesita. Las marcadas como esenciales no pueden faltar.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {sections.map((section) => (
              <div key={section.name} className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-gray-900">{section.name}</h3>
                  {section.essential && <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Esencial</span>}
                </div>
                <ul className="space-y-1.5">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Format comparison */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Que formato usar</h2>
        <p className="text-gray-600 mb-10">No todos los formatos funcionan igual. El huesped va a abrir tu manual en el movil, probablemente sin WiFi al principio.</p>
        <div className="space-y-4">
          {formats.map((format) => (
            <div key={format.name} className="rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{format.name}</h3>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-green-700">Ventaja</p>
                      <p className="text-sm text-gray-600">{format.pros}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-700">Inconveniente</p>
                      <p className="text-sm text-gray-600">{format.cons}</p>
                    </div>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium flex-shrink-0 ${
                  format.verdict === 'Recomendado para hosts profesionales' ? 'bg-green-100 text-green-700' :
                  format.verdict === 'Aceptable para empezar' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {format.verdict}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">5 pasos para crear tu manual</h2>
          <div className="space-y-12">
            <div className="flex gap-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">1</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Recopila toda la informacion</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">Recorre tu apartamento zona por zona y apunta todo lo que un huesped necesitaria saber: como se enciende cada aparato, donde esta cada cosa, que no es obvio. Haz fotos y videos cortos de los puntos clave.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">2</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Organiza por zonas, no por temas</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">El huesped piensa en donde esta, no en categorias. Cuando esta en la cocina quiere saber de la cocina. Cuando esta en la puerta quiere saber como entrar. Organiza la informacion por zonas del apartamento.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">3</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Escribe corto y claro</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">Nadie lee parrafos largos. Usa frases cortas, listas y negritas para lo importante. Una instruccion clara de 2 lineas vale mas que un parrafo de 10. Recuerda que tu huesped puede no hablar espanol.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">4</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Elige tu herramienta</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">Si empiezas con 1-2 pisos, Notion o Google Docs pueden servir. Si quieres algo profesional con QR por zona, traduccion automatica y creacion con IA, usa una herramienta especializada como Itineramio: introduces los datos y el manual se genera solo en minutos.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">5</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Automatiza el envio</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">Anade el link del manual a tu mensaje programado de bienvenida en Airbnb o Booking. Configuralo una vez y cada nuevo huesped lo recibe automaticamente antes de llegar. No dependas de acordarte de enviarlo manualmente.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-2xl bg-gray-900 px-8 py-14 text-center sm:px-16">
          <h2 className="text-3xl font-bold text-white">Crea tu manual en 10 minutos con IA</h2>
          <p className="mt-4 text-lg text-gray-300">
            En vez de pasar horas en Word o Notion, usa Itineramio. Introduces la direccion, el WiFi,
            los datos del check-in y subes videos de cada zona. La IA genera el manual completo,
            con QR por zona y traduccion automatica a 3 idiomas.
          </p>
          <ul className="mt-6 space-y-2 text-left max-w-md mx-auto">
            <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" /><span>Creacion con IA: introduces datos y se genera solo</span></li>
            <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" /><span>QR por zona: cocina, bano, entrada, WiFi</span></li>
            <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" /><span>Traduccion automatica a ingles, frances y aleman</span></li>
            <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" /><span>El huesped accede desde su movil, sin instalar nada</span></li>
          </ul>
          <p className="mt-6 text-sm text-gray-400">Prueba gratis 15 dias. Sin tarjeta de credito.</p>
          <div className="mt-8">
            <Link href="/register" className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3.5 text-base font-medium text-gray-900 transition-colors hover:bg-gray-100">
              Crear mi manual gratis <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2"><ItineramioLogo size="sm" showText /></Link>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/blog" className="hover:text-gray-900 transition-colors">Blog</Link>
              <Link href="/normativa" className="hover:text-gray-900 transition-colors">Normativa</Link>
              <Link href="/faq" className="hover:text-gray-900 transition-colors">FAQ</Link>
              <Link href="/legal/privacy" className="hover:text-gray-900 transition-colors">Privacidad</Link>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-gray-400">&copy; {new Date().getFullYear()} Itineramio. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
