import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Eye,
  Tag,
  Star,
  BookOpen,
  Lightbulb,
  Shield,
  Zap,
  Target,
  Settings,
  Award,
  Newspaper,
  Search,
  Filter,
  Flame
} from 'lucide-react'
import { prisma } from '../../../src/lib/prisma'
import { Navbar } from '../../../src/components/layout/Navbar'

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

// Revalidate every hour
export const revalidate = 3600

// Category configurations with icons and colors
const categoryConfig: Record<string, { name: string; icon: any; color: string; gradient: string }> = {
  'GUIAS': {
    name: 'Guías',
    icon: BookOpen,
    color: 'text-blue-600',
    gradient: 'from-blue-50 to-blue-100'
  },
  'MEJORES_PRACTICAS': {
    name: 'Mejores Prácticas',
    icon: Lightbulb,
    color: 'text-amber-600',
    gradient: 'from-amber-50 to-amber-100'
  },
  'NORMATIVA': {
    name: 'Normativa',
    icon: Shield,
    color: 'text-purple-600',
    gradient: 'from-purple-50 to-purple-100'
  },
  'AUTOMATIZACION': {
    name: 'Automatización',
    icon: Zap,
    color: 'text-violet-600',
    gradient: 'from-violet-50 to-violet-100'
  },
  'MARKETING': {
    name: 'Marketing',
    icon: Target,
    color: 'text-pink-600',
    gradient: 'from-pink-50 to-pink-100'
  },
  'OPERACIONES': {
    name: 'Operaciones',
    icon: Settings,
    color: 'text-cyan-600',
    gradient: 'from-cyan-50 to-cyan-100'
  },
  'CASOS_ESTUDIO': {
    name: 'Casos de Estudio',
    icon: Award,
    color: 'text-emerald-600',
    gradient: 'from-emerald-50 to-emerald-100'
  },
  'NOTICIAS': {
    name: 'Noticias',
    icon: Newspaper,
    color: 'text-red-600',
    gradient: 'from-red-50 to-red-100'
  }
}

export default async function BlogPage() {
  // Fetch hero article (most recent featured or published)
  const heroArticle = await prisma.blogPost.findFirst({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' }
  })

  // Fetch other articles - MORE for abundance
  const articles = await prisma.blogPost.findMany({
    where: {
      status: 'PUBLISHED',
      id: { not: heroArticle?.id }
    },
    orderBy: { publishedAt: 'desc' },
    take: 20 // Increased from 9
  })

  // Fetch popular articles (by views)
  const popularArticles = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { views: 'desc' },
    take: 8 // Increased from 5
  })

  // Fetch trending (recent popular)
  const trendingArticles = await prisma.blogPost.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    },
    orderBy: { views: 'desc' },
    take: 6
  })

  // Get unique categories from articles
  const categories = Array.from(new Set([
    heroArticle?.category,
    ...articles.map(a => a.category)
  ].filter(Boolean)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Unified Navigation */}
      <Navbar />

      {/* Hero Section with Magazine Style */}
      {heroArticle && (
        <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 border-b border-gray-200">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="flex items-center space-x-2 mb-6">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-bold text-orange-600 uppercase tracking-wide">Destacado</span>
            </div>

            <Link href={`/blog/${heroArticle.slug}`} className="group">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Image */}
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                  {heroArticle.coverImage ? (
                    <Image
                      src={heroArticle.coverImage}
                      alt={heroArticle.coverImageAlt || heroArticle.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-400 via-purple-400 to-pink-400" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  {(() => {
                    const config = categoryConfig[heroArticle.category]
                    const Icon = config?.icon || BookOpen
                    return (
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config?.gradient || 'from-gray-100 to-gray-200'} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${config?.color || 'text-gray-600'}`} />
                        </div>
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-sm font-bold uppercase tracking-wide rounded-lg shadow-sm">
                          {config?.name || heroArticle.category}
                        </span>
                      </div>
                    )
                  })()}

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight group-hover:text-violet-600 transition-colors">
                    {heroArticle.title}
                  </h1>

                  {heroArticle.subtitle && (
                    <p className="text-lg sm:text-xl text-gray-600 font-light leading-relaxed">
                      {heroArticle.subtitle}
                    </p>
                  )}

                  <p className="text-base text-gray-600 line-clamp-3 leading-relaxed">
                    {heroArticle.excerpt}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                        {heroArticle.authorName.charAt(0)}
                      </div>
                      <span className="font-semibold text-gray-900">{heroArticle.authorName}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <time dateTime={heroArticle.publishedAt?.toISOString()} className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {heroArticle.publishedAt?.toLocaleDateString('es-ES', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </time>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{heroArticle.readTime} min</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <span className="inline-flex items-center text-violet-600 font-semibold group-hover:gap-2 transition-all">
                      Leer artículo
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Categories Quick Filter */}
      <section className="bg-white border-b border-gray-200 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3 overflow-x-auto scrollbar-hide pb-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {categories.map((cat) => {
              if (!cat) return null
              const config = categoryConfig[cat]
              const Icon = config?.icon || BookOpen
              return (
                <Link
                  key={cat}
                  href={`/blog/categoria/${cat.toLowerCase()}`}
                  className="flex-shrink-0 group"
                >
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-br ${config?.gradient || 'from-gray-100 to-gray-200'} hover:shadow-md transition-all`}>
                    <Icon className={`w-4 h-4 ${config?.color || 'text-gray-600'}`} />
                    <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{config?.name || cat}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gradient-to-r from-violet-600 to-purple-600">
              <div className="flex items-center space-x-3">
                <div className="w-1 h-8 bg-gradient-to-b from-violet-600 to-purple-600 rounded-full"></div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Últimos Artículos
                </h2>
              </div>
              <TrendingUp className="w-6 h-6 text-violet-600" />
            </div>

            {/* Articles Grid */}
            <div className="grid gap-8">
              {articles.map((article, index) => {
                const config = categoryConfig[article.category]
                const Icon = config?.icon || BookOpen
                return (
                  <React.Fragment key={article.slug}>
                    <Link
                      href={`/blog/${article.slug}`}
                      className="group"
                    >
                      <article className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-violet-200">
                        <div className="grid sm:grid-cols-5 gap-6 p-6">
                          {/* Image */}
                          <div className="sm:col-span-2 relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                            {article.coverImage ? (
                              <Image
                                src={article.coverImage}
                                alt={article.coverImageAlt || article.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                            ) : (
                              <div className={`absolute inset-0 bg-gradient-to-br ${config?.gradient || 'from-gray-200 to-gray-300'}`}>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Icon className={`w-12 h-12 ${config?.color || 'text-gray-400'} opacity-50`} />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="sm:col-span-3 flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config?.gradient || 'from-gray-100 to-gray-200'} flex items-center justify-center`}>
                                  <Icon className={`w-4 h-4 ${config?.color || 'text-gray-600'}`} />
                                </div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                  {config?.name || article.category}
                                </span>
                              </div>

                              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight group-hover:text-violet-600 transition-colors line-clamp-2">
                                {article.title}
                              </h3>

                              <p className="text-gray-600 line-clamp-2 text-sm sm:text-base leading-relaxed">
                                {article.excerpt}
                              </p>

                              {/* Tags */}
                              {article.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {article.tags.slice(0, 3).map((tag) => (
                                    <span
                                      key={tag}
                                      className="inline-flex items-center px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-200"
                                    >
                                      <Tag className="w-3 h-3 mr-1" />
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <time dateTime={article.publishedAt?.toISOString()}>
                                  {article.publishedAt?.toLocaleDateString('es-ES', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </time>
                                <span>•</span>
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{article.readTime} min</span>
                                </span>
                                <span>•</span>
                                <span className="flex items-center space-x-1">
                                  <Eye className="w-3 h-3" />
                                  <span>{article.views}</span>
                                </span>
                              </div>
                              <span className="text-violet-600 font-semibold text-sm flex items-center space-x-1 group-hover:space-x-2 transition-all">
                                <span>Leer más</span>
                                <ArrowRight className="w-4 h-4" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>

                    {/* Email Capture after 3rd article */}
                    {index === 2 && (
                      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl border-2 border-emerald-200 p-8 shadow-lg">
                        <div className="max-w-2xl mx-auto text-center space-y-4">
                          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-2">
                            <Sparkles className="w-7 h-7 text-white" />
                          </div>

                          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            ¿Te está gustando el contenido?
                          </h3>

                          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                            Únete a más de <strong className="text-emerald-600">1,000 anfitriones</strong> que reciben consejos exclusivos cada semana para optimizar sus alojamientos turísticos.
                          </p>

                          <div className="pt-2">
                            <Link
                              href="/register"
                              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-base font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                            >
                              <Sparkles className="w-5 h-5 mr-2" />
                              Recibir guías exclusivas gratis
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                          </div>

                          <p className="text-xs text-gray-500">
                            ✓ Guías exclusivas · ✓ Plantillas descargables · ✓ Sin spam
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Email Capture after 8th article */}
                    {index === 7 && (
                      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 rounded-2xl border-2 border-blue-200 p-8 shadow-lg">
                        <div className="max-w-2xl mx-auto">
                          <div className="grid md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-4">
                              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl">
                                <Zap className="w-6 h-6 text-white" />
                              </div>

                              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                                Ahorra 8 horas/semana
                              </h3>

                              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                Automatiza tus manuales digitales y dedica tu tiempo a lo que realmente importa.
                              </p>

                              <Link
                                href="/register"
                                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-bold rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                              >
                                Prueba gratis 15 días
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Link>
                            </div>

                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 space-y-3">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <p className="text-sm text-gray-700 font-medium">Setup en 10 minutos</p>
                              </div>
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <p className="text-sm text-gray-700 font-medium">Sin tarjeta de crédito</p>
                              </div>
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <p className="text-sm text-gray-700 font-medium">Soporte en español 24/7</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Content Upgrade after 15th article */}
                    {index === 14 && (
                      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-2xl border-2 border-amber-300 p-8 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-200/30 rounded-full -ml-12 -mb-12"></div>

                        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-5">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mb-2">
                            <Award className="w-8 h-8 text-white" />
                          </div>

                          <div className="inline-block px-4 py-1.5 bg-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                            🎁 Contenido Exclusivo
                          </div>

                          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Descarga nuestra Guía Definitiva
                          </h3>

                          <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                            <strong className="text-amber-700">Checklist de 50 puntos</strong> para optimizar tu apartamento turístico y aumentar tus reservas hasta un 30%.
                          </p>

                          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 space-y-3 text-left">
                            <p className="text-sm font-bold text-gray-900 mb-3">📋 Incluye:</p>
                            <div className="grid sm:grid-cols-2 gap-3">
                              <div className="flex items-start space-x-2">
                                <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-700">Checklist de bienvenida</p>
                              </div>
                              <div className="flex items-start space-x-2">
                                <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-700">Plantillas de mensajes</p>
                              </div>
                              <div className="flex items-start space-x-2">
                                <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-700">Calendario de limpieza</p>
                              </div>
                              <div className="flex items-start space-x-2">
                                <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-700">Guía de precios dinámicos</p>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2">
                            <Link
                              href="/register"
                              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-base font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                            >
                              <Award className="w-5 h-5 mr-2" />
                              Descargar guía gratis
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                          </div>

                          <p className="text-xs text-gray-600">
                            Sin spam · Descarga instantánea · Valorada por +500 anfitriones
                          </p>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              {/* Popular Articles */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4">
                  <div className="flex items-center space-x-3 text-white">
                    <Flame className="w-5 h-5" />
                    <h3 className="text-lg font-bold">Más Populares</h3>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {popularArticles.map((article, index) => (
                    <Link
                      key={article.slug}
                      href={`/blog/${article.slug}`}
                      className="group block p-5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                            <span className="text-lg font-bold bg-gradient-to-br from-violet-600 to-purple-600 bg-clip-text text-transparent">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                          <h4 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-violet-600 transition-colors line-clamp-3">
                            {article.title}
                          </h4>

                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>{article.views.toLocaleString()}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{article.readTime} min</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trending Articles */}
              {trendingArticles.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4">
                    <div className="flex items-center space-x-3 text-white">
                      <TrendingUp className="w-5 h-5" />
                      <h3 className="text-lg font-bold">Tendencias del Mes</h3>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {trendingArticles.slice(0, 4).map((article) => {
                      const config = categoryConfig[article.category]
                      const Icon = config?.icon || BookOpen
                      return (
                        <Link
                          key={article.slug}
                          href={`/blog/${article.slug}`}
                          className="group block p-5 hover:bg-gray-50 transition-colors"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${config?.gradient || 'from-gray-100 to-gray-200'} flex items-center justify-center`}>
                                <Icon className={`w-4 h-4 ${config?.color || 'text-gray-600'}`} />
                              </div>
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                {config?.name || article.category}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-orange-600 transition-colors line-clamp-2">
                              {article.title}
                            </h4>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Eye className="w-3 h-3" />
                                <span>{article.views.toLocaleString()}</span>
                              </span>
                              <span className="flex items-center space-x-1 text-orange-600 font-semibold">
                                <Flame className="w-3 h-3" />
                                <span>En tendencia</span>
                              </span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Newsletter CTA */}
              <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>

                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold leading-tight">
                    Únete a nuestra Newsletter
                  </h3>

                  <p className="text-white/90 text-sm leading-relaxed">
                    Recibe cada semana consejos prácticos, guías exclusivas y las últimas tendencias para optimizar tu alojamiento turístico.
                  </p>

                  <div className="pt-2">
                    <Link
                      href="/register"
                      className="block w-full text-center px-6 py-3 bg-white text-violet-600 font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    >
                      Suscribirme gratis
                    </Link>
                  </div>

                  <p className="text-xs text-white/70 text-center">
                    Más de 1,000 anfitriones ya están dentro
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
                  En el Blog
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-br from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      {articles.length + 1}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Artículos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-br from-pink-600 to-orange-600 bg-clip-text text-transparent">
                      {categories.length}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Categorías</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer CTA */}
      <section className="bg-gray-900 text-white py-20 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl">
            <Zap className="w-8 h-8" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            ¿Listo para automatizar tu gestión?
          </h2>

          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Crea tu primer manual digital en menos de 10 minutos y empieza a ahorrar tiempo desde hoy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 text-base font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Empezar gratis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/hub/calculadora"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white text-base font-semibold rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              Ver Calculadora
            </Link>
          </div>

          <p className="text-sm text-gray-400">
            ✓ Sin tarjeta de crédito · ✓ Setup en 10 minutos · ✓ Soporte en español
          </p>
        </div>
      </section>

      {/* Sticky Mobile Bottom CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white shadow-2xl border-t-4 border-white/20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-tight">
                Únete a 1,000+ anfitriones
              </p>
              <p className="text-xs text-white/90 truncate">
                Guías exclusivas cada semana
              </p>
            </div>
            <Link
              href="/register"
              className="flex-shrink-0 px-5 py-2.5 bg-white text-violet-600 text-sm font-bold rounded-lg hover:shadow-xl transition-all"
            >
              Gratis
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
