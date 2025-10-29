import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, Sparkles, TrendingUp, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog - Guías y Consejos para Apartamentos Turísticos | Itineramio',
  description: 'Aprende a gestionar mejor tus alojamientos turísticos. Guías, normativas, mejores prácticas y consejos para anfitriones de Airbnb, Booking y plataformas de alquiler vacacional.',
  keywords: [
    'blog apartamentos turisticos',
    'consejos anfitriones airbnb',
    'guias gestion alquiler turistico',
    'normativa vivienda turistica',
    'manual digital apartamento',
  ],
  openGraph: {
    title: 'Blog - Guías para Apartamentos Turísticos',
    description: 'Consejos prácticos, normativas y mejores prácticas para anfitriones de alojamientos turísticos.',
  }
}

// Blog articles data
const articles = [
  {
    slug: 'manual-digital-apartamento-turistico',
    title: 'Cómo Crear un Manual Digital para tu Apartamento Turístico en 2025',
    excerpt: 'Guía completa paso a paso para crear un manual digital profesional que mejore la experiencia de tus huéspedes y reduzca tus consultas hasta un 86%.',
    category: 'Guías',
    readTime: '8 min',
    date: '2025-01-15',
    featured: true,
    image: '/blog/manual-digital-hero.jpg',
    tags: ['Manual Digital', 'Automatización', 'BOFU']
  },
  {
    slug: '12-incidencias-apartamento-turistico',
    title: '12 Incidencias que Todo Huésped Tiene (Y Cómo Solucionarlas Antes)',
    excerpt: 'Las preguntas y problemas más comunes de los huéspedes y cómo prevenirlos con un manual digital bien estructurado. Incluye plantilla gratuita.',
    category: 'Mejores Prácticas',
    readTime: '10 min',
    date: '2025-01-10',
    featured: true,
    image: '/blog/incidencias-hero.jpg',
    tags: ['Incidencias', 'Prevención', 'Lead Magnet']
  },
  {
    slug: 'normativa-vut-madrid-2025',
    title: 'Normativa VUT Madrid 2025: Guía Completa y Actualizada',
    excerpt: 'Todo lo que necesitas saber sobre la normativa de viviendas de uso turístico en Madrid: requisitos, licencias, sanciones y obligaciones actualizadas para 2025.',
    category: 'Normativa',
    readTime: '12 min',
    date: '2025-01-05',
    featured: true,
    image: '/blog/vut-madrid-hero.jpg',
    tags: ['VUT', 'Madrid', 'Normativa']
  }
]

export default function BlogPage() {
  const featuredArticles = articles.filter(a => a.featured)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-violet-50 rounded-full border border-violet-100 mb-6">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-medium text-violet-900">Blog</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Aprende a gestionar mejor tus alojamientos
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              Guías prácticas, normativas actualizadas y consejos probados por anfitriones como tú para aumentar tus ingresos y reducir tu tiempo de gestión.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Artículos destacados</h2>
            <div className="flex items-center space-x-2 text-violet-600">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Más leídos</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group"
              >
                <article className="bg-white rounded-2xl border-2 border-gray-100 hover:border-violet-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Image placeholder */}
                  <div className="aspect-video bg-gradient-to-br from-violet-100 to-purple-100 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-6xl opacity-20">📱</div>
                    </div>
                    {article.category && (
                      <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-900">
                        {article.category}
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <time dateTime={article.date}>
                          {new Date(article.date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </time>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-violet-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center space-x-2 text-violet-600 font-semibold">
                      <span>Leer artículo</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            ¿Listo para automatizar tu gestión?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Crea tu primer manual digital en menos de 10 minutos. Primera propiedad gratis.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-violet-600 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-white/30 transition-all"
          >
            Empezar gratis
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
