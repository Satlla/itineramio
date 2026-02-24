'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Key,
  Droplets,
  LogOut,
  Car,
  Package,
  ChevronRight,
  ArrowLeft,
  MapPin,
  Clock,
  Lock,
  Star,
} from 'lucide-react'

export interface Step2Data {
  // === ACCESS DETAILS (conditional on checkInMethod) ===
  // Lockbox
  lockboxCode: string
  lockboxLocation: string
  // Code
  doorCode: string
  codeChangesPerReservation: boolean
  // Key in hand / in-person
  meetingPoint: string
  latePlan: 'call' | 'lockbox_backup' | 'neighbor' | 'other'
  latePlanDetails: string

  // === HOT WATER ===
  hotWaterType: 'instant' | 'tank_small' | 'tank_large' | 'centralized'

  // === ELECTRICAL PANEL ===
  electricalPanelLocation: string

  // === PARKING (conditional on hasParking) ===
  parkingSpotNumber: string
  parkingFloor: string
  parkingAccess: 'remote' | 'code' | 'card' | 'key' | 'none'
  parkingAccessCode: string

  // === CHECKOUT ===
  checkoutInstructions: string
  keyReturn: 'lockbox' | 'inside_table' | 'code_auto' | 'hand' | 'other'
  keyReturnDetails: string
  lateCheckout: 'yes_paid' | 'yes_free' | 'no'
  lateCheckoutPrice: string
  lateCheckoutUntil: string
  luggageAfterCheckout: 'yes_in_apartment' | 'yes_consigna' | 'no'
  luggageUntil: string
  luggageConsignaInfo: string

  // === SUPPORT HOURS ===
  supportHoursFrom: string
  supportHoursTo: string
  emergencyPhone: string

  // === RECYCLING ===
  recyclingContainerLocation: string

  // === RECOMMENDATIONS ===
  recommendations: string

  // === ITEM LOCATIONS ===
  items: {
    iron: { has: boolean; location: string }
    hairdryer: { has: boolean; location: string }
    firstAid: { has: boolean; location: string }
    extraBlankets: { has: boolean; location: string }
    broom: { has: boolean; location: string }
    ironingBoard: { has: boolean; location: string }
  }
}

interface Step2DetailsProps {
  data: Step2Data
  onChange: (data: Step2Data) => void
  onNext: () => void
  onBack: () => void
  checkInMethod: string
  hasParking: string
}

// Reusable input style
const inputClass = 'h-10 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm'

// Reusable select button
function OptionButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
        selected
          ? 'bg-violet-600/20 border-violet-500 text-white'
          : 'bg-gray-900/60 border-gray-700 text-gray-400 hover:border-gray-600'
      }`}
    >
      {children}
    </button>
  )
}

// Section wrapper
function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Icon className="w-5 h-5 text-violet-400" />
        {title}
      </h3>
      <div className="space-y-4 pl-0 sm:pl-7">
        {children}
      </div>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-300">{children}</label>
}

export default function Step2Details({ data, onChange, onNext, onBack, checkInMethod, hasParking }: Step2DetailsProps) {
  const { t } = useTranslation('ai-setup')
  const update = (partial: Partial<Step2Data>) => {
    onChange({ ...data, ...partial })
  }

  const updateItem = (key: keyof Step2Data['items'], field: 'has' | 'location', value: any) => {
    onChange({
      ...data,
      items: {
        ...data.items,
        [key]: { ...data.items[key], [field]: value },
      },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto space-y-10"
    >
      {/* Header */}
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-3xl font-bold text-white mb-2"
        >
          {t('step2.title')}
        </motion.h2>
        <p className="text-gray-400 text-sm sm:text-base">{t('step2.subtitle')}</p>
      </div>

      {/* ============ ACCESS SECTION ============ */}
      <Section icon={Key} title={t('step2.access.title')}>
        {checkInMethod === 'lockbox' && (
          <>
            <div className="space-y-2">
              <FieldLabel>{t('step2.access.lockboxCode')}</FieldLabel>
              <input
                type="text"
                value={data.lockboxCode}
                onChange={(e) => update({ lockboxCode: e.target.value })}
                placeholder={t('step2.access.lockboxCodePlaceholder')}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>{t('step2.access.lockboxLocation')}</FieldLabel>
              <input
                type="text"
                value={data.lockboxLocation}
                onChange={(e) => update({ lockboxLocation: e.target.value })}
                placeholder={t('step2.access.lockboxLocationPlaceholder')}
                className={inputClass}
              />
            </div>
          </>
        )}

        {checkInMethod === 'code' && (
          <>
            <div className="space-y-2">
              <FieldLabel>{t('step2.access.doorCode')}</FieldLabel>
              <input
                type="text"
                value={data.doorCode}
                onChange={(e) => update({ doorCode: e.target.value })}
                placeholder={t('step2.access.doorCodePlaceholder')}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>{t('step2.access.codeChanges')}</FieldLabel>
              <div className="flex gap-3">
                <OptionButton selected={data.codeChangesPerReservation} onClick={() => update({ codeChangesPerReservation: true })}>
                  {t('step2.access.codeChangesYes')}
                </OptionButton>
                <OptionButton selected={!data.codeChangesPerReservation} onClick={() => update({ codeChangesPerReservation: false })}>
                  {t('step2.access.codeChangesNo')}
                </OptionButton>
              </div>
            </div>
          </>
        )}

        {(checkInMethod === 'key' || checkInMethod === 'in-person') && (
          <>
            <div className="space-y-2">
              <FieldLabel>{t('step2.access.meetingPoint')}</FieldLabel>
              <input
                type="text"
                value={data.meetingPoint}
                onChange={(e) => update({ meetingPoint: e.target.value })}
                placeholder={t('step2.access.meetingPointPlaceholder')}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>{t('step2.access.latePlan')}</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <OptionButton selected={data.latePlan === 'call'} onClick={() => update({ latePlan: 'call' })}>
                  {t('step2.access.latePlanCall')}
                </OptionButton>
                <OptionButton selected={data.latePlan === 'lockbox_backup'} onClick={() => update({ latePlan: 'lockbox_backup' })}>
                  {t('step2.access.latePlanLockbox')}
                </OptionButton>
                <OptionButton selected={data.latePlan === 'neighbor'} onClick={() => update({ latePlan: 'neighbor' })}>
                  {t('step2.access.latePlanNeighbor')}
                </OptionButton>
                <OptionButton selected={data.latePlan === 'other'} onClick={() => update({ latePlan: 'other' })}>
                  {t('step2.access.latePlanOther')}
                </OptionButton>
              </div>
              {(data.latePlan === 'lockbox_backup' || data.latePlan === 'neighbor' || data.latePlan === 'other') && (
                <input
                  type="text"
                  value={data.latePlanDetails}
                  onChange={(e) => update({ latePlanDetails: e.target.value })}
                  placeholder={
                    data.latePlan === 'lockbox_backup' ? t('step2.access.latePlanLockboxPlaceholder')
                    : data.latePlan === 'neighbor' ? t('step2.access.latePlanNeighborPlaceholder')
                    : t('step2.access.latePlanOtherPlaceholder')
                  }
                  className={inputClass}
                />
              )}
            </div>
          </>
        )}
      </Section>

      {/* ============ HOT WATER ============ */}
      <Section icon={Droplets} title={t('step2.hotWater.title')}>
        <div className="space-y-2">
          <FieldLabel>{t('step2.hotWater.type')}</FieldLabel>
          <div className="grid grid-cols-2 gap-3">
            <OptionButton selected={data.hotWaterType === 'instant'} onClick={() => update({ hotWaterType: 'instant' })}>
              {t('step2.hotWater.instant')}
            </OptionButton>
            <OptionButton selected={data.hotWaterType === 'tank_small'} onClick={() => update({ hotWaterType: 'tank_small' })}>
              {t('step2.hotWater.tankSmall')}
            </OptionButton>
            <OptionButton selected={data.hotWaterType === 'tank_large'} onClick={() => update({ hotWaterType: 'tank_large' })}>
              {t('step2.hotWater.tankLarge')}
            </OptionButton>
            <OptionButton selected={data.hotWaterType === 'centralized'} onClick={() => update({ hotWaterType: 'centralized' })}>
              {t('step2.hotWater.centralized')}
            </OptionButton>
          </div>
        </div>
      </Section>

      {/* ============ ELECTRICAL PANEL ============ */}
      <Section icon={Lock} title={t('step2.electrical.title')}>
        <div className="space-y-2">
          <FieldLabel>{t('step2.electrical.location')}</FieldLabel>
          <input
            type="text"
            value={data.electricalPanelLocation}
            onChange={(e) => update({ electricalPanelLocation: e.target.value })}
            placeholder={t('step2.electrical.locationPlaceholder')}
            className={inputClass}
          />
        </div>
      </Section>

      {/* ============ SUPPORT HOURS ============ */}
      <Section icon={Clock} title={t('step2.support.title')}>
        <div className="space-y-2">
          <FieldLabel>{t('step2.support.hours')}</FieldLabel>
          <div className="flex items-center gap-3">
            <input
              type="time"
              value={data.supportHoursFrom}
              onChange={(e) => update({ supportHoursFrom: e.target.value })}
              className={inputClass + ' w-28 sm:w-32'}
            />
            <span className="text-gray-500">{t('step2.support.to')}</span>
            <input
              type="time"
              value={data.supportHoursTo}
              onChange={(e) => update({ supportHoursTo: e.target.value })}
              className={inputClass + ' w-28 sm:w-32'}
            />
          </div>
        </div>
        <div className="space-y-2">
          <FieldLabel>{t('step2.support.emergencyPhone')}</FieldLabel>
          <input
            type="tel"
            value={data.emergencyPhone}
            onChange={(e) => update({ emergencyPhone: e.target.value })}
            placeholder={t('step2.support.emergencyPhonePlaceholder')}
            className={inputClass}
          />
        </div>
      </Section>

      {/* ============ RECYCLING ============ */}
      <Section icon={Package} title={t('step2.recycling.title')}>
        <div className="space-y-2">
          <FieldLabel>{t('step2.recycling.containers')}</FieldLabel>
          <input
            type="text"
            value={data.recyclingContainerLocation}
            onChange={(e) => update({ recyclingContainerLocation: e.target.value })}
            placeholder={t('step2.recycling.containersPlaceholder')}
            className={inputClass}
          />
        </div>
      </Section>

      {/* ============ RECOMMENDATIONS ============ */}
      <Section icon={Star} title={t('step2.recommendations.title')}>
        <div className="space-y-2">
          <FieldLabel>{t('step2.recommendations.label')}</FieldLabel>
          <textarea
            value={data.recommendations}
            onChange={(e) => update({ recommendations: e.target.value })}
            placeholder={t('step2.recommendations.placeholder')}
            rows={3}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
          />
          <p className="text-xs text-gray-500">{t('step2.recommendations.hint')}</p>
        </div>
      </Section>

      {/* ============ PARKING (conditional) ============ */}
      <AnimatePresence>
        {hasParking === 'yes' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Section icon={Car} title={t('step2.parking.title')}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldLabel>{t('step2.parking.spotNumber')}</FieldLabel>
                  <input
                    type="text"
                    value={data.parkingSpotNumber}
                    onChange={(e) => update({ parkingSpotNumber: e.target.value })}
                    placeholder={t('step2.parking.spotPlaceholder')}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel>{t('step2.parking.floor')}</FieldLabel>
                  <input
                    type="text"
                    value={data.parkingFloor}
                    onChange={(e) => update({ parkingFloor: e.target.value })}
                    placeholder={t('step2.parking.floorPlaceholder')}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <FieldLabel>{t('step2.parking.accessMethod')}</FieldLabel>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: 'remote' as const, label: t('step2.parking.remote') },
                    { value: 'code' as const, label: t('step2.parking.code') },
                    { value: 'card' as const, label: t('step2.parking.card') },
                    { value: 'key' as const, label: t('step2.parking.key') },
                  ].map(({ value, label }) => (
                    <OptionButton key={value} selected={data.parkingAccess === value} onClick={() => update({ parkingAccess: value })}>
                      {label}
                    </OptionButton>
                  ))}
                </div>
                {data.parkingAccess === 'code' && (
                  <input
                    type="text"
                    value={data.parkingAccessCode}
                    onChange={(e) => update({ parkingAccessCode: e.target.value })}
                    placeholder={t('step2.parking.codePlaceholder')}
                    className={inputClass}
                  />
                )}
              </div>
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ CHECKOUT ============ */}
      <div className="border-t border-gray-800 pt-2" />
      <Section icon={LogOut} title={t('step2.checkout.title')}>
        {/* Checkout instructions */}
        <div className="space-y-2">
          <FieldLabel>{t('step2.checkout.instructions')}</FieldLabel>
          <textarea
            value={data.checkoutInstructions}
            onChange={(e) => update({ checkoutInstructions: e.target.value })}
            placeholder={t('step2.checkout.instructionsPlaceholder')}
            rows={4}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
          />
          <p className="text-xs text-gray-500">{t('step2.checkout.instructionsHint')}</p>
        </div>

        {/* Key return */}
        <div className="space-y-2">
          <FieldLabel>{t('step2.checkout.keyReturn')}</FieldLabel>
          <div className="grid grid-cols-2 gap-3">
            <OptionButton selected={data.keyReturn === 'lockbox'} onClick={() => update({ keyReturn: 'lockbox' })}>
              {t('step2.checkout.keyReturnLockbox')}
            </OptionButton>
            <OptionButton selected={data.keyReturn === 'inside_table'} onClick={() => update({ keyReturn: 'inside_table' })}>
              {t('step2.checkout.keyReturnTable')}
            </OptionButton>
            <OptionButton selected={data.keyReturn === 'code_auto'} onClick={() => update({ keyReturn: 'code_auto' })}>
              {t('step2.checkout.keyReturnCodeAuto')}
            </OptionButton>
            <OptionButton selected={data.keyReturn === 'hand'} onClick={() => update({ keyReturn: 'hand' })}>
              {t('step2.checkout.keyReturnHand')}
            </OptionButton>
          </div>
          {data.keyReturn === 'hand' && (
            <input
              type="text"
              value={data.keyReturnDetails}
              onChange={(e) => update({ keyReturnDetails: e.target.value })}
              placeholder={t('step2.checkout.keyReturnHandPlaceholder')}
              className={inputClass}
            />
          )}
        </div>

        {/* Late checkout */}
        <div className="space-y-2">
          <FieldLabel>{t('step2.checkout.lateCheckout')}</FieldLabel>
          <div className="grid grid-cols-3 gap-3">
            <OptionButton selected={data.lateCheckout === 'yes_paid'} onClick={() => update({ lateCheckout: 'yes_paid' })}>
              {t('step2.checkout.lateCheckoutPaid')}
            </OptionButton>
            <OptionButton selected={data.lateCheckout === 'yes_free'} onClick={() => update({ lateCheckout: 'yes_free' })}>
              {t('step2.checkout.lateCheckoutFree')}
            </OptionButton>
            <OptionButton selected={data.lateCheckout === 'no'} onClick={() => update({ lateCheckout: 'no' })}>
              {t('step2.checkout.lateCheckoutNo')}
            </OptionButton>
          </div>
          {data.lateCheckout === 'yes_paid' && (
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={data.lateCheckoutPrice}
                onChange={(e) => update({ lateCheckoutPrice: e.target.value })}
                placeholder={t('step2.checkout.pricePlaceholder')}
                className={inputClass}
              />
              <input
                type="text"
                value={data.lateCheckoutUntil}
                onChange={(e) => update({ lateCheckoutUntil: e.target.value })}
                placeholder={t('step2.checkout.untilPlaceholder')}
                className={inputClass}
              />
            </div>
          )}
        </div>

        {/* Luggage */}
        <div className="space-y-2">
          <FieldLabel>{t('step2.checkout.luggage')}</FieldLabel>
          <div className="grid grid-cols-3 gap-3">
            <OptionButton selected={data.luggageAfterCheckout === 'yes_in_apartment'} onClick={() => update({ luggageAfterCheckout: 'yes_in_apartment' })}>
              {t('step2.checkout.luggageApartment')}
            </OptionButton>
            <OptionButton selected={data.luggageAfterCheckout === 'yes_consigna'} onClick={() => update({ luggageAfterCheckout: 'yes_consigna' })}>
              {t('step2.checkout.luggageConsigna')}
            </OptionButton>
            <OptionButton selected={data.luggageAfterCheckout === 'no'} onClick={() => update({ luggageAfterCheckout: 'no' })}>
              {t('step2.checkout.luggageNo')}
            </OptionButton>
          </div>
          {data.luggageAfterCheckout === 'yes_in_apartment' && (
            <input
              type="text"
              value={data.luggageUntil}
              onChange={(e) => update({ luggageUntil: e.target.value })}
              placeholder={t('step2.checkout.luggageUntilPlaceholder')}
              className={inputClass}
            />
          )}
          {data.luggageAfterCheckout === 'yes_consigna' && (
            <input
              type="text"
              value={data.luggageConsignaInfo}
              onChange={(e) => update({ luggageConsignaInfo: e.target.value })}
              placeholder={t('step2.checkout.luggageConsignaPlaceholder')}
              className={inputClass}
            />
          )}
        </div>
      </Section>

      {/* ============ ITEM LOCATIONS ============ */}
      <div className="border-t border-gray-800 pt-2" />
      <Section icon={Package} title={t('step2.items.title')}>
        <p className="text-sm text-gray-500 -mt-2">{t('step2.items.subtitle')}</p>
        <div className="space-y-3">
          {([
            { key: 'iron' as const, label: t('step2.items.iron'), placeholder: t('step2.items.ironPlaceholder') },
            { key: 'ironingBoard' as const, label: t('step2.items.ironingBoard'), placeholder: t('step2.items.ironingBoardPlaceholder') },
            { key: 'hairdryer' as const, label: t('step2.items.hairdryer'), placeholder: t('step2.items.hairdryerPlaceholder') },
            { key: 'firstAid' as const, label: t('step2.items.firstAid'), placeholder: t('step2.items.firstAidPlaceholder') },
            { key: 'extraBlankets' as const, label: t('step2.items.extraBlankets'), placeholder: t('step2.items.extraBlanketsPlaceholder') },
            { key: 'broom' as const, label: t('step2.items.broom'), placeholder: t('step2.items.broomPlaceholder') },
          ]).map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateItem(key, 'has', !data.items[key].has)}
                  className={`w-10 h-10 rounded-lg border flex-shrink-0 flex items-center justify-center transition-all duration-200 text-lg ${
                    data.items[key].has
                      ? 'bg-violet-600/20 border-violet-500 text-violet-400'
                      : 'bg-gray-900/60 border-gray-700 text-gray-600'
                  }`}
                >
                  {data.items[key].has ? '✓' : ''}
                </button>
                <span className={`text-sm font-medium ${data.items[key].has ? 'text-white' : 'text-gray-500'}`}>
                  {label}
                </span>
              </div>
              {data.items[key].has && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pl-[52px]"
                >
                  <input
                    type="text"
                    value={data.items[key].location}
                    onChange={(e) => updateItem(key, 'location', e.target.value)}
                    placeholder={placeholder}
                    className={inputClass}
                  />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Translation notice */}
      <div className="bg-violet-900/20 border border-violet-800/30 rounded-xl p-4 text-center">
        <p className="text-sm text-violet-300" dangerouslySetInnerHTML={{ __html: t('step2.translationNotice') }} />
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 sm:gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 h-12 sm:h-14 rounded-xl text-base sm:text-lg font-semibold border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">{t('step2.previous')}</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-[2] h-12 sm:h-14 rounded-xl text-base sm:text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span className="sm:hidden">{t('step2.next')}</span>
          <span className="hidden sm:inline">{t('step2.nextMedia')}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  )
}
