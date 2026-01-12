import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  Clock,
  ArrowRight,
  Flame,
  Sparkles,
  TrendingUp,
  Eye,
  BookOpen,
  Lightbulb,
  Shield,
  Zap,
  Target,
  Settings,
  Award,
  Newspaper
} from 'lucide-react'
import { prisma } from '../../../src/lib/prisma'
import { Navbar } from '../../../src/components/layout/Navbar'
import BlogContent from '../../../src/components/blog/BlogContent'

export const metadata: Metadata = {
  title: 'Blog - Guías y Consejos para Apartamentos Turísticos | Itineramio',
  description: 'Aprende a gestionar mejor tus alojamientos turísticos. Guías, normativas, mejores prácticas y consejos para anfitriones de Airbnb, Booking y plataformas de alquiler vacacional.',
  keywords: [
    'blog apartamentos turisticos',
    'consejos anfitriones airbnb',
    'guias gestión alquiler turistico',
    'normativa vivienda turistica',
    'manual digital apartamento',
  ],
  openGraph: {
    title: 'Blog - Guías para Apartamentos Turísticos',
    description: 'Consejos prácticos, normativas y mejores prácticas para anfitriones de alojamientos turísticos.',
    images: [
      {
        url: 'https://www.itineramio.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Blog Itineramio - Guías para Apartamentos Turísticos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Guías para Apartamentos Turísticos',
    description: 'Consejos prácticos, normativas y mejores prácticas para anfitriones de alojamientos turísticos.',
    images: ['https://www.itineramio.com/og-image.jpg'],
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
  'AUTOMATIZACIÓN': {
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

export default async function BlogPage({
  searchParams
}: {
  searchParams: { q?: string; category?: string }
}) {
  const searchQuery = searchParams.q?.trim() || ''
  const categoryFilter = searchParams.category || ''

  // Build search filter
  const searchFilter = searchQuery
    ? {
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' as const } },
          { excerpt: { contains: searchQuery, mode: 'insensitive' as const } },
          { content: { contains: searchQuery, mode: 'insensitive' as const } },
          { tags: { hasSome: [searchQuery.toLowerCase()] } }
        ]
      }
    : {}

  // Fetch hero article (most recent featured or published) - only if no search
  const heroArticle = searchQuery
    ? null
    : await prisma.blogPost.findFirst({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' }
      })

  // Fetch other articles - MORE for abundance
  const articles = await prisma.blogPost.findMany({
    where: {
      status: 'PUBLISHED',
      id: heroArticle ? { not: heroArticle.id } : undefined,
      ...searchFilter
    },
    orderBy: { publishedAt: 'desc' },
    take: searchQuery ? 50 : 20 // More results for search
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
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
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
                      {heroArticle.authorImage ? (
                        <Image
                          src={heroArticle.authorImage}
                          alt={heroArticle.authorName}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-100"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                          {heroArticle.authorName.charAt(0)}
                        </div>
                      )}
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

      {/* Blog Content with Category Filter and Sidebar */}
      <BlogContent
        articles={articles}
        categories={categories}
        searchQuery={searchQuery}
        popularArticles={popularArticles}
        trendingArticles={trendingArticles}
        totalArticles={articles.length + (heroArticle ? 1 : 0)}
      />

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
