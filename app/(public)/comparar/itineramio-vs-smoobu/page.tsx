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
  Calendar,
  Settings,
  Globe,
} from 'lucide-react'
import { Navbar } from '../../../../src/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'Itineramio vs Smoobu 2026: Comparativa | Itineramio',
  description: 'Comparativa Itineramio vs Smoobu. Channel manager con PMS vs especialista en manuales digitales. Descubre cual necesitas.',
  keywords: [
    'smoobu alternativa',
    'itineramio vs smoobu',
    'smoobu manuales digitales',
    'smoobu precios',
    'software gestion airbnb espana',
    'channel manager vs manual digital',
  ],
  alternates: {
    canonical: 'https://www.itineramio.com/comparar/itineramio-vs-smoobu',
  },
  openGraph: {
    title: 'Itineramio vs Smoobu: Comparativa 2026',
    description: 'Channel manager con PMS vs especialista en manuales digitales. Descubre cual es mejor para ti.',
    type: 'article',
    images: [{ url: 'https://www.itineramio.com/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio vs Smoobu Comparativa' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Itineramio vs Smoobu: Comparativa 2026',
    description: 'Channel manager con PMS vs especialista en manuales digitales.',
    images: ['https://www.itineramio.com/og-image.jpg'],
  },
}

const features = [
  {
    category: 'Tipo de Producto',
    items: [
      { name: 'Enfoque principal', itineramio: 'Manuales digitales', smoobu: 'Channel manager + PMS', description: 'Cada uno resuelve un problema diferente' },
      { name: 'Channel manager', itineramio: false, smoobu: true, description: 'Sincronizacion de calendarios entre plataformas' },
      { name: 'Gestion de reservas', itineramio: false, smoobu: true, description: 'Panel centralizado de reservas' },
      { name: 'Manuales digitales', itineramio: true, smoobu: false, highlight: true, description: 'Guias interactivas para huespedes' },
      { name: 'Web de reserva directa', itineramio: false, smoobu: true, description: 'Motor de reservas propio' },
    ],
  },
  {
    category: 'Funcionalidades de Manuales',
    items: [
      { name: 'QR Codes por zona', itineramio: true, smoobu: false, highlight: true, description: 'QR individuales para cocina, bano, WiFi, etc.' },
      { name: 'Creacion con IA', itineramio: true, smoobu: false, highlight: true, description: 'Genera el manual automaticamente con IA' },
      { name: 'Traduccion automatica', itineramio: '3 idiomas', smoobu: false, highlight: true, description: 'Guia en el idioma del huesped sin configuracion' },
      { name: 'Chatbot integrado', itineramio: true, smoobu: false, description: 'Responde preguntas del huesped dentro de la guia' },
      { name: 'Analytics de uso', itineramio: true, smoobu: false, description: 'Estadisticas de que zonas consulta el huesped' },
      { name: 'Sistema de avisos', itineramio: true, smoobu: false, description: 'Avisos preventivos al huesped al abrir la guia' },
    ],
  },
  {
    category: 'Precio y Valor',
    items: [
      { name: 'Precio base', itineramio: '9 EUR/mes', smoobu: '23 EUR/mes', highlight: true, description: 'Coste mensual inicial' },
      { name: 'Plan para 10 propiedades', itineramio: '29 EUR/mes', smoobu: '~45 EUR/mes', highlight: true, description: 'Coste para un host semi-profesional' },
      { name: 'Trial sin tarjeta', itineramio: true, smoobu: true, description: 'Prueba sin compromiso' },
    ],
  },
]

export default function SmoobuComparisonPage() {
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
              Itineramio vs Smoobu
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8 leading-relaxed">
              Especialista en manuales digitales vs Channel manager con PMS: productos complementarios, no rivales.
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
              <h3 className="font-bold text-amber-900 mb-1">Nota importante: Resuelven problemas diferentes</h3>
              <p className="text-amber-800 text-sm">
                <strong>Smoobu</strong> es un channel manager y PMS espanol (sincroniza calendarios, gestiona reservas, web de reserva directa).
                <strong> Itineramio</strong> se especializa en manuales digitales para huespedes (guias interactivas, QR por zona, chatbot IA).
                Muchos hosts usan ambos: Smoobu para gestionar reservas e Itineramio para la experiencia del huesped.
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
                  <p className="text-sm text-violet-600 font-medium">Especialista en manuales</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Perfecto para crear <strong>manuales digitales profesionales</strong> con QR por zona, creacion con IA, traduccion automatica y chatbot integrado. Desde 9 EUR/mes.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-green-700"><Check className="w-4 h-4" /> QR codes por zona (exclusivo)</li>
                <li className="flex items-center gap-2 text-green-700"><Check className="w-4 h-4" /> Creacion con IA en minutos</li>
                <li className="flex items-center gap-2 text-green-700"><Check className="w-4 h-4" /> Traduccion automatica a 3 idiomas</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Smoobu</h3>
                  <p className="text-sm text-gray-500 font-medium">Channel manager + PMS</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Ideal si necesitas <strong>sincronizar calendarios</strong> entre Airbnb, Booking y tu web propia. PMS espanol con buen soporte local.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-600"><Check className="w-4 h-4" /> Channel manager multi-plataforma</li>
                <li className="flex items-center gap-2 text-gray-600"><Check className="w-4 h-4" /> Web de reserva directa</li>
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
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Herramientas complementarias para diferentes necesidades</p>
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
                        <th className="text-center px-6 py-4 text-sm font-semibold text-orange-600 w-1/4">Smoobu</th>
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
                            {item.smoobu === true ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full"><Check className="w-5 h-5 text-green-600" /></div>
                            ) : item.smoobu === false ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full"><X className="w-5 h-5 text-red-500" /></div>
                            ) : (
                              <span className="text-sm font-medium text-gray-600">{item.smoobu}</span>
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
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Depende de que problema necesitas resolver primero</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-violet-50 rounded-2xl p-8 border border-violet-200">
              <h3 className="text-xl font-bold text-violet-900 mb-4 flex items-center gap-2"><Zap className="w-5 h-5" /> Elige Itineramio si...</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" /><span>Quieres reducir <strong>llamadas y mensajes repetitivos</strong> de huespedes</span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" /><span>Necesitas <strong>QR por zona</strong> en cada apartamento</span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" /><span>Tienes <strong>huespedes internacionales</strong> y necesitas traduccion</span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" /><span>Buscas crear manuales <strong>con IA en minutos</strong></span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" /><span>Ya gestionas reservas directamente en Airbnb/Booking</span></li>
              </ul>
            </div>
            <div className="bg-orange-50 rounded-2xl p-8 border border-orange-200">
              <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" /> Elige Smoobu si...</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" /><span>Necesitas <strong>sincronizar calendarios</strong> entre plataformas</span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" /><span>Quieres una <strong>web de reserva directa</strong></span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" /><span>Buscas un <strong>PMS espanol</strong> con soporte en tu idioma</span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" /><span>Necesitas gestion centralizada de <strong>multiples canales</strong></span></li>
                <li className="flex items-start gap-3"><Check className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" /><span>Los manuales para huespedes no son tu prioridad ahora</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-violet-100 to-orange-100 rounded-2xl p-8 border border-violet-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">La combinacion mas comun</h3>
                  <p className="text-gray-600">
                    Muchos hosts espanoles usan <strong>Smoobu para gestionar reservas y calendarios</strong> e <strong>Itineramio para los manuales digitales</strong>.
                    Son herramientas complementarias: Smoobu no tiene manuales e Itineramio no tiene channel manager. Juntos cubren toda la operativa.
                  </p>
                </div>
              </div>
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
              <h3 className="text-lg font-bold text-gray-900 mb-2">Smoobu tiene manuales digitales?</h3>
              <p className="text-gray-600">No. Smoobu se centra en la gestion de reservas, channel management y web de reserva directa. No ofrece manuales digitales, QR por zona ni chatbot para huespedes. Para eso necesitas una herramienta especializada como Itineramio.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Puedo usar Itineramio junto con Smoobu?</h3>
              <p className="text-gray-600">Si, son complementarios. Smoobu gestiona tus reservas y calendarios, mientras Itineramio proporciona la guia digital al huesped con toda la informacion del apartamento, QR por zona y chatbot.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Cual es mas barato?</h3>
              <p className="text-gray-600">Itineramio empieza en 9 EUR/mes (hasta 2 propiedades) y Smoobu en 23 EUR/mes. Pero comparan cosas diferentes: si necesitas channel manager, Smoobu es la opcion. Si necesitas manuales digitales, Itineramio. Muchos hosts usan ambos por unos 38 EUR/mes en total.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Necesito un channel manager?</h3>
              <p className="text-gray-600">Depende. Si solo publicas en Airbnb o solo en Booking, probablemente no. Si publicas en varias plataformas y necesitas sincronizar calendarios y precios, un channel manager como Smoobu te ahorra mucho tiempo y evita overbookings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">Manuales digitales profesionales desde 9 EUR/mes</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">Compatible con Smoobu y cualquier PMS. Crea tu manual con IA en minutos.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center px-8 py-4 bg-white text-violet-600 font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all">
              Probar Itineramio gratis <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="/comparar" className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all">
              Ver mas comparativas
            </Link>
          </div>
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
            <span className="text-gray-900">Itineramio vs Smoobu</span>
          </div>
        </div>
      </section>
    </div>
  )
}
