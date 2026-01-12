'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  Bookmark,
  Calendar,
  User,
  Tag,
  ChevronRight
} from 'lucide-react'

interface ContentBlock {
  id: string
  type: 'paragraph' | 'heading2' | 'heading3' | 'list' | 'quote' | 'code' | 'image' | 'video'
  content: string
  metadata?: {
    url?: string
    alt?: string
    caption?: string
    language?: string
  }
}

interface Article {
  id: string
  slug: string
  title: string
  subtitle?: string
  coverImage?: string
  coverImageAlt?: string
  excerpt: string
  content: ContentBlock[]
  category: string
  tags: string[]
  difficulty: string
  views: number
  avgReadTime: number
  helpfulVotes: number
  notHelpfulVotes: number
  hasTemplate: boolean
  publishedAt: string
  authorId: string
}

export default function ArticlePage() {
  const params = useParams()
  const slug = params.slug as string

  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [helpful, setHelpful] = useState<boolean | null>(null)
  const [showShareMenu, setShowShareMenu] = useState(false)

  // Mock data por ahora (hasta que la API esté lista)
  useEffect(() => {
    // Simular carga de artículo
    setTimeout(() => {
      setArticle({
        id: '1',
        slug: 'check-in-remoto-sin-llaves',
        title: 'Check-in Remoto Sin Llaves: Guía Completa 2025',
        subtitle: '67% de las incidencias ocurren en el check-in. Aquí te explicamos cómo evitarlas con un sistema remoto eficiente.',
        coverImage: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200',
        coverImageAlt: 'Smart lock en puerta moderna',
        excerpt: '67% de las incidencias ocurren en el check-in. Aquí te explicamos cómo evitarlas con un sistema remoto eficiente.',
        content: [
          {
            id: '1',
            type: 'paragraph',
            content: 'El check-in remoto es una de las innovaciones más importantes en la gestión de apartamentos turísticos. Permite a los huéspedes acceder a la propiedad sin necesidad de encontrarse físicamente con el anfitrión.'
          },
          {
            id: '2',
            type: 'heading2',
            content: '¿Por qué implementar check-in remoto?'
          },
          {
            id: '3',
            type: 'list',
            content: '• Reduce incidencias en un 67%\n• Ahorra tiempo de gestión\n• Mejora la experiencia del huésped\n• Permite gestionar múltiples propiedades\n• Aumenta las valoraciones positivas'
          },
          {
            id: '4',
            type: 'heading2',
            content: 'Tipos de cerraduras inteligentes'
          },
          {
            id: '5',
            type: 'paragraph',
            content: 'Existen diferentes tipos de cerraduras inteligentes en el mercado, cada una con sus ventajas y desventajas.'
          },
          {
            id: '6',
            type: 'quote',
            content: 'Implementar un check-in remoto me ha ahorrado más de 20 horas al mes y mis valoraciones han subido de 4.2 a 4.8 estrellas.'
          }
        ],
        category: 'CHECKIN_CHECKOUT',
        tags: ['check-in', 'automatización', 'cerraduras inteligentes', 'experiencia huésped'],
        difficulty: 'BEGINNER',
        views: 1247,
        avgReadTime: 8,
        helpfulVotes: 234,
        notHelpfulVotes: 12,
        hasTemplate: true,
        publishedAt: '2025-10-28T10:00:00Z',
        authorId: 'admin'
      })
      setLoading(false)
    }, 500)
  }, [slug])

  const handleHelpfulVote = async (isHelpful: boolean) => {
    if (!article) return

    setHelpful(isHelpful)

    try {
      const response = await fetch(`/api/knowledge/articles/${article.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHelpful })
      })

      const data = await response.json()

      if (data.success) {
        // Actualizar contadores en el estado local
        setArticle(prev => prev ? {
          ...prev,
          helpfulVotes: data.data.helpfulVotes,
          notHelpfulVotes: data.data.notHelpfulVotes
        } : null)
      }
    } catch (error) {
      console.error('Error al votar:', error)
    }
  }

  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      CHECKIN_CHECKOUT: 'Check-in/Check-out',
      WIFI_TECH: 'WiFi & Tecnología',
      LEGAL_VUT: 'Legal & VUT',
      GUEST_COMMUNICATION: 'Comunicación',
      REVIEWS_RATINGS: 'Reviews',
      EMERGENCIES: 'Emergencias',
      AMENITIES: 'Amenidades',
      MAINTENANCE: 'Mantenimiento',
      MARKETING: 'Marketing',
      OPERATIONS: 'Operaciones'
    }
    return categories[category] || category
  }

  const getDifficultyBadge = (difficulty: string) => {
    const badges: Record<string, { color: string, text: string }> = {
      BEGINNER: { color: 'bg-green-100 text-green-700', text: '🟢 Principiante' },
      INTERMEDIATE: { color: 'bg-yellow-100 text-yellow-700', text: '🟡 Intermedio' },
      ADVANCED: { color: 'bg-red-100 text-red-700', text: '🔴 Avanzado' }
    }
    const badge = badges[difficulty] || badges.BEGINNER
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p key={block.id} className="text-lg text-gray-700 leading-relaxed mb-6">
            {block.content}
          </p>
        )

      case 'heading2':
        return (
          <h2 key={block.id} className="text-3xl font-bold text-gray-900 mt-12 mb-6">
            {block.content}
          </h2>
        )

      case 'heading3':
        return (
          <h3 key={block.id} className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            {block.content}
          </h3>
        )

      case 'list':
        return (
          <ul key={block.id} className="space-y-2 mb-6 text-gray-700">
            {block.content.split('\n').map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-3 text-violet-600 font-bold">•</span>
                <span className="flex-1">{item.replace(/^[•\-]\s*/, '')}</span>
              </li>
            ))}
          </ul>
        )

      case 'quote':
        return (
          <blockquote key={block.id} className="border-l-4 border-violet-500 bg-violet-50 p-6 rounded-r-lg mb-6 italic text-gray-700">
            {block.content}
          </blockquote>
        )

      case 'code':
        return (
          <pre key={block.id} className="bg-gray-900 text-green-400 p-6 rounded-lg mb-6 overflow-x-auto">
            <code className="text-sm font-mono">{block.content}</code>
          </pre>
        )

      case 'image':
        return (
          <figure key={block.id} className="mb-8">
            <img
              src={block.metadata?.url}
              alt={block.metadata?.alt}
              className="w-full rounded-xl shadow-lg"
            />
            {block.metadata?.caption && (
              <figcaption className="text-center text-sm text-gray-600 mt-3">
                {block.metadata.caption}
              </figcaption>
            )}
          </figure>
        )

      case 'video':
        return (
          <div key={block.id} className="aspect-video mb-8 rounded-xl overflow-hidden shadow-lg">
            <iframe
              src={block.metadata?.url}
              className="w-full h-full"
              allowFullScreen
            />
            {block.metadata?.caption && (
              <p className="text-center text-sm text-gray-600 mt-3">
                {block.metadata.caption}
              </p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Artículo no encontrado</h1>
          <Link href="/hub" className="text-violet-600 hover:text-violet-700">
            Volver al Hub de Recursos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/hub" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Hub de Recursos
            </Link>
            <Link href="/" className="text-2xl font-bold text-violet-600">
              Itineramio
            </Link>
          </div>
        </div>
      </header>

      {/* Portada */}
      {article.coverImage && (
        <div className="w-full h-[400px] overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.coverImageAlt}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Metadatos superiores */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            href={`/hub?category=${article.category.toLowerCase()}`}
            className="px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium hover:bg-violet-200"
          >
            {getCategoryName(article.category)}
          </Link>
          {getDifficultyBadge(article.difficulty)}
        </div>

        {/* Título y subtítulo */}
        <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {article.title}
        </h1>

        {article.subtitle && (
          <p className="text-2xl text-gray-600 mb-8 leading-relaxed">
            {article.subtitle}
          </p>
        )}

        {/* Metadatos de artículo */}
        <div className="flex items-center space-x-6 text-sm text-gray-600 pb-8 border-b border-gray-200 mb-12">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            Equipo Itineramio
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date(article.publishedAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            {article.avgReadTime} min lectura
          </div>
          <div className="flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            {article.views.toLocaleString()} vistas
          </div>
        </div>

        {/* Contenido del artículo */}
        <article className="prose prose-lg max-w-none mb-12">
          {article.content.map((block) => renderBlock(block))}
        </article>

        {/* CTA para plantilla (si existe) */}
        {article.hasTemplate && (
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-8 border-2 border-violet-200 mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  📥 Plantilla descargable
                </h3>
                <p className="text-gray-600">
                  Descarga la plantilla editable de este artículo para aplicarla directamente a tu negocio
                </p>
              </div>
              <button className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-xl font-medium transition-colors flex items-center whitespace-nowrap ml-6">
                <Download className="w-5 h-5 mr-2" />
                Descargar gratis
              </button>
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-12">
          {article.tags.map((tag) => (
            <Link
              key={tag}
              href={`/hub?tag=${encodeURIComponent(tag)}`}
              className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Link>
          ))}
        </div>

        {/* Valoración del artículo */}
        <div className="bg-gray-50 rounded-xl p-8 mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            ¿Te ha sido útil este artículo?
          </h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleHelpfulVote(true)}
              disabled={helpful !== null}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                helpful === true
                  ? 'bg-green-600 text-white'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-500'
              } disabled:cursor-not-allowed`}
            >
              <ThumbsUp className="w-5 h-5 mr-2" />
              Sí, útil ({article.helpfulVotes})
            </button>
            <button
              onClick={() => handleHelpfulVote(false)}
              disabled={helpful !== null}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                helpful === false
                  ? 'bg-red-600 text-white'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-red-500'
              } disabled:cursor-not-allowed`}
            >
              <ThumbsDown className="w-5 h-5 mr-2" />
              No mucho ({article.notHelpfulVotes})
            </button>
          </div>
          {helpful !== null && (
            <p className="text-green-600 mt-4">
              ✓ Gracias por tu feedback. Nos ayuda a mejorar el contenido.
            </p>
          )}
        </div>

        {/* Artículos relacionados */}
        <div className="border-t border-gray-200 pt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Artículos relacionados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mock de artículos relacionados */}
            {[1, 2].map((i) => (
              <Link
                key={i}
                href={`/hub`}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-violet-300 transition-all"
              >
                <span className="px-3 py-1 bg-violet-100 text-violet-700 text-xs font-medium rounded-full">
                  {getCategoryName(article.category)}
                </span>
                <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                  Artículo relacionado {i}
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Breve descripción del artículo relacionado...
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  5 min
                  <span className="mx-2">•</span>
                  <Eye className="w-4 h-4 mr-1" />
                  {Math.floor(Math.random() * 1000)} vistas
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer simplificado */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-2xl font-bold text-white mb-4">Itineramio</div>
          <p className="mb-6">Centro de Conocimiento para gestores de apartamentos turísticos</p>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <Link href="/hub" className="hover:text-white transition-colors">
              Hub de Recursos
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/register" className="hover:text-white transition-colors">
              Registrarse
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
