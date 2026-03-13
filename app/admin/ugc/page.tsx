'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ArrowUpCircle,
  MessageSquare,
  Eye,
  ThumbsUp,
  Calendar,
  RefreshCw,
  Trash2,
  Filter,
} from 'lucide-react'

interface SearchResult {
  platform: 'reddit' | 'youtube'
  id: string
  author: string
  title: string
  content: string
  url: string
  subreddit?: string
  score: number
  comments: number
  createdAt: string
}

interface UgcLead {
  id: string
  platform: string
  postId: string
  author: string
  title: string | null
  content: string | null
  url: string
  subreddit: string | null
  score: number | null
  comments: number | null
  savedAt: string
  notes: string | null
  status: string
}

const SUGGESTED_KEYWORDS = [
  'gestionar apartamentos',
  'guía huéspedes airbnb',
  'airbnb agotador',
  'alquiler vacacional',
  'host airbnb problemas',
  'property management exhausting',
  'vacation rental tips',
  'airbnb host burnout',
]

const SUGGESTED_SUBREDDITS = [
  'airbnb',
  'airbnb_hosts',
  'vrbo',
  'spain',
  'alicante',
  'realestateinvesting',
]

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'Nuevo', color: 'bg-blue-100 text-blue-700' },
  contacted: { label: 'Contactado', color: 'bg-yellow-100 text-yellow-700' },
  converted: { label: 'Convertido', color: 'bg-green-100 text-green-700' },
  discarded: { label: 'Descartado', color: 'bg-gray-100 text-gray-500' },
}

export default function UgcFinderPage() {
  const [tab, setTab] = useState<'search' | 'saved'>('search')
  const [query, setQuery] = useState('')
  const [platform, setPlatform] = useState<'all' | 'reddit' | 'youtube'>('all')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())
  const [leads, setLeads] = useState<UgcLead[]>([])
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({})

  useEffect(() => {
    if (tab === 'saved') {
      loadLeads()
    }
  }, [tab])

  const loadLeads = async () => {
    setLeadsLoading(true)
    try {
      const res = await fetch('/api/admin/ugc/saved', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setLeads(data.leads)
        setSavedIds(new Set(data.leads.map((l: UgcLead) => l.postId)))
      }
    } finally {
      setLeadsLoading(false)
    }
  }

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setResults([])
    setErrors([])

    try {
      const params = new URLSearchParams({ q: query, platform, limit: '20' })
      const res = await fetch(`/api/admin/ugc/search?${params}`, { credentials: 'include' })
      const data = await res.json()

      if (!res.ok) {
        setErrors([data.error || 'Error en la búsqueda'])
        return
      }

      setResults(data.results || [])
      if (data.errors?.length) setErrors(data.errors)

      // Refresh saved IDs
      const savedRes = await fetch('/api/admin/ugc/saved', { credentials: 'include' })
      if (savedRes.ok) {
        const savedData = await savedRes.json()
        setSavedIds(new Set(savedData.leads.map((l: UgcLead) => l.postId)))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (result: SearchResult) => {
    if (savedIds.has(result.id)) return
    setSavingIds(prev => new Set(prev).add(result.id))

    try {
      const res = await fetch('/api/admin/ugc/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          postId: result.id,
          platform: result.platform,
          author: result.author,
          title: result.title,
          content: result.content,
          url: result.url,
          subreddit: result.subreddit,
          score: result.score,
          comments: result.comments,
        }),
      })

      if (res.ok) {
        setSavedIds(prev => new Set(prev).add(result.id))
      }
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev)
        next.delete(result.id)
        return next
      })
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/ugc/saved?id=${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    setLeads(prev => prev.filter(l => l.id !== id))
  }

  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/ugc/saved/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
    }
  }

  const handleNotesSave = async (id: string) => {
    const notes = editingNotes[id] ?? ''
    const res = await fetch(`/api/admin/ugc/saved/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ notes }),
    })
    if (res.ok) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, notes } : l))
      setEditingNotes(prev => { const n = { ...prev }; delete n[id]; return n })
    }
  }

  const filteredLeads = statusFilter === 'all'
    ? leads
    : leads.filter(l => l.status === statusFilter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-violet-100 rounded-lg">
            <Search className="h-5 w-5 text-violet-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">UGC Finder</h1>
        </div>
        <p className="text-gray-500 text-sm ml-12">
          Encuentra hosts con pain points activos en Reddit y YouTube
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          {(['search', 'saved'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'search' ? 'Buscar' : `Guardados ${leads.length > 0 ? `(${leads.length})` : ''}`}
            </button>
          ))}
        </div>
      </div>

      {/* Search Tab */}
      {tab === 'search' && (
        <div className="space-y-5">
          {/* Search form */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar posts y vídeos..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <select
              value={platform}
              onChange={e => setPlatform(e.target.value as 'all' | 'reddit' | 'youtube')}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">Todas las plataformas</option>
              <option value="reddit">Reddit</option>
              <option value="youtube">YouTube</option>
            </select>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Buscar
            </button>
          </form>

          {/* Suggested keywords */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Keywords sugeridas</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_KEYWORDS.map(kw => (
                <button
                  key={kw}
                  onClick={() => setQuery(kw)}
                  className="px-3 py-1 bg-violet-50 text-violet-700 border border-violet-200 rounded-full text-xs hover:bg-violet-100 transition-colors"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          {/* Suggested subreddits */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Subreddits sugeridos</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SUBREDDITS.map(sr => (
                <button
                  key={sr}
                  onClick={() => { setQuery(`subreddit:${sr} airbnb host`); setPlatform('reddit') }}
                  className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-xs hover:bg-orange-100 transition-colors"
                >
                  r/{sr}
                </button>
              ))}
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              {errors.map((e, i) => (
                <p key={i} className="text-sm text-red-600">{e}</p>
              ))}
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-3">{results.length} resultados</p>
              <div className="space-y-3">
                {results.map(result => (
                  <div key={`${result.platform}:${result.id}`} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-violet-200 hover:shadow-sm transition-all">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                        result.platform === 'reddit' ? 'bg-orange-500' : 'bg-red-600'
                      }`}>
                        {result.author.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Author + platform */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{result.author}</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                            result.platform === 'reddit'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {result.platform === 'reddit' ? `Reddit · r/${result.subreddit}` : 'YouTube'}
                          </span>
                        </div>

                        {/* Title */}
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">{result.title}</p>

                        {/* Content snippet */}
                        {result.content && (
                          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{result.content}</p>
                        )}

                        {/* Metrics */}
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          {result.platform === 'reddit' ? (
                            <span className="flex items-center gap-1">
                              <ArrowUpCircle className="h-3.5 w-3.5" />
                              {result.score.toLocaleString()}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3.5 w-3.5" />
                              {result.score.toLocaleString()}
                            </span>
                          )}
                          {result.platform === 'reddit' && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3.5 w-3.5" />
                              {result.comments}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(result.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Ver original"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleSave(result)}
                          disabled={savedIds.has(result.id) || savingIds.has(result.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            savedIds.has(result.id)
                              ? 'bg-green-100 text-green-700 cursor-default'
                              : savingIds.has(result.id)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-violet-600 text-white hover:bg-violet-700'
                          }`}
                          title={savedIds.has(result.id) ? 'Ya guardado' : 'Guardar lead'}
                        >
                          {savedIds.has(result.id) ? (
                            <><BookmarkCheck className="h-3.5 w-3.5" /> Guardado</>
                          ) : savingIds.has(result.id) ? (
                            <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Guardando</>
                          ) : (
                            <><Bookmark className="h-3.5 w-3.5" /> Guardar</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && results.length === 0 && query && errors.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No se encontraron resultados para &ldquo;{query}&rdquo;</p>
            </div>
          )}

          {!query && results.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Escribe una keyword o selecciona una sugerida para buscar</p>
            </div>
          )}
        </div>
      )}

      {/* Saved Tab */}
      {tab === 'saved' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-gray-400" />
            <div className="flex gap-2">
              {(['all', 'new', 'contacted', 'converted', 'discarded'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s === 'all' ? 'Todos' : STATUS_LABELS[s]?.label}
                  {s === 'all' && ` (${leads.length})`}
                  {s !== 'all' && ` (${leads.filter(l => l.status === s).length})`}
                </button>
              ))}
            </div>
            <button
              onClick={loadLeads}
              className="ml-auto p-1.5 text-gray-400 hover:text-gray-600"
              title="Recargar"
            >
              <RefreshCw className={`h-4 w-4 ${leadsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Table */}
          {leadsLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 text-gray-300 animate-spin mx-auto" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <BookmarkCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                {leads.length === 0
                  ? 'Aún no has guardado ningún lead'
                  : 'No hay leads con este filtro'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLeads.map(lead => (
                <div key={lead.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                      lead.platform === 'reddit' ? 'bg-orange-500' : 'bg-red-600'
                    }`}>
                      {lead.author.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium text-gray-900">{lead.author}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                          lead.platform === 'reddit'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {lead.platform === 'reddit'
                            ? `Reddit${lead.subreddit ? ` · r/${lead.subreddit}` : ''}`
                            : 'YouTube'}
                        </span>

                        {/* Status selector */}
                        <select
                          value={lead.status}
                          onChange={e => handleStatusChange(lead.id, e.target.value)}
                          className={`px-2 py-0.5 rounded text-xs font-semibold border-0 cursor-pointer ${STATUS_LABELS[lead.status]?.color || 'bg-gray-100 text-gray-600'}`}
                        >
                          {Object.entries(STATUS_LABELS).map(([value, { label }]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>

                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(lead.savedAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>

                      {lead.title && (
                        <p className="text-sm font-semibold text-gray-800 line-clamp-1 mb-1">{lead.title}</p>
                      )}

                      {/* Notes */}
                      {editingNotes[lead.id] !== undefined ? (
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            value={editingNotes[lead.id]}
                            onChange={e => setEditingNotes(prev => ({ ...prev, [lead.id]: e.target.value }))}
                            placeholder="Notas..."
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-500"
                            onKeyDown={e => e.key === 'Enter' && handleNotesSave(lead.id)}
                            autoFocus
                          />
                          <button
                            onClick={() => handleNotesSave(lead.id)}
                            className="px-2 py-1 text-xs bg-violet-600 text-white rounded hover:bg-violet-700"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingNotes(prev => { const n = { ...prev }; delete n[lead.id]; return n })}
                            className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingNotes(prev => ({ ...prev, [lead.id]: lead.notes || '' }))}
                          className="text-xs text-gray-400 hover:text-violet-600 mt-1 text-left"
                        >
                          {lead.notes ? `📝 ${lead.notes}` : '+ Añadir notas'}
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <a
                        href={lead.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
