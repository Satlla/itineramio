'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
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
  checkInMethod: 'key' | 'lockbox' | 'code' | 'in-person'
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

interface Step1AddressProps {
  data: Step1Data
  onChange: (data: Step1Data) => void
  onNext: () => void
}

export default function Step1Address({ data, onChange, onNext }: Step1AddressProps) {
  const { t } = useTranslation('ai-setup')

  const update = (partial: Partial<Step1Data>) => {
    onChange({ ...data, ...partial })
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
          className="text-2xl sm:text-3xl font-bold text-white mb-2"
        >
          {t('step1.title')}
        </motion.h2>
        <p className="text-gray-400 text-sm sm:text-base">{t('step1.subtitle')}</p>
      </div>

      {/* Property Name + Profile Image */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
        {/* Profile Image */}
        <div className="flex-shrink-0 space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-300">
            <Camera className="w-4 h-4 mr-2 text-violet-400" />
            {t('step1.mainPhoto')}
          </label>
          <ImageUpload
            value={data.profileImage}
            onChange={(url) => update({ profileImage: url || '' })}
            variant="square"
            placeholder={t('step1.photo')}
            maxSize={10}
          />
        </div>

        {/* Name + Description */}
        <div className="flex-1 w-full space-y-4">
          <div className="space-y-3">
            <label className="flex items-center text-sm font-medium text-gray-300">
              <PenLine className="w-4 h-4 mr-2 text-violet-400" />
              {t('step1.propertyName')}
            </label>
            <input
              type="text"
              value={data.propertyName}
              onChange={(e) => update({ propertyName: e.target.value })}
              placeholder={t('step1.propertyNamePlaceholder')}
              className="h-10 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center text-sm font-medium text-gray-300">
              <FileText className="w-4 h-4 mr-2 text-violet-400" />
              {t('step1.description')}
              <span className="text-gray-600 ml-2 font-normal">{t('step1.optional')}</span>
            </label>
            <textarea
              value={data.propertyDescription}
              onChange={(e) => update({ propertyDescription: e.target.value })}
              placeholder={t('step1.descriptionPlaceholder')}
              rows={2}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-3">
        <label className="flex items-center text-sm font-medium text-gray-300">
          <MapPin className="w-4 h-4 mr-2 text-violet-400" />
          {t('step1.address')}
        </label>
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
          dark
        />
        {data.formattedAddress && (!data.lat || !data.lng) && (
          <div className="flex items-center gap-2 text-amber-400 text-xs mt-1">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{t('step1.noCoordinates')}</span>
          </div>
        )}
      </div>

      {/* Property Type */}
      <div className="space-y-3">
        <label className="flex items-center text-sm font-medium text-gray-300">
          <Home className="w-4 h-4 mr-2 text-violet-400" />
          {t('step1.propertyType')}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {propertyTypes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => update({ propertyType: value })}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                data.propertyType === value
                  ? 'bg-violet-600/20 border-violet-500 text-white'
                  : 'bg-gray-900/60 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300'
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
          <label className="flex items-center text-sm font-medium text-gray-300">
            <BedDouble className="w-4 h-4 mr-2 text-violet-400" />
            {t('step1.bedrooms')}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => update({ bedrooms: Math.max(0, data.bedrooms - 1) })}
              className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 text-white flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              -
            </button>
            <span className="text-xl font-bold text-white w-6 text-center">{data.bedrooms}</span>
            <button
              type="button"
              onClick={() => update({ bedrooms: Math.min(20, data.bedrooms + 1) })}
              className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 text-white flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              +
            </button>
          </div>
        </div>
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-gray-300">
            <Bath className="w-4 h-4 mr-2 text-violet-400" />
            {t('step1.bathrooms')}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => update({ bathrooms: Math.max(0, data.bathrooms - 1) })}
              className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 text-white flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              -
            </button>
            <span className="text-xl font-bold text-white w-6 text-center">{data.bathrooms}</span>
            <button
              type="button"
              onClick={() => update({ bathrooms: Math.min(10, data.bathrooms + 1) })}
              className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 text-white flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              +
            </button>
          </div>
        </div>
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-gray-300">
            <Users className="w-4 h-4 mr-2 text-violet-400" />
            {t('step1.guests')}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => update({ maxGuests: Math.max(1, data.maxGuests - 1) })}
              className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 text-white flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              -
            </button>
            <span className="text-xl font-bold text-white w-6 text-center">{data.maxGuests}</span>
            <button
              type="button"
              onClick={() => update({ maxGuests: Math.min(50, data.maxGuests + 1) })}
              className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 text-white flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              +
            </button>
          </div>
        </div>
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-gray-300">
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
            className="h-10 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* WiFi */}
      <div className="space-y-3">
        <label className="flex items-center text-sm font-medium text-gray-300">
          <Wifi className="w-4 h-4 mr-2 text-violet-400" />
          {t('step1.wifi')}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            value={data.wifiName}
            onChange={(e) => update({ wifiName: e.target.value })}
            placeholder={t('step1.networkName')}
            className="h-10 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <input
            type="text"
            value={data.wifiPassword}
            onChange={(e) => update({ wifiPassword: e.target.value })}
            placeholder={t('step1.password')}
            className="h-10 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Check-in/out */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-gray-300">
            <Clock className="w-4 h-4 mr-2 text-violet-400" />
            {t('step1.checkInTime')}
          </label>
          <input
            type="time"
            value={data.checkInTime}
            onChange={(e) => update({ checkInTime: e.target.value })}
            className="h-10 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-gray-300">
            <Clock className="w-4 h-4 mr-2 text-violet-400" />
            {t('step1.checkOutTime')}
          </label>
          <input
            type="time"
            value={data.checkOutTime}
            onChange={(e) => update({ checkOutTime: e.target.value })}
            className="h-10 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Check-in method */}
      <div className="space-y-3">
        <label className="flex items-center text-sm font-medium text-gray-300">
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
                  ? 'bg-violet-600/20 border-violet-500 text-white'
                  : 'bg-gray-900/60 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Check-in instructions */}
      <div className="space-y-3">
        <label className="flex items-center text-sm font-medium text-gray-300">
          <PenLine className="w-4 h-4 mr-2 text-violet-400" />
          {t('step1.checkInInstructions')}
        </label>
        <textarea
          value={data.checkInInstructions}
          onChange={(e) => update({ checkInInstructions: e.target.value })}
          placeholder={t('step1.checkInInstructionsPlaceholder')}
          rows={4}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
        />
        <p className="text-xs text-gray-500">
          {t('step1.checkInInstructionsHint')}
        </p>
      </div>

      {/* Amenities row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Parking */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-gray-300">
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
                    ? 'bg-violet-600/20 border-violet-500 text-white'
                    : 'bg-gray-900/60 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Pool */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-gray-300">
            <Waves className="w-4 h-4 mr-2 text-violet-400" />
            {t('step1.pool')}
          </label>
          <button
            type="button"
            onClick={() => update({ hasPool: !data.hasPool })}
            className={`w-full px-4 py-2.5 sm:py-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
              data.hasPool
                ? 'bg-violet-600/20 border-violet-500 text-white'
                : 'bg-gray-900/60 border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            {data.hasPool ? t('step1.yes') : t('step1.no')}
          </button>
        </div>

        {/* AC */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-gray-300">
            <Snowflake className="w-4 h-4 mr-2 text-violet-400" />
            {t('step1.ac')}
          </label>
          <button
            type="button"
            onClick={() => update({ hasAC: !data.hasAC })}
            className={`w-full px-4 py-2.5 sm:py-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
              data.hasAC
                ? 'bg-violet-600/20 border-violet-500 text-white'
                : 'bg-gray-900/60 border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            {data.hasAC ? t('step1.yes') : t('step1.no')}
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 pt-2" />

      {/* Host Contact Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
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
            />
          </div>
          <p className="text-sm text-gray-500 text-center sm:text-left">
            {t('step1.host.photoHint')}
          </p>
        </div>

        {/* Name */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-gray-300">
            <User className="w-4 h-4 mr-2 text-violet-400" />
            {t('step1.host.fullName')}
          </label>
          <input
            type="text"
            value={data.hostContactName}
            onChange={(e) => update({ hostContactName: e.target.value })}
            placeholder={t('step1.host.fullNamePlaceholder')}
            className="h-10 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="flex items-center text-sm font-medium text-gray-300">
              <Phone className="w-4 h-4 mr-2 text-violet-400" />
              {t('step1.host.phone')}
            </label>
            <input
              type="tel"
              value={data.hostContactPhone}
              onChange={(e) => update({ hostContactPhone: e.target.value })}
              placeholder="+34 600 000 000"
              className="h-10 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center text-sm font-medium text-gray-300">
              <Mail className="w-4 h-4 mr-2 text-violet-400" />
              {t('step1.host.email')}
            </label>
            <input
              type="email"
              value={data.hostContactEmail}
              onChange={(e) => update({ hostContactEmail: e.target.value })}
              placeholder="tu@email.com"
              className="h-10 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Language */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-medium text-gray-300">
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
                    ? 'bg-violet-600/20 border-violet-500 text-white'
                    : 'bg-gray-900/60 border-gray-700 text-gray-400 hover:border-gray-600'
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
          onClick={onNext}
          disabled={!isValid}
          className={`w-full h-12 sm:h-14 rounded-xl text-base sm:text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            isValid
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {t('step1.nextDetails')}
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>
    </motion.div>
  )
}
