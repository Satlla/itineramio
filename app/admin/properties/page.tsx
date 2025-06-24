'use client'

import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  Search, 
  Eye,
  Edit,
  MapPin,
  User,
  Calendar,
  Home,
  Hotel,
  Check,
  X,
  ExternalLink,
  Copy,
  QrCode
} from 'lucide-react'
import Link from 'next/link'

interface Property {
  id: string
  name: string
  address: string
  city: string
  country: string
  type: string
  bedrooms: number
  bathrooms: number
  maxGuests: number
  isPublished: boolean
  createdAt: string
  host: {
    id: string
    name: string
    email: string
  }
  zones: {
    id: string
    name: any
  }[]
}

export default function PropertiesManagementPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchById, setSearchById] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/properties')
      const data = await response.json()
      if (data.success) {
        setProperties(data.properties)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProperties = properties.filter(property => {
    if (searchById && searchTerm) {
      return property.id.toLowerCase().includes(searchTerm.toLowerCase())
    }
    
    const matchesSearch = searchTerm === '' || 
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.host.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.host.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || property.type === typeFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'published' && property.isPublished) ||
      (statusFilter === 'draft' && !property.isPublished)

    return matchesSearch && matchesType && matchesStatus
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'apartment':
        return <Building2 className="w-4 h-4" />
      case 'house':
        return <Home className="w-4 h-4" />
      case 'hotel':
        return <Hotel className="w-4 h-4" />
      default:
        return <Building2 className="w-4 h-4" />
    }
  }

  const getPropertyTypeName = (type: string) => {
    switch (type) {
      case 'apartment':
        return 'Apartamento'
      case 'house':
        return 'Casa'
      case 'hotel':
        return 'Hotel'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Propiedades</h1>
          <p className="text-gray-600 mt-2">
            {properties.length} propiedades • {properties.filter(p => p.isPublished).length} publicadas
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchById ? "Buscar por ID..." : "Buscar propiedad..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full"
              />
            </div>
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={searchById}
                  onChange={(e) => setSearchById(e.target.checked)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Buscar solo por ID</span>
              </label>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 lg:gap-4">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-w-0"
            >
              <option value="all">Todos los tipos</option>
              <option value="apartment">Apartamentos</option>
              <option value="house">Casas</option>
              <option value="hotel">Hoteles</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-w-0"
            >
              <option value="all">Todos los estados</option>
              <option value="published">Publicadas</option>
              <option value="draft">Borradores</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propiedad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propietario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        {getPropertyTypeIcon(property.type)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{property.name}</div>
                        <div className="text-sm text-gray-500">{getPropertyTypeName(property.type)}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{property.host.name}</div>
                    <div className="text-sm text-gray-500">{property.host.email}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{property.city}</div>
                    <div className="text-sm text-gray-500">{property.address}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Home className="w-4 h-4 mr-1" />
                        {property.bedrooms}
                      </span>
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {property.maxGuests}
                      </span>
                      <span className="flex items-center">
                        <QrCode className="w-4 h-4 mr-1" />
                        {property.zones.length}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      property.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {property.isPublished ? 'Publicada' : 'Borrador'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <code className="text-xs text-gray-600 font-mono">{property.id.slice(0, 12)}...</code>
                      <button
                        onClick={() => copyToClipboard(property.id)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        {copiedId === property.id ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedProperty(property)}
                        className="text-red-600 hover:text-red-900"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/properties/${property.id}/zones`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Gestionar"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <a
                        href={`/guide/${property.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900"
                        title="Ver guía pública"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Properties Cards - Mobile & Tablet */}
      <div className="lg:hidden space-y-4">
        {filteredProperties.map((property) => (
          <div key={property.id} className="bg-white rounded-lg border p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center flex-1 min-w-0">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  {getPropertyTypeIcon(property.type)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{property.name}</h3>
                  <p className="text-xs text-gray-500">{getPropertyTypeName(property.type)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  property.isPublished 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {property.isPublished ? 'Pub' : 'Draft'}
                </span>
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-500">Propietario</p>
                <p className="text-sm font-medium text-gray-900 truncate">{property.host.name}</p>
                <p className="text-xs text-gray-500 truncate">{property.host.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Ubicación</p>
                <p className="text-sm font-medium text-gray-900">{property.city}</p>
                <p className="text-xs text-gray-500 truncate">{property.address}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Home className="w-3 h-3 mr-1" />
                  {property.bedrooms}
                </span>
                <span className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {property.maxGuests}
                </span>
                <span className="flex items-center">
                  <QrCode className="w-3 h-3 mr-1" />
                  {property.zones.length}
                </span>
              </div>
              <div className="flex items-center">
                <code className="text-xs text-gray-600 font-mono mr-1">{property.id.slice(0, 8)}...</code>
                <button
                  onClick={() => copyToClipboard(property.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {copiedId === property.id ? (
                    <Check className="w-3 h-3 text-green-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                onClick={() => setSelectedProperty(property)}
                className="flex items-center text-red-600 hover:text-red-900 text-sm"
              >
                <Eye className="w-4 h-4 mr-1" />
                Ver detalles
              </button>
              <div className="flex items-center space-x-3">
                <Link
                  href={`/properties/${property.id}/zones`}
                  className="flex items-center text-blue-600 hover:text-blue-900 text-sm"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Gestionar
                </Link>
                <a
                  href={`/guide/${property.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900"
                  title="Ver guía pública"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron propiedades</h3>
          <p className="text-gray-600">
            {searchById ? 'Intenta con un ID diferente' : 'Intenta ajustar los filtros de búsqueda'}
          </p>
        </div>
      )}

      {/* Property Detail Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-6">
              <div className="flex justify-between items-start mb-4 lg:mb-6">
                <div className="min-w-0 flex-1 mr-4">
                  <h2 className="text-lg lg:text-2xl font-bold text-gray-900 truncate">{selectedProperty.name}</h2>
                  <p className="text-gray-600 mt-1 text-sm lg:text-base">ID: {selectedProperty.id}</p>
                </div>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Información General</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">Tipo</dt>
                      <dd className="text-sm font-medium text-gray-900">{getPropertyTypeName(selectedProperty.type)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Dirección</dt>
                      <dd className="text-sm font-medium text-gray-900">{selectedProperty.address}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Ciudad</dt>
                      <dd className="text-sm font-medium text-gray-900">{selectedProperty.city}, {selectedProperty.country}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Capacidad</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {selectedProperty.bedrooms} hab., {selectedProperty.bathrooms} baños, {selectedProperty.maxGuests} huéspedes
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Propietario</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">Nombre</dt>
                      <dd className="text-sm font-medium text-gray-900">{selectedProperty.host.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Email</dt>
                      <dd className="text-sm font-medium text-gray-900 break-all">{selectedProperty.host.email}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-4 lg:mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Zonas ({selectedProperty.zones.length})</h3>
                <div className="space-y-2">
                  {selectedProperty.zones.map((zone) => (
                    <div key={zone.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">
                        {typeof zone.name === 'object' ? zone.name.es || zone.name.en : zone.name}
                      </p>
                      <p className="text-xs text-gray-500">ID: {zone.id}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 lg:mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/properties/${selectedProperty.id}/zones`}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-center"
                >
                  Gestionar Propiedad
                </Link>
                <a
                  href={`/guide/${selectedProperty.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-center"
                >
                  Ver Guía Pública
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}