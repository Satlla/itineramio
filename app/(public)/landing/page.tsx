import { Metadata } from 'next'
import Link from 'next/link'
import {
  Check,
  X,
  ArrowRight,
  Wifi,
  Star,
  MessageCircle,
  QrCode,
  Clock,
  Globe,
  Zap,
  Shield,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import { Navbar } from '../../../src/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'Itineramio — Tu guía de apartamento que trabaja sola',
  description:
    'Crea una guía una vez. Configura el enlace en tu mensaje automático. El huésped llega sabiendo cómo entrar, dónde aparcar y cuál es el WiFi. Tú dejas de repetir.',
  alternates: {
    canonical: 'https://www.itineramio.com/landing',
  },
}

const stats = [
  {
    stat: '86%',
    text: 'de las preguntas de huéspedes se repiten en cada reserva.',
    body: 'WiFi. Acceso. Normas. Parking. Checkout. Siempre las mismas. La diferencia es si las contestas tú cada vez o si llegan resueltas antes de que el huésped aparezca.',
  },
  {
    stat: '4,8★',
    text: 'Superhost exige un 4,8 o más. Booking.com pesa las reseñas recientes.',
    body: 'No es una opinión. Es cómo funcionan las plataformas. Una reseña de 4 estrellas por confusión en el check-in baja tu media y tu posición.',
  },
  {
    stat: '✗',
    text: 'Los huéspedes no leen mensajes largos.',
    body: 'Airbnb permite mensajes automáticos. Booking.com tiene plantillas. Pero si el mensaje es largo, no se lee. No es un problema de canal. Es un problema de formato.',
  },
  {
    stat: '1er min',
    text: 'Un check-in que empieza con confusión rara vez termina en 5 estrellas.',
    body: 'No hace falta que algo salga muy mal. Basta con que el huésped llegue sin saber cómo entrar, dónde aparcar o cuáles son las normas. Ese primer momento marca la reseña.',
  },
  {
    stat: '93,9%',
    text: 'de los usuarios de móvil en España usa WhatsApp.',
    body: 'Tus huéspedes van a escribirte por ahí. La pregunta no es si te van a contactar. Es si van a tener la información antes de necesitar hacerlo.',
  },
]

const before = [
  'Envías el WiFi a cada huésped manualmente',
  'Copias y pegas las instrucciones de acceso cada reserva',
  'Recibes el "no podemos entrar" a las 22:00',
  'El huésped llega sin haber leído nada',
  'Contestas las mismas preguntas en tres idiomas',
  'La reseña de 4 estrellas llega sin aviso',
]

const after = [
  'Configuras una vez el enlace de tu guía en el mensaje automático',
  'El huésped llega sabiendo cómo entrar, aparcar y conectarse',
  'Las dudas las resuelve el chatbot en su idioma',
  'Tú no repites nada',
  'Menos llamadas tensas, menos mensajes nocturnos',
  'El check-in empieza bien y la reseña lo nota',
]

const alternatives = [
  {
    icon: <MessageCircle className="w-5 h-5 text-gray-400" />,
    title: 'Copiar y pegar en WhatsApp o Airbnb',
    body: 'El huésped recibe un mensaje largo entre otros veinte. No lo lee. Tú acabas repitiéndolo igual. El problema no es el canal. Es que un mensaje largo compite con todo lo demás en su bandeja.',
  },
  {
    icon: <Shield className="w-5 h-5 text-gray-400" />,
    title: 'Un PDF con las instrucciones',
    body: 'Nadie abre un PDF en el móvil. Y si lo abren, no encuentran lo que buscan porque está todo junto. Sin zonas. Sin estructura. Sin chatbot que resuelva dudas.',
  },
  {
    icon: <Globe className="w-5 h-5 text-gray-400" />,
    title: 'La guía integrada de Airbnb',
    body: 'Funciona para un piso. No para ocho. No se traduce sola. No tiene chatbot. Y no cubre Booking.com.',
  },
  {
    icon: <AlertTriangle className="w-5 h-5 text-gray-400" />,
    title: 'No hacer nada y "ya va bien"',
    body: 'Va bien hasta que no va. Un check-in mal, una reseña de 4 estrellas, y la posición baja. A partir de 6 pisos, "ya va bien" es una apuesta que se paga con la nota.',
  },
]

const faqs = [
  {
    q: '¿Y si el huésped no abre la guía?',
    a: 'La guía se envía antes de llegar, no dentro del piso. La tasa de apertura es mucho mayor cuando la reciben con la confirmación de reserva. Y dentro del apartamento, el QR está disponible como refuerzo.',
  },
  {
    q: '¿Es otro sistema que tengo que aprender?',
    a: 'Empieza con tres secciones: entrada, WiFi y normas. En 10 minutos tienes la primera guía lista. Luego vas añadiendo si quieres.',
  },
  {
    q: '¿El huésped necesita descargar una app?',
    a: 'No. Se abre en el navegador del móvil. Sin descarga. Sin registro.',
  },
  {
    q: '¿Y si el huésped habla otro idioma?',
    a: 'La guía está disponible en español, inglés y francés. El chatbot detecta el idioma del huésped y responde en el suyo automáticamente.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -ml-48 -mb-48" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              Hecho para anfitriones con 6–10 propiedades en España
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Los huéspedes no leen.<br />Pero llegan preguntando lo mismo.
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              Crea una guía una vez. Configura el enlace en tu mensaje automático de Airbnb o Booking. El huésped llega sabiendo cómo entrar, dónde aparcar y cuál es el WiFi. Tú dejas de repetir.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-violet-600 font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all text-lg"
              >
                Empieza gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/70">No necesitas tarjeta. Configúralo en 10 minutos.</p>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-10">Esto ya te suena</h2>
          <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
            <p>
              Llevas semanas enviando la misma clave de WiFi. El mismo mensaje de acceso. Las mismas normas. Cambia el nombre del huésped y repite.
            </p>
            <p>
              De vez en cuando llega el mensaje que no quieres ver:{' '}
              <span className="font-semibold text-gray-900">"No podemos entrar."</span>{' '}
              Suele ser a las 22:00. O mientras cenas. O cuando estás atendiendo otro check-in.
            </p>
            <p>
              Después viene la reseña. Cuatro estrellas. Sin explicación clara. Pero tú sabes exactamente por qué: llegaron confundidos.
            </p>
            <p>
              Con dos o tres pisos se puede tirar. Con seis, siete u ocho, el móvil manda más que tú. Y no es el trabajo lo que quema.{' '}
              <span className="font-semibold text-gray-900">Es la repetición.</span>
            </p>
          </div>
        </div>
      </section>

      {/* THE SHIFT */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-10">
            ¿Y si el huésped llegara sabiendo cómo entrar?
          </h2>
          <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
            <p>No hablamos de mandar otro mensaje largo que nadie lee. Ni de un PDF que se pierde en la bandeja.</p>
            <p>
              Hablamos de una guía corta, clara, organizada por zonas — entrada, WiFi, normas, parking, lo útil del barrio — con un enlace que el huésped recibe cuando se confirma la reserva.
            </p>
            <p>
              Antes de llegar, ya sabe cómo entrar. Ya tiene el WiFi. Ya conoce las normas. Y si tiene alguna duda, un chatbot le responde en su idioma usando la información de tu propio apartamento.
            </p>
            <p className="font-semibold text-gray-900 text-xl">Tú configuras una vez. La guía hace el resto.</p>
          </div>
        </div>
      </section>

      {/* STATS CARDS */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <span className="text-5xl font-bold text-violet-600 block mb-4">{s.stat}</span>
                <p className="font-bold text-gray-900 text-base mb-3">{s.text}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Tres pasos. Diez minutos.</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Sin curvas de aprendizaje. Sin onboarding interminable.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
            {[
              {
                icon: <QrCode className="w-8 h-8 text-violet-600" />,
                step: '01',
                title: 'Crea tu guía',
                body: 'Acceso, WiFi, normas, parking y lo que necesiten. Organizado por zonas. Sin textos largos. Empieza solo con lo básico.',
              },
              {
                icon: <MessageCircle className="w-8 h-8 text-violet-600" />,
                step: '02',
                title: 'Configura el enlace',
                body: 'Añade el enlace de tu guía al mensaje automático de Airbnb o Booking. Se envía solo en cada reserva sin que toques nada.',
              },
              {
                icon: <Star className="w-8 h-8 text-violet-600" />,
                step: '03',
                title: 'El huésped llega ubicado',
                body: 'Sabe cómo entrar. Tiene el WiFi. Conoce las normas. Y si pregunta algo, el chatbot le responde en su idioma.',
              },
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-shadow relative">
                <span className="absolute top-6 right-6 text-5xl font-black text-gray-100">{step.step}</span>
                <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 hover:shadow-xl hover:scale-105 transition-all text-lg"
            >
              Empieza gratis <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="mt-3 text-sm text-gray-500">Empieza con check-in, WiFi y normas. Con eso ya funciona.</p>
          </div>
        </div>
      </section>

      {/* WHAT CHANGES */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-10">Lo que cambia de verdad</h2>
          <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
            <p>No te van a dejar de escribir. Pero te van a dejar de preguntar lo mismo.</p>
            <p>
              Menos mensajes con el WiFi a las 23:00. Menos llamadas de "no podemos entrar." Menos reseñas de 4 estrellas por confusión. Menos copiar y pegar el mismo texto cada reserva.
            </p>
            <p>Más cenas tranquilas. Más fines de semana sin el móvil encima. Más huéspedes que llegan y resuelven solos.</p>
            <p className="text-xl font-bold text-gray-900">No elimina todo. Elimina lo que se repite.</p>
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center">Tu semana antes y después</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 border-2 border-red-100 shadow-sm">
              <h3 className="font-bold text-red-500 mb-6 text-lg tracking-wide uppercase text-sm">Antes</h3>
              <ul className="space-y-4">
                {before.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-red-500" />
                    </div>
                    <span className="text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 border-2 border-green-100 shadow-sm">
              <h3 className="font-bold text-green-600 mb-6 text-lg tracking-wide uppercase text-sm">Después</h3>
              <ul className="space-y-4">
                {after.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* WHY ALTERNATIVES FAILED */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Lo que ya has probado (y por qué no bastó)
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              No es que no lo hayas intentado. Es que el problema no se resuelve con más mensajes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {alternatives.map((alt, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                    {alt.icon}
                  </div>
                  <h3 className="font-bold text-gray-900">{alt.title}</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{alt.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ICP FILTER */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8">
            Hecho para quien gestiona 6, 7 u 8 pisos solo
          </h2>
          <div className="space-y-5 text-lg text-white/90 leading-relaxed">
            <p>Gestionas varios apartamentos. Contestas cada mensaje tú. Coordinas cada check-in tú. Te juegas la nota en cada reseña tú.</p>
            <p>No tienes equipo. No tienes sistema. Tienes el móvil y las ganas de que funcione.</p>
            <p>Esto está hecho para ese momento. Para el anfitrión que ha cruzado el punto donde lo manual ya no aguanta y necesita que lo básico salga solo.</p>
            <p className="text-white font-bold text-xl">No necesitas un software más. Necesitas dejar de repetirte.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Lo que suelen preguntar</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">{faq.q}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOSS FRAMING */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-10">El coste de no hacer nada</h2>
          <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
            <p>El próximo huésped va a llegar. Va a preguntar el WiFi. Va a dudar con la entrada. Puede que llame. Puede que no.</p>
            <p>
              Pero si llega confundido y la estancia empieza mal, la reseña lo refleja. Y una reseña de 4 estrellas por confusión no baja sola.
            </p>
            <p>
              Superhost pide un 4,8 o más. Booking.com pesa las reseñas recientes. Lo que parece un "detalle" es lo que mueve tu posición.
            </p>
            <p className="font-bold text-gray-900 text-xl">
              No hace falta que algo salga muy mal. Basta con que no salga del todo bien.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -ml-48 -mb-48" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Tu próximo huésped ya tiene reserva.<br />Que llegue informado.
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Crea tu primera guía hoy. Empieza con lo básico. El resto se añade después.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-violet-600 font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all text-lg"
            >
              Empieza gratis <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/70">
            ✓ Sin tarjeta · ✓ Sin app · ✓ Sin compromiso
          </p>
        </div>
      </section>
    </div>
  )
}
