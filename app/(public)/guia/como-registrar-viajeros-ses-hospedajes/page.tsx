import Link from 'next/link'
import { ItineramioLogo } from '@/components/ui/ItineramioLogo'
import {
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Shield,
  FileText,
  UserCheck,
  Clock,
  Globe,
  Monitor,
} from 'lucide-react'

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Como registrar viajeros en SES.Hospedajes',
  description: 'Tutorial paso a paso para cumplir con la obligacion de registro de viajeros mediante la plataforma SES.Hospedajes del Ministerio del Interior.',
  totalTime: 'PT15M',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Accede a la plataforma SES.Hospedajes', text: 'Entra en la web oficial de SES.Hospedajes del Ministerio del Interior con tu certificado digital o Cl@ve.' },
    { '@type': 'HowToStep', position: 2, name: 'Da de alta tu establecimiento', text: 'Registra tu vivienda turistica con los datos del inmueble y tu numero de registro autonomico.' },
    { '@type': 'HowToStep', position: 3, name: 'Recoge los datos del viajero', text: 'Necesitas: nombre completo, documento de identidad, nacionalidad, fecha de nacimiento y fechas de entrada y salida.' },
    { '@type': 'HowToStep', position: 4, name: 'Comunica los datos en plazo', text: 'Los datos deben comunicarse antes del inicio del alojamiento o, como maximo, en las primeras horas.' },
    { '@type': 'HowToStep', position: 5, name: 'Conserva los registros', text: 'Guarda los comprobantes de comunicacion durante el plazo legalmente establecido.' },
  ],
}

export default function SESHospedajesPage() {
  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />

      <nav className="border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2"><ItineramioLogo size="md" showText /></Link>
          <Link href="/register" className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800">Prueba gratis</Link>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 pt-6">
        <nav className="flex text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900 transition-colors">Inicio</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-gray-900">Guia</span>
        </nav>
      </div>

      <header className="mx-auto max-w-4xl px-6 pt-12 pb-12">
        <p className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-4">Guia practica</p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl leading-tight">
          Como registrar viajeros en SES.Hospedajes
        </h1>
        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
          Desde diciembre de 2024, todos los alojamientos turisticos en Espana estan obligados a comunicar
          los datos de sus viajeros a traves de SES.Hospedajes, la nueva plataforma del Ministerio del Interior.
          Esta guia te explica paso a paso como cumplir con esta obligacion.
        </p>
      </header>

      {/* What is SES */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Que es SES.Hospedajes</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <Shield className="h-6 w-6 text-gray-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Obligacion legal</h3>
              <p className="text-sm text-gray-600">El RD 933/2021 obliga a comunicar datos de viajeros a las autoridades. Sustituye al antiguo parte de viajeros.</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <Globe className="h-6 w-6 text-gray-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Toda Espana</h3>
              <p className="text-sm text-gray-600">Aplica a todos los alojamientos turisticos en Espana, excepto Cataluna (Mossos) y Pais Vasco (Ertzaintza).</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <Monitor className="h-6 w-6 text-gray-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">100% digital</h3>
              <p className="text-sm text-gray-600">Se tramita online a traves de la plataforma del Ministerio del Interior. Necesitas certificado digital o Cl@ve.</p>
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                <strong>Importante:</strong> No cumplir con esta obligacion puede conllevar sanciones. Cada hora
                sin comunicar los datos tras la llegada del viajero incrementa el riesgo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">Paso a paso: como registrar viajeros</h2>

        <div className="space-y-12">
          <div className="flex gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">1</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Accede a SES.Hospedajes</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Entra en la plataforma oficial del Ministerio del Interior. Necesitaras un certificado digital,
                DNI electronico o sistema Cl@ve para identificarte. Si aun no tienes acceso, solicita el alta
                como establecimiento de hospedaje.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">2</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Da de alta tu vivienda turistica</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Registra tu propiedad con los datos del inmueble: direccion completa, numero de registro autonomico,
                tipo de alojamiento y capacidad. Cada propiedad necesita su propio alta.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">3</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recoge los datos de cada viajero</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Para cada huesped necesitas: nombre completo, numero de documento de identidad (DNI/pasaporte),
                nacionalidad, fecha de nacimiento, sexo, y las fechas de entrada y salida. Todos los viajeros
                mayores de 14 anos deben ser registrados.
              </p>
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-sm font-medium text-gray-900 mb-2">Datos obligatorios por viajero:</p>
                <ul className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><FileText className="h-4 w-4" /> Nombre completo</li>
                  <li className="flex items-center gap-2"><UserCheck className="h-4 w-4" /> Documento de identidad</li>
                  <li className="flex items-center gap-2"><Globe className="h-4 w-4" /> Nacionalidad</li>
                  <li className="flex items-center gap-2"><Clock className="h-4 w-4" /> Fecha de nacimiento</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">4</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Comunica los datos en plazo</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Los datos deben comunicarse lo antes posible, idealmente antes de que el viajero inicie su estancia
                o, como maximo, en las primeras horas tras la llegada. No dejes la comunicacion para el dia siguiente.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm flex-shrink-0">5</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Conserva los comprobantes</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Guarda los justificantes de comunicacion que genera la plataforma. Te serviran como prueba de
                cumplimiento en caso de inspeccion. Conservalos durante el plazo que establezca la normativa vigente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Exceptions */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Excepciones por comunidad autonoma</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Cataluna</h3>
              <p className="text-sm text-gray-600">La comunicacion policial se hace a traves del web de los Mossos d Esquadra, no por SES.Hospedajes. Plazo: 24 horas desde el inicio del alojamiento.</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Pais Vasco</h3>
              <p className="text-sm text-gray-600">La comunicacion se realiza a traves de la Ertzaintza, no por SES.Hospedajes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-2xl bg-gray-900 px-8 py-14 text-center sm:px-16">
          <h2 className="text-3xl font-bold text-white">Centraliza la informacion de check-in con Itineramio</h2>
          <p className="mt-4 text-lg text-gray-300">
            Itineramio no sustituye a SES.Hospedajes, pero te ayuda a recoger los datos del huesped de forma ordenada.
            El manual digital centraliza toda la informacion de check-in en un solo lugar, facilitando el proceso
            tanto para ti como para tu huesped.
          </p>
          <p className="mt-4 text-sm text-gray-400">Prueba gratis 15 dias. Sin tarjeta de credito.</p>
          <div className="mt-8">
            <Link href="/register" className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3.5 text-base font-medium text-gray-900 transition-colors hover:bg-gray-100">
              Crear mi manual gratis <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2"><ItineramioLogo size="sm" showText /></Link>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/blog" className="hover:text-gray-900 transition-colors">Blog</Link>
              <Link href="/normativa" className="hover:text-gray-900 transition-colors">Normativa</Link>
              <Link href="/faq" className="hover:text-gray-900 transition-colors">FAQ</Link>
              <Link href="/legal/privacy" className="hover:text-gray-900 transition-colors">Privacidad</Link>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-gray-400">&copy; {new Date().getFullYear()} Itineramio. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
