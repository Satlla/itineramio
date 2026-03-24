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
  SmartphoneNfc,
  Globe,
  ChevronRight,
} from 'lucide-react'
import { Navbar } from '../../../src/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'Itineramio — Tu guía de apartamento que trabaja sola',
  description: 'Crea una guía una vez. Se envía sola cuando entra la reserva. El huésped llega sabiendo cómo entrar, dónde aparcar y cuál es el WiFi. Tú dejas de repetir.',
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
    body: 'No es una opinión. Es cómo funcionan las plataformas. Una reseña de 4 estrellas por confusión en el check-in baja tu media y tu posición. Y la confusión casi siempre empieza con falta de información antes de llegar.',
  },
  {
    stat: '≠',
    text: 'Los huéspedes no leen mensajes largos. Lo dicen los anfitriones. Lo confirman las plataformas.',
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
    title: 'Copiar y pegar en WhatsApp o Airbnb',
    body: 'El huésped recibe un mensaje largo entre otros veinte. No lo lee. Tú acabas repitiéndolo igual. El problema no es el canal. Es que un mensaje largo compite con todo lo demás en su bandeja.',
  },
  {
    title: 'Un PDF con las instrucciones',
    body: 'Nadie abre un PDF en el móvil. Y si lo abren, no encuentran lo que buscan porque está todo junto. Sin zonas. Sin estructura. Sin chatbot que resuelva dudas.',
  },
  {
    title: 'La guía integrada de Airbnb',
    body: 'Funciona para un piso. No para ocho. No se traduce sola. No tiene chatbot. Y no cubre Booking.com.',
  },
  {
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
    a: 'La guía está disponible en español, inglés y francés. El chatbot detecta el idioma del huésped y responde en el suyo.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      {/* HERO */}
      <section className="pt-24 pb-20 px-4 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Los huéspedes no leen.<br />Pero llegan preguntando lo mismo.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Crea una guía una vez. Configura el enlace en tu mensaje automático de Airbnb o Booking. El huésped llega sabiendo cómo entrar, dónde aparcar y cuál es el WiFi. Tú dejas de repetir.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            Empieza gratis <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-3 text-sm text-gray-500">No necesitas tarjeta. Configúralo en 10 minutos.</p>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Esto ya te suena</h2>
          <div className="space-y-5 text-lg text-gray-700 leading-relaxed">
            <p>
              Llevas semanas enviando la misma clave de WiFi. El mismo mensaje de acceso. Las mismas normas. Cambia el nombre del huésped y repite.
            </p>
            <p>
              De vez en cuando llega el mensaje que no quieres ver: <span className="font-semibold text-gray-900">"No podemos entrar."</span> Suele ser a las 22:00. O mientras cenas. O cuando estás atendiendo otro check-in.
            </p>
            <p>
              Después viene la reseña. Cuatro estrellas. Sin explicación clara. Pero tú sabes exactamente por qué: llegaron confundidos.
            </p>
            <p>
              Con dos o tres pisos se puede tirar. Con seis, siete u ocho, el móvil manda más que tú. Y no es el trabajo lo que quema. <span className="font-semibold text-gray-900">Es la repetición.</span>
            </p>
          </div>
        </div>
      </section>

      {/* THE SHIFT */}
      <section className="py-20 px-4 bg-indigo-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">¿Y si el huésped llegara sabiendo cómo entrar?</h2>
          <div className="space-y-5 text-lg text-gray-700 leading-relaxed">
            <p>No hablamos de mandar otro mensaje largo que nadie lee. Ni de un PDF que se pierde en la bandeja.</p>
            <p>
              Hablamos de una guía corta, clara, organizada por zonas — entrada, WiFi, normas, parking, lo útil del barrio — con un enlace que el huésped recibe cuando se confirma la reserva.
            </p>
            <p>
              Antes de llegar, ya sabe cómo entrar. Ya tiene el WiFi. Ya conoce las normas. Y si tiene alguna duda, un chatbot le responde en su idioma usando la información de tu propio apartamento.
            </p>
            <p className="font-semibold text-gray-900">Tú configuras una vez. La guía hace el resto.</p>
          </div>
        </div>
      </section>

      {/* STATS CARDS */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="border border-gray-200 rounded-2xl p-6 flex flex-col gap-3">
              <span className="text-4xl font-bold text-indigo-600">{s.stat}</span>
              <p className="font-semibold text-gray-900 text-base">{s.text}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 bg-indigo-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Tres pasos. Diez minutos.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-12">
            {[
              {
                icon: <QrCode className="w-8 h-8 text-indigo-600" />,
                title: 'Crea tu guía',
                body: 'Acceso, WiFi, normas, parking y lo que necesiten. Organizado por zonas. Sin textos largos. Empieza solo con lo básico.',
              },
              {
                icon: <MessageCircle className="w-8 h-8 text-indigo-600" />,
                title: 'Configura el enlace',
                body: 'Añade el enlace de tu guía al mensaje automático de Airbnb o Booking. Se envía solo en cada reserva sin que toques nada.',
              },
              {
                icon: <Star className="w-8 h-8 text-indigo-600" />,
                title: 'El huésped llega ubicado',
                body: 'Sabe cómo entrar. Tiene el WiFi. Conoce las normas. Y si pregunta algo, el chatbot le responde en su idioma.',
              },
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-indigo-200">{i + 1}</span>
                  {step.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            Empieza gratis <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-3 text-sm text-gray-500">Empieza con check-in, WiFi y normas. Con eso ya funciona.</p>
        </div>
      </section>

      {/* WHAT CHANGES */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Lo que cambia de verdad</h2>
          <div className="space-y-5 text-lg text-gray-700 leading-relaxed">
            <p>No te van a dejar de escribir. Pero te van a dejar de preguntar lo mismo.</p>
            <p>
              Menos mensajes con el WiFi a las 23:00. Menos llamadas de "no podemos entrar." Menos reseñas de 4 estrellas por confusión. Menos copiar y pegar el mismo texto cada reserva.
            </p>
            <p>
              Más cenas tranquilas. Más fines de semana sin el móvil encima. Más huéspedes que llegan y resuelven solos.
            </p>
            <p className="font-semibold text-gray-900">No elimina todo. Elimina lo que se repite.</p>
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Tu semana antes y después</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-red-100">
              <h3 className="font-bold text-red-500 mb-4 text-lg">ANTES</h3>
              <ul className="space-y-3">
                {before.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-green-100">
              <h3 className="font-bold text-green-600 mb-4 text-lg">DESPUÉS</h3>
              <ul className="space-y-3">
                {after.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* WHY ALTERNATIVES FAILED */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Lo que ya has probado (y por qué no bastó)</h2>
          <div className="space-y-6">
            {alternatives.map((alt, i) => (
              <div key={i} className="border-l-4 border-indigo-100 pl-5">
                <h3 className="font-semibold text-gray-900 mb-1">{alt.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{alt.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ICP FILTER */}
      <section className="py-20 px-4 bg-indigo-600 text-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Hecho para quien gestiona 6, 7 u 8 pisos solo</h2>
          <div className="space-y-4 text-indigo-100 text-lg leading-relaxed">
            <p>Gestionas varios apartamentos. Contestas cada mensaje tú. Coordinas cada check-in tú. Te juegas la nota en cada reseña tú.</p>
            <p>No tienes equipo. No tienes sistema. Tienes el móvil y las ganas de que funcione.</p>
            <p>Esto está hecho para ese momento. Para el anfitrión que ha cruzado el punto donde lo manual ya no aguanta y necesita que lo básico salga solo.</p>
            <p className="text-white font-semibold">No necesitas un software más. Necesitas dejar de repetirte.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Lo que suelen preguntar</h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-100 pb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOSS FRAMING */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">El coste de no hacer nada</h2>
          <div className="space-y-5 text-lg text-gray-700 leading-relaxed">
            <p>El próximo huésped va a llegar. Va a preguntar el WiFi. Va a dudar con la entrada. Puede que llame. Puede que no.</p>
            <p>Pero si llega confundido y la estancia empieza mal, la reseña lo refleja. Y una reseña de 4 estrellas por confusión no baja sola.</p>
            <p>Superhost pide un 4,8 o más. Booking.com pesa las reseñas recientes. Lo que parece un "detalle" es lo que mueve tu posición.</p>
            <p className="font-semibold text-gray-900">No hace falta que algo salga muy mal. Basta con que no salga del todo bien.</p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-4 bg-indigo-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tu próximo huésped ya tiene reserva.<br />Que llegue informado.
          </h2>
          <p className="text-indigo-200 text-lg mb-8">
            Crea tu primera guía hoy. Empieza con lo básico. El resto se añade después.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            Empieza gratis <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-3 text-sm text-indigo-300">Sin tarjeta. Sin app. Sin compromiso.</p>
        </div>
      </section>
    </div>
  )
}
