import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Tag, ArrowRight, Eye, Clock, Sparkles } from 'lucide-react'
import { prisma } from '../../../../../src/lib/prisma'
import { BlogCategory } from '@prisma/client'
import CategoryNewsletterForm from './CategoryNewsletterForm'

interface CategoryPageProps {
  params: Promise<{
    category: string
  }>
}

// Category metadata for SEO
const categoryMeta: Record<string, {
  name: string
  slug: string
  title: string
  description: string
  keywords: string[]
  icon: string
}> = {
  'guias': {
    name: 'Guías',
    slug: 'GUIAS',
    title: 'Guías Completas para Apartamentos Turísticos | Itineramio',
    description: 'Guías paso a paso para optimizar la gestión de tu alojamiento turístico. Aprende las mejores prácticas de anfitriones expertos.',
    keywords: ['guías apartamentos turísticos', 'manual airbnb', 'gestión alojamiento', 'anfitriones guías'],
    icon: '📚'
  },
  'automatización': {
    name: 'Automatización',
    slug: 'AUTOMATIZACIÓN',
    title: 'Automatización para Airbnb y Apartamentos Turísticos | Itineramio',
    description: 'Descubre cómo automatizar la gestión de tu apartamento turístico. Ahorra tiempo, reduce errores y escala tu negocio con herramientas de automatización.',
    keywords: ['automatización airbnb', 'gestión automática apartamentos', 'herramientas anfitriones', 'automatizar check-in'],
    icon: '⚙️'
  },
  'marketing': {
    name: 'Marketing',
    slug: 'MARKETING',
    title: 'Marketing para Apartamentos Turísticos | Estrategias Airbnb',
    description: 'Estrategias de marketing probadas para aumentar reservas y visibilidad de tu alojamiento turístico. Optimiza tus anuncios y atrae más huéspedes.',
    keywords: ['marketing airbnb', 'aumentar reservas', 'optimizar anuncio', 'promoción apartamento turístico'],
    icon: '📢'
  },
  'normativa': {
    name: 'Normativa',
    slug: 'NORMATIVA',
    title: 'Normativa VUT y Legislación para Apartamentos Turísticos 2025',
    description: 'Mantente al día con la normativa VUT, licencias y regulaciones de viviendas turísticas en España. Guías legales actualizadas para anfitriones.',
    keywords: ['normativa vut', 'licencia turística', 'legislación apartamentos', 'regulación airbnb españa'],
    icon: '⚖️'
  },
  'operaciones': {
    name: 'Operaciones',
    slug: 'OPERACIONES',
    title: 'Gestión de Operaciones en Apartamentos Turísticos | Itineramio',
    description: 'Optimiza las operaciones diarias de tu alojamiento turístico. Check-in, limpieza, mantenimiento y más para una gestión eficiente.',
    keywords: ['gestión operaciones airbnb', 'check-in automático', 'limpieza apartamentos', 'mantenimiento alojamiento'],
    icon: '🔧'
  },
  'mejores-prácticas': {
    name: 'Mejores Prácticas',
    slug: 'MEJORES_PRACTICAS',
    title: 'Mejores Prácticas para Anfitriones de Airbnb | Consejos Expertos',
    description: 'Aprende las mejores prácticas de anfitriones Superhost. Consejos, trucos y estrategias para destacar en plataformas de alquiler vacacional.',
    keywords: ['mejores prácticas airbnb', 'consejos superhost', 'tips anfitriones', 'gestión alojamiento excelencia'],
    icon: '⭐'
  },
  'casos-estudio': {
    name: 'Casos de Estudio',
    slug: 'CASOS_ESTUDIO',
    title: 'Casos de Éxito Reales: Anfitriones que Transformaron sus Operaciones',
    description: 'Casos reales de anfitriones que han transformado sus operaciones con Itineramio. Aprende de ejemplos concretos y resultados medibles.',
    keywords: ['casos éxito airbnb', 'testimonios anfitriones', 'transformación digital', 'resultados itineramio'],
    icon: '💡'
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params
  const category = categoryMeta[categorySlug]

  if (!category) {
    return {
      title: 'Categoría no encontrada'
    }
  }

  const canonicalUrl = `https://www.itineramio.com/blog/categoria/${categorySlug}`

  return {
    title: category.title,
    description: category.description,
    keywords: category.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: category.title,
      description: category.description,
      type: 'website',
      url: canonicalUrl,
    }
  }
}

// Generate static paths for all categories
export async function generateStaticParams() {
  return Object.keys(categoryMeta).map(category => ({
    category
  }))
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params
  const categoryInfo = categoryMeta[category]

  if (!categoryInfo) {
    notFound()
  }

  // Fetch articles for this category
  const articles = await prisma.blogPost.findMany({
    where: {
      status: 'PUBLISHED',
      category: categoryInfo.slug as BlogCategory
    },
    orderBy: {
      publishedAt: 'desc'
    },
    take: 20
  })

  // Get article stats
  const totalArticles = articles.length
  const totalViews = articles.reduce((sum, article) => sum + article.views, 0)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky z-40 backdrop-blur-sm bg-white/90 pwa-sticky-header">
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

      {/* Category Hero */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-5xl">{categoryInfo.icon}</span>
              <div className="flex items-center space-x-3">
                <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Blog
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-sm font-semibold text-gray-900">{categoryInfo.name}</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight">
              {categoryInfo.name}
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              {categoryInfo.description}
            </p>

            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                <Sparkles className="w-4 h-4 mr-1.5" />
                {totalArticles} artículos
              </span>
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1.5" />
                {totalViews.toLocaleString()} vistas
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {articles.length > 0 ? (
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
                          <time className="text-sm text-gray-500" dateTime={article.publishedAt?.toISOString()}>
                            {article.publishedAt?.toLocaleDateString('es-ES', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
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
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {article.readTime} min
                          </span>
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
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">
                  No hay artículos en esta categoría todavía.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Lead Capture Form */}
              <CategoryNewsletterForm
                category={categoryInfo.slug}
                categoryName={categoryInfo.name}
              />
              <div className="h-8" />

              {/* Other Categories */}
              <div>
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                  Explorar otras categorías
                </h3>
                <div className="space-y-3">
                  {Object.entries(categoryMeta)
                    .filter(([slug]) => slug !== category)
                    .map(([slug, info]) => (
                      <Link
                        key={slug}
                        href={`/blog/categoria/${slug}`}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{info.icon}</span>
                          <span className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                            {info.name}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* CTA Section */}
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
