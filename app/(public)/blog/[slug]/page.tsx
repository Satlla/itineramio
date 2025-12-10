import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowLeft, Share2, Heart, Eye, Tag, Twitter, Facebook, Linkedin } from 'lucide-react'
import { prisma } from '../../../../src/lib/prisma'
import ReadingProgress from './ReadingProgress'
import RelatedArticlesCarousel from '../../../../src/components/blog/RelatedArticlesCarousel'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({
    where: {
      slug: slug,
      status: 'PUBLISHED'
    }
  })

  if (!post) {
    return {
      title: 'Artículo no encontrado'
    }
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.authorName]
    }
  }
}

// Generate static paths for all published posts
export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: {
      status: 'PUBLISHED'
    },
    select: {
      slug: true
    }
  })

  return posts.map(post => ({
    slug: post.slug
  }))
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({
    where: {
      slug: slug,
      status: 'PUBLISHED'
    }
  })

  if (!post) {
    notFound()
  }

  // Increment view count (in a real app, you'd want to track unique views properly)
  await prisma.blogPost.update({
    where: { id: post.id },
    data: { views: { increment: 1 } }
  })

  // Get related posts
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      status: 'PUBLISHED',
      category: post.category,
      id: { not: post.id }
    },
    take: 3,
    orderBy: { publishedAt: 'desc' }
  })

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

  // Generate Schema.org structured data for SEO
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage || 'https://itineramio.com/og-image.png',
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    author: {
      '@type': 'Person',
      name: post.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Itineramio',
      logo: {
        '@type': 'ImageObject',
        url: 'https://itineramio.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://itineramio.com/blog/${post.slug}`,
    },
    keywords: post.keywords.join(', '),
    articleSection: categoryNames[post.category],
    wordCount: post.content.split(' ').length,
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://itineramio.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://itineramio.com/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://itineramio.com/blog/${post.slug}`,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <ReadingProgress />

      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/blog" className="text-3xl font-serif font-bold text-gray-900">
              Blog
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Todos los artículos
            </Link>
          </div>
        </div>
      </header>

      <article>
        {/* Article Header */}
        <header className="max-w-3xl mx-auto px-6 pt-12 pb-8">
          {/* Category */}
          <Link
            href="/blog"
            className="inline-block text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-900 transition-colors mb-6"
          >
            {categoryNames[post.category]}
          </Link>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Subtitle */}
          {post.subtitle && (
            <p className="text-xl md:text-2xl text-gray-600 mb-8 font-light leading-relaxed">
              {post.subtitle}
            </p>
          )}

          {/* Author & Meta */}
          <div className="flex items-center justify-between py-6 border-y border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {post.authorName.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-gray-900">{post.authorName}</div>
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  <time dateTime={post.publishedAt?.toISOString()}>
                    {post.publishedAt?.toLocaleDateString('es-ES', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </time>
                  <span>·</span>
                  <span>{post.readTime} min de lectura</span>
                </div>
              </div>
            </div>

            {/* Social Share */}
            <div className="hidden sm:flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Compartir en Twitter">
                <Twitter className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Compartir en Facebook">
                <Facebook className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Compartir en LinkedIn">
                <Linkedin className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="max-w-4xl mx-auto px-6 mb-12">
            <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={post.coverImage}
                alt={post.coverImageAlt || post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="max-w-3xl mx-auto px-6">
          <div
            className="prose prose-xl max-w-none
              prose-headings:font-serif prose-headings:font-bold prose-headings:text-gray-900 prose-headings:scroll-mt-24
              prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:leading-tight prose-h2:pb-3 prose-h2:border-b prose-h2:border-gray-200
              prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-6 prose-h3:leading-snug
              prose-h4:text-xl prose-h4:mt-10 prose-h4:mb-5 prose-h4:font-bold prose-h4:text-gray-800
              prose-p:text-gray-700 prose-p:leading-loose prose-p:mb-8 prose-p:text-lg
              prose-a:text-violet-700 prose-a:font-medium prose-a:underline prose-a:decoration-violet-300 hover:prose-a:decoration-violet-700 prose-a:transition-colors
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-ul:my-8 prose-ul:list-disc prose-ul:pl-7 prose-ul:space-y-3
              prose-ol:my-8 prose-ol:list-decimal prose-ol:pl-7 prose-ol:space-y-3
              prose-li:text-gray-700 prose-li:leading-relaxed prose-li:text-base
              prose-li:marker:text-violet-600 prose-li:marker:font-bold
              prose-img:rounded-xl prose-img:my-12 prose-img:shadow-lg
              prose-blockquote:border-l-4 prose-blockquote:border-violet-600 prose-blockquote:pl-8 prose-blockquote:py-4 prose-blockquote:my-10 prose-blockquote:bg-violet-50 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-gray-800
              prose-code:text-violet-700 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:my-10 prose-pre:shadow-xl
              [&_table]:w-full [&_table]:block [&_table]:overflow-x-auto [&_table]:my-10
              [&_table_table]:w-full [&_table_table]:border-collapse [&_table_table]:table
              prose-thead:bg-gray-100
              prose-th:border prose-th:border-gray-300 prose-th:px-4 prose-th:py-3 prose-th:font-semibold prose-th:text-sm prose-th:whitespace-nowrap
              prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-3 prose-td:text-sm"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <Tag className="w-3 h-3 mr-1.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Engagement Stats */}
          <div className="mt-8 pt-8 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1.5" />
                {post.views.toLocaleString()} vistas
              </span>
              <span className="flex items-center">
                <Heart className="w-4 h-4 mr-1.5" />
                {post.likes} me gusta
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Twitter className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Facebook className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Linkedin className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Author Bio */}
          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {post.authorName.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg mb-1">
                  Escrito por {post.authorName}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Experto en gestión de alojamientos turísticos y automatización de procesos. Ayudando a anfitriones a optimizar sus operaciones desde 2020.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-3xl mx-auto px-6 mt-16 mb-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3">
              ¿Listo para automatizar tu gestión?
            </h2>
            <p className="text-gray-600 mb-6">
              Crea tu primer manual digital en menos de 10 minutos.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white text-base font-semibold rounded hover:bg-gray-800 transition-colors"
            >
              Empezar gratis
            </Link>
          </div>
        </div>

        {/* Academia CTA */}
        <div className="max-w-3xl mx-auto px-6 mb-16">
          <div className="bg-gradient-to-br from-violet-600 to-purple-700 border border-violet-700 rounded-lg p-8 text-center relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 bg-grid-white/5" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-4">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                <span className="text-xs font-medium text-white">Próximamente</span>
              </div>

              <h2 className="text-2xl font-serif font-bold text-white mb-3">
                Aprende con Academia Itineramio
              </h2>
              <p className="text-violet-100 mb-6 text-base">
                Conviértete en un host profesional con cursos, certificados y contenido exclusivo.
              </p>
              <Link
                href="/academia"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-violet-600 text-base font-semibold rounded hover:bg-violet-50 transition-colors shadow-lg"
              >
                Quiero saber más
              </Link>
            </div>
          </div>
        </div>

        {/* Related Articles Carousel */}
        {relatedPosts.length > 0 && (
          <RelatedArticlesCarousel
            posts={relatedPosts}
            categoryNames={categoryNames}
          />
        )}
      </article>
    </div>
  )
}
