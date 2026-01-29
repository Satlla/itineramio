'use client'

import { forwardRef } from 'react'
import { Badge } from '@/components/ui/Badge'
import { AlertTriangle, Building2, Landmark, Phone, Mail, CreditCard, Banknote } from 'lucide-react'

interface PaymentMethod {
  type: string
  enabled: boolean
}

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  vatRate: number
  amount: number
}

interface InvoiceData {
  // Invoice info
  fullNumber?: string
  status: string
  issueDate: string
  dueDate?: string
  type?: string

  // Rectifying info
  rectifyingType?: 'SUBSTITUTION' | 'DIFFERENCE'
  rectifyingReason?: string
  originalInvoice?: {
    fullNumber: string
    issueDate: string
  }

  // Issuer (manager)
  issuer: {
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

  // Recipient (owner)
  recipient: {
    name: string
    nif: string
    address?: string
    city?: string
    postalCode?: string
    country?: string
    email?: string
  }

  // Items
  items: InvoiceItem[]

  // Totals
  subtotal: number
  vatAmount: number
  total: number

  // Payment info
  paymentMethods?: PaymentMethod[]
  defaultPaymentMethod?: string
  bankName?: string
  iban?: string
  bic?: string
  bizumPhone?: string
  paypalEmail?: string

  // Notes
  notes?: string
  footerNotes?: string
}

interface InvoicePreviewProps {
  invoice: InvoiceData
  className?: string
  scale?: number
}

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ invoice, className = '', scale = 1 }, ref) => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
      }).format(amount)
    }

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    }

    const isRectifying = invoice.type === 'RECTIFYING'
    const enabledPaymentMethods = invoice.paymentMethods?.filter(m => m.enabled) || []

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'DRAFT':
          return 'bg-gray-100 text-gray-800'
        case 'ISSUED':
          return 'bg-blue-100 text-blue-800'
        case 'SENT':
          return 'bg-purple-100 text-purple-800'
        case 'PAID':
          return 'bg-green-100 text-green-800'
        case 'OVERDUE':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }

    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'DRAFT':
          return 'Borrador'
        case 'ISSUED':
          return 'Emitida'
        case 'SENT':
          return 'Enviada'
        case 'PAID':
          return 'Pagada'
        case 'OVERDUE':
          return 'Vencida'
        default:
          return status
      }
    }

    return (
      <div
        ref={ref}
        className={`bg-white shadow-lg rounded-lg overflow-hidden ${className}`}
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        {/* Rectifying banner */}
        {isRectifying && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Factura Rectificativa</span>
              {invoice.rectifyingType && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {invoice.rectifyingType === 'SUBSTITUTION' ? 'Por sustitución' : 'Por diferencias'}
                </Badge>
              )}
            </div>
            {invoice.originalInvoice && (
              <p className="text-sm text-amber-700 mt-1">
                Rectifica a: {invoice.originalInvoice.fullNumber} del{' '}
                {formatDate(invoice.originalInvoice.issueDate)}
              </p>
            )}
            {invoice.rectifyingReason && (
              <p className="text-sm text-amber-700 mt-1">
                Motivo: {invoice.rectifyingReason}
              </p>
            )}
          </div>
        )}

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              {invoice.issuer.logoUrl ? (
                <img
                  src={invoice.issuer.logoUrl}
                  alt="Logo"
                  className="w-20 h-20 object-contain"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-gray-300" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {invoice.issuer.businessName}
                </h1>
                <p className="text-sm text-gray-600">{invoice.issuer.nif}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {invoice.fullNumber || 'BORRADOR'}
                </h2>
                <Badge className={getStatusColor(invoice.status)}>
                  {getStatusLabel(invoice.status)}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Fecha: {formatDate(invoice.issueDate)}
              </p>
              {invoice.dueDate && (
                <p className="text-sm text-gray-600">
                  Vencimiento: {formatDate(invoice.dueDate)}
                </p>
              )}
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* From */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Emisor
              </h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-medium">{invoice.issuer.businessName}</p>
                <p>NIF: {invoice.issuer.nif}</p>
                <p>{invoice.issuer.address}</p>
                <p>
                  {invoice.issuer.postalCode} {invoice.issuer.city}
                </p>
                <p>{invoice.issuer.country}</p>
                {invoice.issuer.email && <p>{invoice.issuer.email}</p>}
                {invoice.issuer.phone && <p>{invoice.issuer.phone}</p>}
              </div>
            </div>

            {/* To */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Cliente
              </h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-medium">{invoice.recipient.name}</p>
                <p>NIF: {invoice.recipient.nif}</p>
                {invoice.recipient.address && <p>{invoice.recipient.address}</p>}
                {(invoice.recipient.postalCode || invoice.recipient.city) && (
                  <p>
                    {invoice.recipient.postalCode} {invoice.recipient.city}
                  </p>
                )}
                {invoice.recipient.country && <p>{invoice.recipient.country}</p>}
                {invoice.recipient.email && <p>{invoice.recipient.email}</p>}
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2 font-semibold text-gray-700">
                    Descripción
                  </th>
                  <th className="text-right py-2 font-semibold text-gray-700 w-20">
                    Cant.
                  </th>
                  <th className="text-right py-2 font-semibold text-gray-700 w-24">
                    Precio
                  </th>
                  <th className="text-right py-2 font-semibold text-gray-700 w-16">
                    IVA
                  </th>
                  <th className="text-right py-2 font-semibold text-gray-700 w-28">
                    Importe
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 text-gray-700">{item.description}</td>
                    <td className="py-3 text-right text-gray-700">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      {item.vatRate}%
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-600">Base imponible</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-600">IVA</span>
                <span className="font-medium">{formatCurrency(invoice.vatAmount)}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-gray-900">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-gray-900 text-lg">
                  {formatCurrency(invoice.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Notas
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {invoice.notes}
              </p>
            </div>
          )}

          {/* Payment methods */}
          {enabledPaymentMethods.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Formas de pago
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {enabledPaymentMethods.map((method) => (
                  <div key={method.type} className="flex items-start gap-2">
                    {method.type === 'TRANSFER' && (
                      <>
                        <Landmark className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-700">Transferencia bancaria</p>
                          {invoice.bankName && (
                            <p className="text-gray-600">{invoice.bankName}</p>
                          )}
                          {invoice.iban && (
                            <p className="text-gray-600 font-mono text-xs">
                              IBAN: {invoice.iban.replace(/(.{4})/g, '$1 ').trim()}
                            </p>
                          )}
                          {invoice.bic && (
                            <p className="text-gray-600 font-mono text-xs">
                              BIC: {invoice.bic}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                    {method.type === 'BIZUM' && (
                      <>
                        <Phone className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-700">Bizum</p>
                          {invoice.bizumPhone && (
                            <p className="text-gray-600">{invoice.bizumPhone}</p>
                          )}
                        </div>
                      </>
                    )}
                    {method.type === 'PAYPAL' && (
                      <>
                        <Mail className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-700">PayPal</p>
                          {invoice.paypalEmail && (
                            <p className="text-gray-600">{invoice.paypalEmail}</p>
                          )}
                        </div>
                      </>
                    )}
                    {method.type === 'CASH' && (
                      <>
                        <Banknote className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-700">Efectivo</p>
                        </div>
                      </>
                    )}
                    {method.type === 'CARD' && (
                      <>
                        <CreditCard className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-700">Tarjeta</p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer notes */}
          {invoice.footerNotes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 whitespace-pre-wrap">
                {invoice.footerNotes}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }
)

InvoicePreview.displayName = 'InvoicePreview'

export default InvoicePreview
