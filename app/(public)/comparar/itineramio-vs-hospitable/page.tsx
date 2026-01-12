import { Metadata } from 'next'
import Link from 'next/link'
import {
  Check,
  X,
  ArrowRight,
  QrCode,
  BarChart3,
  DollarSign,
  Globe,
  Zap,
  Award,
  ChevronRight,
  MessageSquare,
  Calendar,
  Settings
} from 'lucide-react'
import { Navbar } from '../../../../src/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'Itineramio vs Hospitable 2025: Comparativa | PMS vs Software Manuales',
  description: 'Comparativa entre Itineramio y Hospitable. Descubre las diferencias: Hospitable es un PMS completo, Itineramio se especializa en manuales digitales. ¿Cuál necesitas?',
  keywords: [
    'hospitable alternativa',
    'itineramio vs hospitable',
    'hospitable manuales digitales',
    'hospitable vs touch stay',
    'software gestión airbnb',
    'hospitable precios'
  ],
  openGraph: {
    title: 'Itineramio vs Hospitable: Comparativa 2025',
    description: 'PMS completo vs Especialista en manuales digitales. Descubre cuál es mejor para ti.',
    type: 'article',
    images: [
      {
        url: 'https://www.itineramio.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Itineramio vs Hospitable Comparativa',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Itineramio vs Hospitable: Comparativa 2025',
    description: 'PMS completo vs Especialista en manuales digitales. Descubre cuál es mejor para ti.',
    images: ['https://www.itineramio.com/og-image.jpg'],
  }
}

// Comparison data
const features = [
  {
    category: 'Tipo de Producto',
    items: [
      {
        name: 'Enfoque principal',
        itineramio: 'Manuales digitales',
        hospitable: 'PMS completo',
        description: 'Cada uno se especializa en algo diferente'
      },
      {
        name: 'Automatización mensajes',
        itineramio: false,
        hospitable: true,
        description: 'Mensajes automáticos a huéspedes'
      },
      {
        name: 'Gestión de reservas',
        itineramio: false,
        hospitable: true,
        description: 'Sincronización calendarios'
      },
      {
        name: 'Manuales digitales',
        itineramio: true,
        hospitable: 'Básico',
        highlight: true,
        description: 'Guías interactivas para huéspedes'
      },
    ]
  },
  {
    category: 'Funcionalidades de Manuales',
    items: [
      {
        name: 'QR Codes por zona',
        itineramio: true,
        hospitable: false,
        highlight: true,
        description: 'QR individuales para cada área'
      },
      {
        name: 'Analytics detallados',
        itineramio: true,
        hospitable: false,
        highlight: true,
        description: 'Estadísticas de uso por zona'
      },
      {
        name: 'Sistema evaluaciones',
        itineramio: true,
        hospitable: false,
        description: 'Feedback integrado de huéspedes'
      },
      {
        name: 'Property Sets',
        itineramio: true,
        hospitable: false,
        description: 'Agrupar propiedades con zonas comunes'
      },
      {
        name: 'Duplicación masiva',
        itineramio: 'Hasta 50',
        hospitable: 'N/A',
        description: 'Copiar configuraciones rápidamente'
      },
    ]
  },
  {
    category: 'Precio y Valor',
    items: [
      {
        name: 'Precio base',
        itineramio: '€9/mes',
        hospitable: '$29/mes',
        highlight: true,
        description: 'Coste mensual inicial'
      },
      {
        name: 'Por propiedad adicional',
        itineramio: 'Incluido en plan',
        hospitable: '+$10/mes',
        highlight: true,
        description: 'Coste por cada propiedad extra'
      },
      {
        name: 'Trial sin tarjeta',
        itineramio: true,
        hospitable: true,
        description: 'Prueba sin compromiso'
      },
    ]
  }
]

export default function HospitableComparisonPage() {
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
              Itineramio vs Hospitable
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-8 leading-relaxed">
              Especialista en manuales digitales vs PMS completo: ¿cuál necesitas realmente?
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

      {/* Important Notice */}
      <section className="py-8 bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Settings className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 mb-1">Nota importante: Son productos diferentes</h3>
              <p className="text-amber-800 text-sm">
                <strong>Hospitable</strong> es un PMS completo (gestión de reservas, mensajes automáticos, sincronización).
                <strong> Itineramio</strong> se especializa en manuales digitales para huéspedes.
                Muchos property managers usan ambos: Hospitable para gestión y Itineramio para manuales.
              </p>
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
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Itineramio</h3>
                  <p className="text-sm text-violet-600 font-medium">Especialista en manuales</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Perfecto si solo necesitas <strong>manuales digitales profesionales</strong> con QR por zona, analytics y evaluaciones. Más económico y especializado.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" /> Desde €9/mes (hasta 2 props)
                </li>
                <li className="flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" /> QR codes por zona (exclusivo)
                </li>
                <li className="flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" /> Analytics detallados
                </li>
              </ul>
            </div>

            {/* Hospitable */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Hospitable</h3>
                  <p className="text-sm text-gray-500 font-medium">PMS completo</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Ideal si necesitas <strong>gestión completa</strong>: reservas, mensajes automáticos, sincronización de calendarios y más.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-600">
                  <Check className="w-4 h-4" /> Gestión de reservas
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Check className="w-4 h-4" /> Mensajes automáticos
                </li>
                <li className="flex items-center gap-2 text-red-600">
                  <X className="w-4 h-4" /> Manuales muy básicos
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
              Comparativa de funcionalidades
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Diferentes herramientas para diferentes necesidades
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
                        <th className="text-center px-6 py-4 text-sm font-semibold text-blue-600 w-1/4">
                          Hospitable
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
                                  Destacado
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
                            {item.hospitable === true ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                <Check className="w-5 h-5 text-green-600" />
                              </div>
                            ) : item.hospitable === false ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                                <X className="w-5 h-5 text-red-500" />
                              </div>
                            ) : (
                              <span className="text-sm font-medium text-gray-600">{item.hospitable}</span>
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
              Paga solo por lo que necesitas
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Itineramio Pricing */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-violet-200 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Itineramio</h3>
                    <p className="text-white/80 text-sm">Solo manuales digitales (€)</p>
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
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>5 propiedades:</strong> €29/mes = <strong>€5.80/propiedad</strong>
                  </p>
                  <Link
                    href="/register"
                    className="block w-full text-center px-6 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors"
                  >
                    Probar 15 días gratis
                  </Link>
                </div>
              </div>
            </div>

            {/* Hospitable Pricing */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-blue-500 px-6 py-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Hospitable</h3>
                    <p className="text-white/80 text-sm">PMS completo ($USD)</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-900">Base</p>
                    <p className="text-sm text-gray-500">1 propiedad</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-700">$29<span className="text-sm font-normal text-gray-500">/mes</span></p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-900">+ Propiedades</p>
                    <p className="text-sm text-gray-500">Por cada adicional</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-700">+$10<span className="text-sm font-normal text-gray-500">/mes</span></p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                  <div>
                    <p className="font-bold text-gray-900">5 propiedades</p>
                    <p className="text-sm text-gray-500">Ejemplo de coste total</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">$69<span className="text-sm font-normal text-gray-500">/mes</span></p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>5 propiedades:</strong> $69/mes = <strong>$13.80/propiedad</strong>
                  </p>
                  <p className="text-xs text-amber-600 mb-4">
                    * Incluye PMS completo, no solo manuales
                  </p>
                  <a
                    href="https://www.hospitable.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Ver en Hospitable
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* When to use which */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              ¿Cuál elegir?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Depende de lo que necesites
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Elige Itineramio si... */}
            <div className="bg-violet-50 rounded-2xl p-8 border border-violet-200">
              <h3 className="text-xl font-bold text-violet-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Elige Itineramio si...
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" />
                  <span>Solo necesitas <strong>manuales digitales profesionales</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" />
                  <span>Quieres <strong>QR codes por zona</strong> (WiFi, cocina, etc.)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" />
                  <span>Necesitas <strong>analytics detallados</strong> de uso</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" />
                  <span>Ya tienes un PMS o gestionas reservas manualmente</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" />
                  <span>Buscas la opción más <strong>económica</strong> para manuales</span>
                </li>
              </ul>
            </div>

            {/* Elige Hospitable si... */}
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200">
              <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Elige Hospitable si...
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Necesitas <strong>gestión completa de reservas</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Quieres <strong>mensajes automáticos</strong> a huéspedes</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Necesitas <strong>sincronizar calendarios</strong> entre plataformas</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Buscas una <strong>solución todo-en-uno</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Los manuales básicos son suficientes para ti</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Combo suggestion */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-violet-100 to-blue-100 rounded-2xl p-8 border border-violet-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    ¿Por qué no ambos?
                  </h3>
                  <p className="text-gray-600">
                    Muchos property managers profesionales usan <strong>Hospitable para gestión</strong> (reservas, mensajes, calendarios)
                    e <strong>Itineramio para manuales</strong> (QR por zona, analytics, evaluaciones).
                    Obtienes lo mejor de ambos mundos.
                  </p>
                </div>
              </div>
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
                ¿Hospitable tiene manuales digitales?
              </h3>
              <p className="text-gray-600">
                Sí, pero son muy básicos. Hospitable se centra en gestión de reservas y mensajes. Si quieres manuales profesionales con QR por zona y analytics, Itineramio es la mejor opción.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ¿Puedo usar Itineramio junto con Hospitable?
              </h3>
              <p className="text-gray-600">
                Sí, funcionan de forma complementaria. Hospitable gestiona tus reservas y mensajes automáticos, mientras Itineramio proporciona manuales digitales profesionales a tus huéspedes.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ¿Hospitable es más caro?
              </h3>
              <p className="text-gray-600">
                Hospitable es más caro porque incluye más funcionalidades (PMS completo). Si solo necesitas manuales digitales, Itineramio es significativamente más económico: €9/mes vs $29+$10/propiedad.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ¿Necesito un PMS como Hospitable?
              </h3>
              <p className="text-gray-600">
                Depende de tu volumen. Si tienes 1-5 propiedades y gestionas reservas directamente en Airbnb/Booking, probablemente no. Si tienes más propiedades o múltiples canales, un PMS puede ahorrarte mucho tiempo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Manuales digitales profesionales desde €9/mes
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Especialízate en la experiencia del huésped con QR por zona, analytics y evaluaciones.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-violet-600 font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Probar Itineramio gratis
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
            ✓ 15 días gratis · ✓ Sin tarjeta de crédito · ✓ Compatible con cualquier PMS
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
            <span className="text-gray-900">Itineramio vs Hospitable</span>
          </div>
        </div>
      </section>
    </div>
  )
}
