'use client'

import { useState, useMemo, useEffect } from 'react'
import { Check, X, HelpCircle, ChevronDown, ChevronUp, Save, Calendar } from 'lucide-react'
import type { ColumnMapping, ImportConfig, ImportTemplate } from '@/types/import'
import { parseDateRange } from '@/lib/spanish-date-parser'

interface SimpleColumnMapperProps {
  headers: string[]
  sampleRows: string[][]
  onConfirm: (mapping: ColumnMapping, config: ImportConfig) => void
  onCancel: () => void
  savedTemplates?: ImportTemplate[]
  onSaveTemplate?: (name: string, mapping: ColumnMapping, config: ImportConfig) => Promise<void>
}

export interface SimpleMapping {
  guestName: number
  checkIn: number
  checkOut: number
  amount: number
}

type FieldKey = keyof ColumnMapping

interface FieldOption {
  key: FieldKey
  label: string
  color: string
  required: boolean
}

const REQUIRED_FIELDS: FieldOption[] = [
  { key: 'guestName', label: 'Huésped', color: 'bg-blue-500', required: true },
  { key: 'checkIn', label: 'Entrada', color: 'bg-green-500', required: true },
  { key: 'checkOut', label: 'Salida', color: 'bg-orange-500', required: true },
  { key: 'amount', label: 'Importe', color: 'bg-violet-500', required: true },
]

const DATE_RANGE_FIELD: FieldOption = {
  key: 'dateRange', label: 'Fechas (rango)', color: 'bg-teal-500', required: true
}

const OPTIONAL_FIELDS: FieldOption[] = [
  { key: 'confirmationCode', label: 'Código', color: 'bg-gray-500', required: false },
  { key: 'nights', label: 'Noches', color: 'bg-indigo-400', required: false },
  { key: 'cleaningFee', label: 'Limpieza', color: 'bg-cyan-500', required: false },
  { key: 'commission', label: 'Comisión', color: 'bg-rose-500', required: false },
  { key: 'status', label: 'Estado', color: 'bg-amber-500', required: false },
  { key: 'platform', label: 'Plataforma', color: 'bg-gray-400', required: false },
]

export function SimpleColumnMapper({
  headers,
  sampleRows,
  onConfirm,
  onCancel,
  savedTemplates = [],
  onSaveTemplate
}: SimpleColumnMapperProps) {
  // Track which column is assigned to which field
  const [assignments, setAssignments] = useState<Partial<Record<FieldKey, number | null>>>({
    guestName: null,
    checkIn: null,
    checkOut: null,
    amount: null,
  })

  // Date range mode
  const [useDateRange, setUseDateRange] = useState(false)

  // Config
  const [config, setConfig] = useState<ImportConfig>({
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'EU',
    amountType: 'NET',
    platform: 'OTHER'
  })

  // Auto-detect date range columns on mount
  const detectedDateRange = useMemo(() => {
    // Check if any column looks like a date range (contains " - ", " – ", etc.)
    const rangePatterns = [/\d+\s*[-–]\s*\d+/, /\w+\s*[-–]\s*\w+/]
    for (let col = 0; col < headers.length; col++) {
      let matches = 0
      for (const row of sampleRows.slice(0, 3)) {
        const cell = (row[col] || '').trim()
        if (cell && rangePatterns.some(p => p.test(cell)) && (cell.includes(' - ') || cell.includes(' – ') || cell.includes(' -') || cell.includes('- '))) {
          matches++
        }
      }
      if (matches >= 2) return col
    }
    return -1
  }, [headers, sampleRows])

  // Auto-enable date range mode if detected
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (detectedDateRange >= 0 && !useDateRange) {
      setUseDateRange(true)
      setAssignments(prev => {
        const cleaned = { ...prev }
        delete cleaned.checkIn
        delete cleaned.checkOut
        return { ...cleaned, dateRange: detectedDateRange }
      })
    }
  }, [])

  // UI state
  const [selectingFor, setSelectingFor] = useState<FieldKey | null>(null)
  const [showOptional, setShowOptional] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [saveTemplateName, setSaveTemplateName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState('')

  // Active fields based on mode
  const activeFields = useMemo(() => {
    const required = useDateRange
      ? [REQUIRED_FIELDS[0], DATE_RANGE_FIELD, REQUIRED_FIELDS[3]] // guest, dateRange, amount
      : REQUIRED_FIELDS
    return showOptional ? [...required, ...OPTIONAL_FIELDS] : required
  }, [useDateRange, showOptional])

  // Check if all required fields are assigned
  const isComplete = useMemo(() => {
    if (useDateRange) {
      return assignments.guestName != null && assignments.dateRange != null && assignments.amount != null
    }
    return assignments.guestName != null && assignments.checkIn != null && assignments.checkOut != null && assignments.amount != null
  }, [assignments, useDateRange])

  // Get field assigned to a column
  const getFieldForColumn = (colIndex: number): FieldKey | null => {
    for (const [field, index] of Object.entries(assignments)) {
      if (index === colIndex) return field as FieldKey
    }
    return null
  }

  // Get field info
  const getFieldInfo = (key: FieldKey): FieldOption | null => {
    return [...REQUIRED_FIELDS, DATE_RANGE_FIELD, ...OPTIONAL_FIELDS].find(f => f.key === key) || null
  }

  // Handle column click
  const handleColumnClick = (colIndex: number) => {
    if (selectingFor) {
      const newAssignments = { ...assignments }
      for (const key of Object.keys(newAssignments) as FieldKey[]) {
        if (newAssignments[key] === colIndex) {
          newAssignments[key] = null
        }
      }
      newAssignments[selectingFor] = colIndex
      setAssignments(newAssignments)
      setSelectingFor(null)
    }
  }

  // Handle field button click
  const handleFieldClick = (field: FieldKey) => {
    if (selectingFor === field) {
      setSelectingFor(null)
    } else {
      setSelectingFor(field)
    }
  }

  // Clear assignment
  const clearAssignment = (field: FieldKey) => {
    setAssignments(prev => ({ ...prev, [field]: null }))
  }

  // Toggle date range mode
  const handleToggleDateRange = () => {
    const next = !useDateRange
    setUseDateRange(next)
    setAssignments(prev => {
      const cleaned = { ...prev }
      delete cleaned.checkIn
      delete cleaned.checkOut
      delete cleaned.dateRange
      if (!next) {
        cleaned.checkIn = null
        cleaned.checkOut = null
      }
      return cleaned
    })
    setSelectingFor(null)
  }

  // Load template
  const handleLoadTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId)
    const template = savedTemplates.find(t => t.id === templateId)
    if (!template) return

    const hasDateRange = template.mapping.dateRange !== undefined
    setUseDateRange(hasDateRange)
    setConfig(template.config)

    const newAssignments: Partial<Record<FieldKey, number | null>> = {
      guestName: template.mapping.guestName ?? null,
      amount: template.mapping.amount ?? null,
    }
    if (hasDateRange) {
      newAssignments.dateRange = template.mapping.dateRange ?? null
    } else {
      newAssignments.checkIn = template.mapping.checkIn ?? null
      newAssignments.checkOut = template.mapping.checkOut ?? null
    }
    if (template.mapping.confirmationCode !== undefined) newAssignments.confirmationCode = template.mapping.confirmationCode
    if (template.mapping.nights !== undefined) newAssignments.nights = template.mapping.nights
    if (template.mapping.cleaningFee !== undefined) newAssignments.cleaningFee = template.mapping.cleaningFee
    if (template.mapping.commission !== undefined) newAssignments.commission = template.mapping.commission
    if (template.mapping.status !== undefined) newAssignments.status = template.mapping.status
    if (template.mapping.platform !== undefined) newAssignments.platform = template.mapping.platform

    // Show optional if any optional fields are mapped
    if (newAssignments.confirmationCode != null || newAssignments.nights != null ||
        newAssignments.cleaningFee != null || newAssignments.commission != null ||
        newAssignments.status != null || newAssignments.platform != null) {
      setShowOptional(true)
    }

    setAssignments(newAssignments)
  }

  // Build final mapping
  const buildMapping = (): ColumnMapping => {
    const mapping: ColumnMapping = {
      guestName: assignments.guestName!,
      checkIn: useDateRange ? assignments.dateRange! : assignments.checkIn!,
      checkOut: useDateRange ? assignments.dateRange! : assignments.checkOut!,
      amount: assignments.amount!,
    }
    if (useDateRange) mapping.dateRange = assignments.dateRange!
    if (assignments.confirmationCode != null) mapping.confirmationCode = assignments.confirmationCode
    if (assignments.nights != null) mapping.nights = assignments.nights
    if (assignments.cleaningFee != null) mapping.cleaningFee = assignments.cleaningFee
    if (assignments.commission != null) mapping.commission = assignments.commission
    if (assignments.status != null) mapping.status = assignments.status
    if (assignments.platform != null) mapping.platform = assignments.platform
    return mapping
  }

  // Handle confirm
  const handleConfirm = () => {
    if (isComplete) {
      onConfirm(buildMapping(), config)
    }
  }

  // Handle save template
  const handleSaveTemplate = async () => {
    if (!saveTemplateName.trim() || !onSaveTemplate || !isComplete) return
    setIsSaving(true)
    try {
      await onSaveTemplate(saveTemplateName.trim(), buildMapping(), config)
      setShowSaveTemplate(false)
      setSaveTemplateName('')
    } catch {
      // handled by parent
    } finally {
      setIsSaving(false)
    }
  }

  // Count assigned
  const assignedCount = Object.values(assignments).filter(v => v != null).length
  const requiredCount = useDateRange ? 3 : 4

  return (
    <div className="space-y-4">
      {/* Template selector */}
      {savedTemplates.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            value={selectedTemplateId}
            onChange={(e) => handleLoadTemplate(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">-- Cargar plantilla --</option>
            {savedTemplates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Instructions */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
        <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          <strong>¿Cómo funciona?</strong>
          <ol className="mt-1 list-decimal list-inside space-y-1">
            <li>Haz clic en un botón de abajo (Huésped, Entrada...)</li>
            <li>Luego haz clic en la columna correspondiente de la tabla</li>
          </ol>
        </div>
      </div>

      {/* Date range toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggleDateRange}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
            useDateRange
              ? 'bg-teal-50 border-teal-300 text-teal-700'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          {useDateRange ? 'Fechas en 1 columna' : 'Fechas separadas'}
        </button>
        <span className="text-gray-400 text-xs">
          {useDateRange
            ? 'Una columna con entrada y salida (ej: "6Dic - 10Dic")'
            : 'Entrada y salida en columnas diferentes'}
        </span>
      </div>

      {/* Field selection buttons - required */}
      <div className="flex flex-wrap gap-2">
        {activeFields.filter(f => f.required).map(field => {
          const isAssigned = assignments[field.key] != null
          const isSelecting = selectingFor === field.key

          return (
            <div key={field.key} className="flex items-center gap-1">
              <button
                onClick={() => handleFieldClick(field.key)}
                className={`
                  px-3 py-2 rounded-lg font-medium text-sm transition-all
                  ${isSelecting
                    ? `${field.color} text-white ring-2 ring-offset-2`
                    : isAssigned
                      ? `${field.color} text-white`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {field.label}
                {isAssigned && <span className="ml-1 text-xs opacity-75">✓</span>}
              </button>
              {isAssigned && (
                <button onClick={() => clearAssignment(field.key)} className="p-1 text-gray-400 hover:text-gray-600" title="Quitar">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )
        })}

        {/* Optional fields toggle */}
        <button
          onClick={() => setShowOptional(!showOptional)}
          className="px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 flex items-center gap-1"
        >
          + Opcionales
          {showOptional ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Optional field buttons */}
      {showOptional && (
        <div className="flex flex-wrap gap-2 pl-2 border-l-2 border-gray-200">
          {OPTIONAL_FIELDS.map(field => {
            const isAssigned = assignments[field.key] != null
            const isSelecting = selectingFor === field.key

            return (
              <div key={field.key} className="flex items-center gap-1">
                <button
                  onClick={() => handleFieldClick(field.key)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm transition-all
                    ${isSelecting
                      ? `${field.color} text-white ring-2 ring-offset-2`
                      : isAssigned
                        ? `${field.color} text-white`
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-dashed border-gray-300'
                    }
                  `}
                >
                  {field.label}
                  {isAssigned && <span className="ml-1 text-xs opacity-75">✓</span>}
                </button>
                {isAssigned && (
                  <button onClick={() => clearAssignment(field.key)} className="p-1 text-gray-400 hover:text-gray-600">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Selecting indicator */}
      {selectingFor && (
        <div className="text-sm text-gray-600 animate-pulse">
          Ahora haz clic en la columna de <strong>{getFieldInfo(selectingFor)?.label}</strong>
        </div>
      )}

      {/* Data preview table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {headers.map((header, colIndex) => {
                  const assignedField = getFieldForColumn(colIndex)
                  const fieldInfo = assignedField ? getFieldInfo(assignedField) : null

                  return (
                    <th
                      key={colIndex}
                      onClick={() => handleColumnClick(colIndex)}
                      className={`
                        px-3 py-2 text-left font-medium cursor-pointer transition-all
                        ${selectingFor ? 'hover:bg-blue-100' : ''}
                        ${fieldInfo ? `${fieldInfo.color} text-white` : 'text-gray-600'}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[120px]">{header}</span>
                        {fieldInfo && (
                          <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">
                            {fieldInfo.label}
                          </span>
                        )}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sampleRows.slice(0, 4).map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {row.map((cell, colIndex) => {
                    const assignedField = getFieldForColumn(colIndex)

                    return (
                      <td
                        key={colIndex}
                        onClick={() => handleColumnClick(colIndex)}
                        className={`
                          px-3 py-2 cursor-pointer
                          ${selectingFor ? 'hover:bg-blue-50' : ''}
                          ${assignedField ? 'bg-gray-50 font-medium' : ''}
                        `}
                      >
                        <span className="truncate block max-w-[150px]">
                          {cell || '-'}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Config section */}
      <button
        onClick={() => setShowConfig(!showConfig)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        Configuración avanzada
        {showConfig ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {showConfig && (
        <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg text-sm">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Formato de fecha</label>
            <select
              value={config.dateFormat}
              onChange={(e) => setConfig(prev => ({ ...prev, dateFormat: e.target.value as ImportConfig['dateFormat'] }))}
              className="w-full border border-gray-300 rounded px-2 py-1.5 bg-white text-sm"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD-MM-YYYY">DD-MM-YYYY</option>
              <option value="SPANISH">Español (6Dic)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Formato numérico</label>
            <select
              value={config.numberFormat}
              onChange={(e) => setConfig(prev => ({ ...prev, numberFormat: e.target.value as ImportConfig['numberFormat'] }))}
              className="w-full border border-gray-300 rounded px-2 py-1.5 bg-white text-sm"
            >
              <option value="EU">Europeo (1.234,56)</option>
              <option value="US">Americano (1,234.56)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Tipo de importe</label>
            <select
              value={config.amountType}
              onChange={(e) => setConfig(prev => ({ ...prev, amountType: e.target.value as ImportConfig['amountType'] }))}
              className="w-full border border-gray-300 rounded px-2 py-1.5 bg-white text-sm"
            >
              <option value="NET">Neto (lo que recibes)</option>
              <option value="GROSS">Bruto (antes de comisiones)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Plataforma</label>
            <select
              value={config.platform}
              onChange={(e) => setConfig(prev => ({ ...prev, platform: e.target.value as ImportConfig['platform'] }))}
              className="w-full border border-gray-300 rounded px-2 py-1.5 bg-white text-sm"
            >
              <option value="OTHER">Otro</option>
              <option value="AIRBNB">Airbnb</option>
              <option value="BOOKING">Booking</option>
              <option value="VRBO">VRBO</option>
              <option value="DIRECT">Directa</option>
            </select>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-500">
          {assignedCount} de {requiredCount} campos obligatorios asignados
        </div>
        {isComplete && (
          <div className="flex items-center gap-1 text-green-600">
            <Check className="w-4 h-4" />
            Listo para importar
          </div>
        )}
      </div>

      {/* Save template */}
      {onSaveTemplate && isComplete && (
        <div>
          {!showSaveTemplate ? (
            <button
              onClick={() => setShowSaveTemplate(true)}
              className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700"
            >
              <Save className="h-4 w-4" />
              Guardar como plantilla
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={saveTemplateName}
                onChange={(e) => setSaveTemplateName(e.target.value)}
                placeholder="Nombre de la plantilla"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                onClick={handleSaveTemplate}
                disabled={!saveTemplateName.trim() || isSaving}
                className="px-3 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 disabled:opacity-50"
              >
                {isSaving ? '...' : 'Guardar'}
              </button>
              <button
                onClick={() => { setShowSaveTemplate(false); setSaveTemplateName('') }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          disabled={!isComplete}
          className={`
            flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors
            ${isComplete
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Importar
        </button>
      </div>
    </div>
  )
}

export default SimpleColumnMapper
