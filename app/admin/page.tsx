'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  Building2,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react'
import ExpiringSubscriptionsWidget from './components/ExpiringSubscriptionsWidget'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalProperties: number
  pendingInvoices: number
  monthlyRevenue: number
  recentActivity: Array<{
    id: string
    action: string
    description: string
    createdAt: string
    targetType?: string
    targetId?: string
  }>
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  change 
}: { 
  title: string
  value: string | number
  icon: any
  color: string
  change?: string
}) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
    <div className="flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{value}</p>
        {change && (
          <p className="text-sm text-green-600 mt-1">{change}</p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
)

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats', {
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  // Get link for activity based on type
  const getActivityLink = (activity: DashboardStats['recentActivity'][0]) => {
    if (activity.targetType === 'subscription_request') {
      return '/admin/subscription-requests'
    } else if (activity.targetType === 'user') {
      return `/admin/users`
    } else if (activity.targetType === 'property') {
      return `/admin/properties`
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
        <button 
          onClick={fetchStats}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Resumen general de la plataforma Itineramio
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Usuarios Totales"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-500"
          change={`${stats.activeUsers} activos`}
        />
        
        <StatCard
          title="Propiedades"
          value={stats.totalProperties}
          icon={Building2}
          color="bg-green-500"
        />
        
        <StatCard
          title="Revenue Mensual"
          value={`€${stats.monthlyRevenue}`}
          icon={DollarSign}
          color="bg-purple-500"
          change="+12% vs mes anterior"
        />
        
        <StatCard
          title="Facturas Pendientes"
          value={stats.pendingInvoices}
          icon={CreditCard}
          color="bg-red-500"
        />
      </div>

      {/* Expiring Subscriptions Widget */}
      <div className="mb-6 sm:mb-8">
        <ExpiringSubscriptionsWidget />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            Actividad Reciente
          </h3>
          
          <div className="space-y-4">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => {
                const activityLink = getActivityLink(activity)

                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.createdAt).toLocaleString('es-ES')}
                      </p>
                    </div>
                    {activityLink && (
                      <Link
                        href={activityLink}
                        className="text-sm font-bold text-red-600 hover:text-red-700 underline decoration-2 underline-offset-4 whitespace-nowrap flex-shrink-0"
                      >
                        Ver más
                      </Link>
                    )}
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay actividad reciente
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            Acciones Rápidas
          </h3>
          
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2 sm:mr-3 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Crear Usuario</p>
                  <p className="text-xs sm:text-sm text-gray-600">Añadir nuevo usuario al sistema</p>
                </div>
              </div>
            </button>
            
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Generar Factura</p>
                  <p className="text-xs sm:text-sm text-gray-600">Crear factura manual</p>
                </div>
              </div>
            </button>
            
            <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 mr-2 sm:mr-3 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Buscar Propiedad</p>
                  <p className="text-xs sm:text-sm text-gray-600">Acceso rápido por ID</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}