'use client'

import { useState } from 'react'

export default function AdminTestPage() {
  const [email, setEmail] = useState('admin@itineramio.com')
  const [password, setPassword] = useState('Admin2024!')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })
      
      const data = await res.json()
      setResponse({
        status: res.status,
        statusText: res.statusText,
        data
      })
    } catch (error) {
      setResponse({ error: error instanceof Error ? error.toString() : 'Unknown error' })
    }
    setLoading(false)
  }

  const testDebugLogin = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/auth/debug-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })
      
      const data = await res.json()
      setResponse({
        status: res.status,
        statusText: res.statusText,
        data
      })
    } catch (error) {
      setResponse({ error: error instanceof Error ? error.toString() : 'Unknown error' })
    }
    setLoading(false)
  }

  const testCheck = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/auth/check', {
        credentials: 'include'
      })
      
      const data = await res.json()
      setResponse({
        status: res.status,
        statusText: res.statusText,
        data
      })
    } catch (error) {
      setResponse({ error: error instanceof Error ? error.toString() : 'Unknown error' })
    }
    setLoading(false)
  }

  const testApi = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/test')
      const data = await res.json()
      setResponse({
        status: res.status,
        statusText: res.statusText,
        data
      })
    } catch (error) {
      setResponse({ error: error instanceof Error ? error.toString() : 'Unknown error' })
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Test Page</h1>
      
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={testLogin}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Login
        </button>
        
        <button
          onClick={testDebugLogin}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Debug Login
        </button>
        
        <button
          onClick={testCheck}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Check Auth
        </button>
        
        <button
          onClick={testApi}
          disabled={loading}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Test API
        </button>
      </div>

      {response && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Response:</h2>
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}