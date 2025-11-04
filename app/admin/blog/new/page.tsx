'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Eye,
  Calendar,
  Sparkles,
  FileText,
  Tag,
  Image as ImageIcon,
  CheckCircle,
  Rocket
} from 'lucide-react'
import ImageUploader from '../components/ImageUploader'
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
  { value: 'PUBLISHED', label: 'Publicar' }
]

export default function NewBlogPostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    slug: '',
    excerpt: '',
    coverImage: '',
    coverImageAlt: '',
    content: '',
    category: 'GUIAS',
    tags: '',
    featured: false,
    status: 'DRAFT',
    authorName: 'Equipo Itineramio',
    metaTitle: '',
    metaDescription: '',
    keywords: ''
  })

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Auto-generate slug from title
    if (name === 'title' && !formData.slug) {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleContentChange = (html: string) => {
    setFormData(prev => ({ ...prev, content: html }))
  }

  const handleGenerateWithAI = async () => {
    const topic = prompt('¿Sobre qué tema quieres que genere el artículo?\n\nEjemplo: "Cómo optimizar precios en Airbnb para temporada alta"')

    if (!topic) return

    setGeneratingAI(true)

    try {
      const response = await fetch('/api/admin/blog/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          topic,
          category: formData.category
        })
      })

      if (!response.ok) {
        throw new Error('Error al generar contenido')
      }

      const data = await response.json()

      setFormData(prev => ({
        ...prev,
        title: data.content.title,
        excerpt: data.content.excerpt,
        content: data.content.content,
        metaTitle: data.content.metaTitle,
        metaDescription: data.content.metaDescription,
        keywords: data.content.keywords.join(', '),
        tags: data.content.tags.join(', ')
      }))

      alert('✨ ¡Artículo generado con IA!\n\nAhora puedes:\n• Editar el contenido\n• Corregir lo que necesites\n• Añadir tu toque personal\n• Ver el preview\n• Guardar cuando estés listo')
    } catch (error) {
      console.error('Error generating content:', error)
      alert('Error al generar contenido con IA. Por favor, inténtalo de nuevo.')
    } finally {
      setGeneratingAI(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      const keywordsArray = formData.keywords.split(',').map(k => k.trim()).filter(Boolean)

      const response = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          tags: tagsArray,
          keywords: keywordsArray
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert('Artículo creado exitosamente!')
        router.push('/admin/blog')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Error al crear el artículo')
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Nuevo Artículo</h1>
            <p className="text-gray-600 mt-1">Crea un nuevo artículo para el blog</p>
          </div>

          <button
            type="button"
            onClick={handleGenerateWithAI}
            disabled={generatingAI}
            className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generatingAI ? 'Generando...' : 'Generar con IA'}
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
                placeholder="Ej: Cómo optimizar tus precios en Airbnb"
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
                placeholder="Subtítulo opcional"
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
                  placeholder="como-optimizar-precios-airbnb"
                />
              </div>
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
                placeholder="Breve descripción del artículo (aparecerá en el listado)"
              />
            </div>

            {/* Cover Image */}
            <ImageUploader
              onImageUploaded={(url) => setFormData({ ...formData, coverImage: url })}
              currentImage={formData.coverImage}
              label="Imagen de portada"
            />

            {/* Cover Image Alt Text */}
            {formData.coverImage && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto alternativo de la imagen
                </label>
                <input
                  type="text"
                  name="coverImageAlt"
                  value={formData.coverImageAlt}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Descripción de la imagen para SEO y accesibilidad"
                />
              </div>
            )}

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
                placeholder="airbnb, pricing, automatización"
              />
            </div>

            {/* Author */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Autor
              </label>
              <input
                type="text"
                name="authorName"
                value={formData.authorName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
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
                placeholder="Si vacío, se usará el título"
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
                placeholder="Si vacío, se usará el extracto"
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
                placeholder="apartamento turístico, airbnb, gestión"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-6">
          <Link
            href="/admin/blog"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Guardando...' : 'Guardar Artículo'}
          </button>
        </div>
      </form>
    </div>
  )
}
