'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Plus, 
  Star, 
  Clock, 
  TrendingUp, 
  Users, 
  Lightbulb, 
  CheckCircle,
  PlayCircle,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import { Badge } from './Badge'
import { ZoneIconDisplay } from './IconSelector'
import { ZoneTemplate } from '../../data/zoneTemplates'

interface ZoneInspirationModalProps {
  isOpen: boolean
  onClose: () => void
  template: ZoneTemplate | null
  onCreateZone: (template: ZoneTemplate) => void
}

export function ZoneInspirationModal({
  isOpen,
  onClose,
  template,
  onCreateZone
}: ZoneInspirationModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'examples' | 'template'>('overview')
  const [selectedExample, setSelectedExample] = useState(0)

  if (!template) return null

  const getCategoryColor = (category: string) => {
    const colors = {
      essential: 'from-blue-500 to-blue-600',
      amenities: 'from-green-500 to-green-600',
      rules: 'from-amber-500 to-amber-600',
      local: 'from-purple-500 to-purple-600',
      savings: 'from-emerald-500 to-emerald-600',
      emergency: 'from-red-500 to-red-600'
    }
    return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-600'
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      essential: 'Esencial',
      amenities: 'Comodidad',
      rules: 'Normas',
      local: 'Local',
      savings: 'Ahorro',
      emergency: 'Emergencia'
    }
    return labels[category as keyof typeof labels] || category
  }

  const mockExamples = [
    {
      id: 1,
      title: "Villa Sunset - Málaga",
      host: "María García",
      rating: 4.9,
      description: "Instrucciones claras con videos paso a paso para la vitrocerámica. Los huéspedes nunca preguntan cómo usarla.",
      steps: [
        { type: 'text', content: '1. Asegúrate de que la superficie esté limpia y seca' },
        { type: 'video', content: 'Video: Cómo encender la vitrocerámica', thumbnail: '/api/placeholder/300/200' },
        { type: 'text', content: '2. Selecciona la zona de cocción tocando el símbolo correspondiente' },
        { type: 'image', content: 'Foto del panel de control', url: '/api/placeholder/400/300' }
      ],
      tags: ['video', 'paso-a-paso', 'visual']
    },
    {
      id: 2,
      title: "Loft Moderno - Barcelona",
      host: "Carlos López",
      rating: 4.8,
      description: "Guía visual con imágenes detalladas. Incluye códigos QR para manuales digitales.",
      steps: [
        { type: 'text', content: 'Bienvenido a nuestro loft! Aquí tienes todo sobre la cocina de inducción' },
        { type: 'image', content: 'Vista general de la cocina', url: '/api/placeholder/500/300' },
        { type: 'link', content: 'Manual completo (PDF)', url: 'https://example.com/manual.pdf' }
      ],
      tags: ['imágenes', 'qr', 'manual']
    },
    {
      id: 3,
      title: "Casa Rural - Valencia",
      host: "Ana Martín",
      rating: 4.7,
      description: "Enfoque personal con mensajes de bienvenida y consejos locales para cocinar.",
      steps: [
        { type: 'text', content: '¡Hola! Soy Ana, tu anfitriona. Te explico cómo usar nuestra cocina tradicional modernizada' },
        { type: 'text', content: 'Consejo: Esta vitrocerámica es perfecta para hacer paella valenciana 🥘' },
        { type: 'youtube', content: 'Receta de paella valenciana', videoId: 'dQw4w9WgXcQ' }
      ],
      tags: ['personal', 'local', 'recetas']
    }
  ]

  const getDefaultTemplate = () => {
    const templates = {
      'wifi': {
        title: 'Conexión WiFi',
        steps: [
          { type: 'text', content: { es: '👋🏻 Bienvenido! Te explico cómo conectarte al WiFi de la casa.' }},
          { type: 'text', content: { es: '📡 Nombre de la red: [Tu_Red_WiFi]' }},
          { type: 'text', content: { es: '🔐 Contraseña: [Tu_Contraseña]' }},
          { type: 'image', content: { es: 'Foto del router' }},
          { type: 'text', content: { es: '⚠️ Si el internet va lento, reinicia el router presionando el botón rojo durante 10 segundos.' }}
        ]
      },
      'check-in': {
        title: 'Proceso de Entrada',
        steps: [
          { type: 'text', content: { es: '🏠 ¡Bienvenido! Sigue estos pasos para entrar al alojamiento.' }},
          { type: 'video', content: { es: 'Video: Cómo llegar a la puerta principal' }},
          { type: 'text', content: { es: '🔢 Código de acceso al edificio: [CÓDIGO]' }},
          { type: 'image', content: { es: 'Foto del teclado de entrada' }},
          { type: 'text', content: { es: '🗝️ Las llaves están en la caja fuerte junto a la puerta.' }},
          { type: 'image', content: { es: 'Foto de la ubicación de la caja fuerte' }},
          { type: 'text', content: { es: '🔢 Código de la caja fuerte: [CÓDIGO]' }},
          { type: 'text', content: { es: '✅ Una vez dentro, deja las llaves siempre en el bowl de la entrada.' }}
        ]
      },
      'parking': {
        title: 'Información de Aparcamiento',
        steps: [
          { type: 'text', content: { es: '🚗 Información para aparcar tu vehículo' }},
          { type: 'image', content: { es: 'Foto de la entrada del parking' }},
          { type: 'text', content: { es: '🅿️ Plaza asignada: Parking subterráneo, Plaza #[NÚMERO]' }},
          { type: 'video', content: { es: 'Video: Cómo llegar a tu plaza' }},
          { type: 'text', content: { es: '🔢 Código de acceso: [CÓDIGO]' }},
          { type: 'text', content: { es: '⏰ Horario: Disponible 24/7' }},
          { type: 'text', content: { es: '📞 En caso de problemas: [TELÉFONO]' }}
        ]
      },
      'emergency': {
        title: 'Contactos de Emergencia',
        steps: [
          { type: 'text', content: { es: '🆘 Números importantes para tu seguridad' }},
          { type: 'text', content: { es: '🚑 Emergencias generales: 112' }},
          { type: 'text', content: { es: '👮 Policía Local: 092' }},
          { type: 'text', content: { es: '🔥 Bomberos: 080' }},
          { type: 'text', content: { es: '🏥 Centro médico más cercano: [NOMBRE]' }},
          { type: 'link', content: { es: 'Dirección del centro médico' }},
          { type: 'text', content: { es: '📞 Anfitrion: [TU NÚMERO]' }},
          { type: 'text', content: { es: '💡 Compañía eléctrica: [NÚMERO]' }},
          { type: 'text', content: { es: '💧 Agua: [NÚMERO]' }}
        ]
      },
      'trash': {
        title: 'Basura y Reciclaje',
        steps: [
          { type: 'text', content: { es: '♾️ Sistema de reciclaje y recogida de basura' }},
          { type: 'image', content: { es: 'Foto de los contenedores' }},
          { type: 'text', content: { es: '🟡 Amarillo: Envases y plásticos' }},
          { type: 'text', content: { es: '🔵 Azul: Papel y cartón' }},
          { type: 'text', content: { es: '🟢 Verde: Vidrio' }},
          { type: 'text', content: { es: '⚫ Gris/Negro: Orgánico y resto' }},
          { type: 'text', content: { es: '🕒 Horario de recogida: Lunes, Miércoles y Viernes a las 22:00h' }},
          { type: 'text', content: { es: '📍 Ubicación contenedores: En la esquina de la calle' }}
        ]
      }
    }
    
    return templates[template.id as keyof typeof templates] || {
      title: template.name,
      steps: [
        { type: 'text', content: { es: `Información sobre ${template.name.toLowerCase()}` }},
        { type: 'text', content: { es: 'Añade aquí las instrucciones paso a paso.' }},
        { type: 'text', content: { es: 'Puedes incluir imágenes, videos o enlaces.' }}
      ]
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`relative p-6 bg-gradient-to-r ${getCategoryColor(template.category)} text-white`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-start gap-4 pr-12">
                <div className="p-3 bg-white/20 rounded-xl">
                  <ZoneIconDisplay iconId={template.icon} size="md" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span className="text-sm font-medium opacity-90">
                      Inspiración de zona
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{template.name}</h2>
                  <p className="text-white/90 mb-4">{template.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{template.popularity}% de hosts lo usan</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-white border-white/30">
                        {getCategoryLabel(template.category)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex px-6">
                {[
                  { id: 'overview', label: 'Resumen', icon: TrendingUp },
                  { id: 'examples', label: 'Ejemplos Reales', icon: Star },
                  { id: 'template', label: 'Plantilla', icon: FileText }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors text-sm font-medium ${
                      activeTab === tab.id
                        ? 'border-violet-500 text-violet-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <Card className="p-4">
                      <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <div className="font-semibold text-sm">Popularidad</div>
                      <div className="text-xs text-gray-600">{template.popularity}% hosts</div>
                    </Card>
                    <Card className="p-4">
                      <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="font-semibold text-sm">Tiempo setup</div>
                      <div className="text-xs text-gray-600">15-30 min</div>
                    </Card>
                    <Card className="p-4">
                      <CheckCircle className="w-6 h-6 text-violet-600 mx-auto mb-2" />
                      <div className="font-semibold text-sm">Impacto</div>
                      <div className="text-xs text-gray-600">Alto</div>
                    </Card>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      ¿Por qué es importante esta zona?
                    </h3>
                    <div className="bg-amber-50 rounded-lg p-4 text-sm text-amber-800">
                      Esta zona ayuda a tus huéspedes a ser más independientes y reduce las consultas frecuentes. 
                      Muchos hosts reportan una mejora significativa en las valoraciones tras añadir instrucciones claras.
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Consejos de expertos</h3>
                    <div className="space-y-3">
                      {[
                        'Incluye siempre fotos o videos para mayor claridad',
                        'Añade tu número de contacto para emergencias',
                        'Traduce a inglés si recibes huéspedes internacionales',
                        'Actualiza la información regularmente'
                      ].map((tip, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 bg-violet-600 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'examples' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Así lo han hecho otros anfitriones
                    </h3>
                    <p className="text-sm text-gray-600">
                      Inspírate con estos ejemplos reales de anfitriones exitosos
                    </p>
                  </div>

                  {/* Example selector */}
                  <div className="flex justify-center gap-2">
                    {mockExamples.map((example, index) => (
                      <button
                        key={example.id}
                        onClick={() => setSelectedExample(index)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          selectedExample === index
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {example.title.split(' - ')[0]}
                      </button>
                    ))}
                  </div>

                  {/* Selected example */}
                  <Card className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {mockExamples[selectedExample].title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          por {mockExamples[selectedExample].host}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">
                          {mockExamples[selectedExample].rating}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-4">
                      {mockExamples[selectedExample].description}
                    </p>

                    <div className="space-y-3">
                      {mockExamples[selectedExample].steps.map((step, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center text-xs font-medium text-violet-600">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            {step.type === 'text' && (
                              <p className="text-sm text-gray-700">{typeof step.content === 'string' ? step.content : (step.content as any).es || ''}</p>
                            )}
                            {step.type === 'video' && (
                              <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-3">
                                <PlayCircle className="w-5 h-5 text-red-600" />
                                <span className="text-sm font-medium">{typeof step.content === 'string' ? step.content : (step.content as any).es || ''}</span>
                              </div>
                            )}
                            {step.type === 'image' && (
                              <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-3">
                                <ImageIcon className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-medium">{typeof step.content === 'string' ? step.content : (step.content as any).es || ''}</span>
                              </div>
                            )}
                            {step.type === 'link' && (
                              <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-3">
                                <LinkIcon className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-medium">{typeof step.content === 'string' ? step.content : (step.content as any).es || ''}</span>
                              </div>
                            )}
                            {step.type === 'youtube' && (
                              <div className="bg-red-50 rounded-lg p-3 flex items-center gap-3">
                                <PlayCircle className="w-5 h-5 text-red-600" />
                                <span className="text-sm font-medium">{typeof step.content === 'string' ? step.content : (step.content as any).es || ''}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex gap-2">
                      {mockExamples[selectedExample].tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'template' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Plantilla sugerida
                    </h3>
                    <p className="text-sm text-gray-600">
                      Usa esta plantilla como punto de partida y personalízala
                    </p>
                  </div>

                  <Card className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      {getDefaultTemplate().title}
                    </h4>
                    
                    <div className="space-y-4">
                      {getDefaultTemplate().steps.map((step, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                  Texto
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{typeof step.content === 'string' ? step.content : step.content.es}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-blue-900 mb-1">💡 Consejo</h5>
                          <p className="text-sm text-blue-800">
                            Personaliza esta plantilla con información específica de tu propiedad. 
                            Añade fotos, videos o enlaces para hacerla más útil.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Esta zona mejorará la experiencia de tus huéspedes
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                  >
                    Cerrar
                  </Button>
                  <Button
                    onClick={() => onCreateZone(template)}
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear zona con plantilla
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}