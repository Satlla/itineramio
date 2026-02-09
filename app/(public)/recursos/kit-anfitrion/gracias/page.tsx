import Link from 'next/link'
import { Metadata } from 'next'
import { CheckCircle, Mail, ArrowRight, Rocket } from 'lucide-react'
import { ItineramioLogo } from '@/components/ui/ItineramioLogo'

export const metadata: Metadata = {
  title: 'Kit Enviado - Itineramio',
  description: 'Tu Kit del Anfitrión Profesional está en camino',
  robots: 'noindex, nofollow'
}

export default function KitAnfitrionGraciasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="flex items-center space-x-2">
            <ItineramioLogo size="md" gradient />
            <span className="text-xl font-bold" style={{ color: '#484848' }}>
              Itineramio
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Tu kit está en camino!
          </h1>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex items-center gap-3 text-left mb-4">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Revisa tu bandeja de entrada</p>
                <p className="text-sm text-gray-600">Te hemos enviado el kit por email</p>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Si no lo ves en unos minutos, revisa la carpeta de spam o promociones.
            </p>
          </div>

          {/* Upsell to Trial */}
          <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl p-6 text-white text-left">
            <h2 className="text-lg font-bold mb-2">
              ¿Quieres automatizar todo esto?
            </h2>
            <p className="text-violet-100 text-sm mb-4">
              Con Itineramio creas tu manual digital en minutos y tus huéspedes
              tienen toda la info que necesitan al instante.
            </p>

            <Link
              href="/register"
              className="inline-flex items-center px-5 py-2.5 bg-white text-violet-700 font-semibold rounded-lg hover:bg-violet-50 transition-colors"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Prueba 15 días gratis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {/* Back to blog */}
          <Link
            href="/blog"
            className="inline-block mt-6 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Volver al blog
          </Link>
        </div>
      </main>
    </div>
  )
}
