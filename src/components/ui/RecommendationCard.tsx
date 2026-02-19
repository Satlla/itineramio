'use client'

import React, { useMemo } from 'react'
import { MapPin, Star, Clock, Phone, Navigation, ExternalLink, Globe, Camera } from 'lucide-react'

export interface RecommendationPlace {
  id: string
  placeId?: string | null
  name: string
  address: string
  latitude: number
  longitude: number
  rating?: number | null
  priceLevel?: number | null
  phone?: string | null
  website?: string | null
  photoUrl?: string | null
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
      stars.push(<Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)
    } else if (i === fullStars && hasHalf) {
      stars.push(<Star key={i} className="w-3.5 h-3.5 fill-amber-400/50 text-amber-400" />)
    } else {
      stars.push(<Star key={i} className="w-3.5 h-3.5 text-gray-300" />)
    }
  }
  return stars
}

function renderPriceLevel(level: number) {
  const symbols: React.ReactNode[] = []
  for (let i = 0; i < 4; i++) {
    symbols.push(
      <span key={i} className={i < level ? 'text-green-600 font-medium' : 'text-gray-300'}>€</span>
    )
  }
  return symbols
}

function getGoogleMapsUrl(place: RecommendationPlace): string {
  if (place.placeId) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.placeId}`
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

/**
 * Parse Google opening hours (weekday_text array) and determine current open status.
 * Returns: { isOpen, closesAt, opensAt, todayHours, openSunday }
 */
function parseOpeningStatus(openingHours: any, language: string) {
  if (!openingHours || !Array.isArray(openingHours)) return null

  const now = new Date()
  const dayIndex = now.getDay() // 0=Sunday, 1=Monday...
  // Google weekday_text is Monday-first: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  const googleDayIndex = dayIndex === 0 ? 6 : dayIndex - 1
  const todayText = openingHours[googleDayIndex] || ''

  // Check if open on Sundays
  const sundayText = openingHours[6] || ''
  const sundayClosed = /cerrado|closed|fermé/i.test(sundayText)
  const openSunday = !sundayClosed && sundayText.length > 0

  // Check for 24h
  const is24h = /24\s*h|abierto las 24/i.test(todayText)

  // Try to determine if currently open
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTime = currentHour * 60 + currentMinute

  let isOpen: boolean | null = null
  let closesAt: string | null = null
  let opensNext: string | null = null

  if (is24h) {
    isOpen = true
  } else if (/cerrado|closed|fermé/i.test(todayText)) {
    isOpen = false
    // Find next opening from tomorrow
    for (let offset = 1; offset <= 7; offset++) {
      const nextDayIdx = (googleDayIndex + offset) % 7
      const nextText = openingHours[nextDayIdx] || ''
      if (!/cerrado|closed|fermé/i.test(nextText)) {
        const timeMatch = nextText.match(/(\d{1,2}):(\d{2})/)
        if (timeMatch) {
          opensNext = timeMatch[0]
        }
        break
      }
    }
  } else {
    // Try to extract time ranges like "09:00–21:30"
    const timeRanges = todayText.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/g)
    if (timeRanges) {
      for (const range of timeRanges) {
        const match = range.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/)
        if (match) {
          const openTime = parseInt(match[1]) * 60 + parseInt(match[2])
          const closeTime = parseInt(match[3]) * 60 + parseInt(match[4])
          if (currentTime >= openTime && currentTime < closeTime) {
            isOpen = true
            closesAt = `${match[3]}:${match[4]}`
          } else if (currentTime < openTime) {
            isOpen = false
            opensNext = `${match[1]}:${match[2]}`
          }
        }
      }
      if (isOpen === null) isOpen = false
    }
  }

  // Extract clean hours for today
  const hoursMatch = todayText.match(/:\s*(.+)$/)
  const todayHours = hoursMatch ? hoursMatch[1].trim() : todayText

  const labels = {
    es: { open: 'Abierto', closed: 'Cerrado', closesAt: 'Cierra a las', opensAt: 'Abre a las', sunday: 'Abierto domingos', h24: '24 horas' },
    en: { open: 'Open', closed: 'Closed', closesAt: 'Closes at', opensAt: 'Opens at', sunday: 'Open Sundays', h24: '24 hours' },
    fr: { open: 'Ouvert', closed: 'Fermé', closesAt: 'Ferme à', opensAt: 'Ouvre à', sunday: 'Ouvert dimanche', h24: '24 heures' },
  }
  const l = labels[language as keyof typeof labels] || labels.es

  return { isOpen, closesAt, opensNext, todayHours, openSunday, is24h, labels: l }
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
  const openStatus = useMemo(
    () => parseOpeningStatus(place.openingHours, language),
    [place.openingHours, language]
  )

  return (
    <div
      className={`relative rounded-xl overflow-hidden transition-all duration-200 ${
        darkMode
          ? 'bg-gray-800 border border-gray-700 hover:border-gray-500'
          : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
      } ${isClosed ? 'opacity-60' : ''}`}
    >
      {/* Photo */}
      {place.photoUrl && (
        <div className="relative w-full h-32 sm:h-40 bg-gray-100">
          <img
            src={place.photoUrl}
            alt={place.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Number badge on photo */}
          <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center text-xs font-bold">
            {index + 1}
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Number badge (only if no photo) */}
          {!place.photoUrl && (
            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}>
              {index + 1}
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Name + status badges */}
            <div className="flex items-start justify-between gap-2">
              <h3 className={`font-medium text-sm sm:text-base leading-tight ${
                darkMode ? 'text-white' : 'text-[#222222]'
              }`}>
                {place.name}
              </h3>
              <div className="flex items-center gap-1 flex-shrink-0">
                {isClosed && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                    {language === 'en' ? 'Closed' : language === 'fr' ? 'Fermé' : 'Cerrado'}
                  </span>
                )}
              </div>
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

            {/* AI Description */}
            {description && (
              <p className={`text-xs sm:text-sm mt-1.5 italic ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {description}
              </p>
            )}

            {/* Tags row: open status, open sunday, 24h */}
            {openStatus && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {/* Open/Closed now */}
                {openStatus.isOpen === true && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {openStatus.labels.open}
                    {openStatus.closesAt && ` · ${openStatus.labels.closesAt} ${openStatus.closesAt}`}
                  </span>
                )}
                {openStatus.isOpen === false && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {openStatus.labels.closed}
                    {openStatus.opensNext && ` · ${openStatus.labels.opensAt} ${openStatus.opensNext}`}
                  </span>
                )}
                {/* 24h badge */}
                {openStatus.is24h && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                    {openStatus.labels.h24}
                  </span>
                )}
                {/* Open Sundays badge */}
                {openStatus.openSunday && !openStatus.is24h && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">
                    {openStatus.labels.sunday}
                  </span>
                )}
              </div>
            )}

            {/* Metadata row: rating, price, distance, walk time */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
              {place.rating && place.rating > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex items-center">{renderStars(place.rating)}</div>
                  <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {place.rating.toFixed(1)}
                  </span>
                </div>
              )}

              {place.priceLevel && place.priceLevel > 0 && (
                <div className="flex items-center gap-0.5 text-xs">
                  {renderPriceLevel(place.priceLevel)}
                </div>
              )}

              {recommendation.distanceMeters && recommendation.distanceMeters > 0 && (
                <div className={`flex items-center gap-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Navigation className="w-3 h-3" />
                  {formatDistance(recommendation.distanceMeters)}
                </div>
              )}

              {recommendation.walkMinutes && recommendation.walkMinutes > 0 && (
                <div className={`flex items-center gap-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Clock className="w-3 h-3" />
                  {recommendation.walkMinutes} min
                </div>
              )}
            </div>

            {/* Today's hours (collapsed) */}
            {openStatus?.todayHours && !openStatus.is24h && (
              <p className={`text-xs mt-1.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <Clock className="w-3 h-3 inline mr-1 -mt-0.5" />
                {language === 'en' ? 'Today' : language === 'fr' ? "Aujourd'hui" : 'Hoy'}: {openStatus.todayHours}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-3">
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

              {place.website && (
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    darkMode
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  Web
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
