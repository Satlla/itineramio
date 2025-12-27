'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  ArrowRight,
  Building2, 
  Plus, 
  Home, 
  Eye, 
  Star,
  MapPin,
  Users,
  Bed,
  Bath,
  MoreHorizontal,
  Edit,
  ExternalLink,
  Share2,
  Settings,
  Copy,
  Trash2,
  BarChart3,
  UserX
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '../../../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardNavbar } from '../../../../../src/components/layout/DashboardNavbar'
import { DashboardFooter } from '../../../../../src/components/layout/DashboardFooter'
import { useAuth } from '../../../../../src/providers/AuthProvider'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface Property {
  id: string
  name: string
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
  createdAt: string
}

interface PropertySet {
  id: string
  name: string
  description?: string
  type: 'HOTEL' | 'BUILDING' | 'COMPLEX' | 'RESORT' | 'HOSTEL' | 'APARTHOTEL'
  profileImage?: string
  city: string
  state: string
  street: string
  propertiesCount: number
  totalViews: number
  avgRating: number
  totalZones?: number
  status: string
  createdAt: string
  properties: Property[]
}

export default function PropertySetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const propertySetId = params.id as string
  
  const [propertySet, setPropertySet] = useState<PropertySet | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchPropertySetData()
  }, [propertySetId])

  const fetchPropertySetData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/property-sets/${propertySetId}`)
      const result = await response.json()
      
      if (response.ok && result.data) {
        setPropertySet(result.data)
      } else {
        console.error('Property set not found')
        router.push('/main')
      }
    } catch (error) {
      console.error('Error fetching property set:', error)
      router.push('/main')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <AnimatedLoadingSpinner text="Cargando conjunto..." type="general" />
  }

  if (!propertySet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Conjunto no encontrado</h2>
          <p className="text-gray-600 mb-4">El conjunto que buscas no existe o no tienes acceso.</p>
          <Button onClick={() => router.push('/main')}>
            Volver al dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardNavbar user={user || undefined} />
      
      <main className="flex-1 pt-6 sm:pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <h1>Property Set Detail Page</h1>
          <p>This is a minimal version to test compilation</p>
        </div>
      </main>
      
      <DashboardFooter />
    </div>
  )
}