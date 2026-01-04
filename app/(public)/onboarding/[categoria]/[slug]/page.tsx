'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useParams, notFound } from 'next/navigation'
import {
  ChevronRight,
  Clock,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Info,
  CheckCircle2,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Rocket,
  Home,
  Layers,
  LayoutGrid,
  FileText,
  BarChart3,
  User,
  CreditCard,
  Copy,
  Check,
  Twitter,
  Facebook,
  Linkedin,
  X
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import {
  getArticleBySlug,
  getArticlesByCategory,
  getCategoryBySlug,
  getRelatedArticles,
  onboardingCategories,
  type ArticleSection,
  type OnboardingArticle
} from '@/data/onboarding-articles'

// Generate consistent pseudo-random likes/dislikes based on article ID
function generateArticleStats(articleId: string): { likes: number; dislikes: number } {
  // Simple hash function to generate consistent numbers
  let hash = 0
  for (let i = 0; i < articleId.length; i++) {
    const char = articleId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }

  // Generate likes between 127 and 412
  const likes = 127 + Math.abs(hash % 286)
  // Generate dislikes between 3 and 24 (much lower than likes)
  const dislikes = 3 + Math.abs((hash >> 8) % 22)

  return { likes, dislikes }
}

// WhatsApp icon component
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

// Share Modal Component
function ShareModal({
  isOpen,
  onClose,
  articleTitle,
  articleDescription
}: {
  isOpen: boolean
  onClose: () => void
  articleTitle: string
  articleDescription: string
}) {
  const [copied, setCopied] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href)
    }
  }, [])

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = currentUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${articleTitle}\n\n${currentUrl}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(articleTitle)}&url=${encodeURIComponent(currentUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Compartir artículo</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* URL Copy */}
          <div className="mb-6">
            <label className="text-sm text-gray-600 mb-2 block">Copiar enlace</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentUrl}
                readOnly
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-600 truncate"
              />
              <button
                onClick={handleCopyUrl}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-violet-600 text-white hover:bg-violet-700'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div>
            <label className="text-sm text-gray-600 mb-3 block">Compartir en redes</label>
            <div className="grid grid-cols-4 gap-3">
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors group"
              >
                <WhatsAppIcon className="w-6 h-6 text-green-600" />
                <span className="text-xs text-green-700">WhatsApp</span>
              </a>
              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors group"
              >
                <Twitter className="w-6 h-6 text-sky-500" />
                <span className="text-xs text-sky-700">Twitter</span>
              </a>
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
              >
                <Facebook className="w-6 h-6 text-blue-600" />
                <span className="text-xs text-blue-700">Facebook</span>
              </a>
              <a
                href={shareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
              >
                <Linkedin className="w-6 h-6 text-blue-700" />
                <span className="text-xs text-blue-800">LinkedIn</span>
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Article Feedback Component with like counts
function ArticleFeedback({ articleId }: { articleId: string }) {
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null)
  const [stats, setStats] = useState({ likes: 0, dislikes: 0 })
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    // Get base stats from article ID
    const baseStats = generateArticleStats(articleId)

    // Check if user already voted (localStorage)
    const storedVote = localStorage.getItem(`article-vote-${articleId}`)
    if (storedVote) {
      setUserVote(storedVote as 'like' | 'dislike')
      setHasVoted(true)
      // Add the user's vote to stats
      if (storedVote === 'like') {
        setStats({ likes: baseStats.likes + 1, dislikes: baseStats.dislikes })
      } else {
        setStats({ likes: baseStats.likes, dislikes: baseStats.dislikes + 1 })
      }
    } else {
      setStats(baseStats)
    }
  }, [articleId])

  const handleVote = (vote: 'like' | 'dislike') => {
    if (hasVoted) return

    setUserVote(vote)
    setHasVoted(true)
    localStorage.setItem(`article-vote-${articleId}`, vote)

    if (vote === 'like') {
      setStats(prev => ({ ...prev, likes: prev.likes + 1 }))
    } else {
      setStats(prev => ({ ...prev, dislikes: prev.dislikes + 1 }))
    }
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="bg-gray-50 rounded-2xl p-6">
        <p className="text-gray-900 font-semibold text-lg mb-2">¿Te ha resultado útil este artículo?</p>
        <p className="text-gray-500 text-sm mb-4">Tu feedback nos ayuda a mejorar nuestra documentación</p>

        <div className="flex gap-4">
          <button
            onClick={() => handleVote('like')}
            disabled={hasVoted}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all ${
              userVote === 'like'
                ? 'bg-green-100 border-green-400 text-green-700'
                : hasVoted
                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border-gray-200 hover:bg-green-50 hover:border-green-300 text-gray-700 hover:text-green-700'
            }`}
          >
            <ThumbsUp className={`w-5 h-5 ${userVote === 'like' ? 'fill-current' : ''}`} />
            <span className="font-medium">Sí</span>
            <span className={`px-2 py-0.5 rounded-full text-sm ${
              userVote === 'like' ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {stats.likes}
            </span>
          </button>

          <button
            onClick={() => handleVote('dislike')}
            disabled={hasVoted}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all ${
              userVote === 'dislike'
                ? 'bg-red-100 border-red-400 text-red-700'
                : hasVoted
                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border-gray-200 hover:bg-red-50 hover:border-red-300 text-gray-700 hover:text-red-700'
            }`}
          >
            <ThumbsDown className={`w-5 h-5 ${userVote === 'dislike' ? 'fill-current' : ''}`} />
            <span className="font-medium">No</span>
            <span className={`px-2 py-0.5 rounded-full text-sm ${
              userVote === 'dislike' ? 'bg-red-200 text-red-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {stats.dislikes}
            </span>
          </button>
        </div>

        {hasVoted && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm text-gray-600"
          >
            Gracias por tu feedback
          </motion.p>
        )}
      </div>
    </div>
  )
}

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
const colorMap: Record<string, { bg: string; text: string; lightBg: string; border: string; gradient: string }> = {
  violet: { bg: 'bg-violet-600', text: 'text-violet-600', lightBg: 'bg-violet-50', border: 'border-violet-200', gradient: 'from-violet-500 to-purple-600' },
  blue: { bg: 'bg-blue-600', text: 'text-blue-600', lightBg: 'bg-blue-50', border: 'border-blue-200', gradient: 'from-blue-500 to-blue-600' },
  purple: { bg: 'bg-purple-600', text: 'text-purple-600', lightBg: 'bg-purple-50', border: 'border-purple-200', gradient: 'from-purple-500 to-purple-600' },
  green: { bg: 'bg-green-600', text: 'text-green-600', lightBg: 'bg-green-50', border: 'border-green-200', gradient: 'from-green-500 to-green-600' },
  orange: { bg: 'bg-orange-600', text: 'text-orange-600', lightBg: 'bg-orange-50', border: 'border-orange-200', gradient: 'from-orange-500 to-orange-600' },
  pink: { bg: 'bg-pink-600', text: 'text-pink-600', lightBg: 'bg-pink-50', border: 'border-pink-200', gradient: 'from-pink-500 to-pink-600' },
  cyan: { bg: 'bg-cyan-600', text: 'text-cyan-600', lightBg: 'bg-cyan-50', border: 'border-cyan-200', gradient: 'from-cyan-500 to-cyan-600' },
  slate: { bg: 'bg-slate-600', text: 'text-slate-600', lightBg: 'bg-slate-50', border: 'border-slate-200', gradient: 'from-slate-500 to-slate-600' },
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', lightBg: 'bg-emerald-50', border: 'border-emerald-200', gradient: 'from-emerald-500 to-emerald-600' },
}

function ArticleContent({ section, index }: { section: ArticleSection; index: number }) {
  switch (section.type) {
    case 'heading':
      const HeadingTag = `h${section.level || 2}` as keyof JSX.IntrinsicElements
      const headingClasses = {
        2: 'text-xl font-bold text-gray-900 mt-8 mb-4',
        3: 'text-lg font-semibold text-gray-900 mt-6 mb-3',
        4: 'text-base font-semibold text-gray-800 mt-4 mb-2'
      }
      return (
        <HeadingTag className={headingClasses[section.level as 2 | 3 | 4 || 2]}>
          {section.content}
        </HeadingTag>
      )

    case 'paragraph':
      return (
        <p className="text-gray-700 leading-relaxed mb-4">
          {section.content}
        </p>
      )

    case 'steps':
      return (
        <div className="my-6 space-y-3">
          {section.items?.map((step, stepIndex) => (
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: stepIndex * 0.1 }}
              className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-bold">
                {stepIndex + 1}
              </div>
              <p className="text-gray-700 pt-1">{step}</p>
            </motion.div>
          ))}
        </div>
      )

    case 'list':
      return (
        <ul className="my-4 space-y-2">
          {section.items?.map((item, itemIndex) => (
            <li key={itemIndex} className="flex items-start gap-3 text-gray-700">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )

    case 'tip':
      return (
        <div className="my-6 p-4 rounded-xl bg-green-50 border border-green-200">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-800 mb-1">Consejo</p>
              <p className="text-green-700">{section.content}</p>
            </div>
          </div>
        </div>
      )

    case 'warning':
      return (
        <div className="my-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 mb-1">Importante</p>
              <p className="text-amber-700">{section.content}</p>
            </div>
          </div>
        </div>
      )

    case 'note':
      return (
        <div className="my-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800 mb-1">Nota</p>
              <p className="text-blue-700">{section.content}</p>
            </div>
          </div>
        </div>
      )

    case 'image':
      return (
        <figure className="my-6">
          <img
            src={section.src}
            alt={section.alt || ''}
            className="rounded-xl border border-gray-200 w-full"
          />
          {section.caption && (
            <figcaption className="text-sm text-gray-500 text-center mt-2">
              {section.caption}
            </figcaption>
          )}
        </figure>
      )

    case 'video':
      return (
        <figure className="my-6">
          <video
            src={section.src}
            controls
            className="rounded-xl border border-gray-200 w-full"
          />
          {section.caption && (
            <figcaption className="text-sm text-gray-500 text-center mt-2">
              {section.caption}
            </figcaption>
          )}
        </figure>
      )

    default:
      return null
  }
}

function RelatedArticleCard({ article }: { article: OnboardingArticle }) {
  const category = getCategoryBySlug(article.categorySlug)
  const colors = colorMap[category?.color || 'violet'] || colorMap.violet

  return (
    <Link href={`/onboarding/${article.categorySlug}/${article.slug}`}>
      <div className="p-4 rounded-xl border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all group">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${colors.lightBg} flex items-center justify-center`}>
            <BookOpen className={`w-4 h-4 ${colors.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 group-hover:text-violet-600 transition-colors line-clamp-2">
              {article.title}
            </h4>
            <p className="text-sm text-gray-500 mt-1">{article.category}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
        </div>
      </div>
    </Link>
  )
}

function TableOfContents({ sections }: { sections: ArticleSection[] }) {
  const headings = sections.filter(s => s.type === 'heading' && (s.level === 2 || !s.level))

  if (headings.length < 2) return null

  return (
    <nav className="p-4 rounded-xl bg-gray-50 border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-3">En este artículo</h3>
      <ul className="space-y-2">
        {headings.map((heading, index) => (
          <li key={index}>
            <a
              href={`#section-${index}`}
              className="text-sm text-gray-600 hover:text-violet-600 transition-colors"
            >
              {heading.content}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default function ArticlePage() {
  const params = useParams()
  const categorySlug = params.categoria as string
  const articleSlug = params.slug as string
  const [showShareModal, setShowShareModal] = useState(false)

  const article = useMemo(() => getArticleBySlug(categorySlug, articleSlug), [categorySlug, articleSlug])
  const category = useMemo(() => getCategoryBySlug(categorySlug), [categorySlug])
  const relatedArticles = useMemo(() => article ? getRelatedArticles(article.id) : [], [article])
  const categoryArticles = useMemo(() => getArticlesByCategory(categorySlug), [categorySlug])

  if (!article || !category) {
    notFound()
  }

  const colors = colorMap[category.color] || colorMap.violet
  const Icon = iconMap[category.icon] || BookOpen

  // Find previous and next articles in the same category
  const currentIndex = categoryArticles.findIndex(a => a.id === article.id)
  const prevArticle = currentIndex > 0 ? categoryArticles[currentIndex - 1] : null
  const nextArticle = currentIndex < categoryArticles.length - 1 ? categoryArticles[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm mb-6"
          >
            <Link href="/onboarding" className="text-gray-500 hover:text-violet-600 transition-colors">
              Onboarding
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href={`/onboarding/${categorySlug}`} className={`${colors.text} hover:opacity-80 transition-opacity`}>
              {category.name}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700 font-medium truncate">{article.title}</span>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl ${colors.lightBg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${colors.text}`} />
              </div>
              <span className={`px-3 py-1 rounded-full ${colors.lightBg} ${colors.text} text-sm font-medium`}>
                {category.name}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {article.description}
            </p>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.readingTime} min de lectura
              </span>
              <span>
                Actualizado: {new Date(article.lastUpdated).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1 text-violet-600 hover:text-violet-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Compartir
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <motion.article
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-3 prose prose-lg max-w-none"
            >
              {article.content.map((section, index) => (
                <ArticleContent key={index} section={section} index={index} />
              ))}

              {/* Feedback with likes counter */}
              <ArticleFeedback articleId={article.id} />

              {/* Article Navigation */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  {prevArticle ? (
                    <Link
                      href={`/onboarding/${prevArticle.categorySlug}/${prevArticle.slug}`}
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-all group flex-1"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-violet-600 group-hover:-translate-x-1 transition-all" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Anterior</p>
                        <p className="font-medium text-gray-900 group-hover:text-violet-600 truncate">{prevArticle.title}</p>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex-1" />
                  )}

                  {nextArticle && (
                    <Link
                      href={`/onboarding/${nextArticle.categorySlug}/${nextArticle.slug}`}
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-all group flex-1 justify-end text-right"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Siguiente</p>
                        <p className="font-medium text-gray-900 group-hover:text-violet-600 truncate">{nextArticle.title}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.article>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Table of Contents */}
                <TableOfContents sections={article.content} />

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Artículos relacionados</h3>
                    <div className="space-y-3">
                      {relatedArticles.map((related) => (
                        <RelatedArticleCard key={related.id} article={related} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Back to Category */}
                <Link
                  href={`/onboarding/${categorySlug}`}
                  className={`flex items-center gap-2 p-3 rounded-xl ${colors.lightBg} ${colors.text} text-sm font-medium hover:opacity-80 transition-opacity`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver a {category.name}
                </Link>

                {/* Help */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">
                    ¿Necesitas más ayuda?
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Contacta con nuestro equipo de soporte
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
            </aside>
          </div>
        </div>
      </section>

      <Footer />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        articleTitle={article.title}
        articleDescription={article.description}
      />
    </div>
  )
}
