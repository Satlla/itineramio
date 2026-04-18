import Link from 'next/link'
import {
  FileText,
  Calculator,
  Upload,
  BarChart3,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle2,
  Receipt,
  Users,
  Building2,
  Mail,
} from 'lucide-react'

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Que incluye el modulo de gestion de Itineramio?',
      acceptedAnswer: { '@type': 'Answer', text: 'Importacion de reservas de Airbnb y Booking (CSV, email), liquidaciones mensuales automaticas a propietarios, facturacion con series y VeriFactu (AEAT), control de gastos, rentabilidad por propiedad y portal del propietario.' },
    },
    {
      '@type': 'Question',
      name: 'Que es VeriFactu y por que lo necesito?',
      acceptedAnswer: { '@type': 'Answer', text: 'VeriFactu es el sistema de la AEAT (RD 1007/2023) que obliga a los emisores de facturas a encadenar hashes, generar QR y comunicar facturas electronicamente. Itineramio lo integra automaticamente al emitir facturas, sin que tengas que hacer nada adicional.' },
    },
    {
      '@type': 'Question',
      name: 'Puedo importar mis reservas de Airbnb y Booking?',
      acceptedAnswer: { '@type': 'Answer', text: 'Si. Puedes importar reservas por CSV (formato Airbnb y Booking autodetectado), manualmente, o conectando tu Gmail para importacion automatica desde emails de confirmacion.' },
    },
    {
      '@type': 'Question',
      name: 'Como funciona la liquidacion al propietario?',
      acceptedAnswer: { '@type': 'Answer', text: 'Seleccionas propietario y periodo, el sistema calcula automaticamente: ingresos por reserva, comision del gestor, IVA, limpieza, gastos y retencion IRPF. Genera un PDF/Excel que puedes enviar por email con un click.' },
    },
    {
      '@type': 'Question',
      name: 'Cuanto cuesta el modulo de gestion?',
      acceptedAnswer: { '@type': 'Answer', text: 'El modulo de gestion esta incluido en los planes de Itineramio. Puedes probarlo gratis durante 15 dias sin tarjeta de credito.' },
    },
  ],
}

const features = [
  {
    icon: Upload,
    title: 'Importacion de reservas',
    description: 'Importa desde Airbnb, Booking o CSV. Autodeteccion de formato, mapeo de listings y preview antes de confirmar. Tambien puedes conectar Gmail para importacion automatica.',
  },
  {
    icon: Calculator,
    title: 'Liquidaciones automaticas',
    description: 'Wizard de 3 pasos: selecciona propietario, periodo y genera. El sistema calcula ingresos, comision, IVA, limpieza, gastos y retencion IRPF. Descarga PDF/Excel o envia por email.',
  },
  {
    icon: FileText,
    title: 'Facturacion con VeriFactu',
    description: 'Facturas con series correlativas, rectificativas, encadenamiento de hashes SHA-256 y envio automatico a la AEAT. Cumple con el RD 1007/2023 sin esfuerzo adicional.',
  },
  {
    icon: Receipt,
    title: 'Control de gastos',
    description: 'Registra gastos por propiedad con categorias (mantenimiento, suministros, limpieza, seguros). Decide si se cargan al propietario o los absorbe el gestor. Se integran automaticamente en la liquidacion.',
  },
  {
    icon: Users,
    title: 'Portal del propietario',
    description: 'Cada propietario recibe un enlace seguro para ver sus liquidaciones y facturas sin necesidad de cuenta. Envia por email con un click.',
  },
  {
    icon: BarChart3,
    title: 'Rentabilidad por propiedad',
    description: 'Informe con reservas, noches, ingresos brutos, importe gestor, importe propietario, limpieza y facturado. Comparativa anual y exportacion.',
  },
]

const painPoints = [
  { icon: Clock, problem: '12-18 horas semanales', solution: '2-3 horas con automatizacion', description: 'Gestion manual de reservas, liquidaciones y facturas' },
  { icon: Calculator, problem: 'Excel con errores', solution: 'Calculo automatico', description: 'Comisiones, IVA, IRPF y limpieza calculados al centimo' },
  { icon: Shield, problem: 'VeriFactu manual', solution: 'Integrado automaticamente', description: 'Hash, QR y envio a AEAT sin hacer nada extra' },
  { icon: Mail, problem: 'Emails con PDF adjunto', solution: 'Portal del propietario', description: 'El propietario accede a todo con un link seguro' },
]

export default function GestionAlquilerVacacionalPage() {
  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-gray-900">Itineramio</Link>
          <Link href="/register" className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800">Prueba gratis</Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="mx-auto max-w-6xl px-6 pt-20 pb-16">
        <p className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-4">
          Modulo de gestion
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-tight">
          Liquidaciones y facturacion{' '}
          <br className="hidden sm:block" />
          para gestores de alquiler vacacional
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-gray-600 leading-relaxed">
          Si gestionas apartamentos de terceros, cada mes tienes que importar reservas, calcular comisiones,
          generar liquidaciones y emitir facturas a cada propietario. Con Itineramio, todo ese proceso
          se reduce a unos clicks. Con VeriFactu integrado para cumplir con Hacienda.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link href="/register" className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-gray-800">
            Probar gratis 15 dias
          </Link>
          <Link href="/guide/cmn991v2s0001ju0452vn74yn" target="_blank" className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-8 py-3.5 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50">
            Ver ejemplo
          </Link>
          <Link href="/consulta" className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-8 py-3.5 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50">
            Solicitar demo
          </Link>
        </div>
      </header>

      {/* Pain points */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            El problema que resolvemos
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {painPoints.map((point) => (
              <div key={point.problem} className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 mb-4">
                  <point.icon className="h-5 w-5 text-gray-600" />
                </div>
                <p className="text-sm text-gray-500 mb-1">{point.description}</p>
                <p className="text-base font-semibold text-red-600 line-through mb-1">{point.problem}</p>
                <p className="text-base font-semibold text-gray-900">{point.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900">
          Todo lo que necesitas para gestionar propiedades de terceros
        </h2>
        <p className="mt-4 max-w-3xl text-gray-600">
          Desde la importacion de reservas hasta la factura con VeriFactu. Un flujo completo sin Excel.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-xl border border-gray-200 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 mb-4">
                <feature.icon className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Como funciona: de reserva a factura en 4 pasos
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { step: '1', title: 'Importa reservas', description: 'Sube el CSV de Airbnb/Booking o conecta Gmail. El sistema detecta el formato y mapea los listings automaticamente.' },
              { step: '2', title: 'Genera liquidacion', description: 'Selecciona propietario y mes. El sistema calcula ingresos, comision, IVA, limpieza, gastos y retencion IRPF.' },
              { step: '3', title: 'Emite la factura', description: 'Con un click: numero correlativo, hash SHA-256, QR y envio a la AEAT via VeriFactu. Todo automatico.' },
              { step: '4', title: 'Envia al propietario', description: 'PDF, Excel o link al portal del propietario. El propietario ve todo sin necesidad de crear cuenta.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VeriFactu section */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              VeriFactu integrado: cumple con Hacienda sin esfuerzo
            </h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              El RD 1007/2023 obliga a los emisores de facturas a encadenar hashes, generar codigos QR
              y comunicar las facturas electronicamente a la AEAT. Con Itineramio, esto ocurre
              automaticamente al emitir cada factura. Sin configuracion adicional, sin software externo.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Hash SHA-256 encadenado automaticamente',
                'QR en cada factura emitida',
                'Envio automatico a la AEAT via VeriFactu',
                'Verificacion de cadena de hashes',
                'Auditlog de todas las acciones sobre facturas',
                'Facturas rectificativas (sustitucion y diferencia)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de factura soportados</h3>
            <div className="space-y-3 text-sm">
              {[
                { code: 'F1', desc: 'Factura ordinaria' },
                { code: 'F2', desc: 'Factura simplificada' },
                { code: 'F3', desc: 'Factura de reemplazo' },
                { code: 'R1-R5', desc: 'Facturas rectificativas' },
              ].map((type) => (
                <div key={type.code} className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-lg bg-gray-200 px-2.5 py-1 text-xs font-mono font-medium text-gray-700">{type.code}</span>
                  <span className="text-gray-600">{type.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Para quien es este modulo
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 mb-4">
                <Building2 className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Gestores con 5-50 propiedades</h3>
              <p className="text-sm text-gray-600">Administras apartamentos de varios propietarios y necesitas liquidar mensualmente, facturar y cumplir con Hacienda.</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 mb-4">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Gestores que facturan a propietarios</h3>
              <p className="text-sm text-gray-600">Necesitas emitir facturas por tus comisiones de gestion con IVA, IRPF y series correlativas. VeriFactu incluido.</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 mb-4">
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Gestores que pierden horas en Excel</h3>
              <p className="text-sm text-gray-600">Cada mes descargas CSVs, copias datos, calculas comisiones y generas PDFs a mano. Este modulo automatiza todo ese flujo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing hint */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-2xl bg-gray-900 px-8 py-16 text-center sm:px-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            De Excel a factura automatica en 15 minutos
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Configura tu perfil fiscal, da de alta a tus propietarios, importa las reservas
            y genera tu primera liquidacion. VeriFactu incluido desde el primer dia.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Prueba gratis 15 dias. Sin tarjeta de credito.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3.5 text-base font-medium text-gray-900 transition-colors hover:bg-gray-100">
              Empezar gratis <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/pricing" className="inline-flex items-center justify-center rounded-lg border border-gray-600 px-8 py-3.5 text-base font-medium text-gray-300 transition-colors hover:bg-gray-800">
              Ver precios
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-100">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Preguntas frecuentes
          </h2>
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-6">
              <h3 className="text-lg font-semibold text-gray-900">Que incluye el modulo de gestion?</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">Importacion de reservas (Airbnb, Booking, CSV, Gmail), liquidaciones mensuales automaticas, facturacion con VeriFactu, control de gastos, portal del propietario y rentabilidad por propiedad.</p>
            </div>
            <div className="border-b border-gray-100 pb-6">
              <h3 className="text-lg font-semibold text-gray-900">Que es VeriFactu y por que lo necesito?</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">VeriFactu es el sistema de la AEAT (RD 1007/2023) que obliga a encadenar hashes, generar QR y comunicar facturas electronicamente. Itineramio lo integra automaticamente al emitir cada factura.</p>
            </div>
            <div className="border-b border-gray-100 pb-6">
              <h3 className="text-lg font-semibold text-gray-900">Puedo importar mis reservas de Airbnb y Booking?</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">Si. CSV con autodeteccion de formato, importacion manual o conexion de Gmail para importacion automatica desde emails de confirmacion.</p>
            </div>
            <div className="border-b border-gray-100 pb-6">
              <h3 className="text-lg font-semibold text-gray-900">Como funciona la liquidacion al propietario?</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">Seleccionas propietario y periodo. El sistema calcula automaticamente ingresos, comision, IVA, limpieza, gastos y retencion IRPF. Genera PDF/Excel y lo puedes enviar por email con un click.</p>
            </div>
            <div className="border-b border-gray-100 pb-6">
              <h3 className="text-lg font-semibold text-gray-900">Cuanto cuesta?</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">El modulo de gestion esta incluido en los planes de Itineramio. Puedes probarlo gratis durante 15 dias sin tarjeta de credito.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="text-lg font-semibold text-gray-900">Itineramio</Link>
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
