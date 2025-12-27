import { Metadata } from 'next'
import Link from 'next/link'
import {
  Check,
  X,
  ArrowRight,
  QrCode,
  BarChart3,
  Star,
  CreditCard,
  Globe,
  Users,
  Zap,
  Shield,
  Clock,
  DollarSign,
  Award,
  ChevronRight
} from 'lucide-react'
import { Navbar } from '../../../../src/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'Itineramio vs Touch Stay 2025: Comparativa Completa | Mejor Alternativa',
  description: 'Comparativa detallada entre Itineramio y Touch Stay. Descubre cuál es mejor para tu alojamiento turístico: precios, funcionalidades, QR codes por zona y más.',
  keywords: [
    'touch stay alternativa',
    'itineramio vs touch stay',
    'touch stay español',
    'mejor software manuales airbnb',
    'comparativa touch stay',
    'alternativa touch stay españa'
  ],
  openGraph: {
    title: 'Itineramio vs Touch Stay: Comparativa 2025',
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
        name: 'QR Codes por zona',
        itineramio: true,
        touchStay: false,
        highlight: true,
        description: 'Genera QR individuales para WiFi, cocina, baño, etc.'
      },
      {
        name: 'Analytics por zona',
        itineramio: true,
        touchStay: false,
        highlight: true,
        description: 'Estadísticas detalladas de qué zonas visitan más'
      },
      {
        name: 'Sistema de evaluaciones',
        itineramio: true,
        touchStay: false,
        highlight: true,
        description: 'Recoge feedback de huéspedes integrado'
      },
      {
        name: 'Multi-idioma',
        itineramio: true,
        touchStay: 'Coste extra',
        description: 'Traducciones automáticas incluidas'
      },
      {
        name: 'Property Sets (edificios)',
        itineramio: true,
        touchStay: false,
        description: 'Agrupa propiedades con zonas comunes'
      },
      {
        name: 'Duplicación masiva',
        itineramio: 'Hasta 50',
        touchStay: 'Limitado',
        description: 'Duplica configuraciones rápidamente'
      },
    ]
  },
  {
    category: 'Experiencia de Usuario',
    items: [
      {
        name: 'Trial sin tarjeta',
        itineramio: true,
        touchStay: false,
        highlight: true,
        description: 'Prueba 15 días sin compromisos'
      },
      {
        name: 'Setup en 10 minutos',
        itineramio: true,
        touchStay: true,
        description: 'Configuración rápida e intuitiva'
      },
      {
        name: 'Soporte en español',
        itineramio: true,
        touchStay: false,
        description: 'Atención nativa en tu idioma'
      },
      {
        name: 'Interfaz en español',
        itineramio: true,
        touchStay: false,
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
        touchStay: true,
        description: 'Compatible con Airbnb'
      },
      {
        name: 'Booking.com',
        itineramio: true,
        touchStay: true,
        description: 'Compatible con Booking'
      },
      {
        name: 'Vrbo',
        itineramio: true,
        touchStay: true,
        description: 'Compatible con Vrbo'
      },
      {
        name: 'PMS populares',
        itineramio: 'Próximamente',
        touchStay: true,
        description: 'Integración con sistemas de gestión'
      },
    ]
  }
]

// Pricing comparison
const pricing = {
  itineramio: {
    starter: { name: 'BASIC', price: 9, properties: 2 },
    pro: { name: 'HOST', price: 29, properties: 5 },
    business: { name: 'SUPERHOST', price: 39, properties: 10 }
  },
  touchStay: {
    first: { price: 99, label: '1ª propiedad/año' },
    second: { price: 51, label: '2ª propiedad/año' },
    additional: { price: 45, label: 'Siguientes/año' }
  }
}

export default function TouchStayComparisonPage() {
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
              Itineramio vs Touch Stay
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-8 leading-relaxed">
              Análisis completo para elegir el mejor software de manuales digitales para tu alojamiento turístico
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
                  <p className="text-sm text-violet-600 font-medium">Recomendado</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Ideal para property managers en España y Latinoamérica que buscan <strong>QR codes por zona</strong>, analytics detallados y soporte en español.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" /> 25% más económico
                </li>
                <li className="flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" /> QR individuales por zona (único)
                </li>
                <li className="flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" /> Trial sin tarjeta de crédito
                </li>
              </ul>
            </div>

            {/* Touch Stay */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-400 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Touch Stay</h3>
                  <p className="text-sm text-gray-500 font-medium">Establecido desde 2016</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Pionero en el mercado con buena reputación internacional. Mejor opción si necesitas integraciones avanzadas con PMS específicos.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-600">
                  <Check className="w-4 h-4" /> 8+ años en el mercado
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Check className="w-4 h-4" /> Muchas integraciones PMS
                </li>
                <li className="flex items-center gap-2 text-red-600">
                  <X className="w-4 h-4" /> Sin QR por zona
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
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600 w-1/4">
                          Touch Stay
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
                                  Exclusivo
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
                            {item.touchStay === true ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                <Check className="w-5 h-5 text-green-600" />
                              </div>
                            ) : item.touchStay === false ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                                <X className="w-5 h-5 text-red-500" />
                              </div>
                            ) : (
                              <span className="text-sm font-medium text-gray-600">{item.touchStay}</span>
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
              Itineramio es hasta un 25% más económico con más funcionalidades incluidas
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
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>Ejemplo:</strong> 5 propiedades = <strong>€29/mes</strong> (€348/año)
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

            {/* Touch Stay Pricing */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Touch Stay</h3>
                    <p className="text-gray-500 text-sm">Precios anuales ($USD)</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-900">1ª propiedad</p>
                    <p className="text-sm text-gray-500">Pago anual</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-700">$99<span className="text-sm font-normal text-gray-500">/año</span></p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-900">2ª propiedad</p>
                    <p className="text-sm text-gray-500">Pago anual</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-700">$51<span className="text-sm font-normal text-gray-500">/año</span></p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-900">Siguientes</p>
                    <p className="text-sm text-gray-500">Por propiedad/año</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-700">$45<span className="text-sm font-normal text-gray-500">/año</span></p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>Ejemplo:</strong> 5 propiedades = <strong>$375/año</strong> (~€350)
                  </p>
                  <p className="text-xs text-red-600 mb-4">
                    * Requiere tarjeta de crédito para trial
                  </p>
                  <a
                    href="https://www.touchstay.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Ver en Touch Stay
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
              ¿Por qué elegir Itineramio?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Funcionalidades exclusivas que Touch Stay no ofrece
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* QR por zona */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mb-6">
                <QrCode className="w-7 h-7 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">QR Codes por Zona</h3>
              <p className="text-gray-600 mb-4">
                Genera códigos QR individuales para cada zona: WiFi, cocina, baño, terraza... El huésped escanea solo lo que necesita.
              </p>
              <p className="text-sm text-violet-600 font-medium">
                Touch Stay: Solo 1 QR para toda la propiedad
              </p>
            </div>

            {/* Analytics */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics Granulares</h3>
              <p className="text-gray-600 mb-4">
                Descubre qué zonas visitan más tus huéspedes, cuánto tiempo pasan, y optimiza tu manual basándote en datos reales.
              </p>
              <p className="text-sm text-violet-600 font-medium">
                Touch Stay: Sin analytics por zona
              </p>
            </div>

            {/* Evaluaciones */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mb-6">
                <Star className="w-7 h-7 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sistema de Evaluaciones</h3>
              <p className="text-gray-600 mb-4">
                Recoge feedback de huéspedes directamente integrado. Mejora tu servicio antes de que dejen una mala reseña pública.
              </p>
              <p className="text-sm text-violet-600 font-medium">
                Touch Stay: Sin sistema de feedback
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
                ¿Puedo migrar de Touch Stay a Itineramio?
              </h3>
              <p className="text-gray-600">
                Sí, puedes crear tus manuales en Itineramio manteniendo Touch Stay activo durante la transición. No hay bloqueo de datos ni penalizaciones por cambiar.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ¿Itineramio funciona en otros idiomas además del español?
              </h3>
              <p className="text-gray-600">
                Sí, Itineramio soporta múltiples idiomas para los manuales de huéspedes. La interfaz de administración está en español, pero tus huéspedes pueden ver el contenido en su idioma preferido.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ¿Qué pasa si necesito más de 10 propiedades?
              </h3>
              <p className="text-gray-600">
                Ofrecemos el plan BUSINESS para gestores con más de 10 propiedades, con precios personalizados y soporte prioritario. Contacta con nosotros para una cotización.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ¿Touch Stay tiene mejor soporte?
              </h3>
              <p className="text-gray-600">
                Touch Stay tiene un equipo grande pero su soporte es en inglés. Itineramio ofrece soporte nativo en español con tiempos de respuesta más rápidos para el mercado hispanohablante.
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
              href="/comparar"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
            >
              Ver más comparativas
            </Link>
          </div>

          <p className="mt-8 text-sm text-white/70">
            ✓ Setup en 10 minutos · ✓ Soporte en español · ✓ Sin permanencia
          </p>
        </div>
      </section>

      {/* Breadcrumb / Related */}
      <section className="py-8 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-violet-600">Inicio</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/comparar" className="hover:text-violet-600">Comparativas</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Itineramio vs Touch Stay</span>
          </div>
        </div>
      </section>
    </div>
  )
}
