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
  Tablet,
  Settings,
  Wifi,
} from 'lucide-react'
import { Navbar } from '../../../../src/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'Itineramio vs YourWelcome 2026: Comparativa | Itineramio',
  description: 'Comparativa Itineramio vs YourWelcome. 100% web/QR vs tablet fisica. Descubre cual es mas escalable para tu operacion.',
  keywords: [
    'yourwelcome alternativa',
    'itineramio vs yourwelcome',
    'yourwelcome tablet',
    'guia digital huespedes sin tablet',
    'alternativa yourwelcome sin hardware',
    'manual digital apartamento turistico',
  ],
  alternates: {
    canonical: 'https://www.itineramio.com/comparar/itineramio-vs-yourwelcome',
  },
  openGraph: {
    title: 'Itineramio vs YourWelcome: Comparativa 2026',
    description: '100% web/QR vs tablet fisica. Cual es mas escalable para tu alquiler vacacional.',
    type: 'article',
    images: [{ url: 'https://www.itineramio.com/og-image.jpg', width: 1200, height: 630, alt: 'Itineramio vs YourWelcome Comparativa' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Itineramio vs YourWelcome: Comparativa 2026',
    description: '100% web/QR vs tablet fisica. Cual es mas escalable.',
    images: ['https://www.itineramio.com/og-image.jpg'],
  },
}

const features = [
  {
    category: 'Modelo de Funcionamiento',
    items: [
      { name: 'Como accede el huesped', itineramio: 'Link o QR (movil propio)', yourwelcome: 'Tablet fisica en la propiedad', highlight: true, description: 'El punto clave de diferencia' },
      { name: 'Hardware necesario', itineramio: 'Ninguno', yourwelcome: '1 tablet por propiedad', highlight: true, description: 'Inversion inicial en dispositivos' },
      { name: 'Acceso antes de llegar', itineramio: true, yourwelcome: false, highlight: true, description: 'El huesped puede ver la guia antes del check-in' },
      { name: 'Funciona offline', itineramio: 'Con conexion', yourwelcome: true, description: 'Disponibilidad sin internet' },
    ],
  },
  {
    category: 'Funcionalidades',
    items: [
      { name: 'QR Codes por zona', itineramio: true, yourwelcome: false, highlight: true, description: 'QR en cocina, bano, entrada, etc.' },
      { name: 'Creacion con IA', itineramio: true, yourwelcome: false, highlight: true, description: 'Manual generado automaticamente' },
      { name: 'Traduccion automatica', itineramio: '3 idiomas', yourwelcome: 'Multiple', description: 'Guia en el idioma del huesped' },
      { name: 'Chatbot integrado', itineramio: true, yourwelcome: false, description: 'Respuestas automaticas dentro de la guia' },
      { name: 'Upselling', itineramio: false, yourwelcome: true, description: 'Venta de servicios adicionales' },
      { name: 'Analytics', itineramio: true, yourwelcome: true, description: 'Estadisticas de uso' },
    ],
  },
  {
    category: 'Escalabilidad y Costes',
    items: [
      { name: 'Coste por propiedad nueva', itineramio: '0 EUR extra (dentro del plan)', yourwelcome: '200-400 EUR (tablet)', highlight: true, description: 'Coste de escalar la operacion' },
      { name: 'Precio software', itineramio: 'Desde 9 EUR/mes', yourwelcome: 'Desde ~10 USD/mes + tablet', description: 'Coste mensual del software' },
      { name: 'Mantenimiento', itineramio: 'Cero', yourwelcome: 'Cargar, reparar, reponer tablets', highlight: true, description: 'Esfuerzo operativo continuo' },
      { name: 'Riesgo de robo/dano', itineramio: 'No aplica', yourwelcome: 'Si (hardware fisico)', highlight: true, description: 'Riesgo de perder dispositivos' },
    ],
  },
]

export default function YourWelcomeComparisonPage() {
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
              Itineramio vs YourWelcome
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8 leading-relaxed">
              100% web y QR vs tablet fisica en cada propiedad. Cual escala mejor?
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
              <h3 className="font-bold text-amber-900 mb-1">Nota: Dos filosofias diferentes</h3>
              <p className="text-amber-800 text-sm">
                <strong>YourWelcome</strong> requiere instalar una tablet fisica en cada propiedad. El huesped interactua con ella al llegar.
                <strong> Itineramio</strong> es 100% web: el huesped recibe un link o escanea un QR y accede a la guia en su propio movil, incluso antes de llegar.
                La diferencia fundamental es hardware vs software puro.
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
                  <p className="text-sm text-violet-600 font-medium">100% web, sin hardware</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                El huesped accede desde <strong>su propio movil</strong> via link o QR. Sin comprar tablets, sin mantenimiento, sin riesgo de robo. Escala sin coste adicional por propiedad.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-green-700"><Check className="w-4 h-4" /> Cero hardware, cero mantenimiento</li>
                <li className="flex items-center gap-2 text-green-700"><Check className="w-4 h-4" /> El huesped ve la guia ANTES de llegar</li>
                <li className="flex items-center gap-2 text-green-700"><Check className="w-4 h-4" /> QR por zona + creacion con IA</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center">
                  <Tablet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">YourWelcome</h3>
                  <p className="text-sm text-gray-500 font-medium">Tablet fisica por propiedad</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Tablet instalada en cada propiedad con informacion y upselling. <strong>Experiencia tactil en el apartamento</strong>, pero requiere hardware.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-600"><Check className="w-4 h-4" /> Upselling integrado (servicios extra)</li>
                <li className="flex items-center gap-2 text-red-600"><X className="w-4 h-4" /> 200-400 EUR por tablet y propiedad</li>
                <li className="flex items-center gap-2 text-red-600"><X className="w-4 h-4" /> El huesped no ve nada hasta que llega</li>
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
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Software puro vs hardware + software</p>
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
                        <th className="text-center px-6 py-4 text-sm font-semibold text-sky-600 w-1/4">YourWelcome</th>
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
                            {item.yourwelcome === true ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full"><Check className="w-5 h-5 text-green-600" /></div>
                            ) : item.yourwelcome === false ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-full"><X className="w-5 h-5 text-red-500" /></div>
                            ) : (
                              <span className="text-sm font-medium text-gray-600">{item.yourwelcome}</span>
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

      {/* Scaling comparison */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Coste de escalar: 10 propiedades</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">La diferencia se nota al crecer</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-violet-50 rounded-2xl p-8 border border-violet-200">
              <h3 className="text-xl font-bold text-violet-900 mb-6">Itineramio (10 propiedades)</h3>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-gray-600">Hardware</span><span className="font-bold text-gray-900">0 EUR</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Software (plan Host)</span><span className="font-bold text-gray-900">29 EUR/mes</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Mantenimiento</span><span className="font-bold text-gray-900">0 EUR</span></div>
                <div className="border-t border-violet-200 pt-3 flex justify-between"><span className="font-bold text-gray-900">Total primer ano</span><span className="text-2xl font-bold text-violet-600">348 EUR</span></div>
              </div>
            </div>
            <div className="bg-sky-50 rounded-2xl p-8 border border-sky-200">
              <h3 className="text-xl font-bold text-sky-900 mb-6">YourWelcome (10 propiedades)</h3>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-gray-600">10 tablets (~300 EUR c/u)</span><span className="font-bold text-gray-900">3.000 EUR</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Software (~10 USD/prop/mes)</span><span className="font-bold text-gray-900">~100 USD/mes</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Reposicion/reparacion</span><span className="font-bold text-gray-900">Variable</span></div>
                <div className="border-t border-sky-200 pt-3 flex justify-between"><span className="font-bold text-gray-900">Total primer ano</span><span className="text-2xl font-bold text-sky-600">~4.200 EUR</span></div>
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
              <h3 className="text-lg font-bold text-gray-900 mb-2">Necesito una tablet en cada propiedad?</h3>
              <p className="text-gray-600">Con Itineramio, no. El huesped accede a la guia desde su propio movil a traves de un link o escaneando un QR. No hay hardware que comprar, mantener, cargar ni reponer. Con YourWelcome, si: necesitas una tablet por propiedad.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">El huesped puede ver la guia antes de llegar?</h3>
              <p className="text-gray-600">Con Itineramio si: puedes enviar el link automaticamente cuando se confirma la reserva. El huesped llega sabiendo todo. Con YourWelcome no: la tablet esta en la propiedad, asi que el huesped solo accede al llegar.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">YourWelcome tiene upselling y Itineramio no?</h3>
              <p className="text-gray-600">Correcto. YourWelcome permite vender servicios adicionales (tours, transfers, late checkout) directamente desde la tablet. Es su principal ventaja. Si el upselling es critico para tu modelo de negocio, YourWelcome tiene ventaja en ese punto.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Que pasa si roban la tablet?</h3>
              <p className="text-gray-600">Con YourWelcome, pierdes el dispositivo (200-400 EUR) y tienes que reponerlo. Con Itineramio, este problema no existe: no hay hardware fisico que robar o danar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">Manuales digitales sin hardware, sin complicaciones</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">Tu huesped solo necesita su movil. Tu solo necesitas Itineramio.</p>
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
            <span className="text-gray-900">Itineramio vs YourWelcome</span>
          </div>
        </div>
      </section>
    </div>
  )
}
