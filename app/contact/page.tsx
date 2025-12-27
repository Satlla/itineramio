import React from 'react'
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/Card'
import { Button } from '../../src/components/ui/Button'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contacta con nosotros
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            ¿Necesitas ayuda? Estamos aquí para asistirte con cualquier pregunta sobre Itineramio.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-violet-600" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">Para soporte general y consultas:</p>
                <a 
                  href="mailto:hola@itineramio.com" 
                  className="text-violet-600 hover:text-violet-800 font-medium"
                >
                  hola@itineramio.com
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-violet-600" />
                  WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">Soporte directo por WhatsApp:</p>
                <a 
                  href="https://wa.me/34600123456" 
                  className="text-violet-600 hover:text-violet-800 font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  +34 600 123 456
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-violet-600" />
                  Teléfono
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">Horario: Lunes a Viernes 9:00 - 18:00</p>
                <a 
                  href="tel:+34600123456" 
                  className="text-violet-600 hover:text-violet-800 font-medium"
                >
                  +34 600 123 456
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-violet-600" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Madrid, España<br />
                  Trabajamos de forma remota para darte el mejor servicio
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Envíanos un mensaje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Asunto
                  </label>
                  <select
                    id="subject"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="">Selecciona un tema</option>
                    <option value="support">Soporte técnico</option>
                    <option value="billing">Facturación</option>
                    <option value="features">Nuevas funcionalidades</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Cuéntanos en qué podemos ayudarte..."
                  />
                </div>

                <Button className="w-full bg-violet-600 hover:bg-violet-700">
                  Enviar mensaje
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Preguntas frecuentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Cómo empiezo a usar Itineramio?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Simplemente regístrate, crea tu primera propiedad y empieza a añadir zonas e instrucciones. 
                  El sistema te guiará paso a paso.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Cómo funciona el período de prueba?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Ofrecemos un período de prueba de 15 días para que explores todas las funcionalidades.
                  Después, elige el plan que mejor se adapte a tus necesidades.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Necesito conocimientos técnicos?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  No, Itineramio está diseñado para ser intuitivo y fácil de usar. 
                  No necesitas ningún conocimiento técnico previo.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Cómo contacto con soporte?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Puedes contactarnos por email, WhatsApp o teléfono. 
                  También puedes usar el formulario de esta página.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}