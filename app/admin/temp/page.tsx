'use client'

import React, { useState, useEffect } from 'react'

export default function TempAdminPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard-stats')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Cargando dashboard admin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔧 Dashboard Admin Temporal
        </h1>
        
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold">Usuarios Totales</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
              <p className="text-sm text-gray-600">{stats.activeUsers} activos</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold">Propiedades</h3>
              <p className="text-3xl font-bold text-green-600">{stats.totalProperties}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold">Revenue</h3>
              <p className="text-3xl font-bold text-purple-600">€{stats.monthlyRevenue}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold">Facturas Pendientes</h3>
              <p className="text-3xl font-bold text-red-600">{stats.pendingInvoices}</p>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">❌ Error cargando estadísticas</p>
          </div>
        )}
        
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">✅ Sistema Admin Básico Funcionando</h3>
          <ul className="space-y-2">
            <li>✅ Base de datos actualizada</li>
            <li>✅ Usuario admin creado</li>
            <li>✅ Planes de suscripción configurados</li>
            <li>✅ APIs básicas funcionando</li>
          </ul>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900">Próximos pasos:</h4>
            <ol className="list-decimal list-inside text-blue-800 mt-2">
              <li>Gestión de usuarios completa</li>
              <li>Búsqueda de propiedades</li>
              <li>Sistema de facturación</li>
              <li>Asignación de planes</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}