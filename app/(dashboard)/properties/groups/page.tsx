'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Plus,
  Building2,
  Star,
  ArrowRight
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
      // error fetching property sets
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <AnimatedLoadingSpinner text={t('groups.listing.loading')} type="general" />
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-7 sm:mb-9"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: '#111' }}>
                  {t('groups.listing.title')}
                </h1>
                <p className="mt-1.5 text-sm sm:text-base" style={{ color: '#555' }}>
                  {t('groups.listing.subtitle')}
                </p>
              </div>
              <Button
                asChild
                className="rounded-full px-5 py-2.5 text-white font-medium self-start sm:self-auto shrink-0"
                style={{ backgroundColor: '#7c3aed' }}
              >
                <Link href="/properties/groups/new">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('groups.listing.newGroup')}
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            {propertySets.length === 0 ? (
              <div
                className="text-center py-14 px-6 rounded-2xl"
                style={{ backgroundColor: '#f5f3f0' }}
              >
                <div
                  className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
                >
                  <Building2 className="w-6 h-6" style={{ color: '#555' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#111' }}>
                  {t('groups.listing.empty')}
                </h3>
                <p className="mb-5 text-sm max-w-md mx-auto" style={{ color: '#555' }}>
                  {t('groups.listing.emptyDescription')}
                </p>
                <Button
                  asChild
                  className="rounded-full px-5 py-2.5 text-white font-medium"
                  style={{ backgroundColor: '#7c3aed' }}
                >
                  <Link href="/properties/groups/new">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('groups.listing.createFirst')}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {propertySets.map((propertySet, index) => (
                  <motion.div
                    key={propertySet.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.06 }}
                  >
                    <Card
                      className="cursor-pointer transition-shadow border"
                      style={{ borderColor: 'rgba(0,0,0,0.06)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                      onClick={() => router.push(`/properties/groups/${propertySet.id}`)}
                    >
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex flex-col h-full">
                          <div className="flex items-start gap-3 mb-4">
                            {propertySet.profileImage ? (
                              <img
                                src={propertySet.profileImage}
                                alt={propertySet.name}
                                className="w-12 h-12 rounded-xl object-cover shrink-0"
                              />
                            ) : (
                              <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: '#f0efed' }}
                              >
                                <Building2 className="w-5 h-5" style={{ color: '#555' }} />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-base sm:text-lg truncate" style={{ color: '#111' }}>
                                {propertySet.name}
                              </h3>
                              <p className="text-xs sm:text-sm truncate" style={{ color: '#555' }}>
                                {propertySet.city}, {propertySet.state}
                              </p>
                            </div>
                          </div>

                          {propertySet.description && (
                            <p className="text-sm mb-4 line-clamp-2" style={{ color: '#555' }}>
                              {propertySet.description}
                            </p>
                          )}

                          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 flex-grow">
                            {[
                              { value: propertySet.propertiesCount || 0, label: t('common.properties') },
                              { value: propertySet.totalZones || 0, label: t('common.zones') },
                              { value: propertySet.totalViews || 0, label: t('groups.listing.views') }
                            ].map((stat, i) => (
                              <div
                                key={i}
                                className="text-center py-2 rounded-lg"
                                style={{ backgroundColor: '#f5f3f0' }}
                              >
                                <div className="text-lg sm:text-xl font-semibold" style={{ color: '#111' }}>
                                  {stat.value}
                                </div>
                                <div className="text-[10px] sm:text-xs mt-0.5" style={{ color: '#aaa' }}>
                                  {stat.label}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <Badge
                              variant="secondary"
                              className="text-xs font-medium border-0"
                              style={{ backgroundColor: '#f0efed', color: '#555' }}
                            >
                              {propertySet.type === 'HOTEL' && t('types.hotel')}
                              {propertySet.type === 'BUILDING' && t('types.building')}
                              {propertySet.type === 'COMPLEX' && t('types.complex')}
                              {propertySet.type === 'RESORT' && t('types.resort')}
                              {propertySet.type === 'HOSTEL' && t('types.hostel')}
                              {propertySet.type === 'APARTHOTEL' && t('types.aparthotel')}
                            </Badge>
                            {propertySet.avgRating > 0 && (
                              <div className="flex items-center text-sm" style={{ color: '#555' }}>
                                <Star className="w-3.5 h-3.5 mr-1" style={{ color: '#555' }} />
                                <span>{Number(propertySet.avgRating).toFixed(1)}</span>
                              </div>
                            )}
                          </div>

                          <Button
                            variant="outline"
                            className="w-full rounded-full font-medium"
                            style={{ borderColor: 'rgba(0,0,0,0.1)', color: '#111' }}
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
