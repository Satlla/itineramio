'use client'

import { useState, useEffect } from 'react'
import { Button } from '../../../../src/components/ui/Button'
import { Card } from '../../../../src/components/ui/Card'
import { LoadingSpinner } from '../../../../src/components/ui/LoadingSpinner'
import { CheckCircle, XCircle, Globe, Eye, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface Property {
  id: string
  name: string
  isPublished: boolean
  publishedAt: string | null
  zonesCount: number
  publishedZonesCount: number
  zonesWithSteps: number
  totalSteps: number
  publishedSteps: number
  publicUrl: string
}

export default function PublishManagerPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState<string | null>(null)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/debug/check-property-publication')
      const result = await response.json()
      
      if (result.success) {
        setProperties(result.analysis.properties)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const publishProperty = async (propertyId: string) => {
    try {
      setPublishing(propertyId)
      
      const response = await fetch('/api/publish/property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Refresh the list
        await fetchProperties()
      } else {
        alert('Error al publicar: ' + result.error)
      }
    } catch (error) {
      console.error('Error publishing property:', error)
      alert('Error al publicar la propiedad')
    } finally {
      setPublishing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestor de Publicación
        </h1>
        <p className="text-gray-600">
          Administra qué propiedades están disponibles públicamente
        </p>
      </div>

      <div className="mb-4">
        <Button
          onClick={fetchProperties}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </Button>
      </div>

      <div className="grid gap-4">
        {properties.map((property) => (
          <Card key={property.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {property.name}
                  </h3>
                  {property.isPublished ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Publicada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      <XCircle className="w-3 h-3" />
                      No publicada
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p>ID: {property.id}</p>
                  <p>
                    Zonas: {property.publishedZonesCount}/{property.zonesCount} publicadas
                    {property.zonesWithSteps > 0 && ` (${property.zonesWithSteps} con contenido)`}
                  </p>
                  <p>
                    Pasos: {property.publishedSteps}/{property.totalSteps} publicados
                  </p>
                  {property.publishedAt && (
                    <p>
                      Publicada el: {new Date(property.publishedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {property.isPublished ? (
                  <>
                    <Link
                      href={property.publicUrl}
                      target="_blank"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Ver pública
                    </Link>
                    <Link
                      href={`/properties/${property.id}/zones`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Editar
                    </Link>
                  </>
                ) : property.zonesWithSteps > 0 ? (
                  <Button
                    onClick={() => publishProperty(property.id)}
                    disabled={publishing === property.id}
                    className="gap-2"
                  >
                    {publishing === property.id ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Publicando...
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4" />
                        Publicar
                      </>
                    )}
                  </Button>
                ) : (
                  <span className="text-sm text-gray-500">
                    Sin contenido para publicar
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {properties.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-600">
            No se encontraron propiedades
          </p>
        </Card>
      )}
    </div>
  )
}