'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { formatCurrency, round2 } from '@/lib/format'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  Plus,
  Search,
  Home,
  Euro,
  Moon,
  User,
  X,
  ChevronDown,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  Building2,
  Sparkles,
  Trash2,
  Edit2,
  Mail,
  Phone,
  Star,
  History,
  UserCheck,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  Settings2,
  ArrowLeft
} from 'lucide-react'
import { Button, Card, CardContent, Badge } from '../../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardFooter } from '../../../../src/components/layout/DashboardFooter'
import { SimpleColumnMapper, type SimpleMapping } from '../../../../src/components/gestion/reservas/SimpleColumnMapper'

interface Property {
  id: string
  name: string
  address?: string
  hasBillingConfig: boolean
  billingConfigId: string | null
}

interface BillingUnit {
  id: string
  name: string
  city: string | null
  imageUrl: string | null
  commissionValue: number
  cleaningValue: number
  ownerName: string | null
}

interface BillingConfig {
  id: string
  commissionValue: number
  cleaningValue: number
  property: {
    id: string
    name: string
    profileImage?: string
  }
}

interface Guest {
  id: string
  name: string
  email?: string
  phone?: string
  totalStays: number
  notes?: string
  tags?: string[]
  lastStayAt?: string
}

interface Reservation {
  id: string
  platform: string
  confirmationCode: string
  guestName: string
  guestEmail?: string
  guestPhone?: string
  checkIn: string
  checkOut: string
  nights: number
  hostEarnings: number
  roomTotal: number
  cleaningFee: number
  hostServiceFee: number
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED'
  importSource?: string
  internalNotes?: string
  billingConfig: BillingConfig
  liquidation?: { id: string; status: string }
  guest?: Guest
}

const PLATFORM_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  AIRBNB: { label: 'Airbnb', color: 'text-[#FF5A5F]', bgColor: 'bg-red-50' },
  BOOKING: { label: 'Booking', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  VRBO: { label: 'VRBO', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  DIRECT: { label: 'Directo', color: 'text-green-600', bgColor: 'bg-green-50' },
  OTHER: { label: 'Otro', color: 'text-gray-600', bgColor: 'bg-gray-50' }
}

const STATUS_CONFIG = {
  CONFIRMED: { label: 'Confirmada', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  PENDING: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700', icon: Clock },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-700', icon: XCircle },
  COMPLETED: { label: 'Completada', color: 'bg-violet-100 text-violet-700', icon: CheckCircle }
}

export default function ReservasPage() {
  const [loading, setLoading] = useState(true)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [billingUnits, setBillingUnits] = useState<BillingUnit[]>([])
  const [totals, setTotals] = useState({ count: 0, earnings: 0, nights: 0, confirmed: 0 })

  // Filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [platformFilter, setPlatformFilter] = useState('')
  const [propertyFilter, setPropertyFilter] = useState('')

  // Modal
  const [showNewModal, setShowNewModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editMode, setEditMode] = useState(false)

  // Multi-select for bulk delete
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  // Guest search
  const [guestSearchResults, setGuestSearchResults] = useState<Guest[]>([])
  const [searchingGuest, setSearchingGuest] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [showGuestDropdown, setShowGuestDropdown] = useState(false)
  const guestSearchTimeout = React.useRef<NodeJS.Timeout | null>(null)

  // CSV Import
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)

  // Simple column mapper state
  const [showColumnMapper, setShowColumnMapper] = useState(false)
  const [rawHeaders, setRawHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<string[][]>([])
  const [simpleMapping, setSimpleMapping] = useState<SimpleMapping | null>(null)
  const [detectedPlatform, setDetectedPlatform] = useState<'AIRBNB' | 'BOOKING' | 'UNKNOWN'>('UNKNOWN')
  const [importPropertyId, setImportPropertyId] = useState('')
  const [replaceExisting, setReplaceExisting] = useState(false)
  const [importResults, setImportResults] = useState<{
    imported: number
    skipped: number
    errors: { row: number; reason: string }[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    billingConfigId: '',
    billingUnitId: '', // Nuevo: apartamento independiente de Gestión
    platform: 'AIRBNB',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: '',
    checkOut: '',
    hostEarnings: '',
    cleaningFee: '',
    internalNotes: ''
  })

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i)
  const monthOptions = [
    { value: '', label: 'Todo el año' },
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ]

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    fetchReservations()
  }, [selectedYear, selectedMonth, statusFilter, platformFilter, propertyFilter])

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/gestion/properties-simple', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setProperties(data.properties || [])
        setBillingUnits(data.billingUnits || [])
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    }
  }

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ year: selectedYear.toString() })
      if (selectedMonth) params.append('month', selectedMonth.toString())
      if (statusFilter) params.append('status', statusFilter)
      if (platformFilter) params.append('platform', platformFilter)
      if (propertyFilter) params.append('propertyId', propertyFilter)

      const response = await fetch(`/api/gestion/reservations?${params}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setReservations(data.reservations || [])
        setTotals(data.totals || { count: 0, earnings: 0, nights: 0, confirmed: 0 })
      }
    } catch (error) {
      console.error('Error fetching reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-calculations for form
  const selectedProperty = useMemo(() => {
    return properties.find(p => p.billingConfigId === formData.billingConfigId)
  }, [properties, formData.billingConfigId])

  const calculatedNights = useMemo(() => {
    if (!formData.checkIn || !formData.checkOut) return 0
    const diff = new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }, [formData.checkIn, formData.checkOut])

  const pricePerNight = useMemo(() => {
    if (!calculatedNights || !formData.hostEarnings) return 0
    const earnings = parseFloat(formData.hostEarnings) || 0
    const cleaning = parseFloat(formData.cleaningFee) || 0
    return ((earnings - cleaning) / calculatedNights).toFixed(2)
  }, [calculatedNights, formData.hostEarnings, formData.cleaningFee])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Requiere billingUnitId O billingConfigId
    if ((!formData.billingConfigId && !formData.billingUnitId) || !formData.guestName || !formData.checkIn || !formData.checkOut || !formData.hostEarnings) {
      alert('Por favor completa todos los campos obligatorios')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/gestion/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          hostEarnings: parseFloat(formData.hostEarnings),
          cleaningFee: formData.cleaningFee ? parseFloat(formData.cleaningFee) : undefined
        })
      })

      if (response.ok) {
        setShowNewModal(false)
        resetForm()
        fetchReservations()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al crear la reserva')
      }
    } catch (error) {
      console.error('Error creating reservation:', error)
      alert('Error al crear la reserva')
    } finally {
      setSaving(false)
    }
  }

  const startEditReservation = (reservation: Reservation) => {
    setFormData({
      billingConfigId: reservation.billingConfig.id,
      platform: reservation.platform,
      guestName: reservation.guestName,
      guestEmail: reservation.guestEmail || '',
      guestPhone: reservation.guestPhone || '',
      checkIn: reservation.checkIn.split('T')[0],
      checkOut: reservation.checkOut.split('T')[0],
      hostEarnings: String(reservation.hostEarnings),
      cleaningFee: String(reservation.cleaningFee || ''),
      internalNotes: reservation.internalNotes || ''
    })
    setEditMode(true)
  }

  const handleUpdateReservation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReservation) return

    setSaving(true)
    try {
      const response = await fetch(`/api/gestion/reservations/${selectedReservation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          guestName: formData.guestName,
          guestEmail: formData.guestEmail || null,
          guestPhone: formData.guestPhone || null,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          hostEarnings: parseFloat(formData.hostEarnings),
          cleaningFee: formData.cleaningFee ? parseFloat(formData.cleaningFee) : undefined,
          internalNotes: formData.internalNotes || null,
          status: selectedReservation.status
        })
      })

      if (response.ok) {
        setEditMode(false)
        setSelectedReservation(null)
        fetchReservations()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al actualizar la reserva')
      }
    } catch (error) {
      console.error('Error updating reservation:', error)
      alert('Error al actualizar la reserva')
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setEditMode(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      billingConfigId: '',
      platform: 'AIRBNB',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      checkIn: '',
      checkOut: '',
      hostEarnings: '',
      cleaningFee: '',
      internalNotes: ''
    })
    setSelectedGuest(null)
    setGuestSearchResults([])
    setShowGuestDropdown(false)
  }

  // Guest search with debounce
  const searchGuests = async (query: string) => {
    if (query.length < 2) {
      setGuestSearchResults([])
      setShowGuestDropdown(false)
      return
    }

    setSearchingGuest(true)
    try {
      const response = await fetch(`/api/gestion/guests/search?q=${encodeURIComponent(query)}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setGuestSearchResults(data.guests || [])
        setShowGuestDropdown(data.guests?.length > 0)
      }
    } catch (error) {
      console.error('Error searching guests:', error)
    } finally {
      setSearchingGuest(false)
    }
  }

  const handleGuestNameChange = (value: string) => {
    setFormData({ ...formData, guestName: value })
    setSelectedGuest(null)

    // Debounced search
    if (guestSearchTimeout.current) {
      clearTimeout(guestSearchTimeout.current)
    }
    guestSearchTimeout.current = setTimeout(() => {
      searchGuests(value)
    }, 300)
  }

  const handleGuestEmailChange = (value: string) => {
    setFormData({ ...formData, guestEmail: value })

    // Also search by email
    if (guestSearchTimeout.current) {
      clearTimeout(guestSearchTimeout.current)
    }
    guestSearchTimeout.current = setTimeout(() => {
      if (value.includes('@')) {
        searchGuests(value)
      }
    }, 300)
  }

  const selectGuest = (guest: Guest) => {
    setSelectedGuest(guest)
    setFormData({
      ...formData,
      guestName: guest.name,
      guestEmail: guest.email || '',
      guestPhone: guest.phone || ''
    })
    setShowGuestDropdown(false)
    setGuestSearchResults([])
  }

  const handleDeleteReservation = async () => {
    if (!selectedReservation) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/gestion/reservations/${selectedReservation.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setShowDeleteConfirm(false)
        setSelectedReservation(null)
        fetchReservations()
      } else {
        const data = await response.json()
        alert(data.error || 'Error al eliminar la reserva')
      }
    } catch (error) {
      console.error('Error deleting reservation:', error)
      alert('Error al eliminar la reserva')
    } finally {
      setDeleting(false)
    }
  }

  const openReservationDetail = (reservation: Reservation) => {
    setSelectedReservation(reservation)
  }

  // Bulk selection handlers
  const toggleSelectReservation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return

    setBulkDeleting(true)
    try {
      const response = await fetch('/api/gestion/reservations/bulk-delete-ids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      })

      const data = await response.json()

      if (response.ok) {
        setShowBulkDeleteConfirm(false)
        setSelectedIds(new Set())
        fetchReservations()
      } else {
        alert(data.error || 'Error al eliminar las reservas')
      }
    } catch (error) {
      console.error('Error bulk deleting:', error)
      alert('Error al eliminar las reservas')
    } finally {
      setBulkDeleting(false)
    }
  }

  // CSV Import handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xls') && !fileName.endsWith('.xlsx')) {
      alert('Por favor selecciona un archivo CSV o Excel')
      return
    }

    setImportFile(file)
    setImportResults(null)
    setShowColumnMapper(false)
    setSimpleMapping(null)

    try {
      let text: string

      // Handle XLS/XLSX files
      if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
        const XLSX = await import('xlsx')
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        text = XLSX.utils.sheet_to_csv(sheet, { FS: ',' })
      } else {
        text = await file.text()
      }

      // Parse CSV
      const { headers, rows, platform } = parseCSVForImport(text)
      setRawHeaders(headers)
      setRawRows(rows)
      setDetectedPlatform(platform)

      // Try to auto-detect column mapping
      if (platform === 'UNKNOWN') {
        const autoMapping = autoDetectColumns(headers)
        if (autoMapping) {
          // All columns detected automatically!
          setSimpleMapping(autoMapping)
        }
        // If not all detected, user will need to click "Configurar mapeo"
      }
    } catch (error) {
      console.error('Error parsing file:', error)
      alert('Error al leer el archivo')
    }
  }

  // Handle simple mapping confirm
  const handleSimpleMappingConfirm = (mapping: SimpleMapping) => {
    setSimpleMapping(mapping)
    setShowColumnMapper(false)
  }

  const handleCSVImport = async () => {
    if (!importFile) return

    // If using simple mapping, require property selection
    if (simpleMapping && !importPropertyId) {
      alert('Selecciona una propiedad para importar')
      return
    }

    setImporting(true)
    setImportResults(null)

    try {
      // If replace existing is checked, delete current reservations AND draft invoices
      if (replaceExisting && importPropertyId) {
        console.log('Deleting existing reservations for property:', importPropertyId)

        // Delete reservations
        const deleteResponse = await fetch('/api/gestion/reservations/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            propertyId: importPropertyId,
            deleteAll: true
          })
        })
        const deleteResult = await deleteResponse.json()
        console.log('Delete result:', deleteResult)

        if (deleteResult.error) {
          console.error('Error deleting reservations:', deleteResult.error)
        }

        // Also delete draft invoices so they regenerate with fresh data
        await fetch('/api/gestion/invoices/delete-drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            propertyId: importPropertyId
          })
        })
      }

      let response: Response

      // For known platforms (Airbnb/Booking), ALWAYS use standard APIs
      // They handle commission, cleaning fees, etc. correctly
      if (detectedPlatform === 'AIRBNB' || detectedPlatform === 'BOOKING') {
        const formData = new FormData()
        formData.append('file', importFile)
        if (importPropertyId) {
          formData.append('propertyId', importPropertyId)
        }
        formData.append('skipDuplicates', 'true')

        const apiUrl = detectedPlatform === 'BOOKING'
          ? '/api/gestion/reservations/import-booking'
          : '/api/gestion/reservations/import-csv'

        response = await fetch(apiUrl, {
          method: 'POST',
          credentials: 'include',
          body: formData
        })
      } else if (simpleMapping) {
        // Unknown format with column mapping - use universal import
        response = await fetch('/api/gestion/reservations/import-universal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            rows: rawRows,
            mapping: {
              guestName: simpleMapping.guestName,
              checkIn: simpleMapping.checkIn,
              checkOut: simpleMapping.checkOut,
              amount: simpleMapping.amount,
            },
            config: {
              dateFormat: 'DD/MM/YYYY',
              numberFormat: 'EU',
              amountType: 'NET',
              platform: 'OTHER'
            },
            propertyId: importPropertyId,
            skipDuplicates: true
          })
        })
      } else {
        // Fallback to CSV import
        const formData = new FormData()
        formData.append('file', importFile)
        if (importPropertyId) {
          formData.append('propertyId', importPropertyId)
        }
        formData.append('skipDuplicates', 'true')

        response = await fetch('/api/gestion/reservations/import-csv', {
          method: 'POST',
          credentials: 'include',
          body: formData
        })
      }

      const data = await response.json()
      console.log('Import response:', data)

      if (response.ok) {
        // Handle both API response formats (importedCount vs imported)
        const importedCount = data.results?.importedCount ?? data.results?.imported ?? 0
        const skippedCount = data.results?.skippedCount ?? data.results?.skipped ?? 0
        const errors = data.results?.errors?.map((e: { row: number; error?: string; reason?: string }) => ({
          row: e.row,
          reason: e.error || e.reason || 'Error desconocido'
        })) || []

        console.log('Parsed results:', { importedCount, skippedCount, errors: errors.length })

        setImportResults({
          imported: importedCount,
          skipped: skippedCount,
          errors
        })
        if (importedCount > 0) {
          fetchReservations()
        }
      } else {
        console.error('Import error:', data)
        alert(data.error || 'Error al importar el archivo')
      }
    } catch (error) {
      console.error('Error importing CSV:', error)
      alert('Error al importar el archivo')
    } finally {
      setImporting(false)
    }
  }

  const closeImportModal = () => {
    setShowImportModal(false)
    setImportFile(null)
    setImportPropertyId('')
    setImportResults(null)
    setShowColumnMapper(false)
    setRawHeaders([])
    setRawRows([])
    setSimpleMapping(null)
    setDetectedPlatform('UNKNOWN')
    setReplaceExisting(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Filter reservations by search term
  const filteredReservations = reservations.filter(r => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return r.guestName.toLowerCase().includes(term) ||
        r.confirmationCode.toLowerCase().includes(term) ||
        r.billingConfig.property.name.toLowerCase().includes(term)
    }
    return true
  })

  // Selectable reservations (not liquidated)
  const selectableReservations = filteredReservations.filter(r => !r.liquidation)

  const toggleSelectAll = () => {
    if (selectedIds.size === selectableReservations.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(selectableReservations.map(r => r.id)))
    }
  }

  if (loading && reservations.length === 0) {
    return <AnimatedLoadingSpinner text="Cargando reservas..." type="general" />
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
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CalendarDays className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
                  <p className="text-sm text-gray-600">
                    Gestiona todas las reservas de tus propiedades
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {selectedIds.size > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setShowBulkDeleteConfirm(true)}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar ({selectedIds.size})
                  </Button>
                )}
                <Link href="/gestion/reservas/importar">
                  <Button
                    variant="outline"
                    className="border-violet-200 text-violet-700 hover:bg-violet-50"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Importar CSV
                  </Button>
                </Link>
                <Button
                  onClick={() => setShowNewModal(true)}
                  className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 shadow-lg shadow-violet-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva reserva
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards - Airbnb style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6"
          >
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white overflow-hidden">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Total reservas</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totals.count}</p>
                  </div>
                  <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-violet-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white overflow-hidden">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Ingresos</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {formatCurrency(totals.earnings)}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Euro className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white overflow-hidden">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Noches</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totals.nights}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Moon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white overflow-hidden">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Confirmadas</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totals.confirmed}</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters - Airbnb style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-6"
          >
            <Card className="border-0 shadow-md bg-white">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-3">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por huésped, código o propiedad..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Year & Month */}
                  <div className="flex gap-2">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    >
                      {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <select
                      value={selectedMonth || ''}
                      onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    >
                      {monthOptions.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status & Platform */}
                  <div className="flex gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    >
                      <option value="">Todos los estados</option>
                      <option value="CONFIRMED">Confirmada</option>
                      <option value="PENDING">Pendiente</option>
                      <option value="CANCELLED">Cancelada</option>
                    </select>
                    <select
                      value={platformFilter}
                      onChange={(e) => setPlatformFilter(e.target.value)}
                      className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    >
                      <option value="">Todas las plataformas</option>
                      <option value="AIRBNB">Airbnb</option>
                      <option value="BOOKING">Booking</option>
                      <option value="VRBO">VRBO</option>
                      <option value="DIRECT">Directo</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reservations List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Select all header */}
            {filteredReservations.length > 0 && selectableReservations.length > 0 && (
              <div className="flex items-center gap-3 mb-3 px-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === selectableReservations.length && selectableReservations.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  Seleccionar todas ({selectableReservations.length} sin liquidar)
                </label>
                {selectedIds.size > 0 && (
                  <span className="text-xs text-violet-600 font-medium">
                    {selectedIds.size} seleccionadas
                  </span>
                )}
              </div>
            )}

            {filteredReservations.length === 0 ? (
              <Card className="border-0 shadow-md bg-white">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarDays className="h-8 w-8 text-violet-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay reservas</h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                    Crea tu primera reserva manualmente o importa desde un CSV de Airbnb
                  </p>
                  <Button
                    onClick={() => setShowNewModal(true)}
                    className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva reserva
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredReservations.map((reservation, index) => {
                  const platformConfig = PLATFORM_CONFIG[reservation.platform] || PLATFORM_CONFIG.OTHER
                  const statusConfig = STATUS_CONFIG[reservation.status]
                  const StatusIcon = statusConfig.icon

                  return (
                    <motion.div
                      key={reservation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                    >
                      <Card
                        className="border-0 shadow-md hover:shadow-lg transition-all bg-white group cursor-pointer"
                        onClick={() => openReservationDetail(reservation)}
                      >
                        <CardContent className="p-4 sm:p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            {/* Checkbox for selection (only if not liquidated) */}
                            {!reservation.liquidation && (
                              <div className="hidden sm:flex items-center">
                                <input
                                  type="checkbox"
                                  checked={selectedIds.has(reservation.id)}
                                  onChange={() => {}}
                                  onClick={(e) => toggleSelectReservation(reservation.id, e)}
                                  className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                                />
                              </div>
                            )}
                            {reservation.liquidation && (
                              <div className="hidden sm:flex items-center w-4" />
                            )}
                            {/* Property Image or Placeholder */}
                            <div className="hidden sm:block w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                              {reservation.billingConfig.property.profileImage ? (
                                <img
                                  src={reservation.billingConfig.property.profileImage}
                                  alt={reservation.billingConfig.property.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Home className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">{reservation.guestName}</h3>
                                {reservation.guest && reservation.guest.totalStays > 1 && (
                                  <Badge className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5">
                                    <Star className="w-3 h-3 mr-1" />
                                    {reservation.guest.totalStays}x
                                  </Badge>
                                )}
                                <Badge className={`${platformConfig.bgColor} ${platformConfig.color} text-xs font-medium px-2 py-0.5`}>
                                  {platformConfig.label}
                                </Badge>
                                <Badge className={`${statusConfig.color} text-xs font-medium px-2 py-0.5`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusConfig.label}
                                </Badge>
                                {reservation.liquidation && (
                                  <Badge className="bg-violet-100 text-violet-700 text-xs">
                                    <FileText className="w-3 h-3 mr-1" />
                                    Liquidada
                                  </Badge>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Home className="w-3.5 h-3.5" />
                                  {reservation.billingConfig.property.name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {new Date(reservation.checkIn).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                  {' → '}
                                  {new Date(reservation.checkOut).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Moon className="w-3.5 h-3.5" />
                                  {reservation.nights} {reservation.nights === 1 ? 'noche' : 'noches'}
                                </span>
                                <span className="text-gray-400 text-xs font-mono">
                                  #{reservation.confirmationCode}
                                </span>
                              </div>
                            </div>

                            {/* Amount */}
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                {formatCurrency(reservation.hostEarnings)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {round2(Number(reservation.hostEarnings) / reservation.nights)}€/noche
                              </p>
                            </div>
                          </div>
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

      {/* New Reservation Modal - Airbnb style */}
      <AnimatePresence>
        {showNewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => { setShowNewModal(false); resetForm(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Nueva Reserva</h2>
                    <p className="text-sm text-gray-500">Añade una reserva manualmente</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowNewModal(false); resetForm(); }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
                <div className="p-5 space-y-5">
                  {/* Property/Unit Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apartamento *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={formData.billingUnitId || formData.billingConfigId}
                        onChange={(e) => {
                          const value = e.target.value
                          // Si empieza con "unit:", es un BillingUnit
                          if (value.startsWith('unit:')) {
                            setFormData({ ...formData, billingUnitId: value.replace('unit:', ''), billingConfigId: '' })
                          } else {
                            setFormData({ ...formData, billingConfigId: value, billingUnitId: '' })
                          }
                        }}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none bg-white"
                        required
                      >
                        <option value="">Selecciona un apartamento</option>
                        {/* BillingUnits (módulo Gestión) */}
                        {billingUnits.length > 0 && (
                          <optgroup label="Apartamentos de Gestión">
                            {billingUnits.map(u => (
                              <option key={u.id} value={`unit:${u.id}`}>
                                {u.name} {u.city && `(${u.city})`}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {/* Properties (módulo Manuales - legacy) */}
                        {properties.length > 0 && (
                          <optgroup label="Propiedades de Manuales">
                            {properties.map(p => (
                              <option
                                key={p.id}
                                value={p.hasBillingConfig ? p.billingConfigId! : `new:${p.id}`}
                              >
                                {p.name} {!p.hasBillingConfig && '(nueva config)'}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    {billingUnits.length === 0 && properties.length === 0 && (
                      <p className="mt-2 text-xs text-amber-600">
                        No tienes apartamentos. <Link href="/gestion/configuracion" className="underline">Crea uno primero</Link>.
                      </p>
                    )}
                  </div>

                  {/* Platform */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plataforma
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(PLATFORM_CONFIG).map(([key, config]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setFormData({ ...formData, platform: key })}
                          className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            formData.platform === key
                              ? `${config.bgColor} ${config.color} ring-2 ring-offset-1 ring-violet-500`
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {config.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Guest Name with Autocomplete */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del huésped *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.guestName}
                        onChange={(e) => handleGuestNameChange(e.target.value)}
                        onFocus={() => guestSearchResults.length > 0 && setShowGuestDropdown(true)}
                        placeholder="Nombre completo del huésped"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        required
                      />
                      {searchingGuest && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}

                      {/* Guest search dropdown */}
                      {showGuestDropdown && guestSearchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          <div className="p-2 text-xs text-gray-500 border-b border-gray-100">
                            Huéspedes encontrados
                          </div>
                          {guestSearchResults.map(guest => (
                            <button
                              key={guest.id}
                              type="button"
                              onClick={() => selectGuest(guest)}
                              className="w-full px-3 py-2 text-left hover:bg-violet-50 flex items-center gap-3 transition-colors"
                            >
                              <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                                {guest.totalStays > 1 ? (
                                  <Star className="w-4 h-4 text-amber-500" />
                                ) : (
                                  <User className="w-4 h-4 text-violet-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">{guest.name}</p>
                                <p className="text-xs text-gray-500 truncate">
                                  {guest.email || 'Sin email'}
                                  {guest.totalStays > 0 && (
                                    <span className="text-amber-600 ml-2">
                                      {guest.totalStays} {guest.totalStays === 1 ? 'estancia' : 'estancias'}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Returning Guest Alert */}
                  {selectedGuest && selectedGuest.totalStays > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Star className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-amber-800">
                            Huésped recurrente
                          </p>
                          <p className="text-sm text-amber-700 mt-1">
                            {selectedGuest.name} ya se ha alojado <strong>{selectedGuest.totalStays} {selectedGuest.totalStays === 1 ? 'vez' : 'veces'}</strong>
                            {selectedGuest.lastStayAt && (
                              <span>. Última estancia: {new Date(selectedGuest.lastStayAt).toLocaleDateString('es-ES')}</span>
                            )}
                          </p>
                          {selectedGuest.notes && (
                            <div className="mt-2 p-2 bg-white/50 rounded-lg">
                              <p className="text-xs text-amber-600 font-medium mb-1">Observaciones:</p>
                              <p className="text-sm text-amber-800">{selectedGuest.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Guest Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email del huésped
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={formData.guestEmail}
                        onChange={(e) => handleGuestEmailChange(e.target.value)}
                        placeholder="email@ejemplo.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-in *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          value={formData.checkIn}
                          onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-out *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          value={formData.checkOut}
                          onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                          min={formData.checkIn}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calculated nights display */}
                  {calculatedNights > 0 && (
                    <div className="bg-violet-50 rounded-xl p-3 flex items-center justify-between">
                      <span className="text-sm text-violet-700 font-medium flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        {calculatedNights} {calculatedNights === 1 ? 'noche' : 'noches'}
                      </span>
                      {pricePerNight && formData.hostEarnings && (
                        <span className="text-sm text-violet-600">
                          {pricePerNight}€/noche
                        </span>
                      )}
                    </div>
                  )}

                  {/* Amounts */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ingresos netos *
                      </label>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          value={formData.hostEarnings}
                          onChange={(e) => setFormData({ ...formData, hostEarnings: e.target.value })}
                          placeholder="0.00"
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Lo que recibes de la plataforma</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Limpieza
                      </label>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          value={formData.cleaningFee}
                          onChange={(e) => setFormData({ ...formData, cleaningFee: e.target.value })}
                          placeholder="Automático"
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Déjalo vacío para usar el valor configurado</p>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas internas
                    </label>
                    <textarea
                      value={formData.internalNotes}
                      onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                      placeholder="Notas privadas sobre esta reserva..."
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-5 border-t border-gray-100 bg-gray-50/50">
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setShowNewModal(false); resetForm(); }}
                      className="flex-1"
                      disabled={saving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Crear reserva
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reservation Detail/Edit Modal */}
      <AnimatePresence>
        {selectedReservation && !showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => { setSelectedReservation(null); cancelEdit(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  {selectedReservation.billingConfig.property.profileImage ? (
                    <img
                      src={selectedReservation.billingConfig.property.profileImage}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center">
                      <Home className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {editMode ? 'Editar reserva' : selectedReservation.guestName}
                    </h2>
                    <p className="text-sm text-gray-500">{selectedReservation.billingConfig.property.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedReservation(null); cancelEdit(); }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body - View Mode */}
              {!editMode && (
                <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-200px)]">
                  {/* Status & Platform */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${PLATFORM_CONFIG[selectedReservation.platform]?.bgColor || 'bg-gray-50'} ${PLATFORM_CONFIG[selectedReservation.platform]?.color || 'text-gray-600'} text-sm px-3 py-1`}>
                      {PLATFORM_CONFIG[selectedReservation.platform]?.label || selectedReservation.platform}
                    </Badge>
                    <Badge className={`${STATUS_CONFIG[selectedReservation.status].color} text-sm px-3 py-1`}>
                      {STATUS_CONFIG[selectedReservation.status].label}
                    </Badge>
                    {selectedReservation.liquidation && (
                      <Badge className="bg-violet-100 text-violet-700 text-sm px-3 py-1">
                        <FileText className="w-3 h-3 mr-1" />
                        Liquidada
                      </Badge>
                    )}
                  </div>

                  {/* Confirmation Code */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Código de confirmación</p>
                    <p className="font-mono text-lg font-semibold text-gray-900">#{selectedReservation.confirmationCode}</p>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-violet-50 rounded-xl p-4">
                      <p className="text-xs text-violet-600 mb-1">Check-in</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedReservation.checkIn).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="bg-violet-50 rounded-xl p-4">
                      <p className="text-xs text-violet-600 mb-1">Check-out</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedReservation.checkOut).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Nights & Amount */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-xs text-blue-600 mb-1">Noches</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedReservation.nights}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-xs text-green-600 mb-1">Ingresos netos</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedReservation.hostEarnings)}</p>
                      <p className="text-xs text-gray-500">
                        {round2(Number(selectedReservation.hostEarnings) / selectedReservation.nights)}€/noche
                      </p>
                    </div>
                  </div>

                  {/* Guest Contact */}
                  {(selectedReservation.guestEmail || selectedReservation.guestPhone) && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Contacto del huésped</p>
                      {selectedReservation.guestEmail && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${selectedReservation.guestEmail}`} className="hover:text-violet-600">
                            {selectedReservation.guestEmail}
                          </a>
                        </div>
                      )}
                      {selectedReservation.guestPhone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${selectedReservation.guestPhone}`} className="hover:text-violet-600">
                            {selectedReservation.guestPhone}
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Internal Notes */}
                  {selectedReservation.internalNotes && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Notas internas</p>
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                        {selectedReservation.internalNotes}
                      </p>
                    </div>
                  )}

                  {/* Guest History */}
                  {selectedReservation.guest && selectedReservation.guest.totalStays > 1 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-amber-600" />
                        <p className="text-sm font-semibold text-amber-800">
                          Huésped recurrente ({selectedReservation.guest.totalStays} estancias)
                        </p>
                      </div>
                      {selectedReservation.guest.notes && (
                        <p className="text-sm text-amber-700 bg-white/50 rounded-lg p-2">
                          {selectedReservation.guest.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Modal Body - Edit Mode */}
              {editMode && (
                <form onSubmit={handleUpdateReservation} className="overflow-y-auto max-h-[calc(90vh-200px)]">
                  <div className="p-5 space-y-4">
                    {/* Guest Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del huésped *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={formData.guestName}
                          onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={formData.guestEmail}
                          onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                        <input
                          type="tel"
                          value={formData.guestPhone}
                          onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Check-in *</label>
                        <input
                          type="date"
                          value={formData.checkIn}
                          onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Check-out *</label>
                        <input
                          type="date"
                          value={formData.checkOut}
                          onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                          min={formData.checkIn}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Calculated nights */}
                    {calculatedNights > 0 && (
                      <div className="bg-violet-50 rounded-xl p-3 flex items-center justify-between">
                        <span className="text-sm text-violet-700 font-medium flex items-center gap-2">
                          <Moon className="w-4 h-4" />
                          {calculatedNights} {calculatedNights === 1 ? 'noche' : 'noches'}
                        </span>
                      </div>
                    )}

                    {/* Amounts */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ingresos netos * (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.hostEarnings}
                          onChange={(e) => setFormData({ ...formData, hostEarnings: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Limpieza (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.cleaningFee}
                          onChange={(e) => setFormData({ ...formData, cleaningFee: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notas internas</label>
                      <textarea
                        value={formData.internalNotes}
                        onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                      />
                    </div>
                  </div>

                  {/* Edit Footer */}
                  <div className="p-5 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelEdit}
                        className="flex-1"
                        disabled={saving}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Guardar cambios
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {/* Modal Footer - View Mode */}
              {!editMode && (
                <div className="p-5 border-t border-gray-100 bg-gray-50/50">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      disabled={!!selectedReservation.liquidation}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => startEditReservation(selectedReservation)}
                      className="flex-1"
                      disabled={!!selectedReservation.liquidation}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                  {selectedReservation.liquidation && (
                    <p className="text-xs text-amber-600 mt-2 text-center">
                      Esta reserva ya está facturada y no puede modificarse
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && selectedReservation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Eliminar reserva?</h3>
                <p className="text-sm text-gray-500">
                  Esta acción no se puede deshacer. Se eliminará la reserva de <strong>{selectedReservation.guestName}</strong>.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDeleteReservation}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Eliminando...
                    </>
                  ) : (
                    'Eliminar'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Confirmation Modal */}
      <AnimatePresence>
        {showBulkDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowBulkDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¿Eliminar {selectedIds.size} reservas?
                </h3>
                <p className="text-sm text-gray-500">
                  Esta acción no se puede deshacer. Se eliminarán todas las reservas seleccionadas.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  className="flex-1"
                  disabled={bulkDeleting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleBulkDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={bulkDeleting}
                >
                  {bulkDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Eliminando...
                    </>
                  ) : (
                    'Eliminar todas'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSV Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeImportModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`bg-white rounded-2xl shadow-2xl w-full overflow-hidden transition-all max-h-[90vh] flex flex-col ${
                showColumnMapper ? 'max-w-3xl' : 'max-w-lg'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-3">
                  {showColumnMapper && (
                    <button
                      onClick={() => setShowColumnMapper(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {showColumnMapper ? 'Configurar mapeo' : 'Importar desde CSV'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {showColumnMapper
                        ? 'Mapea las columnas del archivo'
                        : detectedPlatform !== 'UNKNOWN'
                          ? `Detectado: ${detectedPlatform === 'AIRBNB' ? 'Airbnb' : 'Booking.com'}`
                          : 'Importa reservas de cualquier plataforma'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeImportModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-5 flex-1 overflow-y-auto">
                {/* Simple Column Mapper View */}
                {showColumnMapper && rawHeaders.length > 0 ? (
                  <SimpleColumnMapper
                    headers={rawHeaders}
                    sampleRows={rawRows}
                    onConfirm={handleSimpleMappingConfirm}
                    onCancel={() => setShowColumnMapper(false)}
                  />
                ) : (
                  <>
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Formatos soportados</h4>
                  <div className="text-sm text-blue-700 space-y-2">
                    <p><strong>Airbnb:</strong> CSV desde Ingresos → Historial de transacciones</p>
                    <p><strong>Booking:</strong> XLS desde Extranet → Reservas → Exportar</p>
                    <p><strong>Otros:</strong> CSV/XLS con columnas de huésped, fechas e importe</p>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Archivo CSV
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                      importFile
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xls,.xlsx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {importFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileSpreadsheet className="w-8 h-8 text-green-600" />
                        <div className="text-left">
                          <p className="font-medium text-green-700">{importFile.name}</p>
                          <p className="text-sm text-green-600">
                            {(importFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setImportFile(null)
                            setImportResults(null)
                            if (fileInputRef.current) fileInputRef.current.value = ''
                          }}
                          className="p-1 text-green-600 hover:text-green-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 font-medium">
                          Haz clic para seleccionar un archivo
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          CSV, XLS o XLSX
                        </p>
                      </>
                    )}
                  </div>

                  {/* Platform detection indicator */}
                  {importFile && detectedPlatform !== 'UNKNOWN' && !simpleMapping && (
                    <div className="flex items-center justify-between mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        <span>Detectado: <strong>{detectedPlatform === 'AIRBNB' ? 'Airbnb' : 'Booking.com'}</strong></span>
                      </div>
                      <button
                        onClick={() => setShowColumnMapper(true)}
                        className="text-xs text-green-600 underline hover:no-underline"
                      >
                        Mapear manualmente
                      </button>
                    </div>
                  )}

                  {/* Unknown format indicator */}
                  {importFile && detectedPlatform === 'UNKNOWN' && !simpleMapping && (
                    <div className="flex items-center justify-between mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-amber-700">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Formato no reconocido</span>
                      </div>
                      <button
                        onClick={() => setShowColumnMapper(true)}
                        className="flex items-center gap-1 text-xs font-medium bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-700"
                      >
                        <Settings2 className="w-3 h-3" />
                        Configurar mapeo
                      </button>
                    </div>
                  )}

                  {/* Mapping configured indicator */}
                  {simpleMapping && rawHeaders.length > 0 && (
                    <div className="mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          <span>Columnas detectadas automáticamente</span>
                        </div>
                        <button
                          onClick={() => setShowColumnMapper(true)}
                          className="text-xs text-green-600 underline hover:no-underline"
                        >
                          Modificar
                        </button>
                      </div>
                      <div className="mt-2 text-xs text-green-600 grid grid-cols-2 gap-1">
                        <span>• Huésped: {rawHeaders[simpleMapping.guestName]}</span>
                        <span>• Entrada: {rawHeaders[simpleMapping.checkIn]}</span>
                        <span>• Salida: {rawHeaders[simpleMapping.checkOut]}</span>
                        <span>• Importe: {rawHeaders[simpleMapping.amount]}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Property Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asignar a propiedad (opcional)
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={importPropertyId}
                      onChange={(e) => setImportPropertyId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">Detectar automáticamente</option>
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Si no seleccionas una propiedad, intentaremos detectarla por el nombre del anuncio
                  </p>
                </div>

                {/* Replace existing option */}
                {importPropertyId && (
                  <label className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={replaceExisting}
                      onChange={(e) => setReplaceExisting(e.target.checked)}
                      className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-amber-800">Reemplazar reservas existentes</span>
                      <p className="text-xs text-amber-600">Borra las reservas actuales de esta propiedad antes de importar</p>
                    </div>
                  </label>
                )}

                {/* Import Results */}
                {importResults && (
                  <div className="space-y-4">
                    {/* Success/Error message */}
                    <div className={`rounded-xl p-5 text-center ${
                      importResults.imported > 0
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      {importResults.imported > 0 ? (
                        <>
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                          <p className="text-lg font-semibold text-gray-900">
                            ¡Perfecto!
                          </p>
                          <p className="text-green-700 mt-1">
                            <span className="font-bold">{importResults.imported} reservas</span> importadas
                            {importPropertyId && properties.find(p => p.id === importPropertyId) && (
                              <> a <span className="font-bold">{properties.find(p => p.id === importPropertyId)?.name}</span></>
                            )}
                          </p>
                          {importResults.skipped > 0 && (
                            <p className="text-gray-500 text-sm mt-1">
                              ({importResults.skipped} duplicadas omitidas)
                            </p>
                          )}
                        </>
                      ) : importResults.skipped > 0 ? (
                        <>
                          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                          </div>
                          <p className="text-lg font-semibold text-gray-900">
                            Todas duplicadas
                          </p>
                          <p className="text-amber-600 text-sm mt-1">
                            {importResults.skipped} reservas ya existen en el sistema
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                          </div>
                          <p className="text-lg font-semibold text-gray-900">
                            Error en importación
                          </p>
                          <p className="text-red-600 text-sm mt-1">
                            {importResults.errors.length > 0
                              ? `${importResults.errors.length} errores encontrados`
                              : 'No se encontraron reservas válidas en el archivo'}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Error details if any */}
                    {importResults.errors.length > 0 && importResults.imported > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <p className="text-amber-700 text-sm font-medium mb-1">
                          {importResults.errors.length} filas con errores:
                        </p>
                        <ul className="text-amber-600 text-xs space-y-0.5 max-h-24 overflow-y-auto">
                          {importResults.errors.slice(0, 5).map((err, i) => (
                            <li key={i}>Fila {err.row}: {err.reason}</li>
                          ))}
                          {importResults.errors.length > 5 && (
                            <li>...y {importResults.errors.length - 5} más</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Action buttons */}
                    {importResults.imported > 0 && importPropertyId && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            closeImportModal()
                            // Reset file input for next import
                          }}
                          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          Importar más
                        </button>
                        <a
                          href={`/gestion/facturacion/${importPropertyId}`}
                          className="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors text-sm font-medium text-center"
                        >
                          Ver en facturación →
                        </a>
                      </div>
                    )}
                  </div>
                )}
                  </>
                )}
              </div>

              {/* Modal Footer - hide when showing successful results (has inline buttons) */}
              {!showColumnMapper && !(importResults && importResults.imported > 0 && importPropertyId) && (
                <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={closeImportModal}
                      className="flex-1"
                      disabled={importing}
                    >
                      {importResults ? 'Cerrar' : 'Cancelar'}
                    </Button>
                    {!importResults && (
                      <Button
                        onClick={handleCSVImport}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                        disabled={!importFile || importing || (detectedPlatform === 'UNKNOWN' && !simpleMapping && rawHeaders.length > 0)}
                      >
                        {importing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Importando...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Importar
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Parse CSV text and detect platform
 */
function parseCSVForImport(text: string): {
  headers: string[]
  rows: string[][]
  platform: 'AIRBNB' | 'BOOKING' | 'UNKNOWN'
} {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  if (lines.length < 2) {
    return { headers: [], rows: [], platform: 'UNKNOWN' }
  }

  // Parse header
  const headers = parseCSVLine(lines[0])

  // Parse data rows
  const rows: string[][] = []
  for (let i = 1; i < lines.length; i++) {
    rows.push(parseCSVLine(lines[i]))
  }

  // Detect platform by headers
  const platform = detectPlatformFromHeaders(headers)

  return { headers, rows, platform }
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if ((char === ',' || char === ';') && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  values.push(current.trim())
  return values
}

/**
 * Detect platform from CSV headers
 */
function detectPlatformFromHeaders(headers: string[]): 'AIRBNB' | 'BOOKING' | 'UNKNOWN' {
  const headersLower = headers.map(h => h.toLowerCase())
  const headersStr = headersLower.join(' ')

  // Airbnb indicators
  const airbnbIndicators = [
    'código de confirmación',
    'confirmation code',
    'fecha de inicio',
    'start date',
    'fecha de finalización',
    'end date',
    'ganancias netas',
    'ganancias brutas',
    'comisión servicio anfitrión',
    'host service fee',
    'viajero',
    'gastos de limpieza',
    'fecha de llegada estimada',
    'fecha de la reserva'
  ]

  // Booking.com indicators
  const bookingIndicators = [
    'booking number',
    'número de reserva',
    'numero de reserva',
    'reservation number',
    'commission amount',
    'importe de la comisión',
    'importe comision',
    'comisión',
    'booker country',
    'tipo de unidad',
    'unit type',
    'duración (noches)',
    'check-in',
    'check-out',
    'reservado por'
  ]

  const airbnbScore = airbnbIndicators.filter(ind => headersStr.includes(ind)).length
  const bookingScore = bookingIndicators.filter(ind => headersStr.includes(ind)).length

  if (airbnbScore >= 2) return 'AIRBNB'
  if (bookingScore >= 2) return 'BOOKING'

  return 'UNKNOWN'
}

/**
 * Auto-detect column mapping from headers
 * Returns SimpleMapping if all 4 required fields are found, null otherwise
 */
function autoDetectColumns(headers: string[]): SimpleMapping | null {
  const headersLower = headers.map(h => h.toLowerCase().trim())

  // Known column names for each field
  const guestNameVariants = [
    'huésped', 'huesped', 'guest', 'viajero', 'nombre', 'cliente',
    'guest name', 'nombre del huésped', 'nombre del viajero',
    'nombre del cliente', 'booker name', 'reservado por'
  ]

  const checkInVariants = [
    'entrada', 'check-in', 'checkin', 'llegada', 'arrival',
    'fecha de inicio', 'start date', 'fecha entrada', 'check in',
    'fecha de llegada', 'from', 'desde'
  ]

  const checkOutVariants = [
    'salida', 'check-out', 'checkout', 'departure',
    'fecha de finalización', 'end date', 'fecha salida', 'check out',
    'fecha de salida', 'to', 'hasta'
  ]

  const amountVariants = [
    'importe', 'amount', 'total', 'precio', 'price',
    'ganancias', 'earnings', 'neto', 'net', 'payout',
    'ganancias netas', 'tus ganancias', 'your earnings',
    'room revenue', 'revenue'
  ]

  // Find matching column for each field
  const findColumn = (variants: string[]): number => {
    for (let i = 0; i < headersLower.length; i++) {
      const header = headersLower[i]
      for (const variant of variants) {
        if (header === variant || header.includes(variant)) {
          return i
        }
      }
    }
    return -1
  }

  const guestName = findColumn(guestNameVariants)
  const checkIn = findColumn(checkInVariants)
  const checkOut = findColumn(checkOutVariants)
  const amount = findColumn(amountVariants)

  // Only return mapping if ALL 4 required fields are found
  if (guestName !== -1 && checkIn !== -1 && checkOut !== -1 && amount !== -1) {
    return { guestName, checkIn, checkOut, amount }
  }

  return null
}
