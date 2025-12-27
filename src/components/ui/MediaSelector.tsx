'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter,
  Check,
  X,
  Image as ImageIcon,
  Video,
  Upload,
  Grid3x3,
  List,
  Play,
  Loader2,
  FileImage,
  FileVideo
} from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import { Badge } from './Badge'

interface MediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl?: string
  originalName: string
  size: number
  duration?: number
  width?: number
  height?: number
  usageCount: number
  tags: string[]
  createdAt: string
}

interface MediaSelectorProps {
  type?: 'all' | 'image' | 'video'
  onSelect: (media: MediaItem) => void
  onClose: () => void
  isOpen: boolean
  multiple?: boolean
  onMultiSelect?: (media: MediaItem[]) => void
}

export function MediaSelector({
  type = 'all',
  onSelect,
  onClose,
  isOpen,
  multiple = false,
  onMultiSelect
}: MediaSelectorProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>(type)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (isOpen) {
      fetchMediaItems()
    }
  }, [isOpen])

  const fetchMediaItems = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterType !== 'all') params.append('type', filterType)
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/media-library?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMediaItems(data.items || [])
      }
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      const timeoutId = setTimeout(fetchMediaItems, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [searchQuery, filterType, isOpen])

  const handleSelect = (item: MediaItem) => {
    if (multiple) {
      const newSelection = new Set(selectedItems)
      if (newSelection.has(item.id)) {
        newSelection.delete(item.id)
      } else {
        newSelection.add(item.id)
      }
      setSelectedItems(newSelection)
    } else {
      onSelect(item)
    }
  }

  const handleConfirmMultiSelect = () => {
    if (multiple && onMultiSelect) {
      const selectedMedia = mediaItems.filter(item => selectedItems.has(item.id))
      onMultiSelect(selectedMedia)
    }
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

  const MediaGridItem = ({ item }: { item: MediaItem }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
        selectedItems.has(item.id) || (!multiple)
          ? 'border-violet-500 shadow-lg shadow-violet-100' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => handleSelect(item)}
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
        {multiple && (
          <div className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all ${
            selectedItems.has(item.id) 
              ? 'bg-violet-500' 
              : 'bg-gray-800 bg-opacity-50'
          }`}>
            {selectedItems.has(item.id) && (
              <Check className="w-4 h-4 text-white" />
            )}
          </div>
        )}

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
      </div>
    </motion.div>
  )

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Seleccionar {type === 'image' ? 'imagen' : type === 'video' ? 'video' : 'archivo'}
                </h2>
                <p className="text-gray-600">
                  {multiple ? 'Selecciona múltiples archivos' : 'Elige un archivo de tu biblioteca'}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
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

              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3x3 className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
              </div>
            ) : mediaItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {filterType === 'image' ? (
                    <FileImage className="w-8 h-8 text-gray-400" />
                  ) : filterType === 'video' ? (
                    <FileVideo className="w-8 h-8 text-gray-400" />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron archivos
                </h3>
                <p className="text-gray-600">
                  {searchQuery 
                    ? 'Intenta con otros términos de búsqueda'
                    : 'Sube archivos a tu biblioteca para verlos aquí'}
                </p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' 
                : 'space-y-2'
              }>
                <AnimatePresence>
                  {mediaItems.map(item => (
                    <MediaGridItem key={item.id} item={item} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer */}
          {multiple && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {selectedItems.size} archivo(s) seleccionado(s)
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleConfirmMultiSelect}
                    disabled={selectedItems.size === 0}
                  >
                    Seleccionar ({selectedItems.size})
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}