'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Home,
  ArrowLeft,
  Download,
  Printer,
  Check,
  Plus,
  X,
  Sparkles
} from 'lucide-react'
import { Navbar } from '../../../../../src/components/layout/Navbar'
import { SocialShare } from '../../../../../src/components/tools/SocialShare'
import { LeadCaptureModal } from '../../../../../src/components/tools/LeadCaptureModal'
import html2canvas from 'html2canvas'

const setupStyles = [
  {
    id: 'modern',
    name: 'Moderno',
    colors: 'from-violet-500 to-purple-600',
    textColor: 'text-gray-900',
    bgColor: 'bg-white',
    accentColor: 'bg-violet-500',
    emoji: '✨'
  },
  {
    id: 'minimalist',
    name: 'Minimalista',
    colors: 'from-gray-800 to-gray-900',
    textColor: 'text-gray-900',
    bgColor: 'bg-gray-50',
    accentColor: 'bg-gray-900',
    border: 'border-4 border-gray-900',
    emoji: '⚪'
  },
  {
    id: 'cozy',
    name: 'Acogedor',
    colors: 'from-orange-400 to-red-500',
    textColor: 'text-gray-900',
    bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
    accentColor: 'bg-orange-500',
    emoji: '🏡'
  },
  {
    id: 'luxury',
    name: 'Luxury',
    colors: 'from-amber-500 to-yellow-600',
    textColor: 'text-gray-900',
    bgColor: 'bg-gradient-to-br from-amber-50 to-yellow-50',
    accentColor: 'bg-amber-600',
    emoji: '👑'
  },
  {
    id: 'fresh',
    name: 'Fresco',
    colors: 'from-cyan-400 to-blue-500',
    textColor: 'text-gray-900',
    bgColor: 'bg-gradient-to-br from-cyan-50 to-blue-50',
    accentColor: 'bg-cyan-500',
    emoji: '🌊'
  },
  {
    id: 'nature',
    name: 'Natural',
    colors: 'from-green-600 to-emerald-700',
    textColor: 'text-gray-900',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
    accentColor: 'bg-green-600',
    emoji: '🌿'
  }
]

interface SetupItem {
  id: string
  text: string
  checked: boolean
  quantity?: string
}

interface SetupSection {
  id: string
  title: string
  items: SetupItem[]
}

const defaultSections: SetupSection[] = [
  {
    id: 'cocina',
    title: '🍳 Cocina',
    items: [
      { id: '1', text: 'Cafetera Nespresso', checked: false, quantity: '1' },
      { id: '2', text: 'Cafetera italiana', checked: false, quantity: '1' },
      { id: '3', text: 'Tetera / Hervidor eléctrico', checked: false, quantity: '1' },
      { id: '4', text: 'Tostadora', checked: false, quantity: '1' },
      { id: '5', text: 'Microondas', checked: false, quantity: '1' },
      { id: '6', text: 'Nevera / Frigorífico', checked: false, quantity: '1' },
      { id: '7', text: 'Horno', checked: false, quantity: '1' },
      { id: '8', text: 'Lavavajillas', checked: false, quantity: '1' },
      { id: '9', text: 'Batidora / Licuadora', checked: false, quantity: '1' },
      { id: '10', text: 'Set completo de ollas y sartenes', checked: false, quantity: '1 set' },
      { id: '11', text: 'Vajilla completa (platos, cuencos)', checked: false, quantity: '6-8 pax' },
      { id: '12', text: 'Cubertería completa', checked: false, quantity: '6-8 pax' },
      { id: '13', text: 'Vasos y copas variados', checked: false, quantity: '6-8 pax' },
      { id: '14', text: 'Tazas para café/té', checked: false, quantity: '6-8' },
      { id: '15', text: 'Utensilios de cocina básicos', checked: false, quantity: '1 set' },
      { id: '16', text: 'Tabla de cortar', checked: false, quantity: '2' },
      { id: '17', text: 'Cuchillos de cocina', checked: false, quantity: '1 set' },
      { id: '18', text: 'Abrelatas y sacacorchos', checked: false, quantity: '1' },
      { id: '19', text: 'Trapos de cocina', checked: false, quantity: '4-6' },
      { id: '20', text: 'Papel de cocina', checked: false, quantity: '2 rollos' },
      { id: '21', text: 'Bolsas de basura', checked: false, quantity: '1 caja' },
      { id: '22', text: 'Estropajo y bayeta', checked: false, quantity: '2' },
      { id: '23', text: 'Detergente lavavajillas', checked: false, quantity: '1' },
      { id: '24', text: 'Sal y pimienta', checked: false, quantity: '1 set' },
      { id: '25', text: 'Aceite y vinagre básico', checked: false, quantity: '1' },
      { id: '26', text: 'Especias básicas', checked: false, quantity: '1 set' }
    ]
  },
  {
    id: 'dormitorio',
    title: '🛏️ Dormitorio',
    items: [
      { id: '27', text: 'Cama con somier y colchón', checked: false, quantity: '1 por pax' },
      { id: '28', text: 'Ropa de cama completa', checked: false, quantity: '2 juegos' },
      { id: '29', text: 'Almohadas', checked: false, quantity: '2 por cama' },
      { id: '30', text: 'Almohadas extra', checked: false, quantity: '2' },
      { id: '31', text: 'Edredón / Nórdico', checked: false, quantity: '1 por cama' },
      { id: '32', text: 'Manta extra', checked: false, quantity: '1 por cama' },
      { id: '33', text: 'Mesitas de noche', checked: false, quantity: '2 por cama' },
      { id: '34', text: 'Lámparas de mesita', checked: false, quantity: '2 por cama' },
      { id: '35', text: 'Armario / Ropero', checked: false, quantity: '1' },
      { id: '36', text: 'Perchas', checked: false, quantity: '10-15' },
      { id: '37', text: 'Espejo de cuerpo entero', checked: false, quantity: '1' },
      { id: '38', text: 'Cortinas opacas', checked: false, quantity: '1 set' },
      { id: '39', text: 'Despertador', checked: false, quantity: '1' },
      { id: '40', text: 'Enchufe cerca de la cama', checked: false, quantity: '2' }
    ]
  },
  {
    id: 'bano',
    title: '🚿 Baño',
    items: [
      { id: '41', text: 'Toallas de baño grandes', checked: false, quantity: '2 por pax' },
      { id: '42', text: 'Toallas de mano', checked: false, quantity: '2 por pax' },
      { id: '43', text: 'Alfombrilla de baño', checked: false, quantity: '1' },
      { id: '44', text: 'Secador de pelo', checked: false, quantity: '1' },
      { id: '45', text: 'Champú', checked: false, quantity: '2' },
      { id: '46', text: 'Gel de baño', checked: false, quantity: '2' },
      { id: '47', text: 'Jabón de manos', checked: false, quantity: '1' },
      { id: '48', text: 'Papel higiénico', checked: false, quantity: '4 rollos' },
      { id: '49', text: 'Pañuelos de papel', checked: false, quantity: '1 caja' },
      { id: '50', text: 'Papelera', checked: false, quantity: '1' },
      { id: '51', text: 'Cortina de ducha (si aplica)', checked: false, quantity: '1' },
      { id: '52', text: 'Báscula de baño', checked: false, quantity: '1' }
    ]
  },
  {
    id: 'salon',
    title: '🛋️ Salón / Comedor',
    items: [
      { id: '53', text: 'Sofá cómodo', checked: false, quantity: '1' },
      { id: '54', text: 'Cojines decorativos', checked: false, quantity: '3-5' },
      { id: '55', text: 'Manta para sofá', checked: false, quantity: '1' },
      { id: '56', text: 'Mesa de centro', checked: false, quantity: '1' },
      { id: '57', text: 'TV Smart', checked: false, quantity: '1' },
      { id: '58', text: 'Mando TV (con pilas)', checked: false, quantity: '1' },
      { id: '59', text: 'Mesa de comedor', checked: false, quantity: '1' },
      { id: '60', text: 'Sillas de comedor', checked: false, quantity: '4-6' },
      { id: '61', text: 'Cortinas', checked: false, quantity: '1 set' },
      { id: '62', text: 'Ventilador o Aire acondicionado', checked: false, quantity: '1' },
      { id: '63', text: 'Calefacción / Radiadores', checked: false, quantity: '1+' }
    ]
  },
  {
    id: 'tecnologia',
    title: '📱 Tecnología',
    items: [
      { id: '64', text: 'WiFi de alta velocidad', checked: false, quantity: '1' },
      { id: '65', text: 'Router WiFi visible con contraseña', checked: false, quantity: '1' },
      { id: '66', text: 'Cargador USB-C', checked: false, quantity: '2' },
      { id: '67', text: 'Cargador Lightning (iOS)', checked: false, quantity: '1' },
      { id: '68', text: 'Cargador Micro-USB (Android)', checked: false, quantity: '1' },
      { id: '69', text: 'Regleta con USB', checked: false, quantity: '1' },
      { id: '70', text: 'Adaptadores de enchufe', checked: false, quantity: '2' },
      { id: '71', text: 'Altavoz Bluetooth', checked: false, quantity: '1' }
    ]
  },
  {
    id: 'limpieza',
    title: '🧹 Limpieza y Lavandería',
    items: [
      { id: '72', text: 'Lavadora', checked: false, quantity: '1' },
      { id: '73', text: 'Secadora (o tendedero)', checked: false, quantity: '1' },
      { id: '74', text: 'Tendedero de ropa', checked: false, quantity: '1' },
      { id: '75', text: 'Pinzas de tender', checked: false, quantity: '20' },
      { id: '76', text: 'Detergente para ropa', checked: false, quantity: '1' },
      { id: '77', text: 'Plancha', checked: false, quantity: '1' },
      { id: '78', text: 'Tabla de planchar', checked: false, quantity: '1' },
      { id: '79', text: 'Aspiradora', checked: false, quantity: '1' },
      { id: '80', text: 'Escoba y recogedor', checked: false, quantity: '1' },
      { id: '81', text: 'Fregona y cubo', checked: false, quantity: '1' },
      { id: '82', text: 'Productos de limpieza básicos', checked: false, quantity: '1 set' }
    ]
  },
  {
    id: 'seguridad',
    title: '🔒 Seguridad y Emergencias',
    items: [
      { id: '83', text: 'Cerradura segura en puerta', checked: false, quantity: '1' },
      { id: '84', text: 'Detector de humo', checked: false, quantity: '1+' },
      { id: '85', text: 'Extintor', checked: false, quantity: '1' },
      { id: '86', text: 'Botiquín de primeros auxilios', checked: false, quantity: '1' },
      { id: '87', text: 'Linterna (con pilas)', checked: false, quantity: '1' },
      { id: '88', text: 'Información de emergencias visible', checked: false, quantity: '1' },
      { id: '89', text: 'Caja fuerte (opcional)', checked: false, quantity: '1' }
    ]
  },
  {
    id: 'extras',
    title: '✨ Extras y Detalles',
    items: [
      { id: '90', text: 'Manual digital con QR', checked: false, quantity: '1' },
      { id: '91', text: 'Guía local recomendaciones', checked: false, quantity: '1' },
      { id: '92', text: 'Mapas de la zona', checked: false, quantity: '1' },
      { id: '93', text: 'Juegos de mesa', checked: false, quantity: '2-3' },
      { id: '94', text: 'Libros de lectura', checked: false, quantity: '5+' },
      { id: '95', text: 'Paraguas', checked: false, quantity: '2' },
      { id: '96', text: 'Zapatillas desechables', checked: false, quantity: '2 pares' },
      { id: '97', text: 'Cubo de hielo', checked: false, quantity: '1' },
      { id: '98', text: 'Sacacorchos', checked: false, quantity: '1' },
      { id: '99', text: 'Detalle de bienvenida', checked: false, quantity: '1' },
      { id: '100', text: 'Plantas decorativas', checked: false, quantity: '2-3' }
    ]
  }
]

export default function AirbnbSetupChecklist() {
  const [propertyName, setPropertyName] = useState('')
  const [sections, setSections] = useState<SetupSection[]>(defaultSections)
  const [selectedStyle, setSelectedStyle] = useState(setupStyles[0])
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<'download' | 'print' | null>(null)
  const checklistRef = useRef<HTMLDivElement>(null)

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
    const newItemText = prompt('Escribe el nuevo elemento:')
    if (!newItemText?.trim()) return

    const quantity = prompt('Cantidad (opcional):')

    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: [
            ...section.items,
            {
              id: Date.now().toString(),
              text: newItemText,
              checked: false,
              quantity: quantity || undefined
            }
          ]
        }
      }
      return section
    }))
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
      const canvas = await html2canvas(checklistRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      })

      const link = document.createElement('a')
      link.download = `airbnb-setup-checklist-${propertyName || 'itineramio'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Error generating image:', error)
    }
  }

  const printChecklist = () => {
    window.print()
  }

  const handleLeadSubmit = async (data: { name: string; email: string }) => {
    try {
      const response = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          source: 'airbnb-setup',
          metadata: {
            propertyName,
            style: selectedStyle.name,
            action: pendingAction,
            totalItems: sections.reduce((acc, section) => acc + section.items.length, 0)
          }
        })
      })

      const result = await response.json()

      if (response.ok) {
        console.log('Lead captured successfully:', result)
      } else {
        console.error('Error capturing lead:', result.error)
      }
    } catch (error) {
      console.error('Error calling lead capture API:', error)
    }

    if (pendingAction === 'download') {
      await downloadChecklist()
    } else if (pendingAction === 'print') {
      printChecklist()
    }

    setShowLeadModal(false)
    setPendingAction(null)
  }

  const totalItems = sections.reduce((acc, section) => acc + section.items.length, 0)
  const completedItems = sections.reduce((acc, section) =>
    acc + section.items.filter(item => item.checked).length, 0
  )
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

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
                Volver al Hub
              </Link>
              <SocialShare
                title="Checklist Apertura Airbnb - Itineramio"
                description="Checklist completo de elementos esenciales para preparar tu Airbnb. 100+ items, personalizable y gratis."
              />
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Home className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900">
                  Checklist Apertura Airbnb
                </h1>
                <p className="text-xl text-gray-600 mt-2">
                  Lista completa de elementos esenciales para tu alojamiento
                </p>
              </div>
            </div>

            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-violet-50 rounded-full border border-violet-200">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-medium text-violet-900">{totalItems} elementos · 100% personalizable · Gratis</span>
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
                  Personaliza tu checklist
                </h2>

                {/* Property Name */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Nombre de la propiedad (opcional)
                  </label>
                  <input
                    type="text"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    placeholder="Apartamento Playa del Carmen"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none text-gray-900 placeholder-gray-400"
                  />
                </div>

                {/* Style Selector */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Estilo de diseño
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {setupStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style)}
                        className={`relative aspect-square rounded-xl transition-all ${
                          selectedStyle.id === style.id
                            ? 'ring-4 ring-violet-500 ring-offset-2 scale-110'
                            : 'hover:scale-105'
                        }`}
                      >
                        <div className={`w-full h-full rounded-xl bg-gradient-to-br ${style.colors} flex items-center justify-center`}>
                          <span className="text-3xl">{style.emoji}</span>
                          {selectedStyle.id === style.id && (
                            <Check className="w-6 h-6 text-white absolute inset-0 m-auto z-10 drop-shadow-lg" />
                          )}
                        </div>
                        <span className="text-xs text-gray-600 mt-1 block">{style.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-6 p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-violet-900">Progreso</span>
                    <span className="text-2xl font-bold text-violet-600">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-3 bg-violet-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-600"
                    />
                  </div>
                  <p className="text-xs text-violet-700 mt-2">
                    {completedItems} de {totalItems} elementos completados
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadClick}
                    className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center hover:shadow-xl transition-all group"
                  >
                    <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                    Descargar checklist
                  </button>

                  <button
                    onClick={handlePrintClick}
                    className="w-full py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-xl font-bold flex items-center justify-center hover:border-gray-300 hover:shadow-lg transition-all"
                  >
                    <Printer className="w-5 h-5 mr-2" />
                    Imprimir checklist
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-8 p-6 bg-violet-50 border-2 border-violet-200 rounded-2xl">
                <h3 className="font-bold text-violet-900 mb-3 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Tips de uso
                </h3>
                <ul className="space-y-2 text-sm text-violet-800">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Usa este checklist antes de abrir tu primera propiedad</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Marca lo que ya tienes y crea lista de compras con lo pendiente</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Personaliza según el tipo de propiedad (estudio, apartamento, casa)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Imprime y úsalo como referencia durante el setup</span>
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
                  Vista previa
                </h2>

                {/* Checklist Preview */}
                <div
                  ref={checklistRef}
                  className={`${selectedStyle.bgColor} ${selectedStyle.border || ''} rounded-2xl p-8 max-h-[600px] overflow-y-auto`}
                >
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${selectedStyle.colors} rounded-xl p-6 text-white mb-6`}>
                    <h3 className="text-3xl font-bold mb-2">
                      {propertyName || 'Checklist Apertura Airbnb'}
                    </h3>
                    <p className="text-white/90 text-sm">
                      Setup completo · {totalItems} elementos esenciales
                    </p>
                  </div>

                  {/* Sections */}
                  <div className="space-y-6">
                    {sections.map((section) => (
                      <div key={section.id}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className={`text-lg font-bold ${selectedStyle.textColor}`}>
                            {section.title}
                          </h4>
                          <button
                            onClick={() => addCustomItem(section.id)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Agregar elemento"
                          >
                            <Plus className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {section.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center space-x-3 group"
                            >
                              <button
                                onClick={() => toggleItem(section.id, item.id)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
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
                                {item.quantity && (
                                  <span className="text-gray-500 ml-2">({item.quantity})</span>
                                )}
                              </span>
                              <button
                                onClick={() => removeItem(section.id, item.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all flex-shrink-0"
                                title="Eliminar"
                              >
                                <X className="w-3 h-3 text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500">
                      Creado con Itineramio · itineramio.com
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
          #setup-checklist-print * {
            visibility: visible;
          }
          #setup-checklist-print {
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
        title={pendingAction === 'download' ? '¡Descarga tu checklist!' : '¡Imprime tu checklist!'}
        description="Déjanos tu email para recibir más recursos gratuitos para tu negocio"
        downloadLabel={pendingAction === 'download' ? 'Descargar' : 'Continuar a imprimir'}
      />
    </div>
  )
}
