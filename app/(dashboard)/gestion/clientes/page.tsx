'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Plus,
  Search,
  User,
  Briefcase,
  Mail,
  Phone,
  Trash2,
  Edit,
  ChevronRight,
  Building2
} from 'lucide-react'
import Link from 'next/link'
import { Button, Card, CardContent, Badge } from '../../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardFooter } from '../../../../src/components/layout/DashboardFooter'

interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  type: 'EMPRESA' | 'PERSONA_FISICA'
  nif?: string
  cif?: string
  address?: string
  city?: string
  _count?: {
    billingConfigs: number
    liquidations: number
    clientInvoices: number
  }
}

export default function ClientesPage() {
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [showNewModal, setShowNewModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Form state
  const [newClient, setNewClient] = useState({
    type: 'PERSONA_FISICA' as 'EMPRESA' | 'PERSONA_FISICA',
    nombreCompleto: '',
    razonSocial: '',
    email: '',
    phone: '',
    nif: '',
    cif: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'España'
  })
  const [saving, setSaving] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/owners', { credentials: 'include' })

      if (response.ok) {
        const data = await response.json()
        setClients(data.owners || [])
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateNIF = (nif: string): boolean => {
    if (!nif) return true
    const nifRegex = /^[0-9]{8}[A-Za-z]$/
    const nieRegex = /^[XYZxyz][0-9]{7}[A-Za-z]$/
    return nifRegex.test(nif) || nieRegex.test(nif)
  }

  const validateCIF = (cif: string): boolean => {
    if (!cif) return true
    const cifRegex = /^[A-HJ-NP-SUVWa-hj-np-suvw][0-9]{7}[0-9A-Ja-j]$/
    return cifRegex.test(cif)
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (newClient.type === 'PERSONA_FISICA') {
      if (!newClient.nombreCompleto.trim()) {
        errors.nombreCompleto = 'El nombre es requerido'
      }
      if (newClient.nif && !validateNIF(newClient.nif)) {
        errors.nif = 'NIF/NIE no válido'
      }
    } else {
      if (!newClient.razonSocial.trim()) {
        errors.razonSocial = 'La razón social es requerida'
      }
      if (newClient.cif && !validateCIF(newClient.cif)) {
        errors.cif = 'CIF no válido'
      }
    }

    if (!newClient.email.trim()) {
      errors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClient.email)) {
      errors.email = 'Email no válido'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateClient = async () => {
    if (!validateForm()) return

    try {
      setSaving(true)
      const payload = {
        type: newClient.type,
        email: newClient.email,
        phone: newClient.phone || undefined,
        address: newClient.address || undefined,
        city: newClient.city || undefined,
        postalCode: newClient.postalCode || undefined,
        country: newClient.country,
        ...(newClient.type === 'PERSONA_FISICA'
          ? { nombreCompleto: newClient.nombreCompleto, nif: newClient.nif || undefined }
          : { razonSocial: newClient.razonSocial, cif: newClient.cif || undefined }
        )
      }

      const response = await fetch('/api/owners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const data = await response.json()
        setClients([...clients, data.owner])
        resetForm()
        setShowNewModal(false)
      } else {
        const data = await response.json()
        setFormErrors({ general: data.error || 'Error al crear cliente' })
      }
    } catch (error) {
      console.error('Error creating client:', error)
      setFormErrors({ general: 'Error de conexión' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    const hasRelations = (client?._count?.billingConfigs || 0) > 0 ||
      (client?._count?.liquidations || 0) > 0 ||
      (client?._count?.clientInvoices || 0) > 0

    if (hasRelations) {
      alert('No se puede eliminar un cliente con propiedades, liquidaciones o facturas asociadas')
      return
    }

    if (!confirm('¿Eliminar este cliente?')) return

    try {
      setDeleting(clientId)
      const response = await fetch(`/api/owners/${clientId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setClients(clients.filter(c => c.id !== clientId))
      } else {
        const data = await response.json()
        alert(data.error || 'Error al eliminar')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
    } finally {
      setDeleting(null)
    }
  }

  const resetForm = () => {
    setNewClient({
      type: 'PERSONA_FISICA',
      nombreCompleto: '',
      razonSocial: '',
      email: '',
      phone: '',
      nif: '',
      cif: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'España'
    })
    setFormErrors({})
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = searchTerm === '' ||
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'all' || client.type === filterType

    return matchesSearch && matchesType
  })

  if (loading) {
    return <AnimatedLoadingSpinner text="Cargando clientes..." type="general" />
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Users className="h-7 w-7 text-violet-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
                  <p className="text-sm text-gray-600">
                    Propietarios y clientes para facturación
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setShowNewModal(true)}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Nuevo cliente
              </Button>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                  />
                </div>
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="all">Todos los tipos</option>
                <option value="PERSONA_FISICA">Persona Física</option>
                <option value="EMPRESA">Empresa / Autónomo</option>
              </select>
            </div>
          </motion.div>

          {/* Clients List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {filteredClients.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  {searchTerm || filterType !== 'all' ? (
                    <p className="text-gray-500">No se encontraron clientes</p>
                  ) : (
                    <>
                      <p className="text-gray-700 font-medium mb-2">No tienes clientes</p>
                      <p className="text-sm text-gray-500 mb-4">
                        Crea tu primer cliente para empezar a facturar
                      </p>
                      <Button
                        onClick={() => setShowNewModal(true)}
                        className="bg-violet-600 hover:bg-violet-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Crear cliente
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredClients.map(client => (
                  <Card key={client.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            client.type === 'EMPRESA' ? 'bg-violet-100' : 'bg-blue-100'
                          }`}>
                            {client.type === 'EMPRESA' ? (
                              <Briefcase className="w-6 h-6 text-violet-600" />
                            ) : (
                              <User className="w-6 h-6 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {client.name}
                              </h3>
                              <Badge className="text-xs" variant="secondary">
                                {client.type === 'EMPRESA' ? 'Empresa' : 'Persona'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                              {client.email && (
                                <span className="flex items-center">
                                  <Mail className="w-3 h-3 mr-1" />
                                  {client.email}
                                </span>
                              )}
                              {client.type === 'EMPRESA' && client.cif && (
                                <span>CIF: {client.cif}</span>
                              )}
                              {client.type === 'PERSONA_FISICA' && client.nif && (
                                <span>NIF: {client.nif}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right text-sm">
                            <div className="text-gray-500">
                              {client._count?.billingConfigs || 0} propiedades
                            </div>
                            <div className="text-gray-400 text-xs">
                              {client._count?.clientInvoices || 0} facturas
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            disabled={deleting === client.id}
                            className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                            title="Eliminar cliente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* New Client Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Nuevo Cliente
            </h3>

            {formErrors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {formErrors.general}
              </div>
            )}

            <div className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewClient({ ...newClient, type: 'PERSONA_FISICA' })}
                    className={`p-3 border rounded-lg flex items-center gap-2 transition-colors ${
                      newClient.type === 'PERSONA_FISICA'
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">Persona Física</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewClient({ ...newClient, type: 'EMPRESA' })}
                    className={`p-3 border rounded-lg flex items-center gap-2 transition-colors ${
                      newClient.type === 'EMPRESA'
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Briefcase className="w-5 h-5" />
                    <span className="text-sm font-medium">Empresa / Autónomo</span>
                  </button>
                </div>
              </div>

              {/* Name/RazonSocial */}
              {newClient.type === 'PERSONA_FISICA' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                  <input
                    type="text"
                    value={newClient.nombreCompleto}
                    onChange={(e) => setNewClient({ ...newClient, nombreCompleto: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${formErrors.nombreCompleto ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Juan García López"
                  />
                  {formErrors.nombreCompleto && <p className="mt-1 text-xs text-red-500">{formErrors.nombreCompleto}</p>}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razón social *</label>
                  <input
                    type="text"
                    value={newClient.razonSocial}
                    onChange={(e) => setNewClient({ ...newClient, razonSocial: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${formErrors.razonSocial ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Mi Empresa S.L."
                  />
                  {formErrors.razonSocial && <p className="mt-1 text-xs text-red-500">{formErrors.razonSocial}</p>}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${formErrors.email ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="email@ejemplo.com"
                />
                {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
              </div>

              {/* NIF/CIF */}
              {newClient.type === 'PERSONA_FISICA' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIF/NIE</label>
                  <input
                    type="text"
                    value={newClient.nif}
                    onChange={(e) => setNewClient({ ...newClient, nif: e.target.value.toUpperCase() })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${formErrors.nif ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="12345678A"
                    maxLength={9}
                  />
                  {formErrors.nif && <p className="mt-1 text-xs text-red-500">{formErrors.nif}</p>}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CIF</label>
                  <input
                    type="text"
                    value={newClient.cif}
                    onChange={(e) => setNewClient({ ...newClient, cif: e.target.value.toUpperCase() })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${formErrors.cif ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="A12345678"
                    maxLength={9}
                  />
                  {formErrors.cif && <p className="mt-1 text-xs text-red-500">{formErrors.cif}</p>}
                </div>
              )}

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="+34 600 000 000"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Calle, número, piso..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={newClient.city}
                    onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Madrid"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">C.P.</label>
                  <input
                    type="text"
                    value={newClient.postalCode}
                    onChange={(e) => setNewClient({ ...newClient, postalCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="28001"
                    maxLength={5}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewModal(false)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateClient}
                disabled={saving}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {saving ? 'Guardando...' : 'Crear cliente'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <DashboardFooter />
    </div>
  )
}
