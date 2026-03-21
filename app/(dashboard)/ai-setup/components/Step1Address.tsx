'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Home,
  Building2,
  BedDouble,
  Bath,
  Users,
  Wifi,
  Key,
  Clock,
  Car,
  Waves,
  Snowflake,
  ChevronRight,
  Sparkles,
  User,
  Phone,
  Mail,
  Globe,
  PenLine,
  Camera,
  Ruler,
  FileText,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Link,
  AlertCircle,
  X,
} from 'lucide-react'
import { AddressAutocomplete } from '../../../../src/components/ui/AddressAutocomplete'
import { ImageUpload } from '../../../../src/components/ui/ImageUpload'

export interface Step1Data {
  // Property name
  propertyName: string
  propertyDescription: string
  profileImage: string
  // Address
  street: string
  city: string
  state: string
  country: string
  postalCode: string
  lat?: number
  lng?: number
  formattedAddress: string
  // Property info
  propertyType: 'APARTMENT' | 'HOUSE' | 'VILLA' | 'ROOM'
  bedrooms: number
  bathrooms: number
  maxGuests: number
  squareMeters: number
  // WiFi
  wifiName: string
  wifiPassword: string
  // Check-in/out
  checkInTime: string
  checkInMethod: 'key' | 'lockbox' | 'code' | 'in-person' | 'app'
  checkInInstructions: string
  checkOutTime: string
  // Amenities
  hasParking: 'yes' | 'no' | 'nearby'
  hasPool: boolean
  hasAC: boolean
  // Host contact
  hostContactName: string
  hostContactPhone: string
  hostContactEmail: string
  hostContactLanguage: string
  hostContactPhoto: string
}

interface AirbnbImportResult {
  importing: boolean
  imported: boolean
  error: string | null
  importedFields: string[]
}

interface Step1AddressProps {
  data: Step1Data
  onChange: (data: Step1Data) => void
  onNext: () => void
  uploadEndpoint?: string
  onAirbnbImport?: (url: string) => Promise<void>
  airbnbImport?: AirbnbImportResult
}

export default function Step1Address({ data, onChange, onNext, uploadEndpoint, onAirbnbImport, airbnbImport }: Step1AddressProps) {
  const [showValidationModal, setShowValidationModal] = React.useState(false)
  const { t } = useTranslation('ai-setup')
  const [showErrors, setShowErrors] = React.useState(false)
  const [airbnbUrl, setAirbnbUrl] = React.useState('')

  const isValidAirbnbUrl = /airbnb\.\w+\/rooms\/\d+/.test(airbnbUrl)

  const update = (partial: Partial<Step1Data>) => {
    onChange({ ...data, ...partial })
  }

  const missingFields = {
    propertyName: !data.propertyName,
    street: !data.street && !data.city,
    propertyType: !data.propertyType,
    maxGuests: data.maxGuests < 1,
    hostContactName: !data.hostContactName,
    hostContactPhone: !data.hostContactPhone,
    hostContactEmail: !data.hostContactEmail,
  }

  const missingCount = Object.values(missingFields).filter(Boolean).length

  const importedFieldSet = new Set(airbnbImport?.importedFields || [])

  const errorBorder = (field: keyof typeof missingFields) =>
    showErrors && missingFields[field] ? 'border-red-500 ring-1 ring-red-500/50' : 'border-gray-200'

  const importedBorder = (field: string) =>
    importedFieldSet.has(field) ? 'border-violet-500/40 ring-1 ring-violet-500/20' : 'border-gray-200'

  const fieldBorder = (field: string, errorField?: keyof typeof missingFields) => {
    if (errorField && showErrors && missingFields[errorField]) return 'border-red-500 ring-1 ring-red-500/50'
    if (importedFieldSet.has(field)) return 'border-violet-500/40 ring-1 ring-violet-500/20'
    return 'border-gray-200'
  }

  const hasAddressWithoutCoordinates = !!(data.formattedAddress && !data.lat && !data.lng)

  const handleNext = () => {
    if (!isValid || hasAddressWithoutCoordinates) {
      setShowErrors(true)
      if (!isValid) setShowValidationModal(true)
      return
    }
    setShowErrors(false)
    onNext()
  }

  const handleModalClose = () => {
    setShowValidationModal(false)
    setTimeout(() => {
      const firstError = document.querySelector('[data-error="true"]')
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 150)
  }

  const missingFieldLabels: Record<keyof typeof missingFields, string> = {
    propertyName: 'Nombre del alojamiento',
    street: 'Dirección',
    propertyType: 'Tipo de alojamiento',
    maxGuests: 'Número de huéspedes',
    hostContactName: 'Tu nombre',
    hostContactPhone: 'Teléfono de contacto',
    hostContactEmail: 'Email de contacto',
  }

  const propertyTypes = [
    { value: 'APARTMENT' as const, label: t('step1.types.apartment'), icon: Building2 },
    { value: 'HOUSE' as const, label: t('step1.types.house'), icon: Home },
    { value: 'VILLA' as const, label: t('step1.types.villa'), icon: Sparkles },
    { value: 'ROOM' as const, label: t('step1.types.room'), icon: BedDouble },
  ]

  const checkInMethods = [
    { value: 'key' as const, label: t('step1.methods.key') },
    { value: 'lockbox' as const, label: t('step1.methods.lockbox') },
    { value: 'code' as const, label: t('step1.methods.code') },
    { value: 'in-person' as const, label: t('step1.methods.inPerson') },
    { value: 'app' as const, label: t('step1.methods.app') },
  ]

  const parkingOptions = [
    { value: 'yes' as const, label: t('step1.parkingYes') },
    { value: 'nearby' as const, label: t('step1.parkingNearby') },
    { value: 'no' as const, label: t('step1.parkingNo') },
  ]

  const languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
  ]

  const isValid =
    data.propertyName &&
    data.street &&
    data.city &&
    data.propertyType &&
    data.bedrooms >= 0 &&
    data.bathrooms >= 0 &&
    data.maxGuests >= 1 &&
    data.hostContactName &&
    data.hostContactPhone &&
    data.hostContactEmail

  return (
    <>
    {/* Validation modal */}
    <AnimatePresence>
      {showValidationModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) handleModalClose() }}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full sm:max-w-sm bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Faltan campos obligatorios</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Completa estos campos para continuar</p>
                </div>
              </div>
              <button onClick={handleModalClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Missing fields list */}
            <div className="px-5 pb-3 space-y-1.5">
              {(Object.entries(missingFields) as [keyof typeof missingFields, boolean][])
                .filter(([, missing]) => missing)
                .map(([field]) => (
                  <div key={field} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-red-50 border border-red-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    <span className="text-sm text-red-700 font-medium">{missingFieldLabels[field]}</span>
                  </div>
                ))
              }
            </div>

            {/* CTA */}
            <div className="px-5 pb-5 pt-2">
              <button
                onClick={handleModalClose}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-purple-500 transition-all"
              >
                Entendido, voy a completarlos
              </button>
            </div>
            <div className="h-safe-area-inset-bottom sm:hidden" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
        >
          {t('step1.title')}
        </motion.h2>
        <p className="text-gray-500 text-sm sm:text-base">{t('step1.subtitle')}</p>
      </div>

      {/* Airbnb Import Section */}
      {onAirbnbImport && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden rounded-xl bg-violet-50 border border-violet-200 p-4 sm:p-5"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-gray-900">
                {t('step1.airbnbImport.title', { defaultValue: '¿Tienes un anuncio en Airbnb?' })}
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">AUTO</span>
            </div>
            <p className="text-xs text-gray-500">
              {t('step1.airbnbImport.subtitle', { defaultValue: 'Pega el enlace y completaremos la mayoría de datos automáticamente' })}
            </p>

            <div className="flex gap-2">
              <input
                type="url"
                value={airbnbUrl}
                onChange={(e) => setAirbnbUrl(e.target.value)}
                placeholder="https://www.airbnb.es/rooms/..."
                disabled={airbnbImport?.importing}
                className="flex-1 h-10 rounded-lg border border-gray-200 bg-white px-3 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => isValidAirbnbUrl && onAirbnbImport(airbnbUrl)}
                disabled={!isValidAirbnbUrl || airbnbImport?.importing}
                className={`h-10 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                  isValidAirbnbUrl && !airbnbImport?.importing
                    ? 'bg-violet-600 text-white hover:bg-violet-500'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {airbnbImport?.importing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">
                      {t('step1.airbnbImport.importing', { defaultValue: 'Importando...' })}
                    </span>
                  </>
                ) : (
                  t('step1.airbnbImport.button', { defaultValue: 'Importar' })
                )}
              </button>
            </div>

            {/* Success message */}
            {airbnbImport?.imported && !airbnbImport?.importing && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200"
              >
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-emerald-800 font-medium">
                    {t('step1.airbnbImport.success', { defaultValue: 'Datos importados correctamente' })}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t('step1.airbnbImport.successHint', { defaultValue: 'Revisa los campos y completa los que falten (WiFi, contacto, etc.)' })}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Error message */}
            {airbnbImport?.error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200"
              >
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{airbnbImport.error}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Property Name + Profile Image */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
        {/* Profile Image */}
        <div className="flex-shrink-0 space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Camera className="w-4 h-4 mr-2 text-violet-400" />
            {t('step1.mainPhoto')}
          </label>
          <ImageUpload
            value={data.profileImage}
            onChange={(url) => update({ profileImage: url || '' })}
            variant="profile"
            placeholder={t('step1.photo')}
            maxSize={10}
            {...(uploadEndpoint && { uploadEndpoint })}
          />
        </div>

        {/* Name + Description */}
        <div className="flex-1 w-full space-y-4">
          <div className="space-y-3" data-error={showErrors && missingFields.propertyName ? 'true' : undefined}>
            <label className="flex items-center text-sm font-medium text-gray-700">
              <PenLine className="w-4 h-4 mr-2 text-violet-400" />
              {t('step1.propertyName')}
            </label>
            <input
              type="text"
              value={data.propertyName}
              onChange={(e) => update({ propertyName: e.target.value })}
              placeholder={t('step1.propertyNamePlaceholder')}
              className={`h-10 w-full rounded-lg border bg-white px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 ${fieldBorder('propertyName', 'propertyName')}`}
            />
            {showErrors && missingFields.propertyName && (
              <p className="text-xs text-red-400">{t('step1.propertyName')} es obligatorio</p>
            )}
          </div>
          <div className="space-y-3">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4 mr-2 text-violet-400" />
              {t('step1.description')}
              <span className="text-gray-600 ml-2 font-normal">{t('step1.optional')}</span>
            </label>
            <textarea
              value={data.propertyDescription}
              onChange={(e) => update({ propertyDescription: e.target.value })}
              placeholder={t('step1.descriptionPlaceholder')}
              rows={2}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-3" data-error={showErrors && missingFields.street ? 'true' : undefined}>
        <label className="flex items-center text-sm font-medium text-gray-700">
          <MapPin className="w-4 h-4 mr-2 text-violet-400" />
          {t('step1.address')}
        </label>
        {showErrors && missingFields.street && (
          <p className="text-xs text-red-400">{t('step1.address')} es obligatorio</p>
        )}
        <AddressAutocomplete
          value={data.formattedAddress}
          onChange={(addr) => update({
            street: addr.street,
            city: addr.city,
            state: addr.state,
            country: addr.country,
            postalCode: addr.postalCode,
            lat: addr.lat,
            lng: addr.lng,
            formattedAddress: addr.formattedAddress,
          })}
          placeholder={t('step1.addressPlaceholder')}
        />
        {showErrors && data.formattedAddress && !data.lat && !data.lng && (
          <div className="flex items-center gap-2 text-red-500 text-xs mt-1">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Selecciona una dirección de la lista de sugerencias para continuar</span>
          </div>
        )}
        {!showErrors && data.formattedAddress && !data.lat && !data.lng && (
          <div className="flex items-center gap-2 text-amber-400 text-xs mt-1">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{t('step1.noCoordinates')}</span>
          </div>
        )}
      </div>

      {/* Property Type */}
      <div className="space-y-3" data-error={showErrors && missingFields.propertyType ? 'true' : undefined}>
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Home className="w-4 h-4 mr-2 text-violet-400" />
          {t('step1.propertyType')}
        </label>
        {showErrors && missingFields.propertyType && (
          <p className="text-xs text-red-400">Selecciona un tipo de propiedad</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {propertyTypes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => update({ propertyType: value })}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                data.propertyType === value
                  ? 'bg-violet-50 border-violet-500 text-violet-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bedrooms, Bathrooms, Max Guests & m² */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <BedDouble className="w-4 h-4 mr-2 text-violet-400" />
            {t('step1.bedrooms')}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => update({ bedrooms: Math.max(0, data.bedrooms - 1) })}
              className="w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              -
            </button>
            <span className="text-xl font-bold text-gray-900 w-6 text-center">{data.bedrooms}</span>
            <button
              type="button"
              onClick={() => update({ bedrooms: Math.min(20, data.bedrooms + 1) })}
              className="w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              +
            </button>
          </div>
        </div>
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Bath className="w-4 h-4 mr-2 text-violet-400" />
            {t('step1.bathrooms')}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => update({ bathrooms: Math.max(0, data.bathrooms - 1) })}
              className="w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              -
            </button>
            <span className="text-xl font-bold text-gray-900 w-6 text-center">{data.bathrooms}</span>
            <button
              type="button"
              onClick={() => update({ bathrooms: Math.min(10, data.bathrooms + 1) })}
              className="w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              +
            </button>
          </div>
        </div>
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Users className="w-4 h-4 mr-2 text-violet-400" />
            {t('step1.guests')}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => update({ maxGuests: Math.max(1, data.maxGuests - 1) })}
              className="w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              -
            </button>
            <span className="text-xl font-bold text-gray-900 w-6 text-center">{data.maxGuests}</span>
            <button
              type="button"
              onClick={() => update({ maxGuests: Math.min(50, data.maxGuests + 1) })}
              className="w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              +
            </button>
          </div>
        </div>
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Ruler className="w-4 h-4 mr-2 text-violet-400" />
            {t('step1.sqm')}
          </label>
          <input
            type="number"
            value={data.squareMeters || ''}
            onChange={(e) => update({ squareMeters: parseInt(e.target.value) || 0 })}
            placeholder="60"
            min={0}
            max={9999}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* WiFi */}
      <div className="space-y-3">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Wifi className="w-4 h-4 mr-2 text-violet-400" />
          {t('step1.wifi')}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            value={data.wifiName}
            onChange={(e) => update({ wifiName: e.target.value })}
            placeholder={t('step1.networkName')}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <input
            type="text"
            value={data.wifiPassword}
            onChange={(e) => update({ wifiPassword: e.target.value })}
            placeholder={t('step1.password')}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Check-in/out */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4 mr-2 text-violet-400" />
            {t('step1.checkInTime')}
          </label>
          <input
            type="time"
            value={data.checkInTime}
            onChange={(e) => update({ checkInTime: e.target.value })}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4 mr-2 text-violet-400" />
            {t('step1.checkOutTime')}
          </label>
          <input
            type="time"
            value={data.checkOutTime}
            onChange={(e) => update({ checkOutTime: e.target.value })}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Check-in method */}
      <div className="space-y-3">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <Key className="w-4 h-4 mr-2 text-violet-400" />
          {t('step1.entryMethod')}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {checkInMethods.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => update({ checkInMethod: value })}
              className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                data.checkInMethod === value
                  ? 'bg-violet-50 border-violet-500 text-violet-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Check-in instructions */}
      <div className="space-y-3">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <PenLine className="w-4 h-4 mr-2 text-violet-400" />
          {t('step1.checkInInstructions')}
        </label>
        <textarea
          value={data.checkInInstructions}
          onChange={(e) => update({ checkInInstructions: e.target.value })}
          placeholder={t('step1.checkInInstructionsPlaceholder')}
          rows={4}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
        />
        <p className="text-xs text-gray-400">
          {t('step1.checkInInstructionsHint')}
        </p>
      </div>

      {/* Amenities row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Parking */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Car className="w-4 h-4 mr-2 text-violet-400" />
            {t('step1.parking')}
          </label>
          <div className="flex flex-row sm:flex-col gap-2">
            {parkingOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => update({ hasParking: value })}
                className={`flex-1 sm:flex-none px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200 ${
                  data.hasParking === value
                    ? 'bg-violet-50 border-violet-500 text-violet-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Pool */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Waves className="w-4 h-4 mr-2 text-violet-400" />
            {t('step1.pool')}
          </label>
          <button
            type="button"
            onClick={() => update({ hasPool: !data.hasPool })}
            className={`w-full px-4 py-2.5 sm:py-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
              data.hasPool
                ? 'bg-violet-50 border-violet-500 text-violet-700'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {data.hasPool ? t('step1.yes') : t('step1.no')}
          </button>
        </div>

        {/* AC */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Snowflake className="w-4 h-4 mr-2 text-violet-400" />
            {t('step1.ac')}
          </label>
          <button
            type="button"
            onClick={() => update({ hasAC: !data.hasAC })}
            className={`w-full px-4 py-2.5 sm:py-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
              data.hasAC
                ? 'bg-violet-50 border-violet-500 text-violet-700'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {data.hasAC ? t('step1.yes') : t('step1.no')}
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 pt-2" />

      {/* Host Contact Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-violet-400" />
            {t('step1.host.title')}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{t('step1.host.subtitle')}</p>
        </div>

        {/* Photo */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="flex-shrink-0">
            <ImageUpload
              value={data.hostContactPhoto}
              onChange={(url) => update({ hostContactPhoto: url || '' })}
              variant="profile"
              placeholder={t('step1.host.yourPhoto')}
              maxSize={5}
              {...(uploadEndpoint && { uploadEndpoint })}
            />
          </div>
          <p className="text-sm text-gray-500 text-center sm:text-left">
            {t('step1.host.photoHint')}
          </p>
        </div>

        {/* Name */}
        <div className="space-y-3" data-error={showErrors && missingFields.hostContactName ? 'true' : undefined}>
          <label className="flex items-center text-sm font-medium text-gray-700">
            <User className="w-4 h-4 mr-2 text-violet-400" />
            {t('step1.host.fullName')}
          </label>
          <input
            type="text"
            value={data.hostContactName}
            onChange={(e) => update({ hostContactName: e.target.value })}
            placeholder={t('step1.host.fullNamePlaceholder')}
            className={`h-10 w-full rounded-lg border bg-white px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 ${errorBorder('hostContactName')}`}
          />
          {showErrors && missingFields.hostContactName && (
            <p className="text-xs text-red-400">{t('step1.host.fullName')} es obligatorio</p>
          )}
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3" data-error={showErrors && missingFields.hostContactPhone ? 'true' : undefined}>
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Phone className="w-4 h-4 mr-2 text-violet-400" />
              {t('step1.host.phone')}
            </label>
            <input
              type="tel"
              value={data.hostContactPhone}
              onChange={(e) => update({ hostContactPhone: e.target.value })}
              placeholder="+34 600 000 000"
              className={`h-10 w-full rounded-lg border bg-white px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 ${errorBorder('hostContactPhone')}`}
            />
            {showErrors && missingFields.hostContactPhone && (
              <p className="text-xs text-red-400">{t('step1.host.phone')} es obligatorio</p>
            )}
          </div>
          <div className="space-y-3" data-error={showErrors && missingFields.hostContactEmail ? 'true' : undefined}>
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Mail className="w-4 h-4 mr-2 text-violet-400" />
              {t('step1.host.email')}
            </label>
            <input
              type="email"
              value={data.hostContactEmail}
              onChange={(e) => update({ hostContactEmail: e.target.value })}
              placeholder="tu@email.com"
              className={`h-10 w-full rounded-lg border bg-white px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 ${errorBorder('hostContactEmail')}`}
            />
            {showErrors && missingFields.hostContactEmail && (
              <p className="text-xs text-red-400">{t('step1.host.email')} es obligatorio</p>
            )}
          </div>
        </div>

        {/* Language */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Globe className="w-4 h-4 mr-2 text-violet-400" />
            {t('step1.host.language')}
          </label>
          <div className="flex flex-wrap gap-3">
            {languages.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => update({ hostContactLanguage: value })}
                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                  data.hostContactLanguage === value
                    ? 'bg-violet-50 border-violet-500 text-violet-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Next button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="pt-4"
      >
        <button
          type="button"
          onClick={handleNext}
          className="w-full h-12 sm:h-14 rounded-xl text-base sm:text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25"
        >
          {t('step1.nextDetails')}
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>
    </motion.div>
    </>
  )
}
