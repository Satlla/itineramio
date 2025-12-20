import { Metadata } from 'next'
import Link from 'next/link'
import { LEAD_MAGNETS } from '@/data/lead-magnets'
import {
  TrendingUp,
  ListChecks,
  Sparkles,
  Flame,
  ShieldCheck,
  Heart,
  Scale,
  Zap,
  Download,
  ArrowRight,
  Calculator,
  Star,
  QrCode,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Recursos Gratuitos para Anfitriones | Itineramio',
  description:
    'Guías prácticas y recursos gratuitos para hacer crecer tu negocio de alquiler vacacional. Descarga las guías según tu perfil de anfitrión.',
  openGraph: {
    title: 'Recursos Gratuitos para Anfitriones | Itineramio',
    description:
      'Guías prácticas y recursos gratuitos para hacer crecer tu negocio de alquiler vacacional.',
    type: 'website',
  },
}

const iconMap = {
  TrendingUp,
  ListChecks,
  Sparkles,
  Flame,
  ShieldCheck,
  Heart,
  Scale,
  Zap,
}

export default function RecursosPage() {
  const leadMagnets = Object.values(LEAD_MAGNETS)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">100% Gratis</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Recursos Gratuitos para Anfitriones
            </h1>

            <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 text-white/90">
              Guías prácticas según tu perfil. Elige la que más se adapta a tu
              forma de gestionar tu alquiler vacacional.
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                <span>Descarga inmediata</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>Sin spam</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span>Contenido accionable</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Herramientas Interactivas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Herramientas Interactivas
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Calculadoras y herramientas online para analizar tu negocio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Link
            href="/hub/calculadora-rentabilidad"
            className="group bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-8 text-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Calculator className="w-7 h-7" />
              </div>
              <span className="text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                Nuevo
              </span>
            </div>
            <h3 className="font-bold text-2xl mb-2">
              Calculadora de Rentabilidad
            </h3>
            <p className="text-white/90 mb-4">
              Descubre si estás ganando dinero o solo "cambiando dinero de mano".
              Calcula tu precio mínimo viable y tu ganancia real por hora.
            </p>
            <div className="flex items-center text-white font-semibold group-hover:translate-x-1 transition-transform">
              <span>Usar calculadora</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </div>
          </Link>

          <Link
            href="/hub/tools/pricing-calculator"
            className="group bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-8 text-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7" />
              </div>
              <span className="text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                Popular
              </span>
            </div>
            <h3 className="font-bold text-2xl mb-2">
              Calculadora de Precios Airbnb
            </h3>
            <p className="text-white/90 mb-4">
              Calcula el precio óptimo para tu alojamiento según ubicación,
              temporada y servicios que ofreces.
            </p>
            <div className="flex items-center text-white font-semibold group-hover:translate-x-1 transition-transform">
              <span>Usar calculadora</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </div>
          </Link>

          <Link
            href="/recursos/plantilla-estrellas-personalizada"
            className="group bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl p-8 text-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Star className="w-7 h-7" />
              </div>
              <span className="text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                Nuevo
              </span>
            </div>
            <h3 className="font-bold text-2xl mb-2">
              Plantilla Significado Estrellas
            </h3>
            <p className="text-white/90 mb-4">
              Genera una plantilla personalizada con tu nombre y código QR de
              WhatsApp. Lista para imprimir y dejar en tu alojamiento.
            </p>
            <div className="flex items-center text-white font-semibold group-hover:translate-x-1 transition-transform">
              <span>Personalizar plantilla</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </div>
          </Link>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Guías Descargables
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            PDFs y recursos según tu perfil de anfitrión
          </p>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {leadMagnets.map((leadMagnet) => {
            const Icon =
              iconMap[leadMagnet.icon as keyof typeof iconMap] || TrendingUp
            const colorClasses = {
              blue: 'from-blue-600 to-blue-700',
              purple: 'from-purple-600 to-purple-700',
              orange: 'from-orange-600 to-orange-700',
              red: 'from-red-600 to-red-700',
              green: 'from-green-600 to-green-700',
              pink: 'from-pink-600 to-pink-700',
              teal: 'from-teal-600 to-teal-700',
              yellow: 'from-yellow-500 to-yellow-600',
            }
            const gradientClass =
              colorClasses[leadMagnet.color as keyof typeof colorClasses]

            return (
              <Link
                key={leadMagnet.slug}
                href={`/recursos/${leadMagnet.slug}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Color Header */}
                <div
                  className={`bg-gradient-to-r ${gradientClass} p-6 text-white`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                      {leadMagnet.pages} páginas
                    </span>
                  </div>

                  <h3 className="font-bold text-xl mb-2">
                    {leadMagnet.title}
                  </h3>
                  <p className="text-sm text-white/90">{leadMagnet.subtitle}</p>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {leadMagnet.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                    <span>{leadMagnet.downloadables.length} recursos</span>
                    <span>100% gratis</span>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between text-blue-600 font-semibold group-hover:text-blue-700">
                    <span>Descargar ahora</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Quieres automatizar tu negocio?
          </h2>
          <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
            Prueba Itineramio gratis durante 15 días y descubre cómo puedes
            ahorrar hasta 30 horas al mes.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Explorar Itineramio
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
