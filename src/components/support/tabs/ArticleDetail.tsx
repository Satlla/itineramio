'use client'

import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface ArticleData {
  id: string
  slug: string
  title: Record<string, string>
  excerpt: Record<string, string>
  content: Record<string, string>
  category: string
  icon: string | null
  viewCount: number
  helpfulYes: number
  helpfulNo: number
}

interface ArticleDetailProps {
  article: ArticleData
  onBack: () => void
}

export function ArticleDetail({ article, onBack }: ArticleDetailProps) {
  const { t, i18n } = useTranslation('support')
  const [voted, setVoted] = useState<'yes' | 'no' | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const lang = i18n.language || 'es'
  const title = article.title[lang] || article.title.es || ''
  const content = article.content[lang] || article.content.es || ''
  const categoryLabel = t(`articles.categories.${article.category}`, article.category)

  const handleVote = useCallback(
    async (helpful: boolean) => {
      if (voted || submitting) return
      setSubmitting(true)

      try {
        await fetch(`/api/support/articles/${article.id}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ helpful }),
        })
        setVoted(helpful ? 'yes' : 'no')
      } catch {
        // Silently fail
      } finally {
        setSubmitting(false)
      }
    },
    [article.id, voted, submitting]
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <button
          onClick={onBack}
          className="text-violet-600 hover:text-violet-700 transition-colors p-0.5"
          aria-label={t('articles.backToList')}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-xs text-violet-600 font-medium">{t('articles.backToList')}</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Category badge */}
        <span className="inline-block text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full mb-2">
          {categoryLabel}
        </span>

        <h3 className="text-base font-bold text-gray-800 mb-4">{title}</h3>

        {/* Article content (Markdown) */}
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed
          prose-headings:text-gray-800 prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2
          prose-h1:text-base prose-h2:text-sm prose-h3:text-sm
          prose-a:text-violet-600 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-gray-800 prose-strong:font-semibold
          prose-ul:list-disc prose-ul:pl-4 prose-ol:list-decimal prose-ol:pl-4
          prose-li:text-gray-700 prose-li:my-0.5
          prose-p:mb-3 prose-p:leading-relaxed
          prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:text-xs prose-code:text-violet-700
          prose-blockquote:border-l-2 prose-blockquote:border-violet-300 prose-blockquote:pl-3 prose-blockquote:text-gray-500 prose-blockquote:italic
        ">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

        {/* Vote section */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          {voted ? (
            <div className="text-center">
              <p className="text-sm text-green-600 font-medium">{t('articles.thankYou')}</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">{t('articles.helpful')}</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => handleVote(true)}
                  disabled={submitting}
                  className="
                    flex items-center gap-1.5
                    bg-green-50 hover:bg-green-100
                    text-green-700 text-sm font-medium
                    px-4 py-2 rounded-lg
                    transition-colors duration-200
                    disabled:opacity-50
                  "
                >
                  <ThumbsUp className="w-4 h-4" />
                  {t('articles.yes')}
                </button>
                <button
                  onClick={() => handleVote(false)}
                  disabled={submitting}
                  className="
                    flex items-center gap-1.5
                    bg-red-50 hover:bg-red-100
                    text-red-700 text-sm font-medium
                    px-4 py-2 rounded-lg
                    transition-colors duration-200
                    disabled:opacity-50
                  "
                >
                  <ThumbsDown className="w-4 h-4" />
                  {t('articles.no')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
