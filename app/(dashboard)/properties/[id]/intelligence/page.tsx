'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Brain, ChevronDown, Check,
  Loader2, Sparkles, Home, ShieldCheck, LogIn, LogOut, Wrench,
  User, Plus, X, Zap, MapPin, Car, Wifi, Thermometer, Droplets,
  Bed, UtensilsCrossed, Tv, Shirt, Shield, Palmtree, Baby,
  Accessibility, Dog, Lightbulb, MessageCircle, Refrigerator,
} from 'lucide-react'
import { Card } from '../../../../../src/components/ui/Card'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '../../../../../src/providers/AuthProvider'
import type { PropertyIntelligence } from '../../../../../src/types/intelligence'
import { getIntelligenceCompletion } from '../../../../../src/types/intelligence'
import {
  INTELLIGENCE_SECTIONS,
  getValue,
  buildPatch,
  evaluateShowIf,
  isQuestionComplete,
  getSectionCompletion,
} from '../../../../../src/config/intelligence-questions'
import type { QuestionDef, SectionDef } from '../../../../../src/config/intelligence-questions'

// ============================================
// ICON MAP
// ============================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Wifi, Home, ShieldCheck, LogIn, LogOut, Wrench, User, MapPin, Car,
  Thermometer, Droplets, Bed, UtensilsCrossed, Tv, Shirt, Shield,
  Palmtree, Baby, Accessibility, Dog, Lightbulb, Refrigerator,
}

// ============================================
// COMPLETION CELEBRATION
// ============================================

function CompletionBurst({ trigger }: { trigger: number }) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([])

  useEffect(() => {
    if (trigger === 0) return
    const colors = ['#8b5cf6', '#a78bfa', '#22c55e', '#fbbf24', '#ec4899']
    const newParticles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 60,
      y: (Math.random() - 0.5) * 40,
      color: colors[i % colors.length],
    }))
    setParticles(newParticles)
    const timer = setTimeout(() => setParticles([]), 800)
    return () => clearTimeout(timer)
  }, [trigger])

  if (particles.length === 0) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, scale: 0, x: '50%', y: '50%' }}
          animate={{ opacity: 0, scale: 1, x: `calc(50% + ${p.x}px)`, y: `calc(50% + ${p.y}px)` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  )
}

// ============================================
// ANIMATED CHECK
// ============================================

function AnimatedCheck({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0"
        >
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function PendingDot() {
  return (
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0"
    >
      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
    </motion.div>
  )
}

// ============================================
// COLLAPSIBLE SECTION
// ============================================

interface SectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: { count: number; total: number }
  subtitle?: string
}

function Section({ title, icon, children, defaultOpen = false, badge, subtitle }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const isComplete = badge && badge.count === badge.total && badge.total > 0

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2 rounded-lg transition-colors ${isComplete ? 'bg-green-100 text-green-600' : 'bg-violet-100 text-violet-600'}`}>
            {icon}
          </div>
          <div className="text-left min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{title}</h3>
            {subtitle && <p className="text-xs text-gray-400 truncate">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {badge && (
            <div className="flex items-center gap-1.5">
              {isComplete ? (
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-xs px-2.5 py-1 rounded-full font-semibold bg-green-100 text-green-700"
                >
                  Completo
                </motion.span>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-500">
                  {badge.count}/{badge.total}
                </span>
              )}
            </div>
          )}
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.div>
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-1 border-t border-gray-100 pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

// ============================================
// FIELD COMPONENTS
// ============================================

function FieldRow({ label, completed, children, airbnb, chatbotTip }: {
  label: string
  completed: boolean
  children: React.ReactNode
  airbnb?: boolean
  chatbotTip?: string
}) {
  const [justCompleted, setJustCompleted] = useState(0)
  const wasCompletedRef = useRef(completed)

  useEffect(() => {
    if (completed && !wasCompletedRef.current) {
      setJustCompleted(prev => prev + 1)
    }
    wasCompletedRef.current = completed
  }, [completed])

  return (
    <div className="relative py-3 px-3 -mx-3 rounded-lg hover:bg-gray-50/50 transition-colors">
      <CompletionBurst trigger={justCompleted} />
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {completed ? <AnimatedCheck visible /> : <PendingDot />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-medium text-gray-800">{label}</span>
            {airbnb && completed && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-600 font-medium">Airbnb</span>
            )}
          </div>
          {children}
          {chatbotTip && completed && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-violet-500 mt-1.5 flex items-center gap-1"
            >
              <Brain className="w-3 h-3" /> {chatbotTip}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}

function YesNoButtons({ value, onChange, inverted }: {
  value: boolean | undefined
  onChange: (v: boolean) => void
  inverted?: boolean
}) {
  const displayValue = inverted && value !== undefined ? !value : value
  return (
    <div className="flex gap-1.5">
      <button
        onClick={() => onChange(inverted ? false : true)}
        className={`px-4 py-1.5 text-xs rounded-lg font-semibold transition-all ${
          displayValue === true
            ? 'bg-green-500 text-white shadow-sm scale-[1.02]'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`}
      >
        Si
      </button>
      <button
        onClick={() => onChange(inverted ? true : false)}
        className={`px-4 py-1.5 text-xs rounded-lg font-semibold transition-all ${
          displayValue === false
            ? 'bg-red-400 text-white shadow-sm scale-[1.02]'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`}
      >
        No
      </button>
    </div>
  )
}

function TextInput({ value, onChange, placeholder }: {
  value: string | undefined
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all"
    />
  )
}

function NumberInput({ value, onChange, placeholder }: {
  value: number | undefined
  onChange: (v: number | undefined) => void
  placeholder?: string
}) {
  return (
    <input
      type="number"
      value={value ?? ''}
      onChange={(e) => {
        const v = e.target.value
        onChange(v === '' ? undefined : Number(v))
      }}
      placeholder={placeholder}
      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all"
    />
  )
}

function TextArea({ value, onChange, placeholder }: {
  value: string | undefined
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={2}
      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all resize-none"
    />
  )
}

function SelectInput({ value, onChange, options }: {
  value: string | undefined
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none bg-white transition-all"
    >
      <option value="">Seleccionar...</option>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function EditableList({ items, onChange, placeholder }: {
  items: string[] | undefined
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const [newItem, setNewItem] = useState('')
  const list = items || []

  return (
    <div>
      <div className="space-y-1 mb-2">
        {list.map((item, i) => (
          <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 group">
            <span className="text-sm text-gray-700 flex-1">{item}</span>
            <button
              onClick={() => onChange(list.filter((_, idx) => idx !== i))}
              className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newItem.trim()) {
              e.preventDefault()
              onChange([...list, newItem.trim()])
              setNewItem('')
            }
          }}
          placeholder={placeholder || 'Añadir...'}
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
        />
        <button
          onClick={() => {
            if (newItem.trim()) {
              onChange([...list, newItem.trim()])
              setNewItem('')
            }
          }}
          className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg p-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function TimeRangeInput({ valueFrom, valueTo, onChangeFrom, onChangeTo }: {
  valueFrom: string | undefined
  valueTo: string | undefined
  onChangeFrom: (v: string) => void
  onChangeTo: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="time"
        value={valueFrom || ''}
        onChange={(e) => onChangeFrom(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
      />
      <span className="text-gray-300">—</span>
      <input
        type="time"
        value={valueTo || ''}
        onChange={(e) => onChangeTo(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none"
      />
    </div>
  )
}

// ============================================
// DYNAMIC QUESTION RENDERER
// ============================================

function DynamicQuestion({
  question, intel, isAirbnb, onUpdate, scheduleSave,
}: {
  question: QuestionDef
  intel: PropertyIntelligence
  isAirbnb: boolean
  onUpdate: (patch: Record<string, any>) => void
  scheduleSave: (patch: Record<string, any>) => void
}) {
  if (!evaluateShowIf(intel, question.showIf)) return null

  const currentValue = getValue(intel, question.path)
  const completed = isQuestionComplete(intel, question)

  // Special inverted logic for house rules (noPets means "mascotas no permitidas",
  // but the label asks "¿Se permiten mascotas?" so we invert)
  const isInvertedRule = ['houseRules.noPets', 'houseRules.noSmoking', 'houseRules.noParties'].includes(question.path)

  const handleChange = (value: any) => {
    const patch = buildPatch(question.path, value)
    onUpdate(patch)
    scheduleSave(patch)
  }

  // For time-range, derive the "To" path from "From" path
  const getTimeRangeToParts = (fromPath: string): string => {
    if (fromPath === 'houseRules.quietHoursStart') return 'houseRules.quietHoursEnd'
    if (fromPath === 'details.supportHoursFrom') return 'details.supportHoursTo'
    return fromPath.replace('From', 'To').replace('Start', 'End')
  }

  return (
    <>
      <FieldRow
        label={question.label}
        completed={completed}
        airbnb={isAirbnb && !!question.airbnbMapped && completed}
        chatbotTip={question.chatbotTip}
      >
        {question.type === 'yesno' && (
          <YesNoButtons
            value={isInvertedRule ? (currentValue !== undefined ? !currentValue : undefined) : currentValue}
            onChange={(v) => handleChange(isInvertedRule ? !v : v)}
          />
        )}

        {question.type === 'text' && (
          <TextInput
            value={currentValue}
            onChange={handleChange}
            placeholder={question.placeholder}
          />
        )}

        {question.type === 'number' && (
          <NumberInput
            value={currentValue}
            onChange={handleChange}
            placeholder={question.placeholder}
          />
        )}

        {question.type === 'textarea' && (
          <TextArea
            value={currentValue}
            onChange={handleChange}
            placeholder={question.placeholder}
          />
        )}

        {question.type === 'select' && question.options && (
          <SelectInput
            value={currentValue}
            onChange={handleChange}
            options={question.options}
          />
        )}

        {question.type === 'editable-list' && (
          <EditableList
            items={currentValue}
            onChange={handleChange}
            placeholder={question.placeholder}
          />
        )}

        {question.type === 'time-range' && (() => {
          const toPath = getTimeRangeToParts(question.path)
          const toValue = getValue(intel, toPath)
          return (
            <TimeRangeInput
              valueFrom={currentValue}
              valueTo={toValue}
              onChangeFrom={handleChange}
              onChangeTo={(v) => {
                const patch = buildPatch(toPath, v)
                onUpdate(patch)
                scheduleSave(patch)
              }}
            />
          )
        })()}
      </FieldRow>

      {/* Follow-up questions */}
      <AnimatePresence>
        {question.followUp?.map(fu => {
          if (!evaluateShowIf(intel, fu.showIf)) return null
          return (
            <motion.div
              key={fu.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden ml-4 border-l-2 border-violet-100 pl-2"
            >
              <DynamicQuestion
                question={fu}
                intel={intel}
                isAirbnb={isAirbnb}
                onUpdate={onUpdate}
                scheduleSave={scheduleSave}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </>
  )
}

// ============================================
// DYNAMIC SECTION RENDERER
// ============================================

function DynamicSection({
  section, intel, isAirbnb, onUpdate, scheduleSave, defaultOpen,
}: {
  section: SectionDef
  intel: PropertyIntelligence
  isAirbnb: boolean
  onUpdate: (patch: Record<string, any>) => void
  scheduleSave: (patch: Record<string, any>) => void
  defaultOpen?: boolean
}) {
  const IconComp = ICON_MAP[section.icon]
  const badge = getSectionCompletion(intel, section)

  return (
    <Section
      title={section.title}
      subtitle={section.subtitle}
      icon={IconComp ? <IconComp className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
      badge={badge}
      defaultOpen={defaultOpen}
    >
      {section.questions.map(q => (
        <DynamicQuestion
          key={q.id}
          question={q}
          intel={intel}
          isAirbnb={isAirbnb}
          onUpdate={onUpdate}
          scheduleSave={scheduleSave}
        />
      ))}

      {/* Airbnb amenities list (special for items section) */}
      {section.id === 'items' && intel.allAmenities && intel.allAmenities.length > 0 && (
        <div className="pt-3 mt-2 border-t border-gray-100">
          <details className="group">
            <summary className="text-sm text-violet-600 cursor-pointer hover:text-violet-700 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Ver {intel.allAmenities.length} amenities importados de Airbnb
            </summary>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 flex flex-wrap gap-1.5"
            >
              {intel.allAmenities.map((a, i) => (
                <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-lg border border-green-100">
                  {a}
                </span>
              ))}
            </motion.div>
          </details>
        </div>
      )}
    </Section>
  )
}

// ============================================
// UNANSWERED QUESTIONS SECTION
// ============================================

function UnansweredQuestionsSection({
  questions, onDismiss,
}: {
  questions: PropertyIntelligence['unansweredQuestions']
  onDismiss: (index: number) => void
}) {
  const pending = (questions || []).filter(q => !q.answered)
  if (pending.length === 0) return null

  return (
    <Card className="overflow-hidden border-amber-200 bg-amber-50/30">
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Preguntas de huéspedes</h3>
            <p className="text-xs text-gray-400">El chatbot no supo responder estas preguntas</p>
          </div>
          <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-medium bg-amber-100 text-amber-700">
            {pending.length}
          </span>
        </div>
        <div className="space-y-3">
          {pending.map((q, i) => (
            <div key={i} className="bg-white border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-2 justify-between">
                <p className="text-sm font-medium text-gray-800">{q.question}</p>
                <button
                  onClick={() => onDismiss(i)}
                  className="text-gray-300 hover:text-gray-500 flex-shrink-0"
                  title="Marcar como resuelta"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(q.askedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-amber-600 mt-2">
                Completa las secciones de abajo para que el chatbot pueda responder
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function IntelligencePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()

  const [intel, setIntel] = useState<PropertyIntelligence>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [isDirty, setIsDirty] = useState(false)
  const [propertyName, setPropertyName] = useState('')
  const [prevPercentage, setPrevPercentage] = useState(0)
  const [progressPulse, setProgressPulse] = useState(0)

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const savedStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingPatchRef = useRef<Record<string, any> | null>(null)
  const fullIntelRef = useRef<PropertyIntelligence>({})

  // Load intelligence data
  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      try {
        const [intelRes, propRes] = await Promise.all([
          fetch(`/api/properties/${id}/intelligence`, { credentials: 'include' }),
          fetch(`/api/properties/${id}`, { credentials: 'include' }),
        ])
        if (intelRes.ok) {
          const data = await intelRes.json()
          const loaded = data.intelligence || {}
          setIntel(loaded)
          fullIntelRef.current = loaded
        }
        if (propRes.ok) {
          const data = await propRes.json()
          setPropertyName(data.name || data.property?.name || '')
        }
      } catch (err) {
        console.error('[intelligence] Load error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const completion = getIntelligenceCompletion(intel)

  // Detect progress increase for pulse animation
  useEffect(() => {
    if (completion.percentage > prevPercentage && prevPercentage > 0) {
      setProgressPulse(prev => prev + 1)
    }
    setPrevPercentage(completion.percentage)
  }, [completion.percentage, prevPercentage])

  const showSaved = useCallback(() => {
    setSaveStatus('saved')
    setIsDirty(false)
    if (savedStatusTimeoutRef.current) clearTimeout(savedStatusTimeoutRef.current)
    savedStatusTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 2500)
  }, [])

  const doSave = useCallback(async (patch: Record<string, any>) => {
    setSaveStatus('saving')
    setSaving(true)
    try {
      const res = await fetch(`/api/properties/${id}/intelligence`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(patch),
      })
      if (res.ok) {
        showSaved()
      } else {
        setSaveStatus('error')
      }
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }, [id, showSaved])

  // Manual save — sends the full current intel
  const handleManualSave = useCallback(async () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    pendingPatchRef.current = null
    await doSave(fullIntelRef.current)
  }, [doSave])

  // Debounced save
  const scheduleSave = useCallback((patch: Record<string, any>) => {
    pendingPatchRef.current = pendingPatchRef.current
      ? deepMergeLocal(pendingPatchRef.current, patch)
      : patch
    setIsDirty(true)
    setSaveStatus('idle')

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(async () => {
      const patchToSend = pendingPatchRef.current
      pendingPatchRef.current = null
      if (!patchToSend) return
      await doSave(patchToSend)
    }, 1500)
  }, [doSave])

  // Generic deep update of local state
  const updateIntel = useCallback((patch: Record<string, any>) => {
    setIntel(prev => {
      const updated = deepMergeLocal(prev, patch) as PropertyIntelligence
      fullIntelRef.current = updated
      return updated
    })
  }, [])

  // Dismiss unanswered question
  const dismissUnanswered = useCallback((index: number) => {
    setIntel(prev => {
      const questions = [...(prev.unansweredQuestions || [])]
      const pending = questions.filter(q => !q.answered)
      if (pending[index]) {
        pending[index] = { ...pending[index], answered: true, answeredAt: new Date().toISOString() }
      }
      return { ...prev, unansweredQuestions: questions.map(q =>
        q === (prev.unansweredQuestions || [])[questions.indexOf(q)] ? q : q
      ) }
    })
    // Re-build the full unanswered array for saving
    const updated = [...(intel.unansweredQuestions || [])]
    const pending = updated.filter(q => !q.answered)
    if (pending[index]) {
      pending[index].answered = true
      pending[index].answeredAt = new Date().toISOString()
    }
    scheduleSave({ unansweredQuestions: updated })
  }, [intel.unansweredQuestions, scheduleSave])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Brain className="w-8 h-8 text-violet-600" />
        </motion.div>
      </div>
    )
  }

  const isAirbnb = intel.source === 'airbnb' || intel.source === 'mixed'

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push(`/properties/${id}/zones`)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-600" />
              Inteligencia
            </h1>
            {propertyName && (
              <p className="text-xs text-gray-400 mt-0.5">{propertyName}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              {saveStatus === 'saving' && (
                <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-xs text-violet-500 flex items-center gap-1 bg-violet-50 px-2 py-1 rounded-full"
                >
                  <Loader2 className="w-3 h-3 animate-spin" /> Guardando
                </motion.span>
              )}
              {saveStatus === 'saved' && (
                <motion.span key="saved" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="text-xs text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full"
                >
                  <Check className="w-3 h-3" /> Guardado
                </motion.span>
              )}
              {saveStatus === 'error' && (
                <motion.span key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-xs text-red-500 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full"
                >
                  Error al guardar
                </motion.span>
              )}
            </AnimatePresence>
            {(isDirty || saveStatus === 'error') && saveStatus !== 'saving' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleManualSave}
                className="text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Guardar
              </motion.button>
            )}
            {isAirbnb && (
              <span className="text-xs bg-green-50 text-green-600 px-2.5 py-1 rounded-full font-semibold border border-green-200">
                Airbnb
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative mb-8 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <CompletionBurst trigger={progressPulse} />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.span
                key={completion.percentage}
                initial={{ scale: 1.3, color: '#8b5cf6' }}
                animate={{ scale: 1, color: completion.percentage === 100 ? '#22c55e' : '#374151' }}
                className="text-2xl font-bold"
              >
                {completion.percentage}%
              </motion.span>
              {completion.percentage === 100 && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                </motion.div>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {completion.answered}/{completion.total} preguntas
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <motion.div
              className={`h-3 rounded-full ${
                completion.percentage === 100
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                  : 'bg-gradient-to-r from-violet-500 to-purple-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${completion.percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          {/* Priority breakdown */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span className={completion.essential.answered === completion.essential.total ? 'text-green-600 font-medium' : ''}>
              {completion.essential.answered}/{completion.essential.total} esenciales
            </span>
            <span className="text-gray-200">|</span>
            <span className={completion.important.answered === completion.important.total ? 'text-green-600 font-medium' : ''}>
              {completion.important.answered}/{completion.important.total} importantes
            </span>
            <span className="text-gray-200">|</span>
            <span className={completion.useful.answered === completion.useful.total ? 'text-green-600 font-medium' : ''}>
              {completion.useful.answered}/{completion.useful.total} útiles
            </span>
          </div>
          {completion.percentage === 100 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-green-600 font-medium mt-2"
            >
              Tu chatbot tiene toda la info que necesita
            </motion.p>
          )}
        </div>

        {/* Info banner */}
        <div className="mb-4 flex items-start gap-3 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
          <Zap className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-violet-700">
            Cada respuesta que completes enseña a tu chatbot a responder mejor a tus huéspedes. Con el enlace de Airbnb la mayoría se rellenan solas.
          </p>
        </div>

        {/* Unanswered questions */}
        <div className="mb-4">
          <UnansweredQuestionsSection
            questions={intel.unansweredQuestions}
            onDismiss={dismissUnanswered}
          />
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {INTELLIGENCE_SECTIONS.map((section, i) => (
            <DynamicSection
              key={section.id}
              section={section}
              intel={intel}
              isAirbnb={isAirbnb}
              onUpdate={updateIntel}
              scheduleSave={scheduleSave}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      </div>

      {/* Sticky save bar */}
      <AnimatePresence>
        {(isDirty || saveStatus === 'error') && saveStatus !== 'saving' && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4 pointer-events-none"
          >
            <div className="pointer-events-auto flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl">
              {saveStatus === 'error' && (
                <span className="text-xs text-red-400">Error al guardar — vuelve a intentar</span>
              )}
              {saveStatus !== 'error' && (
                <span className="text-xs text-gray-300">Tienes cambios sin guardar</span>
              )}
              <button
                onClick={handleManualSave}
                className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Guardar ahora
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// LOCAL DEEP MERGE
// ============================================

function deepMergeLocal(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      typeof result[key] === 'object' &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMergeLocal(result[key], source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}
