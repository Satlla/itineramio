import Link from 'next/link'
import { ItineramioLogo } from '@/components/ui/ItineramioLogo'
import {
  Clock,
  MessageSquare,
  Wifi,
  Key,
  Thermometer,
  MapPin,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
} from 'lucide-react'

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Como reducir llamadas y mensajes repetitivos de huespedes',
  description: 'Guia paso a paso para eliminar las preguntas repetitivas de tus huespedes en alquileres vacacionales y ganar horas libres cada semana.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Identifica las 10 preguntas que mas recibes',
      text: 'Revisa tus ultimos 50 mensajes de huespedes y anota las preguntas que se repiten. Las mas comunes son WiFi, check-in, check-out, parking, restaurantes y electrodomesticos.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Crea un documento con todas las respuestas',
      text: 'Escribe respuestas claras y concisas para cada pregunta. Incluye fotos cuando sea posible (ubicacion del router, cerradura, vitroceramica).',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Organiza la informacion por zonas del apartamento',
      text: 'Agrupa la informacion por areas: entrada/check-in, cocina, bano, dormitorio, zona comun. El huesped busca informacion por contexto, no por tema.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Digitaliza la guia en un formato accesible',
      text: 'Convierte el documento en una guia digital accesible desde el movil del huesped. Un PDF no funciona bien en movil. Una guia web con QR es la opcion mas efectiva.',
    },
    {
      '@type': 'HowToStep',
      position: 5,
      name: 'Envia la guia ANTES de que llegue el huesped',
      text: 'No esperes a que pregunte. Envia el link de la guia automaticamente cuando se confirme la reserva. El huesped que llega informado no necesita llamarte.',
    },
    {
      '@type': 'HowToStep',
      position: 6,
      name: 'Coloca QR fisicos en zonas clave del apartamento',
      text: 'Pon codigos QR en la cocina, junto al router WiFi, en la entrada y en el bano. El huesped escanea y obtiene la informacion exacta de esa zona.',
    },
    {
      '@type': 'HowToStep',
      position: 7,
      name: 'Mide y ajusta cada mes',
      text: 'Revisa que preguntas siguen llegando a pesar de la guia. Anade esa informacion. Con el tiempo, las llamadas se reducen drasticamente.',
    },
  ],
}

const topQuestions = [
  { icon: Wifi, question: 'Cual es la contrasena del WiFi?', frequency: 'En casi todas las estancias' },
  { icon: Key, question: 'Como entro al apartamento?', frequency: 'Cada check-in' },
  { icon: Clock, question: 'A que hora es el check-out?', frequency: 'El ultimo dia' },
  { icon: Thermometer, question: 'Como funciona el aire acondicionado?', frequency: 'En verano, cada estancia' },
  { icon: MapPin, question: 'Donde hay un supermercado cerca?', frequency: 'El primer dia' },
  { icon: MessageSquare, question: 'Donde puedo aparcar?', frequency: 'Si no tienen parking incluido' },
]

export default function GuiaReducirLlamadasPage() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-gray-900">
            Itineramio
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Prueba gratis
          </Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-4xl px-6 pt-6">
        <nav className="flex text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900 transition-colors">Inicio</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-gray-900">Guia</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="mx-auto max-w-4xl px-6 pt-12 pb-12">
        <p className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-4">
          Guia practica
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl leading-tight">
          Como reducir llamadas y mensajes de huespedes
        </h1>
        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
          Si gestionas varios apartamentos turisticos, sabes lo que es: el movil no para.
          La misma contrasena del WiFi, las mismas instrucciones de check-in, los mismos
          restaurantes. Cada semana, las mismas preguntas. Esta guia te explica como
          eliminar el 80% de esos mensajes.
        </p>
      </header>

      {/* The Problem */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            El problema que conoces bien
          </h2>
          <p className="text-gray-600 mb-8">
            Hemos analizado las conversaciones reales de chatbot de mas de 500 anfitriones.
            Estas son las preguntas que mas se repiten:
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {topQuestions.map((item) => (
              <div key={item.question} className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 flex-shrink-0">
                  <item.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.question}</p>
                  <p className="mt-1 text-sm text-gray-500">{item.frequency}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-900">El coste real de no resolver esto</p>
                <p className="mt-1 text-sm text-amber-800">
                  Un anfitrion con 6-10 apartamentos dedica entre 12 y 18 horas semanales a gestion manual.
                  Con automatizacion, eso baja a 2-3 horas. La diferencia son 10-15 horas libres cada semana.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">
          7 pasos para eliminar las preguntas repetitivas
        </h2>

        <div className="space-y-12">
          {/* Step 1 */}
          <div className="flex gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">1</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Identifica las 10 preguntas que mas recibes</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Abre tu bandeja de Airbnb o WhatsApp y revisa los ultimos 50 mensajes de huespedes.
                Anota las preguntas que aparecen mas de 3 veces. Te sorprendera lo repetitivas que son.
                En nuestra experiencia, el 80% de los mensajes se concentran en 6-8 temas.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">2</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Escribe respuestas claras para cada una</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Para cada pregunta, escribe una respuesta breve, clara y que no deje dudas.
                Incluye fotos o videos cuando sea posible: la ubicacion del router, como funciona
                la cerradura, donde estan los cubos de basura. Una imagen resuelve mas que un parrafo.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">3</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Organiza por zonas, no por temas</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                El huesped no piensa en categorias. Piensa en donde esta: &quot;estoy en la cocina, como
                va la vitroceramica?&quot;, &quot;estoy en la puerta, como entro?&quot;. Agrupa la informacion por
                zonas del apartamento: entrada, cocina, bano, dormitorio, zona comun. Es mucho mas
                intuitivo que un PDF de 10 paginas.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">4</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Digitaliza la guia en formato movil</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Un PDF en Google Drive no funciona. El huesped no lo descarga, no lo lee en movil,
                y no puede buscar nada. Necesitas un formato web accesible desde cualquier movil,
                sin instalar nada, que se abra con un link o un QR.
              </p>
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-sm text-gray-600">
                  <strong>Opciones:</strong> Puedes hacerlo con Notion (gratis pero limitado),
                  con una web propia (requiere desarrollo), o con una herramienta especializada
                  como Itineramio que genera la guia con IA y anade QR por zona automaticamente.
                </p>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">5</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Envia la guia ANTES de la llegada</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Este es el paso mas importante. No esperes a que el huesped pregunte. Enviale el
                link de la guia automaticamente cuando se confirme la reserva, o al menos 24h antes
                del check-in. El huesped que llega informado no necesita llamarte. El que llega
                sin saber nada te va a escribir al minuto.
              </p>
              <p className="mt-3 text-gray-600 leading-relaxed">
                En Airbnb puedes anadir el link a tu mensaje programado de bienvenida. En Booking,
                al mensaje de confirmacion. Configuralo una vez y funciona con cada reserva.
              </p>
            </div>
          </div>

          {/* Step 6 */}
          <div className="flex gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">6</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Coloca QR fisicos en zonas clave</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Pon un QR junto al router WiFi, en la cocina, en la entrada y en el bano.
                Cuando el huesped no encuentre algo, escanea el QR mas cercano y obtiene la
                informacion exacta de esa zona. Es mas rapido que buscarte en WhatsApp.
              </p>
            </div>
          </div>

          {/* Step 7 */}
          <div className="flex gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">7</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Mide y ajusta cada mes</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Revisa que preguntas siguen llegando a pesar de la guia. Si alguien pregunta
                por el secador, es que no esta claro donde esta en la guia. Anadelo.
                Con el tiempo, las llamadas se reducen drasticamente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Resultados esperados
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
              <div className="flex justify-center mb-3">
                <BarChart3 className="h-8 w-8 text-gray-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">-70%</p>
              <p className="mt-2 text-sm text-gray-500">Menos mensajes repetitivos</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
              <div className="flex justify-center mb-3">
                <Clock className="h-8 w-8 text-gray-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">10-15h</p>
              <p className="mt-2 text-sm text-gray-500">Horas libres por semana</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
              <div className="flex justify-center mb-3">
                <CheckCircle2 className="h-8 w-8 text-gray-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">+0.3</p>
              <p className="mt-2 text-sm text-gray-500">Puntos en resenas de media</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-2xl bg-gray-900 px-8 py-14 text-center sm:px-16">
          <h2 className="text-3xl font-bold text-white">
            Hazlo en 10 minutos con Itineramio
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            En vez de crear la guia en Word o Notion, usa Itineramio: introduces la direccion
            y los datos del apartamento, la IA genera el manual completo, con QR por zona
            y traduccion automatica a 3 idiomas.
          </p>
          <ul className="mt-6 space-y-2 text-left max-w-md mx-auto">
            <li className="flex items-center gap-3 text-gray-300">
              <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
              <span>Creacion con IA en minutos, no en horas</span>
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
              <span>QR por zona generados automaticamente</span>
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
              <span>Traduccion automatica a 3 idiomas</span>
            </li>
            <li className="flex items-center gap-3 text-gray-300">
              <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
              <span>El huesped lo ve antes de llegar, sin instalar nada</span>
            </li>
          </ul>
          <p className="mt-6 text-sm text-gray-400">
            Prueba gratis 15 dias. Sin tarjeta de credito.
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3.5 text-base font-medium text-gray-900 transition-colors hover:bg-gray-100"
            >
              Crear mi manual gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="text-lg font-semibold text-gray-900">
              Itineramio
            </Link>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/blog" className="hover:text-gray-900 transition-colors">Blog</Link>
              <Link href="/normativa" className="hover:text-gray-900 transition-colors">Normativa</Link>
              <Link href="/faq" className="hover:text-gray-900 transition-colors">FAQ</Link>
              <Link href="/legal/privacy" className="hover:text-gray-900 transition-colors">Privacidad</Link>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Itineramio. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
