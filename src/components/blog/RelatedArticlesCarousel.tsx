'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface RelatedPost {
  id: string
  slug: string
  title: string
  excerpt: string
  coverImage: string | null
  coverImageAlt: string | null
  category: string
  readTime: number
  views: number
}

interface RelatedArticlesCarouselProps {
  posts: RelatedPost[]
  categoryNames: Record<string, string>
}

export default function RelatedArticlesCarousel({ posts, categoryNames }: RelatedArticlesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % posts.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length)
  }

  // Calculate which posts to show (3 at a time on desktop, 1 on mobile)
  const getVisiblePosts = () => {
    const visible = []
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % posts.length
      visible.push(posts[index])
    }
    return visible
  }

  if (posts.length === 0) return null

  const visiblePosts = getVisiblePosts()

  return (
    <section className="border-t border-gray-200 bg-gray-50 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            Artículos relacionados
          </h2>

          {/* Navigation Buttons - Desktop */}
          {posts.length > 3 && (
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={prevSlide}
                className="p-2 bg-white border border-gray-300 rounded-full hover:bg-gray-100 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Artículo anterior"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 bg-white border border-gray-300 rounded-full hover:bg-gray-100 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Siguiente artículo"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Desktop: Show 3 cards */}
          <div className="hidden md:grid md:grid-cols-3 gap-8">
            {visiblePosts.map((related) => (
              <Link
                key={related.id}
                href={`/blog/${related.slug}`}
                className="group block"
              >
                <article className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all h-full flex flex-col">
                  <div className="relative aspect-[16/9] bg-gray-100">
                    {related.coverImage ? (
                      <Image
                        src={related.coverImage}
                        alt={related.coverImageAlt || related.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <div className="text-gray-400 text-center p-4">
                          <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs font-medium">{categoryNames[related.category]}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                      {categoryNames[related.category]}
                    </span>

                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-2 leading-tight group-hover:text-gray-600 transition-colors line-clamp-2">
                      {related.title}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-grow">
                      {related.excerpt}
                    </p>

                    <div className="flex items-center space-x-3 text-xs text-gray-500 mt-auto">
                      <span>{related.readTime} min</span>
                      <span>·</span>
                      <span>{related.views} vistas</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* Mobile: Show 1 card with navigation */}
          <div className="md:hidden">
            <div className="relative">
              <Link
                href={`/blog/${posts[currentIndex].slug}`}
                className="group block"
              >
                <article className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all">
                  <div className="relative aspect-[16/9] bg-gray-100">
                    {posts[currentIndex].coverImage ? (
                      <Image
                        src={posts[currentIndex].coverImage}
                        alt={posts[currentIndex].coverImageAlt || posts[currentIndex].title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <div className="text-gray-400 text-center p-4">
                          <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs font-medium">{categoryNames[posts[currentIndex].category]}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                      {categoryNames[posts[currentIndex].category]}
                    </span>

                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-2 leading-tight group-hover:text-gray-600 transition-colors">
                      {posts[currentIndex].title}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                      {posts[currentIndex].excerpt}
                    </p>

                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span>{posts[currentIndex].readTime} min</span>
                      <span>·</span>
                      <span>{posts[currentIndex].views} vistas</span>
                    </div>
                  </div>
                </article>
              </Link>

              {/* Mobile Navigation */}
              {posts.length > 1 && (
                <div className="flex items-center justify-center mt-6 space-x-4">
                  <button
                    onClick={prevSlide}
                    className="p-2 bg-white border border-gray-300 rounded-full hover:bg-gray-100 hover:border-gray-400 transition-all"
                    aria-label="Artículo anterior"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>

                  {/* Dots indicator */}
                  <div className="flex items-center space-x-2">
                    {posts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentIndex
                            ? 'bg-gray-900 w-6'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Ir al artículo ${index + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextSlide}
                    className="p-2 bg-white border border-gray-300 rounded-full hover:bg-gray-100 hover:border-gray-400 transition-all"
                    aria-label="Siguiente artículo"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Keyboard Navigation Hint */}
        {posts.length > 3 && (
          <div className="hidden md:block mt-6 text-center">
            <p className="text-xs text-gray-500">
              Usa las flechas para navegar entre artículos
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
