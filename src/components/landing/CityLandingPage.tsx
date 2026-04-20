import Link from 'next/link'
import { ItineramioLogo } from '@/components/ui/ItineramioLogo'

interface CityData {
  city: string
  region: string
  heroSubtitle: string
  listings: string
  occupancy: string
  adr: string
  revpar: string
  mainLaw: string
  registrationType: string
  keyRequirements: string[]
  penalties: string
  touristTax: string | null
  topZones: { name: string; reason: string }[]
  highSeason: string
  lowSeason: string
  keyEvents: string[]
  guestQuestions: string[]
  whyManualHelps: string
  keywords: string[]
  metaTitle: string
  metaDescription: string
  faqs: { question: string; answer: string }[]
}

export type { CityData }

export default function CityLandingPage({ data }: { data: CityData }) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  const citySlug = data.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Itineramio ${data.city}`,
    description: `Software de manuales digitales para apartamentos turisticos en ${data.city}, ${data.region}.`,
    url: `https://www.itineramio.com/${citySlug}`,
    serviceType: 'Software de gestion de alojamientos turisticos',
    areaServed: {
      '@type': 'City',
      name: data.city,
    },
    provider: {
      '@type': 'Organization',
      name: 'Itineramio',
      url: 'https://www.itineramio.com',
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.itineramio.com' },
      { '@type': 'ListItem', position: 2, name: data.city, item: `https://www.itineramio.com/${citySlug}` },
    ],
  }

  return (
    <div className="min-h-screen bg-white">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ItineramioLogo size="md" showText />
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Prueba gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="mx-auto max-w-6xl px-6 pt-20 pb-16">
        <p className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-4">
          {data.region}
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-tight">
          Manual Digital para Apartamentos{' '}
          <br className="hidden sm:block" />
          Turisticos en {data.city}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-600 leading-relaxed">
          {data.heroSubtitle}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-gray-800"
          >
            Crear manual gratis
          </Link>
          <Link
            href="/guide/cmn991v2s0001ju0452vn74yn"
            target="_blank"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-8 py-3.5 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Ver ejemplo
          </Link>
          <Link
            href="/consulta"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-8 py-3.5 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Solicitar demo
          </Link>
        </div>
      </header>

      {/* Stats Row */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              { label: 'Listings activos', value: data.listings },
              { label: 'Ocupacion media', value: data.occupancy },
              { label: 'ADR (tarifa media)', value: data.adr },
              { label: 'RevPAR', value: data.revpar },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-gray-200 bg-white p-6 text-center"
              >
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="mt-2 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-gray-400">
            Datos aproximados del mercado de alquiler vacacional en {data.city}. Fuentes: AirDNA, INE, Datatur.
          </p>
        </div>
      </section>

      {/* Normativa */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900">
          Normativa de Vivienda Turistica en {data.city}
        </h2>
        <p className="mt-4 max-w-3xl text-gray-600">
          Conocer la regulacion local es fundamental para operar legalmente y evitar sanciones.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Marco legal</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Ley principal</dt>
                <dd className="mt-1 text-gray-900">{data.mainLaw}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tipo de registro</dt>
                <dd className="mt-1 text-gray-900">{data.registrationType}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Sanciones</dt>
                <dd className="mt-1 text-gray-900">{data.penalties}</dd>
              </div>
              {data.touristTax && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tasa turistica</dt>
                  <dd className="mt-1 text-gray-900">{data.touristTax}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Requisitos clave</h3>
            <ul className="space-y-3">
              {data.keyRequirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Best Zones */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold text-gray-900">
            Mejores Zonas para Alquiler Turistico en {data.city}
          </h2>
          <p className="mt-4 max-w-3xl text-gray-600">
            Las zonas con mayor demanda y rentabilidad para viviendas turisticas.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.topZones.map((zone, i) => (
              <div
                key={zone.name}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-600">
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900">{zone.name}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{zone.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Season & Events */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900">
          Temporada y Eventos en {data.city}
        </h2>
        <p className="mt-4 max-w-3xl text-gray-600">
          Planifica tu estrategia de precios y contenido del manual segun la temporada.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Temporada alta</h3>
            <p className="text-gray-700">{data.highSeason}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Temporada baja</h3>
            <p className="text-gray-700">{data.lowSeason}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Eventos clave</h3>
            <ul className="space-y-2">
              {data.keyEvents.map((event) => (
                <li key={event} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                  <span className="text-sm text-gray-700">{event}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Why Manual Section */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold text-gray-900">
            Por Que Necesitas un Manual Digital en {data.city}
          </h2>
          <p className="mt-4 max-w-3xl text-gray-600">
            {data.whyManualHelps}
          </p>

          <div className="mt-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Preguntas frecuentes que reciben los anfitriones en {data.city}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {data.guestQuestions.map((q, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-5"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500 flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700">{q}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="rounded-2xl bg-gray-900 px-8 py-16 text-center sm:px-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Crea tu manual digital para {data.city} en 10 minutos
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Automatiza las instrucciones a tus huespedes. Sin instalaciones, sin complicaciones.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Prueba gratis 15 dias. Sin tarjeta de credito.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3.5 text-base font-medium text-gray-900 transition-colors hover:bg-gray-100"
            >
              Empezar gratis
            </Link>
            <Link
              href="/consulta"
              className="inline-flex items-center justify-center rounded-lg border border-gray-600 px-8 py-3.5 text-base font-medium text-gray-300 transition-colors hover:bg-gray-800"
            >
              Solicitar demo
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-100">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Preguntas frecuentes sobre {data.city}
          </h2>
          <div className="space-y-6">
            {data.faqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-100 pb-6">
                <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <ItineramioLogo size="sm" showText />
            </Link>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
              <Link href="/blog" className="hover:text-gray-900 transition-colors">Blog</Link>
              <Link href="/normativa" className="hover:text-gray-900 transition-colors">Normativa</Link>
              <Link href="/comparar" className="hover:text-gray-900 transition-colors">Comparativas</Link>
              <Link href="/gestion-alquiler-vacacional" className="hover:text-gray-900 transition-colors">Facturacion</Link>
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
