'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Search,
  Rocket,
  Home,
  Layers,
  LayoutGrid,
  FileText,
  Share2,
  BarChart3,
  User,
  CreditCard,
  ChevronRight,
  Clock,
  ArrowRight,
  BookOpen,
  Sparkles
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import {
  onboardingCategories,
  onboardingArticles,
  searchArticles,
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
const colorMap: Record<string, { bg: string; text: string; hover: string; border: string }> = {
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', hover: 'hover:bg-violet-100', border: 'border-violet-200' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', hover: 'hover:bg-blue-100', border: 'border-blue-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', hover: 'hover:bg-purple-100', border: 'border-purple-200' },
  green: { bg: 'bg-green-50', text: 'text-green-600', hover: 'hover:bg-green-100', border: 'border-green-200' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', hover: 'hover:bg-orange-100', border: 'border-orange-200' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-600', hover: 'hover:bg-pink-100', border: 'border-pink-200' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', hover: 'hover:bg-cyan-100', border: 'border-cyan-200' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-600', hover: 'hover:bg-slate-100', border: 'border-slate-200' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', hover: 'hover:bg-emerald-100', border: 'border-emerald-200' },
}

function CategoryCard({ category }: { category: OnboardingCategory }) {
  const Icon = iconMap[category.icon] || BookOpen
  const colors = colorMap[category.color] || colorMap.violet
  const articleCount = onboardingArticles.filter(a => a.categorySlug === category.slug).length

  return (
    <Link href={`/onboarding/${category.slug}`}>
      <motion.div
        className={`p-6 rounded-2xl border ${colors.border} ${colors.bg} ${colors.hover} transition-all duration-300 h-full group cursor-pointer`}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">
          {category.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          {category.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{articleCount} artículos</span>
          <ChevronRight className={`w-4 h-4 ${colors.text} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
        </div>
      </motion.div>
    </Link>
  )
}

function ArticleCard({ article }: { article: OnboardingArticle }) {
  const colors = colorMap[onboardingCategories.find(c => c.slug === article.categorySlug)?.color || 'violet'] || colorMap.violet

  return (
    <Link href={`/onboarding/${article.categorySlug}/${article.slug}`}>
      <motion.div
        className="p-4 rounded-xl border border-gray-200 bg-white hover:border-violet-300 hover:shadow-md transition-all duration-300 group cursor-pointer"
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
            <BookOpen className={`w-4 h-4 ${colors.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 group-hover:text-violet-600 transition-colors line-clamp-1">
              {article.title}
            </h4>
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
              {article.description}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                {article.category}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.readingTime} min
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </div>
      </motion.div>
    </Link>
  )
}

function SearchResults({ query, results }: { query: string; results: OnboardingArticle[] }) {
  if (!query) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4"
    >
      <p className="text-sm text-gray-600 mb-4">
        {results.length} resultado{results.length !== 1 ? 's' : ''} para "{query}"
      </p>
      {results.length > 0 ? (
        <div className="grid gap-3">
          {results.slice(0, 10).map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
          {results.length > 10 && (
            <p className="text-sm text-gray-500 text-center py-2">
              Mostrando 10 de {results.length} resultados
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No se encontraron artículos</p>
          <p className="text-sm text-gray-400 mt-1">Prueba con otras palabras clave</p>
        </div>
      )}
    </motion.div>
  )
}

export default function OnboardingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    return searchArticles(searchQuery)
  }, [searchQuery])

  // Get popular/featured articles (first 6 for now)
  const popularArticles = useMemo(() => {
    return onboardingArticles
      .filter(a => ['crear-propiedad', 'código-qr', 'crear-zona', 'compartir-link', 'ver-estadísticas', 'que-es-conjunto'].includes(a.id))
      .slice(0, 6)
  }, [])

  const sortedCategories = [...onboardingCategories].sort((a, b) => a.order - b.order)

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/50 via-white to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Centro de ayuda
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Centro de Onboarding
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Todo lo que necesitas saber para sacar el máximo provecho de Itineramio.
              Guías detalladas paso a paso.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative max-w-2xl mx-auto"
          >
            <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar artículos... (ej: crear propiedad, QR, zonas)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-lg placeholder:text-gray-400"
              />
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 max-h-[60vh] overflow-y-auto z-50">
                <SearchResults query={searchQuery} results={searchResults} />
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Artículos populares
              </h2>
              <Link href="/onboarding/empezar" className="text-violet-600 hover:text-violet-700 text-sm font-medium flex items-center gap-1">
                Ver primeros pasos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <ArticleCard article={article} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Explora por categoría
            </h2>
            <p className="text-gray-600 mb-8">
              {onboardingArticles.length} artículos organizados en {onboardingCategories.length} categorías
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCategories.map((category, index) => (
                <motion.div
                  key={category.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <CategoryCard category={category} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¿No encuentras lo que buscas?
            </h2>
            <p className="text-gray-600 mb-8">
              Nuestro equipo está aquí para ayudarte
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors"
              >
                Contactar soporte
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Preguntas frecuentes
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
