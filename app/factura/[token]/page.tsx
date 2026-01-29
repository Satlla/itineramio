'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Download, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface InvoiceItem {
  concept: string
  description?: string
  quantity: number
  unitPrice: number
  vatRate: number
  retentionRate: number
  total: number
}

interface Invoice {
  id: string
  fullNumber?: string
  status: string
  issueDate: string
  dueDate?: string
  subtotal: number
  totalVat: number
  retentionRate: number
  retentionAmount: number
  total: number
  notes?: string
  items: InvoiceItem[]
}

interface Recipient {
  name: string
  nif?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
}

interface Issuer {
  businessName: string
  nif?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  email?: string
  phone?: string
  logoUrl?: string
  iban?: string
  bankName?: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  DRAFT: { label: 'Borrador', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: FileText },
  PROFORMA: { label: 'Proforma', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: FileText },
  ISSUED: { label: 'Emitida', color: 'text-violet-600', bgColor: 'bg-violet-100', icon: CheckCircle },
  SENT: { label: 'Enviada', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: Clock },
  PAID: { label: 'Pagada', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
  OVERDUE: { label: 'Vencida', color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertCircle }
}

export default function PublicInvoicePage() {
  const params = useParams()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [recipient, setRecipient] = useState<Recipient | null>(null)
  const [issuer, setIssuer] = useState<Issuer | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetchInvoice()
  }, [token])

  const fetchInvoice = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/public/invoices/${token}`)

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Factura no encontrada')
        return
      }

      const data = await response.json()
      setInvoice(data.invoice)
      setRecipient(data.recipient)
      setIssuer(data.issuer)
    } catch (err) {
      setError('Error al cargar la factura')
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    if (!invoice) return

    setDownloading(true)
    try {
      const response = await fetch(`/api/public/invoices/${token}/pdf`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${invoice.fullNumber || 'factura'}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
      } else {
        alert('Error al descargar el PDF')
      }
    } catch (err) {
      alert('Error al descargar el PDF')
    } finally {
      setDownloading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€'
  }

  const formatIBAN = (iban: string) => {
    return iban.replace(/(.{4})/g, '$1 ').trim()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando factura...</p>
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Factura no encontrada</h1>
          <p className="text-gray-600 mb-6">{error || 'El enlace puede haber expirado o ser incorrecto.'}</p>
          <Link
            href="https://www.itineramio.com"
            className="text-violet-600 hover:underline"
          >
            Ir a Itineramio
          </Link>
        </div>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.ISSUED
  const StatusIcon = statusConfig.icon

  // Calculate totals
  let subtotal = 0
  let totalVat = 0
  let totalRetention = 0
  invoice.items.forEach(item => {
    const base = item.quantity * item.unitPrice
    subtotal += base
    totalVat += base * (item.vatRate / 100)
    totalRetention += base * (item.retentionRate / 100)
  })
  const total = subtotal + totalVat - totalRetention

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-gray-100 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          {issuer?.logoUrl ? (
            <img src={issuer.logoUrl} alt={issuer.businessName} className="h-12 mx-auto mb-4" />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{issuer?.businessName || 'Factura'}</h1>
          )}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bgColor}`}>
            <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
            <span className={`text-sm font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
          </div>
        </div>

        {/* Invoice Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Invoice Header */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Factura</p>
                <p className="text-2xl font-bold text-gray-900">{invoice.fullNumber || 'Sin número'}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Fecha: {new Date(invoice.issueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
                {invoice.dueDate && (
                  <p className="text-sm text-gray-500">
                    Vencimiento: {new Date(invoice.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Total a pagar</p>
                <p className="text-4xl font-light text-violet-600">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="p-6 sm:p-8 grid sm:grid-cols-2 gap-6 bg-gray-50 border-b border-gray-100">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">De</p>
              <p className="font-semibold text-gray-900">{issuer?.businessName}</p>
              {issuer?.nif && <p className="text-sm text-gray-600">NIF: {issuer.nif}</p>}
              {issuer?.address && <p className="text-sm text-gray-600">{issuer.address}</p>}
              {issuer?.city && (
                <p className="text-sm text-gray-600">
                  {issuer.postalCode} {issuer.city}, {issuer.country}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Para</p>
              <p className="font-semibold text-gray-900">{recipient?.name}</p>
              {recipient?.nif && <p className="text-sm text-gray-600">NIF/CIF: {recipient.nif}</p>}
              {recipient?.address && <p className="text-sm text-gray-600">{recipient.address}</p>}
              {recipient?.city && (
                <p className="text-sm text-gray-600">
                  {recipient.postalCode} {recipient.city}, {recipient.country}
                </p>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="p-6 sm:p-8">
            <table className="w-full">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
                  <th className="py-3 text-left font-medium">Concepto</th>
                  <th className="py-3 text-right font-medium hidden sm:table-cell">Precio</th>
                  <th className="py-3 text-center font-medium hidden sm:table-cell">Uds.</th>
                  <th className="py-3 text-center font-medium hidden sm:table-cell">IVA</th>
                  <th className="py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-4">
                      <p className="font-medium text-gray-900">{item.concept}</p>
                      {item.description && (
                        <p className="text-sm text-gray-500">{item.description}</p>
                      )}
                      <p className="text-xs text-gray-400 sm:hidden mt-1">
                        {formatCurrency(item.unitPrice)} × {item.quantity} · IVA {item.vatRate}%
                      </p>
                    </td>
                    <td className="py-4 text-right text-gray-600 hidden sm:table-cell">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-4 text-center text-gray-600 hidden sm:table-cell">
                      {item.quantity}
                    </td>
                    <td className="py-4 text-center text-gray-600 hidden sm:table-cell">
                      {item.vatRate}%
                    </td>
                    <td className="py-4 text-right font-medium text-gray-900">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base imponible</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IVA</span>
                    <span>{formatCurrency(totalVat)}</span>
                  </div>
                  {totalRetention > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Retención IRPF</span>
                      <span className="text-red-600">-{formatCurrency(totalRetention)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg pt-3 border-t border-gray-300">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-violet-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {issuer?.iban && invoice.status !== 'PAID' && (
            <div className="p-6 sm:p-8 bg-blue-50 border-t border-blue-100">
              <p className="text-sm font-medium text-blue-900 mb-2">Datos para el pago</p>
              <p className="text-sm text-blue-800">
                IBAN: <span className="font-mono">{formatIBAN(issuer.iban)}</span>
              </p>
              {issuer.bankName && (
                <p className="text-sm text-blue-800">Banco: {issuer.bankName}</p>
              )}
            </div>
          )}

          {/* Download Button */}
          <div className="p-6 sm:p-8 bg-gray-50 border-t border-gray-100">
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              {downloading ? 'Descargando...' : 'Descargar PDF'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Factura generada con <a href="https://www.itineramio.com" className="text-violet-600 hover:underline">Itineramio</a></p>
        </div>
      </motion.div>
    </div>
  )
}
