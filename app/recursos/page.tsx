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
  Lock,
  Clock,
  FileText,
  Wifi,
  BarChart3,
  CheckSquare,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Recursos Gratuitos para Anfitriones | Itineramio',
  description:
    'Herramientas, plantillas y guías gratuitas para hacer crecer tu negocio de alquiler vacacional. Calculadoras, checklists y recursos descargables.',
  openGraph: {
    title: 'Recursos Gratuitos para Anfitriones | Itineramio',
    description:
      'Herramientas, plantillas y guías gratuitas para hacer crecer tu negocio de alquiler vacacional.',
    type: 'website',
    images: [
      {
        url: 'https://www.itineramio.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Recursos Gratuitos Itineramio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recursos Gratuitos para Anfitriones | Itineramio',
    description: 'Herramientas, plantillas y guías gratuitas para hacer crecer tu negocio de alquiler vacacional.',
    images: ['https://www.itineramio.com/og-image.jpg'],
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

// Active tools
const activeTools = [
  {
    id: 'time-calculator',
    title: 'Calculadora de Tiempo',
    description: 'Descubre cuantas horas pierdes al ano en tareas repetitivas y como automatizarlas.',
    icon: Clock,
    color: 'from-[#FF385C] to-[#E31C5F]',
    href: '/hub/tools/time-calculator',
    badge: 'Nuevo',
  },
  {
    id: 'cleaning-checklist',
    title: 'Checklist de Limpieza Profesional',
    description: 'Lista interactiva con 50+ items para que tu equipo no se deje nada. Personalizable y descargable.',
    icon: Sparkles,
    color: 'from-emerald-500 to-green-600',
    href: '/hub/tools/cleaning-checklist',
    badge: 'Popular',
  },
  {
    id: 'plantilla-reviews',
    title: 'Plantilla de Reviews',
    description: 'PDF personalizado que explica el significado de las estrellas + QR de WhatsApp para contacto directo.',
    icon: Star,
    color: 'from-rose-500 to-orange-500',
    href: '/recursos/plantilla-reviews',
    badge: 'Popular',
  },
  {
    id: 'star-rating',
    title: 'Plantilla Significado Estrellas',
    description: 'Educa a tus huespedes sobre las valoraciones de Airbnb. Personalizada con tu alojamiento.',
    icon: Star,
    color: 'from-[#FF385C] to-[#E31C5F]',
    href: '/recursos/plantilla-estrellas-personalizada',
    badge: 'Nuevo',
  },
]

// Coming soon tools
const comingSoonTools = [
  {
    id: 'qr-generator',
    title: 'Generador de QR',
    description: 'Crea codigos QR personalizados para WiFi, contacto o tu manual digital.',
    icon: QrCode,
  },
  {
    id: 'pricing-calculator',
    title: 'Calculadora de Precios',
    description: 'Calcula el precio optimo para tu alojamiento segun ubicacion y temporada.',
    icon: Calculator,
  },
  {
    id: 'roi-calculator',
    title: 'Calculadora de Rentabilidad',
    description: 'Descubre si estas ganando dinero o solo cambiando dinero de mano.',
    icon: TrendingUp,
  },
  {
    id: 'wifi-card',
    title: 'Tarjeta WiFi',
    description: 'Genera tarjetas WiFi profesionales para imprimir o enviar digitalmente.',
    icon: Wifi,
  },
  {
    id: 'house-rules',
    title: 'Generador de Normas',
    description: 'Crea normas de casa claras y profesionales en minutos.',
    icon: FileText,
  },
  {
    id: 'occupancy-calculator',
    title: 'Calculadora de Ocupacion',
    description: 'Analiza tu ocupacion y compara con el mercado.',
    icon: BarChart3,
  },
]

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
              Recursos para Anfitriones
            </h1>

            <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 text-white/90">
              Herramientas, plantillas y guias practicas para gestionar tu alquiler vacacional de forma profesional.
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

      {/* Herramientas Activas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Herramientas Interactivas
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Crea recursos personalizados para tu alojamiento en minutos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {activeTools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className={`group bg-gradient-to-br ${tool.color} rounded-2xl p-8 text-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    {tool.badge}
                  </span>
                </div>
                <h3 className="font-bold text-2xl mb-2">
                  {tool.title}
                </h3>
                <p className="text-white/90 mb-4">
                  {tool.description}
                </p>
                <div className="flex items-center text-white font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Usar herramienta</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Coming Soon Tools */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {comingSoonTools.map((tool) => {
            const Icon = tool.icon
            return (
              <div
                key={tool.id}
                className="relative bg-gray-100 rounded-xl p-4 opacity-60 cursor-not-allowed"
              >
                <div className="absolute top-2 right-2">
                  <span className="text-[10px] font-medium bg-gray-200 text-gray-600 rounded-full px-2 py-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pronto
                  </span>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-gray-500" />
                </div>
                <h3 className="font-semibold text-sm text-gray-700 mb-1">
                  {tool.title}
                </h3>
              </div>
            )
          })}
        </div>

        {/* Guías Descargables */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Guias Descargables
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            PDFs y recursos segun tu perfil de anfitrion
          </p>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  className={`bg-gradient-to-r ${gradientClass} p-5 text-white`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                      {leadMagnet.pages} pag
                    </span>
                  </div>

                  <h3 className="font-bold text-lg leading-tight">
                    {leadMagnet.title}
                  </h3>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {leadMagnet.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center justify-between text-blue-600 font-semibold text-sm group-hover:text-blue-700">
                    <span>Descargar</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
            Prueba Itineramio gratis durante 15 dias y descubre como puedes
            ahorrar hasta 30 horas al mes.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Empezar prueba gratis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
