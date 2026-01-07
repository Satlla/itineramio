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
  // Start with all sections expanded so users can see the checklist content
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['kitchen', 'bathroom', 'bedroom', 'livingRoom', 'general'])
  )
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-28 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header - Airbnb style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between mb-8">
              <Link
                href="/hub"
                className="inline-flex items-center text-[#222222] hover:underline font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.backToHub')}
              </Link>
              <SocialShare
                title={t('cleaningChecklist.shareTitle')}
                description={t('cleaningChecklist.shareDescription')}
              />
            </div>

            <h1 className="text-[32px] font-semibold text-[#222222] mb-2">
              {t('cleaningChecklist.title')}
            </h1>
            <p className="text-[#717171] text-base mb-4">
              {t('cleaningChecklist.subtitle')}
            </p>
            <div className="flex items-center gap-2 text-sm text-[#717171]">
              <span className="inline-flex items-center px-3 py-1 bg-[#F7F7F7] rounded-full">
                {totalTasks} {t('cleaningChecklist.badge')}
              </span>
              <span>·</span>
              <span>100% personalizable</span>
              <span>·</span>
              <span>Gratis</span>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Editor - Shows second on mobile (order-2), first on desktop (lg:order-1) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="order-2 lg:order-1"
            >
              <div className="border border-[#DDDDDD] rounded-xl p-6 bg-white">
                <h2 className="text-[22px] font-semibold text-[#222222] mb-6">
                  {t('cleaningChecklist.customize')}
                </h2>

                {/* Property Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#222222] mb-2">
                    {t('cleaningChecklist.propertyName')}
                  </label>
                  <input
                    type="text"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    placeholder={t('cleaningChecklist.propertyNamePlaceholder')}
                    className="w-full px-4 py-3 border border-[#DDDDDD] rounded-lg focus:border-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222] text-[#222222] placeholder-[#717171]"
                  />
                </div>

                {/* Property Address */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#222222] mb-2">
                    {t('cleaningChecklist.propertyAddress')}
                  </label>
                  <input
                    type="text"
                    value={propertyAddress}
                    onChange={(e) => setPropertyAddress(e.target.value)}
                    placeholder={t('cleaningChecklist.propertyAddressPlaceholder')}
                    className="w-full px-4 py-3 border border-[#DDDDDD] rounded-lg focus:border-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222] text-[#222222] placeholder-[#717171]"
                  />
                </div>

                {/* Style Selector - Simplified Airbnb style */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#222222] mb-3">
                    {t('cleaningChecklist.designStyle')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {checklistStylesConfig.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style)}
                        className={`p-3 rounded-lg border transition-all text-center ${
                          selectedStyle.id === style.id
                            ? 'border-[#222222] bg-[#F7F7F7]'
                            : 'border-[#DDDDDD] hover:border-[#222222]'
                        }`}
                      >
                        <span className="text-xl block mb-1">{style.emoji}</span>
                        <span className="text-xs text-[#222222]">{t(`cleaningChecklist.styles.${style.nameKey}`)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary - Airbnb card style */}
                <div className="mb-6 p-4 bg-[#F7F7F7] rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#222222]">Tu checklist incluye</span>
                    <span className="text-lg font-semibold text-[#222222]">{totalTasks} tareas</span>
                  </div>
                </div>

                {/* Action Buttons - Airbnb style */}
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadClick}
                    className="w-full py-3.5 bg-[#222222] text-white rounded-lg font-medium flex items-center justify-center hover:bg-[#000000] transition-colors"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {t('common.downloadChecklist')}
                  </button>

                  <button
                    onClick={handlePrintClick}
                    className="w-full py-3.5 bg-white border border-[#222222] text-[#222222] rounded-lg font-medium flex items-center justify-center hover:bg-[#F7F7F7] transition-colors"
                  >
                    <Printer className="w-5 h-5 mr-2" />
                    {t('common.printChecklist')}
                  </button>
                </div>
              </div>

              {/* Tips - Airbnb style */}
              <div className="mt-6 p-5 border border-[#DDDDDD] rounded-xl">
                <h3 className="font-medium text-[#222222] mb-3">
                  {t('cleaningChecklist.tips.title')}
                </h3>
                <ul className="space-y-2 text-sm text-[#717171]">
                  <li className="flex items-start">
                    <span className="mr-2 text-[#222222]">•</span>
                    <span>{t('cleaningChecklist.tips.tip1')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-[#222222]">•</span>
                    <span>{t('cleaningChecklist.tips.tip2')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-[#222222]">•</span>
                    <span>{t('cleaningChecklist.tips.tip3')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-[#222222]">•</span>
                    <span>{t('cleaningChecklist.tips.tip4')}</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Right: Preview - Shows first on mobile (order-1), second on desktop (lg:order-2) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="order-1 lg:order-2 lg:sticky lg:top-24 self-start"
            >
              <div className="border border-[#DDDDDD] rounded-xl p-6 bg-white">
                <h2 className="text-[22px] font-semibold text-[#222222] mb-2">
                  {t('common.preview')}
                </h2>
                <p className="text-[#717171] text-sm mb-6">
                  Personaliza el checklist añadiendo o quitando tareas según las necesidades de tu alojamiento.
                  Después, introduce el nombre de tu propiedad, dirección y email para recibirlo en tu correo.
                </p>

                {/* Checklist Preview - Airbnb style */}
                <div
                  ref={checklistRef}
                  className="bg-white border border-[#DDDDDD] rounded-xl p-6 max-h-[600px] overflow-y-auto"
                >
                  {/* Header */}
                  <div className="border-b border-[#DDDDDD] pb-4 mb-4">
                    <h3 className="text-xl font-semibold text-[#222222] mb-1">
                      {propertyName || 'Checklist de Limpieza'}
                    </h3>
                    {propertyAddress && (
                      <p className="text-[#717171] text-sm mb-1">
                        {propertyAddress}
                      </p>
                    )}
                    <p className="text-[#717171] text-xs">
                      {new Date().toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Sections */}
                  <div className="space-y-3">
                    {sections.map((section) => {
                      const isExpanded = expandedSections.has(section.id)

                      return (
                        <div key={section.id} className="border border-[#DDDDDD] rounded-lg overflow-hidden">
                          {/* Section Header - Clickable to expand/collapse */}
                          <button
                            onClick={() => toggleSection(section.id)}
                            className={`w-full flex items-center justify-between p-3 hover:bg-[#F7F7F7] transition-colors ${
                              isExpanded ? 'bg-[#F7F7F7]' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-[#717171]" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-[#717171]" />
                              )}
                              <h4 className="text-sm font-medium text-[#222222]">
                                {section.title}
                              </h4>
                            </div>
                            <span className="text-xs text-[#717171]">
                              {section.items.length} tareas
                            </span>
                          </button>

                          {/* Section Content - Only visible when expanded */}
                          {isExpanded && (
                            <div className="px-3 pb-3 space-y-1.5">
                              {section.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center space-x-2 ml-6"
                                >
                                  {/* Empty checkbox - visual only */}
                                  <div className="w-4 h-4 rounded border border-[#DDDDDD] flex-shrink-0" />
                                  <span className="flex-1 text-sm text-[#222222]">
                                    {item.text}
                                  </span>
                                  {/* Delete button */}
                                  <button
                                    onClick={() => removeItem(section.id, item.id)}
                                    className="p-1 text-[#717171] hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                    title="Eliminar tarea"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}

                              {/* Inline Add Item */}
                              {addingItemToSection === section.id ? (
                                <div className="flex items-center space-x-2 ml-6 mt-2">
                                  <input
                                    type="text"
                                    value={newItemText}
                                    onChange={(e) => setNewItemText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') addCustomItem(section.id)
                                      if (e.key === 'Escape') cancelAddItem()
                                    }}
                                    placeholder="Nueva tarea..."
                                    className="flex-1 px-3 py-2 text-sm border border-[#DDDDDD] rounded-lg focus:border-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => addCustomItem(section.id)}
                                    className="p-2 bg-[#222222] text-white rounded-lg hover:bg-black transition-colors"
                                    title="Añadir"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={cancelAddItem}
                                    className="p-2 bg-[#F7F7F7] text-[#222222] rounded-lg hover:bg-[#EBEBEB] transition-colors"
                                    title="Cancelar"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                /* Add Item Button */
                                <button
                                  onClick={() => setAddingItemToSection(section.id)}
                                  className="flex items-center space-x-2 ml-6 mt-2 text-sm text-[#717171] hover:text-[#222222] transition-colors"
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
                  <div className="mt-6 pt-4 border-t border-[#DDDDDD] text-center">
                    <p className="text-xs text-[#717171]">
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
