'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  QrCode,
  Calculator,
  Wifi,
  FileText,
  Download,
  BookOpen,
  TrendingUp,
  Home,
  CheckSquare,
  Sparkles,
  Zap,
  Star,
  ArrowRight,
  Search,
  Filter,
  Trophy,
  BarChart3
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navbar } from '../../../src/components/layout/Navbar'

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
}

// Tool configs - titles/descriptions come from translations
const activeToolsConfig = [
  {
    id: 'qr-generator',
    titleKey: 'qrGenerator',
    icon: QrCode,
    color: 'from-violet-500 to-purple-600',
    bgColor: 'from-violet-50 to-purple-50',
    borderColor: 'border-violet-200',
    href: '/hub/tools/qr-generator',
    badgeKey: 'free',
    popular: true,
    active: true
  },
  {
    id: 'pricing-calculator',
    titleKey: 'pricingCalculator',
    icon: Calculator,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'from-blue-50 to-cyan-50',
    borderColor: 'border-blue-200',
    href: '/hub/tools/pricing-calculator',
    badgeKey: 'popular',
    popular: true,
    active: true
  },
  {
    id: 'cleaning-checklist',
    titleKey: 'cleaningChecklist',
    icon: Sparkles,
    color: 'from-emerald-500 to-green-600',
    bgColor: 'from-emerald-50 to-green-50',
    borderColor: 'border-emerald-200',
    href: '/hub/tools/cleaning-checklist',
    badgeKey: 'new',
    popular: true,
    active: true
  },
  {
    id: 'house-rules',
    titleKey: 'houseRules',
    icon: FileText,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-200',
    href: '/hub/tools/house-rules',
    badgeKey: 'new',
    popular: true,
    active: true
  },
  {
    id: 'roi-calculator',
    titleKey: 'roiCalculator',
    icon: TrendingUp,
    color: 'from-rose-500 to-pink-600',
    bgColor: 'from-rose-50 to-pink-50',
    borderColor: 'border-rose-200',
    href: '/hub/tools/roi-calculator',
    badgeKey: 'new',
    popular: true,
    active: true
  },
  {
    id: 'wifi-card',
    titleKey: 'wifiCard',
    icon: Wifi,
    color: 'from-sky-500 to-blue-600',
    bgColor: 'from-sky-50 to-blue-50',
    borderColor: 'border-sky-200',
    href: '/hub/tools/wifi-card',
    badgeKey: 'new',
    popular: true,
    active: true
  },
  {
    id: 'star-rating',
    titleKey: 'starRating',
    icon: Star,
    color: 'from-[#FF385C] to-[#E31C5F]',
    bgColor: 'from-red-50 to-pink-50',
    borderColor: 'border-red-200',
    href: '/recursos/plantilla-estrellas-personalizada',
    badgeKey: 'new',
    popular: true,
    active: true
  }
]

// Coming soon tools config
const comingSoonToolsConfig = [
  {
    id: 'description-generator',
    titleKey: 'descriptionGenerator',
    icon: FileText,
    color: 'from-gray-400 to-gray-500',
    bgColor: 'from-gray-50 to-gray-100',
    borderColor: 'border-gray-200',
    href: '#',
    badgeKey: 'comingSoon',
    popular: false,
    active: false
  },
  {
    id: 'occupancy-calculator',
    titleKey: 'occupancyCalculator',
    icon: BarChart3,
    color: 'from-gray-400 to-gray-500',
    bgColor: 'from-gray-50 to-gray-100',
    borderColor: 'border-gray-200',
    href: '#',
    badgeKey: 'comingSoon',
    popular: false,
    active: false
  },
  {
    id: 'checkin-builder',
    titleKey: 'checkinBuilder',
    icon: CheckSquare,
    color: 'from-gray-400 to-gray-500',
    bgColor: 'from-gray-50 to-gray-100',
    borderColor: 'border-gray-200',
    href: '#',
    badgeKey: 'comingSoon',
    popular: false,
    active: false
  }
]

// Plantillas descargables
const templates = [
  {
    id: 'checkin-template',
    title: 'Plantilla Check-in Remoto',
    description: 'Template completo Word + PDF para check-in automatizado',
    icon: CheckSquare,
    downloads: '1,247',
    format: 'DOCX + PDF',
    href: '/blog/plantilla-check-in-remoto-airbnb'
  },
  {
    id: 'wifi-instructions',
    title: 'Instrucciones WiFi',
    description: 'Template para explicar WiFi a huéspedes sin llamadas',
    icon: Wifi,
    downloads: '892',
    format: 'PDF',
    href: '/blog/instrucciones-wifi-huespedes-apartamento-turistico'
  },
  {
    id: 'vut-checklist',
    title: 'Checklist VUT Madrid',
    description: 'Checklist completo de requisitos VUT Madrid 2025',
    icon: FileText,
    downloads: '2,134',
    format: 'PDF',
    href: '/blog/vut-madrid-2025-requisitos-normativa-checklist'
  },
  {
    id: 'manual-template',
    title: 'Plantilla Manual Digital',
    description: 'Template base para crear tu manual digital profesional',
    icon: BookOpen,
    downloads: '1,689',
    format: 'DOCX',
    href: '/blog/manual-digital-apartamento-turistico-guia-completa'
  }
]

// Artículos destacados
const articles = [
  {
    id: 1,
    title: 'Manual Digital Apartamento Turístico: Guía Completa 2025',
    category: 'Guías',
    readTime: '12 min',
    slug: 'manual-digital-apartamento-turistico-guia-completa',
    excerpt: 'Crea manuales digitales que eliminan el 86% de consultas',
    icon: BookOpen
  },
  {
    id: 2,
    title: 'QR Code Apartamento Turístico: Guía + Generador',
    category: 'Automatización',
    readTime: '8 min',
    slug: 'qr-code-apartamento-turistico-guia-generador',
    excerpt: 'Feature único que NO tiene Touch Stay',
    icon: QrCode
  },
  {
    id: 3,
    title: 'VUT Madrid 2025: Requisitos Completos',
    category: 'Normativa',
    readTime: '12 min',
    slug: 'vut-madrid-2025-requisitos-normativa-checklist',
    excerpt: 'Nueva normativa. Manual digital OBLIGATORIO.',
    icon: FileText
  }
]

export default function KnowledgeHub() {
  const { t } = useTranslation('tools')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Generate tools with translations
  const activeTools = useMemo(() =>
    activeToolsConfig.map(tool => ({
      ...tool,
      title: t(`hub.tools.${tool.titleKey}.title`),
      description: t(`hub.tools.${tool.titleKey}.description`),
      badge: t(`common.${tool.badgeKey}`)
    })), [t]
  )

  const comingSoonTools = useMemo(() =>
    comingSoonToolsConfig.map(tool => ({
      ...tool,
      title: t(`hub.tools.${tool.titleKey}.title`),
      description: t(`hub.tools.${tool.titleKey}.description`),
      badge: t(`common.${tool.badgeKey}`)
    })), [t]
  )

  // Combine for search
  const tools = [...activeTools, ...comingSoonTools]

  // Filter functions
  const filterBySearch = (item: any) => {
    if (!searchQuery.trim()) return true

    const query = searchQuery.toLowerCase()
    const title = item.title?.toLowerCase() || ''
    const description = item.description?.toLowerCase() || ''
    const excerpt = item.excerpt?.toLowerCase() || ''
    const category = item.category?.toLowerCase() || ''
    const type = item.type?.toLowerCase() || ''

    return title.includes(query) || description.includes(query) || excerpt.includes(query) || category.includes(query) || type.includes(query)
  }

  // Add type to each item for unified search
  const toolsWithType = tools.map(tool => ({ ...tool, type: 'Herramienta', typeColor: 'bg-violet-100 text-violet-700 border-violet-300' }))
  const templatesWithType = templates.map(template => ({ ...template, type: 'Plantilla', typeColor: 'bg-blue-100 text-blue-700 border-blue-300' }))
  const articlesWithType = articles.map(article => ({ ...article, type: 'Guía', typeColor: 'bg-green-100 text-green-700 border-green-300' }))

  const filteredTools = toolsWithType.filter(filterBySearch)
  const filteredTemplates = templatesWithType.filter(filterBySearch)
  const filteredArticles = articlesWithType.filter(filterBySearch)

  // Unified search results
  const allResults = [...filteredTools, ...filteredTemplates, ...filteredArticles]
  const hasResults = allResults.length > 0
  const isSearching = searchQuery.trim().length > 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Animated background */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-6"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">{t('hub.badge')}</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            >
              {t('hub.title')}
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl sm:text-2xl text-white/90 mb-12 leading-relaxed"
            >
              {t('hub.subtitle')}
            </motion.p>

            {/* Search Bar */}
            <motion.div
              variants={fadeInUp}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('hub.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-violet-500 focus:outline-none text-gray-900 placeholder-gray-400 shadow-2xl"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-medium text-sm"
                  >
                    {t('hub.clear')}
                  </button>
                )}
              </div>
              {searchQuery && hasResults && (
                <div className="mt-4 text-center text-white/90 text-sm">
                  {allResults.length} {t('hub.resultsFound')}
                </div>
              )}
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-3 gap-8 mt-12 max-w-3xl mx-auto"
            >
              <motion.div variants={scaleIn} className="text-center">
                <div className="text-4xl font-bold text-white mb-2">7</div>
                <div className="text-white/80 text-sm">{t('hub.stats.tools')}</div>
              </motion.div>
              <motion.div variants={scaleIn} className="text-center">
                <div className="text-4xl font-bold text-white mb-2">30+</div>
                <div className="text-white/80 text-sm">{t('hub.stats.articles')}</div>
              </motion.div>
              <motion.div variants={scaleIn} className="text-center">
                <div className="text-4xl font-bold text-white mb-2">3</div>
                <div className="text-white/80 text-sm">{t('hub.stats.coming')}</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Unified Search Results */}
      {isSearching && (
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-3">
                    {t('hub.searchResults')}
                  </h2>
                  <p className="text-xl text-gray-600">
                    {allResults.length} {allResults.length === 1 ? t('hub.resultFound') : t('hub.resultsFound')} para "{searchQuery}"
                  </p>
                </div>
                <Search className="w-12 h-12 text-violet-600" />
              </div>
            </motion.div>

            {/* No results message */}
            {!hasResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('hub.noResults')}</h3>
                <p className="text-gray-600 mb-4">{t('hub.tryOtherTerms')}</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-violet-600 hover:text-violet-700 font-semibold"
                >
                  {t('hub.clearSearch')}
                </button>
              </motion.div>
            )}

            {/* Unified Results Grid */}
            {hasResults && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {allResults.map((item: any) => {
                  const Icon = item.icon
                  const isArticle = item.type === 'Guía'
                  const isTemplate = item.type === 'Plantilla'
                  const isTool = item.type === 'Herramienta'

                  return (
                    <motion.div
                      key={item.id}
                      variants={scaleIn}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="group"
                    >
                      <Link href={item.href || `/blog/${item.slug}`}>
                        <div className="relative h-full bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-violet-500 hover:shadow-xl transition-all">
                          {/* Type Badge */}
                          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border ${item.typeColor}`}>
                            {item.type}
                          </div>

                          {/* Icon */}
                          <div className={`w-12 h-12 rounded-xl ${isTool ? `bg-gradient-to-br ${item.color}` : 'bg-gradient-to-br from-gray-100 to-gray-200'} flex items-center justify-center mb-4`}>
                            <Icon className={`w-6 h-6 ${isTool ? 'text-white' : 'text-gray-700'}`} />
                          </div>

                          {/* Title */}
                          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors line-clamp-2">
                            {item.title}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {item.description || item.excerpt}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            {isTemplate && (
                              <>
                                <span className="flex items-center text-xs text-gray-500">
                                  <Download className="w-3 h-3 mr-1" />
                                  {item.downloads}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 rounded-full font-medium text-xs">
                                  {item.format}
                                </span>
                              </>
                            )}
                            {isArticle && (
                              <>
                                <span className="text-xs text-gray-500">{item.category}</span>
                                <span className="text-xs text-gray-500">{item.readTime}</span>
                              </>
                            )}
                            {isTool && (
                              <div className="flex items-center text-violet-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                                {t('hub.use')} <ArrowRight className="ml-1 w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Herramientas Activas */}
      {!isSearching && (
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-3">
                    {t('hub.sections.freeTools')}
                  </h2>
                  <p className="text-xl text-gray-600">
                    {t('hub.sections.freeToolsSubtitle')}
                  </p>
                </div>
                <Zap className="w-12 h-12 text-violet-600" />
              </div>
            </motion.div>

            {/* Herramientas ACTIVAS */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-8 mb-16"
            >
              {activeTools.map((tool) => {
                const Icon = tool.icon
                return (
                  <motion.div
                    key={tool.id}
                    variants={scaleIn}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="group relative"
                  >
                    <Link href={tool.href}>
                      <div className={`relative p-8 rounded-3xl bg-gradient-to-br ${tool.bgColor} border-2 ${tool.borderColor} hover:shadow-2xl transition-all h-full`}>
                        {/* Badge */}
                        {tool.badge && (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-white rounded-full text-xs font-bold text-gray-900 shadow-lg">
                            {tool.badge}
                          </div>
                        )}

                        {/* Popular indicator */}
                        {tool.popular && (
                          <div className="absolute -top-3 -left-3">
                            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                          </div>
                        )}

                        {/* Icon */}
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>

                        {/* Content */}
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-violet-600 group-hover:to-purple-600 transition-all">
                          {tool.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {tool.description}
                        </p>

                        {/* CTA */}
                        <div className="flex items-center text-violet-600 font-semibold group-hover:translate-x-2 transition-transform">
                          {t('hub.useTool')} <ArrowRight className="ml-2 w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Herramientas PRÓXIMAMENTE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h3 className="text-2xl font-bold text-gray-400 mb-2">{t('hub.sections.comingSoon')}</h3>
              <p className="text-gray-400">{t('hub.sections.comingSoonSubtitle')}</p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-3 lg:grid-cols-6 gap-4"
            >
              {comingSoonTools.map((tool) => {
                const Icon = tool.icon
                return (
                  <motion.div
                    key={tool.id}
                    variants={scaleIn}
                    className="relative cursor-not-allowed"
                  >
                    <div className="relative p-4 rounded-2xl bg-gray-50 border-2 border-gray-200 opacity-60 h-full">
                      {/* Badge */}
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-gray-200 rounded-full text-[10px] font-bold text-gray-500">
                        {tool.badge}
                      </div>

                      {/* Icon */}
                      <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5 text-gray-400" />
                      </div>

                      {/* Content */}
                      <h4 className="text-sm font-bold text-gray-400 mb-1 line-clamp-1">
                        {tool.title}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* Plantillas Descargables */}
      {!isSearching && filteredTemplates.length > 0 && (
        <section className="py-24 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-3">
                    {t('hub.sections.templates')}
                  </h2>
                  <p className="text-xl text-gray-600">
                    {t('hub.sections.templatesSubtitle')}
                  </p>
                </div>
                <Download className="w-12 h-12 text-blue-600" />
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {filteredTemplates.map((template) => {
              const Icon = template.icon
              return (
                <motion.div
                  key={template.id}
                  variants={scaleIn}
                  whileHover={{ y: -10, scale: 1.05 }}
                >
                  <Link href={template.href}>
                    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-violet-500 hover:shadow-xl transition-all h-full">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-gray-700" />
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {template.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {template.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                        <span className="flex items-center">
                          <Download className="w-3 h-3 mr-1" />
                          {template.downloads}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 rounded-full font-medium">
                          {template.format}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
            </motion.div>
          </div>
        </section>
      )}

      {/* Success Stories / Testimonios */}
      {!isSearching && (
        <section className="py-24 px-6 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", duration: 0.6 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-full border border-violet-200 mb-6"
            >
              <Trophy className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-medium text-violet-900">{t('hub.sections.successStories')}</span>
            </motion.div>

            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('hub.sections.successStoriesSubtitle')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('hub.sections.successStoriesSubtitle')}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {/* Story 1 */}
            <motion.div
              variants={scaleIn}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white rounded-3xl p-8 border-2 border-violet-200 shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />

              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    MG
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">María González</h3>
                    <p className="text-sm text-gray-600">3 apartamentos · Barcelona</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="text-3xl font-bold text-green-600">-86%</div>
                    <div className="text-xs text-green-800">Consultas WiFi</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600">8h</div>
                    <div className="text-xs text-blue-800">Ahorradas/sem</div>
                  </div>
                </div>

                <p className="text-gray-700 italic mb-4">
                  "Ya no me llaman a las 3 AM preguntando cómo funciona la lavadora. El QR en la entrada cambió mi vida."
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                    Superhost Airbnb
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Story 2 */}
            <motion.div
              variants={scaleIn}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white rounded-3xl p-8 border-2 border-blue-200 shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />

              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    CR
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Carlos Rodríguez</h3>
                    <p className="text-sm text-gray-600">15 apartamentos · Málaga</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-violet-50 rounded-xl p-4 border border-violet-200">
                    <div className="text-3xl font-bold text-violet-600">25h</div>
                    <div className="text-xs text-violet-800">Ahorradas/mes</div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <div className="text-3xl font-bold text-orange-600">+12</div>
                    <div className="text-xs text-orange-800">Props nuevas</div>
                  </div>
                </div>

                <p className="text-gray-700 italic mb-4">
                  "Recuperé tiempo para conseguir más propiedades. Mis huéspedes aman la experiencia organizada."
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                    Property Manager
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Story 3 */}
            <motion.div
              variants={scaleIn}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white rounded-3xl p-8 border-2 border-green-200 shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />

              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    AM
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Ana Martín</h3>
                    <p className="text-sm text-gray-600">8 propiedades · Sevilla</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-pink-50 rounded-xl p-4 border border-pink-200">
                    <div className="text-3xl font-bold text-pink-600">4.9★</div>
                    <div className="text-xs text-pink-800">Rating medio</div>
                  </div>
                  <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                    <div className="text-3xl font-bold text-cyan-600">10min</div>
                    <div className="text-xs text-cyan-800">Crear manual</div>
                  </div>
                </div>

                <p className="text-gray-700 italic mb-4">
                  "En 10 minutos tengo guías que parecen de hotel 5 estrellas. Profesionalidad sin esfuerzo."
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                    Host independiente
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-12 py-5 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-full text-xl font-bold hover:shadow-2xl hover:shadow-violet-500/30 transition-all group"
              >
                {t('hub.joinHosts')}
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
        </section>
      )}

      {/* Artículos Destacados */}
      {!isSearching && filteredArticles.length > 0 && (
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-3">
                    {t('hub.sections.articles')}
                  </h2>
                  <p className="text-xl text-gray-600">
                    {t('hub.sections.articlesSubtitle')}
                  </p>
                </div>
                <BookOpen className="w-12 h-12 text-green-600" />
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-8 mb-12"
            >
              {filteredArticles.map((article) => (
              <motion.div
                key={article.id}
                variants={scaleIn}
                whileHover={{ y: -10 }}
              >
                <Link href={`/blog/${article.slug}`}>
                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-green-500 hover:shadow-xl transition-all h-full">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full mb-4">
                      {article.category}
                    </span>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-gray-600 mb-4 text-sm">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center text-sm text-gray-500">
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA to Blog */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link href="/blog">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-full text-lg font-semibold hover:shadow-xl transition-all group"
              >
                {t('hub.seeAllArticles')}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
          </div>
        </section>
      )}

      {/* CTA Final */}
      {!isSearching && (
        <section className="py-24 px-6 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              {t('hub.cta.title')}
            </h2>
            <p className="text-2xl text-white/90 mb-12">
              {t('hub.cta.subtitle')}
            </p>

            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-12 py-5 bg-white text-violet-600 rounded-full text-xl font-bold hover:shadow-2xl transition-all group"
              >
                {t('hub.cta.button')}
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </Link>

            <p className="mt-6 text-white/80 text-sm">
              {t('hub.cta.note')}
            </p>
          </motion.div>
        </div>
        </section>
      )}
    </div>
  )
}
