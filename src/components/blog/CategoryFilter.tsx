'use client'

import { useState } from 'react'
import {
  Filter,
  BookOpen,
  Lightbulb,
  Shield,
  Zap,
  Target,
  Settings,
  Award,
  Newspaper
} from 'lucide-react'

// Category configurations with icons and colors
const categoryConfig: Record<string, { name: string; icon: any; color: string; gradient: string }> = {
  'GUIAS': {
    name: 'Guías',
    icon: BookOpen,
    color: 'text-blue-600',
    gradient: 'from-blue-50 to-blue-100'
  },
  'MEJORES_PRACTICAS': {
    name: 'Mejores Prácticas',
    icon: Lightbulb,
    color: 'text-amber-600',
    gradient: 'from-amber-50 to-amber-100'
  },
  'NORMATIVA': {
    name: 'Normativa',
    icon: Shield,
    color: 'text-purple-600',
    gradient: 'from-purple-50 to-purple-100'
  },
  'AUTOMATIZACION': {
    name: 'Automatización',
    icon: Zap,
    color: 'text-violet-600',
    gradient: 'from-violet-50 to-violet-100'
  },
  'MARKETING': {
    name: 'Marketing',
    icon: Target,
    color: 'text-pink-600',
    gradient: 'from-pink-50 to-pink-100'
  },
  'OPERACIONES': {
    name: 'Operaciones',
    icon: Settings,
    color: 'text-cyan-600',
    gradient: 'from-cyan-50 to-cyan-100'
  },
  'CASOS_ESTUDIO': {
    name: 'Casos de Estudio',
    icon: Award,
    color: 'text-emerald-600',
    gradient: 'from-emerald-50 to-emerald-100'
  },
  'NOTICIAS': {
    name: 'Noticias',
    icon: Newspaper,
    color: 'text-red-600',
    gradient: 'from-red-50 to-red-100'
  }
}

interface CategoryFilterProps {
  categories: string[]
  onCategoryChange: (category: string | null) => void
}

export default function CategoryFilter({ categories, onCategoryChange }: CategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleCategoryClick = (category: string) => {
    const newCategory = selectedCategory === category ? null : category
    setSelectedCategory(newCategory)
    onCategoryChange(newCategory)
  }

  return (
    <section className="bg-white border-b border-gray-200 sticky top-[73px] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Desktop: centered, Mobile: scroll horizontal */}
        <div className="flex items-center justify-center lg:justify-center overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
          <div className="flex items-center space-x-3 lg:flex-wrap lg:justify-center lg:gap-3 lg:space-x-0">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0 lg:hidden" />

            {/* Botón "Todos" */}
            <button
              onClick={() => {
                setSelectedCategory(null)
                onCategoryChange(null)
              }}
              className="flex-shrink-0 group transition-all"
            >
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                selectedCategory === null
                  ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-md border-2 border-violet-700'
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 hover:shadow-md border-2 border-transparent'
              }`}>
                <span className="text-sm font-semibold whitespace-nowrap">
                  Todos
                </span>
              </div>
            </button>

            {categories.map((cat) => {
              if (!cat) return null
              const config = categoryConfig[cat]
              const Icon = config?.icon || BookOpen
              const isSelected = selectedCategory === cat

              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className="flex-shrink-0 group transition-all"
                >
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-violet-600 to-purple-600 shadow-md border-2 border-violet-700'
                      : `bg-gradient-to-br ${config?.gradient || 'from-gray-100 to-gray-200'} hover:shadow-md border-2 border-transparent`
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      isSelected ? 'text-white' : config?.color || 'text-gray-600'
                    }`} />
                    <span className={`text-sm font-semibold whitespace-nowrap ${
                      isSelected ? 'text-white' : 'text-gray-700'
                    }`}>
                      {config?.name || cat}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
