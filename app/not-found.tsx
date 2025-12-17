import Link from 'next/link'
import { Home, Search, BookOpen, ArrowRight, HelpCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-[150px] sm:text-[200px] font-bold text-gray-200 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
              <Search className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          ¡Ups! Página no encontrada
        </h2>
        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
          La página que buscas no existe o ha sido movida.
          No te preocupes, te ayudamos a encontrar lo que necesitas.
        </p>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all group"
          >
            <Home className="w-5 h-5 text-gray-400 group-hover:text-violet-600" />
            <span className="font-medium text-gray-700 group-hover:text-violet-600">Inicio</span>
          </Link>

          <Link
            href="/blog"
            className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all group"
          >
            <BookOpen className="w-5 h-5 text-gray-400 group-hover:text-violet-600" />
            <span className="font-medium text-gray-700 group-hover:text-violet-600">Blog</span>
          </Link>

          <Link
            href="/help"
            className="flex items-center justify-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all group"
          >
            <HelpCircle className="w-5 h-5 text-gray-400 group-hover:text-violet-600" />
            <span className="font-medium text-gray-700 group-hover:text-violet-600">Ayuda</span>
          </Link>
        </div>

        {/* Primary CTA */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-xl font-bold mb-2">
            ¿Buscas crear manuales digitales?
          </h3>
          <p className="text-violet-100 mb-4">
            Prueba Itineramio gratis durante 15 días. Sin tarjeta de crédito.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-violet-600 font-semibold rounded-lg hover:bg-violet-50 transition-colors"
          >
            Empezar gratis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Contact */}
        <p className="mt-8 text-gray-500 text-sm">
          ¿Necesitas ayuda? Escríbenos a{' '}
          <a href="mailto:info@itineramio.com" className="text-violet-600 hover:underline">
            info@itineramio.com
          </a>
        </p>
      </div>
    </div>
  )
}
