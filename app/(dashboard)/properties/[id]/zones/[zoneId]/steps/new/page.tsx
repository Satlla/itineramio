'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Save,
  FileText,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Eye,
  Clock,
  Info,
  Lightbulb
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '../../../../../../../../src/components/ui/Button'
import { Input } from '../../../../../../../../src/components/ui/Input'
import { Card } from '../../../../../../../../src/components/ui/Card'
import { ImageUpload } from '../../../../../../../../src/components/ui/ImageUpload'
import { InlineSpinner } from '../../../../../../../../src/components/ui/Spinner'

// Step validation schema
const createStepSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(100, 'Máximo 100 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(1000, 'Máximo 1000 caracteres').optional(),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'LINK']),
  content: z.string().min(5, 'El contenido debe tener al menos 5 caracteres').optional(),
  mediaUrl: z.string().optional(),
  linkUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  estimatedTime: z.number().min(1, 'Mínimo 1 minuto').max(60, 'Máximo 60 minutos').optional(),
  order: z.number().min(0).optional()
}).refine((data) => {
  // Require either description or content
  return data.description || data.content
}, {
  message: 'Se requiere descripción o contenido',
  path: ['content']
})

type CreateStepFormData = z.infer<typeof createStepSchema>

// Step types will be defined inside the component to use translations

// Formatting legend component - will be rendered inside component with t function
const FormattingLegend = ({ t }: { t: (key: string) => string }) => (
  <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
    <div className="flex items-start gap-2">
      <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
      <div className="text-xs text-amber-800">
        <p className="font-medium mb-1">{t('stepsPage.formatStyles')}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span><code className="bg-amber-100 px-1 rounded">**texto**</code> → <strong>{t('stepsPage.boldFormat')}</strong></span>
          <span><code className="bg-amber-100 px-1 rounded">*texto*</code> → <em>{t('stepsPage.italicFormat')}</em></span>
          <span><code className="bg-amber-100 px-1 rounded">__texto__</code> → <span className="underline">{t('stepsPage.underlineFormat')}</span></span>
          <span><code className="bg-amber-100 px-1 rounded">~~texto~~</code> → <span className="line-through">{t('stepsPage.strikethroughFormat')}</span></span>
        </div>
        <p className="mt-1 text-amber-700">{t('stepsPage.urlAutoLink')}</p>
      </div>
    </div>
  </div>
)

export default function NewStepPage() {
  const { t } = useTranslation('zones')
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  const zoneId = params.zoneId as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [zoneName, setZoneName] = useState('')
  const [propertyName, setPropertyName] = useState('')

  const stepTypes = [
    {
      value: 'TEXT' as const,
      label: t('stepTypes.text'),
      icon: FileText,
      description: t('newStepPage.textWithFormat')
    },
    {
      value: 'IMAGE' as const,
      label: t('stepTypes.image'),
      icon: ImageIcon,
      description: t('newStepPage.photoWithExplanation')
    },
    {
      value: 'VIDEO' as const,
      label: t('stepTypes.video'),
      icon: Video,
      description: t('newStepPage.instructionalVideo')
    },
    {
      value: 'LINK' as const,
      label: t('stepTypes.link'),
      icon: LinkIcon,
      description: t('newStepPage.externalLink')
    }
  ]

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CreateStepFormData>({
    resolver: zodResolver(createStepSchema),
    defaultValues: {
      type: 'TEXT',
      estimatedTime: 2,
      order: 0
    }
  })

  const watchedValues = watch()
  const selectedType = watch('type')

  // Fetch zone and property names
  useEffect(() => {
    fetchZoneData()
  }, [propertyId, zoneId])

  const fetchZoneData = async () => {
    try {
      const [zoneResponse, propertyResponse] = await Promise.all([
        fetch(`/api/properties/${propertyId}/zones/${zoneId}`),
        fetch(`/api/properties/${propertyId}`)
      ])
      
      const [zoneResult, propertyResult] = await Promise.all([
        zoneResponse.json(),
        propertyResponse.json()
      ])
      
      if (zoneResponse.ok && zoneResult.data) {
        setZoneName(zoneResult.data.name)
      }
      
      if (propertyResponse.ok && propertyResult.data) {
        setPropertyName(propertyResult.data.name)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const onSubmit = async (data: CreateStepFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/properties/${propertyId}/zones/${zoneId}/steps/safe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          status: 'ACTIVE'
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || t('stepsPage.errorSavingStep'))
      }

      // Redirect back to zone page
      router.push(`/properties/${propertyId}/zones/${zoneId}`)
    } catch (error) {
      console.error('Error creating step:', error)
      alert(t('stepsPage.errorSavingStep'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTypeChange = (type: CreateStepFormData['type']) => {
    setValue('type', type)
    // Clear type-specific fields when changing type
    setValue('content', '')
    setValue('mediaUrl', '')
    setValue('linkUrl', '')
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href={`/properties/${propertyId}/zones/${zoneId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('buttons.back')}
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('newStepPage.title')}</h1>
              <p className="text-gray-600 mt-1">
                {propertyName && zoneName && `${propertyName} > ${zoneName}`}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => alert(t('newStepPage.previewComingSoon'))}
          >
            <Eye className="w-4 h-4 mr-2" />
            {t('detail.preview')}
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Step Type Selection */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('newStepPage.stepType')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stepTypes.map((type) => {
                const IconComponent = type.icon
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeChange(type.value)}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${
                      selectedType === type.value
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <IconComponent className="w-8 h-8 mb-3" />
                    <h3 className="font-medium mb-1">{type.label}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </button>
                )
              })}
            </div>
          </Card>

          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('newStepPage.basicInfo')}
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('newStepPage.stepTitle')}
                </label>
                <Input
                  {...register('title')}
                  placeholder={t('newStepPage.stepTitlePlaceholder')}
                  error={!!errors.title}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('newStepPage.briefDescription')}
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder={t('newStepPage.briefDescriptionPlaceholder')}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
                    errors.description ? 'border-red-300' : ''
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {t('newStepPage.optionalNote')}
                </p>
              </div>

              {/* Estimated Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  {t('newStepPage.estimatedTime')}
                </label>
                <Input
                  type="number"
                  {...register('estimatedTime', { valueAsNumber: true })}
                  min="1"
                  max="60"
                  placeholder="2"
                  error={!!errors.estimatedTime}
                />
                {errors.estimatedTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.estimatedTime.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {t('newStepPage.timeToComplete')}
                </p>
              </div>
            </div>
          </Card>

          {/* Content Based on Type */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('newStepPage.stepContent')}
            </h2>

            {selectedType === 'TEXT' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('newStepPage.textContent')}
                </label>
                <FormattingLegend t={t} />
                <textarea
                  {...register('content')}
                  rows={8}
                  placeholder={t('newStepPage.textContentPlaceholder')}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
                    errors.content ? 'border-red-300' : ''
                  }`}
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
              </div>
            )}

            {selectedType === 'IMAGE' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('newStepPage.imageRequired')}
                  </label>
                  <ImageUpload
                    value={watchedValues.mediaUrl}
                    onChange={(imageUrl) => setValue('mediaUrl', imageUrl || '')}
                    placeholder={t('newStepPage.uploadInstructiveImage')}
                    variant="property"
                    maxSize={10}
                    error={!!errors.mediaUrl}
                  />
                  {errors.mediaUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.mediaUrl.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('newStepPage.imageExplanation')}
                  </label>
                  <FormattingLegend t={t} />
                  <textarea
                    {...register('content')}
                    rows={4}
                    placeholder={t('newStepPage.imageExplanationPlaceholder')}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
                      errors.content ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                  )}
                </div>
              </div>
            )}

            {selectedType === 'VIDEO' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('newStepPage.videoUrl')}
                  </label>
                  <Input
                    {...register('mediaUrl')}
                    placeholder={t('newStepPage.videoUrlPlaceholder')}
                    error={!!errors.mediaUrl}
                  />
                  {errors.mediaUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.mediaUrl.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {t('newStepPage.videoSupported')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('newStepPage.videoDescription')}
                  </label>
                  <FormattingLegend t={t} />
                  <textarea
                    {...register('content')}
                    rows={4}
                    placeholder={t('newStepPage.videoDescriptionPlaceholder')}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
                      errors.content ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                  )}
                </div>
              </div>
            )}

            {selectedType === 'LINK' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('newStepPage.linkUrl')}
                  </label>
                  <Input
                    {...register('linkUrl')}
                    placeholder={t('newStepPage.linkUrlPlaceholder')}
                    error={!!errors.linkUrl}
                  />
                  {errors.linkUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.linkUrl.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('newStepPage.linkDescription')}
                  </label>
                  <FormattingLegend t={t} />
                  <textarea
                    {...register('content')}
                    rows={4}
                    placeholder={t('newStepPage.linkDescriptionPlaceholder')}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
                      errors.content ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Order */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('newStepPage.advancedConfig')}
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('newStepPage.displayOrder')}
              </label>
              <Input
                type="number"
                {...register('order', { valueAsNumber: true })}
                min="0"
                placeholder="0"
                error={!!errors.order}
              />
              {errors.order && (
                <p className="mt-1 text-sm text-red-600">{errors.order.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {t('newStepPage.displayOrderHint')}
              </p>
            </div>
          </Card>

          {/* Info Box */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  <strong>{t('newStepPage.tip')}</strong> {t('newStepPage.tipDescription')}
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <Link href={`/properties/${propertyId}/zones/${zoneId}`}>
              <Button type="button" variant="outline">
                {t('buttons.cancel')}
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <InlineSpinner className="mr-2" color="white" />
                  {t('newStepPage.creating')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t('newStepPage.createStep')}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}