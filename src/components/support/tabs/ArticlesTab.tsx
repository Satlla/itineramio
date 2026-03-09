'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Search, Star, Loader2, ChevronRight,
  Rocket, Home, BookOpen, CreditCard, User, Plug, Wrench, Sparkles, HelpCircle
} from 'lucide-react'
import { ArticleDetail } from './ArticleDetail'

interface Article {
  id: string
  slug: string
  title: Record<string, string>
  excerpt: Record<string, string>
  content: Record<string, string>
  category: string
  icon: string | null
  isFeatured: boolean
  viewCount: number
  helpfulYes: number
  helpfulNo: number
}

const CATEGORIES = [
  'GETTING_STARTED',
  'PROPERTIES',
  'GUIDES',
  'BILLING',
  'ACCOUNT',
  'INTEGRATIONS',
  'TROUBLESHOOTING',
  'FEATURES',
]

const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  GETTING_STARTED: { icon: <Rocket className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  PROPERTIES: { icon: <Home className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-50' },
  GUIDES: { icon: <BookOpen className="w-4 h-4" />, color: 'text-violet-600', bg: 'bg-violet-50' },
  BILLING: { icon: <CreditCard className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-50' },
  ACCOUNT: { icon: <User className="w-4 h-4" />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  INTEGRATIONS: { icon: <Plug className="w-4 h-4" />, color: 'text-pink-600', bg: 'bg-pink-50' },
  TROUBLESHOOTING: { icon: <Wrench className="w-4 h-4" />, color: 'text-orange-600', bg: 'bg-orange-50' },
  FEATURES: { icon: <Sparkles className="w-4 h-4" />, color: 'text-cyan-600', bg: 'bg-cyan-50' },
}

function getCategoryConfig(category: string) {
  return CATEGORY_CONFIG[category] || { icon: <HelpCircle className="w-4 h-4" />, color: 'text-gray-600', bg: 'bg-gray-50' }
}

export function ArticlesTab() {
  const { t, i18n } = useTranslation('support')
  const lang = i18n.language || 'es'

  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (selectedCategory) params.set('category', selectedCategory)

      const res = await fetch(`/api/support/articles?${params}`)
      if (res.ok) {
        const data = await res.json()
        setArticles(data.articles ?? [])
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [search, selectedCategory])

  useEffect(() => {
    const timeout = setTimeout(fetchArticles, 300)
    return () => clearTimeout(timeout)
  }, [fetchArticles])

  const featured = useMemo(
    () => articles.filter((a) => a.isFeatured),
    [articles]
  )

  const regular = useMemo(
    () => articles.filter((a) => !a.isFeatured),
    [articles]
  )

  // Article detail view
  if (selectedArticle) {
    return (
      <div className="h-full">
        <ArticleDetail article={selectedArticle} onBack={() => setSelectedArticle(null)} />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-3 border-b border-gray-100 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('articles.search')}
            className="
              w-full pl-9 pr-3 py-2 text-sm
              border border-gray-200 rounded-xl
              text-gray-800 placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent
              transition-all duration-200
            "
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="px-3 py-2 border-b border-gray-100 overflow-x-auto shrink-0">
        <div className="flex gap-1.5 min-w-max">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`
              text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap
              transition-colors duration-200
              ${
                !selectedCategory
                  ? 'bg-violet-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {t('admin.tickets.all')}
          </button>
          {CATEGORIES.map((cat) => {
            const cfg = getCategoryConfig(cat)
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`
                  text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap
                  transition-colors duration-200 flex items-center gap-1
                  ${
                    selectedCategory === cat
                      ? 'bg-violet-500 text-white'
                      : `${cfg.bg} ${cfg.color} hover:opacity-80`
                  }
                `}
              >
                {t(`articles.categories.${cat}`, cat)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
            <p>Error loading articles</p>
            <button onClick={fetchArticles} className="text-violet-500 text-xs mt-1 hover:underline">
              Retry
            </button>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
            <HelpCircle className="w-6 h-6 mb-2 text-gray-300" />
            <p>{t('articles.noResults')}</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured.length > 0 && !selectedCategory && !search && (
              <div className="mb-4">
                <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                  {t('articles.featured')}
                </h4>
                <div className="space-y-2">
                  {featured.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      lang={lang}
                      isFeatured
                      onClick={() => setSelectedArticle(article)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular */}
            {regular.length > 0 && (
              <div>
                {featured.length > 0 && !selectedCategory && !search && (
                  <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                    {t('articles.allArticles')}
                  </h4>
                )}
                <div className="space-y-2">
                  {regular.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      lang={lang}
                      onClick={() => setSelectedArticle(article)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ArticleCard({
  article,
  lang,
  isFeatured,
  onClick,
}: {
  article: Article
  lang: string
  isFeatured?: boolean
  onClick: () => void
}) {
  const { t } = useTranslation('support')

  const title = article.title[lang] || article.title.es || ''
  const excerpt = article.excerpt[lang] || article.excerpt.es || ''
  const categoryLabel = t(`articles.categories.${article.category}`, article.category)
  const cfg = getCategoryConfig(article.category)

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-xl p-3 transition-all duration-200 group border
        ${isFeatured
          ? 'bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200 hover:border-violet-300 hover:shadow-sm'
          : 'bg-white border-gray-150 hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`shrink-0 w-9 h-9 ${cfg.bg} rounded-lg flex items-center justify-center mt-0.5`}>
          {isFeatured ? (
            <Star className={`w-4 h-4 ${cfg.color} fill-current`} />
          ) : (
            <span className={cfg.color}>{cfg.icon}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h5 className="text-sm font-semibold text-gray-800 truncate group-hover:text-violet-600 transition-colors flex-1">
              {title}
            </h5>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-violet-500 shrink-0 transition-colors" />
          </div>
          {excerpt && (
            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">{excerpt}</p>
          )}
          <span className={`inline-block text-[10px] font-medium ${cfg.color} ${cfg.bg} px-1.5 py-0.5 rounded mt-1.5`}>
            {categoryLabel}
          </span>
        </div>
      </div>
    </button>
  )
}
