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
import { useTranslation } from 'react-i18next'
import { Button, Card, CardContent, Badge } from '../../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardFooter } from '../../../../src/components/layout/DashboardFooter'

interface Client {
  id: string
  type: 'EMPRESA' | 'PERSONA_FISICA'
  retentionRate?: number | null
  firstName?: string
  lastName?: string
  companyName?: string
  email: string
  phone?: string
  nif?: string
  cif?: string
  iban?: string
  address: string
  city: string
  postalCode: string
  country: string
  propertiesCount?: number
}

export default function ClientesPage() {
  const { t } = useTranslation('gestion')
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Form state
  const [newClient, setNewClient] = useState({
    type: 'PERSONA_FISICA' as 'EMPRESA' | 'PERSONA_FISICA',
    retentionRate: '' as string | number,
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phone: '',
    nif: '',
    cif: '',
    iban: '',
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
      const response = await fetch('/api/gestion/owners', { credentials: 'include' })

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

  const getClientName = (client: Client): string => {
    if (client.type === 'EMPRESA') {
      return client.companyName || t('owners.card.company')
    }
    return `${client.firstName || ''} ${client.lastName || ''}`.trim() || t('owners.title')
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

  const validateIBAN = (iban: string): boolean => {
    if (!iban) return true
    // Remove spaces and convert to uppercase
    const cleanIban = iban.replace(/\s/g, '').toUpperCase()
    // Spanish IBAN: ES + 2 digits + 20 digits
    const ibanRegex = /^ES\d{22}$/
    return ibanRegex.test(cleanIban)
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (newClient.type === 'PERSONA_FISICA') {
      if (!newClient.firstName.trim() || !newClient.lastName.trim()) {
        errors.firstName = t('owners.validation.nameRequired')
      }
      if (newClient.nif && !validateNIF(newClient.nif)) {
        errors.nif = t('owners.validation.nifInvalid')
      }
    } else {
      if (!newClient.companyName.trim()) {
        errors.companyName = t('owners.validation.companyNameRequired')
      }
      if (newClient.cif && !validateCIF(newClient.cif)) {
        errors.cif = t('owners.validation.cifInvalid')
      }
    }

    if (newClient.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClient.email)) {
      errors.email = t('owners.validation.emailInvalid')
    }

    if (!newClient.address.trim()) {
      errors.address = t('owners.validation.addressRequired')
    }

    if (!newClient.city.trim()) {
      errors.city = t('owners.validation.cityRequired')
    }

    if (!newClient.postalCode.trim()) {
      errors.postalCode = t('owners.validation.postalCodeRequired')
    }

    if (newClient.iban && !validateIBAN(newClient.iban)) {
      errors.iban = t('owners.validation.ibanInvalid')
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveClient = async () => {
    if (!validateForm()) return

    try {
      setSaving(true)
      const payload = {
        type: newClient.type,
        retentionRate: newClient.retentionRate !== '' ? Number(newClient.retentionRate) : null,
        email: newClient.email,
        phone: newClient.phone || undefined,
        iban: newClient.iban ? newClient.iban.replace(/\s/g, '').toUpperCase() : undefined,
        address: newClient.address,
        city: newClient.city,
        postalCode: newClient.postalCode,
        country: newClient.country,
        ...(newClient.type === 'PERSONA_FISICA'
          ? { firstName: newClient.firstName, lastName: newClient.lastName, nif: newClient.nif || undefined }
          : { companyName: newClient.companyName, cif: newClient.cif || undefined }
        )
      }

      const url = editingClient
        ? `/api/gestion/owners/${editingClient.id}`
        : '/api/gestion/owners'

      const response = await fetch(url, {
        method: editingClient ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const data = await response.json()
        if (editingClient) {
          setClients(clients.map(c => c.id === editingClient.id ? data.owner : c))
        } else {
          setClients([...clients, data.owner])
        }
        resetForm()
        setShowModal(false)
      } else {
        const data = await response.json()
        setFormErrors({ general: data.error || (editingClient ? t('owners.errors.updateError') : t('owners.errors.createError')) })
      }
    } catch (error) {
      console.error('Error saving client:', error)
      setFormErrors({ general: t('owners.errors.connectionError') })
    } finally {
      setSaving(false)
    }
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setNewClient({
      type: client.type,
      retentionRate: client.retentionRate !== null && client.retentionRate !== undefined ? client.retentionRate : '',
      firstName: client.firstName || '',
      lastName: client.lastName || '',
      companyName: client.companyName || '',
      email: client.email || '',
      phone: client.phone || '',
      nif: client.nif || '',
      cif: client.cif || '',
      iban: client.iban || '',
      address: client.address || '',
      city: client.city || '',
      postalCode: client.postalCode || '',
      country: client.country || 'España'
    })
    setShowModal(true)
  }

  const handleDeleteClient = async (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    if ((client?.propertiesCount || 0) > 0) {
      alert(t('owners.errors.cannotDelete'))
      return
    }

    if (!confirm(t('owners.confirmDelete'))) return

    try {
      setDeleting(clientId)
      const response = await fetch(`/api/gestion/owners/${clientId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setClients(clients.filter(c => c.id !== clientId))
      } else {
        const data = await response.json()
        alert(data.error || t('owners.errors.deleteError'))
      }
    } catch (error) {
      console.error('Error deleting client:', error)
    } finally {
      setDeleting(null)
    }
  }

  const resetForm = () => {
    setEditingClient(null)
    setNewClient({
      type: 'PERSONA_FISICA',
      retentionRate: '',
      firstName: '',
      lastName: '',
      companyName: '',
      email: '',
      phone: '',
      nif: '',
      cif: '',
      iban: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'España'
    })
    setFormErrors({})
  }

  const filteredClients = clients.filter(client => {
    const clientName = getClientName(client).toLowerCase()
    const matchesSearch = searchTerm === '' ||
      clientName.includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'all' || client.type === filterType

    return matchesSearch && matchesType
  })

  if (loading) {
    return <AnimatedLoadingSpinner text={t('owners.loading')} type="general" />
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
                  <h1 className="text-2xl font-bold text-gray-900">{t('owners.title')}</h1>
                  <p className="text-sm text-gray-600">
                    {t('owners.subtitle')}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => { resetForm(); setShowModal(true) }}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                {t('owners.actions.new')}
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
                    placeholder={t('owners.search')}
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
                <option value="all">{t('owners.filters.allTypes')}</option>
                <option value="PERSONA_FISICA">{t('owners.filters.individual')}</option>
                <option value="EMPRESA">{t('owners.filters.company')}</option>
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
                <CardContent className="p-8">
                  {searchTerm || filterType !== 'all' ? (
                    <div className="text-center">
                      <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500">{t('owners.emptyState.noResults')}</p>
                    </div>
                  ) : (
                    <div className="max-w-md mx-auto">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="h-8 w-8 text-violet-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {t('owners.emptyState.title')}
                        </h3>
                        <p className="text-gray-600">
                          {t('owners.emptyState.description')}
                        </p>
                      </div>

                      {/* Steps */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm font-medium text-gray-700 mb-3">{t('owners.emptyState.flow.title')}</p>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-violet-600 text-white rounded-full flex items-center justify-center text-xs font-medium">1</span>
                            <span>{t('owners.emptyState.flow.step1')} <span className="text-violet-600 font-medium">{t('owners.emptyState.flow.step1Current')}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs font-medium">2</span>
                            <span>{t('owners.emptyState.flow.step2')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs font-medium">3</span>
                            <span>{t('owners.emptyState.flow.step3')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs font-medium">4</span>
                            <span>{t('owners.emptyState.flow.step4')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <Button
                          onClick={() => { resetForm(); setShowModal(true) }}
                          className="bg-violet-600 hover:bg-violet-700"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          {t('owners.actions.create')}
                        </Button>
                      </div>
                    </div>
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
                                {getClientName(client)}
                              </h3>
                              <Badge className="text-xs" variant="secondary">
                                {client.type === 'EMPRESA' ? t('owners.card.company') : t('owners.card.individual')}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
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
                              {client.iban && (
                                <span className="font-mono text-xs">IBAN: ...{client.iban.slice(-4)}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right text-sm">
                            <div className="text-gray-500">
                              {client.propertiesCount || 0} {t('owners.card.properties')}
                            </div>
                          </div>
                          <button
                            onClick={() => handleEditClient(client)}
                            className="p-2 text-gray-400 hover:text-violet-600 transition-colors"
                            title={t('owners.modal.edit')}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            disabled={deleting === client.id}
                            className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                            title={t('owners.confirmDelete')}
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

      {/* Client Modal (New/Edit) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingClient ? t('owners.modal.edit') : t('owners.modal.new')}
            </h3>

            {formErrors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {formErrors.general}
              </div>
            )}

            <div className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('owners.modal.type')}</label>
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
                    <span className="text-sm font-medium">{t('owners.modal.individual')}</span>
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
                    <span className="text-sm font-medium">{t('owners.modal.company')}</span>
                  </button>
                </div>
              </div>

              {/* Name/CompanyName */}
              {newClient.type === 'PERSONA_FISICA' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('owners.modal.firstName')} *</label>
                    <input
                      type="text"
                      value={newClient.firstName}
                      onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${formErrors.firstName ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="Juan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('owners.modal.lastName')} *</label>
                    <input
                      type="text"
                      value={newClient.lastName}
                      onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${formErrors.firstName ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="García López"
                    />
                  </div>
                  {formErrors.firstName && <p className="col-span-2 text-xs text-red-500">{formErrors.firstName}</p>}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('owners.modal.companyName')} *</label>
                  <input
                    type="text"
                    value={newClient.companyName}
                    onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${formErrors.companyName ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Mi Empresa S.L."
                  />
                  {formErrors.companyName && <p className="mt-1 text-xs text-red-500">{formErrors.companyName}</p>}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('owners.modal.email')}</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('owners.modal.nif')}</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('owners.modal.cif')}</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('owners.modal.phone')}</label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="+34 600 000 000"
                />
              </div>

              {/* Retention Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('owners.modal.retentionRate')}
                  <span className="text-gray-400 font-normal ml-1">
                    ({t('owners.modal.retentionRateHelp', {
                      defaultRate: newClient.type === 'EMPRESA' ? '15%' : '0%'
                    })})
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={newClient.retentionRate}
                    onChange={(e) => setNewClient({ ...newClient, retentionRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">{t('owners.modal.retentionDefault')}</option>
                    <option value="0">0% - {t('owners.modal.retentionNone')}</option>
                    <option value="7">7% - {t('owners.modal.retentionNew')}</option>
                    <option value="15">15% - {t('owners.modal.retentionStandard')}</option>
                    <option value="19">19% - {t('owners.modal.retentionRental')}</option>
                  </select>
                </div>
              </div>

              {/* IBAN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('owners.modal.iban')} <span className="text-gray-400 font-normal">{t('owners.modal.ibanHelp')}</span>
                </label>
                <input
                  type="text"
                  value={newClient.iban}
                  onChange={(e) => {
                    // Format IBAN with spaces every 4 characters
                    const value = e.target.value.replace(/\s/g, '').toUpperCase()
                    const formatted = value.replace(/(.{4})/g, '$1 ').trim()
                    setNewClient({ ...newClient, iban: formatted })
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono ${formErrors.iban ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="ES00 0000 0000 0000 0000 0000"
                  maxLength={29}
                />
                {formErrors.iban && <p className="mt-1 text-xs text-red-500">{formErrors.iban}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('owners.modal.address')} *</label>
                <input
                  type="text"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${formErrors.address ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Calle, número, piso..."
                />
                {formErrors.address && <p className="mt-1 text-xs text-red-500">{formErrors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('owners.modal.city')} *</label>
                  <input
                    type="text"
                    value={newClient.city}
                    onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${formErrors.city ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Madrid"
                  />
                  {formErrors.city && <p className="mt-1 text-xs text-red-500">{formErrors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('owners.modal.postalCode')} *</label>
                  <input
                    type="text"
                    value={newClient.postalCode}
                    onChange={(e) => setNewClient({ ...newClient, postalCode: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${formErrors.postalCode ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="28001"
                    maxLength={10}
                  />
                  {formErrors.postalCode && <p className="mt-1 text-xs text-red-500">{formErrors.postalCode}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleSaveClient}
                disabled={saving}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {saving ? t('owners.actions.saving') : editingClient ? t('owners.actions.saveChanges') : t('owners.actions.create')}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <DashboardFooter />
    </div>
  )
}
