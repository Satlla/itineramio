'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Star, Plus, Loader2 } from 'lucide-react'

export interface PlaceSearchResult {
  googlePlaceId: string
  name: string
  address: string
  lat: number
  lng: number
  rating: number | null
  photoUrl: string | null
  photoUrls: string[]
  priceLevel: number | null
  openNow: boolean | null
  types: string[]
}

interface PlaceSearchInputProps {
  propertyLat: number | null
  propertyLng: number | null
  onSelect: (result: PlaceSearchResult) => void
  placeholder?: string
  excludePlaceIds?: string[]
}

export function PlaceSearchInput({
  propertyLat,
  propertyLng,
  onSelect,
  placeholder = 'Buscar lugar en Google Places...',
  excludePlaceIds = [],
}: PlaceSearchInputProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    if (query.length < 2) {
      setResults([])
      setShowDropdown(false)
      setSearching(false)
      return
    }

    setSearching(true)
    timeoutRef.current = setTimeout(async () => {
      try {
        let url = `/api/places/search?q=${encodeURIComponent(query)}`
        if (propertyLat != null && propertyLng != null) {
          url += `&lat=${propertyLat}&lng=${propertyLng}`
        }
        const res = await fetch(url, { credentials: 'include' })
        const data = await res.json()
        if (data.success) {
          setResults(data.data)
          setShowDropdown(true)
        }
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setSearching(false)
      }
    }, 400)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [query, propertyLat, propertyLng])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = (result: PlaceSearchResult) => {
    onSelect(result)
    setQuery('')
    setResults([])
    setShowDropdown(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowDropdown(true) }}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white"
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500 animate-spin" />
        )}
      </div>

      <AnimatePresence>
        {showDropdown && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto"
          >
            {results.map((result) => {
              const excluded = excludePlaceIds.includes(result.googlePlaceId)
              return (
                <div
                  key={result.googlePlaceId}
                  className={`flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-0 ${excluded ? 'opacity-50' : 'cursor-pointer'}`}
                  onClick={() => !excluded && handleSelect(result)}
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">{result.name}</span>
                      {result.rating && (
                        <span className="flex items-center text-xs text-amber-600 flex-shrink-0">
                          <Star className="w-3 h-3 mr-0.5 fill-amber-400 text-amber-400" />
                          {result.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{result.address}</p>
                  </div>
                  {excluded ? (
                    <span className="text-xs text-gray-400 flex-shrink-0">Ya añadido</span>
                  ) : (
                    <div className="flex items-center gap-1 text-xs font-medium text-violet-600 bg-violet-50 px-2 py-1 rounded-md flex-shrink-0">
                      <Plus className="w-3 h-3" />
                      Seleccionar
                    </div>
                  )}
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
