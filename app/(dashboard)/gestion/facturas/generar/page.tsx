'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  FileText,
  Calendar,
  Euro,
  CheckCircle,
  AlertCircle,
  Building2,
  User
} from 'lucide-react'
import Link from 'next/link'

interface Reservation {
  id: string
  platform: string
  confirmationCode: string
  guestName: string
  checkIn: string
  checkOut: string
  nights: number
  hostEarnings: number
  managerAmount: number
  cleaningAmount: number
  ownerAmount: number
}

interface PropertyData {
  id: string
  name: string
  address: string
}

interface BillingConfig {
  commissionValue: number
  cleaningValue: number
  cleaningFeeRecipient: string
  defaultVatRate: number
  defaultRetentionRate: number
  invoiceDetailLevel: string
  owner: {
    id: string
    type: string
    firstName?: string
    lastName?: string
    companyName?: string
    email?: string
  } | null
}

function GenerarFacturaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const propertyId = searchParams.get('propertyId')
  const reservationIdsParam = searchParams.get('reservations')
  const reservationIds = reservationIdsParam ? reservationIdsParam.split(',') : []

  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [property, setProperty] = useState<PropertyData | null>(null)
  const [billingConfig, setBillingConfig] = useState<BillingConfig | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [invoiceDetailLevel, setInvoiceDetailLevel] = useState<'DETAILED' | 'SUMMARY'>('DETAILED')
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 15)
    return d.toISOString().split('T')[0]
  })
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (propertyId && reservationIds.length > 0) {
      fetchData()
    } else {
      setError('Parámetros inválidos')
      setLoading(false)
    }
  }, [propertyId, reservationIdsParam])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch property data with reservations
      const response = await fetch(`/api/gestion/properties/${propertyId}/reservations`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Error al cargar datos')
      }

      const data = await response.json()
      setProperty(data.property)
      setBillingConfig(data.billingConfig)

      // Use the default invoice detail level from config
      if (data.billingConfig?.invoiceDetailLevel) {
        setInvoiceDetailLevel(data.billingConfig.invoiceDetailLevel as 'DETAILED' | 'SUMMARY')
      }

      // Filter only selected reservations
      const selectedReservations = (data.reservations || []).filter(
        (r: Reservation) => reservationIds.includes(r.id)
      )
      setReservations(selectedReservations)

      if (selectedReservations.length === 0) {
        setError('No se encontraron las reservas seleccionadas')
      }
    } catch (err) {
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!billingConfig?.owner) {
      setError('No hay propietario asignado a esta propiedad')
      return
    }

    setCreating(true)
    setError(null)

    try {
      const response = await fetch('/api/gestion/invoices/from-reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          reservationIds,
          invoiceDetailLevel,
          issueDate,
          dueDate: dueDate || null,
          notes: notes || null
        })
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/gestion/facturas/${data.invoice.id}`)
      } else {
        const data = await response.json()
        setError(data.error || 'Error al crear la factura')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setCreating(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + '€'
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getOwnerName = () => {
    if (!billingConfig?.owner) return 'Sin propietario'
    if (billingConfig.owner.type === 'EMPRESA') return billingConfig.owner.companyName || 'Empresa'
    return `${billingConfig.owner.firstName || ''} ${billingConfig.owner.lastName || ''}`.trim() || 'Propietario'
  }

  // Calculate totals
  const totals = reservations.reduce((acc, r) => ({
    nights: acc.nights + r.nights,
    hostEarnings: acc.hostEarnings + r.hostEarnings,
    managerAmount: acc.managerAmount + r.managerAmount,
    cleaningAmount: acc.cleaningAmount + r.cleaningAmount,
    ownerAmount: acc.ownerAmount + r.ownerAmount
  }), { nights: 0, hostEarnings: 0, managerAmount: 0, cleaningAmount: 0, ownerAmount: 0 })

  // Calculate invoice preview
  const vatRate = billingConfig?.defaultVatRate || 21
  const retentionRate = billingConfig?.defaultRetentionRate || 0
  const subtotal = totals.managerAmount
  const vatAmount = subtotal * (vatRate / 100)
  const retentionAmount = subtotal * (retentionRate / 100)
  const totalInvoice = subtotal + vatAmount - retentionAmount

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href={propertyId ? `/gestion/propiedades/${propertyId}` : '/gestion/facturas'}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Generar factura</h1>
                <p className="text-sm text-gray-500">{reservations.length} reservas seleccionadas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {property && billingConfig && (
          <div className="space-y-6">
            {/* Property & Owner Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Propiedad</p>
                    <p className="font-medium text-gray-900">{property.name}</p>
                    <p className="text-sm text-gray-500">{property.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Facturar a</p>
                    <p className="font-medium text-gray-900">{getOwnerName()}</p>
                    {billingConfig.owner?.email && (
                      <p className="text-sm text-gray-500">{billingConfig.owner.email}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Reservations Summary */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Reservas a facturar</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Reserva</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Huésped</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Fechas</th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase px-6 py-3">Noches</th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">Comisión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reservations.map(r => (
                      <tr key={r.id}>
                        <td className="px-6 py-3">
                          <span className="text-sm font-mono text-gray-600">{r.confirmationCode}</span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-sm text-gray-900">{r.guestName}</span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-sm text-gray-600">
                            {formatDate(r.checkIn)} → {formatDate(r.checkOut)}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className="text-sm font-medium">{r.nights}</span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className="text-sm font-medium text-blue-600">{formatCurrency(r.managerAmount)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-6 py-3 text-right font-medium text-gray-700">
                        Totales:
                      </td>
                      <td className="px-6 py-3 text-center font-bold text-gray-900">
                        {totals.nights}
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-blue-600">
                        {formatCurrency(totals.managerAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Invoice Options */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Opciones de factura</h2>

              <div className="space-y-4">
                {/* Detail Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formato de líneas
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setInvoiceDetailLevel('DETAILED')}
                      className={`p-4 rounded-lg border-2 text-left transition-colors ${
                        invoiceDetailLevel === 'DETAILED'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium text-gray-900">Detallado</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Una línea por cada reserva con fechas y huésped
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvoiceDetailLevel('SUMMARY')}
                      className={`p-4 rounded-lg border-2 text-left transition-colors ${
                        invoiceDetailLevel === 'SUMMARY'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium text-gray-900">Resumido</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Una línea con el total del periodo
                      </p>
                    </button>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de factura
                    </label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de vencimiento
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Notas adicionales para la factura..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Invoice Preview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Vista previa de totales</h2>

              <div className="space-y-2 max-w-xs ml-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base imponible</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IVA ({vatRate}%)</span>
                  <span>{formatCurrency(vatAmount)}</span>
                </div>
                {retentionRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Retención ({retentionRate}%)</span>
                    <span className="text-red-600">-{formatCurrency(retentionAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-blue-600">{formatCurrency(totalInvoice)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Link
                href={propertyId ? `/gestion/propiedades/${propertyId}` : '/gestion/facturas'}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </Link>
              <button
                onClick={handleSubmit}
                disabled={creating || !billingConfig?.owner}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                {creating ? 'Creando...' : 'Crear borrador'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function GenerarFacturaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <GenerarFacturaContent />
    </Suspense>
  )
}
