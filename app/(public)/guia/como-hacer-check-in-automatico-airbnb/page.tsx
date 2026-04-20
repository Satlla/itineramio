import Link from 'next/link'
import { ItineramioLogo } from '@/components/ui/ItineramioLogo'
import {
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Key,
  Smartphone,
  Lock,
  DoorOpen,
  Wifi,
  Camera,
} from 'lucide-react'

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Como hacer check-in automatico en Airbnb',
  description: 'Guia completa para configurar el self check-in en tu apartamento turistico: lockbox, cerraduras inteligentes, apps y codigos.',
  totalTime: 'PT15M',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Elige tu metodo de acceso', text: 'Lockbox (cajetin con codigo), cerradura inteligente (Nuki, Yale, August) o codigo en cerradura electronica.' },
    { '@type': 'HowToStep', position: 2, name: 'Instala el sistema', text: 'Coloca la lockbox o cerradura inteligente siguiendo las instrucciones del fabricante.' },
    { '@type': 'HowToStep', position: 3, name: 'Configura codigos unicos por reserva', text: 'Genera un codigo diferente para cada huesped o reserva para mayor seguridad.' },
    { '@type': 'HowToStep', position: 4, name: 'Crea instrucciones visuales', text: 'Haz fotos o videos del proceso de entrada completo: portal, ascensor, puerta, cerradura.' },
    { '@type': 'HowToStep', position: 5, name: 'Envia las instrucciones antes de la llegada', text: 'Comparte las instrucciones de acceso 24h antes del check-in junto con la guia digital.' },
  ],
}

const methods = [
  {
    icon: Lock,
    name: 'Lockbox / Cajetin',
    price: '20-40 EUR',
    pros: ['Sin electricidad ni WiFi', 'Muy fiable', 'Facil de instalar'],
    cons: ['Codigo fijo (menos seguro)', 'Aspecto poco profesional', 'Puede bloquearse con el frio'],
    best: 'Pisos con presupuesto ajustado o sin WiFi fiable',
  },
  {
    icon: Smartphone,
    name: 'Cerradura inteligente (Nuki, Yale)',
    price: '150-300 EUR',
    pros: ['Codigos unicos por reserva', 'Apertura desde el movil', 'Registro de accesos'],
    cons: ['Necesita WiFi o Bluetooth', 'Bateria que mantener', 'Precio mas alto'],
    best: 'Hosts semi-profesionales con varias propiedades',
  },
  {
    icon: Key,
    name: 'Cerradura electronica con codigo',
    price: '80-200 EUR',
    pros: ['Sin app necesaria', 'Codigos temporales', 'Bateria de larga duracion'],
    cons: ['Instalacion mas compleja', 'Menos integraciones', 'Aspecto puede no encajar'],
    best: 'Propiedades con alto volumen de rotacion',
  },
]

export default function CheckInAutomaticoPage() {
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
          Como hacer check-in automatico en Airbnb
        </h1>
        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
          El self check-in es la diferencia entre estar pendiente del movil a las 2 de la manana
          y dormir tranquilo. Esta guia te explica las opciones, costes y como complementar el
          acceso autonomo con un manual digital para que el huesped no te llame al llegar.
        </p>
      </header>

      {/* Methods comparison */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">3 metodos de check-in automatico</h2>
          <div className="space-y-6">
            {methods.map((method) => (
              <div key={method.name} className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <method.icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-500">Desde {method.price}</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-2">Ventajas</p>
                    <ul className="space-y-1">
                      {method.pros.map((pro) => (
                        <li key={pro} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-2">Inconvenientes</p>
                    <ul className="space-y-1">
                      {method.cons.map((con) => (
                        <li key={con} className="flex items-start gap-2 text-sm text-gray-600">
                          <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Ideal para</p>
                    <p className="text-sm text-gray-600">{method.best}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">Como configurar el check-in perfecto</h2>
        <div className="space-y-12">
          <div className="flex gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">1</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Elige el metodo segun tu operacion</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">Si gestionas 1-2 pisos y tienes presupuesto ajustado, una lockbox funciona. Si tienes 5+, una cerradura inteligente se amortiza rapido. Valora tambien si tu edificio permite instalar cerraduras en la puerta del portal.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">2</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Crea instrucciones visuales paso a paso</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">Haz fotos del portal, del ascensor, de la puerta y de la cerradura. Graba un video corto mostrando todo el recorrido desde la calle hasta dentro del apartamento. Un huesped que ve un video no necesita llamarte.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">3</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Envia las instrucciones 24h antes</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">No esperes al dia del check-in. Envia el link de la guia digital con las instrucciones de acceso al menos 24 horas antes. Incluyendo: direccion exacta, como llegar desde el aeropuerto, codigo de acceso y video de entrada.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">4</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Complementa con un manual digital completo</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                El check-in automatico resuelve &quot;como entro&quot;, pero no &quot;como va la vitroceramica&quot;
                ni &quot;cual es el WiFi&quot;. Un manual digital complementa el self check-in con toda la
                informacion que el huesped necesita una vez dentro.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-12 pb-20">
        <div className="rounded-2xl bg-gray-900 px-8 py-14 text-center sm:px-16">
          <h2 className="text-3xl font-bold text-white">El complemento perfecto para tu self check-in</h2>
          <p className="mt-4 text-lg text-gray-300">
            Itineramio crea un manual digital con las instrucciones de check-in, WiFi, electrodomesticos
            y todo lo que el huesped necesita. Con video, QR por zona y traduccion automatica.
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
