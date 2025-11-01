import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowRight, Sparkles, TrendingUp, Eye, Tag, Star } from 'lucide-react'
import { prisma } from '../../../src/lib/prisma'

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

// Category display names
const categoryNames: Record<string, string> = {
  'GUIAS': 'Guías',
  'MEJORES_PRACTICAS': 'Mejores Prácticas',
  'NORMATIVA': 'Normativa',
  'AUTOMATIZACION': 'Automatización',
  'MARKETING': 'Marketing',
  'OPERACIONES': 'Operaciones',
  'CASOS_ESTUDIO': 'Casos de Estudio',
  'NOTICIAS': 'Noticias'
}

export default async function BlogPage() {
  // Fetch hero article (most recent featured or published)
  const heroArticle = await prisma.blogPost.findFirst({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' }
  })

  // Fetch other articles
  const articles = await prisma.blogPost.findMany({
    where: {
      status: 'PUBLISHED',
      id: { not: heroArticle?.id }
    },
    orderBy: { publishedAt: 'desc' },
    take: 9
  })

  // Fetch popular articles (by views)
  const popularArticles = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { views: 'desc' },
    take: 5
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/blog" className="text-3xl font-serif font-bold text-gray-900">
              Blog
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Inicio
              </Link>
              <Link href="/hub/calculadora" className="text-gray-600 hover:text-gray-900 transition-colors">
                Calculadora
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Article */}
        {heroArticle && (
          <Link href={`/blog/${heroArticle.slug}`} className="group block mb-16">
            <article className="grid md:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                {heroArticle.coverImage ? (
                  <Image
                    src={heroArticle.coverImage}
                    alt={heroArticle.coverImageAlt || heroArticle.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
                )}
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <span className="px-3 py-1 bg-gray-900 text-white text-xs font-semibold uppercase tracking-wider rounded">
                    {categoryNames[heroArticle.category]}
                  </span>
                  <span className="flex items-center text-sm text-gray-500">
                    <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
                    Destacado
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight group-hover:text-gray-700 transition-colors">
                  {heroArticle.title}
                </h2>

                {heroArticle.subtitle && (
                  <p className="text-xl text-gray-600 mb-4 font-light">
                    {heroArticle.subtitle}
                  </p>
                )}

                <p className="text-lg text-gray-600 mb-6 line-clamp-3">
                  {heroArticle.excerpt}
                </p>

                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span className="font-medium text-gray-900">{heroArticle.authorName}</span>
                  <span>·</span>
                  <time dateTime={heroArticle.publishedAt?.toISOString()}>
                    {heroArticle.publishedAt?.toLocaleDateString('es-ES', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </time>
                  <span>·</span>
                  <span>{heroArticle.readTime} min de lectura</span>
                </div>
              </div>
            </article>
          </Link>
        )}

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
              Últimos artículos
            </h2>

            <div className="space-y-12">
              {articles.map((article) => (
                <Link key={article.slug} href={`/blog/${article.slug}`} className="group block">
                  <article className="grid sm:grid-cols-3 gap-6">
                    {/* Image */}
                    <div className="relative aspect-[4/3] rounded overflow-hidden bg-gray-100">
                      {article.coverImage ? (
                        <Image
                          src={article.coverImage}
                          alt={article.coverImageAlt || article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {categoryNames[article.category]}
                        </span>
                        <span className="text-gray-300">·</span>
                        <time className="text-sm text-gray-500" dateTime={article.publishedAt?.toISOString()}>
                          {article.publishedAt?.toLocaleDateString('es-ES', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </time>
                      </div>

                      <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2 leading-tight group-hover:text-gray-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{article.readTime} min</span>
                        <span>·</span>
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {article.views}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {article.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Popular Articles */}
            <div className="sticky top-24">
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Más populares
              </h3>

              <div className="space-y-6">
                {popularArticles.map((article, index) => (
                  <Link key={article.slug} href={`/blog/${article.slug}`} className="group block">
                    <article className="flex gap-4">
                      <span className="text-3xl font-serif font-bold text-gray-200 group-hover:text-gray-300 transition-colors">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-gray-900 mb-1 leading-snug group-hover:text-gray-600 transition-colors line-clamp-3">
                          {article.title}
                        </h4>

                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>{article.authorName}</span>
                          <span>·</span>
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {article.views}
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {/* Newsletter */}
              <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">
                  Únete a nuestra newsletter
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Recibe consejos semanales para optimizar tu alojamiento turístico.
                </p>
                <Link
                  href="/register"
                  className="block w-full text-center px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded hover:bg-gray-800 transition-colors"
                >
                  Suscribirme
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer CTA */}
      <section className="border-t border-gray-200 bg-gray-50 py-16 px-6 mt-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            ¿Listo para automatizar tu gestión?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Crea tu primer manual digital en menos de 10 minutos.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-3 bg-gray-900 text-white text-base font-semibold rounded hover:bg-gray-800 transition-colors"
          >
            Empezar gratis
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
