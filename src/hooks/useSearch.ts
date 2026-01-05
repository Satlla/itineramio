import { useState, useEffect } from 'react'

// Resultado unificado de búsqueda (blog + ayuda + onboarding)
export interface UnifiedSearchResult {
  id: string
  type: 'faq' | 'guide' | 'resource' | 'tutorial' | 'blog' | 'onboarding'
  source: 'help' | 'blog' | 'onboarding'
  sourceLabel: string
  title: string
  description: string
  content?: string
  tags: string[]
  url: string
  category: string
  score?: number
  readTime?: number
  publishedAt?: Date
}

interface SearchResults {
  results: UnifiedSearchResult[]
  grouped: Record<string, UnifiedSearchResult[]>
  groupedBySource: Record<string, UnifiedSearchResult[]>
  total: number
  totalHelp: number
  totalOnboarding: number
  totalBlog: number
  query: string
}

export function useSearch(query: string, debounceMs: number = 300) {
  const [results, setResults] = useState<SearchResults>({
    results: [],
    grouped: {},
    groupedBySource: {},
    total: 0,
    totalHelp: 0,
    totalOnboarding: 0,
    totalBlog: 0,
    query: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Si no hay query o es muy corto, limpiar resultados
    if (!query || query.trim().length < 2) {
      setResults({
        results: [],
        grouped: {},
        groupedBySource: {},
        total: 0,
        totalHelp: 0,
        totalOnboarding: 0,
        totalBlog: 0,
        query: ''
      })
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // Debounce
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search/help?q=${encodeURIComponent(query.trim())}`)

        if (!response.ok) {
          throw new Error('Error en la búsqueda')
        }

        const data = await response.json()
        setResults(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        setResults({
          results: [],
          grouped: {},
          groupedBySource: {},
          total: 0,
          totalHelp: 0,
          totalOnboarding: 0,
          totalBlog: 0,
          query
        })
      } finally {
        setLoading(false)
      }
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [query, debounceMs])

  return { results, loading, error }
}
