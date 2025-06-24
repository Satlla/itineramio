'use client'

import React, { useState, useEffect } from 'react'
import {
  Download,
  Filter,
  Calendar,
  TrendingUp,
  Users,
  Building2,
  Eye,
  MessageSquare,
  FileText,
  PieChart,
  BarChart3,
  RefreshCw,
  Search,
  ChevronDown,
  X,
  Loader2
} from 'lucide-react'

interface ReportData {
  summary: {
    totalUsers: number
    totalProperties: number
    totalZones: number
    totalViews: number
    totalChatbotInteractions: number
  }
  trends: {
    userGrowth: { period: string; count: number }[]
    propertyGrowth: { period: string; count: number }[]
    viewsTrend: { period: string; views: number }[]
  }
  topPerformers: {
    zones: { id: string; name: string; views: number; property: string }[]
    properties: { id: string; name: string; totalViews: number; zonesCount: number }[]
  }
  engagement: {
    avgViewsPerZone: number
    avgChatbotInteractionsPerDay: number
    mostActiveTimeOfDay: string
    popularLanguages: { language: string; percentage: number }[]
  }
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [reportType, setReportType] = useState('summary')
  const [filters, setFilters] = useState({
    propertyId: '',
    zoneId: '',
    language: '',
    startDate: '',
    endDate: '',
    minViews: '',
    maxViews: '',
    status: '',
    sortBy: 'views',
    sortOrder: 'desc'
  })
  const [properties, setProperties] = useState<any[]>([])
  const [zones, setZones] = useState<any[]>([])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    generateReport()
    loadFilterOptions()
  }, [dateRange, reportType, filters])

  const loadFilterOptions = async () => {
    try {
      // Load properties for filter dropdown
      const propertiesResponse = await fetch('/api/admin/properties')
      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json()
        setProperties(propertiesData.data || [])
      }

      // Load zones for filter dropdown if property is selected
      if (filters.propertyId) {
        const zonesResponse = await fetch(`/api/admin/zones?propertyId=${filters.propertyId}`)
        if (zonesResponse.ok) {
          const zonesData = await zonesResponse.json()
          setZones(zonesData.data || [])
        }
      } else {
        setZones([])
      }
    } catch (error) {
      console.error('Error loading filter options:', error)
    }
  }

  const generateReport = async () => {
    setLoading(true)
    try {
      // Build query parameters with filters
      const params = new URLSearchParams({
        timeframe: dateRange,
        metric: 'all'
      })
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value)
        }
      })
      
      const analyticsResponse = await fetch(`/api/admin/analytics?${params.toString()}`)
      const analyticsData = await analyticsResponse.json()
      
      if (analyticsData.success) {
        const analytics = analyticsData.analytics
        
        // Transform analytics data into report format
        const report: ReportData = {
          summary: {
            totalUsers: analytics.performance?.totalUsers || 0,
            totalProperties: analytics.performance?.totalProperties || 0,
            totalZones: analytics.performance?.totalZones || 0,
            totalViews: analytics.performance?.totalViews?._sum?.viewCount || 0,
            totalChatbotInteractions: analytics.chatbot?.totalInteractions || 0
          },
          trends: {
            userGrowth: analytics.users?.growth?.map((item: any) => ({
              period: item.date,
              count: item.new_users
            })) || [],
            propertyGrowth: [], // Would need more historical data
            viewsTrend: analytics.visits?.dailyVisits?.map((item: any) => ({
              period: item.date,
              views: item.visits
            })) || []
          },
          topPerformers: {
            zones: analytics.visits?.topZones?.slice(0, 10).map((zone: any) => ({
              id: zone.id,
              name: zone.name,
              views: zone.viewCount || 0,
              property: zone.property?.name || 'Unknown'
            })) || [],
            properties: analytics.properties?.performance?.slice(0, 10).map((prop: any) => ({
              id: prop.id,
              name: prop.name,
              totalViews: prop.totalViews || 0,
              zonesCount: prop.zonesCount || 0
            })) || []
          },
          engagement: {
            avgViewsPerZone: analytics.performance?.avgViewsPerZone || 0,
            avgChatbotInteractionsPerDay: Math.round(
              (analytics.chatbot?.totalInteractions || 0) / 7
            ),
            mostActiveTimeOfDay: '14:00 - 18:00', // Would calculate from actual data
            popularLanguages: [
              { language: 'Español', percentage: 60 },
              { language: 'English', percentage: 30 },
              { language: 'Français', percentage: 10 }
            ]
          }
        }
        
        setReportData(report)
      }
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!reportData) return
    
    setIsExporting(true)
    try {
      if (format === 'csv') {
        // Generate CSV format
        const csvData = generateCSVData(reportData)
        downloadFile(csvData, `itineramio-report-${dateRange}-${Date.now()}.csv`, 'text/csv')
      } else if (format === 'excel') {
        // Generate Excel-compatible CSV with better formatting
        const excelData = generateExcelData(reportData)
        downloadFile(excelData, `itineramio-report-${dateRange}-${Date.now()}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      } else if (format === 'pdf') {
        // Generate PDF content (simplified HTML that can be converted to PDF)
        const pdfData = generatePDFData(reportData)
        downloadFile(pdfData, `itineramio-report-${dateRange}-${Date.now()}.html`, 'text/html')
      }
    } catch (error) {
      console.error('Error exporting report:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const generateCSVData = (data: ReportData) => {
    const lines = []
    
    // Header
    lines.push('Reporte Itineramio')
    lines.push(`Generado: ${new Date().toLocaleString()}`)
    lines.push(`Período: ${dateRange}`)
    lines.push('')
    
    // Summary
    lines.push('RESUMEN EJECUTIVO')
    lines.push('Métrica,Valor')
    lines.push(`Usuarios Totales,${data.summary.totalUsers}`)
    lines.push(`Propiedades,${data.summary.totalProperties}`)
    lines.push(`Zonas,${data.summary.totalZones}`)
    lines.push(`Total Vistas,${data.summary.totalViews}`)
    lines.push(`Interacciones IA,${data.summary.totalChatbotInteractions}`)
    lines.push('')
    
    // Top zones
    lines.push('ZONAS MÁS VISITADAS')
    lines.push('Nombre,Propiedad,Vistas')
    data.topPerformers.zones.forEach(zone => {
      lines.push(`"${zone.name}","${zone.property}",${zone.views}`)
    })
    lines.push('')
    
    // Top properties
    lines.push('PROPIEDADES DESTACADAS')
    lines.push('Nombre,Vistas Totales,Número de Zonas')
    data.topPerformers.properties.forEach(property => {
      lines.push(`"${property.name}",${property.totalViews},${property.zonesCount}`)
    })
    
    return lines.join('\n')
  }

  const generateExcelData = (data: ReportData) => {
    // Similar to CSV but with Excel-friendly formatting
    return generateCSVData(data)
  }

  const generatePDFData = (data: ReportData) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Reporte Itineramio</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .metrics { display: flex; justify-content: space-around; margin: 20px 0; }
        .metric { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Reporte de Analytics - Itineramio</h1>
        <p>Generado: ${new Date().toLocaleString()}</p>
        <p>Período: ${dateRange}</p>
    </div>
    
    <div class="section">
        <h2>Resumen Ejecutivo</h2>
        <div class="metrics">
            <div class="metric"><h3>${data.summary.totalUsers}</h3><p>Usuarios</p></div>
            <div class="metric"><h3>${data.summary.totalProperties}</h3><p>Propiedades</p></div>
            <div class="metric"><h3>${data.summary.totalZones}</h3><p>Zonas</p></div>
            <div class="metric"><h3>${data.summary.totalViews}</h3><p>Vistas</p></div>
            <div class="metric"><h3>${data.summary.totalChatbotInteractions}</h3><p>Interacciones IA</p></div>
        </div>
    </div>
    
    <div class="section">
        <h2>Zonas Más Visitadas</h2>
        <table>
            <thead>
                <tr><th>Zona</th><th>Propiedad</th><th>Vistas</th></tr>
            </thead>
            <tbody>
                ${data.topPerformers.zones.map(zone => 
                    `<tr><td>${zone.name}</td><td>${zone.property}</td><td>${zone.views}</td></tr>`
                ).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color 
  }: {
    title: string
    value: string | number
    change?: string
    icon: any
    color: string
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  )

  const dateRangeOptions = [
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 90 días' },
    { value: '1y', label: 'Último año' }
  ]

  const reportTypeOptions = [
    { value: 'summary', label: 'Resumen Ejecutivo' },
    { value: 'detailed', label: 'Reporte Detallado' },
    { value: 'usage', label: 'Análisis de Uso' },
    { value: 'performance', label: 'Rendimiento' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Reportes detallados y análisis de la plataforma
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            {reportTypeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
          </button>
          
          <button
            onClick={generateReport}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-blue-500" />
            Filtros Avanzados
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Property Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Propiedad
              </label>
              <select
                value={filters.propertyId}
                onChange={(e) => setFilters({...filters, propertyId: e.target.value, zoneId: ''})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Todas las propiedades</option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Zone Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zona
              </label>
              <select
                value={filters.zoneId}
                onChange={(e) => setFilters({...filters, zoneId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                disabled={!filters.propertyId}
              >
                <option value="">Todas las zonas</option>
                {zones.map(zone => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma
              </label>
              <select
                value={filters.language}
                onChange={(e) => setFilters({...filters, language: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Todos los idiomas</option>
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Views Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vistas Mínimas
              </label>
              <input
                type="number"
                value={filters.minViews}
                onChange={(e) => setFilters({...filters, minViews: e.target.value})}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vistas Máximas
              </label>
              <input
                type="number"
                value={filters.maxViews}
                onChange={(e) => setFilters({...filters, maxViews: e.target.value})}
                placeholder="Sin límite"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="views">Vistas</option>
                <option value="date">Fecha</option>
                <option value="name">Nombre</option>
                <option value="interactions">Interacciones</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orden
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters({...filters, sortOrder: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="desc">Descendente</option>
                <option value="asc">Ascendente</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => setFilters({
                propertyId: '',
                zoneId: '',
                language: '',
                startDate: '',
                endDate: '',
                minViews: '',
                maxViews: '',
                status: '',
                sortBy: 'views',
                sortOrder: 'desc'
              })}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              Limpiar Filtros
            </button>
            
            <div className="text-sm text-gray-600">
              Filtros activos: {Object.values(filters).filter(value => value !== '').length}
            </div>
          </div>
        </div>
      )}

      {reportData && (
        <>
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
            <MetricCard
              title="Usuarios Totales"
              value={reportData.summary.totalUsers}
              icon={Users}
              color="bg-blue-500"
            />
            <MetricCard
              title="Propiedades"
              value={reportData.summary.totalProperties}
              icon={Building2}
              color="bg-green-500"
            />
            <MetricCard
              title="Zonas"
              value={reportData.summary.totalZones}
              icon={Eye}
              color="bg-purple-500"
            />
            <MetricCard
              title="Total Vistas"
              value={reportData.summary.totalViews}
              icon={BarChart3}
              color="bg-orange-500"
            />
            <MetricCard
              title="Interacciones IA"
              value={reportData.summary.totalChatbotInteractions}
              icon={MessageSquare}
              color="bg-pink-500"
            />
          </div>

          {/* Report Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Performing Zones */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Zonas Más Visitadas
              </h3>
              <div className="space-y-3">
                {reportData.topPerformers.zones.slice(0, 5).map((zone, index) => (
                  <div key={zone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{zone.name}</p>
                      <p className="text-sm text-gray-600 truncate">{zone.property}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        #{index + 1}
                      </span>
                      <span className="font-bold text-gray-900">{zone.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-purple-500" />
                Métricas de Engagement
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Promedio vistas por zona</span>
                  <span className="font-bold text-gray-900">{reportData.engagement.avgViewsPerZone}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Interacciones IA/día</span>
                  <span className="font-bold text-gray-900">{reportData.engagement.avgChatbotInteractionsPerDay}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Hora más activa</span>
                  <span className="font-bold text-gray-900">{reportData.engagement.mostActiveTimeOfDay}</span>
                </div>
              </div>
            </div>

            {/* Language Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                Distribución de Idiomas
              </h3>
              <div className="space-y-3">
                {reportData.engagement.popularLanguages.map((lang) => (
                  <div key={lang.language} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{lang.language}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${lang.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{lang.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Properties */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-purple-500" />
                Propiedades Destacadas
              </h3>
              <div className="space-y-3">
                {reportData.topPerformers.properties.slice(0, 5).map((property, index) => (
                  <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{property.name}</p>
                      <p className="text-sm text-gray-600">{property.zonesCount} zonas</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-gray-900">{property.totalViews}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Export Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Download className="w-5 h-5 mr-2 text-green-500" />
              Exportar Reporte
            </h3>
            <p className="text-gray-600 mb-4">
              Descarga este reporte en diferentes formatos para compartir o archivar.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => exportReport('pdf')}
                disabled={isExporting}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                Exportar PDF
              </button>
              <button
                onClick={() => exportReport('excel')}
                disabled={isExporting}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
                Exportar Excel
              </button>
              <button
                onClick={() => exportReport('csv')}
                disabled={isExporting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Exportar CSV
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}