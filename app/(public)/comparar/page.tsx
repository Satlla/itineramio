import { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  X,
  Award,
  Globe,
  Zap,
  Calendar,
  ChevronRight,
  Scale,
  TrendingUp,
  Users
} from 'lucide-react'
import { Navbar } from '../../../src/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'Comparativas: Itineramio vs Competencia | Touch Stay, Hostfully, Hospitable',
  description: 'Compara Itineramio con Touch Stay, Hostfully y Hospitable. Análisis detallado de precios, funcionalidades y ventajas. Encuentra el mejor software de manuales digitales.',
  keywords: [
    'comparativa software manuales airbnb',
    'touch stay vs hostfully',
    'mejor software manuales digitales',
    'alternativa touch stay',
    'hostfully vs hospitable',
    'software gestion alquiler vacacional'
  ],
  openGraph: {
    title: 'Comparativas de Software para Alojamientos Turísticos',
    description: 'Análisis detallado de Itineramio vs Touch Stay, Hostfully y Hospitable. Precios, funcionalidades y recomendaciones.',
    type: 'website',
    images: [
      {
        url: 'https://www.itineramio.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Comparativas Itineramio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comparativas de Software para Alojamientos Turísticos',
    description: 'Análisis detallado de Itineramio vs Touch Stay, Hostfully y Hospitable.',
    images: ['https://www.itineramio.com/og-image.jpg'],
  }
}

const comparisons = [
  {
    slug: 'itineramio-vs-touch-stay',
    competitor: 'Touch Stay',
    competitorIcon: Globe,
    competitorColor: 'bg-gray-400',
    tagline: 'El líder del mercado',
    description: 'Touch Stay es el software de manuales más conocido a nivel mundial. Compara precios, funcionalidades y descubre por qué Itineramio es la mejor alternativa en español.',
    highlights: [
      { label: 'Duplicación masiva (50 props)', positive: true },
      { label: 'QR por zona (exclusivo)', positive: true },
      { label: 'Soporte en español', positive: true },
    ],
    popular: true
  },
  {
    slug: 'itineramio-vs-hostfully',
    competitor: 'Hostfully',
    competitorIcon: Globe,
    competitorColor: 'bg-teal-500',
    tagline: 'Con PMS integrado',
    description: 'Hostfully ofrece guidebooks y PMS. Compara las diferencias en duplicación masiva, personalización y precios para elegir la mejor opción.',
    highlights: [
      { label: 'Duplicación hasta 50 props', positive: true },
      { label: 'Personalización incluida', positive: true },
      { label: '2 props en plan básico', positive: true },
    ],
    popular: false
  },
  {
    slug: 'itineramio-vs-hospitable',
    competitor: 'Hospitable',
    competitorIcon: Calendar,
    competitorColor: 'bg-blue-500',
    tagline: 'PMS completo vs Especialista',
    description: 'Hospitable es un PMS completo (reservas, mensajes). Itineramio se especializa en manuales. ¿Cuál necesitas? ¿O ambos?',
    highlights: [
      { label: 'Desde €9/mes vs $29+', positive: true },
      { label: 'Analytics detallados', positive: true },
      { label: 'Compatible con cualquier PMS', positive: true },
    ],
    popular: false
  }
]

const quickComparison = [
  {
    feature: 'QR Codes por zona',
    itineramio: true,
    touchStay: false,
    hostfully: false,
    hospitable: false
  },
  {
    feature: 'Analytics por zona',
    itineramio: true,
    touchStay: false,
    hostfully: false,
    hospitable: false
  },
  {
    feature: 'Sistema evaluaciones',
    itineramio: true,
    touchStay: false,
    hostfully: false,
    hospitable: false
  },
  {
    feature: 'Trial sin tarjeta',
    itineramio: true,
    touchStay: false,
    hostfully: false,
    hospitable: true
  },
  {
    feature: 'Soporte en español',
    itineramio: true,
    touchStay: false,
    hostfully: false,
    hospitable: false
  },
  {
    feature: 'Personalización incluida',
    itineramio: true,
    touchStay: 'Extra',
    hostfully: 'Premium',
    hospitable: false
  },
  {
    feature: 'Desde (mensual)',
    itineramio: '€9',
    touchStay: '~€8',
    hostfully: '$0 (1 prop)',
    hospitable: '$29'
  }
]

export default function CompararIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -ml-48 -mb-48"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6">
              <Scale className="w-4 h-4" />
              Comparativas actualizadas 2025
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Compara Itineramio con la competencia
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-8 leading-relaxed">
              Análisis detallado de precios, funcionalidades y ventajas frente a Touch Stay, Hostfully y Hospitable
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-violet-600 font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                Probar Itineramio gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a
                href="#comparativas"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
              >
                Ver comparativas
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Comparison Table */}
      <section className="py-16 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comparativa rápida
            </h2>
            <p className="text-gray-600">
              Vista general de las funcionalidades clave
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-600">Funcionalidad</th>
                  <th className="text-center py-4 px-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center mb-2">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-violet-600">Itineramio</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center mb-2">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-gray-600">Touch Stay</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center mb-2">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-gray-600">Hostfully</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-gray-600">Hospitable</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quickComparison.map((row) => (
                  <tr key={row.feature} className="hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {row.itineramio === true ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                      ) : row.itineramio === false ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                          <X className="w-5 h-5 text-red-500" />
                        </div>
                      ) : (
                        <span className="font-semibold text-violet-600">{row.itineramio}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.touchStay === true ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                      ) : row.touchStay === false ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                          <X className="w-5 h-5 text-red-500" />
                        </div>
                      ) : (
                        <span className="text-sm text-gray-600">{row.touchStay}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.hostfully === true ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                      ) : row.hostfully === false ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                          <X className="w-5 h-5 text-red-500" />
                        </div>
                      ) : (
                        <span className="text-sm text-gray-600">{row.hostfully}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.hospitable === true ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                      ) : row.hospitable === false ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                          <X className="w-5 h-5 text-red-500" />
                        </div>
                      ) : (
                        <span className="text-sm text-gray-600">{row.hospitable}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Comparison Cards */}
      <section id="comparativas" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Comparativas detalladas
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Análisis completo feature por feature, precios y recomendaciones
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {comparisons.map((comp) => {
              const Icon = comp.competitorIcon
              return (
                <Link
                  key={comp.slug}
                  href={`/comparar/${comp.slug}`}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-gray-400 font-bold">vs</span>
                        <div className={`w-10 h-10 ${comp.competitorColor} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      {comp.popular && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                          Popular
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-violet-600 transition-colors">
                      Itineramio vs {comp.competitor}
                    </h3>
                    <p className="text-sm text-gray-500">{comp.tagline}</p>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {comp.description}
                    </p>

                    <div className="space-y-2 mb-6">
                      {comp.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          {h.positive ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-red-500" />
                          )}
                          <span className={h.positive ? 'text-green-700' : 'text-red-700'}>
                            {h.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center text-violet-600 font-semibold group-hover:gap-2 transition-all">
                      Ver comparativa completa
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Itineramio */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué Itineramio gana?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Funcionalidades exclusivas que ningún competidor ofrece
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mb-6">
                <Award className="w-7 h-7 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">QR Codes por Zona</h3>
              <p className="text-gray-600">
                Somos los únicos con QR individuales para cada zona: WiFi, cocina, baño, terraza... El huésped escanea solo lo que necesita.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics Granulares</h3>
              <p className="text-gray-600">
                Descubre qué zonas visitan más, cuánto tiempo pasan, y qué información buscan. Optimiza tu manual con datos reales.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Feedback Integrado</h3>
              <p className="text-gray-600">
                Sistema de evaluaciones incorporado. Recoge feedback de huéspedes antes de que dejen una mala reseña pública.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Prueba Itineramio sin compromiso
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            15 días de prueba gratuita. Sin tarjeta de crédito. Cancela cuando quieras.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-violet-600 font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Empezar prueba gratuita
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/hub/calculadora"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
            >
              Calcular ahorro
            </Link>
          </div>

          <p className="mt-8 text-sm text-white/70">
            ✓ Setup en 10 minutos · ✓ Soporte en español · ✓ Sin permanencia
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <section className="py-8 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-violet-600">Inicio</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Comparativas</span>
          </div>
        </div>
      </section>
    </div>
  )
}
