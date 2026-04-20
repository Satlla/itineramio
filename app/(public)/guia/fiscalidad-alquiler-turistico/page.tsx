import Link from 'next/link'
import { ItineramioLogo } from '@/components/ui/ItineramioLogo'
import {
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calculator,
  Receipt,
  Shield,
  Users,
  Building2,
} from 'lucide-react'

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Como gestionar la fiscalidad del alquiler turistico en Espana',
  description: 'Guia completa sobre obligaciones fiscales, IVA, IRPF, facturas y VeriFactu para propietarios y gestores de alquiler vacacional.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Determina si necesitas ser autonomo', text: 'Si ofreces servicios complementarios (limpieza, desayuno) estas sujeto a IVA y necesitas alta en IAE. Si solo alquilas la vivienda sin servicios, tributa como rendimiento del capital inmobiliario en IRPF.' },
    { '@type': 'HowToStep', position: 2, name: 'Identifica que IVA aplica', text: 'Alquiler sin servicios: exento de IVA. Con servicios complementarios: IVA del 10% (hospedaje). Comision del gestor: IVA 21%.' },
    { '@type': 'HowToStep', position: 3, name: 'Decide que importes declarar', text: 'Se declaran los ingresos brutos (lo que paga el huesped), no solo lo que recibes despues de comisiones de la plataforma.' },
    { '@type': 'HowToStep', position: 4, name: 'Configura la facturacion', text: 'Si estas obligado a facturar, necesitas series correlativas, VeriFactu desde 2025 y cumplir con el RD 1007/2023.' },
    { '@type': 'HowToStep', position: 5, name: 'Aplica retenciones si tienes gestor', text: 'El gestor puede retener IRPF al propietario en la liquidacion. El tipo general es del 15% para empresas y 0% para personas fisicas salvo acuerdo.' },
  ],
}

const articles = [
  {
    icon: Receipt,
    title: 'Tengo que hacer factura a cada huesped de Airbnb?',
    description: 'Depende de si ofreces servicios complementarios o solo alquilas la vivienda. Te explicamos cuando es obligatorio y cuando no.',
    href: '/blog/factura-huesped-airbnb-obligatorio',
    tag: 'Propietario',
  },
  {
    icon: Calculator,
    title: 'Declaro el total de Airbnb o solo lo que recibo?',
    description: 'La diferencia entre ingresos brutos y netos, que comisiones puedes deducir y como declarar correctamente.',
    href: '/blog/declarar-ingresos-airbnb-bruto-neto',
    tag: 'Propietario',
  },
  {
    icon: FileText,
    title: 'IVA en alquiler turistico: 10% o 21%?',
    description: 'Cuando estas exento de IVA, cuando aplicas el 10% y cuando el 21%. Con ejemplos practicos.',
    href: '/blog/iva-alquiler-turistico-10-o-21',
    tag: 'Propietario',
  },
  {
    icon: Users,
    title: 'Necesito ser autonomo para alquilar en Airbnb?',
    description: 'La respuesta corta es: depende de los servicios que ofrezcas. La respuesta larga esta aqui.',
    href: '/blog/alquiler-turistico-autonomo-obligatorio',
    tag: 'Propietario',
  },
  {
    icon: Building2,
    title: 'Retencion IRPF en alquiler turistico: guia completa',
    description: 'Quien retiene, cuanto, cuando y como se aplica el IRPF en alquileres turisticos y liquidaciones al propietario.',
    href: '/blog/retencion-irpf-alquiler-turistico',
    tag: 'Propietario + Gestor',
  },
  {
    icon: Receipt,
    title: 'Como facturar tu comision como gestor al propietario',
    description: 'IVA de la comision, retencion IRPF, series de facturacion y como emitir la factura correctamente.',
    href: '/blog/factura-comision-gestor-propietario',
    tag: 'Gestor',
  },
  {
    icon: Shield,
    title: 'VeriFactu para gestores de alquiler vacacional 2026',
    description: 'Que es VeriFactu, cuando es obligatorio, como funciona el encadenamiento de hashes y como cumplir sin esfuerzo.',
    href: '/blog/verifactu-gestores-alquiler-vacacional',
    tag: 'Gestor',
  },
]

export default function FiscalidadGuiaPage() {
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
          <span className="text-gray-900">Guia de fiscalidad</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="mx-auto max-w-4xl px-6 pt-12 pb-12">
        <p className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-4">Guia completa</p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl leading-tight">
          Fiscalidad del alquiler turistico en Espana
        </h1>
        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
          IVA, IRPF, facturas, autonomos, VeriFactu, liquidaciones al propietario... La fiscalidad del alquiler
          turistico es un laberinto. Esta guia organiza todas las preguntas que se hacen los propietarios y
          gestores, con respuestas claras y enlaces a articulos en profundidad.
        </p>
      </header>

      {/* Quick overview */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Lo basico en 60 segundos</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Si eres propietario y alquilas sin servicios</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />No necesitas ser autonomo</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />Exento de IVA</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />Tributas en IRPF como rendimiento del capital inmobiliario</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />No estas obligado a facturar al huesped</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />Declaras los ingresos brutos (no solo lo que recibes)</li>
              </ul>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Si eres propietario y ofreces servicios</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />Necesitas alta en IAE (posiblemente autonomo)</li>
                <li className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />IVA del 10% (actividad de hospedaje)</li>
                <li className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />Tributas como actividad economica en IRPF</li>
                <li className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />Obligado a emitir factura</li>
                <li className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />VeriFactu obligatorio desde 2025</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Si eres gestor (administras propiedades de terceros)</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />Facturas tu comision al propietario con IVA 21%</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />Puedes retener IRPF en la liquidacion</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />VeriFactu obligatorio para tus facturas</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />Series correlativas, rectificativas y encadenamiento de hashes</li>
            </ul>
          </div>
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                <strong>Aviso:</strong> Esta guia es orientativa y no sustituye el asesoramiento fiscal profesional.
                La casuistica puede variar segun la comunidad autonoma, el tipo de alojamiento y la situacion particular
                de cada contribuyente. Consulta siempre con tu asesor fiscal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Articles grid */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          7 preguntas clave sobre fiscalidad
        </h2>
        <p className="text-gray-600 mb-10">
          Cada articulo responde en profundidad a una pregunta concreta. Haz clic para leer el articulo completo.
        </p>
        <div className="space-y-4">
          {articles.map((article) => (
            <Link
              key={article.href}
              href={article.href}
              className="group flex items-start gap-4 rounded-xl border border-gray-200 p-6 transition-all hover:border-gray-400 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                <article.icon className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700">{article.title}</h3>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">{article.tag}</span>
                </div>
                <p className="text-sm text-gray-600">{article.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 mt-3 flex-shrink-0 group-hover:text-gray-600 transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* For gestores */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Si eres gestor: automatiza la facturacion</h2>
          <p className="text-gray-600 mb-8">
            Calcular comisiones, retenciones IRPF, IVA y generar facturas con VeriFactu cada mes es un dolor.
            Itineramio lo automatiza: importas las reservas, el sistema calcula todo y emite la factura con
            un click. Con hash encadenado, QR y envio a la AEAT integrado.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
              <p className="text-3xl font-bold text-gray-900">2-3h</p>
              <p className="mt-1 text-sm text-gray-500">En vez de 12-18h semanales</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
              <p className="text-3xl font-bold text-gray-900">1 click</p>
              <p className="mt-1 text-sm text-gray-500">Liquidacion + factura + envio</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
              <p className="text-3xl font-bold text-gray-900">VeriFactu</p>
              <p className="mt-1 text-sm text-gray-500">Integrado automaticamente</p>
            </div>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/gestion-alquiler-vacacional" className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-gray-800">
              Ver modulo de gestion <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-8 py-3.5 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50">
              Probar gratis 15 dias
            </Link>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Relacionado</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/normativa" className="rounded-xl border border-gray-200 p-5 hover:border-gray-400 transition-all">
            <h3 className="font-semibold text-gray-900 mb-1">Normativa por CCAA</h3>
            <p className="text-sm text-gray-600">Leyes, requisitos y sanciones por comunidad autonoma.</p>
          </Link>
          <Link href="/guia/como-registrar-viajeros-ses-hospedajes" className="rounded-xl border border-gray-200 p-5 hover:border-gray-400 transition-all">
            <h3 className="font-semibold text-gray-900 mb-1">SES.Hospedajes</h3>
            <p className="text-sm text-gray-600">Tutorial paso a paso del registro de viajeros.</p>
          </Link>
          <Link href="/gestion-alquiler-vacacional" className="rounded-xl border border-gray-200 p-5 hover:border-gray-400 transition-all">
            <h3 className="font-semibold text-gray-900 mb-1">Software de gestion</h3>
            <p className="text-sm text-gray-600">Liquidaciones, facturas y VeriFactu automatizados.</p>
          </Link>
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
