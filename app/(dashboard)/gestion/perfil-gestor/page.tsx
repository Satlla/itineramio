'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  Upload,
  Trash2,
  Save,
  Image,
  Mail,
  Phone,
  MapPin,
  FileText,
  Hash,
  Globe,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Landmark,
  Banknote,
  Smartphone,
  Check,
  X,
  Plus,
  Pencil,
  Star,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, Card, CardContent, Badge } from '../../../../src/components/ui'
import { validateIBAN, formatIBAN } from '../../../../src/lib/iban-validator'
import { AnimatedLoadingSpinner } from '../../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardFooter } from '../../../../src/components/layout/DashboardFooter'

interface PaymentMethod {
  type: string
  enabled: boolean
  details?: string
}

interface InvoiceSeries {
  id: string
  name: string
  prefix: string
  year: number
  type: 'STANDARD' | 'RECTIFYING'
  currentNumber: number
  resetYearly: boolean
  isDefault: boolean
  isActive: boolean
  nextNumber: string
  editable: boolean
}

interface InvoiceConfig {
  id?: string
  businessName: string
  nif: string
  address: string
  city: string
  postalCode: string
  country: string
  email: string
  phone: string
  logoUrl?: string
  footerNotes?: string
  // Payment methods
  paymentMethods?: PaymentMethod[]
  defaultPaymentMethod?: string
  bankName?: string
  iban?: string
  bic?: string
  bizumPhone?: string
  paypalEmail?: string
  // VeriFactu
  verifactuEnabled?: boolean
  siiExempt?: boolean
  verifactuApiKey?: string | null
  verifactuApiKeyConfigured?: boolean
}

export default function PerfilGestorPage() {
  const { t } = useTranslation('gestion')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [ibanError, setIbanError] = useState<string | null>(null)
  const [ibanValid, setIbanValid] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Invoice series state
  const [series, setSeries] = useState<InvoiceSeries[]>([])
  const [loadingSeries, setLoadingSeries] = useState(false)
  const [showNewSeriesForm, setShowNewSeriesForm] = useState(false)
  const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null)
  const [editingNumber, setEditingNumber] = useState<string>('')
  const [newSeries, setNewSeries] = useState({ name: '', prefix: '', type: 'STANDARD', resetYearly: true, isDefault: false })

  // Separate state for API key (never send masked value back)
  const [verifactuApiKeyInput, setVerifactuApiKeyInput] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)

  const [config, setConfig] = useState<InvoiceConfig>({
    businessName: '',
    nif: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'España',
    email: '',
    phone: '',
    logoUrl: '',
    footerNotes: '',
    paymentMethods: [
      { type: 'TRANSFER', enabled: false },
      { type: 'BIZUM', enabled: false },
      { type: 'PAYPAL', enabled: false },
      { type: 'CASH', enabled: false },
      { type: 'CARD', enabled: false },
    ],
    defaultPaymentMethod: '',
    bankName: '',
    iban: '',
    bic: '',
    bizumPhone: '',
    paypalEmail: ''
  })

  useEffect(() => {
    fetchConfig()
    fetchSeries()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/manager-profile', { credentials: 'include' })

      if (response.ok) {
        const data = await response.json()
        if (data.config) {
          setConfig({
            ...config,
            ...data.config
          })
        }
      }
    } catch (error) {
      console.error('Error fetching config:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSeries = async () => {
    try {
      setLoadingSeries(true)
      const response = await fetch('/api/gestion/invoice-series', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setSeries(data.series || [])
      }
    } catch (error) {
      console.error('Error fetching series:', error)
    } finally {
      setLoadingSeries(false)
    }
  }

  const handleCreateSeries = async () => {
    if (!newSeries.name || !newSeries.prefix) {
      setMessage({ type: 'error', text: t('companyProfile.messages.nameAndPrefixRequired') })
      return
    }

    try {
      const response = await fetch('/api/gestion/invoice-series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newSeries)
      })

      if (response.ok) {
        const data = await response.json()
        setSeries(prev => [...prev, data.series])
        setShowNewSeriesForm(false)
        setNewSeries({ name: '', prefix: '', type: 'STANDARD', resetYearly: true, isDefault: false })
        setMessage({ type: 'success', text: t('companyProfile.messages.seriesCreated') })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || t('companyProfile.messages.errorCreatingSeries') })
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('companyProfile.messages.connectionError') })
    }
  }

  const handleUpdateSeriesNumber = async (seriesId: string) => {
    const newNumber = parseInt(editingNumber)
    if (isNaN(newNumber) || newNumber < 0) {
      setMessage({ type: 'error', text: t('companyProfile.messages.invalidNumber') })
      return
    }

    try {
      const response = await fetch('/api/gestion/invoice-series', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: seriesId, currentNumber: newNumber })
      })

      if (response.ok) {
        const data = await response.json()
        setSeries(prev => prev.map(s => s.id === seriesId ? data.series : s))
        setEditingSeriesId(null)
        setEditingNumber('')
        setMessage({ type: 'success', text: t('companyProfile.messages.numberUpdated') })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || t('companyProfile.messages.errorUpdating') })
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('companyProfile.messages.connectionError') })
    }
  }

  const handleToggleDefault = async (seriesId: string, currentDefault: boolean) => {
    try {
      const response = await fetch('/api/gestion/invoice-series', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: seriesId, isDefault: !currentDefault })
      })

      if (response.ok) {
        await fetchSeries()
        setMessage({ type: 'success', text: currentDefault ? t('companyProfile.messages.defaultRemoved') : t('companyProfile.messages.defaultSet') })
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('companyProfile.messages.connectionError') })
    }
  }

  const handleToggleActive = async (seriesId: string, currentActive: boolean) => {
    try {
      const response = await fetch('/api/gestion/invoice-series', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: seriesId, isActive: !currentActive })
      })

      if (response.ok) {
        const data = await response.json()
        setSeries(prev => prev.map(s => s.id === seriesId ? data.series : s))
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || t('companyProfile.messages.errorUpdating') })
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('companyProfile.messages.connectionError') })
    }
  }

  const handleDeleteSeries = async (seriesId: string) => {
    if (!confirm(t('companyProfile.confirmDeleteSeries'))) return

    try {
      const response = await fetch(`/api/gestion/invoice-series?id=${seriesId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setSeries(prev => prev.filter(s => s.id !== seriesId))
        setMessage({ type: 'success', text: t('companyProfile.messages.seriesDeleted') })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || t('companyProfile.messages.errorDeleting') })
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('companyProfile.messages.connectionError') })
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/manager-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...config,
          // Only send API key if user typed a new one
          ...(verifactuApiKeyInput ? { verifactuApiKey: verifactuApiKeyInput } : {}),
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: t('companyProfile.messages.profileSaved') })
      } else {
        setMessage({ type: 'error', text: t('companyProfile.messages.errorSavingProfile') })
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('companyProfile.messages.connectionError') })
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: t('companyProfile.messages.onlyImages') })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: t('companyProfile.messages.fileTooLarge') })
      return
    }

    setUploadingLogo(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/manager-profile/logo', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setConfig(prev => ({ ...prev, logoUrl: data.logoUrl }))
        setMessage({ type: 'success', text: t('companyProfile.messages.logoUploaded') })
      } else {
        setMessage({ type: 'error', text: t('companyProfile.messages.errorUploadingLogo') })
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('companyProfile.messages.connectionError') })
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleDeleteLogo = async () => {
    if (!confirm(t('companyProfile.confirmDeleteLogo'))) return

    setUploadingLogo(true)
    try {
      const response = await fetch('/api/manager-profile/logo', {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setConfig(prev => ({ ...prev, logoUrl: '' }))
        setMessage({ type: 'success', text: t('companyProfile.messages.logoDeleted') })
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('companyProfile.messages.errorDeletingLogo') })
    } finally {
      setUploadingLogo(false)
    }
  }

  const paymentMethodLabels: Record<string, string> = {
    TRANSFER: t('companyProfile.paymentMethods.transfer'),
    BIZUM: t('companyProfile.paymentMethods.bizum'),
    PAYPAL: t('companyProfile.paymentMethods.paypal'),
    CASH: t('companyProfile.paymentMethods.cash'),
    CARD: t('companyProfile.paymentMethods.card'),
  }

  if (loading) {
    return <AnimatedLoadingSpinner text={t('companyProfile.loadingProfile')} type="general" />
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="flex items-center space-x-3">
              <Building2 className="h-7 w-7 text-violet-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('companyProfile.pageTitle')}</h1>
                <p className="text-sm text-gray-600">
                  {t('companyProfile.pageSubtitle')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <CardContent className="p-4 flex items-center gap-3">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                    {message.text}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <form onSubmit={handleSave}>
            {/* Logo Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6"
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Image className="w-5 h-5 text-violet-600" />
                    {t('companyProfile.logo.title')}
                  </h2>

                  <div className="flex items-center gap-6">
                    {config.logoUrl ? (
                      <div className="relative">
                        <img
                          src={config.logoUrl}
                          alt="Logo"
                          className="w-32 h-32 object-contain border border-gray-200 rounded-lg bg-white p-2"
                        />
                        <button
                          type="button"
                          onClick={handleDeleteLogo}
                          disabled={uploadingLogo}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        <Image className="w-10 h-10 text-gray-300" />
                      </div>
                    )}

                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingLogo}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingLogo ? t('companyProfile.logo.uploading') : t('companyProfile.logo.upload')}
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        {t('companyProfile.logo.hint')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Business Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-violet-600" />
                    {t('companyProfile.taxData.title')}
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('companyProfile.taxData.businessName')}
                      </label>
                      <input
                        type="text"
                        required
                        value={config.businessName}
                        onChange={(e) => setConfig(prev => ({ ...prev, businessName: e.target.value }))}
                        placeholder={t('companyProfile.taxData.businessNamePlaceholder')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('companyProfile.taxData.nif')}
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={config.nif}
                          onChange={(e) => setConfig(prev => ({ ...prev, nif: e.target.value.toUpperCase() }))}
                          placeholder={t('companyProfile.taxData.nifPlaceholder')}
                          className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('companyProfile.taxData.country')}
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={config.country}
                          onChange={(e) => setConfig(prev => ({ ...prev, country: e.target.value }))}
                          className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('companyProfile.taxData.address')}
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={config.address}
                          onChange={(e) => setConfig(prev => ({ ...prev, address: e.target.value }))}
                          placeholder={t('companyProfile.taxData.addressPlaceholder')}
                          className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('companyProfile.taxData.city')}
                      </label>
                      <input
                        type="text"
                        required
                        value={config.city}
                        onChange={(e) => setConfig(prev => ({ ...prev, city: e.target.value }))}
                        placeholder={t('companyProfile.taxData.cityPlaceholder')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('companyProfile.taxData.postalCode')}
                      </label>
                      <input
                        type="text"
                        required
                        value={config.postalCode}
                        onChange={(e) => setConfig(prev => ({ ...prev, postalCode: e.target.value }))}
                        placeholder={t('companyProfile.taxData.postalCodePlaceholder')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-6"
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-violet-600" />
                    {t('companyProfile.contact.title')}
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('companyProfile.contact.email')}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={config.email}
                          onChange={(e) => setConfig(prev => ({ ...prev, email: e.target.value }))}
                          placeholder={t('companyProfile.contact.emailPlaceholder')}
                          className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('companyProfile.contact.phone')}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          value={config.phone}
                          onChange={(e) => setConfig(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder={t('companyProfile.contact.phonePlaceholder')}
                          className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Footer Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-6"
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-violet-600" />
                    {t('companyProfile.footerNotes.title')}
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('companyProfile.footerNotes.label')}
                    </label>
                    <textarea
                      value={config.footerNotes || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, footerNotes: e.target.value }))}
                      placeholder={t('companyProfile.footerNotes.placeholder')}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Methods */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="mb-6"
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-violet-600" />
                    {t('companyProfile.paymentMethods.title')}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('companyProfile.paymentMethods.subtitle')}
                  </p>

                  <div className="space-y-6">
                    {/* Bank Transfer */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Landmark className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{t('companyProfile.paymentMethods.transfer')}</span>
                            <p className="text-xs text-gray-500">{t('companyProfile.paymentMethods.transferDesc')}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.paymentMethods?.find(m => m.type === 'TRANSFER')?.enabled || false}
                            onChange={(e) => {
                              const newMethods = config.paymentMethods?.map(m =>
                                m.type === 'TRANSFER' ? { ...m, enabled: e.target.checked } : m
                              ) || []
                              setConfig(prev => ({ ...prev, paymentMethods: newMethods }))
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                        </label>
                      </div>
                      {config.paymentMethods?.find(m => m.type === 'TRANSFER')?.enabled && (
                        <div className="grid sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t('companyProfile.paymentMethods.bank')}
                            </label>
                            <input
                              type="text"
                              value={config.bankName || ''}
                              onChange={(e) => setConfig(prev => ({ ...prev, bankName: e.target.value }))}
                              placeholder={t('companyProfile.paymentMethods.bankPlaceholder')}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t('companyProfile.paymentMethods.iban')}
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={config.iban ? formatIBAN(config.iban) : ''}
                                onChange={(e) => {
                                  const value = e.target.value.toUpperCase().replace(/\s/g, '')
                                  setConfig(prev => ({ ...prev, iban: value }))

                                  if (value.length > 4) {
                                    const result = validateIBAN(value)
                                    setIbanValid(result.valid)
                                    setIbanError(result.valid ? null : result.error || null)
                                  } else {
                                    setIbanValid(false)
                                    setIbanError(null)
                                  }
                                }}
                                placeholder={t('companyProfile.paymentMethods.ibanPlaceholder')}
                                className={`w-full border rounded-md px-3 py-2 text-sm font-mono pr-10 focus:outline-none focus:ring-2 ${
                                  ibanError
                                    ? 'border-red-300 focus:ring-red-500'
                                    : ibanValid
                                      ? 'border-green-300 focus:ring-green-500'
                                      : 'border-gray-300 focus:ring-violet-500'
                                }`}
                              />
                              {config.iban && config.iban.length > 4 && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  {ibanValid ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : ibanError ? (
                                    <X className="w-4 h-4 text-red-500" />
                                  ) : null}
                                </div>
                              )}
                            </div>
                            {ibanError && (
                              <p className="mt-1 text-xs text-red-600">{ibanError}</p>
                            )}
                            {ibanValid && (
                              <p className="mt-1 text-xs text-green-600">{t('companyProfile.paymentMethods.ibanValid')}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t('companyProfile.paymentMethods.bicSwift')}
                            </label>
                            <input
                              type="text"
                              value={config.bic || ''}
                              onChange={(e) => setConfig(prev => ({ ...prev, bic: e.target.value.toUpperCase() }))}
                              placeholder={t('companyProfile.paymentMethods.bicPlaceholder')}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bizum */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <Smartphone className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{t('companyProfile.paymentMethods.bizum')}</span>
                            <p className="text-xs text-gray-500">{t('companyProfile.paymentMethods.bizumDesc')}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.paymentMethods?.find(m => m.type === 'BIZUM')?.enabled || false}
                            onChange={(e) => {
                              const newMethods = config.paymentMethods?.map(m =>
                                m.type === 'BIZUM' ? { ...m, enabled: e.target.checked } : m
                              ) || []
                              setConfig(prev => ({ ...prev, paymentMethods: newMethods }))
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                        </label>
                      </div>
                      {config.paymentMethods?.find(m => m.type === 'BIZUM')?.enabled && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('companyProfile.paymentMethods.bizumPhone')}
                          </label>
                          <div className="relative max-w-xs">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="tel"
                              value={config.bizumPhone || ''}
                              onChange={(e) => setConfig(prev => ({ ...prev, bizumPhone: e.target.value }))}
                              placeholder={t('companyProfile.paymentMethods.bizumPhonePlaceholder')}
                              className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PayPal */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.771.771 0 0 1 .76-.654h6.724c2.231 0 3.89.453 4.923 1.345.98.847 1.378 2.076 1.185 3.654-.017.14-.04.282-.065.427a6.02 6.02 0 0 1-.175.82c-.618 2.317-2.386 3.796-5.364 4.164l-1.185.146a.77.77 0 0 0-.657.643l-.653 3.907a.641.641 0 0 1-.633.539H7.076z"/>
                            </svg>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{t('companyProfile.paymentMethods.paypal')}</span>
                            <p className="text-xs text-gray-500">{t('companyProfile.paymentMethods.paypalDesc')}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.paymentMethods?.find(m => m.type === 'PAYPAL')?.enabled || false}
                            onChange={(e) => {
                              const newMethods = config.paymentMethods?.map(m =>
                                m.type === 'PAYPAL' ? { ...m, enabled: e.target.checked } : m
                              ) || []
                              setConfig(prev => ({ ...prev, paymentMethods: newMethods }))
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                        </label>
                      </div>
                      {config.paymentMethods?.find(m => m.type === 'PAYPAL')?.enabled && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('companyProfile.paymentMethods.paypalEmail')}
                          </label>
                          <div className="relative max-w-md">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="email"
                              value={config.paypalEmail || ''}
                              onChange={(e) => setConfig(prev => ({ ...prev, paypalEmail: e.target.value }))}
                              placeholder={t('companyProfile.paymentMethods.paypalEmailPlaceholder')}
                              className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cash */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <Banknote className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{t('companyProfile.paymentMethods.cash')}</span>
                            <p className="text-xs text-gray-500">{t('companyProfile.paymentMethods.cashDesc')}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.paymentMethods?.find(m => m.type === 'CASH')?.enabled || false}
                            onChange={(e) => {
                              const newMethods = config.paymentMethods?.map(m =>
                                m.type === 'CASH' ? { ...m, enabled: e.target.checked } : m
                              ) || []
                              setConfig(prev => ({ ...prev, paymentMethods: newMethods }))
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Card */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <CreditCard className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{t('companyProfile.paymentMethods.card')}</span>
                            <p className="text-xs text-gray-500">{t('companyProfile.paymentMethods.cardDesc')}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.paymentMethods?.find(m => m.type === 'CARD')?.enabled || false}
                            onChange={(e) => {
                              const newMethods = config.paymentMethods?.map(m =>
                                m.type === 'CARD' ? { ...m, enabled: e.target.checked } : m
                              ) || []
                              setConfig(prev => ({ ...prev, paymentMethods: newMethods }))
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Default Payment Method */}
                    {config.paymentMethods?.some(m => m.enabled) && (
                      <div className="pt-4 border-t border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('companyProfile.paymentMethods.defaultMethod')}
                        </label>
                        <select
                          value={config.defaultPaymentMethod || ''}
                          onChange={(e) => setConfig(prev => ({ ...prev, defaultPaymentMethod: e.target.value }))}
                          className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                          <option value="">{t('companyProfile.paymentMethods.selectDefault')}</option>
                          {config.paymentMethods?.filter(m => m.enabled).map(m => (
                            <option key={m.type} value={m.type}>
                              {paymentMethodLabels[m.type] || m.type}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex justify-end"
            >
              <Button
                type="submit"
                disabled={saving}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? t('companyProfile.saving') : t('companyProfile.saveChanges')}
              </Button>
            </motion.div>
          </form>

          {/* Invoice Series Section - Outside form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mt-6"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Hash className="w-5 h-5 text-violet-600" />
                    <h2 className="text-lg font-semibold text-gray-900">{t('companyProfile.invoiceSeries.title')}</h2>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewSeriesForm(true)}
                    disabled={showNewSeriesForm}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {t('companyProfile.invoiceSeries.newSeries')}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {t('companyProfile.invoiceSeries.description')}
                </p>

                {/* New Series Form */}
                {showNewSeriesForm && (
                  <div className="mb-6 p-4 border border-violet-200 rounded-lg bg-violet-50">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">{t('companyProfile.invoiceSeries.newSeries')}</h3>
                    <div className="grid sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{t('companyProfile.invoiceSeries.name')}</label>
                        <input
                          type="text"
                          value={newSeries.name}
                          onChange={(e) => setNewSeries(prev => ({ ...prev, name: e.target.value }))}
                          placeholder={t('companyProfile.invoiceSeries.namePlaceholder')}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{t('companyProfile.invoiceSeries.prefix')}</label>
                        <input
                          type="text"
                          value={newSeries.prefix}
                          onChange={(e) => setNewSeries(prev => ({ ...prev, prefix: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) }))}
                          placeholder={t('companyProfile.invoiceSeries.prefixPlaceholder')}
                          maxLength={6}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{t('companyProfile.invoiceSeries.type')}</label>
                        <select
                          value={newSeries.type}
                          onChange={(e) => setNewSeries(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                          <option value="STANDARD">{t('companyProfile.invoiceSeries.standard')}</option>
                          <option value="RECTIFYING">{t('companyProfile.invoiceSeries.rectifying')}</option>
                        </select>
                      </div>
                      <div className="flex items-end gap-2">
                        <Button type="button" onClick={handleCreateSeries} size="sm" className="bg-violet-600 hover:bg-violet-700">
                          {t('companyProfile.invoiceSeries.create')}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowNewSeriesForm(false)}>
                          {t('companyProfile.invoiceSeries.cancel')}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={newSeries.resetYearly}
                          onChange={(e) => setNewSeries(prev => ({ ...prev, resetYearly: e.target.checked }))}
                          className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                        {t('companyProfile.invoiceSeries.resetYearly')}
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={newSeries.isDefault}
                          onChange={(e) => setNewSeries(prev => ({ ...prev, isDefault: e.target.checked }))}
                          className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                        {t('companyProfile.invoiceSeries.defaultSeries')}
                      </label>
                    </div>
                    {newSeries.prefix && (
                      <p className="text-xs text-gray-500 mt-2">
                        {t('companyProfile.invoiceSeries.preview')} <span className="font-mono font-medium text-violet-600">{newSeries.prefix}0001</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Series List */}
                {loadingSeries ? (
                  <div className="py-4 text-center text-gray-500">{t('companyProfile.invoiceSeries.loadingSeries')}</div>
                ) : series.length === 0 ? (
                  <div className="py-8 text-center">
                    <Hash className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">{t('companyProfile.invoiceSeries.noSeries')}</p>
                    <p className="text-sm text-gray-400">{t('companyProfile.invoiceSeries.noSeriesHint')}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-2 font-medium text-gray-600">{t('companyProfile.invoiceSeries.tableHeaders.name')}</th>
                          <th className="text-left py-2 px-2 font-medium text-gray-600">{t('companyProfile.invoiceSeries.tableHeaders.prefix')}</th>
                          <th className="text-left py-2 px-2 font-medium text-gray-600">{t('companyProfile.invoiceSeries.tableHeaders.nextInvoice')}</th>
                          <th className="text-center py-2 px-2 font-medium text-gray-600">{t('companyProfile.invoiceSeries.tableHeaders.lastNumber')}</th>
                          <th className="text-center py-2 px-2 font-medium text-gray-600">{t('companyProfile.invoiceSeries.tableHeaders.status')}</th>
                          <th className="text-right py-2 px-2 font-medium text-gray-600">{t('companyProfile.invoiceSeries.tableHeaders.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {series.map((s) => (
                          <tr key={s.id} className={`border-b border-gray-100 ${!s.isActive ? 'opacity-50' : ''}`}>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{s.name}</span>
                                {s.type === 'RECTIFYING' && (
                                  <Badge variant="secondary" className="text-xs">{t('companyProfile.invoiceSeries.rectifying')}</Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <span className="font-mono text-gray-600">{s.prefix}</span>
                            </td>
                            <td className="py-3 px-2">
                              <span className="font-mono font-medium text-violet-600">{s.nextNumber}</span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              {editingSeriesId === s.id ? (
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    value={editingNumber}
                                    onChange={(e) => setEditingNumber(e.target.value)}
                                    min="0"
                                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleUpdateSeriesNumber(s.id)
                                      if (e.key === 'Escape') { setEditingSeriesId(null); setEditingNumber('') }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSeriesNumber(s.id)}
                                    className="p-1 text-green-600 hover:text-green-700"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => { setEditingSeriesId(null); setEditingNumber('') }}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => { setEditingSeriesId(s.id); setEditingNumber(String(s.currentNumber)) }}
                                  className="inline-flex items-center gap-1 font-mono text-gray-600 hover:text-violet-600"
                                  title={t('companyProfile.invoiceSeries.editCurrentNumber')}
                                >
                                  {s.currentNumber}
                                  <Pencil className="w-3 h-3" />
                                </button>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center justify-center gap-2">
                                {s.isDefault && (
                                  <Badge className="bg-violet-100 text-violet-700 border-0 text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    {t('companyProfile.invoiceSeries.default')}
                                  </Badge>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleToggleActive(s.id, s.isActive)}
                                  className={`p-1 rounded transition-colors ${s.isActive ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
                                  title={s.isActive ? t('companyProfile.invoiceSeries.deactivate') : t('companyProfile.invoiceSeries.activate')}
                                >
                                  {s.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center justify-end gap-1">
                                {!s.isDefault && s.isActive && (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleDefault(s.id, s.isDefault)}
                                    className="p-1.5 text-gray-400 hover:text-violet-600 rounded transition-colors"
                                    title={t('companyProfile.invoiceSeries.setAsDefault')}
                                  >
                                    <Star className="w-4 h-4" />
                                  </button>
                                )}
                                {s.editable && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSeries(s.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                                    title={t('companyProfile.invoiceSeries.deleteSeries')}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    {t('companyProfile.invoiceSeries.note')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* VeriFactu Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">VeriFactu</h3>
                    <p className="text-sm text-gray-500">Sistema de facturación verificable — RD 1007/2023</p>
                  </div>
                </div>

                {/* Info banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Obligatorio desde 2027</p>
                      <p>Sociedades: 1 enero 2027 · Autónomos: 1 julio 2027. Activar VeriFactu añade hash SHA-256, QR tributario y el texto &quot;VERI*FACTU&quot; a tus facturas emitidas.</p>
                    </div>
                  </div>
                </div>

                {/* VeriFactu toggle */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Activar VeriFactu</p>
                      <p className="text-sm text-gray-500">Genera hash SHA-256 encadenado, QR tributario y marca &quot;VERI*FACTU&quot; en cada factura emitida</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, verifactuEnabled: !config.verifactuEnabled })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        config.verifactuEnabled ? 'bg-emerald-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          config.verifactuEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* SII Exempt toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Exento por SII</p>
                      <p className="text-sm text-gray-500">Si estás sujeto al SII (facturación &gt;6M€), quedas exento de VeriFactu</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, siiExempt: !config.siiExempt })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        config.siiExempt ? 'bg-amber-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          config.siiExempt ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {config.verifactuEnabled && !config.siiExempt && (
                    <>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-emerald-800">
                            <p className="font-medium mb-1">VeriFactu activo</p>
                            <p>Las facturas emitidas incluirán:</p>
                            <ul className="list-disc list-inside mt-1 space-y-0.5">
                              <li>Hash SHA-256 encadenado con la factura anterior</li>
                              <li>QR tributario con enlace de validación en AEAT</li>
                              <li>Marca &quot;VERI*FACTU&quot; visible en el PDF</li>
                              <li>Tipo de factura AEAT (F1, F2, R1-R5)</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Verifacti API Key */}
                      <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            API Key de Verifacti
                          </label>
                          <p className="text-xs text-gray-500 mb-2">
                            Necesaria para enviar facturas a la AEAT. Obtén tu API key en verifacti.com
                          </p>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                type={showApiKey ? 'text' : 'password'}
                                value={verifactuApiKeyInput}
                                onChange={(e) => setVerifactuApiKeyInput(e.target.value)}
                                placeholder={config.verifactuApiKeyConfigured ? 'API key configurada (introduce una nueva para cambiarla)' : 'Introduce tu API key de Verifacti'}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowApiKey(!showApiKey)}
                              className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              {showApiKey ? 'Ocultar' : 'Mostrar'}
                            </button>
                          </div>
                          {config.verifactuApiKeyConfigured && !verifactuApiKeyInput && (
                            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              API key configurada ({config.verifactuApiKey})
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {config.siiExempt && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-amber-800">
                          <p className="font-medium">Exento de VeriFactu por SII</p>
                          <p className="mt-1">Los sujetos al Suministro Inmediato de Información (SII) están exentos de VeriFactu.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  )
}
