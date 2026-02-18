'use client'

import React from 'react'
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
          Detalles del alojamiento
        </motion.h2>
        <p className="text-gray-400 text-sm sm:text-base">Información que solo tú conoces. Casi todo son clics rápidos.</p>
      </div>

      {/* ============ ACCESS SECTION ============ */}
      <Section icon={Key} title="Acceso al alojamiento">
        {checkInMethod === 'lockbox' && (
          <>
            <div className="space-y-2">
              <FieldLabel>Código del cajetín</FieldLabel>
              <input
                type="text"
                value={data.lockboxCode}
                onChange={(e) => update({ lockboxCode: e.target.value })}
                placeholder="Se te enviará antes de tu llegada"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>¿Dónde está el cajetín?</FieldLabel>
              <input
                type="text"
                value={data.lockboxLocation}
                onChange={(e) => update({ lockboxLocation: e.target.value })}
                placeholder="Ej: A la derecha de la puerta principal"
                className={inputClass}
              />
            </div>
          </>
        )}

        {checkInMethod === 'code' && (
          <>
            <div className="space-y-2">
              <FieldLabel>Código de la puerta</FieldLabel>
              <input
                type="text"
                value={data.doorCode}
                onChange={(e) => update({ doorCode: e.target.value })}
                placeholder="Se te enviará antes de tu llegada"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>¿El código cambia por reserva?</FieldLabel>
              <div className="flex gap-3">
                <OptionButton selected={data.codeChangesPerReservation} onClick={() => update({ codeChangesPerReservation: true })}>
                  Sí, se envía con cada reserva
                </OptionButton>
                <OptionButton selected={!data.codeChangesPerReservation} onClick={() => update({ codeChangesPerReservation: false })}>
                  No, es siempre el mismo
                </OptionButton>
              </div>
            </div>
          </>
        )}

        {(checkInMethod === 'key' || checkInMethod === 'in-person') && (
          <>
            <div className="space-y-2">
              <FieldLabel>¿Dónde os reunís con el huésped?</FieldLabel>
              <input
                type="text"
                value={data.meetingPoint}
                onChange={(e) => update({ meetingPoint: e.target.value })}
                placeholder="Ej: En el portal del edificio"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Si el huésped llega tarde, ¿cuál es el plan B?</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <OptionButton selected={data.latePlan === 'call'} onClick={() => update({ latePlan: 'call' })}>
                  Llamar al anfitrión
                </OptionButton>
                <OptionButton selected={data.latePlan === 'lockbox_backup'} onClick={() => update({ latePlan: 'lockbox_backup' })}>
                  Cajetín de emergencia
                </OptionButton>
                <OptionButton selected={data.latePlan === 'neighbor'} onClick={() => update({ latePlan: 'neighbor' })}>
                  Vecino/portero
                </OptionButton>
                <OptionButton selected={data.latePlan === 'other'} onClick={() => update({ latePlan: 'other' })}>
                  Otro
                </OptionButton>
              </div>
              {(data.latePlan === 'lockbox_backup' || data.latePlan === 'neighbor' || data.latePlan === 'other') && (
                <input
                  type="text"
                  value={data.latePlanDetails}
                  onChange={(e) => update({ latePlanDetails: e.target.value })}
                  placeholder={
                    data.latePlan === 'lockbox_backup' ? 'Código y ubicación del cajetín de emergencia'
                    : data.latePlan === 'neighbor' ? 'Nombre y piso del vecino/portero'
                    : 'Describe el plan B'
                  }
                  className={inputClass}
                />
              )}
            </div>
          </>
        )}
      </Section>

      {/* ============ HOT WATER ============ */}
      <Section icon={Droplets} title="Agua caliente">
        <div className="space-y-2">
          <FieldLabel>¿Qué tipo de agua caliente tiene?</FieldLabel>
          <div className="grid grid-cols-2 gap-3">
            <OptionButton selected={data.hotWaterType === 'instant'} onClick={() => update({ hotWaterType: 'instant' })}>
              Instantáneo (gas/eléctrico)
            </OptionButton>
            <OptionButton selected={data.hotWaterType === 'tank_small'} onClick={() => update({ hotWaterType: 'tank_small' })}>
              Termo 30-50L
            </OptionButton>
            <OptionButton selected={data.hotWaterType === 'tank_large'} onClick={() => update({ hotWaterType: 'tank_large' })}>
              Termo 80-100L+
            </OptionButton>
            <OptionButton selected={data.hotWaterType === 'centralized'} onClick={() => update({ hotWaterType: 'centralized' })}>
              Caldera centralizada
            </OptionButton>
          </div>
        </div>
      </Section>

      {/* ============ ELECTRICAL PANEL ============ */}
      <Section icon={Lock} title="Cuadro eléctrico">
        <div className="space-y-2">
          <FieldLabel>¿Dónde está el cuadro eléctrico?</FieldLabel>
          <input
            type="text"
            value={data.electricalPanelLocation}
            onChange={(e) => update({ electricalPanelLocation: e.target.value })}
            placeholder="Ej: En el recibidor, armario de la derecha"
            className={inputClass}
          />
        </div>
      </Section>

      {/* ============ SUPPORT HOURS ============ */}
      <Section icon={Clock} title="Atención al huésped">
        <div className="space-y-2">
          <FieldLabel>Horario de atención normal</FieldLabel>
          <div className="flex items-center gap-3">
            <input
              type="time"
              value={data.supportHoursFrom}
              onChange={(e) => update({ supportHoursFrom: e.target.value })}
              className={inputClass + ' w-28 sm:w-32'}
            />
            <span className="text-gray-500">a</span>
            <input
              type="time"
              value={data.supportHoursTo}
              onChange={(e) => update({ supportHoursTo: e.target.value })}
              className={inputClass + ' w-28 sm:w-32'}
            />
          </div>
        </div>
        <div className="space-y-2">
          <FieldLabel>Teléfono para urgencias 24h (si es distinto al principal)</FieldLabel>
          <input
            type="tel"
            value={data.emergencyPhone}
            onChange={(e) => update({ emergencyPhone: e.target.value })}
            placeholder="Dejar vacío si es el mismo teléfono del anfitrión"
            className={inputClass}
          />
        </div>
      </Section>

      {/* ============ RECYCLING ============ */}
      <Section icon={Package} title="Basura y reciclaje">
        <div className="space-y-2">
          <FieldLabel>¿Dónde están los contenedores más cercanos?</FieldLabel>
          <input
            type="text"
            value={data.recyclingContainerLocation}
            onChange={(e) => update({ recyclingContainerLocation: e.target.value })}
            placeholder="Ej: Esquina de Calle Mayor con Calle Sol, a 50 metros"
            className={inputClass}
          />
        </div>
      </Section>

      {/* ============ RECOMMENDATIONS ============ */}
      <Section icon={Star} title="Tus recomendaciones">
        <div className="space-y-2">
          <FieldLabel>¿Qué sitios recomiendas a tus huéspedes?</FieldLabel>
          <textarea
            value={data.recommendations}
            onChange={(e) => update({ recommendations: e.target.value })}
            placeholder="Ej: Nou Manolín, Madness Coffee Shop, Bar La Fábrica, Mercado Central..."
            rows={3}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
          />
          <p className="text-xs text-gray-500">Escribe los nombres de restaurantes, cafeterías, bares o actividades que recomiendas. La IA los agrupará por categorías y generará descripciones.</p>
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
            <Section icon={Car} title="Tu parking privado">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldLabel>Número de plaza</FieldLabel>
                  <input
                    type="text"
                    value={data.parkingSpotNumber}
                    onChange={(e) => update({ parkingSpotNumber: e.target.value })}
                    placeholder="Ej: 23"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Planta</FieldLabel>
                  <input
                    type="text"
                    value={data.parkingFloor}
                    onChange={(e) => update({ parkingFloor: e.target.value })}
                    placeholder="Ej: -1"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <FieldLabel>¿Cómo se accede?</FieldLabel>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: 'remote' as const, label: 'Mando' },
                    { value: 'code' as const, label: 'Código' },
                    { value: 'card' as const, label: 'Tarjeta' },
                    { value: 'key' as const, label: 'Llave' },
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
                    placeholder="Código del parking"
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
      <Section icon={LogOut} title="Checkout">
        {/* Checkout instructions */}
        <div className="space-y-2">
          <FieldLabel>Instrucciones de checkout</FieldLabel>
          <textarea
            value={data.checkoutInstructions}
            onChange={(e) => update({ checkoutInstructions: e.target.value })}
            placeholder="Describe qué debe hacer el huésped antes de irse. Ej: Deja las toallas en la bañera, saca la basura al contenedor de la esquina, cierra todas las ventanas, deja el aire apagado, pon las llaves dentro del cajetín..."
            rows={4}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
          />
          <p className="text-xs text-gray-500">Escribe todo lo que el huésped necesita saber para la salida. La IA usará este texto.</p>
        </div>

        {/* Key return */}
        <div className="space-y-2">
          <FieldLabel>¿Qué hace el huésped con las llaves al irse?</FieldLabel>
          <div className="grid grid-cols-2 gap-3">
            <OptionButton selected={data.keyReturn === 'lockbox'} onClick={() => update({ keyReturn: 'lockbox' })}>
              Devolver al cajetín
            </OptionButton>
            <OptionButton selected={data.keyReturn === 'inside_table'} onClick={() => update({ keyReturn: 'inside_table' })}>
              Dejar en la mesa
            </OptionButton>
            <OptionButton selected={data.keyReturn === 'code_auto'} onClick={() => update({ keyReturn: 'code_auto' })}>
              Código se desactiva solo
            </OptionButton>
            <OptionButton selected={data.keyReturn === 'hand'} onClick={() => update({ keyReturn: 'hand' })}>
              Entrega en mano
            </OptionButton>
          </div>
          {data.keyReturn === 'hand' && (
            <input
              type="text"
              value={data.keyReturnDetails}
              onChange={(e) => update({ keyReturnDetails: e.target.value })}
              placeholder="¿Dónde y a quién entregan las llaves?"
              className={inputClass}
            />
          )}
        </div>

        {/* Late checkout */}
        <div className="space-y-2">
          <FieldLabel>¿Ofrecéis late checkout?</FieldLabel>
          <div className="grid grid-cols-3 gap-3">
            <OptionButton selected={data.lateCheckout === 'yes_paid'} onClick={() => update({ lateCheckout: 'yes_paid' })}>
              Sí, de pago
            </OptionButton>
            <OptionButton selected={data.lateCheckout === 'yes_free'} onClick={() => update({ lateCheckout: 'yes_free' })}>
              Según disponibilidad
            </OptionButton>
            <OptionButton selected={data.lateCheckout === 'no'} onClick={() => update({ lateCheckout: 'no' })}>
              No
            </OptionButton>
          </div>
          {data.lateCheckout === 'yes_paid' && (
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={data.lateCheckoutPrice}
                onChange={(e) => update({ lateCheckoutPrice: e.target.value })}
                placeholder="Precio (ej: 20€)"
                className={inputClass}
              />
              <input
                type="text"
                value={data.lateCheckoutUntil}
                onChange={(e) => update({ lateCheckoutUntil: e.target.value })}
                placeholder="Hasta las (ej: 14:00)"
                className={inputClass}
              />
            </div>
          )}
        </div>

        {/* Luggage */}
        <div className="space-y-2">
          <FieldLabel>¿Pueden dejar maletas después del checkout?</FieldLabel>
          <div className="grid grid-cols-3 gap-3">
            <OptionButton selected={data.luggageAfterCheckout === 'yes_in_apartment'} onClick={() => update({ luggageAfterCheckout: 'yes_in_apartment' })}>
              Sí, en el piso
            </OptionButton>
            <OptionButton selected={data.luggageAfterCheckout === 'yes_consigna'} onClick={() => update({ luggageAfterCheckout: 'yes_consigna' })}>
              Consigna cercana
            </OptionButton>
            <OptionButton selected={data.luggageAfterCheckout === 'no'} onClick={() => update({ luggageAfterCheckout: 'no' })}>
              No
            </OptionButton>
          </div>
          {data.luggageAfterCheckout === 'yes_in_apartment' && (
            <input
              type="text"
              value={data.luggageUntil}
              onChange={(e) => update({ luggageUntil: e.target.value })}
              placeholder="Hasta las (ej: 15:00)"
              className={inputClass}
            />
          )}
          {data.luggageAfterCheckout === 'yes_consigna' && (
            <input
              type="text"
              value={data.luggageConsignaInfo}
              onChange={(e) => update({ luggageConsignaInfo: e.target.value })}
              placeholder="Nombre o dirección de la consigna"
              className={inputClass}
            />
          )}
        </div>
      </Section>

      {/* ============ ITEM LOCATIONS ============ */}
      <div className="border-t border-gray-800 pt-2" />
      <Section icon={Package} title="¿Dónde están las cosas?">
        <p className="text-sm text-gray-500 -mt-2">Activa lo que tienes y pon dónde está. Esto alimenta el chatbot para que responda a los huéspedes.</p>
        <div className="space-y-3">
          {([
            { key: 'iron' as const, label: 'Plancha', placeholder: 'Ej: Armario izquierdo del dormitorio' },
            { key: 'ironingBoard' as const, label: 'Tabla de planchar', placeholder: 'Ej: Detrás de la puerta del dormitorio' },
            { key: 'hairdryer' as const, label: 'Secador de pelo', placeholder: 'Ej: Cajón del baño' },
            { key: 'firstAid' as const, label: 'Botiquín', placeholder: 'Ej: Armario superior del baño' },
            { key: 'extraBlankets' as const, label: 'Sábanas y mantas extra', placeholder: 'Ej: Armario del pasillo, estante superior' },
            { key: 'broom' as const, label: 'Escoba y fregona', placeholder: 'Ej: Armario de la cocina' },
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
        <p className="text-sm text-violet-300">
          Toda esta información se traducirá automáticamente a <strong>inglés</strong> y <strong>francés</strong> en tu manual.
        </p>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 sm:gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 h-12 sm:h-14 rounded-xl text-base sm:text-lg font-semibold border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Anterior</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-[2] h-12 sm:h-14 rounded-xl text-base sm:text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span className="sm:hidden">Siguiente</span>
          <span className="hidden sm:inline">Siguiente: Fotos y videos</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  )
}
