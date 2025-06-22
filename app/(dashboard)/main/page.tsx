'use client'

import React from 'react'
import { DashboardNavbar } from '../../../src/components/layout/DashboardNavbar'
import { DashboardFooter } from '../../../src/components/layout/DashboardFooter'
import { useAuth } from '../../../src/providers/AuthProvider'

export default function DashboardPage() {
  const { user } = useAuth()
  
  return React.createElement(
    'div',
    { className: 'min-h-screen flex flex-col bg-gray-50' },
    React.createElement(DashboardNavbar, { user: user || undefined }),
    React.createElement(
      'main',
      { className: 'flex-1 pt-16' },
      React.createElement(
        'div',
        { className: 'max-w-7xl mx-auto px-4 py-8' },
        React.createElement(
          'h1',
          { className: 'text-3xl font-bold text-gray-900 mb-4' },
          'Dashboard Funcionando ✅'
        ),
        React.createElement(
          'p',
          { className: 'text-gray-600' },
          'El panel principal está operativo'
        )
      )
    ),
    React.createElement(DashboardFooter)
  )
}