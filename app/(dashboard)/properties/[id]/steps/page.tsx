'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

// Helper function to get text from multilingual objects
const getText = (value: any, fallback: string = '') => {
  if (typeof value === 'string') {
    return value
  }
  if (value && typeof value === 'object') {
    return value.es || value.en || value.fr || fallback
  }
  return fallback
}
import { motion } from 'framer-motion'
import { Edit, ArrowRight, Plus, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '../../../../../src/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../src/components/ui/Card'
import { ZoneIconDisplay } from '../../../../../src/components/ui/IconSelector'
import { useRouter } from 'next/navigation'
import { cn } from '../../../../../src/lib/utils'

interface Zone {
  id: string
  name: string
  iconId: string
  stepsCount: number
  publishedSteps: number
  lastUpdated: string
  status: 'complete' | 'incomplete' | 'empty'
}

// Mock data - esto será reemplazado por datos reales del API
const mockZones: Zone[] = [
  {
    id: '1',
    name: 'Entrada Principal',
    iconId: 'door',
    stepsCount: 3,
    publishedSteps: 3,
    lastUpdated: '2024-01-15',
    status: 'complete'
  },
  {
    id: '2',
    name: 'Cocina',
    iconId: 'kitchen-main',
    stepsCount: 5,
    publishedSteps: 4,
    lastUpdated: '2024-01-14',
    status: 'incomplete'
  },
  {
    id: '3',
    name: 'Lavadora',
    iconId: 'washing',
    stepsCount: 4,
    publishedSteps: 4,
    lastUpdated: '2024-01-13',
    status: 'complete'
  },
  {
    id: '4',
    name: 'Aire Acondicionado',
    iconId: 'wind',
    stepsCount: 0,
    publishedSteps: 0,
    lastUpdated: '2024-01-12',
    status: 'empty'
  }
]

export default async function PropertyStepsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const router = useRouter()
  const { t } = useTranslation('property')
  const [zones] = useState<Zone[]>(mockZones)

  const getStatusInfo = (zone: Zone) => {
    switch (zone.status) {
      case 'complete':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: t('steps.status.complete'),
          description: t('steps.status.completeDescription')
        }
      case 'incomplete':
        return {
          icon: AlertCircle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          label: t('steps.status.incomplete'),
          description: t('steps.status.incompleteDescription')
        }
      case 'empty':
        return {
          icon: Plus,
          color: 'text-gray-400',
          bgColor: 'bg-gray-100',
          label: t('steps.status.empty'),
          description: t('steps.status.emptyDescription')
        }
    }
  }

  const totalSteps = zones.reduce((acc, zone) => acc + zone.stepsCount, 0)
  const totalPublished = zones.reduce((acc, zone) => acc + zone.publishedSteps, 0)
  const completedZones = zones.filter(zone => zone.status === 'complete').length

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('steps.title')}</h1>
        <p className="text-gray-600 mt-2">
          {t('steps.subtitle')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-violet-100">
                <Edit className="h-6 w-6 text-violet-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('steps.stats.totalSteps')}</p>
                <p className="text-2xl font-bold text-gray-900">{totalSteps}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('steps.stats.published')}</p>
                <p className="text-2xl font-bold text-gray-900">{totalPublished}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('steps.stats.completedZones')}</p>
                <p className="text-2xl font-bold text-gray-900">{completedZones}/{zones.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100">
                <div className="h-6 w-6 bg-orange-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('steps.stats.progress')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((totalPublished / Math.max(totalSteps, 1)) * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zones List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('steps.zonesAndSteps')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {zones.map((zone, index) => {
              const statusInfo = getStatusInfo(zone)
              const StatusIcon = statusInfo.icon
              
              return (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <ZoneIconDisplay iconId={zone.iconId} size="md" />
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">{getText(zone.name, 'Zona')}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1">
                          <StatusIcon className={cn("w-4 h-4", statusInfo.color)} />
                          <span className="text-sm text-gray-600">{statusInfo.label}</span>
                        </div>
                        
                        {zone.stepsCount > 0 && (
                          <div className="text-sm text-gray-600">
                            {t('steps.publishedCount', { published: zone.publishedSteps, total: zone.stepsCount })}
                          </div>
                        )}
                        
                        <div className="text-sm text-gray-500">
                          {t('steps.updated')}: {zone.lastUpdated}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {/* Progress Bar */}
                    {zone.stepsCount > 0 && (
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(zone.publishedSteps / zone.stepsCount) * 100}%` 
                          }}
                        />
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/properties/${id}/zones/${zone.id}/steps`)}
                      className="flex items-center"
                    >
                      {zone.stepsCount === 0 ? (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          {t('steps.createSteps')}
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          {t('steps.editSteps')}
                        </>
                      )}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
          
          {zones.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">{t('steps.noZones')}</div>
              <div className="text-gray-500 text-sm mb-6">
                {t('steps.noZonesDescription')}
              </div>
              <Button
                onClick={() => router.push(`/properties/${id}/zones`)}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t('steps.goToZones')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}