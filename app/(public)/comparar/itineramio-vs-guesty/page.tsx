import { Metadata } from 'next'
import Link from 'next/link'
import {
  Check,
  X,
  ArrowRight,
  QrCode,
  Zap,
  Award,
  ChevronRight,
  Building2,
  Settings,
  Clock,
} from 'lucide-react'
import { Navbar } from '../../../../src/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'Itineramio vs Guesty 2026: Comparativa | Itineramio',
  description: 'Comparativa Itineramio vs Guesty. Plataforma enterprise vs especialista en manuales digitales. Descubre cual necesitas.',
  keywords: [
    'guesty alternativa',
    'itineramio vs guesty',
    'guesty precios',
    'guesty alternativa barata',
    'software gestion alquiler vacacional',
    'guesty espana',
  ],
  alternates: {
    canonical: 'https://www.itineramio.com/comparar/itineramio-vs-guesty',
  },
  openGraph: {
    title: 'Itineramio vs Guesty: Comparativa 2026',
    description: 'Plataforma enterprise vs especialista en manuales digitales para hosts independientes.',
    type: 'article',
    images: [{ url: 'https://www.itineramio.com/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio vs Guesty Comparativa' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Itineramio vs Guesty: Comparativa 2026',
    description: 'Plataforma enterprise vs especialista en manuales digitales.',
    images: ['https://www.itineramio.com/og-image.jpg'],
  },
}

const features = [
  {
    category: 'Tipo de Producto',
    items: [
      { name: 'Enfoque principal', itineramio: 'Manuales digitales', guesty: 'PMS enterprise', description: 'Productos para perfiles muy diferentes' },
      { name: 'Perfil de cliente', itineramio: '1-50 propiedades', guesty: '200+ listings', highlight: true, description: 'Tamano de operacion ideal' },
      { name: 'Channel manager', itineramio: false, guesty: true, description: 'Sincronizacion multi-plataforma' },
      { name: 'Revenue management', itineramio: false, guesty: true, description: 'Pricing dinamico y optimizacion' },
      { name: 'Manuales digitales', itineramio: true, guesty: false, highlight: true, description: 'Guias interactivas para huespedes' },
    ],
  },
  {
    category: 'Experiencia del Huesped',
    items: [
      { name: 'QR Codes por zona', itineramio: true, guesty: false, highlight: true, description: 'QR individuales para cada area del apartamento' },
      { name: 'Creacion con IA', itineramio: true, guesty: false, highlight: true, description: 'Manual generado automaticamente' },
      { name: 'Traduccion automatica', itineramio: '3 idiomas', guesty: false, highlight: true, description: 'Guia en el idioma del huesped' },
      { name: 'Chatbot integrado', itineramio: true, guesty: false, description: 'Respuestas automaticas al huesped' },
      { name: 'Sistema de avisos', itineramio: true, guesty: false, description: 'Avisos preventivos al entrar a la guia' },
    ],
  },
  {
    category: 'Precio y Accesibilidad',
    items: [
      { name: 'Precio base', itineramio: '9 EUR/mes', guesty: 'Precios ocultos', highlight: true, description: 'Transparencia de precios' },
      { name: 'Setup time', itineramio: '10 minutos', guesty: 'Semanas', highlight: true, description: 'Tiempo hasta estar operativo' },
      { name: 'Trial sin tarjeta', itineramio: true, guesty: false, description: 'Prueba sin compromiso' },
      { name: 'Contrato minimo', itineramio: 'Mensual', guesty: 'Anual', description: 'Flexibilidad de compromiso' },
    ],
  },
]

export default function GuestyComparisonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -ml-48 -mb-48"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              Comparativa actualizada 2026
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Itineramio vs Guesty
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8 leading-relaxed">
              Manuales digitales para hosts independientes vs PMS enterprise para grandes gestoras.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="inline-flex items-center justify-center px-8 py-4 bg-white text-violet-600 font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all">
                Probar Itineramio gratis <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a href="#comparativa" className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all">
                Ver comparativa completa
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Notice */}
      <section className="py-8 bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Settings className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 mb-1">Nota: Productos para perfiles muy diferentes</h3>
              <p className="text-amber-800 text-sm">
                <strong>Guesty</strong> es una plataforma enterprise disenada para gestoras con 200+ propiedades (precios ocultos, contratos anuales, ciclos de venta largos).
                <strong> Itineramio</strong> es para hosts independientes con 1-50 propiedades (desde 9 EUR/mes, setup en 10 minutos, sin compromiso).
                Si gestionas menos de 50 propiedades, Guesty es probablemente overkill para tu operacion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Verdict */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-8 border-2 border-violet-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Itineramio</h3>
                  <p className="text-sm text-violet-600 font-medium">Para hosts independientes</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                <strong>Manuales digitales profesionales</strong> para hosts con 1-50 propiedades. Setup en 10 minutos con IA. Desde 9 EUR/mes sin compromiso.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-green-700"><Check className="w-4 h-4" /> Desde 9 EUR/mes (precios transparentes)</li>
                <li className="flex items-center gap-2 text-green-700"><Check className="w-4 h-4" /> Setup en 10 minutos con IA</li>
                <li className="flex items-center gap-2 text-green-700"><Check className="w-4 h-4" /> Sin contrato, cancela cuando quieras</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Guesty</h3>
                  <p className="text-sm text-gray-500 font-medium">Para grandes gestoras</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                <strong>PMS enterprise completo</strong> para gestoras con 200+ propiedades. Channel manager, revenue management, equipo dedicado.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-600"><Check className="w-4 h-4" /> PMS completo para grandes operaciones</li>
                <li className="flex items-center gap-2 text-red-600"><X className="w-4 h-4" /> Precios ocultos (requiere demo comercial)</li>
                <li className="flex items-center gap-2 text-red-600"><X className="w-4 h-4" /> Sin manuales digitales</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="comparativa" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Comparativa de funcionalidades</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Herramientas para escalas de operacion muy diferentes</p>
          </div>
          <div className="space-y-8">
            {features.map((category) => (
              <div key={category.category} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">{category.category}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 w-1/2">Funcionalidad</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-violet-600 w-1/4">Itineramio</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-teal-600 w-1/4">Guesty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {category.items.map((item) => (
                        <tr key={item.name} className={item.highlight ? 'bg-violet-50/50' : 'hover:bg-gray-50'}>
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-3">
                              {item.highlight && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-700">Destacado</span>}
                              <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {item.itineramio === true ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full"><Check className="w-5 h-5 text-green-600" /></div>
                            ) : item.itineramio === false ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full"><X className="w-5 h-5 text-red-500" /></div>
                            ) : (
                              <span className="text-sm font-medium text-violet-600">{item.itineramio}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {item.guesty === true ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full"><Check className="w-5 h-5 text-green-600" /></div>
                            ) : item.guesty === false ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full"><X className="w-5 h-5 text-red-500" /></div>
                            ) : (
                              <span className="text-sm font-medium text-gray-600">{item.guesty}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* When to use */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Cual elegir?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-violet-50 rounded-2xl p-8 border border-violet-200">
              <h3 className="text-xl font-bold text-violet-900 mb-4 flex items-center gap-2"><Zap className="w-5 h-5" /> Elige Itineramio si...</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" /><span>Gestionas <strong>entre 1 y 50 propiedades</strong></span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" /><span>Quieres estar operativo <strong>en 10 minutos</strong>, no en semanas</span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" /><span>Necesitas <strong>precios transparentes</strong>, no una demo comercial</span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" /><span>Tu prioridad es la <strong>experiencia del huesped</strong></span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" /><span>No quieres <strong>contratos anuales</strong></span></li>
              </ul>
            </div>
            <div className="bg-teal-50 rounded-2xl p-8 border border-teal-200">
              <h3 className="text-xl font-bold text-teal-900 mb-4 flex items-center gap-2"><Building2 className="w-5 h-5" /> Elige Guesty si...</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" /><span>Gestionas <strong>mas de 200 propiedades</strong></span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" /><span>Necesitas <strong>revenue management avanzado</strong></span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" /><span>Tienes equipo de operaciones y <strong>presupuesto enterprise</strong></span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" /><span>Necesitas <strong>integraciones complejas</strong> con otros sistemas</span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" /><span>Los manuales para huespedes no son tu prioridad</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Cuanto cuesta Guesty?</h3>
              <p className="text-gray-600">Guesty no publica sus precios. Requiere una demo comercial para obtener cotizacion. Esta disenado para gestoras grandes con 200+ propiedades, por lo que los precios suelen ser significativamente mas altos que herramientas para hosts independientes.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Guesty es overkill para mi?</h3>
              <p className="text-gray-600">Si gestionas menos de 50 propiedades, probablemente si. Guesty esta disenado para gestoras profesionales con equipos de operaciones. Para hosts independientes, herramientas como Itineramio (manuales) o Smoobu (channel manager) son mas adecuadas y economicas.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Puedo usar ambos?</h3>
              <p className="text-gray-600">Si, aunque seria inusual. Si ya usas Guesty como PMS, puedes anadir Itineramio para manuales digitales profesionales, ya que Guesty no ofrece esa funcionalidad.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">No necesitas un PMS enterprise para dar una gran experiencia</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">Crea manuales digitales profesionales en 10 minutos. Desde 9 EUR/mes, sin contratos.</p>
          <Link href="/register" className="inline-flex items-center justify-center px-8 py-4 bg-white text-violet-600 font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all">
            Probar Itineramio gratis <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Breadcrumb */}
      <section className="py-8 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-violet-600">Inicio</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/comparar" className="hover:text-violet-600">Comparativas</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Itineramio vs Guesty</span>
          </div>
        </div>
      </section>
    </div>
  )
}
