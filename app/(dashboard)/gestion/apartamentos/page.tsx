'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  X,
  FolderOpen,
  Building2,
  Upload,
  Image as ImageIcon,
  Lightbulb
} from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
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
  address: string | null
  postalCode: string | null
  imageUrl: string | null
  groupId: string | null
  ownerId: string | null
  owner: Owner | null
  commissionType: string
  commissionValue: number
  commissionVat: number
  cleaningValue: number
  cleaningVatIncluded: boolean
  airbnbNames: string[]
  bookingNames: string[]
  vrboNames: string[]
  reservationsCount: number
  expensesCount: number
  invoicesCount: number
  isActive: boolean
}

interface BillingUnitGroup {
  id: string
  name: string
  imageUrl: string | null
  ownerId: string
  owner: Owner | null
  billingUnits: {
    id: string
    name: string
    city: string | null
    imageUrl: string | null
    cleaningValue: number
    cleaningVatIncluded: boolean
  }[]
  unitsCount: number
  invoicesCount: number
  commissionType: string
  commissionValue: number
  cleaningType: string
  cleaningValue: number
  cleaningVatIncluded: boolean
  cleaningFeeRecipient: string
  isActive: boolean
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

type TabType = 'all' | 'groups' | 'standalone'

export default function ApartamentosPage() {
  const { t } = useTranslation('gestion')
  const [loading, setLoading] = useState(true)
  const [billingUnits, setBillingUnits] = useState<BillingUnit[]>([])
  const [groups, setGroups] = useState<BillingUnitGroup[]>([])
  const [owners, setOwners] = useState<OwnerFull[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('all')

  // Modals
  const [showNewUnitModal, setShowNewUnitModal] = useState(false)
  const [showNewGroupModal, setShowNewGroupModal] = useState(false)
  const [editingUnit, setEditingUnit] = useState<BillingUnit | null>(null)
  const [editingGroup, setEditingGroup] = useState<BillingUnitGroup | null>(null)

  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [unitsRes, groupsRes, ownersRes] = await Promise.all([
        fetch('/api/gestion/billing-units', { credentials: 'include' }),
        fetch('/api/gestion/billing-unit-groups', { credentials: 'include' }),
        fetch('/api/gestion/owners', { credentials: 'include' })
      ])

      if (unitsRes.ok) {
        const data = await unitsRes.json()
        setBillingUnits(data.billingUnits || [])
      }

      if (groupsRes.ok) {
        const data = await groupsRes.json()
        setGroups(data.groups || [])
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

  const getOwnerName = (owner?: OwnerFull | Owner | null) => {
    if (!owner) return t('common.unassigned')
    if ('type' in owner) {
      if (owner.type === 'EMPRESA') return owner.companyName || t('owners.card.company')
      return `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || t('owners.card.individual')
    }
    return owner.name
  }

  // Filtrar apartamentos según tab
  const standaloneUnits = billingUnits.filter(u => !u.groupId)
  const groupedUnits = billingUnits.filter(u => u.groupId)

  const configuredCount = standaloneUnits.filter(u => u.ownerId).length + groups.length

  if (loading) {
    return <AnimatedLoadingSpinner text={t('apartments.loading')} type="general" />
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Home className="h-7 w-7 text-violet-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{t('apartments.title')}</h1>
                  <p className="text-sm text-gray-600">
                    {t('apartments.subtitle')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={() => setShowNewGroupModal(true)}
                  variant="outline"
                  className="border-violet-300 text-violet-700 hover:bg-violet-50"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  {t('apartments.actions.newGroup')}
                </Button>
                <Button
                  onClick={() => setShowNewUnitModal(true)}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('apartments.actions.newUnit')}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-violet-600">{groups.length}</p>
                <p className="text-sm text-gray-500">{t('apartments.stats.groups')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{standaloneUnits.length}</p>
                <p className="text-sm text-gray-500">{t('apartments.stats.standalone')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{groupedUnits.length}</p>
                <p className="text-sm text-gray-500">{t('apartments.stats.inGroups')}</p>
              </CardContent>
            </Card>
          </div>

          {/* No owners warning */}
          {owners.length === 0 && (
            <Card className="border-blue-200 bg-blue-50 mb-6">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">{t('apartments.noOwnersWarning.title')}</p>
                    <p className="text-sm text-blue-700 mt-1">
                      {t('apartments.noOwnersWarning.description')}
                    </p>
                    <Link href="/gestion/clientes">
                      <Button size="sm" className="mt-3 bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        {t('apartments.noOwnersWarning.createOwner')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {[
              { key: 'all', label: t('apartments.tabs.all'), count: groups.length + standaloneUnits.length },
              { key: 'groups', label: t('apartments.tabs.groups'), count: groups.length },
              { key: 'standalone', label: t('apartments.tabs.standalone'), count: standaloneUnits.length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.key
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Groups */}
            {(activeTab === 'all' || activeTab === 'groups') && groups.length > 0 && (
              <div>
                {activeTab === 'all' && (
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-violet-600" />
                    {t('apartments.tabs.groups')}
                  </h2>
                )}
                <div className="space-y-3">
                  {groups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      expanded={expandedId === `group-${group.id}`}
                      onToggle={() => setExpandedId(expandedId === `group-${group.id}` ? null : `group-${group.id}`)}
                      onEdit={() => setEditingGroup(group)}
                      onEditUnit={(unitId) => {
                        const unit = billingUnits.find(u => u.id === unitId)
                        if (unit) setEditingUnit(unit)
                      }}
                      onRefresh={fetchData}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Standalone Units */}
            {(activeTab === 'all' || activeTab === 'standalone') && standaloneUnits.length > 0 && (
              <div>
                {activeTab === 'all' && (
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    {t('apartments.standaloneUnits')}
                  </h2>
                )}
                <div className="space-y-3">
                  {standaloneUnits.map((unit) => (
                    <UnitCard
                      key={unit.id}
                      unit={unit}
                      expanded={expandedId === `unit-${unit.id}`}
                      onToggle={() => setExpandedId(expandedId === `unit-${unit.id}` ? null : `unit-${unit.id}`)}
                      onEdit={() => setEditingUnit(unit)}
                      onRefresh={fetchData}
                      groups={groups}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {groups.length === 0 && standaloneUnits.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Home className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-700 font-medium mb-2">{t('apartments.emptyState.title')}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {t('apartments.emptyState.description')}
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button
                      onClick={() => setShowNewGroupModal(true)}
                      variant="outline"
                    >
                      <FolderOpen className="w-4 h-4 mr-2" />
                      {t('apartments.emptyState.createGroup')}
                    </Button>
                    <Button
                      onClick={() => setShowNewUnitModal(true)}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('apartments.emptyState.createUnit')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <DashboardFooter />

      {/* Modals */}
      <NewUnitModal
        open={showNewUnitModal}
        onClose={() => setShowNewUnitModal(false)}
        owners={owners}
        groups={groups}
        onSuccess={() => { setShowNewUnitModal(false); fetchData() }}
      />

      <NewGroupModal
        open={showNewGroupModal}
        onClose={() => setShowNewGroupModal(false)}
        owners={owners}
        standaloneUnits={standaloneUnits}
        onSuccess={() => { setShowNewGroupModal(false); fetchData() }}
      />

      <EditUnitModal
        unit={editingUnit}
        onClose={() => setEditingUnit(null)}
        owners={owners}
        groups={groups}
        onSuccess={() => { setEditingUnit(null); fetchData() }}
      />

      <EditGroupModal
        group={editingGroup}
        onClose={() => setEditingGroup(null)}
        owners={owners}
        availableUnits={standaloneUnits}
        onSuccess={() => { setEditingGroup(null); fetchData() }}
      />
    </div>
  )
}

// ============================================
// GROUP CARD
// ============================================
function GroupCard({
  group,
  expanded,
  onToggle,
  onEdit,
  onEditUnit,
  onRefresh
}: {
  group: BillingUnitGroup
  expanded: boolean
  onToggle: () => void
  onEdit: () => void
  onEditUnit: (unitId: string) => void
  onRefresh: () => void
}) {
  const { t } = useTranslation('gestion')
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(t('apartments.modals.deleteGroupConfirm'))) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/gestion/billing-unit-groups/${group.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) onRefresh()
      else alert(t('apartments.errors.deleteError'))
    } catch (e) {
      console.error(e)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="border-l-4 border-l-violet-500">
      <CardContent className="p-0">
        <div
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              {group.imageUrl ? (
                <img src={group.imageUrl} alt={group.name} className="w-14 h-14 object-cover rounded-lg" />
              ) : (
                <div className="w-14 h-14 bg-violet-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-violet-500" />
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 bg-violet-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {group.unitsCount}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{group.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className="bg-violet-100 text-violet-700 text-xs">
                  <FolderOpen className="w-3 h-3 mr-1" />
                  {t('apartments.group')}
                </Badge>
                {group.owner && (
                  <Badge className="bg-gray-100 text-gray-700 text-xs">
                    <User className="w-3 h-3 mr-1" />
                    {group.owner.name}
                  </Badge>
                )}
                {Number(group.commissionValue) > 0 && (
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    <Percent className="w-3 h-3 mr-1" />
                    {group.commissionValue}%
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onEdit() }}>
              <Edit2 className="w-4 h-4" />
            </Button>
            {group.invoicesCount === 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleDelete() }}
                disabled={deleting}
                className="text-red-600 hover:border-red-300"
              >
                {deleting ? <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </Button>
            )}
            {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 bg-gray-50"
            >
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-3">{t('apartments.unitsInGroup')}:</p>
                {group.billingUnits.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">{t('apartments.noUnitsAssigned')}</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-2">
                    {group.billingUnits.map(unit => (
                      <div
                        key={unit.id}
                        className="flex items-center justify-between gap-2 bg-white p-3 rounded-lg border hover:border-violet-300 cursor-pointer transition-colors"
                        onClick={() => onEditUnit(unit.id)}
                      >
                        <div className="flex items-center gap-2">
                          {unit.imageUrl ? (
                            <img src={unit.imageUrl} alt={unit.name} className="w-8 h-8 object-cover rounded" />
                          ) : (
                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                              <Home className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium">{unit.name}</p>
                            {unit.city && <p className="text-xs text-gray-500">{unit.city}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Limpieza</p>
                            <p className="text-sm font-medium text-violet-600">
                              {unit.cleaningValue > 0 ? `${unit.cleaningValue.toFixed(0)}€` : '-'}
                            </p>
                          </div>
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

// ============================================
// UNIT CARD
// ============================================
function UnitCard({
  unit,
  expanded,
  onToggle,
  onEdit,
  onRefresh,
  groups
}: {
  unit: BillingUnit
  expanded: boolean
  onToggle: () => void
  onEdit: () => void
  onRefresh: () => void
  groups: BillingUnitGroup[]
}) {
  const { t } = useTranslation('gestion')
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(t('apartments.modals.deleteUnitConfirm'))) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/gestion/billing-units/${unit.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) onRefresh()
      else {
        const data = await res.json()
        alert(data.error || t('apartments.errors.deleteError'))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setDeleting(false)
    }
  }

  const status = unit.ownerId
    ? { color: 'bg-green-100 text-green-700', label: t('apartments.status.configured'), icon: Check }
    : { color: 'bg-yellow-100 text-yellow-700', label: t('apartments.status.noOwner'), icon: AlertCircle }

  return (
    <Card className={unit.ownerId ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-yellow-400'}>
      <CardContent className="p-0">
        <div
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              {unit.imageUrl ? (
                <img src={unit.imageUrl} alt={unit.name} className="w-14 h-14 object-cover rounded-lg" />
              ) : (
                <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{unit.name}</h3>
              <p className="text-sm text-gray-500">{unit.city || t('apartments.noCity')}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className={`${status.color} text-xs`}>
                  <status.icon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
                {unit.owner && (
                  <Badge className="bg-gray-100 text-gray-700 text-xs">
                    <User className="w-3 h-3 mr-1" />
                    {unit.owner.name}
                  </Badge>
                )}
                {unit.reservationsCount > 0 && (
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    {unit.reservationsCount} {t('apartments.reservations')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onEdit() }}>
              <Edit2 className="w-4 h-4" />
            </Button>
            {unit.invoicesCount === 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleDelete() }}
                disabled={deleting}
                className="text-red-600 hover:border-red-300"
              >
                {deleting ? <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </Button>
            )}
            {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 bg-gray-50"
            >
              <div className="p-4 grid sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">{t('apartments.form.commission')}</p>
                  <p className="font-medium">{unit.commissionValue}% + {unit.commissionVat}% {t('apartments.form.vat')}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('apartments.form.cleaning')}</p>
                  <p className="font-medium">{unit.cleaningValue.toFixed(2)}€ {unit.cleaningVatIncluded ? t('apartments.form.vatIncluded') : t('apartments.form.plusVat')}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('reservations.title')}</p>
                  <p className="font-medium">{unit.reservationsCount}</p>
                </div>
                <div>
                  <p className="text-gray-500">{t('apartments.invoicesCount')}</p>
                  <p className="font-medium">{unit.invoicesCount}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

// ============================================
// IMAGE UPLOAD COMPONENT
// ============================================
function ImageUpload({
  currentUrl,
  onUpload,
  label = "Foto"
}: {
  currentUrl: string | null
  onUpload: (url: string) => void
  label?: string
}) {
  const { t } = useTranslation('gestion')
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (res.ok) {
        const data = await res.json()
        // Handle duplicate detection - use existing media URL
        if (data.duplicate && data.existingMedia?.url) {
          onUpload(data.existingMedia.url)
        } else if (data.url) {
          onUpload(data.url)
        } else {
          alert(t('apartments.errors.noImageUrl'))
        }
      } else {
        const errorData = await res.json().catch(() => ({}))
        alert(errorData.error || t('apartments.errors.uploadError'))
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert(t('apartments.errors.uploadError'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-3">
        {currentUrl ? (
          <img src={currentUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
        ) : (
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-gray-400" />
          </div>
        )}
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <span className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Upload className="w-4 h-4 mr-1" />
                {currentUrl ? t('apartments.form.change') : t('apartments.form.upload')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MODAL BASE
// ============================================
function Modal({
  open,
  onClose,
  title,
  children
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  )
}

// ============================================
// NEW UNIT MODAL
// ============================================
function NewUnitModal({
  open,
  onClose,
  owners,
  groups,
  onSuccess
}: {
  open: boolean
  onClose: () => void
  owners: OwnerFull[]
  groups: BillingUnitGroup[]
  onSuccess: () => void
}) {
  const { t } = useTranslation('gestion')
  const [form, setForm] = useState({
    name: '',
    city: '',
    address: '',
    postalCode: '',
    imageUrl: '',
    ownerId: '',
    groupId: '',
    commissionValue: '15',
    commissionVat: '21',
    cleaningValue: '0',
    cleaningVatIncluded: true,
    airbnbNames: '',
    bookingNames: '',
    vrboNames: ''
  })
  const [showPlatformNames, setShowPlatformNames] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return

    setSaving(true)
    try {
      const res = await fetch('/api/gestion/billing-units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name.trim(),
          city: form.city.trim() || null,
          address: form.address.trim() || null,
          postalCode: form.postalCode.trim() || null,
          imageUrl: form.imageUrl || null,
          ownerId: form.groupId ? null : (form.ownerId || null),
          groupId: form.groupId || null,
          commissionValue: parseFloat(form.commissionValue) || 0,
          commissionVat: parseFloat(form.commissionVat) || 21,
          cleaningValue: parseFloat(form.cleaningValue) || 0,
          cleaningVatIncluded: form.cleaningVatIncluded,
          airbnbNames: form.airbnbNames.split(',').map(n => n.trim()).filter(Boolean),
          bookingNames: form.bookingNames.split(',').map(n => n.trim()).filter(Boolean),
          vrboNames: form.vrboNames.split(',').map(n => n.trim()).filter(Boolean)
        })
      })

      if (res.ok) {
        setForm({ name: '', city: '', address: '', postalCode: '', imageUrl: '', ownerId: '', groupId: '', commissionValue: '15', commissionVat: '21', cleaningValue: '0', cleaningVatIncluded: true, airbnbNames: '', bookingNames: '', vrboNames: '' })
        setShowPlatformNames(false)
        onSuccess()
      } else {
        const data = await res.json()
        alert(data.error || t('apartments.errors.createError'))
      }
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('apartments.modals.newUnit')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ImageUpload
          currentUrl={form.imageUrl || null}
          onUpload={(url) => setForm(f => ({ ...f, imageUrl: url }))}
          label={t('apartments.form.unitPhoto')}
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.form.name')} *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder={t('apartments.form.namePlaceholder')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.form.city')}</label>
            <input
              type="text"
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              placeholder={t('apartments.form.cityPlaceholder')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.form.address')}</label>
          <input
            type="text"
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            placeholder={t('apartments.form.addressPlaceholder')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          />
        </div>

        <div className="w-32">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.form.postalCode')}</label>
          <input
            type="text"
            value={form.postalCode}
            onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))}
            placeholder="28013"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FolderOpen className="w-4 h-4 inline mr-1" />
            {t('apartments.form.addToGroup')}
          </label>
          {groups.length > 0 ? (
            <>
              <select
                value={form.groupId}
                onChange={e => setForm(f => ({ ...f, groupId: e.target.value, ownerId: '' }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="">{t('apartments.form.individualNoGroup')}</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              {form.groupId && (
                <p className="text-xs text-gray-500 mt-1">
                  {t('apartments.form.inheritsFromGroup')}
                </p>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p>{t('apartments.form.noGroupsYet')}</p>
              <p className="mt-1 text-xs text-gray-400">
                {t('apartments.form.groupsExplanation')}
              </p>
            </div>
          )}
        </div>

        {!form.groupId && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.form.owner')}</label>
              <select
                value={form.ownerId}
                onChange={e => setForm(f => ({ ...f, ownerId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="">{t('apartments.form.noOwnerOwnProperty')}</option>
                {owners.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.type === 'EMPRESA' ? o.companyName : `${o.firstName} ${o.lastName}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              {/* Comisión de gestión */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('apartments.form.managementCommission')}</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={form.commissionValue}
                        onChange={e => setForm(f => ({ ...f, commissionValue: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                    </div>
                  </div>
                  <span className="text-gray-400">+</span>
                  <div className="w-24">
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        value={form.commissionVat}
                        onChange={e => setForm(f => ({ ...f, commissionVat: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-12 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">% IVA</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasa de limpieza */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('apartments.form.cleaningFee')}</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={form.cleaningValue}
                        onChange={e => setForm(f => ({ ...f, cleaningValue: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.cleaningVatIncluded}
                      onChange={e => setForm(f => ({ ...f, cleaningVatIncluded: e.target.checked }))}
                      className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                    />
                    <span className="text-sm text-gray-600">{t('apartments.modal.vatIncluded')}</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">{t('apartments.form.cleaningHintUnit')}</p>
              </div>
            </div>
          </>
        )}

        {/* Nombres en plataformas (colapsable) */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowPlatformNames(!showPlatformNames)}
            className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">{t('apartments.form.platformNames')}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showPlatformNames ? 'rotate-180' : ''}`} />
          </button>
          {showPlatformNames && (
            <div className="p-4 space-y-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3">
                {t('apartments.form.platformNamesHint')}
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Airbnb</label>
                <input
                  type="text"
                  value={form.airbnbNames}
                  onChange={e => setForm(f => ({ ...f, airbnbNames: e.target.value }))}
                  placeholder={t('apartments.form.airbnbPlaceholder')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Booking.com</label>
                <input
                  type="text"
                  value={form.bookingNames}
                  onChange={e => setForm(f => ({ ...f, bookingNames: e.target.value }))}
                  placeholder={t('apartments.form.bookingPlaceholder')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Vrbo</label>
                <input
                  type="text"
                  value={form.vrboNames}
                  onChange={e => setForm(f => ({ ...f, vrboNames: e.target.value }))}
                  placeholder={t('apartments.form.vrboPlaceholder')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" disabled={saving || !form.name.trim()} className="bg-violet-600 hover:bg-violet-700">
            {saving ? t('apartments.actions.creating') : t('apartments.actions.createApartment')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ============================================
// NEW GROUP MODAL
// ============================================
function NewGroupModal({
  open,
  onClose,
  owners,
  standaloneUnits,
  onSuccess
}: {
  open: boolean
  onClose: () => void
  owners: OwnerFull[]
  standaloneUnits: BillingUnit[]
  onSuccess: () => void
}) {
  const { t } = useTranslation('gestion')
  const [form, setForm] = useState({
    name: '',
    imageUrl: '',
    ownerId: '',
    commissionValue: '15',
    cleaningValue: '0',
    cleaningType: 'FIXED_PER_RESERVATION',
    cleaningFeeRecipient: 'MANAGER',
    cleaningVatIncluded: true,
    selectedUnits: [] as string[]
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.ownerId) return

    setSaving(true)
    try {
      const res = await fetch('/api/gestion/billing-unit-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name.trim(),
          imageUrl: form.imageUrl || null,
          ownerId: form.ownerId,
          commissionValue: parseFloat(form.commissionValue) || 0,
          cleaningValue: parseFloat(form.cleaningValue) || 0,
          cleaningType: form.cleaningType,
          cleaningFeeRecipient: form.cleaningFeeRecipient,
          cleaningVatIncluded: form.cleaningVatIncluded,
          billingUnitIds: form.selectedUnits
        })
      })

      if (res.ok) {
        setForm({ name: '', imageUrl: '', ownerId: '', commissionValue: '15', cleaningValue: '0', cleaningType: 'FIXED_PER_RESERVATION', cleaningFeeRecipient: 'MANAGER', cleaningVatIncluded: true, selectedUnits: [] })
        onSuccess()
      } else {
        const data = await res.json()
        alert(data.error || t('apartments.errors.createError'))
      }
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const toggleUnit = (id: string) => {
    setForm(f => ({
      ...f,
      selectedUnits: f.selectedUnits.includes(id)
        ? f.selectedUnits.filter(u => u !== id)
        : [...f.selectedUnits, id]
    }))
  }

  return (
    <Modal open={open} onClose={onClose} title={t('apartments.modals.newGroup')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info box explicativo */}
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Lightbulb className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-violet-800">
              <p className="font-medium mb-1">{t('apartments.groupInfo.title')}</p>
              <p className="text-violet-700">
                {t('apartments.groupInfo.description')}
              </p>
              <ul className="mt-2 space-y-1 text-violet-700">
                <li>• {t('apartments.groupInfo.benefit1')}</li>
                <li>• {t('apartments.groupInfo.benefit2')}</li>
                <li>• {t('apartments.groupInfo.benefit3')}</li>
              </ul>
            </div>
          </div>
        </div>

        <ImageUpload
          currentUrl={form.imageUrl || null}
          onUpload={(url) => setForm(f => ({ ...f, imageUrl: url }))}
          label={t('apartments.form.groupPhoto')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.form.groupName')} *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder={t('apartments.form.groupNamePlaceholder')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.form.owner')} *</label>
          <select
            value={form.ownerId}
            onChange={e => setForm(f => ({ ...f, ownerId: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            required
          >
            <option value="">{t('apartments.form.selectOwner')}</option>
            {owners.map(o => (
              <option key={o.id} value={o.id}>
                {o.type === 'EMPRESA' ? o.companyName : `${o.firstName} ${o.lastName}`}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {t('apartments.form.allUnitsInvoiceToOwner')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.form.commissionPercent')}</label>
            <input
              type="number"
              step="0.1"
              value={form.commissionValue}
              onChange={e => setForm(f => ({ ...f, commissionValue: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.form.cleaningEuros')}</label>
            <input
              type="number"
              step="0.01"
              value={form.cleaningValue}
              onChange={e => setForm(f => ({ ...f, cleaningValue: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          {t('apartments.form.cleaningHintGroup')}
        </div>

        {/* Configuración de limpieza */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.form.cleaningType')}</label>
            <select
              value={form.cleaningType}
              onChange={e => setForm(f => ({ ...f, cleaningType: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="FIXED_PER_RESERVATION">{t('apartments.form.cleaningTypeFixed')}</option>
              <option value="PER_NIGHT">{t('apartments.form.cleaningTypePerNight')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.form.cleaningFeeRecipient')}</label>
            <select
              value={form.cleaningFeeRecipient}
              onChange={e => setForm(f => ({ ...f, cleaningFeeRecipient: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="MANAGER">{t('apartments.form.cleaningFeeRecipientManager')}</option>
              <option value="OWNER">{t('apartments.form.cleaningFeeRecipientOwner')}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="cleaningVatIncluded"
            checked={form.cleaningVatIncluded}
            onChange={e => setForm(f => ({ ...f, cleaningVatIncluded: e.target.checked }))}
            className="rounded text-violet-600 focus:ring-violet-500"
          />
          <label htmlFor="cleaningVatIncluded" className="text-sm text-gray-700">
            {t('apartments.modal.vatIncluded')}
          </label>
        </div>

        {standaloneUnits.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('apartments.form.addExistingUnits')}
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
              {standaloneUnits.map(unit => (
                <label
                  key={unit.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.selectedUnits.includes(unit.id)}
                    onChange={() => toggleUnit(unit.id)}
                    className="rounded text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm">{unit.name}</span>
                  {unit.city && <span className="text-xs text-gray-400">({unit.city})</span>}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button
            type="submit"
            disabled={saving || !form.name.trim() || !form.ownerId}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {saving ? t('apartments.actions.creating') : t('apartments.actions.createGroup')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ============================================
// EDIT UNIT MODAL
// ============================================
function EditUnitModal({
  unit,
  onClose,
  owners,
  groups,
  onSuccess
}: {
  unit: BillingUnit | null
  onClose: () => void
  owners: OwnerFull[]
  groups: BillingUnitGroup[]
  onSuccess: () => void
}) {
  const { t } = useTranslation('gestion')
  const [form, setForm] = useState({
    name: '',
    city: '',
    address: '',
    postalCode: '',
    imageUrl: '',
    ownerId: '',
    groupId: '',
    commissionValue: '15',
    commissionVat: '21',
    cleaningValue: '0',
    cleaningVatIncluded: true,
    airbnbNames: '',
    bookingNames: '',
    vrboNames: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (unit) {
      setForm({
        name: unit.name || '',
        city: unit.city || '',
        address: unit.address || '',
        postalCode: unit.postalCode || '',
        imageUrl: unit.imageUrl || '',
        ownerId: unit.ownerId || '',
        groupId: unit.groupId || '',
        commissionValue: String(unit.commissionValue || 15),
        commissionVat: String(unit.commissionVat || 21),
        cleaningValue: String(unit.cleaningValue || 0),
        cleaningVatIncluded: unit.cleaningVatIncluded ?? true,
        airbnbNames: (unit.airbnbNames || []).join(', '),
        bookingNames: (unit.bookingNames || []).join(', '),
        vrboNames: (unit.vrboNames || []).join(', ')
      })
    }
  }, [unit])

  if (!unit) return null

  const parseNames = (str: string): string[] => {
    return str.split(',').map(s => s.trim()).filter(Boolean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return

    setSaving(true)
    try {
      const res = await fetch(`/api/gestion/billing-units/${unit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name.trim(),
          city: form.city.trim() || null,
          address: form.address.trim() || null,
          postalCode: form.postalCode.trim() || null,
          imageUrl: form.imageUrl || null,
          ownerId: form.groupId ? null : (form.ownerId || null),
          groupId: form.groupId || null,
          commissionValue: parseFloat(form.commissionValue) || 0,
          commissionVat: parseFloat(form.commissionVat) || 21,
          cleaningValue: parseFloat(form.cleaningValue) || 0,
          cleaningVatIncluded: form.cleaningVatIncluded,
          airbnbNames: parseNames(form.airbnbNames),
          bookingNames: parseNames(form.bookingNames),
          vrboNames: parseNames(form.vrboNames)
        })
      })

      if (res.ok) {
        onSuccess()
      } else {
        const data = await res.json()
        alert(data.error || t('apartments.errors.saveError'))
      }
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={!!unit} onClose={onClose} title={t('apartments.modals.editUnit')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ImageUpload
          currentUrl={form.imageUrl || null}
          onUpload={(url) => setForm(f => ({ ...f, imageUrl: url }))}
          label={t('apartments.form.unitPhoto')}
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.form.name')} *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.form.city')}</label>
            <input
              type="text"
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.form.address')}</label>
          <input
            type="text"
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            placeholder={t('apartments.form.addressPlaceholder')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          />
        </div>

        <div className="w-32">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.form.postalCode')}</label>
          <input
            type="text"
            value={form.postalCode}
            onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))}
            placeholder="28013"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FolderOpen className="w-4 h-4 inline mr-1" />
            {t('apartments.group')}
          </label>
          {groups.length > 0 ? (
            <>
              <select
                value={form.groupId}
                onChange={e => setForm(f => ({ ...f, groupId: e.target.value, ownerId: '' }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="">{t('apartments.form.individualNoGroup')}</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              {form.groupId && (
                <p className="text-xs text-gray-500 mt-1">
                  {t('apartments.form.inheritsFromGroup')}
                </p>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p>{t('apartments.form.noGroupsYet')}</p>
              <p className="mt-1 text-xs text-gray-400">
                {t('apartments.form.groupsAllowGrouping')}
              </p>
            </div>
          )}
        </div>

        {/* Propietario - solo si NO pertenece a un grupo */}
        {!form.groupId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.form.owner')}</label>
            <select
              value={form.ownerId}
              onChange={e => setForm(f => ({ ...f, ownerId: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="">{t('apartments.form.noOwner')}</option>
              {owners.map(o => (
                <option key={o.id} value={o.id}>
                  {o.type === 'EMPRESA' ? o.companyName : `${o.firstName} ${o.lastName}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Comisión y limpieza - SIEMPRE visibles */}
        <div className="space-y-4">
          {form.groupId && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              {t('apartments.form.overrideGroupHint')}
            </div>
          )}

          {/* Comisión de gestión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('apartments.form.managementCommission')}</label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={form.commissionValue}
                    onChange={e => setForm(f => ({ ...f, commissionValue: e.target.value }))}
                    placeholder={form.groupId ? t('apartments.form.inheritedFromGroup') : ''}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                </div>
              </div>
              <span className="text-gray-400">+</span>
              <div className="w-24">
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={form.commissionVat}
                    onChange={e => setForm(f => ({ ...f, commissionVat: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-12 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">% IVA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tasa de limpieza */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('apartments.form.cleaningFee')}</label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={form.cleaningValue}
                    onChange={e => setForm(f => ({ ...f, cleaningValue: e.target.value }))}
                    placeholder={form.groupId ? t('apartments.form.inheritedFromGroup') : ''}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.cleaningVatIncluded}
                  onChange={e => setForm(f => ({ ...f, cleaningVatIncluded: e.target.checked }))}
                  className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                />
                <span className="text-sm text-gray-600">{t('apartments.modal.vatIncluded')}</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">{t('apartments.form.cleaningHintUnit')}</p>
          </div>
        </div>

        {/* Nombres de plataformas para matching de reservas */}
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">{t('apartments.form.platformNamesImport')}</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('apartments.form.airbnbNames')}
                <span className="text-gray-400 font-normal ml-1">({t('apartments.form.commaSeparated')})</span>
              </label>
              <input
                type="text"
                value={form.airbnbNames}
                onChange={e => setForm(f => ({ ...f, airbnbNames: e.target.value }))}
                placeholder="Casa Azul, Casa Azul Alicante"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('apartments.form.bookingNames')}
                <span className="text-gray-400 font-normal ml-1">({t('apartments.form.commaSeparated')})</span>
              </label>
              <input
                type="text"
                value={form.bookingNames}
                onChange={e => setForm(f => ({ ...f, bookingNames: e.target.value }))}
                placeholder="Casa Azul"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('apartments.form.vrboNames')}
                <span className="text-gray-400 font-normal ml-1">({t('apartments.form.commaSeparated')})</span>
              </label>
              <input
                type="text"
                value={form.vrboNames}
                onChange={e => setForm(f => ({ ...f, vrboNames: e.target.value }))}
                placeholder="Casa Azul"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {t('apartments.form.platformNamesHintShort')}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" disabled={saving || !form.name.trim()} className="bg-violet-600 hover:bg-violet-700">
            {saving ? t('apartments.actions.saving') : t('apartments.actions.saveChanges')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ============================================
// EDIT GROUP MODAL
// ============================================
function EditGroupModal({
  group,
  onClose,
  owners,
  availableUnits,
  onSuccess
}: {
  group: BillingUnitGroup | null
  onClose: () => void
  owners: OwnerFull[]
  availableUnits: BillingUnit[]
  onSuccess: () => void
}) {
  const { t } = useTranslation('gestion')
  const [form, setForm] = useState({
    name: '',
    imageUrl: '',
    ownerId: '',
    commissionValue: '15',
    cleaningValue: '0',
    cleaningType: 'FIXED_PER_RESERVATION',
    cleaningFeeRecipient: 'MANAGER',
    cleaningVatIncluded: true
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (group) {
      setForm({
        name: group.name || '',
        imageUrl: group.imageUrl || '',
        ownerId: group.ownerId || '',
        commissionValue: String(group.commissionValue || 15),
        cleaningValue: String(group.cleaningValue || 0),
        cleaningType: group.cleaningType || 'FIXED_PER_RESERVATION',
        cleaningFeeRecipient: group.cleaningFeeRecipient || 'MANAGER',
        cleaningVatIncluded: group.cleaningVatIncluded ?? true
      })
    }
  }, [group])

  if (!group) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.ownerId) return

    setSaving(true)
    try {
      const res = await fetch(`/api/gestion/billing-unit-groups/${group.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name.trim(),
          imageUrl: form.imageUrl || null,
          ownerId: form.ownerId,
          commissionValue: parseFloat(form.commissionValue) || 0,
          cleaningValue: parseFloat(form.cleaningValue) || 0,
          cleaningType: form.cleaningType,
          cleaningFeeRecipient: form.cleaningFeeRecipient,
          cleaningVatIncluded: form.cleaningVatIncluded
        })
      })

      if (res.ok) {
        onSuccess()
      } else {
        const data = await res.json()
        alert(data.error || t('apartments.errors.saveError'))
      }
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={!!group} onClose={onClose} title={t('apartments.modals.editGroup')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ImageUpload
          currentUrl={form.imageUrl || null}
          onUpload={(url) => setForm(f => ({ ...f, imageUrl: url }))}
          label={t('apartments.form.groupPhoto')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.form.name')} *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.form.owner')} *</label>
          <select
            value={form.ownerId}
            onChange={e => setForm(f => ({ ...f, ownerId: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            required
          >
            <option value="">{t('apartments.form.selectOwner')}</option>
            {owners.map(o => (
              <option key={o.id} value={o.id}>
                {o.type === 'EMPRESA' ? o.companyName : `${o.firstName} ${o.lastName}`}
              </option>
            ))}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.form.commissionPercent')}</label>
            <input
              type="number"
              step="0.1"
              value={form.commissionValue}
              onChange={e => setForm(f => ({ ...f, commissionValue: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.form.cleaningEuros')}</label>
            <input
              type="number"
              step="0.01"
              value={form.cleaningValue}
              onChange={e => setForm(f => ({ ...f, cleaningValue: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          {t('apartments.form.cleaningHintGroup')}
        </div>

        {/* Configuración de limpieza */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.form.cleaningType')}</label>
            <select
              value={form.cleaningType}
              onChange={e => setForm(f => ({ ...f, cleaningType: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="FIXED_PER_RESERVATION">{t('apartments.form.cleaningTypeFixed')}</option>
              <option value="PER_NIGHT">{t('apartments.form.cleaningTypePerNight')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartments.form.cleaningFeeRecipient')}</label>
            <select
              value={form.cleaningFeeRecipient}
              onChange={e => setForm(f => ({ ...f, cleaningFeeRecipient: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="MANAGER">{t('apartments.form.cleaningFeeRecipientManager')}</option>
              <option value="OWNER">{t('apartments.form.cleaningFeeRecipientOwner')}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="editCleaningVatIncluded"
            checked={form.cleaningVatIncluded}
            onChange={e => setForm(f => ({ ...f, cleaningVatIncluded: e.target.checked }))}
            className="rounded text-violet-600 focus:ring-violet-500"
          />
          <label htmlFor="editCleaningVatIncluded" className="text-sm text-gray-700">
            {t('apartments.modal.vatIncluded')}
          </label>
        </div>

        {/* Apartamentos actuales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('apartments.modal.apartmentsInGroup')} ({group.billingUnits.length})
          </label>
          {group.billingUnits.length > 0 ? (
            <div className="border border-gray-200 rounded-lg divide-y">
              {group.billingUnits.map(unit => (
                <div key={unit.id} className="flex items-center justify-between p-2">
                  <span className="text-sm">{unit.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">{t('apartments.noUnits')}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" disabled={saving || !form.name.trim() || !form.ownerId} className="bg-violet-600 hover:bg-violet-700">
            {saving ? t('apartments.actions.saving') : t('apartments.actions.saveChanges')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
