'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  Plus,
  Image as ImageIcon,
  Type,
  List,
  Quote,
  Code,
  Video,
  AlertCircle,
  X,
  GripVertical,
  Trash2,
  Calendar
} from 'lucide-react'

// Tipos de bloques soportados
type BlockType = 'paragraph' | 'heading2' | 'heading3' | 'list' | 'quote' | 'code' | 'image' | 'video'

interface ContentBlock {
  id: string
  type: BlockType
  content: string
  metadata?: {
    url?: string
    alt?: string
    caption?: string
    language?: string
  }
}

export default function NewArticlePage() {
  const router = useRouter()

  // Estado del artículo
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [coverImageAlt, setCoverImageAlt] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('OTROS')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [difficulty, setDifficulty] = useState('BEGINNER')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [status, setStatus] = useState<'DRAFT' | 'SCHEDULED' | 'PUBLISHED'>('DRAFT')
  const [scheduledFor, setScheduledFor] = useState('')

  // Estado del contenido (bloques)
  const [blocks, setBlocks] = useState<ContentBlock[]>([
    { id: '1', type: 'paragraph', content: '' }
  ])
  const [activeBlock, setActiveBlock] = useState<string>('1')

  // Estado UI
  const [isSaving, setIsSaving] = useState(false)
  const [showBlockMenu, setShowBlockMenu] = useState(false)
  const [blockMenuPosition, setBlockMenuPosition] = useState<{ top: number, left: number }>({ top: 0, left: 0 })

  // Categorías disponibles
  const categories = [
    { id: 'CHECKIN_CHECKOUT', name: 'Check-in/Check-out' },
    { id: 'WIFI_TECH', name: 'WiFi & Tecnología' },
    { id: 'LEGAL_VUT', name: 'Legal & VUT' },
    { id: 'GUEST_COMMUNICATION', name: 'Comunicación con Huéspedes' },
    { id: 'REVIEWS_RATINGS', name: 'Reviews & Valoraciones' },
    { id: 'EMERGENCIES', name: 'Emergencias' },
    { id: 'AMENITIES', name: 'Amenidades' },
    { id: 'MAINTENANCE', name: 'Mantenimiento' },
    { id: 'MARKETING', name: 'Marketing' },
    { id: 'OPERATIONS', name: 'Operaciones' },
    { id: 'OTROS', name: 'Otros' }
  ]

  // Añadir nuevo bloque
  const addBlock = (type: BlockType, afterBlockId?: string) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: '',
      metadata: type === 'image' || type === 'video' ? { url: '', alt: '', caption: '' } : undefined
    }

    if (afterBlockId) {
      const index = blocks.findIndex(b => b.id === afterBlockId)
      const newBlocks = [...blocks]
      newBlocks.splice(index + 1, 0, newBlock)
      setBlocks(newBlocks)
    } else {
      setBlocks([...blocks, newBlock])
    }

    setActiveBlock(newBlock.id)
    setShowBlockMenu(false)
  }

  // Actualizar contenido de bloque
  const updateBlock = (blockId: string, content: string) => {
    setBlocks(blocks.map(block =>
      block.id === blockId ? { ...block, content } : block
    ))
  }

  // Actualizar metadata de bloque
  const updateBlockMetadata = (blockId: string, metadata: ContentBlock['metadata']) => {
    setBlocks(blocks.map(block =>
      block.id === blockId ? { ...block, metadata: { ...block.metadata, ...metadata } } : block
    ))
  }

  // Eliminar bloque
  const deleteBlock = (blockId: string) => {
    if (blocks.length === 1) return // No eliminar el último bloque
    setBlocks(blocks.filter(block => block.id !== blockId))
  }

  // Mover bloque
  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === blockId)
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === blocks.length - 1) return

    const newBlocks = [...blocks]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]]
    setBlocks(newBlocks)
  }

  // Añadir tag
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  // Añadir keyword
  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()])
      setKeywordInput('')
    }
  }

  // Guardar artículo
  const handleSave = async (publishStatus: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED') => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/knowledge/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          subtitle,
          coverImage,
          coverImageAlt,
          excerpt,
          content: blocks,
          category,
          tags,
          difficulty,
          metaTitle: metaTitle || title,
          metaDescription: metaDescription || excerpt,
          keywords,
          status: publishStatus,
          scheduledFor: publishStatus === 'SCHEDULED' ? scheduledFor : null,
          hasTemplate: false // TODO: Implementar gestión de plantillas
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al guardar artículo')
      }

      alert(`Artículo ${publishStatus === 'DRAFT' ? 'guardado como borrador' : publishStatus === 'PUBLISHED' ? 'publicado' : 'programado'} exitosamente`)

      if (publishStatus === 'PUBLISHED') {
        router.push('/admin/marketing/knowledge')
      } else {
        // Si es borrador, redirigir a edición
        router.push(`/admin/marketing/knowledge/${data.data.id}`)
      }
    } catch (error) {
      console.error('Error guardando artículo:', error)
      alert(error instanceof Error ? error.message : 'Error al guardar el artículo')
    } finally {
      setIsSaving(false)
    }
  }

  // Renderizar bloque según tipo
  const renderBlock = (block: ContentBlock) => {
    const isActive = activeBlock === block.id

    switch (block.type) {
      case 'paragraph':
        return (
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, e.target.value)}
            onFocus={() => setActiveBlock(block.id)}
            placeholder="Escribe tu contenido aquí..."
            className={`w-full min-h-[60px] px-4 py-2 border-2 rounded-lg resize-none focus:outline-none ${
              isActive ? 'border-violet-500 bg-violet-50/50' : 'border-gray-200 bg-white'
            }`}
          />
        )

      case 'heading2':
        return (
          <input
            type="text"
            value={block.content}
            onChange={(e) => updateBlock(block.id, e.target.value)}
            onFocus={() => setActiveBlock(block.id)}
            placeholder="Título de sección..."
            className={`w-full px-4 py-2 text-2xl font-bold border-2 rounded-lg focus:outline-none ${
              isActive ? 'border-violet-500 bg-violet-50/50' : 'border-gray-200 bg-white'
            }`}
          />
        )

      case 'heading3':
        return (
          <input
            type="text"
            value={block.content}
            onChange={(e) => updateBlock(block.id, e.target.value)}
            onFocus={() => setActiveBlock(block.id)}
            placeholder="Subtítulo..."
            className={`w-full px-4 py-2 text-xl font-semibold border-2 rounded-lg focus:outline-none ${
              isActive ? 'border-violet-500 bg-violet-50/50' : 'border-gray-200 bg-white'
            }`}
          />
        )

      case 'list':
        return (
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, e.target.value)}
            onFocus={() => setActiveBlock(block.id)}
            placeholder="• Elemento 1&#10;• Elemento 2&#10;• Elemento 3"
            className={`w-full min-h-[100px] px-4 py-2 border-2 rounded-lg resize-none focus:outline-none ${
              isActive ? 'border-violet-500 bg-violet-50/50' : 'border-gray-200 bg-white'
            }`}
          />
        )

      case 'quote':
        return (
          <div className={`border-l-4 ${isActive ? 'border-violet-500 bg-violet-50' : 'border-gray-300 bg-gray-50'} p-4 rounded-r-lg`}>
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              onFocus={() => setActiveBlock(block.id)}
              placeholder="Escribe una cita o nota importante..."
              className="w-full min-h-[60px] bg-transparent border-none resize-none focus:outline-none italic text-gray-700"
            />
          </div>
        )

      case 'code':
        return (
          <div className={`border-2 rounded-lg ${isActive ? 'border-violet-500' : 'border-gray-300'} overflow-hidden`}>
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              onFocus={() => setActiveBlock(block.id)}
              placeholder="Escribe tu código aquí..."
              className="w-full min-h-[120px] px-4 py-3 bg-gray-900 text-green-400 font-mono text-sm resize-none focus:outline-none"
              spellCheck={false}
            />
          </div>
        )

      case 'image':
        return (
          <div className={`border-2 rounded-lg p-4 ${isActive ? 'border-violet-500 bg-violet-50' : 'border-gray-200'}`}>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de la imagen</label>
                <input
                  type="text"
                  value={block.metadata?.url || ''}
                  onChange={(e) => updateBlockMetadata(block.id, { url: e.target.value })}
                  onFocus={() => setActiveBlock(block.id)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto alternativo (SEO)</label>
                <input
                  type="text"
                  value={block.metadata?.alt || ''}
                  onChange={(e) => updateBlockMetadata(block.id, { alt: e.target.value })}
                  placeholder="Descripción de la imagen"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption (opcional)</label>
                <input
                  type="text"
                  value={block.metadata?.caption || ''}
                  onChange={(e) => updateBlockMetadata(block.id, { caption: e.target.value })}
                  placeholder="Pie de foto"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500"
                />
              </div>
              {block.metadata?.url && (
                <div className="mt-3">
                  <img src={block.metadata.url} alt={block.metadata.alt} className="w-full rounded-lg" />
                </div>
              )}
            </div>
          </div>
        )

      case 'video':
        return (
          <div className={`border-2 rounded-lg p-4 ${isActive ? 'border-violet-500 bg-violet-50' : 'border-gray-200'}`}>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL del video (YouTube/Vimeo)</label>
                <input
                  type="text"
                  value={block.metadata?.url || ''}
                  onChange={(e) => updateBlockMetadata(block.id, { url: e.target.value })}
                  onFocus={() => setActiveBlock(block.id)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption (opcional)</label>
                <input
                  type="text"
                  value={block.metadata?.caption || ''}
                  onChange={(e) => updateBlockMetadata(block.id, { caption: e.target.value })}
                  placeholder="Descripción del video"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fijo */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin/marketing/knowledge" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-semibold text-gray-900">Nuevo Artículo</h1>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleSave('DRAFT')}
                disabled={isSaving || !title}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Guardando...' : 'Guardar borrador'}
              </button>

              <button
                onClick={() => window.open(`/knowledge/preview?title=${encodeURIComponent(title)}`, '_blank')}
                disabled={!title}
                className="flex items-center px-4 py-2 text-violet-700 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>

              <button
                onClick={() => handleSave('PUBLISHED')}
                disabled={isSaving || !title || !excerpt}
                className="flex items-center px-4 py-2 text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSaving ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Título y metadatos principales */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del artículo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Check-in Remoto Sin Llaves: Guía Completa 2025"
                  className="w-full px-4 py-3 text-xl font-bold border-2 border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                />
                <p className="mt-1 text-sm text-gray-500">{title.length} caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtítulo (opcional)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Breve descripción que complementa el título"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen de portada (URL)
                </label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://ejemplo.com/imagen-portada.jpg"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-violet-500"
                />
                {coverImage && (
                  <div className="mt-3">
                    <img src={coverImage} alt="Portada" className="w-full h-48 object-cover rounded-lg" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extracto <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Resumen breve que se mostrará en las tarjetas de artículos (150-200 caracteres)"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg resize-none focus:outline-none focus:border-violet-500"
                  rows={3}
                />
                <p className="mt-1 text-sm text-gray-500">{excerpt.length} caracteres</p>
              </div>
            </div>

            {/* Editor de contenido con bloques */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Contenido del artículo</h3>
                <button
                  onClick={() => addBlock('paragraph')}
                  className="flex items-center px-3 py-1.5 text-sm text-violet-700 bg-violet-50 rounded-lg hover:bg-violet-100"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Añadir bloque
                </button>
              </div>

              <div className="space-y-4">
                {blocks.map((block, index) => (
                  <div key={block.id} className="group relative">
                    {/* Controles del bloque */}
                    <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col space-y-1">
                      <button
                        onClick={() => moveBlock(block.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Mover arriba"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteBlock(block.id)}
                        disabled={blocks.length === 1}
                        className="p-1 text-red-400 hover:text-red-600 disabled:opacity-30"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Bloque de contenido */}
                    <div className="relative">
                      {renderBlock(block)}

                      {/* Tipo de bloque badge */}
                      <div className="absolute -top-2 right-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {block.type}
                      </div>
                    </div>

                    {/* Menú de añadir bloque debajo */}
                    <div className="flex items-center justify-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded-lg shadow-sm p-1">
                        <button
                          onClick={() => addBlock('paragraph', block.id)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                          title="Párrafo"
                        >
                          <Type className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => addBlock('heading2', block.id)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                          title="Título H2"
                        >
                          <span className="text-sm font-bold">H2</span>
                        </button>
                        <button
                          onClick={() => addBlock('heading3', block.id)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                          title="Título H3"
                        >
                          <span className="text-sm font-bold">H3</span>
                        </button>
                        <button
                          onClick={() => addBlock('list', block.id)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                          title="Lista"
                        >
                          <List className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => addBlock('quote', block.id)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                          title="Cita"
                        >
                          <Quote className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => addBlock('code', block.id)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                          title="Código"
                        >
                          <Code className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => addBlock('image', block.id)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                          title="Imagen"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => addBlock('video', block.id)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                          title="Video"
                        >
                          <Video className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar con metadatos y configuración */}
          <div className="lg:col-span-1 space-y-6">
            {/* Categoría y taxonomía */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Taxonomía</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Añadir tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500 text-sm"
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2 py-1 bg-violet-100 text-violet-700 text-sm rounded-full">
                      {tag}
                      <button onClick={() => setTags(tags.filter(t => t !== tag))} className="ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dificultad</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500"
                >
                  <option value="BEGINNER">🟢 Principiante</option>
                  <option value="INTERMEDIATE">🟡 Intermedio</option>
                  <option value="ADVANCED">🔴 Avanzado</option>
                </select>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">SEO</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta título</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Título optimizado para SEO (50-60 chars)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500 text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">{metaTitle.length}/60 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta descripción</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Descripción para resultados de búsqueda (150-160 chars)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-violet-500 text-sm"
                  rows={3}
                />
                <p className="mt-1 text-xs text-gray-500">{metaDescription.length}/160 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    placeholder="Añadir keyword..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500 text-sm"
                  />
                  <button
                    onClick={addKeyword}
                    className="px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keywords.map(keyword => (
                    <span key={keyword} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {keyword}
                      <button onClick={() => setKeywords(keywords.filter(k => k !== keyword))} className="ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Publicación */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Publicación</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500"
                >
                  <option value="DRAFT">📝 Borrador</option>
                  <option value="SCHEDULED">📅 Programado</option>
                  <option value="PUBLISHED">✅ Publicado</option>
                </select>
              </div>

              {status === 'SCHEDULED' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Fecha de publicación
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500 text-sm"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-start space-x-2 text-sm text-gray-600">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>El artículo será visible en el Centro de Conocimiento una vez publicado.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
