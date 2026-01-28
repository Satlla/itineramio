'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import {
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  Trash2
} from 'lucide-react'
import type {
  ColumnMapping,
  ImportConfig,
  ImportTemplate,
  ColumnMapperProps,
  MappingField,
  DateFormatOption,
  NumberFormatOption,
  PlatformOption
} from '@/types/import'

// Field definitions
const REQUIRED_FIELDS: MappingField[] = [
  {
    key: 'guestName',
    label: 'Guest Name',
    labelEs: 'Nombre del huesped',
    required: true,
    description: 'Nombre completo del huesped'
  },
  {
    key: 'checkIn',
    label: 'Check-in Date',
    labelEs: 'Fecha de entrada',
    required: true,
    description: 'Fecha de llegada del huesped'
  },
  {
    key: 'checkOut',
    label: 'Check-out Date',
    labelEs: 'Fecha de salida',
    required: true,
    description: 'Fecha de salida del huesped'
  },
  {
    key: 'amount',
    label: 'Amount',
    labelEs: 'Importe',
    required: true,
    description: 'Ganancias netas o importe total'
  }
]

const OPTIONAL_FIELDS: MappingField[] = [
  {
    key: 'confirmationCode',
    label: 'Confirmation Code',
    labelEs: 'Codigo de confirmacion',
    required: false,
    description: 'Codigo unico de la reserva'
  },
  {
    key: 'nights',
    label: 'Nights',
    labelEs: 'Noches',
    required: false,
    description: 'Numero de noches (se calcula automaticamente si no se mapea)'
  },
  {
    key: 'cleaningFee',
    label: 'Cleaning Fee',
    labelEs: 'Tarifa de limpieza',
    required: false,
    description: 'Importe de la limpieza'
  },
  {
    key: 'commission',
    label: 'Commission',
    labelEs: 'Comision',
    required: false,
    description: 'Comision de la plataforma'
  },
  {
    key: 'status',
    label: 'Status',
    labelEs: 'Estado',
    required: false,
    description: 'Estado de la reserva (confirmada, cancelada, etc.)'
  }
]

const DATE_FORMATS: DateFormatOption[] = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (Europeo)', example: '25/12/2024' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (Americano)', example: '12/25/2024' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)', example: '2024-12-25' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY', example: '25-12-2024' }
]

const NUMBER_FORMATS: NumberFormatOption[] = [
  { value: 'EU', label: 'Europeo (1.234,56)', example: '1.234,56 EUR' },
  { value: 'US', label: 'Americano (1,234.56)', example: '1,234.56' }
]

const PLATFORMS: PlatformOption[] = [
  { value: 'AIRBNB', label: 'Airbnb' },
  { value: 'BOOKING', label: 'Booking.com' },
  { value: 'VRBO', label: 'VRBO / HomeAway' },
  { value: 'DIRECT', label: 'Reserva directa' },
  { value: 'OTHER', label: 'Otro / Desconocido' }
]

export function ColumnMapper({
  headers,
  sampleRows,
  onMappingComplete,
  onCancel,
  savedTemplates = [],
  onSaveTemplate
}: ColumnMapperProps) {
  // State for mapping
  const [mapping, setMapping] = useState<Partial<ColumnMapping>>({})

  // State for config
  const [config, setConfig] = useState<ImportConfig>({
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'EU',
    amountType: 'NET',
    platform: 'OTHER'
  })

  // UI state
  const [showOptionalFields, setShowOptionalFields] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [saveTemplateName, setSaveTemplateName] = useState('')
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load template when selected
  useEffect(() => {
    if (selectedTemplateId) {
      const template = savedTemplates.find(t => t.id === selectedTemplateId)
      if (template) {
        setMapping(template.mapping)
        setConfig(template.config)
      }
    }
  }, [selectedTemplateId, savedTemplates])

  // Column options for dropdowns
  const columnOptions = useMemo(() => {
    return headers.map((header, index) => ({
      index,
      header,
      sample: sampleRows[0]?.[index] || ''
    }))
  }, [headers, sampleRows])

  // Check if mapping is complete
  const isMappingComplete = useMemo(() => {
    return (
      mapping.guestName !== undefined &&
      mapping.checkIn !== undefined &&
      mapping.checkOut !== undefined &&
      mapping.amount !== undefined
    )
  }, [mapping])

  // Parse preview data
  const previewData = useMemo(() => {
    if (!isMappingComplete) return []

    return sampleRows.slice(0, 5).map((row, rowIndex) => {
      const errors: string[] = []

      const guestName = mapping.guestName !== undefined ? row[mapping.guestName] : ''
      const checkInStr = mapping.checkIn !== undefined ? row[mapping.checkIn] : ''
      const checkOutStr = mapping.checkOut !== undefined ? row[mapping.checkOut] : ''
      const amountStr = mapping.amount !== undefined ? row[mapping.amount] : ''

      // Validate guest name
      if (!guestName?.trim()) {
        errors.push('Nombre vacio')
      }

      // Validate dates
      const checkIn = parsePreviewDate(checkInStr, config.dateFormat)
      const checkOut = parsePreviewDate(checkOutStr, config.dateFormat)

      if (!checkIn) errors.push('Fecha entrada invalida')
      if (!checkOut) errors.push('Fecha salida invalida')

      // Validate amount
      const amount = parsePreviewAmount(amountStr, config.numberFormat)
      if (amount <= 0) errors.push('Importe invalido')

      return {
        rowIndex,
        guestName: guestName?.trim() || '-',
        checkIn: checkIn ? formatDate(checkIn) : checkInStr,
        checkOut: checkOut ? formatDate(checkOut) : checkOutStr,
        amount: amount > 0 ? formatAmount(amount) : amountStr,
        isValid: errors.length === 0,
        errors
      }
    })
  }, [mapping, config, sampleRows, isMappingComplete])

  // Count valid/invalid rows
  const validCount = previewData.filter(r => r.isValid).length
  const invalidCount = previewData.filter(r => !r.isValid).length

  // Handle field mapping change
  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    const numValue = value === '' ? undefined : parseInt(value, 10)
    setMapping(prev => ({
      ...prev,
      [field]: numValue
    }))
  }

  // Handle save template
  const handleSaveTemplate = async () => {
    if (!saveTemplateName.trim() || !onSaveTemplate) return

    setIsSaving(true)
    try {
      await onSaveTemplate(
        saveTemplateName.trim(),
        mapping as ColumnMapping,
        config
      )
      setShowSaveTemplate(false)
      setSaveTemplateName('')
    } catch {
      // Error handled by parent
    } finally {
      setIsSaving(false)
    }
  }

  // Handle apply
  const handleApply = () => {
    if (isMappingComplete) {
      onMappingComplete(mapping as ColumnMapping, config)
    }
  }

  return (
    <Card className="border-2 border-violet-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-violet-600" />
            <h2 className="text-lg font-semibold">Configurar importacion</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        {/* Template selector */}
        {savedTemplates.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plantilla guardada
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">-- Seleccionar plantilla --</option>
              {savedTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 my-6" />

        {/* Required fields */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-red-500">*</span>
            CAMPOS OBLIGATORIOS
          </h3>

          <div className="space-y-4">
            {REQUIRED_FIELDS.map((field) => (
              <FieldMapping
                key={field.key}
                field={field}
                value={mapping[field.key]}
                options={columnOptions}
                onChange={(value) => handleMappingChange(field.key, value)}
                sampleRows={sampleRows}
              />
            ))}
          </div>
        </div>

        {/* Configuration */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            CONFIGURACION
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Formato de fecha
              </label>
              <select
                value={config.dateFormat}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  dateFormat: e.target.value as ImportConfig['dateFormat']
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {DATE_FORMATS.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Formato numerico
              </label>
              <select
                value={config.numberFormat}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  numberFormat: e.target.value as ImportConfig['numberFormat']
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {NUMBER_FORMATS.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Tipo de importe
              </label>
              <select
                value={config.amountType}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  amountType: e.target.value as ImportConfig['amountType']
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="NET">Ganancias netas (lo que recibes)</option>
                <option value="GROSS">Importe bruto (antes de comisiones)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Plataforma de origen
              </label>
              <select
                value={config.platform}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  platform: e.target.value as ImportConfig['platform']
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {PLATFORMS.map((platform) => (
                  <option key={platform.value} value={platform.value}>
                    {platform.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Optional fields toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowOptionalFields(!showOptionalFields)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {showOptionalFields ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            Campos opcionales ({OPTIONAL_FIELDS.length})
          </button>

          {showOptionalFields && (
            <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
              {OPTIONAL_FIELDS.map((field) => (
                <FieldMapping
                  key={field.key}
                  field={field}
                  value={mapping[field.key]}
                  options={columnOptions}
                  onChange={(value) => handleMappingChange(field.key, value)}
                  sampleRows={sampleRows}
                />
              ))}
            </div>
          )}
        </div>

        {/* Preview */}
        {isMappingComplete && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              VISTA PREVIA (primeras {previewData.length} filas)
            </h3>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Huesped</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Entrada</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Salida</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600">Importe</th>
                    <th className="px-3 py-2 text-center font-medium text-gray-600">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {previewData.map((row) => (
                    <tr
                      key={row.rowIndex}
                      className={row.isValid ? '' : 'bg-red-50'}
                    >
                      <td className="px-3 py-2">{row.guestName}</td>
                      <td className="px-3 py-2">{row.checkIn}</td>
                      <td className="px-3 py-2">{row.checkOut}</td>
                      <td className="px-3 py-2 text-right">{row.amount}</td>
                      <td className="px-3 py-2 text-center">
                        {row.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="text-xs text-red-600">
                              {row.errors[0]}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                {validCount} filas validas
              </span>
              {invalidCount > 0 && (
                <span className="flex items-center gap-1 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  {invalidCount} filas con errores
                </span>
              )}
            </div>
          </div>
        )}

        {/* Save template option */}
        {onSaveTemplate && isMappingComplete && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            {!showSaveTemplate ? (
              <button
                onClick={() => setShowSaveTemplate(true)}
                className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700"
              >
                <Save className="h-4 w-4" />
                Guardar como plantilla
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={saveTemplateName}
                  onChange={(e) => setSaveTemplateName(e.target.value)}
                  placeholder="Nombre de la plantilla"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <Button
                  onClick={handleSaveTemplate}
                  disabled={!saveTemplateName.trim() || isSaving}
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSaveTemplate(false)
                    setSaveTemplateName('')
                  }}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            onClick={handleApply}
            disabled={!isMappingComplete}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            Aplicar e importar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Field mapping component
interface FieldMappingProps {
  field: MappingField
  value: number | undefined
  options: Array<{ index: number; header: string; sample: string }>
  onChange: (value: string) => void
  sampleRows: string[][]
}

function FieldMapping({ field, value, options, onChange, sampleRows }: FieldMappingProps) {
  const selectedSample = value !== undefined && sampleRows[0]
    ? sampleRows[0][value] || ''
    : ''

  return (
    <div>
      <label className="block text-sm text-gray-700 mb-2">
        {field.labelEs}
        {field.required && <span className="text-red-500 ml-1">*</span>}
        {field.description && (
          <span className="ml-2 text-gray-400" title={field.description}>
            <HelpCircle className="h-3 w-3 inline" />
          </span>
        )}
      </label>
      <select
        value={value !== undefined ? value.toString() : ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 ${
          field.required && value === undefined
            ? 'border-red-300'
            : 'border-gray-300'
        }`}
      >
        <option value="">-- Seleccionar columna --</option>
        {options.map((opt) => (
          <option key={opt.index} value={opt.index}>
            Col. {opt.index + 1}: &quot;{opt.header}&quot;
          </option>
        ))}
      </select>
      {selectedSample && (
        <p className="mt-1 text-xs text-gray-500">
          Ejemplo: &quot;{selectedSample.substring(0, 50)}{selectedSample.length > 50 ? '...' : ''}&quot;
        </p>
      )}
    </div>
  )
}

// Helper functions
function parsePreviewDate(str: string, format: ImportConfig['dateFormat']): Date | null {
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
  return new Date(year, month - 1, day)
}

function parsePreviewAmount(str: string, format: ImportConfig['numberFormat']): number {
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

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

export default ColumnMapper
