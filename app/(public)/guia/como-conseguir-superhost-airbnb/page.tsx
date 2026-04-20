import Link from 'next/link'
import { ItineramioLogo } from '@/components/ui/ItineramioLogo'
import {
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Star,
  Clock,
  MessageSquare,
  TrendingUp,
  Target,
  AlertTriangle,
} from 'lucide-react'

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Como conseguir Superhost en Airbnb',
  description: 'Requisitos y estrategias practicas para obtener y mantener el badge Superhost en Airbnb en 2026.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Cumple los 4 requisitos basicos', text: 'Valoracion de 4.8+, tasa de respuesta 90%+, 0 cancelaciones y minimo 10 estancias o 100 noches al ano.' },
    { '@type': 'HowToStep', position: 2, name: 'Optimiza la experiencia de llegada', text: 'El check-in es el momento critico. Un huesped que llega sin problemas pone 5 estrellas. Uno que se pierde pone 4.' },
    { '@type': 'HowToStep', position: 3, name: 'Responde en menos de 1 hora', text: 'La velocidad de respuesta es un requisito y tambien un factor de posicionamiento en el algoritmo de Airbnb.' },
    { '@type': 'HowToStep', position: 4, name: 'Previene problemas antes de que ocurran', text: 'Anticipa las preguntas frecuentes con un manual digital. Un huesped informado no tiene motivos para bajar la nota.' },
    { '@type': 'HowToStep', position: 5, name: 'Gestiona las resenas activamente', text: 'Responde todas las resenas, incluso las negativas. Pide feedback antes del check-out para resolver problemas a tiempo.' },
  ],
}

const requirements = [
  { icon: Star, name: 'Valoracion media de 4.8+', description: 'Sobre 5 estrellas, calculada en los ultimos 365 dias', critical: true },
  { icon: MessageSquare, name: 'Tasa de respuesta del 90%+', description: 'Responder al menos el 90% de los mensajes nuevos', critical: true },
  { icon: Target, name: '0 cancelaciones por tu parte', description: 'No puedes cancelar ninguna reserva confirmada', critical: true },
  { icon: TrendingUp, name: '10+ estancias o 100+ noches', description: 'Minimo de actividad en los ultimos 12 meses', critical: false },
]

export default function SuperhostPage() {
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
          Como conseguir Superhost en Airbnb
        </h1>
        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
          El badge Superhost no es solo un icono bonito: aumenta tu visibilidad en las busquedas,
          genera mas confianza y te permite cobrar mas. Airbnb evalua cada trimestre si cumples los
          requisitos. Esta guia te explica como conseguirlo y, mas importante, como no perderlo.
        </p>
      </header>

      {/* Requirements */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Los 4 requisitos de Superhost</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {requirements.map((req) => (
              <div key={req.name} className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 flex-shrink-0">
                    <req.icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{req.name}</p>
                    <p className="mt-1 text-sm text-gray-600">{req.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                <strong>El mas dificil:</strong> mantener la valoracion de 4.8+. Una sola resena de 3 estrellas
                puede bajarte la media. La clave no es pedir 5 estrellas, sino evitar las 4 estrellas que vienen
                por falta de informacion o problemas evitables.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Strategies */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">5 estrategias que funcionan</h2>
        <div className="space-y-12">
          <div className="flex gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">1</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">El check-in es el momento critico</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">El 70% de las resenas de 4 estrellas se originan en los primeros 30 minutos de la estancia. Un huesped que no encuentra la entrada, no sabe el WiFi o no entiende la cerradura ya tiene una impresion negativa. Resuelve esto con instrucciones claras, visuales y en su idioma antes de que llegue.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">2</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Responde siempre en menos de 1 hora</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">La tasa de respuesta es un requisito (90%+), pero la velocidad es lo que marca la diferencia. Cada hora sin responder un mensaje aumenta un 16% la probabilidad de perder esa reserva. Configura respuestas rapidas y notificaciones.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">3</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Anticipa los problemas con un manual digital</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">Un huesped confundido deja 4 estrellas. Un huesped informado deja 5. Si el huesped sabe como funciona la vitroceramica, donde esta el secador y como va el aire acondicionado antes de preguntar, no tiene motivos para bajar la nota. Un manual digital con toda esta informacion es la forma mas efectiva de proteger tu puntuacion.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">4</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Usa avisos preventivos</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">Si hay obras en la calle, si el internet es variable ese dia, si hay normas especiales del edificio: avisalo antes de que el huesped llegue. Un aviso preventivo convierte un problema en una muestra de transparencia. Sin aviso, es una sorpresa negativa.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">5</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Pide feedback antes del check-out</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">Envia un mensaje el ultimo dia preguntando si todo ha ido bien. Si hay un problema, lo puedes resolver antes de que se convierta en una mala resena. Un &quot;muchas gracias por avisar, lo arreglo ahora&quot; puede salvar una resena de 5 estrellas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-12 pb-20">
        <div className="rounded-2xl bg-gray-900 px-8 py-14 text-center sm:px-16">
          <h2 className="text-3xl font-bold text-white">Protege tu Superhost con un manual digital</h2>
          <p className="mt-4 text-lg text-gray-300">
            Itineramio crea un manual digital que anticipa las preguntas del huesped, incluye avisos
            preventivos y traduce todo automaticamente a su idioma. Menos sorpresas, menos 4 estrellas, mas Superhost.
          </p>
          <p className="mt-4 text-sm text-gray-400">Prueba gratis 15 dias. Sin tarjeta de credito.</p>
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
