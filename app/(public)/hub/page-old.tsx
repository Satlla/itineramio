'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  BookOpen,
  Key,
  Wifi,
  Scale,
  Star,
  AlertCircle,
  Home,
  Wrench,
  TrendingUp,
  LayoutGrid,
  Send,
  Download,
  Clock,
  Eye,
  ChevronRight
} from 'lucide-react'

export default function KnowledgeCenterLanding() {
  const [searchQuery, setSearchQuery] = useState('')
  const [aiQuestion, setAiQuestion] = useState('')
  const [newsletterEmail, setNewsletterEmail] = useState('')

  // Categorías del centro de conocimiento
  const categories = [
    { id: 'CHECKIN_CHECKOUT', name: 'Check-in/Check-out', icon: Key, count: 23, color: 'bg-violet-100 text-violet-600' },
    { id: 'WIFI_TECH', name: 'WiFi & Tecnología', icon: Wifi, count: 12, color: 'bg-blue-100 text-blue-600' },
    { id: 'LEGAL_VUT', name: 'Legal & VUT', icon: Scale, count: 18, color: 'bg-red-100 text-red-600' },
    { id: 'REVIEWS_RATINGS', name: 'Reviews & Valoraciones', icon: Star, count: 15, color: 'bg-yellow-100 text-yellow-600' },
    { id: 'EMERGENCIES', name: 'Emergencias', icon: AlertCircle, count: 8, color: 'bg-orange-100 text-orange-600' },
    { id: 'AMENITIES', name: 'Amenidades', icon: Home, count: 14, color: 'bg-green-100 text-green-600' },
    { id: 'MAINTENANCE', name: 'Mantenimiento', icon: Wrench, count: 11, color: 'bg-indigo-100 text-indigo-600' },
    { id: 'MARKETING', name: 'Marketing', icon: TrendingUp, count: 19, color: 'bg-pink-100 text-pink-600' },
  ]

  // Artículos populares (mock data por ahora)
  const popularArticles = [
    {
      id: '1',
      title: 'Check-in Remoto Sin Llaves: Guía Completa 2025',
      excerpt: '67% de las incidencias ocurren en el check-in. Aquí te explicamos cómo evitarlas con un sistema remoto eficiente.',
      category: 'Check-in',
      views: 1247,
      readTime: 8,
      hasTemplate: true,
      difficulty: 'Fácil',
      slug: 'check-in-remoto-sin-llaves'
    },
    {
      id: '2',
      title: 'VUT Madrid 2025: Requisitos y Checklist Completo',
      excerpt: 'Todo lo que necesitas saber sobre la nueva normativa VUT en Madrid. Checklist descargable incluido.',
      category: 'Legal',
      views: 892,
      readTime: 12,
      hasTemplate: true,
      difficulty: 'Intermedio',
      slug: 'vut-madrid-2025'
    },
    {
      id: '3',
      title: 'WiFi en Apartamentos: Cómo Nunca Más Recibir Llamadas',
      excerpt: 'Guía definitiva para configurar y explicar el WiFi de forma que tus huéspedes no te llamen a las 3AM.',
      category: 'WiFi',
      views: 756,
      readTime: 6,
      hasTemplate: true,
      difficulty: 'Fácil',
      slug: 'wifi-apartamentos-guia'
    },
  ]

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault()
    // Por ahora solo console.log, implementaremos el AI después
    console.log('Pregunta AI:', aiQuestion)
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Implementar después
    console.log('Newsletter email:', newsletterEmail)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="text-2xl font-bold text-violet-600">Itineramio</div>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Inicio</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/knowledge" className="text-violet-600 font-medium">Centro de Conocimiento</Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-violet-500/30 rounded-full text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4 mr-2" />
            Centro de Conocimiento Itineramio
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Todo lo que necesitas saber sobre<br />gestión de apartamentos turísticos
          </h1>

          <p className="text-xl text-violet-100 mb-10 max-w-3xl mx-auto">
            Guías prácticas, plantillas descargables y asistente IA para resolver tus dudas al instante.
          </p>

          {/* AI Chat Box */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl mx-auto">
            <form onSubmit={handleAskAI}>
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="💬 ¿Qué necesitas ayuda hoy? Ej: Cómo explico el check-in remoto..."
                    className="w-full px-6 py-4 text-gray-900 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-4 rounded-xl font-medium transition-colors flex items-center space-x-2"
                >
                  <span>Preguntar</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-3 text-left">
                🤖 Asistente IA disponible 24/7 • Respuestas instantáneas basadas en nuestro contenido
              </p>
            </form>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold">145</div>
              <div className="text-violet-200 text-sm">Guías</div>
            </div>
            <div>
              <div className="text-3xl font-bold">89</div>
              <div className="text-violet-200 text-sm">Plantillas</div>
            </div>
            <div>
              <div className="text-3xl font-bold">1.2k+</div>
              <div className="text-violet-200 text-sm">Preguntas respondidas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              📂 Explora por Categorías
            </h2>
            <p className="text-lg text-gray-600">
              Encuentra guías organizadas por temática
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Link
                  key={category.id}
                  href={`/knowledge/category/${category.id.toLowerCase()}`}
                  className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-violet-500 hover:shadow-lg transition-all duration-200"
                >
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {category.count} guías
                  </p>
                  <div className="mt-4 flex items-center text-violet-600 text-sm font-medium">
                    <span>Explorar</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                🔥 Más Populares Esta Semana
              </h2>
              <p className="text-lg text-gray-600">
                Las guías más leídas y útiles según nuestra comunidad
              </p>
            </div>
            <Link
              href="/knowledge/all"
              className="hidden md:flex items-center text-violet-600 font-medium hover:text-violet-700"
            >
              Ver todas
              <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </div>

          <div className="space-y-6">
            {popularArticles.map((article, index) => (
              <Link
                key={article.id}
                href={`/knowledge/${article.slug}`}
                className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-violet-300 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl font-bold text-gray-300">
                        {index + 1}
                      </span>
                      <span className="px-3 py-1 bg-violet-100 text-violet-700 text-xs font-medium rounded-full">
                        {article.category}
                      </span>
                      {article.difficulty === 'Fácil' && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          🟢 {article.difficulty}
                        </span>
                      )}
                      {article.difficulty === 'Intermedio' && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                          🟡 {article.difficulty}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-violet-600">
                      {article.title}
                    </h3>

                    <p className="text-gray-600 mb-4">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {article.views} lecturas
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {article.readTime} min
                      </div>
                      {article.hasTemplate && (
                        <div className="flex items-center text-violet-600 font-medium">
                          <Download className="w-4 h-4 mr-1" />
                          Plantilla gratis
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4 hidden lg:block">
                    <div className="w-32 h-32 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-lg"></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              href="/knowledge/all"
              className="inline-flex items-center text-violet-600 font-medium hover:text-violet-700"
            >
              Ver todas las guías
              <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Casos de Éxito */}
      <section className="py-16 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              ✨ Forma parte de la comunidad
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Tienes una historia de éxito?
          </h2>
          <p className="text-xl text-violet-100 mb-10 max-w-3xl mx-auto">
            Comparte tu experiencia superando desafíos en la gestión de apartamentos turísticos.
            Tu historia puede ayudar a miles de gestores como tú.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-3">📈</div>
              <h3 className="font-semibold mb-2">Visibilidad</h3>
              <p className="text-sm text-violet-100">Tu historia llegará a miles de gestores</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="font-semibold mb-2">Networking</h3>
              <p className="text-sm text-violet-100">Conecta con otros profesionales</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl mb-3">💎</div>
              <h3 className="font-semibold mb-2">Reconocimiento</h3>
              <p className="text-sm text-violet-100">Aparece como experto en tu campo</p>
            </div>
          </div>

          <Link
            href="/knowledge/submit-story"
            className="inline-block bg-white text-violet-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
          >
            Comparte tu Caso de Éxito →
          </Link>

          <p className="text-sm text-violet-200 mt-6">
            Revisaremos tu historia y te contactaremos en 48 horas
          </p>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-12 border-2 border-violet-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              📰 No te pierdas nada
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Recibe cada semana las mejores guías y plantillas nuevas directamente en tu email
            </p>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="tu@email.com"
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-violet-500 transition-colors"
                required
              />
              <button
                type="submit"
                className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-lg font-medium transition-colors whitespace-nowrap"
              >
                Suscribirme
              </button>
            </form>

            <p className="text-sm text-gray-500 mt-4">
              Sin spam. Cancela cuando quieras. 🔒
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-4">Itineramio</div>
            <p className="mb-6">Centro de Conocimiento para gestores de apartamentos turísticos</p>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <Link href="/legal/terms" className="hover:text-white transition-colors">
                Términos
              </Link>
              <Link href="/legal/privacy" className="hover:text-white transition-colors">
                Privacidad
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contacto
              </Link>
            </div>
            <p className="mt-6 text-sm">
              © 2025 Itineramio. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
