'use client'

import { useState, useEffect } from 'react'
import { 
  Building2, 
  Search, 
  MapPin,
  Users,
  Calendar,
  Eye,
  MessageSquare
} from 'lucide-react'

interface Property {
  id: string
  name: string
  street: string
  city: string
  state: string
  country: string
  type: string
  bedrooms: number
  bathrooms: number
  maxGuests: number
  isPublished: boolean
  createdAt: string
  propertyCode: string | null
  host: {
    id: string
    name: string
    email: string
  }
  _count: {
    zones: number
    propertyViews: number
    reviews: number
  }
}

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchProperties()
  }, [page, search])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search })
      })
      
      const response = await fetch(`/api/admin/properties?${params}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setProperties(data.properties)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getPropertyType = (type: string) => {
    const types: Record<string, string> = {
      apartment: 'Apartamento',
      house: 'Casa',
      hotel: 'Hotel',
      room: 'Habitación'
    }
    return types[type] || type
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 mr-2 text-red-600" />
              Propiedades
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">Gestión de propiedades registradas</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, código, dirección o propietario..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Properties Table/Cards */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500">No se encontraron propiedades</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {properties.map((property) => (
                <div key={property.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{property.name}</h3>
                      <p className="text-xs text-gray-500">
                        {getPropertyType(property.type)} • {property.bedrooms} hab • {property.maxGuests} huésp.
                      </p>
                    </div>
                    <span className={`ml-2 inline-flex px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${
                      property.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {property.isPublished ? 'Publicada' : 'Borrador'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    {property.propertyCode && (
                      <div className="font-mono text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded inline-block">
                        {property.propertyCode}
                      </div>
                    )}
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{property.city}, {property.state}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Users className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{property.host.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center">
                        <Building2 className="h-3 w-3 mr-1 text-gray-400" />
                        <span>{property._count.zones} zonas</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-3 w-3 mr-1 text-gray-400" />
                        <span>{property._count.propertyViews}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1 text-gray-400" />
                        <span>{property._count.reviews}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                      <span>{formatDate(property.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Propiedad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Propietario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estadísticas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creada
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {property.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getPropertyType(property.type)} • {property.bedrooms} hab • {property.maxGuests} huéspedes
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-mono text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                          {property.propertyCode || 'Sin código'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="flex items-center text-gray-900">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                            {property.city}, {property.state}
                          </div>
                          <div className="text-xs text-gray-500">
                            {property.street}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="text-gray-900">{property.host.name}</div>
                          <div className="text-gray-500">{property.host.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{property._count.zones} zonas</span>
                          </div>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{property._count.propertyViews}</span>
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{property._count.reviews}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                          property.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {property.isPublished ? 'Publicada' : 'Borrador'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="flex items-center text-gray-900">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {formatDate(property.createdAt)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 sm:mt-6 flex items-center justify-between gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-xs sm:text-sm text-gray-700">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}