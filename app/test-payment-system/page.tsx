'use client'

import { useState } from 'react'

export default function AdminTestCompletePage() {
  const [results, setResults] = useState<{[key: string]: any}>({})
  const [loading, setLoading] = useState<{[key: string]: boolean}>({})

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [testName]: true }))
    try {
      const result = await testFn()
      setResults(prev => ({ ...prev, [testName]: result }))
    } catch (error: any) {
      setResults(prev => ({ ...prev, [testName]: { error: error.message } }))
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }))
    }
  }

  const testPaymentConfirmation = async () => {
    const response = await fetch('/api/admin/payments/cmebxhi3v00037cp0capgl7s4/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentReference: 'TEST-CONFIRM-' + Date.now(),
        confirmedAt: new Date().toISOString()
      })
    })
    const data = await response.json()
    return { status: response.status, data }
  }

  const testPropertyActivation = async () => {
    const response = await fetch('/api/admin/properties/cmebxhhyf00017cp08h002vdq/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        months: 3,
        reason: 'Test activation via admin panel'
      })
    })
    const data = await response.json()
    return { status: response.status, data }
  }

  const testInvoicePayment = async () => {
    const response = await fetch('/api/admin/invoices/cmebxhi3v00037cp0capgl7s4/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentMethod: 'bank_transfer',
        paymentReference: 'TEST-PAYMENT-' + Date.now(),
        paidDate: new Date().toISOString()
      })
    })
    const data = await response.json()
    return { status: response.status, data }
  }

  const tests = [
    {
      name: 'payment-confirmation',
      title: 'Confirmar Pago (con propiedades)',
      description: 'Prueba la confirmación de pago que activa propiedades automáticamente',
      action: testPaymentConfirmation
    },
    {
      name: 'property-activation',
      title: 'Activar Propiedad Sin Factura',
      description: 'Prueba la activación directa de propiedades sin generar factura',
      action: testPropertyActivation
    },
    {
      name: 'invoice-payment',
      title: 'Marcar Factura como Pagada',
      description: 'Prueba marcar una factura como pagada (debería funcionar ahora)',
      action: testInvoicePayment
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin - Pruebas Completas del Sistema</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Test Data Created:</h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Invoice ID:</strong> cmebxhi3v00037cp0capgl7s4</li>
            <li>• <strong>Property ID:</strong> cmebxhhyf00017cp08h002vdq</li>
            <li>• <strong>User:</strong> demo@itineramio.com</li>
            <li>• <strong>Property:</strong> Test Property for Invoice</li>
          </ul>
        </div>

        <div className="space-y-6">
          {tests.map((test) => (
            <div key={test.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{test.title}</h3>
                  <p className="text-sm text-gray-600">{test.description}</p>
                </div>
                <button
                  onClick={() => runTest(test.name, test.action)}
                  disabled={loading[test.name]}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading[test.name] ? 'Probando...' : 'Probar'}
                </button>
              </div>

              {results[test.name] && (
                <div className={`p-4 rounded-lg ${
                  results[test.name].error || (results[test.name].status >= 400) ? 
                  'bg-red-50 border border-red-200' : 
                  'bg-green-50 border border-green-200'
                }`}>
                  <pre className={`text-sm overflow-x-auto ${
                    results[test.name].error || (results[test.name].status >= 400) ? 
                    'text-red-900' : 'text-green-900'
                  }`}>
                    {JSON.stringify(results[test.name], null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">Notas importantes:</h2>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Los correos no se enviarán hasta que configures RESEND_API_KEY en Vercel</li>
            <li>• Todas las pruebas requieren autenticación admin</li>
            <li>• La propiedad se activará por 3 meses desde hoy</li>
            <li>• Se crearán notificaciones para el usuario</li>
          </ul>
        </div>
      </div>
    </div>
  )
}