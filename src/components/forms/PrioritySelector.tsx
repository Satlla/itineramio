'use client'

import { Check, Target } from 'lucide-react'

export const PRIORIDADES = [
  { id: 'reservas', label: 'Conseguir más reservas', icon: '📈' },
  { id: 'gestion-huespedes', label: 'Gestión de huéspedes', icon: '💬' },
  { id: 'limpieza', label: 'Limpieza y mantenimiento', icon: '✨' },
  { id: 'precios', label: 'Precios y rentabilidad', icon: '💰' },
  { id: 'resenas', label: 'Reseñas y valoraciones', icon: '⭐' }
]

interface PrioritySelectorProps {
  selected: string[]
  onChange: (selected: string[]) => void
  variant?: 'default' | 'compact'
  className?: string
}

export function PrioritySelector({
  selected,
  onChange,
  variant = 'default',
  className = ''
}: PrioritySelectorProps) {
  const togglePrioridad = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter(p => p !== id)
        : [...selected, id]
    )
  }

  if (variant === 'compact') {
    return (
      <div className={className}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Target className="w-4 h-4 inline mr-2" />
          ¿En qué te gustaría mejorar? <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {PRIORIDADES.map((prioridad) => (
            <button
              key={prioridad.id}
              type="button"
              onClick={() => togglePrioridad(prioridad.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selected.includes(prioridad.id)
                  ? 'bg-violet-100 text-violet-700 border-2 border-violet-400'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
              }`}
            >
              <span>{prioridad.icon}</span>
              <span>{prioridad.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Target className="w-4 h-4 inline mr-2" />
        ¿En qué te gustaría mejorar? <span className="text-gray-400 font-normal">(opcional)</span>
      </label>
      <p className="text-xs text-gray-500 mb-3">
        Selecciona tus prioridades para enviarte contenido relevante
      </p>
      <div className="grid grid-cols-1 gap-2">
        {PRIORIDADES.map((prioridad) => (
          <button
            key={prioridad.id}
            type="button"
            onClick={() => togglePrioridad(prioridad.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all text-left ${
              selected.includes(prioridad.id)
                ? 'border-violet-500 bg-violet-50 text-violet-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <span className="text-lg">{prioridad.icon}</span>
            <span className="text-sm font-medium">{prioridad.label}</span>
            {selected.includes(prioridad.id) && (
              <Check className="w-4 h-4 ml-auto text-violet-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// Helper to convert priorities to tags (for API use)
export function prioritiesToTags(prioridades: string[]): string[] {
  return prioridades.map(p => `interes-${p}`)
}
