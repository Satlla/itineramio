'use client'

import ResultCard from '@/components/host-profile/ResultCard'
import { Archetype } from '@/data/hostProfileQuestions'

// Ejemplos de scores para cada arquetipo
const archetypeExamples: Record<Archetype, {
  scores: {
    HOSPITALIDAD: number
    COMUNICACIÓN: number
    OPERATIVA: number
    CRISIS: number
    DATA: number
    LIMITES: number
    MKT: number
    BALANCE: number
  }
  topStrength: string
  criticalGap: string
}> = {
  ESTRATEGA: {
    scores: {
      HOSPITALIDAD: 3.5,
      COMUNICACIÓN: 3.8,
      OPERATIVA: 4.2,
      CRISIS: 3.5,
      DATA: 4.8,
      LIMITES: 3.6,
      MKT: 4.5,
      BALANCE: 3.4
    },
    topStrength: 'Análisis de Datos y Rentabilidad',
    criticalGap: 'Balance Vida-Negocio'
  },
  SISTEMATICO: {
    scores: {
      HOSPITALIDAD: 3.8,
      COMUNICACIÓN: 3.6,
      OPERATIVA: 4.7,
      CRISIS: 3.8,
      DATA: 3.5,
      LIMITES: 4.2,
      MKT: 3.4,
      BALANCE: 4.1
    },
    topStrength: 'Gestión Operativa y Procesos',
    criticalGap: 'Marketing y Diferenciación'
  },
  DIFERENCIADOR: {
    scores: {
      HOSPITALIDAD: 4.0,
      COMUNICACIÓN: 4.5,
      OPERATIVA: 3.4,
      CRISIS: 3.6,
      DATA: 3.5,
      LIMITES: 3.7,
      MKT: 4.8,
      BALANCE: 3.8
    },
    topStrength: 'Marketing y Diferenciación',
    criticalGap: 'Gestión Operativa y Procesos'
  },
  EJECUTOR: {
    scores: {
      HOSPITALIDAD: 3.6,
      COMUNICACIÓN: 3.7,
      OPERATIVA: 4.3,
      CRISIS: 4.4,
      DATA: 3.4,
      LIMITES: 4.0,
      MKT: 3.5,
      BALANCE: 2.8
    },
    topStrength: 'Resolución de Crisis',
    criticalGap: 'Balance Vida-Negocio'
  },
  RESOLUTOR: {
    scores: {
      HOSPITALIDAD: 3.8,
      COMUNICACIÓN: 4.0,
      OPERATIVA: 3.9,
      CRISIS: 4.9,
      DATA: 3.4,
      LIMITES: 4.1,
      MKT: 3.6,
      BALANCE: 3.5
    },
    topStrength: 'Resolución de Crisis',
    criticalGap: 'Análisis de Datos y Rentabilidad'
  },
  EXPERIENCIAL: {
    scores: {
      HOSPITALIDAD: 4.9,
      COMUNICACIÓN: 4.6,
      OPERATIVA: 3.5,
      CRISIS: 3.8,
      DATA: 3.2,
      LIMITES: 3.4,
      MKT: 3.9,
      BALANCE: 3.6
    },
    topStrength: 'Hospitalidad y Atención al Huésped',
    criticalGap: 'Análisis de Datos y Rentabilidad'
  },
  EQUILIBRADO: {
    scores: {
      HOSPITALIDAD: 4.1,
      COMUNICACIÓN: 4.0,
      OPERATIVA: 3.9,
      CRISIS: 4.0,
      DATA: 3.8,
      LIMITES: 3.9,
      MKT: 4.0,
      BALANCE: 4.3
    },
    topStrength: 'Balance Vida-Negocio',
    criticalGap: 'Análisis de Datos y Rentabilidad'
  },
  IMPROVISADOR: {
    scores: {
      HOSPITALIDAD: 4.2,
      COMUNICACIÓN: 3.9,
      OPERATIVA: 2.5,
      CRISIS: 4.0,
      DATA: 2.8,
      LIMITES: 2.6,
      MKT: 3.7,
      BALANCE: 2.7
    },
    topStrength: 'Hospitalidad y Atención al Huésped',
    criticalGap: 'Gestión Operativa y Procesos'
  }
}

export default function ArchetypeGalleryPage() {
  const archetypes: Archetype[] = [
    'ESTRATEGA',
    'SISTEMATICO',
    'DIFERENCIADOR',
    'EJECUTOR',
    'RESOLUTOR',
    'EXPERIENCIAL',
    'EQUILIBRADO',
    'IMPROVISADOR'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Galería de Arquetipos
          </h1>
          <p className="text-gray-600 text-lg">
            Los 8 perfiles de anfitrión con sus parámetros de decisión
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {archetypes.map((archetype) => {
            const example = archetypeExamples[archetype]
            return (
              <div key={archetype} className="transform hover:scale-105 transition-transform">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-center mb-4 text-gray-800">
                    {archetype}
                  </h2>
                  <div className="flex justify-center">
                    <div style={{ transform: 'scale(0.8)', transformOrigin: 'top' }}>
                      <ResultCard
                        archetype={archetype}
                        topStrength={example.topStrength}
                        criticalGap={example.criticalGap}
                        scores={example.scores}
                      />
                    </div>
                  </div>

                  {/* Parámetros de decisión */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h3 className="text-xs font-bold text-gray-700 mb-2">Criterios:</h3>
                    <div className="text-[10px] text-gray-600 leading-tight">
                      {archetype === 'ESTRATEGA' && 'DATA ≥ 4.0, MKT ≥ 3.5, OPERATIVA ≥ 3.0'}
                      {archetype === 'SISTEMATICO' && 'OPERATIVA ≥ 4.0, BALANCE ≥ 3.0'}
                      {archetype === 'DIFERENCIADOR' && 'MKT ≥ 4.0, COMUNICACIÓN ≥ 3.5'}
                      {archetype === 'EJECUTOR' && 'OPERATIVA ≥ 3.5, CRISIS ≥ 3.5, BALANCE < 3.5'}
                      {archetype === 'RESOLUTOR' && 'CRISIS ≥ 4.5'}
                      {archetype === 'EXPERIENCIAL' && 'HOSPITALIDAD ≥ 4.5, COMUNICACIÓN ≥ 4.0'}
                      {archetype === 'EQUILIBRADO' && 'BALANCE ≥ 4.0, diferencia < 1.5'}
                      {archetype === 'IMPROVISADOR' && 'OPERATIVA < 3.0, BALANCE < 3.0, CRISIS ≥ 3.0'}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tabla de parámetros completa */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Tabla Completa de Parámetros
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-purple-600">
                  <th className="text-left p-3 font-bold text-gray-700">Arquetipo</th>
                  <th className="text-center p-3 font-bold text-gray-700">Condiciones</th>
                  <th className="text-center p-3 font-bold text-gray-700">Descripción</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-purple-50">
                  <td className="p-3 font-semibold text-purple-600">ESTRATEGA</td>
                  <td className="p-3 text-xs text-center">DATA ≥ 4.0 AND MKT ≥ 3.5 AND OPERATIVA ≥ 3.0</td>
                  <td className="p-3 text-xs">Analista de datos, enfocado en rentabilidad y marketing</td>
                </tr>
                <tr className="border-b hover:bg-purple-50">
                  <td className="p-3 font-semibold text-purple-600">SISTEMÁTICO</td>
                  <td className="p-3 text-xs text-center">OPERATIVA ≥ 4.0 AND BALANCE ≥ 3.0</td>
                  <td className="p-3 text-xs">Procesos estructurados, alta organización</td>
                </tr>
                <tr className="border-b hover:bg-purple-50">
                  <td className="p-3 font-semibold text-purple-600">DIFERENCIADOR</td>
                  <td className="p-3 text-xs text-center">MKT ≥ 4.0 AND COMUNICACIÓN ≥ 3.5</td>
                  <td className="p-3 text-xs">Fuerte en branding, excelente comunicador</td>
                </tr>
                <tr className="border-b hover:bg-purple-50">
                  <td className="p-3 font-semibold text-purple-600">EJECUTOR</td>
                  <td className="p-3 text-xs text-center">OPERATIVA ≥ 3.5 AND CRISIS ≥ 3.5 AND BALANCE &lt; 3.5</td>
                  <td className="p-3 text-xs">Acción rápida, puede descuidar balance</td>
                </tr>
                <tr className="border-b hover:bg-purple-50">
                  <td className="p-3 font-semibold text-purple-600">RESOLUTOR</td>
                  <td className="p-3 text-xs text-center">CRISIS ≥ 4.5</td>
                  <td className="p-3 text-xs">Especialista en emergencias y crisis</td>
                </tr>
                <tr className="border-b hover:bg-purple-50">
                  <td className="p-3 font-semibold text-purple-600">EXPERIENCIAL</td>
                  <td className="p-3 text-xs text-center">HOSPITALIDAD ≥ 4.5 AND COMUNICACIÓN ≥ 4.0</td>
                  <td className="p-3 text-xs">Enfocado en experiencia del huésped</td>
                </tr>
                <tr className="border-b hover:bg-purple-50">
                  <td className="p-3 font-semibold text-purple-600">EQUILIBRADO</td>
                  <td className="p-3 text-xs text-center">BALANCE ≥ 4.0 AND diferencia &lt; 1.5</td>
                  <td className="p-3 text-xs">Scores balanceados, versatilidad total</td>
                </tr>
                <tr className="hover:bg-purple-50">
                  <td className="p-3 font-semibold text-purple-600">IMPROVISADOR</td>
                  <td className="p-3 text-xs text-center">OPERATIVA &lt; 3.0 AND BALANCE &lt; 3.0 AND CRISIS ≥ 3.0</td>
                  <td className="p-3 text-xs">Flexible, adaptable, no sigue procesos rígidos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
