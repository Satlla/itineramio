'use client'

import { useState } from 'react'
import { Button } from '../ui/Button'

export function ZoneCreationDebug({ propertyId }: { propertyId: string }) {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const runDebugTest = async () => {
    setLoading(true)
    setResults([])
    
    try {
      // Test 1: Try the test endpoint
      const test1 = await fetch(`/api/properties/${propertyId}/zones/test`, {
        method: 'POST'
      })
      const test1Result = await test1.json()
      setResults(prev => [...prev, { test: 'Simple test endpoint', status: test1.status, result: test1Result }])
      
      // Test 2: Try the debug endpoint
      const test2 = await fetch(`/api/properties/${propertyId}/zones/debug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Debug Test Zone',
          description: 'Debug test',
          icon: 'home',
          order: 1,
          status: 'ACTIVE'
        })
      })
      const test2Result = await test2.json()
      setResults(prev => [...prev, { test: 'Debug endpoint', status: test2.status, result: test2Result }])
      
      // Test 3: Try the real endpoint
      const timestamp = Date.now()
      const test3 = await fetch(`/api/properties/${propertyId}/zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Real Test Zone ${timestamp}`,
          description: 'Real test',
          icon: 'key',
          order: 2,
          status: 'ACTIVE'
        })
      })
      const test3Text = await test3.text()
      let test3Result
      try {
        test3Result = JSON.parse(test3Text)
      } catch {
        test3Result = { text: test3Text }
      }
      setResults(prev => [...prev, { test: 'Real endpoint', status: test3.status, result: test3Result }])
      
    } catch (error) {
      setResults(prev => [...prev, { test: 'Error', error: String(error) }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-md z-50">
      <h3 className="font-bold mb-2">Zone Creation Debug</h3>
      <Button 
        onClick={runDebugTest} 
        disabled={loading}
        className="mb-3"
      >
        {loading ? 'Running tests...' : 'Run Debug Tests'}
      </Button>
      
      {results.length > 0 && (
        <div className="max-h-60 overflow-y-auto text-xs">
          {results.map((result, index) => (
            <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
              <div className="font-semibold">{result.test}</div>
              {result.status && <div>Status: {result.status}</div>}
              {result.error && <div className="text-red-600">Error: {result.error}</div>}
              {result.result && (
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}