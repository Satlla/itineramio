'use client'

import { useState } from 'react'

export default function TestJSPage() {
  const [count, setCount] = useState(0)
  const [logs, setLogs] = useState<string[]>(['Page loaded'])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    console.log(`[${timestamp}] ${message}`)
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">JavaScript Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <p className="mb-2">Click counter: {count}</p>
          <button
            onClick={() => {
              setCount(count + 1)
              addLog(`Button clicked! Count: ${count + 1}`)
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Click me
          </button>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Console Logs:</h2>
          <div className="bg-gray-100 p-4 rounded max-h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono">{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}