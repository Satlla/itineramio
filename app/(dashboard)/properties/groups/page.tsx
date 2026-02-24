'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Building2, 
  Star,
  ArrowRight,
  Eye,
  Home
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Card, CardContent, Badge } from '../../../../src/components/ui'
import { AnimatedLoadingSpinner } from '../../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardFooter } from '../../../../src/components/layout/DashboardFooter'
import { useAuth } from '../../../../src/providers/AuthProvider'

interface PropertySet {
  id: string
  name: string
  description?: string
  type: 'HOTEL' | 'BUILDING' | 'COMPLEX' | 'RESORT' | 'HOSTEL' | 'APARTHOTEL'
  profileImage?: string
  city: string
  state: string
  propertiesCount: number
  totalViews: number
  avgRating: number
  totalZones?: number
  status: string
  createdAt: string
}

export default function PropertySetsPage() {
  const router = useRouter()
  const { t } = useTranslation('property')
  const { user } = useAuth()
  const [propertySets, setPropertySets] = useState<PropertySet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPropertySets()
  }, [])

  const fetchPropertySets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/property-sets')
      const result = await response.json()
      
      if (response.ok && result.data) {
        setPropertySets(result.data)
      }
    } catch (error) {
      console.error('Error fetching property sets:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <AnimatedLoadingSpinner text={t('groups.listing.loading')} type="general" />
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('groups.listing.title')}
                </h1>
                <p className="text-gray-600 mt-2">
                  {t('groups.listing.subtitle')}
                </p>
              </div>
              <Button asChild className="bg-violet-600 hover:bg-violet-700">
                <Link href="/properties/groups/new">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('groups.listing.newGroup')}
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Property Sets Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {propertySets.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('groups.listing.empty')}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t('groups.listing.emptyDescription')}
                  </p>
                  <Button asChild className="bg-violet-600 hover:bg-violet-700">
                    <Link href="/properties/groups/new">
                      <Plus className="w-4 h-4 mr-2" />
                      {t('groups.listing.createFirst')}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {propertySets.map((propertySet, index) => (
                  <motion.div
                    key={propertySet.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/properties/groups/${propertySet.id}`)}>
                      <CardContent className="p-6">
                        <div className="flex flex-col h-full">
                          {/* Property Set Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              {propertySet.profileImage ? (
                                <img 
                                  src={propertySet.profileImage} 
                                  alt={propertySet.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center">
                                  <Building2 className="w-6 h-6 text-white" />
                                </div>
                              )}
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">
                                  {propertySet.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {propertySet.city}, {propertySet.state}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          {propertySet.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {propertySet.description}
                            </p>
                          )}

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-3 mb-4 flex-grow">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">{propertySet.propertiesCount || 0}</div>
                              <div className="text-xs text-gray-600">{t('common.properties')}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">{propertySet.totalZones || 0}</div>
                              <div className="text-xs text-gray-600">{t('common.zones')}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">{propertySet.totalViews || 0}</div>
                              <div className="text-xs text-gray-600">{t('groups.listing.views')}</div>
                            </div>
                          </div>

                          {/* Type Badge and Rating */}
                          <div className="flex items-center justify-between mb-4">
                            <Badge variant="secondary" className="text-xs">
                              {propertySet.type === 'HOTEL' && t('types.hotel')}
                              {propertySet.type === 'BUILDING' && t('types.building')}
                              {propertySet.type === 'COMPLEX' && t('types.complex')}
                              {propertySet.type === 'RESORT' && t('types.resort')}
                              {propertySet.type === 'HOSTEL' && t('types.hostel')}
                              {propertySet.type === 'APARTHOTEL' && t('types.aparthotel')}
                            </Badge>
                            {propertySet.avgRating > 0 && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                <span>{Number(propertySet.avgRating).toFixed(1)}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/properties/groups/${propertySet.id}`)
                            }}
                          >
                            {t('common.manage')}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      
      <DashboardFooter />
    </div>
  )
}