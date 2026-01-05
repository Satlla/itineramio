'use client'

import React, { useState, useRef, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Sparkles,
  ArrowLeft,
  Download,
  Printer,
  Check,
  Plus,
  X,
  Edit2,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navbar } from '../../../../../src/components/layout/Navbar'
import { SocialShare } from '../../../../../src/components/tools/SocialShare'
import { LeadCaptureModal } from '../../../../../src/components/tools/LeadCaptureModal'
import { SuccessModal } from '../../../../../src/components/ui/SuccessModal'
import { generatePDF } from '../../../../../src/lib/pdf-generator'

const checklistStylesConfig = [
  {
    id: 'modern',
    nameKey: 'modern',
    colors: 'from-blue-500 to-cyan-500',
    textColor: 'text-gray-900',
    bgColor: 'bg-white',
    accentColor: 'bg-blue-500',
    emoji: '✨'
  },
  {
    id: 'minimalist',
    nameKey: 'minimalist',
    colors: 'from-gray-800 to-gray-900',
    textColor: 'text-gray-900',
    bgColor: 'bg-gray-50',
    accentColor: 'bg-gray-900',
    border: 'border-4 border-gray-900',
    emoji: '⚪'
  },
  {
    id: 'elegant',
    nameKey: 'elegant',
    colors: 'from-purple-600 to-pink-600',
    textColor: 'text-gray-900',
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
    accentColor: 'bg-purple-600',
    emoji: '💎'
  },
  {
    id: 'fresh',
    nameKey: 'fresh',
    colors: 'from-green-500 to-emerald-600',
    textColor: 'text-gray-900',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
    accentColor: 'bg-green-600',
    emoji: '🌿'
  },
  {
    id: 'warm',
    nameKey: 'warm',
    colors: 'from-orange-400 to-amber-500',
    textColor: 'text-gray-900',
    bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50',
    accentColor: 'bg-orange-500',
    emoji: '🔆'
  },
  {
    id: 'professional',
    nameKey: 'professional',
    colors: 'from-indigo-600 to-blue-700',
    textColor: 'text-gray-900',
    bgColor: 'bg-white',
    accentColor: 'bg-indigo-600',
    border: 'border-2 border-indigo-200',
    emoji: '📋'
  }
]

interface ChecklistItem {
  id: string
  text: string
  checked: boolean
}

interface ChecklistSection {
  id: string
  titleKey?: string
  title: string
  items: ChecklistItem[]
}

// Task keys by section - for translation lookup
const sectionTaskKeys = {
  kitchen: ['cleanCountertop', 'cleanAppliances', 'cleanMicrowave', 'cleanFridge', 'cleanBehindFridge', 'cleanHoodFilter', 'cleanStovetop', 'cleanOven', 'cleanDishwasher', 'checkDishwasherFilter', 'cleanSink', 'restockCleaning'],
  bathroom: ['cleanToilet', 'cleanSink', 'cleanShower', 'cleanShowerDoor', 'cleanTiles', 'cleanMirror', 'emptyTrash', 'restockTowels', 'restockToiletPaper', 'restockSoap', 'checkDrains'],
  bedroom: ['changeSheets', 'lintRollerSheets', 'makeBed', 'cleanNightstands', 'cleanClosetInside', 'cleanClosetOutside', 'checkHangers', 'cleanUnderBed', 'vacuumMattress', 'emptyTrash'],
  livingRoom: ['vacuumSofa', 'cleanCoffeeTable', 'dustFurniture', 'cleanTV', 'checkRemotes', 'cleanWindowsInside', 'cleanWindowTracks', 'cleanBlinds', 'cleanCurtains', 'emptyTrash'],
  general: ['sweepMopFloors', 'vacuumRugs', 'cleanBaseboards', 'cleanDoors', 'cleanSwitches', 'cleanRadiators', 'cleanACFilters', 'checkEverythingWorks', 'restockConsumables', 'takeOutTrash', 'ventilateRooms', 'finalCheck']
}

// Function to generate default sections with translations
const getDefaultSections = (t: (key: string) => string): ChecklistSection[] => [
  {
    id: 'kitchen',
    titleKey: 'kitchen',
    title: t('cleaningChecklist.sections.kitchen'),
    items: sectionTaskKeys.kitchen.map((key, i) => ({
      id: `k${i + 1}`,
      text: t(`cleaningChecklist.tasks.kitchen.${key}`),
      checked: false
    }))
  },
  {
    id: 'bathroom',
    titleKey: 'bathroom',
    title: t('cleaningChecklist.sections.bathroom'),
    items: sectionTaskKeys.bathroom.map((key, i) => ({
      id: `b${i + 1}`,
      text: t(`cleaningChecklist.tasks.bathroom.${key}`),
      checked: false
    }))
  },
  {
    id: 'bedroom',
    titleKey: 'bedroom',
    title: t('cleaningChecklist.sections.bedroom'),
    items: sectionTaskKeys.bedroom.map((key, i) => ({
      id: `br${i + 1}`,
      text: t(`cleaningChecklist.tasks.bedroom.${key}`),
      checked: false
    }))
  },
  {
    id: 'livingRoom',
    titleKey: 'livingRoom',
    title: t('cleaningChecklist.sections.livingRoom'),
    items: sectionTaskKeys.livingRoom.map((key, i) => ({
      id: `l${i + 1}`,
      text: t(`cleaningChecklist.tasks.livingRoom.${key}`),
      checked: false
    }))
  },
  {
    id: 'general',
    titleKey: 'general',
    title: t('cleaningChecklist.sections.general'),
    items: sectionTaskKeys.general.map((key, i) => ({
      id: `g${i + 1}`,
      text: t(`cleaningChecklist.tasks.general.${key}`),
      checked: false
    }))
  }
]

export default function CleaningChecklist() {
  const { t, i18n } = useTranslation('tools')

  // Memoize default sections based on current language
  const defaultSections = useMemo(() => getDefaultSections(t), [t, i18n.language])

  const [propertyName, setPropertyName] = useState('')
  const [propertyAddress, setPropertyAddress] = useState('')
  const [sections, setSections] = useState<ChecklistSection[]>([])
  const [selectedStyle, setSelectedStyle] = useState(checklistStylesConfig[0])
  const [initialized, setInitialized] = useState(false)

  // Initialize sections on mount and when language changes
  React.useEffect(() => {
    if (!initialized) {
      setSections(defaultSections)
      setInitialized(true)
    }
  }, [defaultSections, initialized])
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<'download' | 'print' | null>(null)
  const [addingItemToSection, setAddingItemToSection] = useState<string | null>(null)
  const [newItemText, setNewItemText] = useState('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const checklistRef = useRef<HTMLDivElement>(null)

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
        // También cancelar si estaba añadiendo item
        if (addingItemToSection === sectionId) {
          setAddingItemToSection(null)
          setNewItemText('')
        }
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const toggleItem = (sectionId: string, itemId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          )
        }
      }
      return section
    }))
  }

  const addCustomItem = (sectionId: string) => {
    if (!newItemText?.trim()) return

    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: [
            ...section.items,
            { id: Date.now().toString(), text: newItemText.trim(), checked: false }
          ]
        }
      }
      return section
    }))
    setNewItemText('')
    setAddingItemToSection(null)
  }

  const cancelAddItem = () => {
    setNewItemText('')
    setAddingItemToSection(null)
  }

  const removeItem = (sectionId: string, itemId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.filter(item => item.id !== itemId)
        }
      }
      return section
    }))
  }

  const editItem = (sectionId: string, itemId: string, newText: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item =>
            item.id === itemId ? { ...item, text: newText } : item
          )
        }
      }
      return section
    }))
  }

  const handleDownloadClick = () => {
    setPendingAction('download')
    setShowLeadModal(true)
  }

  const handlePrintClick = () => {
    setPendingAction('print')
    setShowLeadModal(true)
  }

  const downloadChecklist = async () => {
    if (!checklistRef.current) return

    try {
      await generatePDF(
        checklistRef.current,
        `checklist-limpieza-${propertyName || 'itineramio'}.pdf`,
        {
          margin: 15,
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }
      )
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const printChecklist = () => {
    window.print()
  }

  const handleLeadSubmit = async (data: { name: string; email: string }) => {
    try {
      // Send professional email with checklist embedded
      const response = await fetch('/api/recursos/checklist-limpieza', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          propertyName: propertyName || 'Mi Propiedad',
          propertyAddress: propertyAddress || '',
          sections: sections.map(s => ({
            title: s.title,
            items: s.items.map(i => i.text)
          })),
          style: selectedStyle.name
        })
      })

      const result = await response.json()

      if (response.ok) {
        console.log('Checklist sent successfully:', result)
        setShowSuccessModal(true)
      } else {
        console.error('Error sending checklist:', result.error)
        // Fallback to local download if email fails
        if (pendingAction === 'download') {
          await downloadChecklist()
        } else if (pendingAction === 'print') {
          printChecklist()
        }
      }
    } catch (error) {
      console.error('Error calling checklist API:', error)
      // Fallback to local download
      if (pendingAction === 'download') {
        await downloadChecklist()
      } else if (pendingAction === 'print') {
        printChecklist()
      }
    }

    setShowLeadModal(false)
    setPendingAction(null)
  }

  const totalTasks = sections.reduce((acc, section) => acc + section.items.length, 0)
  const completedTasks = sections.reduce((acc, section) =>
    acc + section.items.filter(item => item.checked).length, 0
  )
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <div className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/hub"
                className="inline-flex items-center text-violet-600 hover:text-violet-700 font-medium group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                {t('common.backToHub')}
              </Link>
              <SocialShare
                title={t('cleaningChecklist.shareTitle')}
                description={t('cleaningChecklist.shareDescription')}
              />
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900">
                  {t('cleaningChecklist.title')}
                </h1>
                <p className="text-xl text-gray-600 mt-2">
                  {t('cleaningChecklist.subtitle')}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">{totalTasks} {t('cleaningChecklist.badge')}</span>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Editor */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t('cleaningChecklist.customize')}
                </h2>

                {/* Property Name */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('cleaningChecklist.propertyName')}
                  </label>
                  <input
                    type="text"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    placeholder={t('cleaningChecklist.propertyNamePlaceholder')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400"
                  />
                </div>

                {/* Property Address */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('cleaningChecklist.propertyAddress')}
                  </label>
                  <input
                    type="text"
                    value={propertyAddress}
                    onChange={(e) => setPropertyAddress(e.target.value)}
                    placeholder={t('cleaningChecklist.propertyAddressPlaceholder')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400"
                  />
                </div>

                {/* Style Selector */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {t('cleaningChecklist.designStyle')}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {checklistStylesConfig.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style)}
                        className={`relative aspect-square rounded-xl transition-all ${
                          selectedStyle.id === style.id
                            ? 'ring-4 ring-blue-500 ring-offset-2 scale-110'
                            : 'hover:scale-105'
                        }`}
                      >
                        <div className={`w-full h-full rounded-xl bg-gradient-to-br ${style.colors} flex items-center justify-center`}>
                          <span className="text-3xl">{style.emoji}</span>
                          {selectedStyle.id === style.id && (
                            <Check className="w-6 h-6 text-white absolute inset-0 m-auto z-10 drop-shadow-lg" />
                          )}
                        </div>
                        <span className="text-xs text-gray-600 mt-1 block">{t(`cleaningChecklist.styles.${style.nameKey}`)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-green-900">{t('cleaningChecklist.progress')}</span>
                    <span className="text-2xl font-bold text-green-600">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-3 bg-green-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                    />
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    {completedTasks} {t('cleaningChecklist.tasksCompleted', { total: totalTasks })}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadClick}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold flex items-center justify-center hover:shadow-xl transition-all group"
                  >
                    <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                    {t('common.downloadChecklist')}
                  </button>

                  <button
                    onClick={handlePrintClick}
                    className="w-full py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-xl font-bold flex items-center justify-center hover:border-gray-300 hover:shadow-lg transition-all"
                  >
                    <Printer className="w-5 h-5 mr-2" />
                    {t('common.printChecklist')}
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  {t('cleaningChecklist.tips.title')}
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t('cleaningChecklist.tips.tip1')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t('cleaningChecklist.tips.tip2')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t('cleaningChecklist.tips.tip3')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t('cleaningChecklist.tips.tip4')}</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Right: Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:sticky lg:top-24 self-start"
            >
              <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t('common.preview')}
                </h2>

                {/* Checklist Preview */}
                <div
                  ref={checklistRef}
                  className={`${selectedStyle.bgColor} ${selectedStyle.border || ''} rounded-2xl p-8 max-h-[600px] overflow-y-auto`}
                >
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${selectedStyle.colors} rounded-xl p-6 text-white mb-6`}>
                    <h3 className="text-3xl font-bold mb-1">
                      {propertyName || 'Checklist de Limpieza'}
                    </h3>
                    {propertyAddress && (
                      <p className="text-white/80 text-sm mb-2">
                        📍 {propertyAddress}
                      </p>
                    )}
                    <p className="text-white/70 text-xs">
                      {new Date().toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Sections */}
                  <div className="space-y-4">
                    {sections.map((section) => {
                      const isExpanded = expandedSections.has(section.id)
                      const completedCount = section.items.filter(i => i.checked).length

                      return (
                        <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden">
                          {/* Section Header - Clickable to expand/collapse */}
                          <button
                            onClick={() => toggleSection(section.id)}
                            className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                              isExpanded ? 'bg-gray-50' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              )}
                              <h4 className={`text-lg font-bold ${selectedStyle.textColor}`}>
                                {section.title}
                              </h4>
                            </div>
                            <span className="text-sm text-gray-500">
                              {completedCount}/{section.items.length}
                            </span>
                          </button>

                          {/* Section Content - Only visible when expanded */}
                          {isExpanded && (
                            <div className="px-4 pb-4 space-y-2">
                              {section.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center space-x-3 group ml-8"
                                >
                                  <button
                                    onClick={() => toggleItem(section.id, item.id)}
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                      item.checked
                                        ? `${selectedStyle.accentColor} border-transparent`
                                        : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                  >
                                    {item.checked && <Check className="w-3 h-3 text-white" />}
                                  </button>
                                  <span
                                    className={`flex-1 text-sm ${
                                      item.checked
                                        ? 'line-through text-gray-400'
                                        : selectedStyle.textColor
                                    }`}
                                  >
                                    {item.text}
                                  </span>
                                  <button
                                    onClick={() => removeItem(section.id, item.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                                    title="Eliminar"
                                  >
                                    <X className="w-3 h-3 text-red-500" />
                                  </button>
                                </div>
                              ))}

                              {/* Inline Add Item */}
                              {addingItemToSection === section.id ? (
                                <div className="flex items-center space-x-2 ml-8 mt-2">
                                  <input
                                    type="text"
                                    value={newItemText}
                                    onChange={(e) => setNewItemText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') addCustomItem(section.id)
                                      if (e.key === 'Escape') cancelAddItem()
                                    }}
                                    placeholder="Nueva tarea..."
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => addCustomItem(section.id)}
                                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    title="Añadir"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={cancelAddItem}
                                    className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                                    title="Cancelar"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                /* Add Item Button */
                                <button
                                  onClick={() => setAddingItemToSection(section.id)}
                                  className="flex items-center space-x-2 ml-8 mt-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>{t('cleaningChecklist.addCustomTask')}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Footer */}
                  <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500">
                      {t('cleaningChecklist.footer')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #checklist-print * {
            visibility: visible;
          }
          #checklist-print {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={showLeadModal}
        onClose={() => {
          setShowLeadModal(false)
          setPendingAction(null)
        }}
        onSubmit={handleLeadSubmit}
        title={pendingAction === 'download' ? t('cleaningChecklist.leadModal.downloadTitle') : t('cleaningChecklist.leadModal.printTitle')}
        description={t('cleaningChecklist.leadModal.description')}
        downloadLabel={pendingAction === 'download' ? t('common.downloadChecklist') : t('common.printChecklist')}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={t('cleaningChecklist.successModal.title')}
        message={t('cleaningChecklist.successModal.message')}
        autoClose={true}
        autoCloseDelay={5000}
      />
    </div>
  )
}
