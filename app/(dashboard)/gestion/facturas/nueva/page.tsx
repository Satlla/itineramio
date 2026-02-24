'use client'

import { useTranslation } from 'react-i18next'
import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Search,
  X,
  Building2,
  User,
  UserPlus
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Owner {
  id: string
  type: 'PERSONA_FISICA' | 'EMPRESA'
  firstName?: string
  lastName?: string
  companyName?: string
  nif?: string
  cif?: string
  email: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
}

interface ManagerConfig {
  businessName: string
  nif: string
  address: string
  city: string
  postalCode: string
  country: string
  email?: string
  phone?: string
  logoUrl?: string
}

interface InvoiceSeries {
  id: string
  name: string
  prefix: string
  year: number
  currentNumber: number
  isDefault?: boolean
  type: string
}

interface InvoiceItem {
  id: string
  concept: string
  description: string
  quantity: number
  unitPrice: number     // Precio base unitario (sin IVA)
  netTotal: number      // Precio neto unitario (base + IVA - retención)
  vatRate: number
  retentionRate: number // IRPF por línea
  lastEdited: 'base' | 'total' // Para saber qué campo calcular
}

export default function NuevaFacturaPage() {
  const router = useRouter()
  const { t } = useTranslation('gestion')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [owners, setOwners] = useState<Owner[]>([])
  const [series, setSeries] = useState<InvoiceSeries[]>([])
  const [managerConfig, setManagerConfig] = useState<ManagerConfig | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null)
  const [selectedSeriesId, setSelectedSeriesId] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceNumberManual, setInvoiceNumberManual] = useState(false) // Si el usuario editó manualmente
  const [invoiceNumberDuplicate, setInvoiceNumberDuplicate] = useState(false)
  const [checkingDuplicate, setCheckingDuplicate] = useState(false)
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', concept: '', description: '', quantity: 1, unitPrice: 0, netTotal: 0, vatRate: 21, retentionRate: 0, lastEdited: 'base' }
  ])

  // Owner search
  const [ownerSearch, setOwnerSearch] = useState('')
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false)

  // Modal crear contacto
  const [showCreateOwner, setShowCreateOwner] = useState(false)
  const [creatingOwner, setCreatingOwner] = useState(false)
  const [ownerTab, setOwnerTab] = useState<'basico' | 'cuentas'>('basico')
  const [newOwner, setNewOwner] = useState({
    type: 'PERSONA_FISICA' as 'PERSONA_FISICA' | 'EMPRESA',
    firstName: '',
    lastName: '',
    companyName: '',
    nif: '',
    cif: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'España',
    iban: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // Update invoice number when series changes (solo si no fue editado manualmente)
    if (!invoiceNumberManual) {
      const series_ = series.find(s => s.id === selectedSeriesId)
      if (series_) {
        const nextNum = series_.currentNumber + 1
        const shortYear = String(series_.year).slice(-2)
        setInvoiceNumber(`${series_.prefix}${shortYear}${String(nextNum).padStart(4, '0')}`)
        setInvoiceNumberDuplicate(false)
      }
    }
  }, [selectedSeriesId, series, invoiceNumberManual])

  // Verificar duplicados cuando cambia el número (solo si el usuario lo editó manualmente)
  useEffect(() => {
    // Solo verificar si el usuario editó manualmente el número
    if (!invoiceNumberManual) {
      setInvoiceNumberDuplicate(false)
      return
    }

    const checkDuplicate = async () => {
      if (!invoiceNumber || invoiceNumber === 'BORRADOR' || invoiceNumber.length < 3) {
        setInvoiceNumberDuplicate(false)
        return
      }
      setCheckingDuplicate(true)
      try {
        const res = await fetch(`/api/gestion/invoices/check-number?number=${encodeURIComponent(invoiceNumber)}`, {
          credentials: 'include'
        })
        if (res.ok) {
          const data = await res.json()
          setInvoiceNumberDuplicate(data.exists)
        } else {
          // Si hay error en la API, no bloquear - simplemente ignorar
          setInvoiceNumberDuplicate(false)
        }
      } catch (err) {
        // Si hay error de red, no bloquear
        console.error('Error checking duplicate:', err)
        setInvoiceNumberDuplicate(false)
      } finally {
        setCheckingDuplicate(false)
      }
    }

    const timeout = setTimeout(checkDuplicate, 500) // Debounce más largo
    return () => clearTimeout(timeout)
  }, [invoiceNumber, invoiceNumberManual])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [ownersRes, seriesRes, configRes] = await Promise.all([
        fetch('/api/gestion/owners', { credentials: 'include' }),
        fetch('/api/gestion/invoice-series', { credentials: 'include' }),
        fetch('/api/manager-profile', { credentials: 'include' })
      ])

      if (ownersRes.ok) {
        const data = await ownersRes.json()
        setOwners(data.owners || [])
      }

      if (seriesRes.ok) {
        const data = await seriesRes.json()
        const seriesList = data.series || []
        setSeries(seriesList)

        const defaultSeries = seriesList.find((s: InvoiceSeries) => s.isDefault && s.type === 'STANDARD')
        const standardSeries = seriesList.find((s: InvoiceSeries) => s.type === 'STANDARD')

        if (defaultSeries) {
          setSelectedSeriesId(defaultSeries.id)
        } else if (standardSeries) {
          setSelectedSeriesId(standardSeries.id)
        } else if (seriesList.length > 0) {
          setSelectedSeriesId(seriesList[0].id)
        }
      }

      if (configRes.ok) {
        const data = await configRes.json()
        if (data.config) {
          setManagerConfig(data.config)
        }
      }

      // Set default due date (15 days from now)
      const due = new Date()
      due.setDate(due.getDate() + 15)
      setDueDate(due.toISOString().split('T')[0])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getOwnerName = (owner: Owner) => {
    if (owner.type === 'EMPRESA') return owner.companyName || 'Empresa'
    return `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || 'Cliente'
  }

  const getOwnerNif = (owner: Owner) => {
    return owner.type === 'EMPRESA' ? owner.cif : owner.nif
  }

  const filteredOwners = owners.filter(owner => {
    const name = getOwnerName(owner).toLowerCase()
    const nif = (getOwnerNif(owner) || '').toLowerCase()
    const search = ownerSearch.toLowerCase()
    return name.includes(search) || nif.includes(search)
  })

  const resetNewOwner = () => {
    setNewOwner({
      type: 'PERSONA_FISICA',
      firstName: '',
      lastName: '',
      companyName: '',
      nif: '',
      cif: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
        country: 'España',
      iban: ''
    })
    setOwnerTab('basico')
  }

  const handleCreateOwner = async () => {
    setCreatingOwner(true)
    try {
      const response = await fetch('/api/gestion/owners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newOwner)
      })

      if (response.ok) {
        const data = await response.json()
        const createdOwner = data.owner as Owner
        // Añadir a la lista y seleccionar
        setOwners([createdOwner, ...owners])
        setSelectedOwner(createdOwner)
        // Cerrar modal y limpiar
        setShowCreateOwner(false)
        resetNewOwner()
        setOwnerSearch('')
      } else {
        const data = await response.json()
        setError(data.error || t('invoices.errors.createError'))
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setCreatingOwner(false)
    }
  }

  const openCreateOwnerModal = () => {
    resetNewOwner()
    // Pre-rellenar con el texto de búsqueda si es un nombre
    if (ownerSearch.trim()) {
      const parts = ownerSearch.trim().split(' ')
      if (parts.length >= 2) {
        setNewOwner(prev => ({
          ...prev,
          firstName: parts[0],
          lastName: parts.slice(1).join(' ')
        }))
      } else {
        setNewOwner(prev => ({
          ...prev,
          firstName: ownerSearch.trim()
        }))
      }
    }
    setShowOwnerDropdown(false)
    setShowCreateOwner(true)
  }

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), concept: '', description: '', quantity: 1, unitPrice: 0, netTotal: 0, vatRate: 21, retentionRate: 0, lastEdited: 'base' }
    ])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  // Calcular neto desde base: Base + IVA - Retención
  const calculateNetFromBase = (base: number, vatRate: number, retentionRate: number) => {
    const vat = base * (vatRate / 100)
    const retention = base * (retentionRate / 100)
    return base + vat - retention
  }

  // Calcular base desde neto: Base = Neto / (1 + IVA% - Retención%)
  const calculateBaseFromNet = (net: number, vatRate: number, retentionRate: number) => {
    const factor = 1 + (vatRate / 100) - (retentionRate / 100)
    return factor === 0 ? net : net / factor
  }

  // Actualizar base y recalcular neto
  const updateItemBase = (id: string, baseValue: number) => {
    setItems(items.map(item => {
      if (item.id !== id) return item
      const netTotal = calculateNetFromBase(baseValue, item.vatRate, item.retentionRate)
      return { ...item, unitPrice: baseValue, netTotal, lastEdited: 'base' as const }
    }))
  }

  // Actualizar neto y recalcular base
  const updateItemTotal = (id: string, netValue: number) => {
    setItems(items.map(item => {
      if (item.id !== id) return item
      const unitPrice = calculateBaseFromNet(netValue, item.vatRate, item.retentionRate)
      return { ...item, netTotal: netValue, unitPrice, lastEdited: 'total' as const }
    }))
  }

  // Recalcular cuando cambia el IVA
  const updateItemVat = (id: string, newVatRate: number) => {
    setItems(items.map(item => {
      if (item.id !== id) return item
      if (item.lastEdited === 'base') {
        const netTotal = calculateNetFromBase(item.unitPrice, newVatRate, item.retentionRate)
        return { ...item, vatRate: newVatRate, netTotal }
      } else {
        const unitPrice = calculateBaseFromNet(item.netTotal, newVatRate, item.retentionRate)
        return { ...item, vatRate: newVatRate, unitPrice }
      }
    }))
  }

  // Recalcular cuando cambia la retención
  const updateItemRetention = (id: string, newRetentionRate: number) => {
    setItems(items.map(item => {
      if (item.id !== id) return item
      if (item.lastEdited === 'base') {
        const netTotal = calculateNetFromBase(item.unitPrice, item.vatRate, newRetentionRate)
        return { ...item, retentionRate: newRetentionRate, netTotal }
      } else {
        const unitPrice = calculateBaseFromNet(item.netTotal, item.vatRate, newRetentionRate)
        return { ...item, retentionRate: newRetentionRate, unitPrice }
      }
    }))
  }

  // Calcular base total de línea (unitPrice * quantity)
  const calculateItemBase = (item: InvoiceItem) => {
    return item.unitPrice * item.quantity
  }

  const calculateItemVatAmount = (item: InvoiceItem) => {
    return calculateItemBase(item) * (item.vatRate / 100)
  }

  const calculateItemRetention = (item: InvoiceItem) => {
    return calculateItemBase(item) * (item.retentionRate / 100)
  }

  // Calcular neto total de línea (netTotal * quantity)
  const calculateItemNetTotal = (item: InvoiceItem) => {
    return item.netTotal * item.quantity
  }

  // Totals
  const subtotal = items.reduce((sum, item) => sum + calculateItemBase(item), 0)
  const totalVat = items.reduce((sum, item) => sum + calculateItemVatAmount(item), 0)
  const totalRetention = items.reduce((sum, item) => sum + calculateItemRetention(item), 0)
  const grandTotal = subtotal + totalVat - totalRetention

  // Calcular porcentaje de retención promedio (para mostrar en totales)
  const avgRetentionRate = subtotal > 0 ? (totalRetention / subtotal) * 100 : 0
  const hasRetentions = items.some(item => item.retentionRate > 0)

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + '€'
  }

  const handleSubmit = async () => {
    setError(null)

    if (!selectedOwner) {
      setError(t('invoices.new.selectContact'))
      return
    }

    if (!selectedSeriesId) {
      setError(t('invoices.new.selectSeries'))
      return
    }

    const validItems = items.filter(item => item.concept.trim() && (item.unitPrice > 0 || item.netTotal > 0))
    if (validItems.length === 0) {
      setError(t('invoices.new.addAtLeastOneLine'))
      return
    }

    setSaving(true)
    try {
      // Convertir items: API espera unitPrice (precio base sin IVA)
      const apiItems = validItems.map(item => ({
        concept: item.concept,
        description: item.description || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice, // Ya está mantenido por la edición bidireccional
        vatRate: item.vatRate,
        retentionRate: item.retentionRate
      }))

      const response = await fetch('/api/gestion/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ownerId: selectedOwner.id,
          seriesId: selectedSeriesId,
          issueDate,
          dueDate: dueDate || null,
          items: apiItems
        })
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/gestion/facturas/${data.invoice.id}`)
      } else {
        const data = await response.json()
        setError(data.error || t('invoices.errors.createError'))
      }
    } catch (error) {
      setError(t('invoices.errors.connectionError'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Link href="/gestion/facturas" className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{t('invoices.new.title')}</h1>
            </div>
            <button
              onClick={handleSubmit}
              disabled={saving || !selectedOwner}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2 font-medium text-sm sm:text-base flex-shrink-0"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">{saving ? t('invoices.new.saving') : t('invoices.actions.saveDraft')}</span>
              <span className="sm:hidden">{saving ? '...' : t('invoices.actions.saveDraftShort')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between gap-2">
            <span className="text-sm text-red-700">{error}</span>
            <button onClick={() => setError(null)} className="flex-shrink-0">
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">

          {/* Header con Logo y Datos del Gestor */}
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              {/* Logo y datos del gestor */}
              <div className="flex items-start gap-3 sm:gap-4">
                {managerConfig?.logoUrl ? (
                  <img src={managerConfig.logoUrl} alt="Logo" className="h-12 sm:h-16 w-auto object-contain" />
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
                  </div>
                )}
                {managerConfig ? (
                  <div className="text-xs sm:text-sm text-gray-600">
                    <p className="font-semibold text-gray-900">{managerConfig.businessName}</p>
                    <p>{managerConfig.nif}</p>
                    <p className="hidden sm:block">{managerConfig.address}</p>
                    <p className="hidden sm:block">{managerConfig.postalCode} {managerConfig.city}</p>
                  </div>
                ) : (
                  <Link href="/gestion/perfil-gestor" className="text-sm text-blue-600 hover:underline">
                    Configura tus datos fiscales
                  </Link>
                )}
              </div>

              {/* Número de factura */}
              <div className="text-left sm:text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t('invoices.new.invoice')}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{invoiceNumber || t('invoices.new.draft')}</p>
              </div>
            </div>
          </div>

          {/* Campos principales en fila */}
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Contacto */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-600 mb-2">{t('invoices.new.contact')}</label>
                {selectedOwner ? (
                  <div className="border border-gray-200 rounded-lg p-3 bg-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{getOwnerName(selectedOwner)}</p>
                        <p className="text-sm text-gray-500">{getOwnerNif(selectedOwner)}</p>
                      </div>
                      <button
                        onClick={() => setSelectedOwner(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={ownerSearch}
                      onChange={(e) => {
                        setOwnerSearch(e.target.value)
                        setShowOwnerDropdown(true)
                      }}
                      onFocus={() => setShowOwnerDropdown(true)}
                      placeholder={t('invoices.new.searchContact')}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm bg-white"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                    {showOwnerDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-auto">
                        {/* Botón crear contacto siempre visible */}
                        <button
                          onClick={openCreateOwnerModal}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-200 flex items-center gap-2 text-blue-600"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span className="font-medium">
                            {ownerSearch.trim() ? t('invoices.new.createContact', { name: ownerSearch.trim() }) : t('invoices.new.createNewContact')}
                          </span>
                        </button>

                        {filteredOwners.length > 0 ? (
                          filteredOwners.map(owner => (
                            <button
                              key={owner.id}
                              onClick={() => {
                                setSelectedOwner(owner)
                                setOwnerSearch('')
                                setShowOwnerDropdown(false)
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                            >
                              <p className="font-medium text-gray-900">{getOwnerName(owner)}</p>
                              <p className="text-sm text-gray-500">{getOwnerNif(owner)}</p>
                            </button>
                          ))
                        ) : ownerSearch.trim() ? (
                          <p className="px-4 py-3 text-sm text-gray-500">{t('invoices.new.noContactFound')} "{ownerSearch}"</p>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Número de documento */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">{t('invoices.new.documentNumber')}</label>
                <div className="relative">
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => {
                      setInvoiceNumber(e.target.value)
                      setInvoiceNumberManual(true)
                    }}
                    placeholder="F260001"
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-white ${
                      invoiceNumberDuplicate
                        ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                  {checkingDuplicate && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    </div>
                  )}
                </div>
                {invoiceNumberDuplicate && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <span>⚠</span> {t('invoices.new.numberExists')}
                  </p>
                )}
                {invoiceNumberManual && !invoiceNumberDuplicate && (
                  <button
                    type="button"
                    onClick={() => {
                      setInvoiceNumberManual(false)
                      // Trigger recalculation
                      const series_ = series.find(s => s.id === selectedSeriesId)
                      if (series_) {
                        const nextNum = series_.currentNumber + 1
                        const shortYear = String(series_.year).slice(-2)
                        setInvoiceNumber(`${series_.prefix}${shortYear}${String(nextNum).padStart(4, '0')}`)
                      }
                    }}
                    className="mt-1 text-xs text-blue-600 hover:underline"
                  >
                    {t('invoices.new.useAutoNumber')}
                  </button>
                )}
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">{t('invoices.new.date')}</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white"
                />
              </div>

              {/* Vencimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">{t('invoices.new.dueDate')}</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white"
                />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-4 sm:p-6 overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3 min-w-[150px]">{t('invoices.table.concept')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3 min-w-[120px]">{t('invoices.table.description')}</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase pb-3 w-16">{t('invoices.table.quantity')}</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase pb-3 w-24">{t('invoices.table.base')}</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase pb-3 w-20">{t('invoices.table.vat')}</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase pb-3 w-20">{t('invoices.table.retention')}</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase pb-3 w-28">{t('invoices.table.amount')}</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 group">
                      <td className="py-3 pr-2">
                        <input
                          type="text"
                          value={item.concept}
                          onChange={(e) => updateItem(item.id, 'concept', e.target.value)}
                          placeholder="Gestión apartamento turístico"
                          className="w-full border-0 bg-transparent text-sm focus:ring-0 focus:outline-none placeholder-gray-300"
                        />
                      </td>
                      <td className="py-3 pr-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Reservas, incidencias, att cliente"
                          className="w-full border-0 bg-transparent text-sm text-gray-500 focus:ring-0 focus:outline-none placeholder-gray-300"
                        />
                      </td>
                      <td className="py-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-14 text-center border border-gray-200 rounded px-1 py-1 text-sm"
                        />
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice || ''}
                            onChange={(e) => updateItemBase(item.id, parseFloat(e.target.value) || 0)}
                            placeholder="100,00"
                            className={`w-20 text-right border rounded px-2 py-1 text-sm ${
                              item.lastEdited === 'base' ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                            }`}
                          />
                          <span className="ml-1 text-gray-400 text-sm">€</span>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <select
                          value={item.vatRate}
                          onChange={(e) => updateItemVat(item.id, parseInt(e.target.value))}
                          className="border border-gray-200 rounded px-1 py-1 text-sm w-16 bg-white"
                        >
                          <option value={0}>0%</option>
                          <option value={4}>4%</option>
                          <option value={10}>10%</option>
                          <option value={21}>21%</option>
                        </select>
                      </td>
                      <td className="py-3 text-center">
                        <select
                          value={item.retentionRate}
                          onChange={(e) => updateItemRetention(item.id, parseInt(e.target.value))}
                          className="border border-gray-200 rounded px-1 py-1 text-sm w-16 bg-white"
                        >
                          <option value={0}>0%</option>
                          <option value={1}>1%</option>
                          <option value={2}>2%</option>
                          <option value={7}>7%</option>
                          <option value={15}>15%</option>
                          <option value={19}>19%</option>
                        </select>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.netTotal || ''}
                            onChange={(e) => updateItemTotal(item.id, parseFloat(e.target.value) || 0)}
                            placeholder="106,00"
                            className={`w-20 text-right border rounded px-2 py-1 text-sm font-medium ${
                              item.lastEdited === 'total' ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                            }`}
                          />
                          <span className="ml-1 text-gray-400 text-sm">€</span>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* Añadir línea */}
            <button
              onClick={addItem}
              className="mt-4 w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              {t('invoices.table.addLine')}
            </button>

            {/* Totales */}
            <div className="mt-8 flex justify-end">
              <div className="w-full sm:w-80">
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-600">{t('invoices.table.subtotal')}</span>
                  <span className="text-gray-900 font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-600">{t('invoices.table.totalVat')}</span>
                  <span className="text-gray-900">{formatCurrency(totalVat)}</span>
                </div>

                {hasRetentions && (
                  <div className="flex justify-between py-2 text-sm border-t border-gray-100 mt-2 pt-2">
                    <span className="text-gray-600">
                      {t('invoices.table.totalRetention')} ({avgRetentionRate % 1 === 0 ? avgRetentionRate.toFixed(0) : avgRetentionRate.toFixed(1)}%)
                    </span>
                    <span className="text-red-600">-{formatCurrency(totalRetention)}</span>
                  </div>
                )}

                <div className="flex justify-between py-3 text-lg font-bold border-t-2 border-gray-900 mt-2">
                  <span>{t('invoices.table.totalToPay')}</span>
                  <span className="text-blue-600">{formatCurrency(grandTotal)}</span>
                </div>

                {hasRetentions && (
                  <p className="text-xs text-gray-500 text-right mt-1">
                    {t('invoices.table.grossAmount')} {formatCurrency(subtotal + totalVat)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showOwnerDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowOwnerDropdown(false)}
        />
      )}

      {/* Modal Crear Contacto - Estilo Holded */}
      {showCreateOwner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header fijo */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{t('invoices.contactModal.title')}</h3>
                <button
                  onClick={() => setShowCreateOwner(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nombre + NIF + Tipo */}
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">{t('invoices.contactModal.name')}</label>
                  {newOwner.type === 'PERSONA_FISICA' ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newOwner.firstName}
                        onChange={(e) => setNewOwner(prev => ({ ...prev, firstName: e.target.value }))}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t('invoices.contactModal.firstName')}
                      />
                      <input
                        type="text"
                        value={newOwner.lastName}
                        onChange={(e) => setNewOwner(prev => ({ ...prev, lastName: e.target.value }))}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t('invoices.contactModal.lastName')}
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={newOwner.companyName}
                      onChange={(e) => setNewOwner(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('invoices.contactModal.companyName')}
                    />
                  )}
                </div>
                <div className="w-36">
                  <label className="block text-xs text-gray-500 mb-1">{t('invoices.contactModal.nif')}</label>
                  <input
                    type="text"
                    value={newOwner.type === 'PERSONA_FISICA' ? newOwner.nif : newOwner.cif}
                    onChange={(e) => setNewOwner(prev => ({
                      ...prev,
                      [prev.type === 'PERSONA_FISICA' ? 'nif' : 'cif']: e.target.value.toUpperCase()
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={newOwner.type === 'PERSONA_FISICA' ? '12345678A' : 'B12345678'}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('invoices.contactModal.contactType')}</label>
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => setNewOwner(prev => ({ ...prev, type: 'EMPRESA' }))}
                      className={`px-3 py-2 text-sm font-medium rounded-l-lg border ${
                        newOwner.type === 'EMPRESA'
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {t('invoices.contactModal.company')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewOwner(prev => ({ ...prev, type: 'PERSONA_FISICA' }))}
                      className={`px-3 py-2 text-sm font-medium rounded-r-lg border-t border-r border-b ${
                        newOwner.type === 'PERSONA_FISICA'
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {t('invoices.contactModal.individual')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-6 mt-4 border-b border-gray-200 -mb-[1px]">
                <button
                  onClick={() => setOwnerTab('basico')}
                  className={`pb-2 text-sm font-medium border-b-2 ${
                    ownerTab === 'basico'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  {t('invoices.contactModal.tabs.basic')}
                </button>
                <button
                  onClick={() => setOwnerTab('cuentas')}
                  className={`pb-2 text-sm font-medium border-b-2 ${
                    ownerTab === 'cuentas'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  {t('invoices.contactModal.tabs.accounts')}
                </button>
              </div>
            </div>

            {/* Content scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              {ownerTab === 'basico' && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Columna izquierda - Dirección */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t('invoices.contactModal.address')}</label>
                      <input
                        type="text"
                        value={newOwner.address}
                        onChange={(e) => setNewOwner(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        placeholder={t('invoices.contactModal.addressPlaceholder')}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t('invoices.contactModal.city')}</label>
                        <input
                          type="text"
                          value={newOwner.city}
                          onChange={(e) => setNewOwner(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          placeholder={t('invoices.contactModal.cityPlaceholder')}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t('invoices.contactModal.postalCode')}</label>
                        <input
                          type="text"
                          value={newOwner.postalCode}
                          onChange={(e) => setNewOwner(prev => ({ ...prev, postalCode: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          placeholder="28001"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t('invoices.contactModal.country')}</label>
                      <select
                        value={newOwner.country}
                        onChange={(e) => setNewOwner(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                      >
                        <option value="España">España</option>
                        <option value="Portugal">Portugal</option>
                        <option value="Francia">Francia</option>
                        <option value="Italia">Italia</option>
                        <option value="Alemania">Alemania</option>
                        <option value="Reino Unido">Reino Unido</option>
                        <option value="México">México</option>
                        <option value="Argentina">Argentina</option>
                        <option value="Colombia">Colombia</option>
                        <option value="Chile">Chile</option>
                      </select>
                    </div>
                  </div>

                  {/* Columna derecha - Contacto */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t('invoices.contactModal.email')}</label>
                      <input
                        type="email"
                        value={newOwner.email}
                        onChange={(e) => setNewOwner(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        placeholder={t('invoices.contactModal.emailPlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t('invoices.contactModal.phone')}</label>
                      <input
                        type="tel"
                        value={newOwner.phone}
                        onChange={(e) => setNewOwner(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        placeholder={t('invoices.contactModal.phonePlaceholder')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {ownerTab === 'cuentas' && (
                <div className="max-w-md">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t('invoices.contactModal.iban')}</label>
                    <input
                      type="text"
                      value={newOwner.iban}
                      onChange={(e) => setNewOwner(prev => ({ ...prev, iban: e.target.value.toUpperCase().replace(/\s/g, '') }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                      placeholder="ES00 0000 0000 0000 0000 0000"
                    />
                    <p className="text-xs text-gray-400 mt-1">{t('invoices.contactModal.ibanDescription')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleCreateOwner}
                disabled={creatingOwner || (newOwner.type === 'PERSONA_FISICA' ? !newOwner.firstName : !newOwner.companyName) || !newOwner.email || !newOwner.address || !newOwner.city || !newOwner.postalCode}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingOwner ? t('invoices.new.creating') : t('invoices.new.createContact')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
