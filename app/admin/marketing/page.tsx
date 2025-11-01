'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Megaphone,
  BookOpen,
  FileText,
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Download,
  MessageSquare,
  Mail,
  Share2,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Calendar,
  Target
} from 'lucide-react'

export default function MarketingHub() {
  const [stats, setStats] = useState({
    // Centro de Conocimiento
    knowledgeArticles: 145,
    knowledgeViews: 8234,
    knowledgeQuestions: 1234,

    // Blog
    blogPosts: 23,
    blogViews: 3456,
    blogSubscribers: 567,

    // General
    totalDownloads: 890,
    conversionRate: 12.5,
    engagement: 67
  })

  // Marketing sections/modules
  const marketingSections = [
    {
      id: 'knowledge',
      title: 'Centro de Conocimiento',
      description: 'Guías técnicas y tutoriales para usuarios',
      icon: BookOpen,
      color: 'violet',
      stats: [
        { label: 'Artículos', value: stats.knowledgeArticles, icon: FileText },
        { label: 'Visitas', value: stats.knowledgeViews.toLocaleString(), icon: Eye },
        { label: 'Preguntas', value: stats.knowledgeQuestions.toLocaleString(), icon: MessageSquare }
      ],
      actions: [
        { label: 'Ver artículos', href: '/admin/marketing/knowledge', variant: 'primary' },
        { label: 'Nuevo artículo', href: '/admin/marketing/knowledge/new', variant: 'secondary' }
      ]
    },
    {
      id: 'blog',
      title: 'Blog',
      description: 'Noticias, casos de éxito y contenido de marca',
      icon: FileText,
      color: 'blue',
      stats: [
        { label: 'Posts', value: stats.blogPosts, icon: FileText },
        { label: 'Visitas', value: stats.blogViews.toLocaleString(), icon: Eye },
        { label: 'Suscriptores', value: stats.blogSubscribers, icon: Users }
      ],
      actions: [
        { label: 'Ver posts', href: '/admin/marketing/blog', variant: 'primary' },
        { label: 'Nuevo post', href: '/admin/marketing/blog/new', variant: 'secondary' }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics de Contenido',
      description: 'Métricas y rendimiento de todo el contenido',
      icon: BarChart3,
      color: 'green',
      stats: [
        { label: 'Descargas', value: stats.totalDownloads, icon: Download },
        { label: 'Conversión', value: `${stats.conversionRate}%`, icon: Target },
        { label: 'Engagement', value: `${stats.engagement}%`, icon: TrendingUp }
      ],
      actions: [
        { label: 'Ver analytics', href: '/admin/marketing/analytics', variant: 'primary' }
      ]
    }
  ]

  // Quick actions
  const quickActions = [
    {
      title: 'Generar artículo con IA',
      description: 'Crea contenido automáticamente con OpenAI',
      icon: Sparkles,
      href: '/admin/marketing/knowledge/generate',
      color: 'purple'
    },
    {
      title: 'Programar publicación',
      description: 'Calendario de contenido planificado',
      icon: Calendar,
      href: '/admin/marketing/calendar',
      color: 'orange'
    },
    {
      title: 'Newsletter',
      description: 'Gestionar lista y envíos',
      icon: Mail,
      href: '/admin/marketing/newsletter',
      color: 'pink'
    },
    {
      title: 'Compartir en redes',
      description: 'Distribuir contenido en RRSS',
      icon: Share2,
      href: '/admin/marketing/social',
      color: 'cyan'
    }
  ]

  // Recent activity (mock)
  const recentActivity = [
    { type: 'knowledge', title: 'Check-in Remoto Sin Llaves', action: 'publicado', time: '2 horas', views: 127 },
    { type: 'blog', title: 'Nuevo sistema de pricing', action: 'borrador', time: '5 horas', views: 0 },
    { type: 'knowledge', title: 'VUT Madrid 2025', action: 'actualizado', time: '1 día', views: 342 },
    { type: 'blog', title: 'Caso de éxito: 50 propiedades', action: 'publicado', time: '2 días', views: 89 }
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string, text: string, border: string, hover: string }> = {
      violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', hover: 'hover:border-violet-400' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', hover: 'hover:border-blue-400' },
      green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', hover: 'hover:border-green-400' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', hover: 'hover:border-purple-400' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', hover: 'hover:border-orange-400' },
      pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', hover: 'hover:border-pink-400' },
      cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', hover: 'hover:border-cyan-400' }
    }
    return colors[color] || colors.violet
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Megaphone className="w-8 h-8 mr-3 text-violet-600" />
                Marketing Hub
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona todo tu contenido, blog y analytics en un solo lugar
              </p>
            </div>
            <Link
              href="/admin"
              className="text-gray-600 hover:text-gray-900 flex items-center"
            >
              Volver al Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Contenido</span>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.knowledgeArticles + stats.blogPosts}</p>
            <p className="text-sm text-green-600 mt-1">+12 este mes</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Visitas Totales</span>
              <Eye className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{(stats.knowledgeViews + stats.blogViews).toLocaleString()}</p>
            <p className="text-sm text-green-600 mt-1">+23% vs mes anterior</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Tasa de Conversión</span>
              <Target className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</p>
            <p className="text-sm text-green-600 mt-1">+2.3% este mes</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Engagement</span>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.engagement}%</p>
            <p className="text-sm text-green-600 mt-1">+5% este mes</p>
          </div>
        </div>

        {/* Marketing Sections */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Secciones de Marketing</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {marketingSections.map((section) => {
              const Icon = section.icon
              const colors = getColorClasses(section.color)

              return (
                <div
                  key={section.id}
                  className={`bg-white rounded-xl shadow-sm border-2 ${colors.border} ${colors.hover} transition-all duration-200`}
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`p-3 ${colors.bg} rounded-lg`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                        <p className="text-sm text-gray-600">{section.description}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3 mb-6">
                      {section.stats.map((stat, index) => {
                        const StatIcon = stat.icon
                        return (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-600">
                              <StatIcon className="w-4 h-4 mr-2" />
                              {stat.label}
                            </div>
                            <span className="font-semibold text-gray-900">{stat.value}</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      {section.actions.map((action, index) => (
                        <Link
                          key={index}
                          href={action.href}
                          className={`block w-full text-center px-4 py-2 rounded-lg font-medium transition-colors ${
                            action.variant === 'primary'
                              ? `${colors.bg} ${colors.text} hover:opacity-80`
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {action.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              const colors = getColorClasses(action.color)

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className={`bg-white rounded-lg shadow-sm border-2 ${colors.border} ${colors.hover} p-4 transition-all duration-200 hover:shadow-md`}
                >
                  <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="divide-y divide-gray-200">
              {recentActivity.map((item, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.type === 'knowledge'
                          ? 'bg-violet-100 text-violet-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.type === 'knowledge' ? 'Knowledge' : 'Blog'}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-600">
                          {item.action} hace {item.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Eye className="w-4 h-4 mr-1" />
                      {item.views} vistas
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
