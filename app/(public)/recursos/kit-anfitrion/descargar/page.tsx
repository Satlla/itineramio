import Link from 'next/link'
import { Metadata } from 'next'
import { Download, FileText, CheckCircle, ArrowRight, Rocket, ExternalLink } from 'lucide-react'
import { ItineramioLogo } from '@/components/ui/ItineramioLogo'

export const metadata: Metadata = {
  title: 'Descargar Kit del Anfitrión - Itineramio',
  description: 'Descarga tu Kit del Anfitrión Profesional con checklists, plantillas y guías',
  robots: 'noindex, nofollow'
}

// Kit resources - these would link to actual PDFs in /public/downloads/
const kitResources = [
  {
    title: 'Checklist Requisitos Legales 2026',
    description: 'Todo lo que necesitas cumplir para operar legalmente',
    icon: '📋',
    downloadUrl: '/downloads/checklist-requisitos-legales-2026.pdf'
  },
  {
    title: 'Plantilla Normas de la Casa',
    description: 'Plantilla editable en Word para tus normas',
    icon: '📝',
    downloadUrl: '/downloads/plantilla-normas-casa.pdf'
  },
  {
    title: 'Guía: Cómo Conseguir 5 Estrellas',
    description: 'Estrategias probadas para mejorar tu puntuación',
    icon: '⭐',
    downloadUrl: '/downloads/guia-5-estrellas.pdf'
  },
  {
    title: 'Lista de Amenities Imprescindibles',
    description: 'Los amenities que tus huéspedes esperan encontrar',
    icon: '🏠',
    downloadUrl: '/downloads/lista-amenities.pdf'
  }
]

export default function KitAnfitrionDescargarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header */}
      <header className="p-6 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ItineramioLogo size="md" gradient />
            <span className="text-xl font-bold" style={{ color: '#484848' }}>
              Itineramio
            </span>
          </Link>
          <Link
            href="/blog"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Volver al blog
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 rounded-full text-violet-700 text-sm font-medium mb-4">
            <CheckCircle className="w-4 h-4" />
            Acceso confirmado
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Kit del Anfitrión Profesional
          </h1>
          <p className="text-gray-600 text-lg">
            Descarga todos los recursos incluidos en tu kit
          </p>
        </div>

        {/* Download Cards */}
        <div className="space-y-4 mb-12">
          {kitResources.map((resource, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between hover:border-violet-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center text-2xl">
                  {resource.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                  <p className="text-sm text-gray-500">{resource.description}</p>
                </div>
              </div>
              <a
                href={resource.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Descargar</span>
              </a>
            </div>
          ))}
        </div>

        {/* Download All Button */}
        <div className="text-center mb-12">
          <a
            href="/downloads/kit-anfitrion-profesional-completo.zip"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors"
          >
            <Download className="w-5 h-5" />
            Descargar todo en ZIP
          </a>
        </div>

        {/* Upsell Section */}
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">
            ¿Quieres automatizar todo esto?
          </h2>
          <p className="text-violet-100 mb-6 max-w-md mx-auto">
            Con Itineramio creas tu manual digital en minutos. Tus huéspedes acceden
            a toda la información con un código QR.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-violet-700 font-semibold rounded-xl hover:bg-violet-50 transition-colors"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Prueba 15 días gratis
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
            >
              Ver cómo funciona
              <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </div>

          <p className="text-xs text-violet-200 mt-4">
            Sin tarjeta de crédito · Cancela cuando quieras
          </p>
        </div>
      </main>
    </div>
  )
}
