'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Home,
  User,
  Plus,
  Edit2,
  Percent,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Camera,
  Trash2,
  X
} from 'lucide-react'
import Link from 'next/link'
import { Button, Card, CardContent, Badge } from '../../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardFooter } from '../../../../src/components/layout/DashboardFooter'

interface Owner {
  id: string
  name: string
}

interface BillingUnit {
  id: string
  name: string
  city: string | null
  imageUrl: string | null
  ownerId: string | null
  owner: Owner | null
  commissionType: string
  commissionValue: number
  cleaningValue: number
  airbnbNames: string[]
  bookingNames: string[]
  vrboNames: string[]
  reservationsCount: number
  expensesCount: number
  invoicesCount: number
  isActive: boolean
  createdAt: string
}

interface OwnerFull {
  id: string
  type: 'PERSONA_FISICA' | 'EMPRESA'
  firstName?: string
  lastName?: string
  companyName?: string
  nif?: string
  cif?: string
  email: string
}

interface EditForm {
  id: string | null // null = nuevo
  name: string
  city: string
  imageUrl: string
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
  defaultVatRate: string
  defaultRetentionRate: string
  invoiceDetailLevel: 'DETAILED' | 'SUMMARY'
}

const emptyForm: EditForm = {
  id: null,
  name: '',
  city: '',
  imageUrl: '',
  ownerId: '',
  incomeReceiver: 'OWNER',
  commissionType: 'PERCENTAGE',
  commissionValue: '15',
  commissionVat: '21',
  cleaningType: 'FIXED_PER_RESERVATION',
  cleaningValue: '0',
  cleaningFeeRecipient: 'MANAGER',
  cleaningFeeSplitPct: '',
  monthlyFee: '0',
  monthlyFeeVat: '21',
  defaultVatRate: '21',
  defaultRetentionRate: '0',
  invoiceDetailLevel: 'DETAILED'
}

export default function ApartamentosPage() {
  const [loading, setLoading] = useState(true)
  const [billingUnits, setBillingUnits] = useState<BillingUnit[]>([])
  const [owners, setOwners] = useState<OwnerFull[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditForm | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [unitsRes, ownersRes] = await Promise.all([
        fetch('/api/gestion/billing-units', { credentials: 'include' }),
        fetch('/api/gestion/owners', { credentials: 'include' })
      ])

      if (unitsRes.ok) {
        const data = await unitsRes.json()
        setBillingUnits(data.billingUnits || [])
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

  const startEditing = (unit: BillingUnit) => {
    setEditForm({
      id: unit.id,
      name: unit.name || '',
      city: unit.city || '',
      imageUrl: unit.imageUrl || '',
      ownerId: unit.ownerId || '',
      incomeReceiver: 'OWNER',
      commissionType: unit.commissionType || 'PERCENTAGE',
      commissionValue: unit.commissionValue?.toString() || '15',
      commissionVat: '21',
      cleaningType: 'FIXED_PER_RESERVATION',
      cleaningValue: unit.cleaningValue?.toString() || '0',
      cleaningFeeRecipient: 'MANAGER',
      cleaningFeeSplitPct: '',
      monthlyFee: '0',
      monthlyFeeVat: '21',
      defaultVatRate: '21',
      defaultRetentionRate: '0',
      invoiceDetailLevel: 'DETAILED'
    })
    setExpandedId(unit.id)
    setShowNewForm(false)
  }

  const startNew = () => {
    setEditForm({ ...emptyForm })
    setShowNewForm(true)
    setExpandedId(null)
  }

  const cancelEditing = () => {
    setEditForm(null)
    setShowNewForm(false)
  }

  const saveUnit = async () => {
    if (!editForm) return

    setSaving(true)
    try {
      const payload = {
        name: editForm.name.trim(),
        city: editForm.city.trim() || null,
        imageUrl: editForm.imageUrl || null,
        ownerId: editForm.ownerId || null,
        incomeReceiver: editForm.incomeReceiver,
        commissionType: editForm.commissionType,
        commissionValue: parseFloat(editForm.commissionValue) || 0,
        commissionVat: parseFloat(editForm.commissionVat) || 21,
        cleaningType: editForm.cleaningType,
        cleaningValue: parseFloat(editForm.cleaningValue) || 0,
        cleaningFeeRecipient: editForm.cleaningFeeRecipient,
        cleaningFeeSplitPct: editForm.cleaningFeeSplitPct ? parseFloat(editForm.cleaningFeeSplitPct) : null,
        monthlyFee: parseFloat(editForm.monthlyFee) || 0,
        monthlyFeeVat: parseFloat(editForm.monthlyFeeVat) || 21,
        defaultVatRate: parseFloat(editForm.defaultVatRate) || 21,
        defaultRetentionRate: parseFloat(editForm.defaultRetentionRate) || 0,
        invoiceDetailLevel: editForm.invoiceDetailLevel
      }

      const isNew = !editForm.id
      const url = isNew
        ? '/api/gestion/billing-units'
        : `/api/gestion/billing-units/${editForm.id}`

      const response = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setEditForm(null)
        setShowNewForm(false)
        fetchData()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al guardar')
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const deleteUnit = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este apartamento?')) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/gestion/billing-units/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        fetchData()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al eliminar')
      }
    } catch (error) {
      console.error('Error deleting:', error)
    } finally {
      setDeleting(null)
    }
  }

  const getOwnerName = (owner?: OwnerFull) => {
    if (!owner) return 'Sin asignar'
    if (owner.type === 'EMPRESA') return owner.companyName || 'Empresa'
    return `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || 'Persona física'
  }

  const configuredCount = billingUnits.filter(u => u.ownerId).length

  const getUnitStatus = (unit: BillingUnit) => {
    if (!unit.ownerId) {
      return { status: 'incomplete', label: 'Sin propietario', color: 'bg-yellow-100 text-yellow-700' }
    }
    return { status: 'complete', label: 'Configurado', color: 'bg-green-100 text-green-700' }
  }

  if (loading) {
    return <AnimatedLoadingSpinner text="Cargando apartamentos..." type="general" />
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
                    Gestiona tus apartamentos y configura comisiones
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {billingUnits.length > 0 && (
                  <Badge className={configuredCount === billingUnits.length ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                    {configuredCount === billingUnits.length ? (
                      <><Check className="w-3 h-3 mr-1" /> Todos configurados</>
                    ) : (
                      <>{configuredCount}/{billingUnits.length} configurados</>
                    )}
                  </Badge>
                )}
                <Button
                  onClick={startNew}
                  className="bg-violet-600 hover:bg-violet-700"
                  disabled={showNewForm}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo apartamento
                </Button>
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
                        Antes de configurar los apartamentos, debes crear los propietarios.
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

          {/* New Apartment Form */}
          {showNewForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="border-2 border-violet-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-violet-600" />
                      Nuevo apartamento
                    </h3>
                    <button onClick={cancelEditing} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {renderForm()}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Apartments List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {billingUnits.length === 0 && !showNewForm ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Home className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-700 font-medium mb-2">No tienes apartamentos</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Crea tu primer apartamento para empezar a gestionar reservas y facturación.
                  </p>
                  <Button onClick={startNew} className="bg-violet-600 hover:bg-violet-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear apartamento
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {billingUnits.map((unit, index) => {
                  const isEditing = editForm?.id === unit.id
                  const isExpanded = expandedId === unit.id
                  const unitStatus = getUnitStatus(unit)

                  return (
                    <motion.div
                      key={unit.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className={`${unitStatus.status === 'complete' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-yellow-400'}`}>
                        <CardContent className="p-0">
                          {/* Unit Header */}
                          <div
                            className="p-4 flex items-center justify-between cursor-pointer"
                            onClick={() => setExpandedId(isExpanded ? null : unit.id)}
                          >
                            <div className="flex items-center gap-4">
                              {/* Image */}
                              <div className="relative">
                                {unit.imageUrl ? (
                                  <img
                                    src={unit.imageUrl}
                                    alt={unit.name}
                                    className="w-14 h-14 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Home className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{unit.name}</h3>
                                <p className="text-sm text-gray-500">{unit.city || 'Sin ciudad'}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <Badge className={`${unitStatus.color} text-xs`}>
                                    {unitStatus.status === 'complete' ? (
                                      <Check className="w-3 h-3 mr-1" />
                                    ) : (
                                      <AlertCircle className="w-3 h-3 mr-1" />
                                    )}
                                    {unitStatus.label}
                                  </Badge>
                                  {unit.owner && (
                                    <Badge className="bg-gray-100 text-gray-700 text-xs">
                                      <User className="w-3 h-3 mr-1" />
                                      {unit.owner.name}
                                    </Badge>
                                  )}
                                  {unit.commissionValue > 0 && (
                                    <Badge className="bg-violet-100 text-violet-700 text-xs">
                                      <Percent className="w-3 h-3 mr-1" />
                                      {unit.commissionValue}%
                                    </Badge>
                                  )}
                                  {unit.reservationsCount > 0 && (
                                    <Badge className="bg-blue-100 text-blue-700 text-xs">
                                      {unit.reservationsCount} reservas
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!isEditing && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); startEditing(unit) }}
                                  >
                                    <Edit2 className="w-4 h-4 mr-1" />
                                    Editar
                                  </Button>
                                  {unit.invoicesCount === 0 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => { e.stopPropagation(); deleteUnit(unit.id) }}
                                      disabled={deleting === unit.id}
                                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                                    >
                                      {deleting === unit.id ? (
                                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <Trash2 className="w-4 h-4" />
                                      )}
                                    </Button>
                                  )}
                                </>
                              )}
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>

                          {/* Expanded Edit Form */}
                          {isExpanded && isEditing && (
                            <div className="border-t border-gray-200 p-4 bg-gray-50">
                              {renderForm()}
                            </div>
                          )}

                          {/* Expanded Info (not editing) */}
                          {isExpanded && !isEditing && (
                            <div className="border-t border-gray-200 p-4 bg-gray-50">
                              <div className="grid sm:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Comisión</p>
                                  <p className="font-medium">{unit.commissionValue}%</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Limpieza</p>
                                  <p className="font-medium">{unit.cleaningValue}€</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Reservas</p>
                                  <p className="font-medium">{unit.reservationsCount}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Facturas</p>
                                  <p className="font-medium">{unit.invoicesCount}</p>
                                </div>
                              </div>
                              {/* Platform names */}
                              {(unit.airbnbNames.length > 0 || unit.bookingNames.length > 0) && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <p className="text-sm text-gray-500 mb-2">Nombres en plataformas (para matching):</p>
                                  <div className="flex flex-wrap gap-2">
                                    {unit.airbnbNames.map((name, i) => (
                                      <Badge key={`airbnb-${i}`} className="bg-red-100 text-red-700 text-xs">
                                        Airbnb: {name}
                                      </Badge>
                                    ))}
                                    {unit.bookingNames.map((name, i) => (
                                      <Badge key={`booking-${i}`} className="bg-blue-100 text-blue-700 text-xs">
                                        Booking: {name}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
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

  function renderForm() {
    if (!editForm) return null

    return (
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del apartamento *
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm(prev => prev ? { ...prev, name: e.target.value } : null)}
              placeholder="Ej: Apartamento Centro"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad
            </label>
            <input
              type="text"
              value={editForm.city}
              onChange={(e) => setEditForm(prev => prev ? { ...prev, city: e.target.value } : null)}
              placeholder="Ej: Madrid"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Owner */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Propietario
            </label>
            <select
              value={editForm.ownerId}
              onChange={(e) => setEditForm(prev => prev ? { ...prev, ownerId: e.target.value } : null)}
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
                  checked={editForm.incomeReceiver === 'OWNER'}
                  onChange={() => setEditForm(prev => prev ? { ...prev, incomeReceiver: 'OWNER' } : null)}
                  className="text-violet-600 focus:ring-violet-500"
                />
                <span className="text-sm">Propietario (tú facturas servicios)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={editForm.incomeReceiver === 'MANAGER'}
                  onChange={() => setEditForm(prev => prev ? { ...prev, incomeReceiver: 'MANAGER' } : null)}
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
              value={editForm.commissionType}
              onChange={(e) => setEditForm(prev => prev ? { ...prev, commissionType: e.target.value } : null)}
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
              {editForm.commissionType === 'PERCENTAGE' ? 'Porcentaje (%)' : 'Importe (€)'}
            </label>
            <input
              type="number"
              step="0.01"
              value={editForm.commissionValue}
              onChange={(e) => setEditForm(prev => prev ? { ...prev, commissionValue: e.target.value } : null)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Cleaning */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limpieza
            </label>
            <select
              value={editForm.cleaningType}
              onChange={(e) => setEditForm(prev => prev ? { ...prev, cleaningType: e.target.value } : null)}
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
              value={editForm.cleaningValue}
              onChange={(e) => setEditForm(prev => prev ? { ...prev, cleaningValue: e.target.value } : null)}
              disabled={editForm.cleaningType === 'NONE'}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-100"
            />
          </div>

          {/* Cleaning Fee Recipient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ¿Quién recibe la limpieza?
            </label>
            <select
              value={editForm.cleaningFeeRecipient}
              onChange={(e) => setEditForm(prev => prev ? { ...prev, cleaningFeeRecipient: e.target.value as 'OWNER' | 'MANAGER' | 'SPLIT' } : null)}
              disabled={editForm.cleaningType === 'NONE'}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-gray-100"
            >
              <option value="MANAGER">Gestor (yo)</option>
              <option value="OWNER">Propietario</option>
              <option value="SPLIT">Repartir</option>
            </select>
          </div>

          {/* Monthly Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cuota mensual (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={editForm.monthlyFee}
              onChange={(e) => setEditForm(prev => prev ? { ...prev, monthlyFee: e.target.value } : null)}
              placeholder="0.00"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={cancelEditing}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={saveUnit}
            disabled={saving || !editForm.name.trim()}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {saving ? (
              'Guardando...'
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                {editForm.id ? 'Guardar cambios' : 'Crear apartamento'}
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }
}
