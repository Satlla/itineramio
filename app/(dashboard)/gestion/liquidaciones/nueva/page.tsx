'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Receipt,
  User,
  Calendar,
  Building2,
  ChevronRight,
  Home,
  Euro,
  Loader2,
  Check,
  AlertCircle,
  Layers
} from 'lucide-react'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import { AnimatedLoadingSpinner } from '@/components/ui/AnimatedLoadingSpinner'
import { formatCurrency } from '@/lib/format'

interface Owner {
  id: string
  type: 'PERSONA_FISICA' | 'EMPRESA'
  firstName?: string
  lastName?: string
  companyName?: string
  email: string
}

interface BillingUnitGroup {
  id: string
  name: string
  imageUrl?: string
  ownerId: string
  billingUnits: { id: string; name: string; city?: string; imageUrl?: string }[]
  unitsCount: number
}

interface BillingUnit {
  id: string
  name: string
  city?: string
  imageUrl?: string
  ownerId?: string
  groupId?: string
}

interface PreviewData {
  reservations: {
    id: string
    confirmationCode: string
    guestName: string
    checkIn: string
    checkOut: string
    nights: number
    hostEarnings: number
    property: string
    billingUnitId?: string
  }[]
  expenses: {
    id: string
    date: string
    concept: string
    category: string
    amount: number
    vatAmount: number
    property: string
    billingUnitId?: string
  }[]
  totals: {
    totalIncome: number
    totalCommission: number
    totalCommissionVat: number
    totalCleaning: number
    totalExpenses: number
    totalAmount: number
  }
  byUnit?: {
    unitId: string
    unitName: string
    reservationsCount: number
    totalIncome: number
  }[]
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

type Step = 'select-owner' | 'select-period' | 'preview' | 'generating'

export default function NuevaLiquidacionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [step, setStep] = useState<Step>('select-owner')

  // Data
  const [owners, setOwners] = useState<Owner[]>([])
  const [groups, setGroups] = useState<BillingUnitGroup[]>([])
  const [billingUnits, setBillingUnits] = useState<BillingUnit[]>([])

  // Selection
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedMode, setSelectedMode] = useState<'GROUP' | 'INDIVIDUAL'>('GROUP')
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([])

  // Preview
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [ownersRes, groupsRes, unitsRes] = await Promise.all([
        fetch('/api/gestion/owners', { credentials: 'include' }),
        fetch('/api/gestion/billing-unit-groups', { credentials: 'include' }),
        fetch('/api/gestion/billing-units', { credentials: 'include' })
      ])

      if (ownersRes.ok) {
        const data = await ownersRes.json()
        setOwners(data.owners || [])
      }

      if (groupsRes.ok) {
        const data = await groupsRes.json()
        setGroups(data.groups || [])
      }

      if (unitsRes.ok) {
        const data = await unitsRes.json()
        setBillingUnits(data.billingUnits || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get owner's groups and individual units
  const ownerGroups = useMemo(() => {
    if (!selectedOwner) return []
    return groups.filter(g => g.ownerId === selectedOwner.id)
  }, [selectedOwner, groups])

  const ownerIndividualUnits = useMemo(() => {
    if (!selectedOwner) return []
    // Units that belong to this owner and are NOT in a group
    return billingUnits.filter(u => u.ownerId === selectedOwner.id && !u.groupId)
  }, [selectedOwner, billingUnits])

  const getOwnerName = (owner: Owner) => {
    return owner.type === 'EMPRESA' ? owner.companyName : `${owner.firstName} ${owner.lastName}`
  }

  const handleSelectOwner = (owner: Owner) => {
    setSelectedOwner(owner)
    setSelectedGroupId(null)
    setSelectedUnitIds([])
    setPreview(null)
    setError(null)

    // Auto-select first group if available
    const ownerGrps = groups.filter(g => g.ownerId === owner.id)
    if (ownerGrps.length > 0) {
      setSelectedMode('GROUP')
      setSelectedGroupId(ownerGrps[0].id)
    } else {
      setSelectedMode('INDIVIDUAL')
      // Auto-select all individual units
      const indUnits = billingUnits.filter(u => u.ownerId === owner.id && !u.groupId)
      setSelectedUnitIds(indUnits.map(u => u.id))
    }

    setStep('select-period')
  }

  const handleSelectGroup = (groupId: string) => {
    setSelectedMode('GROUP')
    setSelectedGroupId(groupId)
    setSelectedUnitIds([])
    setPreview(null)
  }

  const handleSelectIndividual = () => {
    setSelectedMode('INDIVIDUAL')
    setSelectedGroupId(null)
    // Auto-select all individual units
    setSelectedUnitIds(ownerIndividualUnits.map(u => u.id))
    setPreview(null)
  }

  const toggleUnitSelection = (unitId: string) => {
    setSelectedUnitIds(prev =>
      prev.includes(unitId)
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    )
    setPreview(null)
  }

  const handlePreview = async () => {
    if (!selectedOwner) return

    setLoadingPreview(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set('ownerId', selectedOwner.id)
      params.set('year', selectedYear.toString())
      params.set('month', selectedMonth.toString())
      params.set('mode', selectedMode)

      if (selectedMode === 'GROUP' && selectedGroupId) {
        params.set('billingUnitGroupId', selectedGroupId)
      } else if (selectedMode === 'INDIVIDUAL' && selectedUnitIds.length > 0) {
        params.set('billingUnitIds', selectedUnitIds.join(','))
      }

      const response = await fetch(`/api/gestion/liquidations/preview?${params}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setPreview(data)
        setStep('preview')
      } else {
        const data = await response.json()
        setError(data.error || 'Error al cargar preview')
      }
    } catch (error) {
      console.error('Error loading preview:', error)
      setError('Error al cargar preview')
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleGenerate = async () => {
    if (!selectedOwner || !preview) return

    setGenerating(true)
    setStep('generating')
    setError(null)

    try {
      const body: any = {
        ownerId: selectedOwner.id,
        year: selectedYear,
        month: selectedMonth,
        mode: selectedMode
      }

      if (selectedMode === 'GROUP' && selectedGroupId) {
        body.billingUnitGroupId = selectedGroupId
      } else if (selectedMode === 'INDIVIDUAL' && selectedUnitIds.length > 0) {
        body.billingUnitIds = selectedUnitIds
      }

      const response = await fetch('/api/gestion/liquidations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/gestion/liquidaciones/${data.liquidation.id}`)
      } else {
        const data = await response.json()
        setError(data.error || 'Error al generar liquidación')
        setStep('preview')
      }
    } catch (error) {
      console.error('Error generating liquidation:', error)
      setError('Error al generar liquidación')
      setStep('preview')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return <AnimatedLoadingSpinner text="Cargando datos..." type="general" />
  }

  const selectedGroup = selectedGroupId ? groups.find(g => g.id === selectedGroupId) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/gestion/liquidaciones"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a liquidaciones
          </Link>
          <div className="flex items-center space-x-3">
            <Receipt className="h-7 w-7 text-violet-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nueva Liquidación</h1>
              <p className="text-sm text-gray-600">
                {step === 'select-owner' && 'Selecciona el propietario'}
                {step === 'select-period' && 'Configura el período y apartamentos'}
                {step === 'preview' && 'Revisa y confirma'}
                {step === 'generating' && 'Generando liquidación...'}
              </p>
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-4 mb-8">
          {['select-owner', 'select-period', 'preview'].map((s, index) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${
                step === s ? 'text-violet-600' :
                ['select-period', 'preview'].indexOf(step) > ['select-owner', 'select-period', 'preview'].indexOf(s)
                  ? 'text-green-600' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s ? 'bg-violet-100 text-violet-600' :
                  ['select-period', 'preview'].indexOf(step) > ['select-owner', 'select-period', 'preview'].indexOf(s)
                    ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {['select-period', 'preview'].indexOf(step) > ['select-owner', 'select-period', 'preview'].indexOf(s) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  {s === 'select-owner' && 'Propietario'}
                  {s === 'select-period' && 'Período'}
                  {s === 'preview' && 'Preview'}
                </span>
              </div>
              {index < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </React.Fragment>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Step 1: Select Owner */}
        {step === 'select-owner' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {owners.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-700 font-medium mb-2">No hay propietarios</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Primero debes crear propietarios para poder generar liquidaciones.
                  </p>
                  <Link href="/gestion/clientes">
                    <Button className="bg-violet-600 hover:bg-violet-700">
                      Ir a Propietarios
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {owners.map((owner) => {
                  const ownerGrps = groups.filter(g => g.ownerId === owner.id)
                  const ownerUnits = billingUnits.filter(u => u.ownerId === owner.id && !u.groupId)
                  const totalUnits = ownerGrps.reduce((sum, g) => sum + g.unitsCount, 0) + ownerUnits.length

                  return (
                    <Card
                      key={owner.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-transparent hover:border-l-violet-500"
                      onClick={() => handleSelectOwner(owner)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-violet-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{getOwnerName(owner)}</p>
                              <p className="text-sm text-gray-500">{owner.email}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                {ownerGrps.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Layers className="w-3 h-3" />
                                    {ownerGrps.length} {ownerGrps.length === 1 ? 'conjunto' : 'conjuntos'}
                                  </span>
                                )}
                                {ownerUnits.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Home className="w-3 h-3" />
                                    {ownerUnits.length} {ownerUnits.length === 1 ? 'apartamento' : 'apartamentos'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Select Period and Apartments */}
        {step === 'select-period' && selectedOwner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Selected Owner */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{getOwnerName(selectedOwner)}</p>
                      <p className="text-sm text-gray-500">{selectedOwner.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep('select-owner')}
                    className="text-sm text-violet-600 hover:text-violet-800"
                  >
                    Cambiar
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Period Selection */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-violet-600" />
                  Período
                </h3>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-2">Mes</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => {
                        setSelectedMonth(parseInt(e.target.value))
                        setPreview(null)
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {MONTHS.map((month, index) => (
                        <option key={index} value={index + 1}>{month}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-2">Año</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => {
                        setSelectedYear(parseInt(e.target.value))
                        setPreview(null)
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Select Groups or Individual Units */}
            {(ownerGroups.length > 0 || ownerIndividualUnits.length > 0) && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-violet-600" />
                    Apartamentos a liquidar
                  </h3>

                  {/* Groups */}
                  {ownerGroups.length > 0 && (
                    <div className="space-y-3 mb-4">
                      <p className="text-sm text-gray-600 font-medium">Conjuntos</p>
                      {ownerGroups.map(group => (
                        <div
                          key={group.id}
                          onClick={() => handleSelectGroup(group.id)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedMode === 'GROUP' && selectedGroupId === group.id
                              ? 'border-violet-500 bg-violet-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                selectedMode === 'GROUP' && selectedGroupId === group.id
                                  ? 'bg-violet-100'
                                  : 'bg-gray-100'
                              }`}>
                                <Layers className={`w-5 h-5 ${
                                  selectedMode === 'GROUP' && selectedGroupId === group.id
                                    ? 'text-violet-600'
                                    : 'text-gray-500'
                                }`} />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{group.name}</p>
                                <p className="text-sm text-gray-500">
                                  {group.unitsCount} {group.unitsCount === 1 ? 'apartamento' : 'apartamentos'}
                                </p>
                              </div>
                            </div>
                            {selectedMode === 'GROUP' && selectedGroupId === group.id && (
                              <Check className="w-5 h-5 text-violet-600" />
                            )}
                          </div>
                          {/* Show units in group */}
                          {group.billingUnits.length > 0 && (
                            <div className="mt-3 pl-13 flex flex-wrap gap-2">
                              {group.billingUnits.map(unit => (
                                <span key={unit.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {unit.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Individual Units */}
                  {ownerIndividualUnits.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 font-medium">Apartamentos individuales</p>
                        {ownerIndividualUnits.length > 1 && (
                          <button
                            onClick={handleSelectIndividual}
                            className="text-sm text-violet-600 hover:text-violet-800"
                          >
                            Seleccionar todos
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ownerIndividualUnits.map(unit => (
                          <div
                            key={unit.id}
                            onClick={() => {
                              setSelectedMode('INDIVIDUAL')
                              setSelectedGroupId(null)
                              toggleUnitSelection(unit.id)
                            }}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              selectedMode === 'INDIVIDUAL' && selectedUnitIds.includes(unit.id)
                                ? 'border-violet-500 bg-violet-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded flex items-center justify-center ${
                                selectedMode === 'INDIVIDUAL' && selectedUnitIds.includes(unit.id)
                                  ? 'bg-violet-100'
                                  : 'bg-gray-100'
                              }`}>
                                <Home className={`w-4 h-4 ${
                                  selectedMode === 'INDIVIDUAL' && selectedUnitIds.includes(unit.id)
                                    ? 'text-violet-600'
                                    : 'text-gray-500'
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{unit.name}</p>
                                {unit.city && (
                                  <p className="text-xs text-gray-500">{unit.city}</p>
                                )}
                              </div>
                              {selectedMode === 'INDIVIDUAL' && selectedUnitIds.includes(unit.id) && (
                                <Check className="w-4 h-4 text-violet-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep('select-owner')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Atrás
              </Button>
              <Button
                onClick={handlePreview}
                disabled={loadingPreview || (selectedMode === 'GROUP' && !selectedGroupId) || (selectedMode === 'INDIVIDUAL' && selectedUnitIds.length === 0)}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {loadingPreview ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    Ver preview
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Preview */}
        {step === 'preview' && preview && selectedOwner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary Header */}
            <Card className="bg-violet-50 border-violet-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-violet-600">Liquidación para</p>
                    <p className="font-semibold text-gray-900">{getOwnerName(selectedOwner)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-violet-600">Período</p>
                    <p className="font-semibold text-gray-900">
                      {MONTHS[selectedMonth - 1]} {selectedYear}
                    </p>
                  </div>
                </div>
                {selectedMode === 'GROUP' && selectedGroup && (
                  <div className="flex items-center gap-2 text-sm text-violet-700">
                    <Layers className="w-4 h-4" />
                    <span>Conjunto: {selectedGroup.name}</span>
                    <Badge className="bg-violet-200 text-violet-800">
                      {selectedGroup.unitsCount} apartamentos
                    </Badge>
                  </div>
                )}
                {selectedMode === 'INDIVIDUAL' && selectedUnitIds.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-violet-700">
                    <Home className="w-4 h-4" />
                    <span>{selectedUnitIds.length} {selectedUnitIds.length === 1 ? 'apartamento' : 'apartamentos'} individuales</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Breakdown by Unit (if group mode) */}
            {preview.byUnit && preview.byUnit.length > 1 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Desglose por apartamento</h3>
                  <div className="space-y-3">
                    {preview.byUnit.map(unit => (
                      <div key={unit.unitId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Home className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{unit.unitName}</p>
                            <p className="text-sm text-gray-500">{unit.reservationsCount} reservas</p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900">{formatCurrency(unit.totalIncome)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reservations */}
            {preview.reservations.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 mb-4">
                    Reservas ({preview.reservations.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium text-gray-600">Propiedad</th>
                          <th className="text-left py-2 font-medium text-gray-600">Código</th>
                          <th className="text-left py-2 font-medium text-gray-600">Huésped</th>
                          <th className="text-left py-2 font-medium text-gray-600">Fechas</th>
                          <th className="text-right py-2 font-medium text-gray-600">Importe</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.reservations.slice(0, 10).map(res => (
                          <tr key={res.id} className="border-b border-gray-100">
                            <td className="py-2 text-gray-900">{res.property}</td>
                            <td className="py-2 text-gray-500">{res.confirmationCode}</td>
                            <td className="py-2 text-gray-900">{res.guestName}</td>
                            <td className="py-2 text-gray-500">
                              {new Date(res.checkIn).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })} - {new Date(res.checkOut).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                            </td>
                            <td className="py-2 text-right font-medium">{formatCurrency(res.hostEarnings)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {preview.reservations.length > 10 && (
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        ... y {preview.reservations.length - 10} reservas más
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Totals */}
            <Card className="border-2 border-violet-200">
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Euro className="w-5 h-5 text-violet-600" />
                  Resumen
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Total ingresos</span>
                    <span className="font-medium">{formatCurrency(preview.totals.totalIncome)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Comisión de gestión</span>
                    <span className="font-medium text-red-600">- {formatCurrency(preview.totals.totalCommission)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">IVA comisión</span>
                    <span className="font-medium text-red-600">- {formatCurrency(preview.totals.totalCommissionVat)}</span>
                  </div>
                  {preview.totals.totalCleaning > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Limpiezas</span>
                      <span className="font-medium text-red-600">- {formatCurrency(preview.totals.totalCleaning)}</span>
                    </div>
                  )}
                  {preview.totals.totalExpenses > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Gastos repercutidos</span>
                      <span className="font-medium text-red-600">- {formatCurrency(preview.totals.totalExpenses)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 border-t-2 border-violet-200 mt-2">
                    <span className="font-semibold text-gray-900">Neto a transferir</span>
                    <span className="font-bold text-xl text-green-600">{formatCurrency(preview.totals.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Empty state */}
            {preview.reservations.length === 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="font-medium text-yellow-800">Sin reservas en este período</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    No hay reservas sin liquidar para los apartamentos y período seleccionados.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep('select-period')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Atrás
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generating || preview.reservations.length === 0}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Generar liquidación
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Generating state */}
        {step === 'generating' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Loader2 className="w-12 h-12 text-violet-600 mx-auto mb-4 animate-spin" />
            <p className="text-lg font-medium text-gray-900">Generando liquidación...</p>
            <p className="text-sm text-gray-500 mt-2">Esto puede tardar unos segundos</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
