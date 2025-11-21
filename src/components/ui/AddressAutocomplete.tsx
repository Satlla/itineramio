'use client'

import React, { useState, useEffect, useRef } from 'react'
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete'
import { MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Input } from './Input'

interface AddressData {
  street: string
  city: string
  state: string
  country: string
  postalCode: string
  lat?: number
  lng?: number
  formattedAddress: string
}

interface AddressAutocompleteProps {
  value?: string
  onChange: (address: AddressData) => void
  onBlur?: () => void
  error?: boolean
  placeholder?: string
  disabled?: boolean
}

export function AddressAutocomplete({
  value = '',
  onChange,
  onBlur,
  error,
  placeholder = 'Escribe una dirección...',
  disabled = false
}: AddressAutocompleteProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [scriptError, setScriptError] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [manualInput, setManualInput] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get API key from environment
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // Load Google Maps script (singleton pattern to prevent multiple loads)
  useEffect(() => {
    if (!apiKey) {
      console.warn('⚠️ Google Maps API key not found. Using fallback input.')
      setScriptError(true)
      return
    }

    if (typeof window !== 'undefined') {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log('✅ Google Maps already loaded')
        setIsScriptLoaded(true)
        return
      }

      // Check if script is already being loaded (prevent duplicates)
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com/maps/api/js"]'
      )

      if (existingScript) {
        console.log('⏳ Google Maps script already loading, waiting...')

        // Wait for existing script to load
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            console.log('✅ Google Maps loaded from existing script')
            setIsScriptLoaded(true)
            clearInterval(checkLoaded)
          }
        }, 100)

        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkLoaded)
          if (!window.google || !window.google.maps) {
            console.error('❌ Timeout loading Google Maps')
            setScriptError(true)
          }
        }, 10000)

        return
      }

      // Load script for the first time
      console.log('📍 Loading Google Maps API for the first time...')
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=es`
      script.async = true
      script.defer = true

      script.onload = () => {
        console.log('✅ Google Maps API loaded successfully')
        setIsScriptLoaded(true)
      }

      script.onerror = () => {
        console.error('❌ Failed to load Google Maps API. Using fallback input.')
        setScriptError(true)
      }

      document.head.appendChild(script)
    }
  }, [apiKey])

  // If no API key or script failed, show normal input (FALLBACK)
  if (!apiKey || scriptError) {
    return (
      <div className="relative">
        <Input
          ref={inputRef}
          value={manualInput}
          onChange={(e) => {
            setManualInput(e.target.value)
            // Para el fallback manual, intentar parsear la dirección
            const parts = e.target.value.split(',').map(p => p.trim())
            onChange({
              street: parts[0] || e.target.value,
              city: parts[1] || 'Sin especificar',
              state: parts[2] || parts[1] || 'Sin especificar',
              country: 'España',
              postalCode: '00000',
              formattedAddress: e.target.value
            })
          }}
          onBlur={onBlur}
          placeholder={placeholder}
          error={error}
          disabled={disabled}
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <AlertCircle className="w-4 h-4 text-amber-500" />
        </div>
        <p className="mt-1 text-xs text-amber-600">
          Google Maps no disponible. Introduce la dirección manualmente.
        </p>
      </div>
    )
  }

  // If still loading, show loading state
  if (!isScriptLoaded) {
    return (
      <div className="relative">
        <Input
          value=""
          disabled
          placeholder="Cargando Google Maps..."
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
        </div>
      </div>
    )
  }

  // Google Maps loaded successfully, use autocomplete
  return <AddressAutocompleteWithGoogle
    value={value}
    onChange={onChange}
    onBlur={onBlur}
    error={error}
    placeholder={placeholder}
    disabled={disabled}
    selectedAddress={selectedAddress}
    setSelectedAddress={setSelectedAddress}
  />
}

// Separate component for when Google Maps is loaded
function AddressAutocompleteWithGoogle({
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  disabled,
  selectedAddress,
  setSelectedAddress
}: AddressAutocompleteProps & {
  selectedAddress: string | null
  setSelectedAddress: (address: string | null) => void
}) {
  const {
    ready,
    value: inputValue,
    suggestions: { status, data },
    setValue: setInputValue,
    clearSuggestions
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'es' },
      language: 'es'
    },
    debounce: 300,
    cache: 24 * 60 * 60,
  })

  useEffect(() => {
    if (value && value !== inputValue) {
      setInputValue(value, false)
    }
  }, [value])

  const handleSelect = async (description: string) => {
    setInputValue(description, false)
    clearSuggestions()
    setSelectedAddress(description)

    try {
      const results = await getGeocode({ address: description })

      if (results && results[0]) {
        const place = results[0]
        const latLng = await getLatLng(results[0])

        // Parse address components
        const addressComponents = place.address_components
        let street = ''
        let streetNumber = ''
        let city = ''
        let state = ''
        let country = ''
        let postalCode = ''

        addressComponents?.forEach((component: any) => {
          const types = component.types

          if (types.includes('route')) {
            street = component.long_name
          }
          if (types.includes('street_number')) {
            streetNumber = component.long_name
          }
          if (types.includes('locality')) {
            city = component.long_name
          }
          if (types.includes('administrative_area_level_2') && !city) {
            city = component.long_name
          }
          if (types.includes('administrative_area_level_1')) {
            state = component.long_name
          }
          if (types.includes('country')) {
            country = component.long_name
          }
          if (types.includes('postal_code')) {
            postalCode = component.long_name
          }
        })

        const fullStreet = streetNumber ? `${street} ${streetNumber}` : street

        // Try to extract missing fields from formatted_address as fallback
        const formattedParts = place.formatted_address.split(',').map((p: string) => p.trim())

        // If city is missing, try to get it from formatted address
        if (!city && formattedParts.length >= 2) {
          city = formattedParts[formattedParts.length - 2]
        }

        // If state is missing, use city as fallback
        if (!state && city) {
          state = city
        }

        const addressData: AddressData = {
          street: fullStreet || formattedParts[0] || description,
          city: city || 'Sin especificar',
          state: state || 'Sin especificar',
          country: country || 'España',
          postalCode: postalCode || '00000',
          lat: latLng.lat,
          lng: latLng.lng,
          formattedAddress: place.formatted_address
        }

        console.log('📍 Dirección seleccionada:', addressData)
        console.log('📍 Componentes encontrados:', {
          street: !!fullStreet,
          city: !!city,
          state: !!state,
          country: !!country,
          postalCode: !!postalCode
        })

        onChange(addressData)
      }
    } catch (error) {
      console.error('❌ Error al obtener geocode:', error)
      // Fallback: parse manually from description
      const parts = description.split(',').map(p => p.trim())
      const fallbackData = {
        street: parts[0] || description,
        city: parts[1] || 'Sin especificar',
        state: parts[2] || parts[1] || 'Sin especificar',
        country: 'España',
        postalCode: '00000',
        formattedAddress: description
      }
      console.log('⚠️ Usando datos fallback:', fallbackData)
      onChange(fallbackData)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setSelectedAddress(null)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onBlur={onBlur}
          placeholder={placeholder}
          error={error}
          disabled={!ready || disabled}
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {selectedAddress ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <MapPin className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {status === 'OK' && data.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {data.map((suggestion) => {
            const {
              place_id,
              structured_formatting: { main_text, secondary_text },
              description
            } = suggestion

            return (
              <button
                key={place_id}
                type="button"
                onClick={() => handleSelect(description)}
                className="w-full text-left px-4 py-3 hover:bg-violet-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-violet-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {main_text}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {secondary_text}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Helper text */}
      <p className="mt-1 text-xs text-gray-500">
        {selectedAddress ? (
          <span className="text-green-600 flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Dirección verificada por Google Maps
          </span>
        ) : (
          'Comienza a escribir y selecciona una dirección de la lista'
        )}
      </p>
    </div>
  )
}
