'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Home, 
  Eye, 
  Calendar,
  TrendingUp,
  Users,
  PlayCircle,
  MapPin,
  Star,
  ArrowRight,
  MoreHorizontal,
  Edit,
  Share2,
  Trash2,
  Copy,
  ExternalLink,
  AlertTriangle,
  X,
  Building2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Avatar } from '../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardNavbar } from '../../../src/components/layout/DashboardNavbar'
import { DashboardFooter } from '../../../src/components/layout/DashboardFooter'
import { useAuth } from '../../../src/providers/AuthProvider'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { getZonesSlugUrl } from '../../../src/components/navigation/slug-link'

interface Property {
  id: string
  name: string
  slug?: string | null
  description?: string
  type: string
  city: string
  state: string
  bedrooms: number
  bathrooms: number
  maxGuests: number
  zonesCount: number
  totalViews?: number
  avgRating?: number
  status: string
  profileImage?: string
  propertySetId?: string | null
  createdAt: string
  updatedAt: string
}

export default function DashboardPage(): React.ReactElement {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [properties, setProperties] = useState<Property[]>([])
  const [propertySets, setPropertySets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showGuestReportsModal, setShowGuestReportsModal] = useState(false)
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0,
    activeManuals: 0,
    avgRating: 0
  })
  const router = useRouter()
  const { user } = useAuth()

  // Fetch properties data
  const fetchPropertiesData = useCallback(async () => {
    try {
      setLoading(true)
      
      const propertiesResponse = await fetch('/api/properties')
      const propertiesResult = await propertiesResponse.json()
      
      const propertySetsResponse = await fetch('/api/property-sets')
      const propertySetsResult = await propertySetsResponse.json()
      
      if (propertiesResponse.ok && propertiesResult.data) {
        setProperties(propertiesResult.data)
        
        const allProperties = propertiesResult.data || []
        
        const totalViews = allProperties.reduce((sum: number, p: Property) => sum + (p.totalViews || 0), 0)
        const activeManuals = allProperties.reduce((sum: number, p: Property) => sum + (p.zonesCount || 0), 0)
        const avgRating = allProperties.length > 0 ? allProperties.reduce((sum: number, p: Property) => sum + (p.avgRating || 0), 0) / allProperties.length : 0
        
        setStats({
          totalProperties: allProperties.length,
          totalViews: totalViews,
          activeManuals: activeManuals,
          avgRating: parseFloat(avgRating.toFixed(1))
        })
      }

      if (propertySetsResponse.ok && propertySetsResult.data) {
        setPropertySets(propertySetsResult.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPropertiesData()
  }, [fetchPropertiesData])

  if (loading) {
    return React.createElement(AnimatedLoadingSpinner, {
      text: "Cargando tu panel...",
      type: "general"
    })
  }

  return React.createElement('div', {
    className: "min-h-screen flex flex-col bg-gray-50"
  },
    React.createElement(DashboardNavbar, {
      user: user || undefined
    }),
    React.createElement('main', {
      className: "flex-1 pt-6 sm:pt-16"
    },
      React.createElement('div', {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8"
      },
        React.createElement(motion.div, {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5 },
          className: "mb-8"
        },
          React.createElement('div', {
            className: "flex items-center justify-between"
          },
            React.createElement('div', {},
              React.createElement('h1', {
                className: "text-3xl font-bold text-gray-900"
              }, `Hola, ${user?.name?.split(' ')[0] || 'Usuario'} 👋`),
              React.createElement('p', {
                className: "text-gray-600 mt-2"
              }, "Aquí tienes un resumen de tus propiedades y manuales")
            )
          )
        ),
        React.createElement(motion.div, {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: 0.1 },
          className: "grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
        },
          React.createElement(Card, { children: null },
            React.createElement(CardContent, {
              className: "p-3 sm:p-6"
            },
              React.createElement('div', {
                className: "flex items-center"
              },
                React.createElement(Home, {
                  className: "h-6 w-6 sm:h-8 sm:w-8 text-violet-600"
                }),
                React.createElement('div', {
                  className: "ml-3 sm:ml-4"
                },
                  React.createElement('p', {
                    className: "text-xs sm:text-sm font-medium text-gray-600"
                  }, "Propiedades"),
                  React.createElement('p', {
                    className: "text-xl sm:text-2xl font-bold text-gray-900"
                  }, stats.totalProperties)
                )
              )
            )
          ),
          React.createElement(Card, { children: null },
            React.createElement(CardContent, {
              className: "p-3 sm:p-6"
            },
              React.createElement('div', {
                className: "flex items-center"
              },
                React.createElement(Eye, {
                  className: "h-6 w-6 sm:h-8 sm:w-8 text-blue-600"
                }),
                React.createElement('div', {
                  className: "ml-3 sm:ml-4"
                },
                  React.createElement('p', {
                    className: "text-xs sm:text-sm font-medium text-gray-600"
                  }, "Visualizaciones"),
                  React.createElement('p', {
                    className: "text-xl sm:text-2xl font-bold text-gray-900"
                  }, stats.totalViews)
                )
              )
            )
          ),
          React.createElement(Card, { children: null },
            React.createElement(CardContent, {
              className: "p-3 sm:p-6"
            },
              React.createElement('div', {
                className: "flex items-center"
              },
                React.createElement(Calendar, {
                  className: "h-6 w-6 sm:h-8 sm:w-8 text-orange-600"
                }),
                React.createElement('div', {
                  className: "ml-3 sm:ml-4"
                },
                  React.createElement('p', {
                    className: "text-xs sm:text-sm font-medium text-gray-600"
                  }, "Actividad Reciente"),
                  React.createElement('p', {
                    className: "text-xl sm:text-2xl font-bold text-gray-900"
                  }, "5")
                )
              )
            )
          ),
          React.createElement(Card, { children: null },
            React.createElement(CardContent, {
              className: "p-3 sm:p-6"
            },
              React.createElement('div', {
                className: "flex items-center"
              },
                React.createElement(PlayCircle, {
                  className: "h-6 w-6 sm:h-8 sm:w-8 text-green-600"
                }),
                React.createElement('div', {
                  className: "ml-3 sm:ml-4"
                },
                  React.createElement('p', {
                    className: "text-xs sm:text-sm font-medium text-gray-600"
                  }, "Manuales Activos"),
                  React.createElement('p', {
                    className: "text-xl sm:text-2xl font-bold text-gray-900"
                  }, stats.activeManuals)
                )
              )
            )
          )
        )
      )
    ),
    React.createElement(DashboardFooter)
  )
}