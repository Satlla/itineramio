'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, AlertTriangle, Lightbulb, ChevronDown, Save } from 'lucide-react'
import { Badge, Button } from '@/components/ui'

interface PossibleMatch {
  billingUnitId: string
  billingUnitName: string
  confidence: number
  matchType: 'exact' | 'alias' | 'partial' | 'fuzzy' | 'none'
  matchedName?: string
}

interface ListingInfo {
  name: string
  count: number
  suggestedBillingUnitId: string | null
  suggestedBillingUnitName: string | null
  matchConfidence: number
  matchType: string | null
  matchedName: string | null
  possibleMatches: PossibleMatch[]
  needsManualAssignment: boolean
}

interface BillingUnitOption {
  id: string
  name: string
}

interface ListingMapping {
  billingUnitId: string
  saveAsAlias: boolean
}

interface ListingMapperProps {
  listings: ListingInfo[]
  availableBillingUnits: BillingUnitOption[]
  onMappingsChange: (mappings: Record<string, ListingMapping>) => void
  onCanConfirm: (canConfirm: boolean) => void
}

export function ListingMapper({
  listings,
  availableBillingUnits,
  onMappingsChange,
  onCanConfirm
}: ListingMapperProps) {
  const [mappings, setMappings] = useState<Record<string, ListingMapping>>({})

  // Initialize mappings from suggested matches
  useEffect(() => {
    const initialMappings: Record<string, ListingMapping> = {}

    for (const listing of listings) {
      if (listing.suggestedBillingUnitId) {
        initialMappings[listing.name] = {
          billingUnitId: listing.suggestedBillingUnitId,
          // Auto-enable saveAsAlias for non-exact matches that user might want to remember
          saveAsAlias: listing.matchType !== 'exact' && listing.matchType !== 'alias'
        }
      }
    }

    setMappings(initialMappings)
  }, [listings])

  // Notify parent of mapping changes
  useEffect(() => {
    onMappingsChange(mappings)

    // Check if all listings have a mapping
    const allMapped = listings.every(l => mappings[l.name]?.billingUnitId)
    onCanConfirm(allMapped)
  }, [mappings, listings, onMappingsChange, onCanConfirm])

  const handleBillingUnitChange = (listingName: string, billingUnitId: string) => {
    setMappings(prev => ({
      ...prev,
      [listingName]: {
        ...prev[listingName],
        billingUnitId,
        saveAsAlias: prev[listingName]?.saveAsAlias ?? true
      }
    }))
  }

  const handleSaveAsAliasChange = (listingName: string, saveAsAlias: boolean) => {
    setMappings(prev => ({
      ...prev,
      [listingName]: {
        ...prev[listingName],
        saveAsAlias
      }
    }))
  }

  const getStatusIcon = (listing: ListingInfo) => {
    const mapping = mappings[listing.name]

    if (!mapping?.billingUnitId) {
      return <AlertTriangle className="h-5 w-5 text-amber-500" />
    }

    if (listing.matchConfidence >= 90) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    }

    if (listing.matchConfidence >= 70) {
      return <Lightbulb className="h-5 w-5 text-blue-500" />
    }

    return <AlertTriangle className="h-5 w-5 text-amber-500" />
  }

  const getStatusText = (listing: ListingInfo) => {
    const mapping = mappings[listing.name]

    if (!mapping?.billingUnitId) {
      return 'Sin asignar'
    }

    if (listing.matchConfidence >= 90 && mapping.billingUnitId === listing.suggestedBillingUnitId) {
      return 'Asignado auto'
    }

    if (listing.matchConfidence >= 70 && mapping.billingUnitId === listing.suggestedBillingUnitId) {
      return `Sugerido (${listing.matchConfidence}%)`
    }

    return 'Asignado manual'
  }

  const totalReservations = listings.reduce((sum, l) => sum + l.count, 0)
  const mappedCount = listings.filter(l => mappings[l.name]?.billingUnitId).length
  const allMapped = mappedCount === listings.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Alojamientos detectados ({listings.length})
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{totalReservations} reservas en total</span>
          {!allMapped && (
            <Badge className="bg-amber-100 text-amber-800">
              {listings.length - mappedCount} sin asignar
            </Badge>
          )}
          {allMapped && (
            <Badge className="bg-green-100 text-green-800">
              Todos asignados
            </Badge>
          )}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden divide-y">
        {listings.map((listing, index) => {
          const mapping = mappings[listing.name]
          const selectedBillingUnit = mapping?.billingUnitId
            ? availableBillingUnits.find(u => u.id === mapping.billingUnitId)
            : null

          return (
            <div
              key={listing.name}
              className={`p-4 ${!mapping?.billingUnitId ? 'bg-amber-50' : 'bg-white'}`}
            >
              <div className="flex items-start gap-4">
                {/* Status icon */}
                <div className="flex-shrink-0 pt-1">
                  {getStatusIcon(listing)}
                </div>

                {/* Listing info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 truncate">
                      "{listing.name}"
                    </span>
                    <Badge className="bg-gray-100 text-gray-700 text-xs">
                      {listing.count} reservas
                    </Badge>
                  </div>

                  <div className="text-sm text-gray-500">
                    {getStatusText(listing)}
                    {listing.matchedName && listing.matchType === 'alias' && (
                      <span className="text-green-600 ml-1">
                        (alias: {listing.matchedName})
                      </span>
                    )}
                  </div>
                </div>

                {/* BillingUnit selector */}
                <div className="flex-shrink-0 w-56">
                  <div className="relative">
                    <select
                      value={mapping?.billingUnitId || ''}
                      onChange={(e) => handleBillingUnitChange(listing.name, e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                        !mapping?.billingUnitId
                          ? 'border-amber-300 bg-amber-50'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      <option value="">Seleccionar...</option>
                      {/* Show possible matches first with confidence */}
                      {listing.possibleMatches.length > 0 && (
                        <optgroup label="Sugerencias">
                          {listing.possibleMatches.map(match => (
                            <option key={match.billingUnitId} value={match.billingUnitId}>
                              {match.billingUnitName} ({match.confidence}%)
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {/* Show all available units */}
                      <optgroup label="Todos">
                        {availableBillingUnits
                          .filter(u => !listing.possibleMatches.some(m => m.billingUnitId === u.id))
                          .map(unit => (
                            <option key={unit.id} value={unit.id}>
                              {unit.name}
                            </option>
                          ))}
                      </optgroup>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Save as alias checkbox */}
                  {mapping?.billingUnitId && (
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mapping.saveAsAlias}
                        onChange={(e) => handleSaveAsAliasChange(listing.name, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                      />
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Save className="w-3 h-3" />
                        Guardar alias
                      </span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-gray-500 pt-2">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span>Match exacto</span>
        </div>
        <div className="flex items-center gap-1">
          <Lightbulb className="h-4 w-4 text-blue-500" />
          <span>Sugerido</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>Requiere asignación</span>
        </div>
      </div>

      {/* Info about save alias */}
      <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <strong>Guardar alias:</strong> Al marcar esta opción, el nombre del alojamiento en el CSV se guardará como alias del apartamento seleccionado. En futuras importaciones, se reconocerá automáticamente.
      </p>
    </div>
  )
}

export type { ListingInfo, ListingMapping, BillingUnitOption }
