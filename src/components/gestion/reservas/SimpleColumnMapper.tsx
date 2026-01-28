'use client'

import { useState, useMemo } from 'react'
import { Check, X, HelpCircle } from 'lucide-react'

interface SimpleColumnMapperProps {
  headers: string[]
  sampleRows: string[][]
  onConfirm: (mapping: SimpleMapping) => void
  onCancel: () => void
}

export interface SimpleMapping {
  guestName: number
  checkIn: number
  checkOut: number
  amount: number
}

const FIELD_OPTIONS = [
  { key: 'guestName', label: 'Huésped', color: 'bg-blue-500' },
  { key: 'checkIn', label: 'Entrada', color: 'bg-green-500' },
  { key: 'checkOut', label: 'Salida', color: 'bg-orange-500' },
  { key: 'amount', label: 'Importe', color: 'bg-violet-500' },
] as const

type FieldKey = typeof FIELD_OPTIONS[number]['key']

export function SimpleColumnMapper({
  headers,
  sampleRows,
  onConfirm,
  onCancel
}: SimpleColumnMapperProps) {
  // Track which column is assigned to which field
  const [assignments, setAssignments] = useState<Record<FieldKey, number | null>>({
    guestName: null,
    checkIn: null,
    checkOut: null,
    amount: null,
  })

  // Track which column is being selected
  const [selectingFor, setSelectingFor] = useState<FieldKey | null>(null)

  // Check if all required fields are assigned
  const isComplete = useMemo(() => {
    return Object.values(assignments).every(v => v !== null)
  }, [assignments])

  // Get field assigned to a column (if any)
  const getFieldForColumn = (colIndex: number): FieldKey | null => {
    for (const [field, index] of Object.entries(assignments)) {
      if (index === colIndex) return field as FieldKey
    }
    return null
  }

  // Handle column click
  const handleColumnClick = (colIndex: number) => {
    if (selectingFor) {
      // Assign this column to the selected field
      // First, clear any previous assignment of this column
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

  // Handle confirm
  const handleConfirm = () => {
    if (isComplete) {
      onConfirm(assignments as SimpleMapping)
    }
  }

  return (
    <div className="space-y-4">
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

      {/* Field selection buttons */}
      <div className="flex flex-wrap gap-2">
        {FIELD_OPTIONS.map(field => {
          const isAssigned = assignments[field.key] !== null
          const isSelecting = selectingFor === field.key
          const assignedHeader = isAssigned ? headers[assignments[field.key]!] : null

          return (
            <div key={field.key} className="flex items-center gap-1">
              <button
                onClick={() => handleFieldClick(field.key)}
                className={`
                  px-3 py-2 rounded-lg font-medium text-sm transition-all
                  ${isSelecting
                    ? `${field.color} text-white ring-2 ring-offset-2 ring-${field.color.replace('bg-', '')}`
                    : isAssigned
                      ? `${field.color} text-white`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {field.label}
                {isAssigned && (
                  <span className="ml-2 text-xs opacity-75">
                    ✓
                  </span>
                )}
              </button>
              {isAssigned && (
                <button
                  onClick={() => clearAssignment(field.key)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Quitar asignación"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Selecting indicator */}
      {selectingFor && (
        <div className="text-sm text-gray-600 animate-pulse">
          👆 Ahora haz clic en la columna de <strong>{FIELD_OPTIONS.find(f => f.key === selectingFor)?.label}</strong>
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
                  const fieldInfo = assignedField
                    ? FIELD_OPTIONS.find(f => f.key === assignedField)
                    : null

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

      {/* Status */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-500">
          {Object.values(assignments).filter(v => v !== null).length} de 4 campos asignados
        </div>
        {isComplete && (
          <div className="flex items-center gap-1 text-green-600">
            <Check className="w-4 h-4" />
            Listo para importar
          </div>
        )}
      </div>

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
