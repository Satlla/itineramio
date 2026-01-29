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
  X
} from 'lucide-react'
import { Button, Card, CardContent, Badge } from '../../../../src/components/ui'
import { validateIBAN, formatIBAN } from '../../../../src/lib/iban-validator'
import { AnimatedLoadingSpinner } from '../../../../src/components/ui/AnimatedLoadingSpinner'
import { DashboardFooter } from '../../../../src/components/layout/DashboardFooter'

interface PaymentMethod {
  type: string
  enabled: boolean
  details?: string
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
}

export default function PerfilGestorPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [ibanError, setIbanError] = useState<string | null>(null)
  const [ibanValid, setIbanValid] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/manager-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Perfil guardado correctamente' })
      } else {
        setMessage({ type: 'error', text: 'Error al guardar el perfil' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Solo se permiten imágenes' })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'El archivo es demasiado grande (máx. 2MB)' })
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
        setMessage({ type: 'success', text: 'Logo subido correctamente' })
      } else {
        setMessage({ type: 'error', text: 'Error al subir el logo' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleDeleteLogo = async () => {
    if (!confirm('¿Eliminar el logo?')) return

    setUploadingLogo(true)
    try {
      const response = await fetch('/api/manager-profile/logo', {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setConfig(prev => ({ ...prev, logoUrl: '' }))
        setMessage({ type: 'success', text: 'Logo eliminado' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al eliminar el logo' })
    } finally {
      setUploadingLogo(false)
    }
  }

  if (loading) {
    return <AnimatedLoadingSpinner text="Cargando perfil..." type="general" />
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
                <h1 className="text-2xl font-bold text-gray-900">Mi Empresa</h1>
                <p className="text-sm text-gray-600">
                  Datos fiscales y logo para las facturas
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
                    Logo de la empresa
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
                        {uploadingLogo ? 'Subiendo...' : 'Subir logo'}
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG o SVG. Máximo 2MB.
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
                    Datos fiscales
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre o razón social *
                      </label>
                      <input
                        type="text"
                        required
                        value={config.businessName}
                        onChange={(e) => setConfig(prev => ({ ...prev, businessName: e.target.value }))}
                        placeholder="Mi Empresa S.L."
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        NIF/CIF *
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={config.nif}
                          onChange={(e) => setConfig(prev => ({ ...prev, nif: e.target.value.toUpperCase() }))}
                          placeholder="B12345678"
                          className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        País
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
                        Dirección *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={config.address}
                          onChange={(e) => setConfig(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Calle Principal 123"
                          className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        required
                        value={config.city}
                        onChange={(e) => setConfig(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Madrid"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código postal *
                      </label>
                      <input
                        type="text"
                        required
                        value={config.postalCode}
                        onChange={(e) => setConfig(prev => ({ ...prev, postalCode: e.target.value }))}
                        placeholder="28001"
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
                    Contacto
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={config.email}
                          onChange={(e) => setConfig(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="info@miempresa.com"
                          className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          value={config.phone}
                          onChange={(e) => setConfig(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+34 600 000 000"
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
                    Notas en facturas
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Texto adicional para el pie de facturas
                    </label>
                    <textarea
                      value={config.footerNotes || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, footerNotes: e.target.value }))}
                      placeholder="Ej: Forma de pago: transferencia bancaria a ES12 1234 5678 9012 3456"
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
                    Métodos de cobro
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Configura los métodos de pago que aparecerán en tus facturas
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
                            <span className="font-medium text-gray-900">Transferencia bancaria</span>
                            <p className="text-xs text-gray-500">Recibe pagos mediante transferencia</p>
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
                              Banco
                            </label>
                            <input
                              type="text"
                              value={config.bankName || ''}
                              onChange={(e) => setConfig(prev => ({ ...prev, bankName: e.target.value }))}
                              placeholder="Banco Santander"
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              IBAN *
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={config.iban ? formatIBAN(config.iban) : ''}
                                onChange={(e) => {
                                  const value = e.target.value.toUpperCase().replace(/\s/g, '')
                                  setConfig(prev => ({ ...prev, iban: value }))

                                  // Validate IBAN
                                  if (value.length > 4) {
                                    const result = validateIBAN(value)
                                    setIbanValid(result.valid)
                                    setIbanError(result.valid ? null : result.error || null)
                                  } else {
                                    setIbanValid(false)
                                    setIbanError(null)
                                  }
                                }}
                                placeholder="ES12 1234 5678 9012 3456"
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
                              <p className="mt-1 text-xs text-green-600">IBAN válido</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              BIC/SWIFT
                            </label>
                            <input
                              type="text"
                              value={config.bic || ''}
                              onChange={(e) => setConfig(prev => ({ ...prev, bic: e.target.value.toUpperCase() }))}
                              placeholder="BSCHESMM"
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
                            <span className="font-medium text-gray-900">Bizum</span>
                            <p className="text-xs text-gray-500">Pago instantáneo móvil</p>
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
                            Teléfono Bizum *
                          </label>
                          <div className="relative max-w-xs">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="tel"
                              value={config.bizumPhone || ''}
                              onChange={(e) => setConfig(prev => ({ ...prev, bizumPhone: e.target.value }))}
                              placeholder="+34 600 000 000"
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
                            <span className="font-medium text-gray-900">PayPal</span>
                            <p className="text-xs text-gray-500">Pago online internacional</p>
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
                            Email PayPal *
                          </label>
                          <div className="relative max-w-md">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="email"
                              value={config.paypalEmail || ''}
                              onChange={(e) => setConfig(prev => ({ ...prev, paypalEmail: e.target.value }))}
                              placeholder="pagos@miempresa.com"
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
                            <span className="font-medium text-gray-900">Efectivo</span>
                            <p className="text-xs text-gray-500">Pago en metálico</p>
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
                            <span className="font-medium text-gray-900">Tarjeta</span>
                            <p className="text-xs text-gray-500">Débito o crédito</p>
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
                          Método predeterminado
                        </label>
                        <select
                          value={config.defaultPaymentMethod || ''}
                          onChange={(e) => setConfig(prev => ({ ...prev, defaultPaymentMethod: e.target.value }))}
                          className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                          <option value="">Seleccionar...</option>
                          {config.paymentMethods?.filter(m => m.enabled).map(m => (
                            <option key={m.type} value={m.type}>
                              {m.type === 'TRANSFER' && 'Transferencia bancaria'}
                              {m.type === 'BIZUM' && 'Bizum'}
                              {m.type === 'PAYPAL' && 'PayPal'}
                              {m.type === 'CASH' && 'Efectivo'}
                              {m.type === 'CARD' && 'Tarjeta'}
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
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </motion.div>
          </form>
        </div>
      </main>

      <DashboardFooter />
    </div>
  )
}
