'use client'

import { useState } from 'react'

export default function AdminTestPaymentPage() {
  const [invoiceId, setInvoiceId] = useState('cmebxhi3v00037cp0capgl7s4')
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const testConfirmPayment = async () => {
    setLoading(true)
    setResult('Processing...')
    setStatus('idle')
    
    try {
      const response = await fetch(`/api/admin/payments/${invoiceId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentReference: 'MANUAL-' + Date.now(),
          confirmedAt: new Date().toISOString()
        })
      })
      
      const text = await response.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        data = text
      }
      
      const resultText = `Status: ${response.status} ${response.statusText}
Response: ${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}`
      
      setResult(resultText)
      setStatus(response.ok ? 'success' : 'error')
    } catch (error: any) {
      setResult(`Error: ${error.message}`)
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin - Test Payment Confirmation</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice ID
            </label>
            <input
              type="text"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter invoice ID"
            />
          </div>
          
          <button
            onClick={testConfirmPayment}
            disabled={loading || !invoiceId}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : 'Confirm Payment'}
          </button>
          
          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              status === 'success' ? 'bg-green-50 border border-green-200' :
              status === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-gray-50 border border-gray-200'
            }`}>
              <pre className={`overflow-x-auto text-sm ${
                status === 'success' ? 'text-green-900' :
                status === 'error' ? 'text-red-900' :
                'text-gray-900'
              }`}>
                {result}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Notas:</h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Esta página es para pruebas de confirmación de pagos</li>
            <li>• El endpoint ahora maneja facturas con notas en texto plano</li>
            <li>• Si la factura no tiene propiedades en JSON, solo actualiza el estado</li>
          </ul>
        </div>
      </div>
    </div>
  )
}