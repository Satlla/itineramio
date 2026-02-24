'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { useTranslation } from 'react-i18next'

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
    platform: string
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
    totalRetention?: number
    totalAmount: number
    ownerPaysManager?: number
  }
  commission?: {
    type: string
    value: number
    vatRate: number
  }
  retention?: {
    rate: number
    ownerType: string
  }
  incomeReceiver?: 'OWNER' | 'MANAGER'
  byUnit?: {
    unitId: string
    unitName: string
    reservationsCount: number
    totalIncome: number
  }[]
}

type Step = 'select-owner' | 'select-period' | 'preview' | 'generating'

export default function NuevaLiquidacionPage() {
  const { t } = useTranslation('gestion')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [step, setStep] = useState<Step>('select-owner')
  const [initialParamsApplied, setInitialParamsApplied] = useState(false)

  const MONTHS = [
    t('common.months.january'), t('common.months.february'), t('common.months.march'),
    t('common.months.april'), t('common.months.may'), t('common.months.june'),
    t('common.months.july'), t('common.months.august'), t('common.months.september'),
    t('common.months.october'), t('common.months.november'), t('common.months.december')
  ]

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

  // Fast-track: Load preview directly if URL params are present (skip waiting for all data)
  useEffect(() => {
    if (initialParamsApplied) return

    const ownerIdParam = searchParams.get('ownerId')
    const yearParam = searchParams.get('year')
    const monthParam = searchParams.get('month')

    if (ownerIdParam && yearParam && monthParam) {
      setInitialParamsApplied(true)
      setLoadingPreview(true)
      setStep('preview') // Show preview step immediately with loading state

      const year = parseInt(yearParam)
      const month = parseInt(monthParam)
      setSelectedYear(year)
      setSelectedMonth(month)

      // Load preview directly without waiting for owners/groups/units
      const params = new URLSearchParams()
      params.set('ownerId', ownerIdParam)
      params.set('year', yearParam)
      params.set('month', monthParam)

      fetch(`/api/gestion/liquidations/preview?${params}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError(data.error)
            setStep('select-owner')
          } else {
            setPreview(data)
            // Find owner from loaded data (or load it separately)
            const owner = owners.find(o => o.id === ownerIdParam)
            if (owner) {
              setSelectedOwner(owner)
            }
          }
        })
        .catch(() => {
          setError('Error al cargar preview')
          setStep('select-owner')
        })
        .finally(() => setLoadingPreview(false))
    } else {
      setInitialParamsApplied(true)
    }
  }, [searchParams, initialParamsApplied, owners])

  // Set selected owner once owners are loaded (for display purposes)
  useEffect(() => {
    if (!selectedOwner && owners.length > 0 && preview) {
      const ownerIdParam = searchParams.get('ownerId')
      if (ownerIdParam) {
        const owner = owners.find(o => o.id === ownerIdParam)
        if (owner) setSelectedOwner(owner)
      }
    }
  }, [owners, selectedOwner, preview, searchParams])

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
    const ownerId = selectedOwner?.id || searchParams.get('ownerId')
    if (!ownerId || !preview) return

    setGenerating(true)
    setStep('generating')
    setError(null)

    try {
      const body: any = {
        ownerId,
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
    return <AnimatedLoadingSpinner text={t('newSettlement.loading')} type="general" />
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
            {t('newSettlement.backToSettlements')}
          </Link>
          <div className="flex items-center space-x-3">
            <Receipt className="h-7 w-7 text-violet-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('newSettlement.title')}</h1>
              <p className="text-sm text-gray-600">
                {step === 'select-owner' && t('newSettlement.steps.selectOwner')}
                {step === 'select-period' && t('newSettlement.steps.configurePeriod')}
                {step === 'preview' && t('newSettlement.steps.reviewAndConfirm')}
                {step === 'generating' && t('newSettlement.steps.generating')}
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
                  {s === 'select-owner' && t('newSettlement.stepLabels.owner')}
                  {s === 'select-period' && t('newSettlement.stepLabels.period')}
                  {s === 'preview' && t('newSettlement.stepLabels.preview')}
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
                  <p className="text-gray-700 font-medium mb-2">{t('newSettlement.noOwners.title')}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {t('newSettlement.noOwners.description')}
                  </p>
                  <Link href="/gestion/clientes">
                    <Button className="bg-violet-600 hover:bg-violet-700">
                      {t('newSettlement.noOwners.action')}
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
                                    {ownerGrps.length} {ownerGrps.length === 1 ? t('newSettlement.ownerCard.groups') : t('newSettlement.ownerCard.groupsPlural')}
                                  </span>
                                )}
                                {ownerUnits.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Home className="w-3 h-3" />
                                    {ownerUnits.length} {ownerUnits.length === 1 ? t('newSettlement.ownerCard.apartments') : t('newSettlement.ownerCard.apartmentsPlural')}
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
                    {t('newSettlement.periodSection.change')}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Period Selection */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-violet-600" />
                  {t('newSettlement.periodSection.title')}
                </h3>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-2">{t('newSettlement.periodSection.month')}</label>
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
                    <label className="block text-sm text-gray-600 mb-2">{t('newSettlement.periodSection.year')}</label>
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
                    {t('newSettlement.apartmentsSection.title')}
                  </h3>

                  {/* Groups */}
                  {ownerGroups.length > 0 && (
                    <div className="space-y-3 mb-4">
                      <p className="text-sm text-gray-600 font-medium">{t('newSettlement.apartmentsSection.groups')}</p>
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
                                  {group.unitsCount} {group.unitsCount === 1 ? t('newSettlement.apartmentsSection.apartment') : t('newSettlement.apartmentsSection.apartmentsPlural')}
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
                        <p className="text-sm text-gray-600 font-medium">{t('newSettlement.apartmentsSection.individualApartments')}</p>
                        {ownerIndividualUnits.length > 1 && (
                          <button
                            onClick={handleSelectIndividual}
                            className="text-sm text-violet-600 hover:text-violet-800"
                          >
                            {t('newSettlement.apartmentsSection.selectAll')}
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
                {t('newSettlement.actions.back')}
              </Button>
              <Button
                onClick={handlePreview}
                disabled={loadingPreview || (selectedMode === 'GROUP' && !selectedGroupId) || (selectedMode === 'INDIVIDUAL' && selectedUnitIds.length === 0)}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {loadingPreview ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('newSettlement.actions.loading')}
                  </>
                ) : (
                  <>
                    {t('newSettlement.actions.viewPreview')}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Preview - Loading State */}
        {step === 'preview' && loadingPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <Card className="bg-violet-50 border-violet-200 animate-pulse">
              <CardContent className="p-4">
                <div className="h-6 bg-violet-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-violet-100 rounded w-1/4"></div>
              </CardContent>
            </Card>
            <Card className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-100 rounded"></div>
                  <div className="h-8 bg-gray-50 rounded"></div>
                  <div className="h-8 bg-gray-100 rounded"></div>
                </div>
              </CardContent>
            </Card>
            <div className="text-center text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Cargando liquidación...
            </div>
          </motion.div>
        )}

        {/* Step 3: Preview - Content */}
        {step === 'preview' && preview && !loadingPreview && (
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
                    <p className="text-sm text-violet-600">{t('newSettlement.preview.settlementFor')}</p>
                    <p className="font-semibold text-gray-900">
                      {selectedOwner ? getOwnerName(selectedOwner) : 'Cargando...'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-violet-600">{t('newSettlement.preview.period')}</p>
                    <p className="font-semibold text-gray-900">
                      {MONTHS[selectedMonth - 1]} {selectedYear}
                    </p>
                  </div>
                </div>
                {selectedMode === 'GROUP' && selectedGroup && (
                  <div className="flex items-center gap-2 text-sm text-violet-700">
                    <Layers className="w-4 h-4" />
                    <span>{t('newSettlement.preview.group')}: {selectedGroup.name}</span>
                    <Badge className="bg-violet-200 text-violet-800">
                      {selectedGroup.unitsCount} {t('newSettlement.apartmentsSection.apartmentsPlural')}
                    </Badge>
                  </div>
                )}
                {selectedMode === 'INDIVIDUAL' && selectedUnitIds.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-violet-700">
                    <Home className="w-4 h-4" />
                    <span>{selectedUnitIds.length} {t('newSettlement.preview.individualApartments')}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Breakdown by Unit (if group mode) */}
            {preview.byUnit && preview.byUnit.length > 1 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 mb-4">{t('newSettlement.preview.breakdownByApartment')}</h3>
                  <div className="space-y-3">
                    {preview.byUnit.map(unit => (
                      <div key={unit.unitId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Home className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{unit.unitName}</p>
                            <p className="text-sm text-gray-500">{unit.reservationsCount} {t('newSettlement.preview.reservationsCount')}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900">{formatCurrency(unit.totalIncome)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reservations - Excel Style */}
            {preview.reservations.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  {/* Group reservations by property */}
                  {Object.entries(
                    preview.reservations.reduce((acc, res) => {
                      const prop = res.property || 'Sin propiedad'
                      if (!acc[prop]) acc[prop] = []
                      acc[prop].push(res)
                      return acc
                    }, {} as Record<string, typeof preview.reservations>)
                  ).map(([propertyName, propertyReservations]) => (
                    <div key={propertyName}>
                      {/* Property Header */}
                      <div className="bg-violet-100 px-4 py-2 border-b border-violet-200">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-violet-600" />
                          <span className="font-semibold text-violet-900">{propertyName}</span>
                          <Badge className="bg-violet-200 text-violet-800 text-xs">
                            {propertyReservations.length} reservas
                          </Badge>
                        </div>
                      </div>

                      {/* Reservations Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 border-b">
                              <th className="text-left px-4 py-2 font-medium text-gray-600">Plataforma</th>
                              <th className="text-left px-4 py-2 font-medium text-gray-600">Código</th>
                              <th className="text-left px-4 py-2 font-medium text-gray-600">Huésped</th>
                              <th className="text-center px-4 py-2 font-medium text-gray-600">Check-in</th>
                              <th className="text-center px-4 py-2 font-medium text-gray-600">Check-out</th>
                              <th className="text-center px-4 py-2 font-medium text-gray-600">Noches</th>
                              <th className="text-right px-4 py-2 font-medium text-gray-600">Importe</th>
                            </tr>
                          </thead>
                          <tbody>
                            {propertyReservations.map((res, idx) => (
                              <tr key={res.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-2">
                                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
                                    res.platform === 'AIRBNB' ? 'bg-pink-100 text-pink-700' :
                                    res.platform === 'BOOKING' ? 'bg-blue-100 text-blue-700' :
                                    res.platform === 'VRBO' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {res.platform}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-gray-500 font-mono text-xs">{res.confirmationCode}</td>
                                <td className="px-4 py-2 text-gray-900">{res.guestName}</td>
                                <td className="px-4 py-2 text-center text-gray-600">
                                  {new Date(res.checkIn).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                </td>
                                <td className="px-4 py-2 text-center text-gray-600">
                                  {new Date(res.checkOut).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                </td>
                                <td className="px-4 py-2 text-center text-gray-600">{res.nights}</td>
                                <td className="px-4 py-2 text-right font-medium text-gray-900">{formatCurrency(res.hostEarnings)}</td>
                              </tr>
                            ))}
                            {/* Subtotal row */}
                            <tr className="bg-violet-50 border-t border-violet-200">
                              <td colSpan={6} className="px-4 py-2 text-right font-medium text-violet-700">
                                Subtotal {propertyName}:
                              </td>
                              <td className="px-4 py-2 text-right font-bold text-violet-900">
                                {formatCurrency(propertyReservations.reduce((sum, r) => sum + r.hostEarnings, 0))}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}

                  {/* Grand Total */}
                  <div className="bg-violet-600 px-4 py-3 flex justify-between items-center">
                    <span className="font-semibold text-white">
                      Total Ingresos ({preview.reservations.length} reservas)
                    </span>
                    <span className="font-bold text-xl text-white">
                      {formatCurrency(preview.totals.totalIncome)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Totals - Excel Style */}
            <Card className="border-2 border-gray-300">
              <CardContent className="p-0">
                {/* Header indicating income flow */}
                <div className={`px-4 py-2 text-sm font-medium ${
                  preview.incomeReceiver === 'OWNER'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {preview.incomeReceiver === 'OWNER'
                    ? '📥 El propietario recibe los ingresos de las plataformas'
                    : '📥 El gestor recibe los ingresos de las plataformas'
                  }
                </div>

                <table className="w-full text-sm">
                  <tbody>
                    {/* Total Income */}
                    <tr className="border-b bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">Total Ingresos</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {formatCurrency(preview.totals.totalIncome)}
                      </td>
                    </tr>

                    {/* Commission */}
                    <tr className="border-b">
                      <td className="px-4 py-3 text-gray-600">
                        Comisión de gestión
                        {preview.commission?.type === 'PERCENTAGE' && (
                          <span className="ml-2 text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded">
                            {preview.commission.value}%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-red-600">
                        {formatCurrency(preview.totals.totalCommission)}
                      </td>
                    </tr>

                    {/* VAT on Commission - only show if > 0 */}
                    {preview.totals.totalCommissionVat > 0 && (
                      <tr className="border-b">
                        <td className="px-4 py-3 text-gray-600">
                          IVA sobre comisión
                          {preview.commission?.vatRate && (
                            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {preview.commission.vatRate}%
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-red-600">
                          {formatCurrency(preview.totals.totalCommissionVat)}
                        </td>
                      </tr>
                    )}

                    {/* Retention IRPF - only for companies */}
                    {preview.retention && preview.retention.rate > 0 && (
                      <tr className="border-b bg-orange-50">
                        <td className="px-4 py-3 text-gray-600">
                          Retención IRPF
                          <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                            {preview.retention.rate}%
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            (Empresa)
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-orange-600">
                          -{formatCurrency(preview.totals.totalRetention || 0)}
                        </td>
                      </tr>
                    )}

                    {/* Info for individuals - no retention */}
                    {preview.retention && preview.retention.rate === 0 && preview.retention.ownerType === 'PERSONA_FISICA' && (
                      <tr className="border-b bg-blue-50">
                        <td colSpan={2} className="px-4 py-2 text-xs text-blue-700">
                          ℹ️ Sin retención IRPF (Persona física)
                        </td>
                      </tr>
                    )}

                    {/* Cleaning */}
                    {preview.totals.totalCleaning > 0 && (
                      <tr className="border-b">
                        <td className="px-4 py-3 text-gray-600">Limpieza</td>
                        <td className="px-4 py-3 text-right font-medium text-red-600">
                          {formatCurrency(preview.totals.totalCleaning)}
                        </td>
                      </tr>
                    )}

                    {/* Expenses */}
                    {preview.totals.totalExpenses > 0 && (
                      <tr className="border-b">
                        <td className="px-4 py-3 text-gray-600">Gastos repercutidos</td>
                        <td className="px-4 py-3 text-right font-medium text-red-600">
                          {formatCurrency(preview.totals.totalExpenses)}
                        </td>
                      </tr>
                    )}

                    {/* Final Result - depends on incomeReceiver */}
                    {preview.incomeReceiver === 'OWNER' ? (
                      // Owner receives income -> shows what owner pays to manager
                      <tr className="bg-amber-50">
                        <td className="px-4 py-4 font-bold text-gray-900 text-base">
                          💰 PROPIETARIO PAGA AL GESTOR
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-xl text-amber-600">
                          {formatCurrency(preview.totals.ownerPaysManager || 0)}
                        </td>
                      </tr>
                    ) : (
                      // Manager receives income -> shows what manager transfers to owner
                      <tr className="bg-green-50">
                        <td className="px-4 py-4 font-bold text-gray-900 text-base">
                          💰 GESTOR TRANSFIERE AL PROPIETARIO
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-xl text-green-600">
                          {formatCurrency(preview.totals.totalAmount)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Empty state */}
            {preview.reservations.length === 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="font-medium text-yellow-800">{t('newSettlement.preview.noReservations.title')}</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    {t('newSettlement.preview.noReservations.description')}
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
                {t('newSettlement.actions.back')}
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generating || preview.reservations.length === 0 || (!selectedOwner && !searchParams.get('ownerId'))}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('newSettlement.actions.generating')}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {t('newSettlement.actions.generateSettlement')}
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
            <p className="text-lg font-medium text-gray-900">{t('newSettlement.generatingState.title')}</p>
            <p className="text-sm text-gray-500 mt-2">{t('newSettlement.generatingState.description')}</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
