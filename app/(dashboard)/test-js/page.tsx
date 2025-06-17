'use client'

import React, { useState } from 'react'

export default function TestJSPage() {
  const [clickCount, setClickCount] = useState(0)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    console.log(logMessage)
    setLogs(prev => [...prev, logMessage])
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">JavaScript Test Page</h1>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Click Test</h2>
          <button
            onClick={() => {
              setClickCount(prev => prev + 1)
              addLog(`Button clicked! Count: ${clickCount + 1}`)
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Click me ({clickCount})
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Console Test</h2>
          <div className="space-x-2">
            <button
              onClick={() => {
                console.log('🔵 Direct console.log test')
                addLog('Direct console.log test')
              }}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Console Log
            </button>
            
            <button
              onClick={() => {
                console.error('🔴 Direct console.error test')
                addLog('Direct console.error test')
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Console Error
            </button>
            
            <button
              onClick={() => {
                alert('Alert is working!')
                addLog('Alert shown')
              }}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Alert
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Event Test</h2>
          <button
            onClick={(e) => {
              e.preventDefault()
              addLog(`Event type: ${e.type}, Target: ${e.currentTarget.tagName}`)
            }}
            onMouseEnter={() => addLog('Mouse entered button')}
            onMouseLeave={() => addLog('Mouse left button')}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Hover & Click Me
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Async Test</h2>
          <button
            onClick={async () => {
              addLog('Starting async operation...')
              try {
                await new Promise(resolve => setTimeout(resolve, 1000))
                addLog('Async operation completed!')
              } catch (error) {
                addLog(`Async error: ${error}`)
              }
            }}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Async Operation
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Log Output</h2>
          <div className="bg-gray-100 p-4 rounded max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Click buttons to see logs.</p>
            ) : (
              <ul className="space-y-1 text-sm font-mono">
                {logs.map((log, index) => (
                  <li key={index} className="text-gray-700">{log}</li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={() => setLogs([])}
            className="mt-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Clear logs
          </button>
        </div>
      </div>
    </div>
  )
}