'use client'

import { useRef } from 'react'
import { archetypeDescriptions, type Archetype } from '@/data/hostProfileQuestions'
import html2canvas from 'html2canvas'
import { ItineramioLogo } from '@/components/ui/ItineramioLogo'

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

// Iconos vectoriales al estilo Airbnb para cada arquetipo
const ArchetypeIcon = ({ archetype }: { archetype: Archetype }) => {
  const icons: Record<Archetype, JSX.Element> = {
    ESTRATEGA: (
      <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
        <circle cx="60" cy="60" r="50" fill="url(#grad-estratega)" opacity="0.1"/>
        <path d="M40 45 L50 35 L70 55 L60 65 Z" fill="url(#grad-estratega)" strokeWidth="2" stroke="url(#grad-estratega)"/>
        <circle cx="75" cy="45" r="8" fill="url(#grad-estratega)"/>
        <path d="M45 70 L55 80 L65 70 L75 80" stroke="url(#grad-estratega)" strokeWidth="3" strokeLinecap="round"/>
        <path d="M35 50 Q60 40 85 50" stroke="url(#grad-estratega)" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <defs>
          <linearGradient id="grad-estratega" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA"/>
            <stop offset="100%" stopColor="#2563EB"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    SISTEMATICO: (
      <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
        <circle cx="60" cy="60" r="50" fill="url(#grad-sistematico)" opacity="0.1"/>
        <circle cx="60" cy="40" r="12" stroke="url(#grad-sistematico)" strokeWidth="3"/>
        <circle cx="45" cy="70" r="12" stroke="url(#grad-sistematico)" strokeWidth="3"/>
        <circle cx="75" cy="70" r="12" stroke="url(#grad-sistematico)" strokeWidth="3"/>
        <path d="M60 52 L60 58 M51 63 L54 66 M69 63 L66 66" stroke="url(#grad-sistematico)" strokeWidth="3" strokeLinecap="round"/>
        <rect x="48" y="33" width="24" height="14" rx="2" fill="url(#grad-sistematico)" opacity="0.3"/>
        <defs>
          <linearGradient id="grad-sistematico" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA"/>
            <stop offset="100%" stopColor="#2563EB"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    DIFERENCIADOR: (
      <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
        <circle cx="60" cy="60" r="50" fill="url(#grad-diferenciador)" opacity="0.1"/>
        <path d="M60 30 L70 50 L90 55 L72 70 L75 90 L60 80 L45 90 L48 70 L30 55 L50 50 Z" fill="url(#grad-diferenciador)"/>
        <circle cx="60" cy="60" r="12" fill="white"/>
        <defs>
          <linearGradient id="grad-diferenciador" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA"/>
            <stop offset="100%" stopColor="#2563EB"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    EJECUTOR: (
      <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
        <circle cx="60" cy="60" r="50" fill="url(#grad-ejecutor)" opacity="0.1"/>
        <path d="M35 60 L55 60 L60 40 L65 80 L70 60 L85 60" stroke="url(#grad-ejecutor)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M75 55 L85 60 L75 65" fill="url(#grad-ejecutor)"/>
        <defs>
          <linearGradient id="grad-ejecutor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA"/>
            <stop offset="100%" stopColor="#2563EB"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    RESOLUTOR: (
      <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
        <circle cx="60" cy="60" r="50" fill="url(#grad-resolutor)" opacity="0.1"/>
        <path d="M50 45 L50 75 M50 45 L60 35 L70 45 M50 75 L60 85 L70 75 M70 45 L70 75" stroke="url(#grad-resolutor)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="60" cy="60" r="8" fill="url(#grad-resolutor)"/>
        <defs>
          <linearGradient id="grad-resolutor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA"/>
            <stop offset="100%" stopColor="#2563EB"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    EXPERIENCIAL: (
      <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
        <circle cx="60" cy="60" r="50" fill="url(#grad-experiencial)" opacity="0.1"/>
        <path d="M60 35 C60 35 85 50 85 65 C85 77 73 85 60 85 C47 85 35 77 35 65 C35 50 60 35 60 35 Z" fill="url(#grad-experiencial)"/>
        <defs>
          <linearGradient id="grad-experiencial" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA"/>
            <stop offset="100%" stopColor="#2563EB"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    EQUILIBRADO: (
      <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
        <circle cx="60" cy="60" r="50" fill="url(#grad-equilibrado)" opacity="0.1"/>
        <path d="M35 55 L50 70 L70 70 L85 55" stroke="url(#grad-equilibrado)" strokeWidth="3" fill="none"/>
        <line x1="60" y1="40" x2="60" y2="70" stroke="url(#grad-equilibrado)" strokeWidth="3"/>
        <circle cx="60" cy="40" r="5" fill="url(#grad-equilibrado)"/>
        <line x1="40" y1="75" x2="80" y2="75" stroke="url(#grad-equilibrado)" strokeWidth="3" strokeLinecap="round"/>
        <defs>
          <linearGradient id="grad-equilibrado" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA"/>
            <stop offset="100%" stopColor="#2563EB"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    IMPROVISADOR: (
      <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
        <circle cx="60" cy="60" r="50" fill="url(#grad-improvisador)" opacity="0.1"/>
        <circle cx="60" cy="65" r="15" fill="url(#grad-improvisador)"/>
        <path d="M50 45 L52 35 M60 42 L60 30 M70 45 L68 35" stroke="url(#grad-improvisador)" strokeWidth="3" strokeLinecap="round"/>
        <path d="M45 55 Q40 60 45 65 M75 55 Q80 60 75 65" stroke="url(#grad-improvisador)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <defs>
          <linearGradient id="grad-improvisador" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA"/>
            <stop offset="100%" stopColor="#2563EB"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  }

  return icons[archetype]
}

const dimensionLabels: Record<string, string> = {
  HOSPITALIDAD: 'Hospitalidad',
  COMUNICACION: 'Comunicación',
  OPERATIVA: 'Operativa',
  CRISIS: 'Gestión de Crisis',
  DATA: 'Análisis de Datos',
  LIMITES: 'Límites',
  MKT: 'Marketing',
  BALANCE: 'Balance',
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
      link.download = `perfil-${archetype.toLowerCase()}-itineramio.png`
      link.href = dataUrl
      link.click()

      onDownload?.()
    } catch (error) {
      console.error('Error downloading card:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Downloadable Card - FORMATO VERTICAL */}
      <div
        ref={cardRef}
        className="relative bg-white rounded-3xl shadow-2xl overflow-hidden mx-auto"
        style={{
          width: '340px',
          aspectRatio: '9/16',
        }}
      >
        {/* Sutil Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #9333EA 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} />
        </div>

        {/* Content Container */}
        <div className="relative h-full flex flex-col p-4 pb-12">

          {/* Top Section: Icon + Title */}
          <div className="flex flex-col items-center text-center mb-2">
            {/* Vector Icon */}
            <div className="w-14 h-14 mb-1.5">
              <ArchetypeIcon archetype={archetype} />
            </div>

            {/* Title */}
            <p className="text-[9px] font-medium text-gray-500 uppercase tracking-wider mb-0.5">
              Tu perfil de Anfitrión es
            </p>
            <h1 className="text-lg font-black text-black mb-0.5">
              EL {archetype}
            </h1>
            <p className="text-[9px] text-gray-600 italic">
              {archetypeInfo.tagline}
            </p>
          </div>

          {/* Divider */}
          <div className="w-14 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto mb-2"></div>

          {/* Scores Section - RPG Character Card Style - Top 5 */}
          <div className="flex-1 space-y-1.5 px-2">
            {Object.entries(scores)
              .sort((a, b) => b[1] - a[1]) // Ordenar por score descendente
              .slice(0, 5) // Solo top 5
              .map(([dimension, score]) => {
              const percentage = (score / 5) * 100
              const segments = 5 // 5 rectángulos
              const filledSegments = Math.round((percentage / 100) * segments)

              // Función para obtener el color de cada segmento
              const getSegmentColor = (index: number, isFilled: boolean) => {
                if (!isFilled) return 'bg-gray-200'

                // Rojos (0-1): primeros 2 segmentos
                if (index < 2) return 'bg-red-500'
                // Amarillo/Naranja (2-3): segmentos del medio
                if (index < 4) return 'bg-orange-400'
                // Verde (4): último segmento
                return 'bg-green-500'
              }

              return (
                <div key={dimension} className="bg-gray-50/50 rounded-lg p-1.5 border border-gray-100">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[9px] font-bold text-gray-800 uppercase tracking-wide">
                      {dimensionLabels[dimension]}
                    </span>
                    <span className="text-[9px] font-black text-gray-700">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: segments }).map((_, index) => (
                      <div
                        key={index}
                        className={`h-5 flex-1 rounded-[4px] transition-all duration-300 ${getSegmentColor(index, index < filledSegments)}`}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom Section */}
          <div className="mt-2 pt-2 border-t border-gray-100">
            {/* Summary */}
            <div className="mb-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 border border-gray-200">
              <div className="text-[7px] text-gray-700 leading-relaxed text-center">
                {archetypeInfo.description}
              </div>
            </div>

            {/* Logo */}
            <div className="flex items-center justify-center gap-1 text-[7px] text-gray-600">
              <span>Certified with</span>
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span>by Itineramio</span>
            </div>
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
