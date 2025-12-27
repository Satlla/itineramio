'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Clock, Eye, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchResult {
  id: string
  slug: string
  title: string
  excerpt: string
  coverImage: string | null
  category: string
  categoryLabel: string
  tags: string[]
  readTime: number
  views: number
  publishedAt: string
  authorName: string
  url: string
}

interface BlogSearchProps {
  className?: string
}

export function BlogSearch({ className = '' }: BlogSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced search
  const searchPosts = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      setHasSearched(false)
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/blog/search?q=${encodeURIComponent(searchQuery)}&limit=5`)
      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPosts(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, searchPosts])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const handleClear = () => {
    setQuery('')
    setResults([])
    setHasSearched(false)
    inputRef.current?.focus()
  }

  const handleResultClick = () => {
    setIsOpen(false)
    setQuery('')
    setResults([])
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar artículos..."
          className="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-500"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {isOpen && (query.length >= 2 || hasSearched) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 text-violet-600 animate-spin mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Buscando...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {results.map((result) => (
                  <Link
                    key={result.id}
                    href={result.url}
                    onClick={handleResultClick}
                    className="block p-4 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      {result.coverImage && (
                        <div className="relative w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={result.coverImage}
                            alt={result.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                            {result.categoryLabel}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 truncate group-hover:text-violet-600 transition-colors">
                          {result.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {result.readTime} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {result.views.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-violet-600 transition-colors self-center" />
                    </div>
                  </Link>
                ))}

                {/* View all results */}
                <Link
                  href={`/blog?q=${encodeURIComponent(query)}`}
                  onClick={handleResultClick}
                  className="block p-4 text-center text-violet-600 hover:bg-violet-50 font-medium text-sm transition-colors"
                >
                  Ver todos los resultados
                </Link>
              </div>
            ) : hasSearched && query.length >= 2 ? (
              <div className="p-8 text-center">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No se encontraron resultados</p>
                <p className="text-gray-500 text-sm mt-1">
                  Prueba con otras palabras clave
                </p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
