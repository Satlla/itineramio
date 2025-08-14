'use client'

import { useState } from 'react'

export default function TestPaymentPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const testAPI = async () => {
    setLoading(true)
    setResult('Testing...')
    setStatus('idle')
    
    try {
      const response = await fetch('/api/admin/payments/cme81rmqh00017c1voih8z5f0/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentReference: 'TEST-REF-' + Date.now(),
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
Headers: ${JSON.stringify([...response.headers.entries()], null, 2)}
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Payment Confirm API</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">Invoice ID: cme81rmqh00017c1voih8z5f0</p>
          
          <button
            onClick={testAPI}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Testing...' : 'Test API Call'}
          </button>
          
          {result && (
            <pre className={`mt-6 p-4 rounded-lg overflow-x-auto text-sm ${
              status === 'success' ? 'bg-green-50 text-green-900 border border-green-200' :
              status === 'error' ? 'bg-red-50 text-red-900 border border-red-200' :
              'bg-gray-50 text-gray-900 border border-gray-200'
            }`}>
              {result}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}