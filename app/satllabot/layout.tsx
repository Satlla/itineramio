'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Home, Calendar, BarChart2, Building2, LogOut, MessageCircle, X, Send, Loader2, Users, Receipt } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/satllabot', label: 'Hoy', icon: Home },
  { href: '/satllabot/calendario', label: 'Calendario', icon: Calendar },
  { href: '/satllabot/kpis', label: 'KPIs', icon: BarChart2 },
  { href: '/satllabot/apartamentos', label: 'Aptos', icon: Building2 },
  { href: '/satllabot/empleadas', label: 'Empleadas', icon: Users },
  { href: '/satllabot/gastos', label: 'Gastos', icon: Receipt },
]

// Mobile bottom nav shows only the first 4 items
const MOBILE_NAV_ITEMS = NAV_ITEMS.slice(0, 4)

interface Message {
  role: 'user' | 'assistant'
  text: string
}

function AIChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  const send = async () => {
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setLoading(true)
    try {
      const res = await fetch('/api/satllabot/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ question: q }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', text: data.answer || 'Sin respuesta' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error al contactar con la IA.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-20 right-4 z-50 bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors"
        title="Asistente IA"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {/* Slide-up panel */}
      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-80 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '60vh' }}>
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Asistente IA</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
            {messages.length === 0 && (
              <p className="text-gray-500 text-xs text-center mt-4">Pregunta sobre tus reservas, KPIs o gestión de apartamentos.</p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-xl px-3 py-2 text-sm max-w-[90%] ${
                  m.role === 'user'
                    ? 'bg-blue-700 text-white ml-auto'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="bg-gray-800 rounded-xl px-3 py-2 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                <span className="text-gray-400 text-xs">Pensando...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-2 border-t border-gray-800 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Escribe tu pregunta..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg p-2 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default function SatllaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/satllabot/login') return <>{children}</>

  const handleLogout = async () => {
    await fetch('/api/satllabot/auth/logout', { method: 'POST' })
    router.push('/satllabot/login')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Desktop sidebar (lg+) */}
      <aside className="hidden lg:flex flex-col w-60 bg-gray-900 border-r border-gray-800 fixed inset-y-0 left-0 z-20">
        <div className="p-4 flex items-center gap-2 border-b border-gray-800">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-white">S</span>
          </div>
          <span className="font-semibold text-white">SatllaBot</span>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/satllabot' && pathname.startsWith(href))
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </button>
            )
          })}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile top bar (< lg) */}
      <header className="lg:hidden bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-white">S</span>
          </div>
          <span className="font-semibold text-white">SatllaBot</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white transition-colors p-1"
          title="Cerrar sesión"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto lg:ml-60 pt-14 lg:pt-0 pb-20 lg:pb-0">
        {children}
      </main>

      {/* AI Chat Widget */}
      <AIChatWidget />

      {/* Mobile bottom navigation (< lg) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex safe-area-pb z-10">
        {MOBILE_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/satllabot' && pathname.startsWith(href))
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                isActive ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
