'use client'

import { useState } from 'react'

export default function DebugLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState('')

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/force-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()

      if (data.success) {
        setResult('✅ Login exitoso! Token: ' + data.token.substring(0, 20) + '...')
        
        // Test auth immediately
        setTimeout(async () => {
          const authTest = await fetch('/api/auth/me')
          const authResult = await authTest.json()
          setResult(prev => prev + '\n\nAuth test: ' + JSON.stringify(authResult, null, 2))
        }, 1000)
        
      } else {
        setResult('❌ Error: ' + data.error)
      }
      
    } catch (error) {
      setResult('❌ Error de conexión: ' + error)
    }
  }

  const testCookies = async () => {
    try {
      const response = await fetch('/api/debug-cookies')
      const data = await response.json()
      setResult('Cookies: ' + JSON.stringify(data, null, 2))
    } catch (error) {
      setResult('Error testing cookies: ' + error)
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Login</h1>
      
      <div className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Force Login
        </button>
        
        <button
          onClick={testCookies}
          className="w-full bg-green-600 text-white p-2 rounded"
        >
          Test Cookies
        </button>
        
        <button
          onClick={() => window.location.href = '/account'}
          className="w-full bg-purple-600 text-white p-2 rounded"
        >
          Go to Account
        </button>
      </div>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}
    </div>
  )
}