'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

interface Reservation {
  id: string
  property: string
  guestName: string
  checkIn: string
  checkOut: string
  nights: number
  platform: string
  roomTotal: number
  cleaningFee: number
  hostEarnings: number
  ownerAmount: number
}

interface Invoice {
  id: string
  fullNumber: string
  issueDate: string
  total: number
  status: string
  pdfUrl: string | null
}

interface PortalData {
  owner: {
    name: string
    email: string
  }
  manager: {
    name: string
  }
  period: {
    month: number
    monthName: string
    year: number
  }
  properties: Array<{ id: string; name: string; city: string }>
  summary: {
    totalReservations: number
    totalNights: number
    totalIncome: number
    liquidationAmount: number | null
    commission: number | null
    retention: number | null
  }
  reservations: Reservation[]
  liquidation: {
    id: string
    status: string
    totalIncome: number
    totalCommission: number
    totalCommissionVat: number
    totalRetention: number
    totalCleaning: number
    totalExpenses: number
    totalAmount: number
  } | null
  invoices: Invoice[]
}

export default function OwnerPortalPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const token = params.token as string

  const [data, setData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const month = searchParams.get('month') || String(new Date().getMonth() + 1)
  const year = searchParams.get('year') || String(new Date().getFullYear())

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/owner/${token}?month=${month}&year=${year}`)
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Error al cargar los datos')
        }
        const json = await res.json()
        setData(json)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token, month, year])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Enlace no válido</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            El enlace puede haber expirado. Contacta con tu gestor para solicitar uno nuevo.
          </p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

  const platformColors: Record<string, string> = {
    AIRBNB: 'bg-red-100 text-red-700',
    BOOKING: 'bg-blue-100 text-blue-700',
    VRBO: 'bg-purple-100 text-purple-700',
    DIRECT: 'bg-green-100 text-green-700',
    OTHER: 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Portal de propietario</p>
              <h1 className="text-2xl font-bold text-gray-900">
                {data.period.monthName} {data.period.year}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Hola,</p>
              <p className="font-medium text-gray-900">{data.owner.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Reservas</p>
            <p className="text-2xl font-bold text-gray-900">{data.summary.totalReservations}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Noches</p>
            <p className="text-2xl font-bold text-gray-900">{data.summary.totalNights}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Ingresos brutos</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.summary.totalIncome)}</p>
          </div>
          <div className="bg-blue-600 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-blue-100 mb-1">A percibir</p>
            <p className="text-2xl font-bold text-white">
              {data.summary.liquidationAmount !== null
                ? formatCurrency(data.summary.liquidationAmount)
                : '-'}
            </p>
          </div>
        </div>

        {/* Liquidation Details */}
        {data.liquidation && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalle de liquidación</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Ingresos totales</span>
                <span className="font-medium">{formatCurrency(data.liquidation.totalIncome)}</span>
              </div>
              {data.liquidation.totalCommission > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Comisión de gestión</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(data.liquidation.totalCommission)}
                  </span>
                </div>
              )}
              {data.liquidation.totalCommissionVat > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">IVA comisión (21%)</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(data.liquidation.totalCommissionVat)}
                  </span>
                </div>
              )}
              {data.liquidation.totalCleaning > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Limpieza</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(data.liquidation.totalCleaning)}
                  </span>
                </div>
              )}
              {data.liquidation.totalExpenses > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Otros gastos</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(data.liquidation.totalExpenses)}
                  </span>
                </div>
              )}
              {data.liquidation.totalRetention > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Retención IRPF (15%)</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(data.liquidation.totalRetention)}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-3 bg-blue-50 -mx-6 px-6 rounded-b-xl">
                <span className="font-semibold text-blue-900">Total a percibir</span>
                <span className="font-bold text-xl text-blue-600">
                  {formatCurrency(data.liquidation.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Reservations Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Reservas ({data.reservations.length})
            </h2>
          </div>
          {data.reservations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Propiedad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Huésped
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fechas
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Plataforma
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Importe
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.reservations.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {r.property}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{r.guestName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(r.checkIn)} → {formatDate(r.checkOut)}
                        <span className="text-gray-400 ml-1">({r.nights}n)</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            platformColors[r.platform] || platformColors.OTHER
                          }`}
                        >
                          {r.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(r.ownerAmount || r.roomTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              No hay reservas en este período
            </div>
          )}
        </div>

        {/* Invoices */}
        {data.invoices.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Facturas</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {data.invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{inv.fullNumber}</p>
                    <p className="text-sm text-gray-500">{formatDate(inv.issueDate)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(inv.total)}
                    </span>
                    {inv.pdfUrl && (
                      <a
                        href={inv.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-400 pt-8 pb-4">
          <p>Resumen generado por {data.manager.name}</p>
          <p className="mt-1">Si tienes alguna duda, contacta directamente con tu gestor</p>
        </div>
      </main>
    </div>
  )
}
