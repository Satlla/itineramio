'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams, notFound } from 'next/navigation'
import {
  ChevronRight,
  Clock,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Rocket,
  Home,
  Layers,
  LayoutGrid,
  FileText,
  Share2,
  BarChart3,
  User,
  CreditCard,
  Search
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import {
  onboardingCategories,
  getArticlesByCategory,
  getCategoryBySlug,
  type OnboardingCategory,
  type OnboardingArticle
} from '@/data/onboarding-articles'

// Icon mapping for categories
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket,
  Home,
  Layers,
  LayoutGrid,
  FileText,
  Share2,
  BarChart3,
  User,
  CreditCard,
}

// Color mapping for categories
const colorMap: Record<string, { bg: string; text: string; hover: string; border: string; gradient: string }> = {
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', hover: 'hover:bg-violet-100', border: 'border-violet-200', gradient: 'from-violet-500 to-purple-600' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', hover: 'hover:bg-blue-100', border: 'border-blue-200', gradient: 'from-blue-500 to-blue-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', hover: 'hover:bg-purple-100', border: 'border-purple-200', gradient: 'from-purple-500 to-purple-600' },
  green: { bg: 'bg-green-50', text: 'text-green-600', hover: 'hover:bg-green-100', border: 'border-green-200', gradient: 'from-green-500 to-green-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', hover: 'hover:bg-orange-100', border: 'border-orange-200', gradient: 'from-orange-500 to-orange-600' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-600', hover: 'hover:bg-pink-100', border: 'border-pink-200', gradient: 'from-pink-500 to-pink-600' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', hover: 'hover:bg-cyan-100', border: 'border-cyan-200', gradient: 'from-cyan-500 to-cyan-600' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-600', hover: 'hover:bg-slate-100', border: 'border-slate-200', gradient: 'from-slate-500 to-slate-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', hover: 'hover:bg-emerald-100', border: 'border-emerald-200', gradient: 'from-emerald-500 to-emerald-600' },
}

function ArticleListItem({ article, index, colors }: { article: OnboardingArticle; index: number; colors: typeof colorMap.violet }) {
  return (
    <Link href={`/onboarding/${article.categorySlug}/${article.slug}`}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="group flex items-start gap-4 p-5 rounded-xl border border-gray-200 bg-white hover:border-violet-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
      >
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center text-sm font-semibold ${colors.text} group-hover:scale-110 transition-transform`}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors mb-1">
            {article.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {article.description}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readingTime} min de lectura
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 self-center">
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
        </div>
      </motion.div>
    </Link>
  )
}

function OtherCategoryCard({ category, currentSlug }: { category: OnboardingCategory; currentSlug: string }) {
  if (category.slug === currentSlug) return null

  const Icon = iconMap[category.icon] || BookOpen
  const colors = colorMap[category.color] || colorMap.violet

  return (
    <Link href={`/onboarding/${category.slug}`}>
      <div className={`flex items-center gap-3 p-3 rounded-lg ${colors.bg} ${colors.hover} transition-colors group`}>
        <Icon className={`w-4 h-4 ${colors.text}`} />
        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{category.name}</span>
        <ChevronRight className="w-3 h-3 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  )
}

export default function CategoryPage() {
  const params = useParams()
  const categorySlug = params.categoria as string

  const category = useMemo(() => getCategoryBySlug(categorySlug), [categorySlug])
  const articles = useMemo(() => getArticlesByCategory(categorySlug), [categorySlug])

  if (!category) {
    notFound()
  }

  const Icon = iconMap[category.icon] || BookOpen
  const colors = colorMap[category.color] || colorMap.violet

  // Get adjacent categories for navigation
  const sortedCategories = [...onboardingCategories].sort((a, b) => a.order - b.order)
  const currentIndex = sortedCategories.findIndex(c => c.slug === categorySlug)
  const prevCategory = currentIndex > 0 ? sortedCategories[currentIndex - 1] : null
  const nextCategory = currentIndex < sortedCategories.length - 1 ? sortedCategories[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <Navbar />

      {/* Header */}
      <section className={`pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br ${colors.gradient} relative overflow-hidden`}>
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-white blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto relative">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-white/80 text-sm mb-6"
          >
            <Link href="/onboarding" className="hover:text-white transition-colors">
              Centro de Onboarding
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium">{category.name}</span>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-start gap-6"
          >
            <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm items-center justify-center">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {category.name}
              </h1>
              <p className="text-lg text-white/90 mb-4">
                {category.description}
              </p>
              <p className="text-sm text-white/70">
                {articles.length} artículo{articles.length !== 1 ? 's' : ''} disponible{articles.length !== 1 ? 's' : ''}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content - Articles List */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Artículos en esta categoría
                </h2>
              </div>

              {articles.length > 0 ? (
                <div className="space-y-4">
                  {articles.map((article, index) => (
                    <ArticleListItem
                      key={article.id}
                      article={article}
                      index={index}
                      colors={colors}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay artículos en esta categoría todavía</p>
                </div>
              )}

              {/* Category Navigation */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  {prevCategory ? (
                    <Link
                      href={`/onboarding/${prevCategory.slug}`}
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-all group flex-1"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-violet-600 group-hover:-translate-x-1 transition-all" />
                      <div>
                        <p className="text-xs text-gray-500">Anterior</p>
                        <p className="font-medium text-gray-900 group-hover:text-violet-600">{prevCategory.name}</p>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex-1" />
                  )}

                  {nextCategory && (
                    <Link
                      href={`/onboarding/${nextCategory.slug}`}
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-all group flex-1 justify-end text-right"
                    >
                      <div>
                        <p className="text-xs text-gray-500">Siguiente</p>
                        <p className="font-medium text-gray-900 group-hover:text-violet-600">{nextCategory.name}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Search Link */}
                <Link
                  href="/onboarding"
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-sm text-gray-600 hover:text-violet-600"
                >
                  <Search className="w-4 h-4" />
                  Buscar artículos
                </Link>

                {/* Other Categories */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Otras categorías
                  </h3>
                  <div className="space-y-2">
                    {sortedCategories.map((cat) => (
                      <OtherCategoryCard
                        key={cat.slug}
                        category={cat}
                        currentSlug={categorySlug}
                      />
                    ))}
                  </div>
                </div>

                {/* Help */}
                <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
                  <h3 className="font-medium text-violet-900 mb-2">
                    ¿Necesitas ayuda?
                  </h3>
                  <p className="text-sm text-violet-700 mb-3">
                    Nuestro equipo está disponible para resolver tus dudas
                  </p>
                  <Link
                    href="/#contact"
                    className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700"
                  >
                    Contactar soporte
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
