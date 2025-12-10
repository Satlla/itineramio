'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Eye,
  Trash2,
  FileText,
  Tag,
  CheckCircle,
  Rocket,
  AlertCircle,
  ExternalLink,
  X,
  Sparkles
} from 'lucide-react'
import { RichTextEditor } from '@/components/admin/RichTextEditor'

const categoryOptions = [
  { value: 'GUIAS', label: 'Guías' },
  { value: 'MEJORES_PRACTICAS', label: 'Mejores Prácticas' },
  { value: 'NORMATIVA', label: 'Normativa' },
  { value: 'AUTOMATIZACION', label: 'Automatización' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'OPERACIONES', label: 'Operaciones' },
  { value: 'CASOS_ESTUDIO', label: 'Casos de Estudio' },
  { value: 'NOTICIAS', label: 'Noticias' }
]

const statusOptions = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'REVIEW', label: 'En Revisión' },
  { value: 'SCHEDULED', label: 'Programado' },
  { value: 'PUBLISHED', label: 'Publicado' },
  { value: 'ARCHIVED', label: 'Archivado' }
]

const authorOptions = [
  { value: 'Alejandro Satlla', label: 'Alejandro Satlla' },
  { value: 'Equipo Itineramio', label: 'Equipo Itineramio' }
]

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [postId, setPostId] = useState<string | null>(null)

  // Modal states
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [publishedUrl, setPublishedUrl] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'GUIAS',
    tags: '',
    featured: false,
    status: 'DRAFT',
    authorName: 'Equipo Itineramio',
    coverImage: '',
    coverImageAlt: '',
    metaTitle: '',
    metaDescription: '',
    keywords: ''
  })

  useEffect(() => {
    params.then(p => {
      setPostId(p.id)
    })
  }, [params])

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId])

  const fetchPost = async () => {
    if (!postId) return

    try {
      const response = await fetch(`/api/admin/blog/${postId}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const { post } = await response.json()
        setFormData({
          title: post.title,
          subtitle: post.subtitle || '',
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          tags: post.tags.join(', '),
          featured: post.featured,
          status: post.status,
          authorName: post.authorName,
          coverImage: post.coverImage || '',
          coverImageAlt: post.coverImageAlt || '',
          metaTitle: post.metaTitle || '',
          metaDescription: post.metaDescription || '',
          keywords: post.keywords.join(', ')
        })
      } else {
        alert('Error al cargar el artículo')
        router.push('/admin/blog')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      alert('Error al cargar el artículo')
      router.push('/admin/blog')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleContentChange = (html: string) => {
    setFormData(prev => ({ ...prev, content: html }))
  }

  const handleSaveWithStatus = async (newStatus: string) => {
    if (!postId) return
    setSaving(true)

    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      const keywordsArray = formData.keywords.split(',').map(k => k.trim()).filter(Boolean)

      const response = await fetch(`/api/admin/blog/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          status: newStatus,
          tags: tagsArray,
          keywords: keywordsArray
        })
      })

      if (response.ok) {
        // Update local state
        setFormData(prev => ({ ...prev, status: newStatus }))

        if (newStatus === 'PUBLISHED') {
          // Show success modal with published URL
          const productionUrl = `https://itineramio.com/blog/${formData.slug}`
          setPublishedUrl(productionUrl)
          setSuccessMessage('¡Artículo publicado exitosamente!')
          setShowSuccessModal(true)
        } else {
          const statusMessages: Record<string, string> = {
            'DRAFT': 'Artículo guardado como borrador',
            'REVIEW': 'Artículo marcado como listo para revisar',
            'SCHEDULED': 'Artículo programado para publicación'
          }
          setSuccessMessage(statusMessages[newStatus] || 'Artículo actualizado exitosamente!')
          setShowSuccessModal(true)

          // Auto-close after 2 seconds for non-published statuses
          setTimeout(() => {
            setShowSuccessModal(false)
          }, 2000)
        }
      } else {
        const error = await response.json()
        setErrorMessage(error.error || 'Error al actualizar el artículo')
        setShowErrorModal(true)
      }
    } catch (error) {
      console.error('Error updating post:', error)
      setErrorMessage('Error al actualizar el artículo')
      setShowErrorModal(true)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSaveWithStatus(formData.status)
  }

  const handlePublish = async () => {
    if (!confirm('¿Estás seguro de publicar este artículo? Se hará visible para todos los usuarios.')) {
      return
    }
    await handleSaveWithStatus('PUBLISHED')
  }

  const handleDelete = async () => {
    if (!postId) return
    if (!confirm('¿Estás seguro de eliminar este artículo? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/blog/${postId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        alert('Artículo eliminado')
        router.push('/admin/blog')
      } else {
        alert('Error al eliminar el artículo')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error al eliminar el artículo')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/blog"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al blog
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Artículo</h1>
            <p className="text-gray-600 mt-1">Modifica el contenido del artículo</p>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Content Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Contenido Principal
          </h2>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtítulo
              </label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL (Slug) *
              </label>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">itineramio.com/blog/</span>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-yellow-600 mt-1">
                ⚠️ Cambiar el slug afectará el SEO y enlaces existentes
              </p>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Extracto *
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Content - Rich Text Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenido del Artículo *
              </label>
              <RichTextEditor
                content={formData.content}
                onChange={handleContentChange}
                placeholder="Comienza a escribir tu artículo aquí... Usa el toolbar para dar formato."
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Usa los botones del toolbar para dar formato. Puedes insertar CTAs de newsletter y cajas destacadas con un solo click.
              </p>
            </div>
          </div>
        </div>

        {/* Metadata Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Tag className="w-5 h-5 mr-2" />
            Categorización y Metadatos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                {categoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (separados por comas)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Author */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Autor
              </label>
              <select
                name="authorName"
                value={formData.authorName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                {authorOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                />
                <span className="text-sm font-medium text-gray-700">Artículo destacado</span>
              </label>
            </div>
          </div>
        </div>

        {/* SEO Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Título
              </label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                maxLength={60}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.metaTitle.length}/60 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Descripción
              </label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                maxLength={160}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.metaDescription.length}/160 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords (separadas por comas)
              </label>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Estado actual del artículo:</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formData.status === 'DRAFT' && '📝 Borrador'}
                  {formData.status === 'REVIEW' && '👀 Listo para Revisar'}
                  {formData.status === 'PUBLISHED' && '✅ Publicado'}
                  {formData.status === 'SCHEDULED' && '📅 Programado'}
                  {formData.status === 'ARCHIVED' && '📦 Archivado'}
                </p>
              </div>
            </div>

            {formData.status === 'PUBLISHED' && (
              <a
                href={`/blog/${formData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Publicado
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <Link
              href="/admin/blog"
              className="text-gray-600 hover:text-gray-900 transition-colors text-center sm:text-left"
            >
              ← Volver sin guardar
            </Link>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Save as Draft */}
              <button
                type="button"
                onClick={() => handleSaveWithStatus('DRAFT')}
                disabled={saving}
                className="inline-flex items-center justify-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Borrador'}
              </button>

              {/* Ready for Review */}
              <button
                type="button"
                onClick={() => handleSaveWithStatus('REVIEW')}
                disabled={saving}
                className="inline-flex items-center justify-center px-4 py-2.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors font-medium disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {saving ? 'Guardando...' : 'Listo para Revisar'}
              </button>

              {/* Publish to Production */}
              <button
                type="button"
                onClick={handlePublish}
                disabled={saving}
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-bold disabled:opacity-50 shadow-lg"
              >
                <Rocket className="w-4 h-4 mr-2" />
                {saving ? 'Publicando...' : '🚀 Publicar a Producción'}
              </button>
            </div>
          </div>

          {/* Help text */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              💡 <strong>Guardar Borrador:</strong> Guarda tus cambios pero el artículo sigue siendo privado.
              <strong className="ml-2">Listo para Revisar:</strong> Marca el artículo como completo para revisión final.
              <strong className="ml-2">Publicar:</strong> El artículo se hará público inmediatamente.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
