import { useState, useEffect, useCallback } from 'react'
import { HelpContent } from '../data/help-content'

interface SearchResults {
  results: HelpContent[]
  grouped: Record<string, HelpContent[]>
  total: number
  query: string
}

export function useSearch(query: string, debounceMs: number = 300) {
  const [results, setResults] = useState<SearchResults>({
    results: [],
    grouped: {},
    total: 0,
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
        total: 0,
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
          total: 0,
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
