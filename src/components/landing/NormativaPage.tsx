import Link from 'next/link'

interface NormativaData {
  ccaa: string
  slug: string
  heroSubtitle: string
  mainLaws: { name: string; description: string }[]
  registrationType: string
  registrationSteps: string[]
  requirements: string[]
  penalties: string
  touristTax: string | null
  stateRegistryNote: string
  travelersRegistryNote: string
  keyChanges: { title: string; description: string }[]
  citiesCovered: string[]
  whyManualHelps: string
  keywords: string[]
  metaTitle: string
  metaDescription: string
  faqs: { question: string; answer: string }[]
}

export type { NormativaData }

export default function NormativaPage({ data }: { data: NormativaData }) {
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

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
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
      <div className="mx-auto max-w-6xl px-6 pt-6">
        <nav className="flex text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900 transition-colors">Inicio</Link>
          <span className="mx-2">/</span>
          <Link href="/normativa" className="hover:text-gray-900 transition-colors">Normativa</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{data.ccaa}</span>
        </nav>
      </div>

      {/* Hero */}
      <header className="mx-auto max-w-6xl px-6 pt-12 pb-16">
        <p className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-4">
          Normativa turistica
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl leading-tight">
          Normativa de Vivienda Turistica{' '}
          <br className="hidden sm:block" />
          en {data.ccaa}
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-gray-600 leading-relaxed">
          {data.heroSubtitle}
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {data.citiesCovered.map((city) => (
            <span
              key={city}
              className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-600"
            >
              {city}
            </span>
          ))}
        </div>
      </header>

      {/* Marco estatal */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Marco estatal comun
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Registro Unico de Arrendamientos
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {data.stateRegistryNote}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Registro de viajeros
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {data.travelersRegistryNote}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leyes principales */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900">
          Legislacion autonomica
        </h2>
        <p className="mt-4 max-w-3xl text-gray-600">
          Leyes y decretos que regulan la vivienda turistica en {data.ccaa}.
        </p>
        <div className="mt-10 space-y-4">
          {data.mainLaws.map((law) => (
            <div key={law.name} className="rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900">{law.name}</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">{law.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Registro y requisitos */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Como registrarse */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Como registrarse
              </h2>
              <p className="text-gray-600 mb-8">
                {data.registrationType}
              </p>
              <ol className="space-y-4">
                {data.registrationSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-sm font-semibold text-white flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-gray-700 pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Requisitos */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Requisitos
              </h2>
              <p className="text-gray-600 mb-8">
                Requisitos obligatorios para operar legalmente.
              </p>
              <ul className="space-y-3">
                {data.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sanciones y tasa */}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Sanciones</h3>
              <p className="text-gray-700">{data.penalties}</p>
            </div>
            {data.touristTax && (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tasa turistica</h3>
                <p className="text-gray-700">{data.touristTax}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Cambios recientes */}
      {data.keyChanges.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold text-gray-900">
            Cambios recientes y novedades 2025-2026
          </h2>
          <p className="mt-4 max-w-3xl text-gray-600">
            Actualizaciones normativas que afectan a los anfitriones en {data.ccaa}.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {data.keyChanges.map((change) => (
              <div key={change.title} className="rounded-xl border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-2">{change.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{change.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Por que manual digital */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold text-gray-900">
            Por que necesitas un manual digital en {data.ccaa}
          </h2>
          <p className="mt-4 max-w-3xl text-gray-600 leading-relaxed">
            {data.whyManualHelps}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-gray-800"
            >
              Crear manual gratis
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-8 py-3.5 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Ver demo
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="rounded-2xl bg-gray-900 px-8 py-16 text-center sm:px-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Cumple la normativa y mejora la experiencia de tus huespedes
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Itineramio te ayuda a incluir normas de convivencia, instrucciones de check-in y toda la informacion que tu huesped necesita.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Prueba gratis 15 dias. Sin tarjeta de credito.
          </p>
          <div className="mt-10">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3.5 text-base font-medium text-gray-900 transition-colors hover:bg-gray-100"
            >
              Empezar gratis
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
