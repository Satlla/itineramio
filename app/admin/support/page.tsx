'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Headphones,
  Ticket,
  Clock,
  CheckCircle2,
  Archive,
  AlertTriangle,
  ArrowRight,
  FileText,
  Megaphone,
  RefreshCw
} from 'lucide-react'

interface TicketStats {
  open: number
  waitingAdmin: number
  resolvedToday: number
  total: number
}

interface RecentTicket {
  id: string
  subject: string
  email: string
  status: string
  priority: string
  lastMessageAt: string | null
  createdAt: string
  messagesCount?: number
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'hace unos segundos'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `hace ${days}d`
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    OPEN: { label: 'Abierto', className: 'bg-blue-100 text-blue-700' },
    WAITING_ADMIN: { label: 'Esperando Admin', className: 'bg-orange-100 text-orange-700' },
    RESOLVED: { label: 'Resuelto', className: 'bg-green-100 text-green-700' },
    CLOSED: { label: 'Cerrado', className: 'bg-gray-100 text-gray-600' },
  }
  const c = config[status] || { label: status, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.className}`}>
      {c.label}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { label: string; className: string }> = {
    LOW: { label: 'Baja', className: 'bg-gray-100 text-gray-600' },
    MEDIUM: { label: 'Media', className: 'bg-blue-100 text-blue-700' },
    HIGH: { label: 'Alta', className: 'bg-orange-100 text-orange-700' },
    URGENT: { label: 'Urgente', className: 'bg-red-100 text-red-700' },
  }
  const c = config[priority] || { label: priority, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.className}`}>
      {c.label}
    </span>
  )
}

export default function SupportDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        fetch('/api/admin/support/tickets/stats', { credentials: 'include' }),
        fetch('/api/admin/support/tickets?limit=10', { credentials: 'include' }),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json()
        setRecentTickets(ticketsData.tickets || [])
      }
    } catch {
      setError('Error al cargar los datos del soporte')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Headphones className="h-8 w-8 text-violet-600" />
            Centro de Soporte
          </h1>
          <p className="text-gray-600 mt-1">Panel de administracion del Help Center</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Quick Nav */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/support/tickets"
          className="bg-white rounded-lg border border-gray-200 p-5 hover:border-violet-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Ticket className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Tickets</p>
                <p className="text-sm text-gray-500">Ver todos los tickets</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 transition-colors" />
          </div>
        </Link>
        <Link
          href="/admin/support/articles"
          className="bg-white rounded-lg border border-gray-200 p-5 hover:border-violet-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Articulos</p>
                <p className="text-sm text-gray-500">Base de conocimiento</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 transition-colors" />
          </div>
        </Link>
        <Link
          href="/admin/support/product-updates"
          className="bg-white rounded-lg border border-gray-200 p-5 hover:border-violet-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Megaphone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Novedades</p>
                <p className="text-sm text-gray-500">Product updates</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Ticket className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
                <p className="text-sm text-gray-500">Tickets Abiertos</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.waitingAdmin}</p>
                <p className="text-sm text-gray-500">Esperando Admin</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.resolvedToday}</p>
                <p className="text-sm text-gray-500">Resueltos Hoy</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Archive className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Tickets</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Tickets */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Tickets Recientes</h2>
          <Link
            href="/admin/support/tickets"
            className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
          >
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentTickets.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <Ticket className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No hay tickets recientes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asunto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiempo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => router.push(`/admin/support/tickets/${ticket.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{ticket.subject}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 truncate max-w-[200px]">{ticket.email || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {timeAgo(ticket.lastMessageAt || ticket.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
