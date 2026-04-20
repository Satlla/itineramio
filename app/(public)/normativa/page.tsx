import Link from 'next/link'
import { ItineramioLogo } from '@/components/ui/ItineramioLogo'

const comunidades = [
  {
    name: 'Comunidad de Madrid',
    slug: 'madrid',
    mainLaw: 'Decreto 79/2014',
    description: 'Declaracion responsable ante la Comunidad de Madrid. Sin tasa turistica.',
    cities: ['Madrid'],
  },
  {
    name: 'Cataluna',
    slug: 'cataluna',
    mainLaw: 'Llei 13/2002, Decret 75/2020',
    description: 'PEUAT, moratoria en Barcelona, tasa turistica de 9,50 EUR/persona/dia en Barcelona.',
    cities: ['Barcelona'],
  },
  {
    name: 'Comunitat Valenciana',
    slug: 'comunitat-valenciana',
    mainLaw: 'Ley 15/2018, Decreto 10/2021',
    description: 'Informe de compatibilidad urbanistica obligatorio. Limite de 10 dias continuados.',
    cities: ['Valencia', 'Alicante'],
  },
  {
    name: 'Andalucia',
    slug: 'andalucia',
    mainLaw: 'Decreto 28/2016',
    description: 'Registro autonomico de viviendas con fines turisticos. Alta actividad inspectora.',
    cities: ['Sevilla', 'Malaga', 'Granada'],
  },
  {
    name: 'Canarias',
    slug: 'canarias',
    mainLaw: 'Decreto 113/2015, Ley 6/2025',
    description: 'Declaracion responsable y nueva ley de ordenacion sostenible del uso turistico.',
    cities: ['Las Palmas', 'Tenerife Sur'],
  },
  {
    name: 'Islas Baleares',
    slug: 'baleares',
    mainLaw: 'Ley 8/2012',
    description: 'Sistema de plazas turisticas, moratoria severa, Impuesto sobre Estancias Turisticas.',
    cities: ['Palma de Mallorca'],
  },
]

export default function NormativaIndexPage() {
  return (
    <div className="min-h-screen bg-white">
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

      {/* Hero */}
      <header className="mx-auto max-w-6xl px-6 pt-20 pb-16">
        <p className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-4">
          Guia de normativa
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl leading-tight">
          Normativa de Vivienda Turistica{' '}
          <br className="hidden sm:block" />
          en Espana por Comunidades
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-gray-600 leading-relaxed">
          Cada comunidad autonoma tiene su propia regulacion para viviendas de uso turistico. Consulta los requisitos, leyes y obligaciones que aplican a tu zona para operar legalmente.
        </p>
      </header>

      {/* Marco estatal */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Marco estatal comun a todas las CCAA
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                Registro Unico de Arrendamientos
              </h3>
              <p className="text-sm text-gray-600">
                Desde julio de 2025 es obligatorio el numero estatal de alquiler de corta duracion para publicar en plataformas (RD 1312/2024).
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                Registro de viajeros (SES.Hospedajes)
              </h3>
              <p className="text-sm text-gray-600">
                El RD 933/2021 obliga a comunicar datos de viajeros. Se tramita por SES.Hospedajes en la mayoria de CCAA (excepto Cataluna y Pais Vasco).
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                Ley de Propiedad Horizontal
              </h3>
              <p className="text-sm text-gray-600">
                Las comunidades de propietarios pueden limitar el uso turistico. El registro estatal comprueba posibles acuerdos comunitarios contrarios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de CCAA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-10">
          Selecciona tu comunidad autonoma
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {comunidades.map((ccaa) => (
            <Link
              key={ccaa.slug}
              href={`/normativa/${ccaa.slug}`}
              className="group rounded-xl border border-gray-200 p-6 transition-all hover:border-gray-400 hover:shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700">
                {ccaa.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{ccaa.mainLaw}</p>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                {ccaa.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {ccaa.cities.map((city) => (
                  <span
                    key={city}
                    className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                  >
                    {city}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm font-medium text-gray-900 group-hover:text-gray-700">
                Ver normativa completa &rarr;
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-12 pb-24">
        <div className="rounded-2xl bg-gray-900 px-8 py-16 text-center sm:px-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Cumple la normativa con un manual digital profesional
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Incluye normas de convivencia, instrucciones de check-in y toda la informacion que tu huesped necesita. En su idioma.
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

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="text-lg font-semibold text-gray-900">
              Itineramio
            </Link>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/blog" className="hover:text-gray-900 transition-colors">Blog</Link>
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
