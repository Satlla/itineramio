'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Search, Check, Home, Copy, AlertCircle } from 'lucide-react'
import { Button } from './Button'
import { Card, CardContent } from './Card'
import { Input } from './Input'
import { cn } from '../../lib/utils'

interface Property {
  id: string
  name: string
  type: string
  location?: string
  status: string
}

interface CopyZoneToPropertyModalProps {
  isOpen: boolean
  onClose: () => void
  zoneName: string
  zoneId: string
  currentPropertyId: string
  onCopyComplete: (successCount: number, failedCount: number) => void
}

export function CopyZoneToPropertyModal({
  isOpen,
  onClose,
  zoneName,
  zoneId,
  currentPropertyId,
  onCopyComplete
}: CopyZoneToPropertyModalProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load user's properties
  useEffect(() => {
    if (isOpen) {
      loadProperties()
    }
  }, [isOpen])

  // Filter properties based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProperties(properties)
    } else {
      const filtered = properties.filter(property =>
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (property.location && property.location.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredProperties(filtered)
    }
  }, [properties, searchTerm])

  const loadProperties = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/properties')
      const result = await response.json()
      
      if (response.ok && result.success) {
        // Filter out current property and only show active properties
        const availableProperties = result.data.filter((prop: Property) => 
          prop.id !== currentPropertyId && prop.status !== 'DELETED'
        )
        setProperties(availableProperties)
        setFilteredProperties(availableProperties)
      } else {
        setError('Error al cargar las propiedades')
      }
    } catch (error) {
      console.error('Error loading properties:', error)
      setError('Error al cargar las propiedades')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePropertyToggle = (propertyId: string) => {
    const newSelected = new Set(selectedPropertyIds)
    if (newSelected.has(propertyId)) {
      newSelected.delete(propertyId)
    } else {
      newSelected.add(propertyId)
    }
    setSelectedPropertyIds(newSelected)
  }

  const handleCopyZone = async () => {
    if (selectedPropertyIds.size === 0) return

    setIsCopying(true)
    setError(null)

    let successCount = 0
    let failedCount = 0

    try {
      // Copy zone to each selected property
      for (const propertyId of selectedPropertyIds) {
        try {
          const response = await fetch(`/api/zones/${zoneId}/copy`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              targetPropertyId: propertyId
            })
          })

          const result = await response.json()
          
          if (response.ok && result.success) {
            successCount++
          } else {
            failedCount++
            console.error(`Failed to copy zone to property ${propertyId}:`, result.error)
          }
        } catch (error) {
          failedCount++
          console.error(`Error copying zone to property ${propertyId}:`, error)
        }
      }

      onCopyComplete(successCount, failedCount)
      onClose()
    } catch (error) {
      console.error('Error in copy process:', error)
      setError('Error durante el proceso de copia')
    } finally {
      setIsCopying(false)
    }
  }

  const handleClose = () => {
    setSelectedPropertyIds(new Set())
    setSearchTerm('')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  const showSearchBar = properties.length > 5

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Copiar Zona</h2>
            <p className="text-sm text-gray-600 mt-1">
              Selecciona las propiedades donde quieres copiar "{zoneName}"
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search bar (only show if > 5 properties) */}
          {showSearchBar && (
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar propiedades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Loading state */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
              <span className="ml-3 text-gray-600">Cargando propiedades...</span>
            </div>
          ) : (
            <>
              {/* Properties list */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredProperties.length === 0 ? (
                  <div className="text-center py-8">
                    <Home className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {searchTerm ? 'No se encontraron propiedades' : 'No tienes otras propiedades disponibles'}
                    </p>
                  </div>
                ) : (
                  filteredProperties.map((property) => (
                    <Card
                      key={property.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-md",
                        selectedPropertyIds.has(property.id)
                          ? "ring-2 ring-violet-500 bg-violet-50"
                          : "hover:bg-gray-50"
                      )}
                      onClick={() => handlePropertyToggle(property.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <Home className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{property.name}</h4>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span className="capitalize">{property.type.toLowerCase()}</span>
                                {property.location && (
                                  <>
                                    <span>•</span>
                                    <span>{property.location}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center",
                            selectedPropertyIds.has(property.id)
                              ? "bg-violet-600 border-violet-600"
                              : "border-gray-300"
                          )}>
                            {selectedPropertyIds.has(property.id) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Selected count */}
              {selectedPropertyIds.size > 0 && (
                <div className="mt-4 p-3 bg-violet-50 rounded-md">
                  <p className="text-sm text-violet-700">
                    {selectedPropertyIds.size} propiedad{selectedPropertyIds.size !== 1 ? 'es' : ''} seleccionada{selectedPropertyIds.size !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isCopying}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCopyZone}
            disabled={selectedPropertyIds.size === 0 || isCopying || isLoading}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {isCopying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Copiando...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copiar Zona ({selectedPropertyIds.size})
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}