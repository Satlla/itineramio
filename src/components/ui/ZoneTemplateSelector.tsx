'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, 
  Crown, 
  Users, 
  Clock, 
  Check, 
  Filter,
  Search,
  X,
  ChevronDown
} from 'lucide-react'
import { Button } from './Button'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { Input } from './Input'
import { Badge } from './Badge'

interface ZoneTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  coverImage?: string
  isPublic: boolean
  isOfficial: boolean
  usageCount: number
  avgRating: number
  totalRatings: number
  creator?: {
    id: string
    name: string
  }
  templateElements: {
    id: string
    name: string
    type: string
    icon: string
    order: number
    templateSteps: {
      id: string
      title: string
      type: string
      estimatedTime?: number
    }[]
  }[]
}

interface ZoneTemplateSelectorProps {
  propertyId: string
  onSelect: (templateId: string) => Promise<void>
  onClose: () => void
  onCreateFromScratch: () => void
}

// Helper to get text from string or multilingual object
function getTextValue(value: string | { es: string; en?: string; fr?: string } | undefined, fallback: string = ''): string {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return value.es || fallback
}

const categories = [
  { id: 'all', name: 'Todas', icon: '🏠' },
  { id: 'kitchen', name: 'Cocina', icon: '🍳' },
  { id: 'bathroom', name: 'Baño', icon: '🚿' },
  { id: 'pool', name: 'Piscina', icon: '🏊' },
  { id: 'living_room', name: 'Salón', icon: '🛋️' },
  { id: 'bedroom', name: 'Dormitorio', icon: '🛏️' },
  { id: 'entrance', name: 'Entrada', icon: '🚪' },
  { id: 'other', name: 'Otros', icon: '📦' }
]

export function ZoneTemplateSelector({ propertyId, onSelect, onClose, onCreateFromScratch }: ZoneTemplateSelectorProps) {
  const [templates, setTemplates] = useState<ZoneTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<ZoneTemplate | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [selectedCategory])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }
      params.append('public', 'true')

      const response = await fetch(`/api/templates?${params}`)
      const result = await response.json()

      if (response.ok && result.data) {
        setTemplates(result.data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyTemplate = async (templateId: string) => {
    try {
      setApplying(templateId)
      await onSelect(templateId)
    } catch (error) {
      console.error('Error applying template:', error)
    } finally {
      setApplying(null)
    }
  }

  const filteredTemplates = templates.filter(template => {
    if (!template) return false
    const name = getTextValue(template.name, '')
    const description = getTextValue(template.description, '')
    const nameMatch = name.toLowerCase().includes(searchTerm.toLowerCase())
    const descMatch = description.toLowerCase().includes(searchTerm.toLowerCase())
    return nameMatch || descMatch
  })

  const getTotalSteps = (template: ZoneTemplate) => {
    return template.templateElements.reduce((total, element) => 
      total + element.templateSteps.length, 0
    )
  }

  const getEstimatedTime = (template: ZoneTemplate) => {
    return template.templateElements.reduce((total, element) => 
      total + element.templateSteps.reduce((stepTotal, step) => 
        stepTotal + (step.estimatedTime || 0), 0
      ), 0
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Plantillas Rápidas de Zonas</h2>
              <p className="text-gray-600 mt-1">
                Selecciona una plantilla prediseñada o crea una zona desde cero
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar plantillas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            <Button
              onClick={onCreateFromScratch}
              variant="outline"
              className="border-violet-200 text-violet-700 hover:bg-violet-50"
            >
              Crear desde cero
            </Button>
          </div>

          {/* Category Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`${
                        selectedCategory === category.id 
                          ? 'bg-violet-600 hover:bg-violet-700' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-180px)]">
          {/* Templates List */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando plantillas...</p>
                </div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay plantillas</h3>
                <p className="text-gray-600 mb-4">
                  No se encontraron plantillas para esta categoría.
                </p>
                <Button onClick={onCreateFromScratch} className="bg-violet-600 hover:bg-violet-700">
                  Crear zona desde cero
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card 
                      className={`hover:shadow-lg transition-all cursor-pointer border-2 ${
                        previewTemplate?.id === template.id 
                          ? 'border-violet-500 ring-2 ring-violet-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{template.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <CardTitle className="text-base">{template.name}</CardTitle>
                                {template.isOfficial && (
                                  <Crown className="w-4 h-4 text-yellow-500" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {template.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 fill-current text-yellow-400" />
                            <span>{Number(template.avgRating).toFixed(1)}</span>
                            <span>({template.totalRatings})</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{template.usageCount}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{getEstimatedTime(template)}min</span>
                          </div>
                        </div>

                        {/* Elements Preview */}
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {template.templateElements.slice(0, 3).map((element) => (
                              <Badge key={element.id} variant="secondary" className="text-xs">
                                {element.icon} {element.name}
                              </Badge>
                            ))}
                            {template.templateElements.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{template.templateElements.length - 3} más
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleApplyTemplate(template.id)
                          }}
                          disabled={applying === template.id}
                          className="w-full bg-violet-600 hover:bg-violet-700"
                          size="sm"
                        >
                          {applying === template.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Aplicando...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Usar Plantilla
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Preview Panel */}
          {previewTemplate && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Vista Previa</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewTemplate(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Template Info */}
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-3xl">{previewTemplate.icon}</div>
                    <div>
                      <h4 className="font-medium">{previewTemplate.name}</h4>
                      <p className="text-sm text-gray-600">{previewTemplate.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-current text-yellow-400" />
                      <span>{Number(previewTemplate.avgRating).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{previewTemplate.usageCount} usos</span>
                    </div>
                  </div>
                </div>

                {/* Elements and Steps */}
                <div className="space-y-4">
                  <h5 className="font-medium text-sm text-gray-700">
                    Elementos incluidos ({previewTemplate.templateElements.length})
                  </h5>
                  
                  {previewTemplate.templateElements.map((element) => (
                    <div key={element.id} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{element.icon}</span>
                        <span className="font-medium text-sm">{element.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {element.templateSteps.length} pasos
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        {element.templateSteps.slice(0, 3).map((step) => (
                          <div key={step.id} className="text-xs text-gray-600 flex items-center space-x-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <span>{step.title}</span>
                            {step.estimatedTime && (
                              <span className="text-gray-400">({step.estimatedTime}min)</span>
                            )}
                          </div>
                        ))}
                        {element.templateSteps.length > 3 && (
                          <div className="text-xs text-gray-400">
                            +{element.templateSteps.length - 3} pasos más
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Apply Button */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => handleApplyTemplate(previewTemplate.id)}
                    disabled={applying === previewTemplate.id}
                    className="w-full bg-violet-600 hover:bg-violet-700"
                  >
                    {applying === previewTemplate.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Aplicando...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Usar Esta Plantilla
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}