'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Sparkles, Zap, Wrench, ArrowRight, Bell, ChevronDown, ChevronUp } from 'lucide-react'

interface ProductUpdate {
  id: string
  title: Record<string, string>
  description: Record<string, string>
  tag: 'NEW' | 'IMPROVEMENT' | 'FIX'
  imageUrl: string | null
  ctaText: Record<string, string> | null
  ctaUrl: string | null
  publishedAt: string
  isRead?: boolean
}

const TAG_CONFIG: Record<string, { icon: React.ReactNode; className: string; key: string }> = {
  NEW: {
    icon: <Sparkles className="w-3 h-3" />,
    className: 'bg-emerald-100 text-emerald-700',
    key: 'new',
  },
  IMPROVEMENT: {
    icon: <Zap className="w-3 h-3" />,
    className: 'bg-blue-100 text-blue-700',
    key: 'improvement',
  },
  FIX: {
    icon: <Wrench className="w-3 h-3" />,
    className: 'bg-amber-100 text-amber-700',
    key: 'fix',
  },
}

export function UpdatesTab() {
  const { t, i18n } = useTranslation('support')
  const lang = i18n.language || 'es'

  const [updates, setUpdates] = useState<ProductUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchUpdates = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/support/product-updates')
      if (res.ok) {
        const data = await res.json()
        setUpdates(data.updates ?? [])
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUpdates()
  }, [fetchUpdates])

  const markAsRead = useCallback(async (updateId: string) => {
    try {
      await fetch('/api/support/product-updates/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productUpdateId: updateId }),
      })
      setUpdates((prev) =>
        prev.map((u) => (u.id === updateId ? { ...u, isRead: true } : u))
      )
    } catch {
      // Silently fail
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
        <p>Error loading updates</p>
        <button onClick={fetchUpdates} className="text-violet-500 text-xs mt-1 hover:underline">
          Retry
        </button>
      </div>
    )
  }

  if (updates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
        <Bell className="w-6 h-6 mb-2 text-gray-300" />
        <p>{t('updates.noUpdates')}</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      {updates.map((update) => (
        <UpdateCard
          key={update.id}
          update={update}
          lang={lang}
          onVisible={() => {
            if (!update.isRead) markAsRead(update.id)
          }}
        />
      ))}
    </div>
  )
}

function UpdateCard({
  update,
  lang,
  onVisible,
}: {
  update: ProductUpdate
  lang: string
  onVisible: () => void
}) {
  const { t } = useTranslation('support')
  const cardRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)

  // Mark as read when scrolled into view
  useEffect(() => {
    if (update.isRead) return

    const el = cardRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible()
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [update.isRead, onVisible])

  const tagConfig = TAG_CONFIG[update.tag] || TAG_CONFIG.NEW
  const title = update.title[lang] || update.title.es || ''
  const rawDescription = update.description[lang] || update.description.es || ''
  const ctaText = update.ctaText ? update.ctaText[lang] || update.ctaText.es || '' : null
  const date = new Date(update.publishedAt).toLocaleDateString(lang === 'es' ? 'es-ES' : lang, {
    day: 'numeric',
    month: 'short',
  })

  // Enrich text: bold key phrases automatically
  const enrichedDescription = enrichText(rawDescription)
  const isLong = rawDescription.length > 120
  const shortDescription = isLong ? enrichText(rawDescription.substring(0, 120) + '...') : enrichedDescription

  return (
    <div
      ref={cardRef}
      className="bg-white border border-gray-150 hover:border-violet-200 rounded-xl p-3.5 transition-all duration-200 relative hover:shadow-sm"
    >
      {/* Header row: tag + date + unread */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${tagConfig.className}`}
          >
            {tagConfig.icon}
            {t(`updates.${tagConfig.key}`)}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">{date}</span>
        </div>
        {!update.isRead && (
          <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
        )}
      </div>

      {/* Title */}
      <h4 className="text-[13px] font-bold text-gray-900 mb-1.5 leading-snug">{title}</h4>

      {/* Description — enriched with bolds */}
      <div
        className="text-xs text-gray-600 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: expanded || !isLong ? enrichedDescription : shortDescription }}
      />

      {/* Expand/collapse for long descriptions */}
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[11px] font-medium text-violet-600 hover:text-violet-700 mt-1.5 transition-colors"
        >
          {expanded ? (
            <>Menos <ChevronUp className="w-3 h-3" /></>
          ) : (
            <>Leer más <ChevronDown className="w-3 h-3" /></>
          )}
        </button>
      )}

      {/* CTA */}
      {ctaText && update.ctaUrl && (
        <a
          href={update.ctaUrl}
          className="
            inline-flex items-center gap-1.5 mt-2.5
            text-[11px] font-semibold
            bg-violet-50 hover:bg-violet-100
            text-violet-700
            px-3 py-1.5 rounded-lg
            transition-colors duration-200
          "
        >
          {ctaText}
          <ArrowRight className="w-3 h-3" />
        </a>
      )}
    </div>
  )
}

/**
 * Auto-enrich plain text with bold spans for key patterns:
 * - Numbers with units (15 minutos, 80%, 24/7, 1-5)
 * - Quoted text
 * - Key product terms
 */
function enrichText(text: string): string {
  let result = text

  // Bold numbers with units or percentages
  result = result.replace(/(\d+[\d.,]*\s*(?:minutos?|horas?|días?|%|idiomas?|zonas?|estrellas?))/gi, '<strong>$1</strong>')

  // Bold "24/7"
  result = result.replace(/\b(24\/7)\b/g, '<strong>$1</strong>')

  // Bold key product terms
  const keyTerms = [
    'IA', 'QR', 'WiFi', 'Check-in', 'Checkout', 'check-in', 'checkout',
    'WhatsApp', 'Airbnb', 'Booking', 'Superhost',
    'SofIA', 'PMS',
    'español', 'inglés', 'francés',
    'Spanish', 'English', 'French',
  ]

  for (const term of keyTerms) {
    // Only bold if not already inside a tag
    const regex = new RegExp(`(?<!<[^>]*)\\b(${term})\\b(?![^<]*>)`, 'g')
    result = result.replace(regex, '<strong class="text-gray-800">$1</strong>')
  }

  return result
}
