'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  User,
  DollarSign
} from 'lucide-react'
import type { ColumnMapping, ImportConfig, MappingPreviewProps } from '@/types/import'

interface ParsedRow {
  rowIndex: number
  confirmationCode: string
  guestName: string
  checkIn: string
  checkInParsed: Date | null
  checkOut: string
  checkOutParsed: Date | null
  nights: number
  amount: string
  amountParsed: number
  cleaningFee: number
  commission: number
  status: string
  isValid: boolean
  errors: string[]
}

export function MappingPreview({
  rows,
  mapping,
  config,
  maxRows = 10
}: MappingPreviewProps) {
  // Parse and validate rows
  const parsedRows = useMemo((): ParsedRow[] => {
    return rows.slice(0, maxRows).map((row, index) => {
      const errors: string[] = []

      // Extract values using mapping
      const guestName = mapping.guestName !== undefined
        ? (row[mapping.guestName] || '').trim()
        : ''

      const checkInStr = mapping.checkIn !== undefined
        ? (row[mapping.checkIn] || '').trim()
        : ''

      const checkOutStr = mapping.checkOut !== undefined
        ? (row[mapping.checkOut] || '').trim()
        : ''

      const amountStr = mapping.amount !== undefined
        ? (row[mapping.amount] || '').trim()
        : ''

      // Optional fields
      let confirmationCode = mapping.confirmationCode !== undefined
        ? (row[mapping.confirmationCode] || '').trim()
        : ''

      const nightsStr = mapping.nights !== undefined
        ? (row[mapping.nights] || '').trim()
        : ''

      const cleaningFeeStr = mapping.cleaningFee !== undefined
        ? (row[mapping.cleaningFee] || '').trim()
        : '0'

      const commissionStr = mapping.commission !== undefined
        ? (row[mapping.commission] || '').trim()
        : '0'

      const status = mapping.status !== undefined
        ? (row[mapping.status] || '').trim()
        : 'CONFIRMED'

      // Validate guest name
      if (!guestName) {
        errors.push('Nombre de huesped vacio')
      }

      // Parse and validate dates
      const checkInParsed = parseDate(checkInStr, config.dateFormat)
      const checkOutParsed = parseDate(checkOutStr, config.dateFormat)

      if (!checkInParsed) {
        errors.push(`Fecha entrada invalida: "${checkInStr}"`)
      }

      if (!checkOutParsed) {
        errors.push(`Fecha salida invalida: "${checkOutStr}"`)
      }

      if (checkInParsed && checkOutParsed && checkInParsed >= checkOutParsed) {
        errors.push('Fecha salida debe ser posterior a entrada')
      }

      // Parse amounts
      const amountParsed = parseAmount(amountStr, config.numberFormat)
      const cleaningFee = parseAmount(cleaningFeeStr, config.numberFormat)
      const commission = parseAmount(commissionStr, config.numberFormat)

      if (amountParsed <= 0) {
        errors.push(`Importe invalido: "${amountStr}"`)
      }

      // Calculate nights
      let nights = nightsStr ? parseInt(nightsStr, 10) : 0
      if (!nights && checkInParsed && checkOutParsed) {
        nights = Math.round(
          (checkOutParsed.getTime() - checkInParsed.getTime()) / (1000 * 60 * 60 * 24)
        )
      }

      // Generate confirmation code if missing
      if (!confirmationCode && checkInParsed && guestName) {
        const dateStr = checkInParsed.toISOString().slice(0, 10).replace(/-/g, '')
        const guestHash = guestName.substring(0, 3).toUpperCase().padEnd(3, 'X')
        confirmationCode = `AUTO-${dateStr}-${guestHash}`
      }

      return {
        rowIndex: index + 1,
        confirmationCode,
        guestName: guestName || '-',
        checkIn: checkInStr,
        checkInParsed,
        checkOut: checkOutStr,
        checkOutParsed,
        nights,
        amount: amountStr,
        amountParsed,
        cleaningFee,
        commission,
        status: normalizeStatus(status),
        isValid: errors.length === 0,
        errors
      }
    })
  }, [rows, mapping, config, maxRows])

  // Calculate summary stats
  const stats = useMemo(() => {
    const valid = parsedRows.filter(r => r.isValid).length
    const invalid = parsedRows.filter(r => !r.isValid).length
    const totalAmount = parsedRows
      .filter(r => r.isValid)
      .reduce((sum, r) => sum + r.amountParsed, 0)
    const totalNights = parsedRows
      .filter(r => r.isValid)
      .reduce((sum, r) => sum + r.nights, 0)

    return { valid, invalid, totalAmount, totalNights }
  }, [parsedRows])

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
          label="Validas"
          value={stats.valid.toString()}
          color="green"
        />
        <StatCard
          icon={<XCircle className="h-4 w-4 text-red-600" />}
          label="Errores"
          value={stats.invalid.toString()}
          color="red"
        />
        <StatCard
          icon={<Calendar className="h-4 w-4 text-blue-600" />}
          label="Noches"
          value={stats.totalNights.toString()}
          color="blue"
        />
        <StatCard
          icon={<DollarSign className="h-4 w-4 text-violet-600" />}
          label="Total"
          value={formatCurrency(stats.totalAmount)}
          color="violet"
        />
      </div>

      {/* Preview table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-600">#</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Codigo</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Huesped</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Entrada</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Salida</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600">Noches</th>
                <th className="px-3 py-2 text-right font-medium text-gray-600">Importe</th>
                <th className="px-3 py-2 text-center font-medium text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {parsedRows.map((row) => (
                <tr
                  key={row.rowIndex}
                  className={row.isValid ? '' : 'bg-red-50'}
                >
                  <td className="px-3 py-2 font-mono text-xs text-gray-500">
                    {row.rowIndex}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {row.confirmationCode.substring(0, 12)}
                    {row.confirmationCode.length > 12 && '...'}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="truncate max-w-[120px]">{row.guestName}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {row.checkInParsed ? (
                      formatDateDisplay(row.checkInParsed)
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {row.checkIn || '-'}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {row.checkOutParsed ? (
                      formatDateDisplay(row.checkOutParsed)
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {row.checkOut || '-'}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {row.nights || '-'}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {row.amountParsed > 0 ? (
                      formatCurrency(row.amountParsed)
                    ) : (
                      <span className="text-red-600">{row.amount || '-'}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {row.isValid ? (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        {row.status}
                      </Badge>
                    ) : (
                      <div className="relative group">
                        <Badge className="bg-red-100 text-red-800 text-xs cursor-help">
                          Error
                        </Badge>
                        <div className="absolute z-10 invisible group-hover:visible bg-red-800 text-white text-xs rounded px-2 py-1 right-0 top-full mt-1 whitespace-nowrap max-w-xs">
                          {row.errors.join(', ')}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Show total rows info */}
      {rows.length > maxRows && (
        <p className="text-sm text-gray-500 text-center">
          Mostrando {maxRows} de {rows.length} filas
        </p>
      )}
    </div>
  )
}

// Stat card component
interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  color: 'green' | 'red' | 'blue' | 'violet'
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const bgColors = {
    green: 'bg-green-50',
    red: 'bg-red-50',
    blue: 'bg-blue-50',
    violet: 'bg-violet-50'
  }

  return (
    <div className={`${bgColors[color]} rounded-lg p-3`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-gray-600">{label}</span>
      </div>
      <div className="text-lg font-semibold text-gray-900">{value}</div>
    </div>
  )
}

// Helper functions
function parseDate(str: string, format: ImportConfig['dateFormat']): Date | null {
  if (!str) return null

  const cleanStr = str.trim()
  let day: number, month: number, year: number

  switch (format) {
    case 'DD/MM/YYYY':
    case 'DD-MM-YYYY': {
      const match = cleanStr.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/)
      if (!match) return null
      day = parseInt(match[1], 10)
      month = parseInt(match[2], 10)
      year = parseInt(match[3], 10)
      break
    }
    case 'MM/DD/YYYY': {
      const match = cleanStr.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/)
      if (!match) return null
      month = parseInt(match[1], 10)
      day = parseInt(match[2], 10)
      year = parseInt(match[3], 10)
      break
    }
    case 'YYYY-MM-DD': {
      const match = cleanStr.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/)
      if (!match) return null
      year = parseInt(match[1], 10)
      month = parseInt(match[2], 10)
      day = parseInt(match[3], 10)
      break
    }
    default:
      return null
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  if (year < 2000 || year > 2100) return null

  return new Date(year, month - 1, day)
}

function parseAmount(str: string, format: ImportConfig['numberFormat']): number {
  if (!str) return 0
  let cleaned = str.replace(/[€$£\s]/g, '')

  if (format === 'EU') {
    if (cleaned.includes(',') && cleaned.includes('.')) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.')
    } else if (cleaned.includes(',')) {
      cleaned = cleaned.replace(',', '.')
    }
  } else {
    cleaned = cleaned.replace(/,/g, '')
  }

  return parseFloat(cleaned) || 0
}

function normalizeStatus(status: string): string {
  const lower = status.toLowerCase()

  if (lower.includes('cancel')) return 'Cancelada'
  if (lower.includes('complet') || lower.includes('past')) return 'Completada'
  if (lower.includes('pending') || lower.includes('pendiente')) return 'Pendiente'
  if (lower.includes('confirm')) return 'Confirmada'

  return status || 'Confirmada'
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export default MappingPreview
