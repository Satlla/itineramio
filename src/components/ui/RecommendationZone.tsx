'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { RecommendationCard, RecommendationData } from './RecommendationCard'
import { ZoneIconDisplay } from './IconSelector'

interface RecommendationZoneProps {
  zoneName: string
  zoneIcon: string
  recommendations: RecommendationData[]
  language?: string
  darkMode?: boolean
}

const translations: Record<string, Record<string, string>> = {
  es: {
    nearYou: 'Cerca de tu alojamiento',
    noResults: 'No se encontraron resultados para esta categoría',
    results: 'resultados',
  },
  en: {
    nearYou: 'Near your accommodation',
    noResults: 'No results found for this category',
    results: 'results',
  },
  fr: {
    nearYou: 'Près de votre hébergement',
    noResults: 'Aucun résultat trouvé pour cette catégorie',
    results: 'résultats',
  },
}

function t(key: string, language: string): string {
  return translations[language]?.[key] || translations.es[key] || key
}

export function RecommendationZone({
  zoneName,
  zoneIcon,
  recommendations,
  language = 'es',
  darkMode = false,
}: RecommendationZoneProps) {
  const sortedRecommendations = [...recommendations].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-4">
      {/* Category header */}
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          darkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <ZoneIconDisplay
            iconId={zoneIcon}
            size="sm"
            className={darkMode ? 'text-white' : 'text-gray-700'}
          />
        </div>
        <div>
          <h2 className={`text-lg sm:text-xl font-semibold ${
            darkMode ? 'text-white' : 'text-[#222222]'
          }`}>
            {zoneName}
          </h2>
          <p className={`text-xs sm:text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <MapPin className="w-3 h-3 inline mr-1 -mt-0.5" />
            {t('nearYou', language)} · {sortedRecommendations.length} {t('results', language)}
          </p>
        </div>
      </div>

      {/* Recommendation cards */}
      {sortedRecommendations.length === 0 ? (
        <p className={`text-sm text-center py-8 ${
          darkMode ? 'text-gray-500' : 'text-gray-400'
        }`}>
          {t('noResults', language)}
        </p>
      ) : (
        <div className="space-y-3">
          {sortedRecommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <RecommendationCard
                recommendation={rec}
                index={index}
                language={language}
                darkMode={darkMode}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
