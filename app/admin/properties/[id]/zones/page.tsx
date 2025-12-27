'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Shield, ExternalLink, User, AlertTriangle } from 'lucide-react'
import { Button } from '../../../../../src/components/ui/Button'
import { Card } from '../../../../../src/components/ui/Card'
import { AnimatedLoadingSpinner } from '../../../../../src/components/ui/AnimatedLoadingSpinner'

interface PropertyData {
  id: string
  name: string
  hostId: string
  hostContactName: string
  hostContactEmail: string
  status: string
  type: string
  city: any
  state: any
}

export default function AdminPropertyZonesPage({ params }: { params: Promise<{ id: string }> }) {
  const [propertyId, setPropertyId] = useState<string>('')
  const [property, setProperty] = useState<PropertyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Unwrap params
  useEffect(() => {
    params.then((p) => setPropertyId(p.id))
  }, [params])

  // Verificar que el usuario sea admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/admin/auth/check')
        if (!response.ok) {
          setError('No tienes permisos de administrador')
          setIsAdmin(false)
          return
        }

        const data = await response.json()
        if (!data.authenticated) {
          setError('No tienes permisos de administrador')
          setIsAdmin(false)
          return
        }

        setIsAdmin(true)
      } catch (error) {
        console.error('Error verificando estado de admin:', error)
        setError('Error verificando permisos')
        setIsAdmin(false)
      }
    }

    checkAdminStatus()
  }, [])

  // Cargar datos de la propiedad
  useEffect(() => {
    if (!propertyId || !isAdmin) return

    const fetchProperty = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/admin/properties/${propertyId}`)

        if (!response.ok) {
          throw new Error('No se pudo cargar la propiedad')
        }

        const data = await response.json()
        setProperty(data)
      } catch (error) {
        console.error('Error cargando propiedad:', error)
        setError('No se pudo cargar la propiedad')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperty()
  }, [propertyId, isAdmin])

  // Función para abrir en nueva pestaña como el usuario
  const openAsUser = () => {
    if (!property) return

    // Abrir la página de zonas del usuario en nueva pestaña
    window.open(`/properties/${property.id}/zones`, '_blank', 'noopener,noreferrer')
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-center mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <Button
            onClick={() => router.push('/admin')}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Admin
          </Button>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AnimatedLoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando propiedad...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="w-12 h-12 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold text-center mb-2">Propiedad no encontrada</h2>
          <p className="text-gray-600 text-center mb-6">
            No se pudo encontrar la propiedad solicitada.
          </p>
          <Button
            onClick={() => router.push('/admin/properties')}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Propiedades
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con información de la propiedad */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push('/admin/users')}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>

              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{property.name}</h1>
                  <p className="text-sm text-gray-600">
                    <User className="w-3 h-3 inline mr-1" />
                    {property.hostContactName} ({property.hostContactEmail})
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  property.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  property.status === 'TRIAL' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {property.status}
                </span>
              </div>

              <Button
                onClick={openAsUser}
                variant="outline"
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir como Usuario
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8">
          <div className="text-center">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Gestión de Zonas - Vista Admin
            </h2>
            <p className="text-gray-600 mb-6">
              Para gestionar las zonas de esta propiedad, haz clic en "Abrir como Usuario" arriba.
              Esto abrirá la interfaz completa de gestión en una nueva pestaña.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Información de Seguridad</h3>
              <p className="text-sm text-blue-700">
                Al abrir como usuario, tendrás acceso completo a todas las funcionalidades de gestión
                de zonas como si fueras el propietario. Usa esta función con responsabilidad.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Propietario</p>
                <p className="font-semibold text-gray-900">{property.hostContactName}</p>
                <p className="text-sm text-gray-600">{property.hostContactEmail}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Tipo de Propiedad</p>
                <p className="font-semibold text-gray-900">{property.type}</p>
              </div>
            </div>

            <Button
              onClick={openAsUser}
              className="mt-6 w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Abrir Gestión de Zonas
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
