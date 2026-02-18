'use client'

import React from 'react'
import { MapPin, Star, Clock, Phone, Navigation, DollarSign, ExternalLink } from 'lucide-react'

export interface RecommendationPlace {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  rating?: number | null
  priceLevel?: number | null
  phone?: string | null
  openingHours?: any
  source: string
  businessStatus?: string | null
}

export interface RecommendationData {
  id: string
  source: string
  description?: string | null
  descriptionTranslations?: any
  distanceMeters?: number | null
  walkMinutes?: number | null
  order: number
  place: RecommendationPlace | null
}

interface RecommendationCardProps {
  recommendation: RecommendationData
  index: number
  language?: string
  darkMode?: boolean
  propertyLat?: number
  propertyLng?: number
}

function formatDistance(meters?: number | null): string {
  if (!meters) return ''
  if (meters < 1000) return `${meters} m`
  return `${(meters / 1000).toFixed(1)} km`
}

function renderStars(rating: number) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.3
  const stars: React.ReactNode[] = []

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      )
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400/50 text-amber-400" />
      )
    } else {
      stars.push(
        <Star key={i} className="w-3.5 h-3.5 text-gray-300" />
      )
    }
  }
  return stars
}

function renderPriceLevel(level: number) {
  const symbols: React.ReactNode[] = []
  for (let i = 0; i < 4; i++) {
    symbols.push(
      <span
        key={i}
        className={i < level ? 'text-green-600 font-medium' : 'text-gray-300'}
      >
        €
      </span>
    )
  }
  return symbols
}

function getGoogleMapsUrl(place: RecommendationPlace): string {
  if (place.source === 'GOOGLE') {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${(place as any).placeId || ''}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`
}

function getDescription(rec: RecommendationData, language: string): string | null {
  if (rec.descriptionTranslations && typeof rec.descriptionTranslations === 'object') {
    const translations = rec.descriptionTranslations as Record<string, string>
    return translations[language] || translations.es || translations.en || null
  }
  return rec.description || null
}

export function RecommendationCard({
  recommendation,
  index,
  language = 'es',
  darkMode = false,
}: RecommendationCardProps) {
  const place = recommendation.place
  if (!place) return null

  const isClosed = place.businessStatus === 'CLOSED_PERMANENTLY'
  const description = getDescription(recommendation, language)

  return (
    <div
      className={`relative rounded-xl p-4 transition-all duration-200 ${
        darkMode
          ? 'bg-gray-800 border border-gray-700 hover:border-gray-500'
          : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
      } ${isClosed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Number badge */}
        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
          darkMode
            ? 'bg-gray-700 text-gray-300'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {index + 1}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name + Closed badge */}
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-medium text-sm sm:text-base leading-tight ${
              darkMode ? 'text-white' : 'text-[#222222]'
            }`}>
              {place.name}
            </h3>
            {isClosed && (
              <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                {language === 'en' ? 'Closed' : language === 'fr' ? 'Fermé' : 'Cerrado'}
              </span>
            )}
          </div>

          {/* Address */}
          {place.address && (
            <p className={`text-xs sm:text-sm mt-1 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <MapPin className="w-3 h-3 inline mr-1 -mt-0.5" />
              {place.address}
            </p>
          )}

          {/* Description (host-added or auto-generated) */}
          {description && (
            <p className={`text-xs sm:text-sm mt-1.5 italic ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {description}
            </p>
          )}

          {/* Metadata row: rating, price, distance, walk time */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            {/* Rating */}
            {place.rating && place.rating > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex items-center">
                  {renderStars(place.rating)}
                </div>
                <span className={`text-xs font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {place.rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* Price level */}
            {place.priceLevel && place.priceLevel > 0 && (
              <div className="flex items-center gap-0.5 text-xs">
                {renderPriceLevel(place.priceLevel)}
              </div>
            )}

            {/* Distance */}
            {recommendation.distanceMeters && recommendation.distanceMeters > 0 && (
              <div className={`flex items-center gap-1 text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Navigation className="w-3 h-3" />
                {formatDistance(recommendation.distanceMeters)}
              </div>
            )}

            {/* Walk time */}
            {recommendation.walkMinutes && recommendation.walkMinutes > 0 && (
              <div className={`flex items-center gap-1 text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Clock className="w-3 h-3" />
                {recommendation.walkMinutes} min
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3">
            {/* Google Maps */}
            <a
              href={getGoogleMapsUrl(place)}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ExternalLink className="w-3 h-3" />
              {language === 'en' ? 'Maps' : language === 'fr' ? 'Carte' : 'Mapa'}
            </a>

            {/* Phone */}
            {place.phone && (
              <a
                href={`tel:${place.phone}`}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  darkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Phone className="w-3 h-3" />
                {language === 'en' ? 'Call' : language === 'fr' ? 'Appeler' : 'Llamar'}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
