'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  User,
  Plus,
  Edit2,
  Percent,
  Home,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Camera
} from 'lucide-react'
import Link from 'next/link'
import { Button, Card, CardContent, Badge } from '../../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardFooter } from '../../../../src/components/layout/DashboardFooter'

interface Owner {
  id: string
  type: 'PERSONA_FISICA' | 'EMPRESA'
  firstName?: string
  lastName?: string
  companyName?: string
  nif?: string
  cif?: string
  email: string
}

interface Property {
  id: string
  name: string
  city: string
  profileImage?: string
  billingConfig?: {
    id: string
    ownerId?: string
    owner?: Owner
    airbnbName?: string
    bookingName?: string
    incomeReceiver: 'OWNER' | 'MANAGER'
    commissionType: string
    commissionValue: number
    commissionVat: number
    cleaningType: string
    cleaningValue: number
    cleaningFeeRecipient: 'OWNER' | 'MANAGER' | 'SPLIT'
    cleaningFeeSplitPct?: number
    monthlyFee: number
    defaultVatRate: number
    defaultRetentionRate: number
    invoiceDetailLevel: 'DETAILED' | 'SUMMARY'
  }
}

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<Property[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState<string | null>(null)

  // Edit state
  const [editingConfig, setEditingConfig] = useState<{
    propertyId: string
    profileImage: string
    ownerId: string
    incomeReceiver: 'OWNER' | 'MANAGER'
    commissionType: string
    commissionValue: string
    commissionVat: string
    cleaningType: string
    cleaningValue: string
    cleaningFeeRecipient: 'OWNER' | 'MANAGER' | 'SPLIT'
    cleaningFeeSplitPct: string
    monthlyFee: string
    monthlyFeeVat: string
    monthlyFeeConcept: string
    // Tax rates
    defaultVatRate: string
    defaultRetentionRate: string
    invoiceDetailLevel: 'DETAILED' | 'SUMMARY'
  } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [propertiesRes, ownersRes] = await Promise.all([
        fetch('/api/gestion/properties-config', { credentials: 'include' }),
        fetch('/api/gestion/owners', { credentials: 'include' })
      ])

      if (propertiesRes.ok) {
        const data = await propertiesRes.json()
        setProperties(data.properties || [])
      }

      if (ownersRes.ok) {
        const data = await ownersRes.json()
        setOwners(data.owners || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (property: Property) => {
    const config = property.billingConfig
    setEditingConfig({
      propertyId: property.id,
      profileImage: property.profileImage || '',
      ownerId: config?.ownerId || '',
      incomeReceiver: config?.incomeReceiver || 'OWNER',
      commissionType: config?.commissionType || 'PERCENTAGE',
      commissionValue: config?.commissionValue?.toString() || '15',
      commissionVat: config?.commissionVat?.toString() || '21',
      cleaningType: config?.cleaningType || 'FIXED_PER_RESERVATION',
      cleaningValue: config?.cleaningValue?.toString() || '0',
      cleaningFeeRecipient: config?.cleaningFeeRecipient || 'MANAGER',
      cleaningFeeSplitPct: config?.cleaningFeeSplitPct?.toString() || '',
      monthlyFee: config?.monthlyFee?.toString() || '0',
      monthlyFeeVat: '21',
      monthlyFeeConcept: '',
      defaultVatRate: config?.defaultVatRate?.toString() || '21',
      defaultRetentionRate: config?.defaultRetentionRate?.toString() || '0',
      invoiceDetailLevel: config?.invoiceDetailLevel || 'DETAILED'
    })
    setExpandedProperty(property.id)
  }

  const cancelEditing = () => {
    setEditingConfig(null)
  }

  const handleImageUpload = async (propertyId: string, file: File) => {
    setUploadingImage(propertyId)
    try {
      // Upload file first
      const formData = new FormData()
      formData.append('file', file)
      formData.append('variant', 'property')

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (!uploadRes.ok) {
        throw new Error('Error uploading file')
      }

      const uploadData = await uploadRes.json()
      const imageUrl = uploadData.url

      // Update property with new image
      const response = await fetch(`/api/gestion/properties/${propertyId}/image`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ profileImage: imageUrl })
      })

      if (response.ok) {
        if (editingConfig?.propertyId === propertyId) {
          setEditingConfig(prev => prev ? { ...prev, profileImage: imageUrl } : null)
        }
        fetchData()
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setUploadingImage(null)
    }
  }

  const saveConfig = async () => {
    if (!editingConfig) return

    setSaving(editingConfig.propertyId)
    try {
      const response = await fetch(`/api/gestion/properties/${editingConfig.propertyId}/billing-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ownerId: editingConfig.ownerId || null,
          incomeReceiver: editingConfig.incomeReceiver,
          commissionType: editingConfig.commissionType,
          commissionValue: parseFloat(editingConfig.commissionValue) || 0,
          commissionVat: parseFloat(editingConfig.commissionVat) || 21,
          cleaningType: editingConfig.cleaningType,
          cleaningValue: parseFloat(editingConfig.cleaningValue) || 0,
          cleaningFeeRecipient: editingConfig.cleaningFeeRecipient,
          cleaningFeeSplitPct: editingConfig.cleaningFeeSplitPct ? parseFloat(editingConfig.cleaningFeeSplitPct) : null,
          monthlyFee: parseFloat(editingConfig.monthlyFee) || 0,
          monthlyFeeVat: parseFloat(editingConfig.monthlyFeeVat) || 21,
          monthlyFeeConcept: editingConfig.monthlyFeeConcept || null,
          defaultVatRate: parseFloat(editingConfig.defaultVatRate) || 21,
          defaultRetentionRate: parseFloat(editingConfig.defaultRetentionRate) || 0,
          invoiceDetailLevel: editingConfig.invoiceDetailLevel
        })
      })

      if (response.ok) {
        setEditingConfig(null)
        fetchData()
      }
    } catch (error) {
      console.error('Error saving config:', error)
    } finally {
      setSaving(null)
    }
  }

  const getOwnerName = (owner?: Owner) => {
    if (!owner) return 'Sin asignar'
    if (owner.type === 'EMPRESA') return owner.companyName || 'Empresa'
    return `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || 'Persona física'
  }

  const configuredCount = properties.filter(p => p.billingConfig?.ownerId).length

  const getPropertyStatus = (property: Property) => {
    if (!property.billingConfig) {
      return { status: 'pending', label: 'Sin configurar', color: 'bg-red-100 text-red-700' }
    }
    if (!property.billingConfig.ownerId) {
      return { status: 'incomplete', label: 'Sin propietario', color: 'bg-yellow-100 text-yellow-700' }
    }
    return { status: 'complete', label: 'Configurada', color: 'bg-green-100 text-green-700' }
  }

  if (loading) {
    return <AnimatedLoadingSpinner text="Cargando configuración..." type="general" />
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Home className="h-7 w-7 text-violet-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Apartamentos</h1>
                  <p className="text-sm text-gray-600">
                    Asigna propietarios y configura comisiones
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {properties.length > 0 && (
                  <Badge className={configuredCount === properties.length ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                    {configuredCount === properties.length ? (
                      <><Check className="w-3 h-3 mr-1" /> Todas configuradas</>
                    ) : (
                      <>{configuredCount}/{properties.length} configuradas</>
                    )}
                  </Badge>
                )}
                <Link href="/properties/new">
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo apartamento
                  </Button>
                </Link>
                <Link href="/gestion/clientes">
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Propietarios
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Info Card - No owners */}
          {owners.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6"
            >
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Primero crea tus propietarios</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Antes de configurar las propiedades, debes crear los propietarios en la sección de Propietarios.
                      </p>
                      <Link href="/gestion/clientes">
                        <Button size="sm" className="mt-3 bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Crear propietario
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Status Summary - Show when there are unconfigured properties */}
          {owners.length > 0 && properties.length > 0 && configuredCount < properties.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6"
            >
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-yellow-800">
                        {properties.length - configuredCount} {properties.length - configuredCount === 1 ? 'propiedad necesita' : 'propiedades necesitan'} propietario
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Para poder generar facturas, cada propiedad debe tener un propietario asignado.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {properties
                          .filter(p => !p.billingConfig?.ownerId)
                          .map(p => (
                            <button
                              key={p.id}
                              onClick={() => startEditing(p)}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-yellow-300 rounded text-sm text-yellow-800 hover:bg-yellow-100 transition-colors"
                            >
                              <Home className="w-3 h-3" />
                              {p.name}
                            </button>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Properties List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {properties.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Home className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-700 font-medium mb-2">No tienes apartamentos</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Crea tu primer apartamento para poder configurar la facturación y gestionar reservas.
                  </p>
                  <Link href="/properties/new">
                    <Button className="bg-violet-600 hover:bg-violet-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Crear apartamento
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {properties.map((property, index) => {
                  const isEditing = editingConfig?.propertyId === property.id
                  const isExpanded = expandedProperty === property.id
                  const propertyStatus = getPropertyStatus(property)

                  return (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className={`${propertyStatus.status === 'complete' ? 'border-l-4 border-l-green-500' : propertyStatus.status === 'incomplete' ? 'border-l-4 border-l-yellow-400' : 'border-l-4 border-l-red-400'}`}>
                        <CardContent className="p-0">
                          {/* Property Header */}
                          <div
                            className="p-4 flex items-center justify-between cursor-pointer"
                            onClick={() => setExpandedProperty(isExpanded ? null : property.id)}
                          >
                            <div className="flex items-center gap-4">
                              {/* Property Image with Upload */}
                              <div className="relative group">
                                {property.profileImage ? (
                                  <img
                                    src={property.profileImage}
                                    alt={property.name}
                                    className="w-14 h-14 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Home className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                                {/* Upload overlay */}
                                <label
                                  className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) handleImageUpload(property.id, file)
                                    }}
                                    disabled={uploadingImage === property.id}
                                  />
                                  {uploadingImage === property.id ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Camera className="w-5 h-5 text-white" />
                                  )}
                                </label>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{property.name}</h3>
                                <p className="text-sm text-gray-500">{property.city}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {/* Status badge */}
                                  <Badge className={`${propertyStatus.color} text-xs`}>
                                    {propertyStatus.status === 'complete' ? (
                                      <Check className="w-3 h-3 mr-1" />
                                    ) : (
                                      <AlertCircle className="w-3 h-3 mr-1" />
                                    )}
                                    {propertyStatus.label}
                                  </Badge>
                                  {/* Owner name if configured */}
                                  {property.billingConfig?.ownerId && (
                                    <Badge className="bg-gray-100 text-gray-700 text-xs">
                                      <User className="w-3 h-3 mr-1" />
                                      {getOwnerName(property.billingConfig?.owner)}
                                    </Badge>
                                  )}
                                  {/* Commission if configured */}
                                  {property.billingConfig && property.billingConfig.commissionValue > 0 && (
                                    <Badge className="bg-violet-100 text-violet-700 text-xs">
                                      <Percent className="w-3 h-3 mr-1" />
                                      {property.billingConfig.commissionValue}%
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!isEditing && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); startEditing(property) }}
                                >
                                  <Edit2 className="w-4 h-4 mr-1" />
                                  Configurar
                                </Button>
                              )}
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>

                          {/* Expanded Config Form */}
                          {isExpanded && isEditing && (
                            <div className="border-t border-gray-200 p-4 bg-gray-50">
                              <div className="grid sm:grid-cols-2 gap-4">
                                {/* Owner Selection */}
                                <div className="sm:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Propietario
                                  </label>
                                  <select
                                    value={editingConfig.ownerId}
                                    onChange={(e) => setEditingConfig(prev => prev ? { ...prev, ownerId: e.target.value } : null)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                  >
                                    <option value="">Sin propietario (propiedad propia)</option>
                                    {owners.map(owner => (
                                      <option key={owner.id} value={owner.id}>
                                        {getOwnerName(owner)} - {owner.type === 'EMPRESA' ? owner.cif : owner.nif}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Income Receiver */}
                                <div className="sm:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ¿Quién cobra las reservas?
                                  </label>
                                  <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        checked={editingConfig.incomeReceiver === 'OWNER'}
                                        onChange={() => setEditingConfig(prev => prev ? { ...prev, incomeReceiver: 'OWNER' } : null)}
                                        className="text-violet-600 focus:ring-violet-500"
                                      />
                                      <span className="text-sm">Propietario (tú facturas servicios)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        checked={editingConfig.incomeReceiver === 'MANAGER'}
                                        onChange={() => setEditingConfig(prev => prev ? { ...prev, incomeReceiver: 'MANAGER' } : null)}
                                        className="text-violet-600 focus:ring-violet-500"
                                      />
                                      <span className="text-sm">Gestor (tú transfieres al propietario)</span>
                                    </label>
                                  </div>
                                </div>

                                {/* Commission */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de comisión
                                  </label>
                                  <select
                                    value={editingConfig.commissionType}
                                    onChange={(e) => setEditingConfig(prev => prev ? { ...prev, commissionType: e.target.value } : null)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                  >
                                    <option value="PERCENTAGE">Porcentaje</option>
                                    <option value="FIXED_PER_RESERVATION">Fijo por reserva</option>
                                    <option value="FIXED_MONTHLY">Fijo mensual</option>
                                    <option value="NONE">Sin comisión</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {editingConfig.commissionType === 'PERCENTAGE' ? 'Porcentaje (%)' : 'Importe (€)'}
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editingConfig.commissionValue}
                                    onChange={(e) => setEditingConfig(prev => prev ? { ...prev, commissionValue: e.target.value } : null)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                  />
                                </div>

                                {/* Cleaning */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Limpieza
                                  </label>
                                  <select
                                    value={editingConfig.cleaningType}
                                    onChange={(e) => setEditingConfig(prev => prev ? { ...prev, cleaningType: e.target.value } : null)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                  >
                                    <option value="FIXED_PER_RESERVATION">Fijo por reserva</option>
                                    <option value="PER_NIGHT">Por noche</option>
                                    <option value="NONE">Sin limpieza</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Importe limpieza (€)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editingConfig.cleaningValue}
                                    onChange={(e) => setEditingConfig(prev => prev ? { ...prev, cleaningValue: e.target.value } : null)}
                                    disabled={editingConfig.cleaningType === 'NONE'}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-100"
                                  />
                                </div>

                                {/* Cleaning Fee Recipient */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ¿Quién recibe la limpieza?
                                  </label>
                                  <select
                                    value={editingConfig.cleaningFeeRecipient}
                                    onChange={(e) => setEditingConfig(prev => prev ? { ...prev, cleaningFeeRecipient: e.target.value as 'OWNER' | 'MANAGER' | 'SPLIT' } : null)}
                                    disabled={editingConfig.cleaningType === 'NONE'}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-100"
                                  >
                                    <option value="MANAGER">Gestor (yo)</option>
                                    <option value="OWNER">Propietario</option>
                                    <option value="SPLIT">Repartir</option>
                                  </select>
                                </div>

                                {editingConfig.cleaningFeeRecipient === 'SPLIT' && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      % limpieza para gestor
                                    </label>
                                    <input
                                      type="number"
                                      step="1"
                                      min="0"
                                      max="100"
                                      value={editingConfig.cleaningFeeSplitPct}
                                      onChange={(e) => setEditingConfig(prev => prev ? { ...prev, cleaningFeeSplitPct: e.target.value } : null)}
                                      placeholder="50"
                                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                  </div>
                                )}

                                {/* Monthly Fee */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cuota mensual (€)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editingConfig.monthlyFee}
                                    onChange={(e) => setEditingConfig(prev => prev ? { ...prev, monthlyFee: e.target.value } : null)}
                                    placeholder="0.00"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    IVA comisión (%)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editingConfig.commissionVat}
                                    onChange={(e) => setEditingConfig(prev => prev ? { ...prev, commissionVat: e.target.value } : null)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                  />
                                </div>

                                {/* Tax Rates */}
                                <div className="sm:col-span-2 border-t border-gray-200 pt-4 mt-2">
                                  <p className="text-sm font-medium text-gray-700 mb-3">Fiscalidad por defecto</p>
                                  <div className="grid sm:grid-cols-3 gap-4">
                                    <div>
                                      <label className="block text-sm text-gray-600 mb-1">
                                        IVA por defecto (%)
                                      </label>
                                      <select
                                        value={editingConfig.defaultVatRate}
                                        onChange={(e) => setEditingConfig(prev => prev ? { ...prev, defaultVatRate: e.target.value } : null)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                      >
                                        <option value="21">21% (General)</option>
                                        <option value="10">10% (Reducido)</option>
                                        <option value="0">0% (Exento)</option>
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-sm text-gray-600 mb-1">
                                        Detalle en factura
                                      </label>
                                      <select
                                        value={editingConfig.invoiceDetailLevel}
                                        onChange={(e) => setEditingConfig(prev => prev ? { ...prev, invoiceDetailLevel: e.target.value as 'DETAILED' | 'SUMMARY' } : null)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                      >
                                        <option value="DETAILED">Detallado (una línea por reserva)</option>
                                        <option value="SUMMARY">Resumido (total del periodo)</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex justify-end gap-3 mt-6">
                                <Button
                                  variant="outline"
                                  onClick={cancelEditing}
                                  disabled={saving === property.id}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={saveConfig}
                                  disabled={saving === property.id}
                                  className="bg-violet-600 hover:bg-violet-700"
                                >
                                  {saving === property.id ? (
                                    'Guardando...'
                                  ) : (
                                    <>
                                      <Check className="w-4 h-4 mr-2" />
                                      Guardar
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Expanded Info (not editing) */}
                          {isExpanded && !isEditing && property.billingConfig && (
                            <div className="border-t border-gray-200 p-4 bg-gray-50">
                              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Modelo de cobro</p>
                                  <p className="font-medium">
                                    {property.billingConfig.incomeReceiver === 'OWNER'
                                      ? 'Propietario cobra'
                                      : 'Gestor cobra'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Comisión</p>
                                  <p className="font-medium">
                                    {property.billingConfig.commissionValue}% + {property.billingConfig.commissionVat}% IVA
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Limpieza</p>
                                  <p className="font-medium">
                                    {property.billingConfig.cleaningType === 'NONE'
                                      ? 'Sin limpieza'
                                      : `${property.billingConfig.cleaningValue}€`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  )
}
