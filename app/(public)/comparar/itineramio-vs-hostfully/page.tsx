import { Metadata } from 'next'
import Link from 'next/link'
import {
  Check,
  X,
  ArrowRight,
  QrCode,
  BarChart3,
  Star,
  Copy,
  Globe,
  Zap,
  Award,
  ChevronRight,
  Building2,
  Palette
} from 'lucide-react'
import { Navbar } from '../../../../src/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'Itineramio vs Hostfully 2025: Comparativa Completa | Mejor Alternativa',
  description: 'Comparativa detallada entre Itineramio y Hostfully Guidebooks. Descubre cuál es mejor para tu alojamiento: precios, duplicación masiva, personalización y más.',
  keywords: [
    'hostfully alternativa',
    'itineramio vs hostfully',
    'hostfully guidebooks español',
    'mejor software manuales airbnb',
    'comparativa hostfully',
    'hostfully vs touch stay'
  ],
  openGraph: {
    title: 'Itineramio vs Hostfully: Comparativa 2025',
    description: 'Análisis completo de precios y funcionalidades. Descubre la mejor opción para tu alojamiento.',
    type: 'article'
  }
}

// Comparison data
const features = [
  {
    category: 'Funcionalidades Clave',
    items: [
      {
        name: 'Duplicación masiva',
        itineramio: 'Hasta 50 props',
        hostfully: 'Límite 5',
        highlight: true,
        description: 'Copia configuraciones a múltiples propiedades'
      },
      {
        name: 'Personalización completa',
        itineramio: 'Incluida siempre',
        hostfully: 'Solo Premium',
        highlight: true,
        description: 'Colores, logo, diseño personalizado'
      },
      {
        name: 'QR Codes por zona',
        itineramio: true,
        hostfully: false,
        highlight: true,
        description: 'Genera QR individuales para cada área'
      },
      {
        name: 'Analytics por zona',
        itineramio: true,
        hostfully: false,
        description: 'Estadísticas detalladas de uso'
      },
      {
        name: 'Property Sets',
        itineramio: true,
        hostfully: false,
        description: 'Agrupa propiedades de un edificio'
      },
      {
        name: 'Sistema evaluaciones',
        itineramio: true,
        hostfully: false,
        description: 'Feedback integrado de huéspedes'
      },
    ]
  },
  {
    category: 'Experiencia de Usuario',
    items: [
      {
        name: 'Propiedades incluidas',
        itineramio: '2 en plan básico',
        hostfully: '1 gratis',
        highlight: true,
        description: 'Propiedades en el plan inicial'
      },
      {
        name: 'Trial sin tarjeta',
        itineramio: true,
        hostfully: false,
        description: 'Prueba sin compromiso'
      },
      {
        name: 'Soporte en español',
        itineramio: true,
        hostfully: false,
        description: 'Atención nativa en tu idioma'
      },
      {
        name: 'Interfaz en español',
        itineramio: true,
        hostfully: false,
        description: 'Dashboard completamente en español'
      },
    ]
  },
  {
    category: 'Integraciones',
    items: [
      {
        name: 'Airbnb',
        itineramio: true,
        hostfully: true,
        description: 'Compatible con Airbnb'
      },
      {
        name: 'Booking.com',
        itineramio: true,
        hostfully: true,
        description: 'Compatible con Booking'
      },
      {
        name: 'Vrbo',
        itineramio: true,
        hostfully: true,
        description: 'Compatible con Vrbo'
      },
      {
        name: 'Hostfully PMS',
        itineramio: false,
        hostfully: true,
        description: 'Integración nativa con su PMS'
      },
    ]
  }
]

export default function HostfullyComparisonPage() {
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
              <Award className="w-4 h-4" />
              Comparativa actualizada 2025
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Itineramio vs Hostfully
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-8 leading-relaxed">
              Compara los dos software de guidebooks más populares y elige el mejor para tu negocio
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
                href="#comparativa"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
              >
                Ver comparativa completa
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Verdict */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Itineramio */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-8 border-2 border-violet-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Itineramio</h3>
                  <p className="text-sm text-violet-600 font-medium">Recomendado para escalar</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Ideal si tienes múltiples propiedades y necesitas <strong>duplicación masiva</strong>, personalización incluida y QR codes por zona.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" /> Duplicación hasta 50 propiedades
                </li>
                <li className="flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" /> Personalización siempre incluida
                </li>
                <li className="flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" /> 2 propiedades en plan básico
                </li>
              </ul>
            </div>

            {/* Hostfully */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Hostfully</h3>
                  <p className="text-sm text-gray-500 font-medium">Con PMS integrado</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Buena opción si ya usas su PMS o necesitas solo 1 propiedad gratis. Limitaciones en duplicación y personalización.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-600">
                  <Check className="w-4 h-4" /> 1 propiedad gratis
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Check className="w-4 h-4" /> Integración con su PMS
                </li>
                <li className="flex items-center gap-2 text-red-600">
                  <X className="w-4 h-4" /> Duplicación limitada a 5
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Comparison Table */}
      <section id="comparativa" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Comparativa detallada de funcionalidades
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Análisis feature por feature para que tomes la mejor decisión
            </p>
          </div>

          <div className="space-y-8">
            {features.map((category) => (
              <div key={category.category} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">{category.category}</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 w-1/2">
                          Funcionalidad
                        </th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-violet-600 w-1/4">
                          Itineramio
                        </th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-teal-600 w-1/4">
                          Hostfully
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {category.items.map((item) => (
                        <tr
                          key={item.name}
                          className={item.highlight ? 'bg-violet-50/50' : 'hover:bg-gray-50'}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-3">
                              {item.highlight && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-700">
                                  Ventaja
                                </span>
                              )}
                              <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {item.itineramio === true ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                <Check className="w-5 h-5 text-green-600" />
                              </div>
                            ) : item.itineramio === false ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                                <X className="w-5 h-5 text-red-500" />
                              </div>
                            ) : (
                              <span className="text-sm font-medium text-violet-600">{item.itineramio}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {item.hostfully === true ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                <Check className="w-5 h-5 text-green-600" />
                              </div>
                            ) : item.hostfully === false ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                                <X className="w-5 h-5 text-red-500" />
                              </div>
                            ) : (
                              <span className="text-sm font-medium text-gray-600">{item.hostfully}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Comparativa de precios
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Más propiedades incluidas por menos dinero
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Itineramio Pricing */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-violet-200 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Itineramio</h3>
                    <p className="text-white/80 text-sm">Precios mensuales (€)</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-900">BASIC</p>
                    <p className="text-sm text-gray-500">Hasta 2 propiedades</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-violet-600">€9<span className="text-sm font-normal text-gray-500">/mes</span></p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-violet-50 rounded-xl border border-violet-200">
                  <div>
                    <p className="font-bold text-gray-900">HOST</p>
                    <p className="text-sm text-gray-500">Hasta 5 propiedades</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-violet-600">€29<span className="text-sm font-normal text-gray-500">/mes</span></p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-900">SUPERHOST</p>
                    <p className="text-sm text-gray-500">Hasta 10 propiedades</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-violet-600">€39<span className="text-sm font-normal text-gray-500">/mes</span></p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <ul className="text-sm text-gray-600 space-y-1 mb-4">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Personalización incluida en todos
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Duplicación hasta 50 propiedades
                    </li>
                  </ul>
                  <Link
                    href="/register"
                    className="block w-full text-center px-6 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors"
                  >
                    Probar 15 días gratis
                  </Link>
                </div>
              </div>
            </div>

            {/* Hostfully Pricing */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-teal-500 px-6 py-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Hostfully Guidebooks</h3>
                    <p className="text-white/80 text-sm">Precios mensuales ($USD)</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-900">Free</p>
                    <p className="text-sm text-gray-500">1 propiedad</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-700">$0<span className="text-sm font-normal text-gray-500">/mes</span></p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-900">Starter</p>
                    <p className="text-sm text-gray-500">Por propiedad adicional</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-700">$9.99<span className="text-sm font-normal text-gray-500">/mes</span></p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-900">Premium</p>
                    <p className="text-sm text-gray-500">Con personalización</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-700">$24.99<span className="text-sm font-normal text-gray-500">/mes</span></p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <ul className="text-sm text-gray-600 space-y-1 mb-4">
                    <li className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      Personalización solo en Premium
                    </li>
                    <li className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      Duplicación limitada a 5
                    </li>
                  </ul>
                  <a
                    href="https://www.hostfully.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Ver en Hostfully
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Differentiators */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Itineramio sobre Hostfully?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Funcionalidades que marcan la diferencia
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Duplicación masiva */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mb-6">
                <Copy className="w-7 h-7 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Duplicación Masiva</h3>
              <p className="text-gray-600 mb-4">
                Duplica configuraciones hasta en 50 propiedades a la vez. Ideal para property managers que escalan rápido.
              </p>
              <p className="text-sm text-violet-600 font-medium">
                Hostfully: Limitado a 5 propiedades
              </p>
            </div>

            {/* Personalización */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mb-6">
                <Palette className="w-7 h-7 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Personalización Incluida</h3>
              <p className="text-gray-600 mb-4">
                Colores, logo, diseño personalizado incluido en todos los planes. Sin costes extra por branding.
              </p>
              <p className="text-sm text-violet-600 font-medium">
                Hostfully: Solo en plan Premium ($24.99/mes)
              </p>
            </div>

            {/* Property Sets */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mb-6">
                <Building2 className="w-7 h-7 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Property Sets</h3>
              <p className="text-gray-600 mb-4">
                Agrupa propiedades de un edificio con zonas comunes compartidas (piscina, gimnasio, recepción).
              </p>
              <p className="text-sm text-violet-600 font-medium">
                Hostfully: No disponible
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ¿Hostfully Guidebooks es lo mismo que Hostfully PMS?
              </h3>
              <p className="text-gray-600">
                No. Hostfully tiene dos productos: el PMS (software de gestión de propiedades) y Guidebooks (manuales digitales). Itineramio compite directamente con Guidebooks, no con el PMS.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ¿Puedo usar Itineramio si ya uso Hostfully PMS?
              </h3>
              <p className="text-gray-600">
                Sí, Itineramio funciona de forma independiente. Puedes usar Hostfully para gestión de reservas e Itineramio para los manuales digitales de tus huéspedes.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ¿Por qué Hostfully limita la duplicación a 5 propiedades?
              </h3>
              <p className="text-gray-600">
                Es una limitación técnica de su plataforma. Itineramio fue diseñado desde cero para property managers con múltiples propiedades, permitiendo duplicación hasta 50 a la vez.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ¿Hostfully es más barato si solo tengo 1 propiedad?
              </h3>
              <p className="text-gray-600">
                Sí, Hostfully ofrece 1 propiedad gratis. Sin embargo, sin personalización y con funcionalidades limitadas. Si planeas crecer, Itineramio BASIC (€9/mes para 2 propiedades) es mejor inversión.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Escala sin límites con Itineramio
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Duplicación masiva, personalización incluida y sin restricciones artificiales.
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
              href="/comparar"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
            >
              Ver más comparativas
            </Link>
          </div>

          <p className="mt-8 text-sm text-white/70">
            ✓ 15 días gratis · ✓ Sin tarjeta de crédito · ✓ Soporte en español
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <section className="py-8 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-violet-600">Inicio</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/comparar" className="hover:text-violet-600">Comparativas</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Itineramio vs Hostfully</span>
          </div>
        </div>
      </section>
    </div>
  )
}
