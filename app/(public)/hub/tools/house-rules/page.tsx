'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Download,
  FileText,
  Home,
  Clock,
  Volume2,
  Cigarette,
  Users,
  Dog,
  Key,
  Trash2,
  Check,
  Plus,
  X,
  Mail,
  Loader2
} from 'lucide-react'
import { fbEvents } from '@/components/analytics/FacebookPixel'

interface Rule {
  id: string
  icon: string
  title: string
  description: string
  enabled: boolean
  customizable?: boolean
  value?: string
}

const DEFAULT_RULES: Rule[] = [
  {
    id: 'quiet',
    icon: '🔇',
    title: 'Horario de silencio',
    description: 'Silencio de 22:00 a 08:00. Mantén el volumen al mínimo durante estas horas.',
    enabled: true,
    customizable: true,
    value: '22:00 - 08:00'
  },
  {
    id: 'smoking',
    icon: '🚭',
    title: 'No fumar',
    description: 'No está permitido fumar ni vapear dentro del apartamento.',
    enabled: true
  },
  {
    id: 'guests',
    icon: '👥',
    title: 'Huéspedes registrados',
    description: 'Solo pueden alojarse los huéspedes registrados en la reserva.',
    enabled: true
  },
  {
    id: 'parties',
    icon: '🎉',
    title: 'No fiestas',
    description: 'No se permiten fiestas, celebraciones ni eventos de ningún tipo.',
    enabled: true
  },
  {
    id: 'pets',
    icon: '🐾',
    title: 'No mascotas',
    description: 'No se admiten mascotas de ningún tipo.',
    enabled: true
  },
  {
    id: 'checkin',
    icon: '🔑',
    title: 'Check-in / Check-out',
    description: 'Check-in: desde las 15:00. Check-out: antes de las 11:00.',
    enabled: true,
    customizable: true,
    value: '15:00 / 11:00'
  },
  {
    id: 'keys',
    icon: '🗝️',
    title: 'Llaves',
    description: 'Las llaves deben devolverse al hacer check-out.',
    enabled: true
  },
  {
    id: 'trash',
    icon: '🗑️',
    title: 'Basura',
    description: 'Por favor, saca la basura antes de irte.',
    enabled: true
  },
  {
    id: 'checkout',
    icon: '✅',
    title: 'Al salir',
    description: 'Apaga luces y aire acondicionado, cierra ventanas y deja los platos en el lavavajillas.',
    enabled: true
  },
  {
    id: 'shoes',
    icon: '👟',
    title: 'Zapatos',
    description: 'Por favor, quítate los zapatos al entrar para mantener el suelo limpio.',
    enabled: false
  },
  {
    id: 'pool',
    icon: '🏊',
    title: 'Piscina',
    description: 'Horario de piscina: 10:00 a 22:00. Niños siempre acompañados.',
    enabled: false
  },
  {
    id: 'parking',
    icon: '🚗',
    title: 'Parking',
    description: 'Aparca únicamente en la plaza asignada.',
    enabled: false
  }
]

export default function HouseRulesGenerator() {
  const [propertyName, setPropertyName] = useState('')
  const [propertyAddress, setPropertyAddress] = useState('')
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES)
  const [customRules, setCustomRules] = useState<string[]>([])
  const [newCustomRule, setNewCustomRule] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const previewRef = useRef<HTMLDivElement>(null)

  const toggleRule = (id: string) => {
    setRules(rules.map(rule =>
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ))
  }

  const updateRuleDescription = (id: string, description: string) => {
    setRules(rules.map(rule =>
      rule.id === id ? { ...rule, description } : rule
    ))
  }

  const addCustomRule = () => {
    if (newCustomRule.trim()) {
      setCustomRules([...customRules, newCustomRule.trim()])
      setNewCustomRule('')
    }
  }

  const removeCustomRule = (index: number) => {
    setCustomRules(customRules.filter((_, i) => i !== index))
  }

  const enabledRules = rules.filter(r => r.enabled)

  const handleDownload = async () => {
    if (!propertyName) {
      setError('Por favor, introduce el nombre del alojamiento')
      return
    }
    setShowEmailForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Save lead
      const response = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          source: 'house-rules-generator',
          metadata: {
            propertyName,
            rulesCount: enabledRules.length + customRules.length
          }
        })
      })

      if (!response.ok) {
        throw new Error('Error al guardar')
      }

      // Facebook Pixel Lead event
      fbEvents.lead({
        content_name: 'House Rules Generator',
        content_category: 'tool',
        value: 0,
        currency: 'EUR'
      })

      setSuccess(true)

      // Trigger download after short delay
      setTimeout(() => {
        generatePDF()
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar')
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = () => {
    // Create printable version
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Normas del Alojamiento - ${propertyName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

          * { margin: 0; padding: 0; box-sizing: border-box; }

          body {
            font-family: 'Inter', -apple-system, sans-serif;
            background: white;
            color: #1a1a1a;
            line-height: 1.5;
            padding: 40px;
          }

          .container {
            max-width: 700px;
            margin: 0 auto;
          }

          .header {
            text-align: center;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 3px solid #7c3aed;
          }

          .header h1 {
            font-size: 28px;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 8px;
          }

          .header .subtitle {
            font-size: 16px;
            color: #666;
          }

          .header .address {
            font-size: 14px;
            color: #888;
            margin-top: 4px;
          }

          .intro {
            background: #f5f3ff;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 32px;
            text-align: center;
          }

          .intro p {
            font-size: 15px;
            color: #5b21b6;
          }

          .rules-grid {
            display: grid;
            gap: 16px;
          }

          .rule {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            padding: 16px;
            background: #fafafa;
            border-radius: 12px;
            border-left: 4px solid #7c3aed;
          }

          .rule-icon {
            font-size: 24px;
            flex-shrink: 0;
          }

          .rule-content h3 {
            font-size: 15px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 4px;
          }

          .rule-content p {
            font-size: 14px;
            color: #555;
          }

          .custom-rules {
            margin-top: 24px;
          }

          .custom-rules h2 {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 12px;
          }

          .footer {
            margin-top: 40px;
            padding-top: 24px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
          }

          .footer p {
            font-size: 14px;
            color: #888;
          }

          .footer .thanks {
            font-size: 16px;
            color: #7c3aed;
            font-weight: 600;
            margin-bottom: 8px;
          }

          @media print {
            body { padding: 20px; }
            .rule { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Normas del Alojamiento</h1>
            <div class="subtitle">${propertyName}</div>
            ${propertyAddress ? `<div class="address">${propertyAddress}</div>` : ''}
          </div>

          <div class="intro">
            <p>Bienvenido a nuestro alojamiento. Para garantizar una estancia agradable para todos, te pedimos que respetes las siguientes normas.</p>
          </div>

          <div class="rules-grid">
            ${enabledRules.map(rule => `
              <div class="rule">
                <span class="rule-icon">${rule.icon}</span>
                <div class="rule-content">
                  <h3>${rule.title}</h3>
                  <p>${rule.description}</p>
                </div>
              </div>
            `).join('')}

            ${customRules.map(rule => `
              <div class="rule">
                <span class="rule-icon">📌</span>
                <div class="rule-content">
                  <p>${rule}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="footer">
            <p class="thanks">¡Gracias por tu colaboración!</p>
            <p>Esperamos que disfrutes de tu estancia.</p>
          </div>
        </div>

      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()

    // Trigger print after content is loaded
    printWindow.onload = () => {
      printWindow.print()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link
            href="/hub"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Hub
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 rounded-full px-4 py-2 mb-6">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Herramienta Gratuita</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Generador de Normas del Apartamento
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Crea un documento profesional con las normas de tu alojamiento.
            Personalízalo y descárgalo listo para imprimir y enmarcar.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Editor */}
          <div className="space-y-6">
            {/* Property Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-violet-600" />
                Información del Alojamiento
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del alojamiento *
                  </label>
                  <input
                    type="text"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    placeholder="Ej: Apartamento Sol y Mar"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección (opcional)
                  </label>
                  <input
                    type="text"
                    value={propertyAddress}
                    onChange={(e) => setPropertyAddress(e.target.value)}
                    placeholder="Ej: Calle Mayor 15, 2ºA"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Rules Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Selecciona las normas
              </h2>

              <div className="space-y-3">
                {rules.map(rule => (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      rule.enabled
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                    onClick={() => toggleRule(rule.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{rule.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{rule.title}</h3>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            rule.enabled ? 'bg-violet-600 border-violet-600' : 'border-gray-300'
                          }`}>
                            {rule.enabled && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        {rule.enabled && (
                          <input
                            type="text"
                            value={rule.description}
                            onChange={(e) => {
                              e.stopPropagation()
                              updateRuleDescription(rule.id, e.target.value)
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-2 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-500"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Rules */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-violet-600" />
                Normas personalizadas
              </h2>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newCustomRule}
                  onChange={(e) => setNewCustomRule(e.target.value)}
                  placeholder="Añade una norma personalizada..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomRule()}
                />
                <button
                  onClick={addCustomRule}
                  className="px-4 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {customRules.length > 0 && (
                <div className="space-y-2">
                  {customRules.map((rule, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-lg">📌</span>
                      <span className="flex-1 text-sm text-gray-700">{rule}</span>
                      <button
                        onClick={() => removeCustomRule(index)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4">
                <h2 className="text-lg font-bold text-white">Vista Previa</h2>
              </div>

              <div ref={previewRef} className="p-6 max-h-[600px] overflow-y-auto">
                {/* Preview Header */}
                <div className="text-center mb-6 pb-4 border-b-2 border-violet-600">
                  <h3 className="text-xl font-bold text-gray-900">Normas del Alojamiento</h3>
                  <p className="text-gray-600">{propertyName || 'Tu Alojamiento'}</p>
                  {propertyAddress && (
                    <p className="text-sm text-gray-500">{propertyAddress}</p>
                  )}
                </div>

                {/* Preview Intro */}
                <div className="bg-violet-50 rounded-lg p-4 mb-6 text-center">
                  <p className="text-sm text-violet-700">
                    Bienvenido a nuestro alojamiento. Para garantizar una estancia agradable para todos, te pedimos que respetes las siguientes normas.
                  </p>
                </div>

                {/* Preview Rules */}
                <div className="space-y-3">
                  {enabledRules.map(rule => (
                    <div key={rule.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-l-4 border-violet-600">
                      <span className="text-xl">{rule.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{rule.title}</h4>
                        <p className="text-xs text-gray-600">{rule.description}</p>
                      </div>
                    </div>
                  ))}

                  {customRules.map((rule, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-l-4 border-violet-600">
                      <span className="text-xl">📌</span>
                      <p className="text-xs text-gray-600">{rule}</p>
                    </div>
                  ))}
                </div>

                {/* Preview Footer */}
                <div className="mt-6 pt-4 border-t-2 border-gray-200 text-center">
                  <p className="text-violet-600 font-medium">¡Gracias por tu colaboración!</p>
                  <p className="text-sm text-gray-500">Esperamos que disfrutes de tu estancia.</p>
                </div>
              </div>

              {/* Download Section */}
              <div className="p-6 bg-gray-50 border-t">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {!showEmailForm ? (
                  <button
                    onClick={handleDownload}
                    className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Descargar PDF para imprimir
                  </button>
                ) : success ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-green-700 font-medium">¡Listo! Tu PDF se está generando...</p>
                    <button
                      onClick={generatePDF}
                      className="mt-4 text-violet-600 underline text-sm"
                    >
                      Volver a descargar
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-gray-600 text-center mb-4">
                      Introduce tu email para recibir el PDF y consejos para mejorar tu alojamiento
                    </p>
                    <div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tu nombre"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          Descargar PDF
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 bg-violet-50 rounded-xl p-4">
              <h3 className="font-medium text-violet-900 mb-2">💡 Consejos</h3>
              <ul className="text-sm text-violet-700 space-y-1">
                <li>• Imprime en tamaño A4 o carta</li>
                <li>• Usa papel de buena calidad para enmarcar</li>
                <li>• Colócalo en un lugar visible (entrada o salón)</li>
                <li>• También envía las normas antes de la llegada</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
