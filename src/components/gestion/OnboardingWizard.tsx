'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  X,
  ChevronRight,
  ChevronLeft,
  Building2,
  Users,
  Home,
  CreditCard,
  Settings,
  Check,
  Sparkles,
  ArrowRight,
  Percent,
  FileText
} from 'lucide-react'
import { Button } from '../ui'

interface OnboardingWizardProps {
  onComplete: () => void
  onDismiss: () => void
}

interface OnboardingData {
  // Company
  businessName: string
  nif: string
  address: string
  city: string
  postalCode: string
  email: string
  phone: string
  // Payment
  iban: string
  bizumPhone: string
  paypalEmail: string
  // Client
  clientType: 'PERSONA_FISICA' | 'EMPRESA'
  clientFirstName: string
  clientLastName: string
  clientCompanyName: string
  clientNif: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  clientCity: string
  clientPostalCode: string
  // Property (will use existing or create new)
  selectedPropertyId: string
  createNewProperty: boolean
  newPropertyName: string
  newPropertyStreet: string
  newPropertyCity: string
  newPropertyPostalCode: string
  newPropertyType: 'APARTMENT' | 'HOUSE' | 'ROOM' | 'VILLA'
  newPropertyBedrooms: string
  newPropertyBathrooms: string
  newPropertyMaxGuests: string
  // Commission
  commissionType: 'PERCENTAGE' | 'FIXED_PER_RESERVATION'
  commissionValue: string
  commissionVat: string
}

const STEPS = [
  { id: 'welcome', title: 'Bienvenido', icon: Sparkles },
  { id: 'company', title: 'Tu empresa', icon: Building2 },
  { id: 'payment', title: 'Cobros', icon: CreditCard },
  { id: 'client', title: 'Primer cliente', icon: Users },
  { id: 'property', title: 'Propiedad', icon: Home },
  { id: 'commission', title: 'Comisiones', icon: Percent },
  { id: 'complete', title: 'Listo', icon: Check }
]

export function OnboardingWizard({ onComplete, onDismiss }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [properties, setProperties] = useState<any[]>([])
  const [createdClientId, setCreatedClientId] = useState<string | null>(null)
  const [createdConfigId, setCreatedConfigId] = useState<string | null>(null)

  const [data, setData] = useState<OnboardingData>({
    businessName: '',
    nif: '',
    address: '',
    city: '',
    postalCode: '',
    email: '',
    phone: '',
    iban: '',
    bizumPhone: '',
    paypalEmail: '',
    clientType: 'PERSONA_FISICA',
    clientFirstName: '',
    clientLastName: '',
    clientCompanyName: '',
    clientNif: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientCity: '',
    clientPostalCode: '',
    selectedPropertyId: '',
    createNewProperty: false,
    newPropertyName: '',
    newPropertyStreet: '',
    newPropertyCity: '',
    newPropertyPostalCode: '',
    newPropertyType: 'APARTMENT',
    newPropertyBedrooms: '1',
    newPropertyBathrooms: '1',
    newPropertyMaxGuests: '4',
    commissionType: 'PERCENTAGE',
    commissionValue: '15',
    commissionVat: '21'
  })

  // Load existing data if any
  useEffect(() => {
    loadExistingData()
  }, [])

  const loadExistingData = async () => {
    try {
      // Load manager config
      const configRes = await fetch('/api/manager-profile', { credentials: 'include' })
      if (configRes.ok) {
        const configData = await configRes.json()
        if (configData.config) {
          setData(prev => ({
            ...prev,
            businessName: configData.config.businessName || '',
            nif: configData.config.nif || '',
            address: configData.config.address || '',
            city: configData.config.city || '',
            postalCode: configData.config.postalCode || '',
            email: configData.config.email || '',
            phone: configData.config.phone || '',
            iban: configData.config.iban || '',
            bizumPhone: configData.config.bizumPhone || '',
            paypalEmail: configData.config.paypalEmail || ''
          }))
        }
      }

      // Load properties
      const propsRes = await fetch('/api/gestion/properties-simple', { credentials: 'include' })
      if (propsRes.ok) {
        const propsData = await propsRes.json()
        setProperties(propsData.properties || [])
        // Auto-select first property without config
        const unconfigured = propsData.properties?.find((p: any) => !p.billingConfigId)
        if (unconfigured) {
          setData(prev => ({ ...prev, selectedPropertyId: unconfigured.id }))
        }
      }
    } catch (err) {
      console.error('Error loading data:', err)
    }
  }

  const handleNext = async () => {
    setError(null)

    const step = STEPS[currentStep].id

    // Validate and save each step
    if (step === 'company') {
      if (!data.businessName.trim()) {
        setError('El nombre de empresa es obligatorio')
        return
      }
      if (!data.nif.trim()) {
        setError('El NIF/CIF es obligatorio')
        return
      }
      if (!data.address.trim()) {
        setError('La dirección fiscal es obligatoria')
        return
      }
      if (!data.city.trim()) {
        setError('La ciudad es obligatoria')
        return
      }
      if (!data.postalCode.trim()) {
        setError('El código postal es obligatorio')
        return
      }
      setSaving(true)
      try {
        const res = await fetch('/api/manager-profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            businessName: data.businessName,
            nif: data.nif,
            address: data.address,
            city: data.city,
            postalCode: data.postalCode,
            email: data.email,
            phone: data.phone
          })
        })
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || 'Error al guardar')
        }
      } catch (err: any) {
        setError(err.message)
        setSaving(false)
        return
      }
      setSaving(false)
    }

    if (step === 'payment') {
      setSaving(true)
      try {
        // Build payment methods array
        const paymentMethods = [
          { type: 'TRANSFER', enabled: !!data.iban, label: 'Transferencia bancaria' },
          { type: 'BIZUM', enabled: !!data.bizumPhone, label: 'Bizum' },
          { type: 'PAYPAL', enabled: !!data.paypalEmail, label: 'PayPal' },
          { type: 'CASH', enabled: false, label: 'Efectivo' },
          { type: 'CARD', enabled: false, label: 'Tarjeta' },
          { type: 'DIRECT_DEBIT', enabled: false, label: 'Domiciliación SEPA' }
        ]
        // Determine default payment method
        let defaultPaymentMethod = 'TRANSFER'
        if (data.iban) defaultPaymentMethod = 'TRANSFER'
        else if (data.bizumPhone) defaultPaymentMethod = 'BIZUM'
        else if (data.paypalEmail) defaultPaymentMethod = 'PAYPAL'

        const res = await fetch('/api/manager-profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            // Include company data (required by API)
            businessName: data.businessName,
            nif: data.nif,
            address: data.address || 'Sin especificar',
            city: data.city || 'Sin especificar',
            postalCode: data.postalCode || '00000',
            email: data.email,
            phone: data.phone,
            // Payment data
            iban: data.iban,
            bizumPhone: data.bizumPhone,
            paypalEmail: data.paypalEmail,
            paymentMethods,
            defaultPaymentMethod
          })
        })
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || 'Error al guardar método de pago')
        }
      } catch (err: any) {
        setError(err.message)
        setSaving(false)
        return
      }
      setSaving(false)
    }

    if (step === 'client') {
      if (data.clientType === 'PERSONA_FISICA' && (!data.clientFirstName || !data.clientLastName)) {
        setError('Nombre y apellidos son obligatorios')
        return
      }
      if (data.clientType === 'EMPRESA' && !data.clientCompanyName) {
        setError('Nombre de empresa es obligatorio')
        return
      }
      if (!data.clientEmail) {
        setError('El email es obligatorio')
        return
      }
      if (!data.clientAddress || !data.clientCity || !data.clientPostalCode) {
        setError('La dirección fiscal completa es obligatoria')
        return
      }

      setSaving(true)
      try {
        const res = await fetch('/api/gestion/owners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            type: data.clientType,
            firstName: data.clientFirstName,
            lastName: data.clientLastName,
            companyName: data.clientCompanyName,
            nif: data.clientType === 'PERSONA_FISICA' ? data.clientNif : undefined,
            cif: data.clientType === 'EMPRESA' ? data.clientNif : undefined,
            email: data.clientEmail,
            phone: data.clientPhone,
            address: data.clientAddress,
            city: data.clientCity,
            postalCode: data.clientPostalCode
          })
        })
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || 'Error al crear cliente')
        }
        const resData = await res.json()
        setCreatedClientId(resData.owner?.id)
      } catch (err: any) {
        setError(err.message)
        setSaving(false)
        return
      }
      setSaving(false)
    }

    if (step === 'property') {
      if (data.createNewProperty) {
        // Validate new property fields
        if (!data.newPropertyName.trim()) {
          setError('El nombre de la propiedad es obligatorio')
          return
        }
        if (!data.newPropertyStreet.trim()) {
          setError('La dirección es obligatoria')
          return
        }
        if (!data.newPropertyCity.trim()) {
          setError('La ciudad es obligatoria')
          return
        }
        if (!data.newPropertyPostalCode.trim()) {
          setError('El código postal es obligatorio')
          return
        }

        setSaving(true)
        try {
          const res = await fetch('/api/gestion/properties-quick', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              name: data.newPropertyName,
              street: data.newPropertyStreet,
              city: data.newPropertyCity,
              postalCode: data.newPropertyPostalCode,
              type: data.newPropertyType,
              bedrooms: parseInt(data.newPropertyBedrooms) || 1,
              bathrooms: parseInt(data.newPropertyBathrooms) || 1,
              maxGuests: parseInt(data.newPropertyMaxGuests) || 4
            })
          })
          if (!res.ok) {
            const errData = await res.json()
            throw new Error(errData.error || 'Error al crear propiedad')
          }
          const resData = await res.json()
          // Set the new property as selected
          const newPropertyId = resData.property?.id
          setData(prev => ({ ...prev, selectedPropertyId: newPropertyId }))
          // Add to properties list
          setProperties(prev => [...prev, { id: newPropertyId, name: data.newPropertyName, address: data.newPropertyStreet }])
        } catch (err: any) {
          setError(err.message)
          setSaving(false)
          return
        }
        setSaving(false)
      } else if (!data.selectedPropertyId) {
        setError('Selecciona una propiedad o crea una nueva')
        return
      }
    }

    if (step === 'commission') {
      if (!createdClientId) {
        setError('Primero debes crear un cliente')
        return
      }
      if (!data.selectedPropertyId) {
        setError('Selecciona una propiedad')
        return
      }

      setSaving(true)
      try {
        const res = await fetch('/api/gestion/properties-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            propertyId: data.selectedPropertyId,
            ownerId: createdClientId,
            commissionType: data.commissionType,
            commissionValue: parseFloat(data.commissionValue) || 15,
            commissionVat: parseFloat(data.commissionVat) || 21
          })
        })
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || 'Error al configurar')
        }
        const resData = await res.json()
        setCreatedConfigId(resData.config?.id)
      } catch (err: any) {
        setError(err.message)
        setSaving(false)
        return
      }
      setSaving(false)
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }

  const handleSkipOnboarding = async () => {
    // Register that user saw onboarding but skipped (for reminder email)
    try {
      await fetch('/api/gestion/onboarding-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'skipped' })
      })
    } catch (e) {
      // Silently fail
    }
    onDismiss()
  }

  const renderStepContent = () => {
    const step = STEPS[currentStep].id

    if (step === 'welcome') {
      return (
        <div className="text-center py-6">
          <div className="w-24 h-24 bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg p-4">
            <Image
              src="/isotipo-itineramio.svg"
              alt="Itineramio"
              width={80}
              height={44}
              className="w-full h-auto"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bienvenido a Itineramio Gestión
          </h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            El módulo de <strong>gestión económica</strong> de Itineramio.
            Gestiona propietarios, importa reservas y genera facturas y liquidaciones automáticamente.
          </p>
          <div className="bg-violet-50 rounded-xl p-4 max-w-sm mx-auto mb-4">
            <p className="text-sm text-violet-700">
              <strong>En 5 minutos</strong> tendrás todo configurado para empezar a facturar.
            </p>
          </div>
          <button
            onClick={handleSkipOnboarding}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Prefiero hacerlo más tarde
          </button>
        </div>
      )
    }

    if (step === 'company') {
      return (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <Building2 className="w-12 h-12 text-violet-600 mx-auto mb-2" />
            <h2 className="text-xl font-bold text-gray-900">Tu empresa</h2>
            <p className="text-gray-600 text-sm">Estos datos aparecerán en tus facturas</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de empresa / Autónomo *
              </label>
              <input
                type="text"
                value={data.businessName}
                onChange={(e) => setData({ ...data, businessName: e.target.value })}
                placeholder="Mi Empresa S.L."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIF/CIF *
              </label>
              <input
                type="text"
                value={data.nif}
                onChange={(e) => setData({ ...data, nif: e.target.value.toUpperCase() })}
                placeholder="B12345678"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                placeholder="600 123 456"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección fiscal *
              </label>
              <input
                type="text"
                value={data.address}
                onChange={(e) => setData({ ...data, address: e.target.value })}
                placeholder="Calle Principal 123"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad *
              </label>
              <input
                type="text"
                value={data.city}
                onChange={(e) => setData({ ...data, city: e.target.value })}
                placeholder="Madrid"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código Postal *
              </label>
              <input
                type="text"
                value={data.postalCode}
                onChange={(e) => setData({ ...data, postalCode: e.target.value })}
                placeholder="28001"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email de facturación
              </label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                placeholder="facturacion@miempresa.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        </div>
      )
    }

    if (step === 'payment') {
      return (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <CreditCard className="w-12 h-12 text-violet-600 mx-auto mb-2" />
            <h2 className="text-xl font-bold text-gray-900">¿Cómo cobras?</h2>
            <p className="text-gray-600 text-sm">Configura tus métodos de pago (al menos uno)</p>
          </div>

          {/* Transferencia bancaria */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏦 Transferencia bancaria
            </label>
            <input
              type="text"
              value={data.iban}
              onChange={(e) => setData({ ...data, iban: e.target.value.toUpperCase().replace(/\s/g, '') })}
              placeholder="ES00 0000 0000 0000 0000 0000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              IBAN de tu cuenta bancaria
            </p>
          </div>

          {/* Bizum */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📱 Bizum
            </label>
            <input
              type="tel"
              value={data.bizumPhone}
              onChange={(e) => setData({ ...data, bizumPhone: e.target.value.replace(/\s/g, '') })}
              placeholder="600 123 456"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Teléfono asociado a tu Bizum
            </p>
          </div>

          {/* PayPal */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💳 PayPal
            </label>
            <input
              type="email"
              value={data.paypalEmail}
              onChange={(e) => setData({ ...data, paypalEmail: e.target.value })}
              placeholder="tu@email.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email de tu cuenta PayPal
            </p>
          </div>

          <div className="bg-violet-50 rounded-lg p-3 text-center">
            <p className="text-xs text-violet-700">
              Los métodos configurados aparecerán en tus facturas
            </p>
          </div>
        </div>
      )
    }

    if (step === 'client') {
      return (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <Users className="w-12 h-12 text-violet-600 mx-auto mb-2" />
            <h2 className="text-xl font-bold text-gray-900">Tu primer cliente</h2>
            <p className="text-gray-600 text-sm">El propietario del apartamento al que facturarás</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de cliente</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setData({ ...data, clientType: 'PERSONA_FISICA' })}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  data.clientType === 'PERSONA_FISICA'
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-sm font-medium">Particular</span>
              </button>
              <button
                type="button"
                onClick={() => setData({ ...data, clientType: 'EMPRESA' })}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  data.clientType === 'EMPRESA'
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-sm font-medium">Empresa</span>
              </button>
            </div>
          </div>

          {data.clientType === 'PERSONA_FISICA' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={data.clientFirstName}
                  onChange={(e) => setData({ ...data, clientFirstName: e.target.value })}
                  placeholder="Juan"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                <input
                  type="text"
                  value={data.clientLastName}
                  onChange={(e) => setData({ ...data, clientLastName: e.target.value })}
                  placeholder="García López"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIF</label>
                <input
                  type="text"
                  value={data.clientNif}
                  onChange={(e) => setData({ ...data, clientNif: e.target.value.toUpperCase() })}
                  placeholder="12345678A"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={data.clientEmail}
                  onChange={(e) => setData({ ...data, clientEmail: e.target.value })}
                  placeholder="cliente@email.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={data.clientPhone}
                  onChange={(e) => setData({ ...data, clientPhone: e.target.value })}
                  placeholder="600 123 456"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección fiscal *</label>
                <input
                  type="text"
                  value={data.clientAddress}
                  onChange={(e) => setData({ ...data, clientAddress: e.target.value })}
                  placeholder="Calle Principal 123"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                <input
                  type="text"
                  value={data.clientCity}
                  onChange={(e) => setData({ ...data, clientCity: e.target.value })}
                  placeholder="Madrid"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">C.P. *</label>
                <input
                  type="text"
                  value={data.clientPostalCode}
                  onChange={(e) => setData({ ...data, clientPostalCode: e.target.value })}
                  placeholder="28001"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social *</label>
                <input
                  type="text"
                  value={data.clientCompanyName}
                  onChange={(e) => setData({ ...data, clientCompanyName: e.target.value })}
                  placeholder="Inversiones García S.L."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CIF</label>
                <input
                  type="text"
                  value={data.clientNif}
                  onChange={(e) => setData({ ...data, clientNif: e.target.value.toUpperCase() })}
                  placeholder="B12345678"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={data.clientEmail}
                  onChange={(e) => setData({ ...data, clientEmail: e.target.value })}
                  placeholder="admin@empresa.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={data.clientPhone}
                  onChange={(e) => setData({ ...data, clientPhone: e.target.value })}
                  placeholder="600 123 456"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección fiscal *</label>
                <input
                  type="text"
                  value={data.clientAddress}
                  onChange={(e) => setData({ ...data, clientAddress: e.target.value })}
                  placeholder="Calle Principal 123"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                <input
                  type="text"
                  value={data.clientCity}
                  onChange={(e) => setData({ ...data, clientCity: e.target.value })}
                  placeholder="Madrid"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">C.P. *</label>
                <input
                  type="text"
                  value={data.clientPostalCode}
                  onChange={(e) => setData({ ...data, clientPostalCode: e.target.value })}
                  placeholder="28001"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          )}
        </div>
      )
    }

    if (step === 'property') {
      const unconfiguredProperties = properties.filter(p => !p.billingConfigId)

      return (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <Home className="w-12 h-12 text-violet-600 mx-auto mb-2" />
            <h2 className="text-xl font-bold text-gray-900">Selecciona propiedad</h2>
            <p className="text-gray-600 text-sm">Elige qué propiedad gestionas para este cliente</p>
          </div>

          {/* Toggle: Select existing or create new */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setData({ ...data, createNewProperty: false })}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                !data.createNewProperty
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Seleccionar existente
            </button>
            <button
              type="button"
              onClick={() => setData({ ...data, createNewProperty: true, selectedPropertyId: '' })}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                data.createNewProperty
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Crear nueva
            </button>
          </div>

          {data.createNewProperty ? (
            /* Create new property form */
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la propiedad *
                </label>
                <input
                  type="text"
                  value={data.newPropertyName}
                  onChange={(e) => setData({ ...data, newPropertyName: e.target.value })}
                  placeholder="Apartamento Centro Madrid"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select
                  value={data.newPropertyType}
                  onChange={(e) => setData({ ...data, newPropertyType: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="APARTMENT">Apartamento</option>
                  <option value="HOUSE">Casa</option>
                  <option value="VILLA">Villa</option>
                  <option value="ROOM">Habitación</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección *
                </label>
                <input
                  type="text"
                  value={data.newPropertyStreet}
                  onChange={(e) => setData({ ...data, newPropertyStreet: e.target.value })}
                  placeholder="Calle Gran Vía 123"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                  <input
                    type="text"
                    value={data.newPropertyCity}
                    onChange={(e) => setData({ ...data, newPropertyCity: e.target.value })}
                    placeholder="Madrid"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">C.P. *</label>
                  <input
                    type="text"
                    value={data.newPropertyPostalCode}
                    onChange={(e) => setData({ ...data, newPropertyPostalCode: e.target.value })}
                    placeholder="28001"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Habitaciones</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={data.newPropertyBedrooms}
                    onChange={(e) => setData({ ...data, newPropertyBedrooms: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Baños</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={data.newPropertyBathrooms}
                    onChange={(e) => setData({ ...data, newPropertyBathrooms: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Huéspedes</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={data.newPropertyMaxGuests}
                    onChange={(e) => setData({ ...data, newPropertyMaxGuests: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Select existing property */
            <>
              {unconfiguredProperties.length === 0 ? (
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <p className="text-amber-700 mb-2">
                    No tienes propiedades disponibles.
                  </p>
                  <p className="text-sm text-amber-600 mb-3">
                    Todas tus propiedades ya tienen propietario asignado.
                  </p>
                  <button
                    type="button"
                    onClick={() => setData({ ...data, createNewProperty: true })}
                    className="text-sm text-violet-600 font-medium hover:text-violet-700"
                  >
                    → Crear una propiedad nueva
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {unconfiguredProperties.map((prop) => (
                    <button
                      key={prop.id}
                      type="button"
                      onClick={() => setData({ ...data, selectedPropertyId: prop.id })}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        data.selectedPropertyId === prop.id
                          ? 'border-violet-500 bg-violet-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Home className={`w-5 h-5 ${data.selectedPropertyId === prop.id ? 'text-violet-600' : 'text-gray-400'}`} />
                        <div>
                          <p className="font-medium text-gray-900">{prop.name}</p>
                          {prop.address && <p className="text-sm text-gray-500">{prop.address}</p>}
                        </div>
                        {data.selectedPropertyId === prop.id && (
                          <Check className="w-5 h-5 text-violet-600 ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )
    }

    if (step === 'commission') {
      return (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <Percent className="w-12 h-12 text-violet-600 mx-auto mb-2" />
            <h2 className="text-xl font-bold text-gray-900">Define tu comisión</h2>
            <p className="text-gray-600 text-sm">¿Cuánto cobras por gestionar esta propiedad?</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de comisión</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setData({ ...data, commissionType: 'PERCENTAGE' })}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  data.commissionType === 'PERCENTAGE'
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Percent className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <span className="text-sm font-medium">Porcentaje</span>
              </button>
              <button
                type="button"
                onClick={() => setData({ ...data, commissionType: 'FIXED_PER_RESERVATION' })}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  data.commissionType === 'FIXED_PER_RESERVATION'
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <span className="text-sm font-medium">Fijo/reserva</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {data.commissionType === 'PERCENTAGE' ? 'Porcentaje (%)' : 'Importe fijo (€)'}
              </label>
              <input
                type="number"
                value={data.commissionValue}
                onChange={(e) => setData({ ...data, commissionValue: e.target.value })}
                placeholder={data.commissionType === 'PERCENTAGE' ? '15' : '25'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IVA comisión (%)
              </label>
              <input
                type="number"
                value={data.commissionVat}
                onChange={(e) => setData({ ...data, commissionVat: e.target.value })}
                placeholder="21"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <strong>Ejemplo:</strong> Si una reserva genera 1.000€ y tu comisión es del {data.commissionValue || 15}%,
              facturarás {(1000 * (parseFloat(data.commissionValue) || 15) / 100).toFixed(2)}€ + IVA al propietario.
            </p>
          </div>
        </div>
      )
    }

    if (step === 'complete') {
      return (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            ¡Todo listo!
          </h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Has configurado tu empresa, método de cobro, tu primer cliente y su propiedad con comisiones.
          </p>
          <div className="bg-green-50 rounded-xl p-4 max-w-sm mx-auto mb-6">
            <p className="text-sm text-green-700">
              Ya puedes empezar a <strong>generar facturas</strong> para tus propietarios.
            </p>
          </div>
          <Button
            onClick={onComplete}
            className="bg-violet-600 hover:bg-violet-700"
          >
            Ir al Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )
    }

    return null
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header with progress */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">
              Paso {currentStep + 1} de {STEPS.length}
            </span>
            <button
              onClick={handleSkipOnboarding}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex gap-1">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  idx <= currentStep ? 'bg-violet-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer with navigation */}
        {STEPS[currentStep].id !== 'complete' && (
          <div className="p-4 border-t border-gray-100 flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={currentStep === 0 ? 'invisible' : ''}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Atrás
            </Button>
            <Button
              onClick={handleNext}
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {saving ? 'Guardando...' : STEPS[currentStep].id === 'welcome' ? 'Empezar' : 'Siguiente'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
