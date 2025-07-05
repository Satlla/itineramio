'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Image as ImageIcon, 
  Video, 
  Upload, 
  Search, 
  Filter,
  Grid3x3,
  List,
  Download,
  Trash2,
  Copy,
  Check,
  X,
  Info,
  Play,
  FileVideo,
  FileImage,
  Tag,
  Clock,
  HardDrive,
  Hash,
  Eye
} from 'lucide-react'
import { Button } from '../../../src/components/ui/Button'
import { Input } from '../../../src/components/ui/Input'
import { VideoUpload } from '../../../src/components/ui/VideoUpload'
import { ImageUpload } from '../../../src/components/ui/ImageUpload'
import { Badge } from '../../../src/components/ui/Badge'
import { useToast } from '../../../src/hooks/useToast'

interface MediaUsage {
  propertyId: string
  propertyName: string
  zoneId: string
  zoneName: string
  stepId?: string
}

interface MediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl?: string
  filename: string
  originalName: string
  size: number
  duration?: number
  width?: number
  height?: number
  usageCount: number
  tags: string[]
  createdAt: string
  lastUsedAt?: string
  usage?: MediaUsage[]
}

export default function MediaLibraryPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadType, setUploadType] = useState<'image' | 'video'>('image')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemsToDelete, setItemsToDelete] = useState<MediaItem[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchMediaItems()
  }, [])

  const fetchMediaItems = async () => {
    try {
      const response = await fetch('/api/media-library')
      if (response.ok) {
        const data = await response.json()
        setMediaItems(data.items)
      }
    } catch (error) {
      console.error('Error fetching media:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los archivos multimedia',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (url: string, metadata?: any) => {
    try {
      const response = await fetch('/api/media-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          type: uploadType,
          metadata
        })
      })

      if (response.ok) {
        await fetchMediaItems()
        setShowUploadModal(false)
        toast({
          title: 'Éxito',
          description: 'Archivo subido correctamente'
        })
      }
    } catch (error) {
      console.error('Error saving to library:', error)
      toast({
        title: 'Error',
        description: 'No se pudo guardar en la biblioteca',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteRequest = (ids: string[]) => {
    const itemsToDeleteArray = mediaItems.filter(item => ids.includes(item.id))
    setItemsToDelete(itemsToDeleteArray)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    const ids = itemsToDelete.map(item => item.id)
    
    try {
      const response = await fetch('/api/media-library', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      })

      if (response.ok) {
        await fetchMediaItems()
        setSelectedItems(new Set())
        setShowDeleteModal(false)
        setItemsToDelete([])
        toast({
          title: 'Éxito',
          description: `${ids.length} archivo(s) eliminado(s)`
        })
      }
    } catch (error) {
      console.error('Error deleting media:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron eliminar los archivos',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = handleDeleteRequest

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: 'Copiado',
      description: 'URL copiada al portapapeles'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const filteredItems = mediaItems.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false
    if (searchQuery && !item.originalName.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedItems)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedItems(newSelection)
  }

  const MediaGridItem = ({ item }: { item: MediaItem }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
        selectedItems.has(item.id) 
          ? 'border-violet-500 shadow-lg shadow-violet-100' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => toggleSelection(item.id)}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 relative">
        {item.type === 'image' ? (
          <img 
            src={item.url} 
            alt={item.originalName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full">
            {item.thumbnailUrl ? (
              <img 
                src={item.thumbnailUrl} 
                alt={item.originalName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <Video className="w-12 h-12 text-gray-600" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
            {item.duration && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                {formatDuration(item.duration)}
              </div>
            )}
          </div>
        )}
        
        {/* Selection indicator */}
        <div className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all ${
          selectedItems.has(item.id) 
            ? 'bg-violet-500' 
            : 'bg-gray-800 bg-opacity-50'
        }`}>
          {selectedItems.has(item.id) && (
            <Check className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Usage count badge */}
        {item.usageCount > 0 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            {item.usageCount} usos
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 truncate">
          {item.originalName}
        </p>
        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
          <span>{formatFileSize(item.size)}</span>
          {item.width && item.height && (
            <span>{item.width}x{item.height}</span>
          )}
        </div>
        
        {/* Usage info */}
        {item.usage && item.usage.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-xs font-medium text-gray-600">Usado en:</p>
            {item.usage.slice(0, 2).map((usage, index) => (
              <div key={index} className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1">
                <span className="font-medium">{usage.propertyName}</span>
                <span className="mx-1">→</span>
                <span>{usage.zoneName}</span>
              </div>
            ))}
            {item.usage.length > 2 && (
              <p className="text-xs text-gray-400">
                +{item.usage.length - 2} más
              </p>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              copyToClipboard(item.url)
            }}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              window.open(item.url, '_blank')
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete([item.id])
            }}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Biblioteca de Medios</h1>
        <p className="text-gray-600">Gestiona tus imágenes y videos reutilizables</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileImage className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Imágenes</p>
              <p className="text-xl font-semibold">{mediaItems.filter(i => i.type === 'image').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FileVideo className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Videos</p>
              <p className="text-xl font-semibold">{mediaItems.filter(i => i.type === 'video').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Espacio usado</p>
              <p className="text-xl font-semibold">
                {formatFileSize(mediaItems.reduce((acc, item) => acc + item.size, 0))}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Hash className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Duplicados evitados</p>
              <p className="text-xl font-semibold">
                {mediaItems.filter(i => i.usageCount > 1).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar archivos..."
              className="pl-10"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">Todos</option>
            <option value="image">Imágenes</option>
            <option value="video">Videos</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3x3 className="w-4 h-4" />}
          </Button>
          
          {selectedItems.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(Array.from(selectedItems))}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar ({selectedItems.size})
            </Button>
          )}
          
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Subir archivo
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || filterType !== 'all' 
              ? 'No se encontraron archivos' 
              : 'Tu biblioteca está vacía'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filterType !== 'all'
              ? 'Intenta con otros filtros'
              : 'Sube tu primer archivo para empezar'}
          </p>
          {!searchQuery && filterType === 'all' && (
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Subir archivo
            </Button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
          : 'space-y-2'
        }>
          <AnimatePresence>
            {filteredItems.map(item => (
              <MediaGridItem key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Subir archivo</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de archivo
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={uploadType === 'image' ? 'default' : 'outline'}
                    onClick={() => setUploadType('image')}
                    className="flex-1"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Imagen
                  </Button>
                  <Button
                    variant={uploadType === 'video' ? 'default' : 'outline'}
                    onClick={() => setUploadType('video')}
                    className="flex-1"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Video
                  </Button>
                </div>
              </div>

              {uploadType === 'image' ? (
                <ImageUpload
                  onChange={(url) => url && handleUpload(url)}
                  className="mb-4"
                />
              ) : (
                <VideoUpload
                  onChange={(url, metadata) => url && handleUpload(url, metadata)}
                  className="mb-4"
                />
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Detección de duplicados</p>
                    <p>Si subes un archivo idéntico a uno existente, se reutilizará automáticamente para ahorrar espacio.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-red-600">
                  ⚠️ Confirmar eliminación
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 mb-4">
                  {itemsToDelete.length === 1 
                    ? `¿Estás seguro de que quieres eliminar "${itemsToDelete[0]?.originalName}"?`
                    : `¿Estás seguro de que quieres eliminar ${itemsToDelete.length} archivos?`
                  }
                </p>

                {/* Show usage warnings */}
                {itemsToDelete.some(item => item.usage && item.usage.length > 0) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <X className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-red-800 mb-1">
                          ¡Archivos en uso detectados!
                        </h4>
                        <p className="text-sm text-red-700">
                          {itemsToDelete.filter(item => item.usage && item.usage.length > 0).length} 
                          {' '}archivo{itemsToDelete.filter(item => item.usage && item.usage.length > 0).length === 1 ? '' : 's'} 
                          {' '}de {itemsToDelete.length} están siendo usados en propiedades activas.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      {itemsToDelete
                        .filter(item => item.usage && item.usage.length > 0)
                        .map(item => {
                          const uniqueProperties = new Set(item.usage!.map(u => u.propertyName))
                          return (
                            <div key={item.id} className="bg-white border border-red-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium text-red-800 text-sm truncate">
                                  {item.originalName}
                                </p>
                                <Badge variant="destructive" className="text-xs">
                                  {item.usage!.length} uso{item.usage!.length === 1 ? '' : 's'}
                                </Badge>
                              </div>
                              
                              <div className="text-xs text-red-600 mb-2">
                                <strong>Usado en {uniqueProperties.size} propiedad{uniqueProperties.size === 1 ? '' : 'es'}:</strong>
                              </div>
                              
                              <div className="space-y-1 max-h-20 overflow-y-auto">
                                {item.usage!.map((usage, index) => (
                                  <div key={index} className="flex items-center text-xs text-red-700 bg-red-50 rounded px-2 py-1">
                                    <HardDrive className="w-3 h-3 mr-1 flex-shrink-0" />
                                    <span className="font-medium truncate">{usage.propertyName}</span>
                                    <span className="mx-1 text-red-400">→</span>
                                    <span className="truncate">{usage.zoneName}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })
                      }
                    </div>
                    
                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <Info className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-red-800 text-sm font-medium mb-1">
                            ⚠️ Impacto de la eliminación:
                          </p>
                          <ul className="text-red-700 text-xs space-y-1">
                            <li>• Las zonas mencionadas pueden dejar de mostrar estos medios</li>
                            <li>• Los pasos afectados quedarán sin contenido multimedia</li>
                            <li>• Los huéspedes no podrán ver las imágenes/videos en las guías</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {itemsToDelete.some(item => item.usage && item.usage.length > 0)
                    ? 'Eliminar de todas formas'
                    : 'Eliminar'
                  }
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}