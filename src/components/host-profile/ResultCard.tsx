'use client'

import { useRef } from 'react'
import { archetypeDescriptions, type Archetype } from '@/src/data/hostProfileQuestions'
import html2canvas from 'html2canvas'

interface ResultCardProps {
  archetype: Archetype
  topStrength: string
  criticalGap: string
  scores: {
    HOSPITALIDAD: number
    COMUNICACION: number
    OPERATIVA: number
    CRISIS: number
    DATA: number
    LIMITES: number
    MKT: number
    BALANCE: number
  }
  onDownload?: () => void
}

export default function ResultCard({
  archetype,
  topStrength,
  criticalGap,
  scores,
  onDownload
}: ResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const archetypeInfo = archetypeDescriptions[archetype]

  const handleDownload = async () => {
    if (!cardRef.current) return

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      })

      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `perfil-operativo-${archetype.toLowerCase()}.png`
      link.href = dataUrl
      link.click()

      onDownload?.()
    } catch (error) {
      console.error('Error downloading card:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Downloadable Card */}
      <div
        ref={cardRef}
        className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl overflow-hidden"
        style={{
          aspectRatio: '1.91/1',
          maxWidth: '800px',
          margin: '0 auto'
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
        </div>

        {/* Color Accent Bar */}
        <div
          className="absolute top-0 left-0 right-0 h-3"
          style={{ backgroundColor: archetypeInfo.color }}
        />

        {/* Content */}
        <div className="relative h-full p-10 flex flex-col justify-between">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-6xl">{archetypeInfo.icon}</span>
                  <div>
                    <h2 className="text-4xl font-bold text-gray-900">
                      {archetypeInfo.name}
                    </h2>
                    <p className="text-lg text-gray-600">
                      {archetypeInfo.tagline}
                    </p>
                  </div>
                </div>
              </div>
              {/* Logo */}
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Itineramio
                </div>
                <div className="text-xs text-gray-500">Perfil Operativo</div>
              </div>
            </div>

            {/* Description */}
            <p className="text-base text-gray-700 leading-relaxed mb-6">
              {archetypeInfo.description}
            </p>
          </div>

          {/* Scores Grid */}
          <div>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {Object.entries(scores).map(([dimension, score]) => {
                const percentage = (score / 5) * 100
                return (
                  <div key={dimension} className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="4"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke={archetypeInfo.color}
                          strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - percentage / 100)}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">
                          {score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-gray-600">
                      {dimension.charAt(0) + dimension.slice(1).toLowerCase()}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Key Insights */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                <div className="font-semibold text-green-900 mb-1">
                  💪 Fortaleza Principal
                </div>
                <div className="text-green-700">{topStrength}</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
                <div className="font-semibold text-orange-900 mb-1">
                  🎯 Área de Mejora
                </div>
                <div className="text-orange-700">{criticalGap}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Descubre tu perfil completo en <span className="font-semibold">itineramio.com/host-profile</span>
            </p>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="text-center">
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Descargar resultado
        </button>
      </div>
    </div>
  )
}
