import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowLeft, Share2, Eye, Tag } from 'lucide-react'
import { ShareButtons } from '../../../../src/components/blog/ShareButtons'
import { BlogComments } from '../../../../src/components/blog/BlogComments'
import { LikeButton } from '../../../../src/components/blog/LikeButton'
import { prisma } from '../../../../src/lib/prisma'
import { markdownToHtml } from '../../../../src/lib/markdown'
import ReadingProgress from './ReadingProgress'
import BlogArticleTracker from './BlogArticleTracker'
import RelatedArticlesCarousel from '../../../../src/components/blog/RelatedArticlesCarousel'

// ISR: Revalidate every hour (3600 seconds) for better performance
// Pages are cached and served statically, regenerated in background when stale
export const revalidate = 3600

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
      authors: [post.authorName],
      siteName: 'Itineramio Blog',
      url: `https://www.itineramio.com/blog/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
      creator: '@itineramio',
      site: '@itineramio',
    },
    alternates: {
      canonical: `https://www.itineramio.com/blog/${slug}`,
    },
  }
}

// Generate static paths for all published posts
export async function generateStaticParams() {
  try {
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
  } catch (error) {
    // Return empty array if database is not accessible during build
    console.error('Error fetching blog posts for static params:', error)
    return []
  }
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

  // Fields needed for related posts display (excludes heavy 'content' field)
  const relatedSelectFields = {
    id: true,
    slug: true,
    title: true,
    excerpt: true,
    coverImage: true,
    coverImageAlt: true,
    category: true,
    publishedAt: true,
    readTime: true,
    views: true
  }

  // Get related posts with variety:
  // 1. First try same category
  // 2. Then fill with other categories (educational mix)
  // 3. Shuffle to make them change
  const sameCategoryPosts = await prisma.blogPost.findMany({
    where: {
      status: 'PUBLISHED',
      category: post.category,
      id: { not: post.id }
    },
    take: 6,
    orderBy: { views: 'desc' },
    select: relatedSelectFields
  })

  // Get posts from other categories for variety
  const otherCategoryPosts = await prisma.blogPost.findMany({
    where: {
      status: 'PUBLISHED',
      category: { not: post.category },
      id: { not: post.id }
    },
    take: 6,
    orderBy: [
      { views: 'desc' },
      { publishedAt: 'desc' }
    ],
    select: relatedSelectFields
  })

  // Combine and shuffle for variety, then take 3
  const allPosts = [...sameCategoryPosts, ...otherCategoryPosts]

  // Simple shuffle using current timestamp as seed for some variety
  const shuffled = allPosts
    .map((p, i) => ({ post: p, sort: (Date.now() % 1000) + i * 137 }))
    .sort((a, b) => (a.sort % 7) - (b.sort % 7))
    .map(({ post }) => post)

  // Ensure at least 1 from same category if available, rest mixed
  const relatedPosts: typeof sameCategoryPosts = []
  const usedIds = new Set<string>()

  // Add 1 from same category first (if available)
  if (sameCategoryPosts.length > 0) {
    const randomIndex = Date.now() % sameCategoryPosts.length
    relatedPosts.push(sameCategoryPosts[randomIndex])
    usedIds.add(sameCategoryPosts[randomIndex].id)
  }

  // Fill the rest with shuffled posts (mix of categories)
  for (const p of shuffled) {
    if (relatedPosts.length >= 3) break
    if (!usedIds.has(p.id)) {
      relatedPosts.push(p)
      usedIds.add(p.id)
    }
  }

  // Category display names
  const categoryNames: Record<string, string> = {
    'GUIAS': 'Guías',
    'MEJORES_PRACTICAS': 'Mejores Prácticas',
    'NORMATIVA': 'Normativa',
    'AUTOMATIZACIÓN': 'Automatización',
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
    image: post.coverImage || 'https://www.itineramio.com/og-image.png',
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
        url: 'https://www.itineramio.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.itineramio.com/blog/${post.slug}`,
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
        item: 'https://www.itineramio.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://www.itineramio.com/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://www.itineramio.com/blog/${post.slug}`,
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
      <BlogArticleTracker
        slug={post.slug}
        title={post.title}
        category={post.category}
      />

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
            <ShareButtons
              url={`https://www.itineramio.com/blog/${post.slug}`}
              title={post.title}
              description={post.excerpt}
              className="hidden sm:flex"
            />
          </div>
        </header>

        {/* Cover Image - skip if coverImageAlt starts with "og:" (image only for Open Graph/social sharing) */}
        {post.coverImage && !post.coverImageAlt?.startsWith('og:') && (
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

        {/* Custom Article Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Lead paragraph */
          .article-lead { font-size: 1.25rem; line-height: 1.8; color: #374151; margin-bottom: 2rem; }

          /* Section titles */
          .section-title { font-size: 1.875rem; font-weight: 700; color: #111827; margin-top: 3rem; margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid #e5e7eb; }
          .subsection-title { font-size: 1.5rem; font-weight: 600; color: #1f2937; margin-top: 2rem; margin-bottom: 1rem; }

          /* Key points box */
          .key-points { background: linear-gradient(to bottom right, #f5f3ff, #ede9fe); border-radius: 0.75rem; padding: 1.5rem; margin: 2rem 0; }
          .key-points h3 { font-size: 1.125rem; font-weight: 700; color: #5b21b6; margin-bottom: 1rem; }
          .key-points ul { margin: 0; padding-left: 1.25rem; }
          .key-points li { color: #4c1d95; margin-bottom: 0.5rem; }

          /* Tip box */
          .tip-box { background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 0 0.5rem 0.5rem 0; padding: 1rem 1.5rem; margin: 1.5rem 0; }
          .tip-box-title { font-weight: 700; color: #047857; margin-bottom: 0.5rem; }
          .tip-box p:last-child { margin-bottom: 0; color: #065f46; }

          /* Warning box */
          .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0 0.5rem 0.5rem 0; padding: 1rem 1.5rem; margin: 1.5rem 0; }
          .warning-box-title { font-weight: 700; color: #b45309; margin-bottom: 0.5rem; }
          .warning-box p:last-child { margin-bottom: 0; color: #92400e; }

          /* Info box */
          .info-box { background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0 0.5rem 0.5rem 0; padding: 1rem 1.5rem; margin: 1.5rem 0; }
          .info-box-title { font-weight: 700; color: #1d4ed8; margin-bottom: 0.5rem; }
          .info-box p:last-child { margin-bottom: 0; color: #1e40af; }

          /* Checklist box */
          .checklist-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; margin: 2rem 0; }
          .checklist-box h4 { font-size: 1.125rem; font-weight: 700; color: #111827; margin-bottom: 1rem; }
          .checklist-group { margin-bottom: 1rem; }
          .checklist-group h5 { font-size: 0.875rem; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 0.5rem; }
          .checklist-group ul { margin: 0; padding-left: 1.25rem; }
          .checklist-group li { color: #374151; margin-bottom: 0.25rem; }

          /* Steps box */
          .steps-box { background: #fafafa; border-radius: 0.75rem; padding: 1.5rem; margin: 2rem 0; }
          .steps-box h4 { font-size: 1.125rem; font-weight: 700; color: #111827; margin-bottom: 1.5rem; }
          .step { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
          .step-number { flex-shrink: 0; width: 2rem; height: 2rem; background: #7c3aed; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.875rem; }
          .step-content h5 { font-weight: 600; color: #111827; margin-bottom: 0.25rem; }
          .step-content p { color: #6b7280; margin: 0; font-size: 0.9375rem; }

          /* Scripts box */
          .scripts-box { background: #1f2937; border-radius: 0.75rem; padding: 1.5rem; margin: 2rem 0; }
          .scripts-box h4 { color: #f3f4f6; font-size: 1rem; font-weight: 600; margin-bottom: 1rem; }
          .script { background: #111827; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem; }
          .script:last-child { margin-bottom: 0; }
          .script-label { font-size: 0.75rem; text-transform: uppercase; color: #9ca3af; margin-bottom: 0.5rem; font-weight: 600; }
          .script p:last-child { color: #e5e7eb; white-space: pre-wrap; margin: 0; font-family: ui-monospace, monospace; font-size: 0.875rem; line-height: 1.6; }

          /* Comparison grid */
          .comparison-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
          .comparison-card { background: #f9fafb; border-radius: 0.75rem; padding: 1.5rem; }
          .comparison-card.good { background: #ecfdf5; border: 1px solid #10b981; }
          .comparison-card.bad { background: #fef2f2; border: 1px solid #ef4444; }
          .comparison-card h4 { font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem; }
          .comparison-card ul { margin: 0; padding-left: 1.25rem; }
          .comparison-card li { margin-bottom: 0.5rem; }

          /* Pull quote */
          .pull-quote { font-size: 1.375rem; font-style: italic; color: #4b5563; border-left: 4px solid #7c3aed; padding-left: 1.5rem; margin: 2rem 0; line-height: 1.7; }

          /* Styled table */
          .styled-table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9375rem; }
          .styled-table thead { background: #f3f4f6; }
          .styled-table th { padding: 0.75rem 1rem; text-align: left; font-weight: 600; color: #374151; border: 1px solid #e5e7eb; }
          .styled-table td { padding: 0.75rem 1rem; border: 1px solid #e5e7eb; color: #4b5563; }
          .styled-table tbody tr:nth-child(even) { background: #f9fafb; }
        `}} />

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
            dangerouslySetInnerHTML={{
              __html: post.content.trim().startsWith('<') || post.content.includes('style=')
                ? post.content
                : markdownToHtml(post.content)
            }}
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
          <div className="mt-8 pt-8 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="flex items-center text-sm text-gray-500">
                <Eye className="w-4 h-4 mr-1.5" />
                {post.views.toLocaleString()} vistas
              </span>
              <LikeButton slug={post.slug} initialLikes={post.likes} />
            </div>

            <ShareButtons
              url={`https://www.itineramio.com/blog/${post.slug}`}
              title={post.title}
              description={post.excerpt}
            />
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

        {/* Comments Section */}
        <div className="max-w-3xl mx-auto px-6">
          <BlogComments slug={post.slug} />
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
