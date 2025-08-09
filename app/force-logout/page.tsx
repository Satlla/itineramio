'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ForceLogoutPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      try {
        const response = await fetch('/api/auth/force-logout', {
          method: 'POST',
          credentials: 'include'
        })
        
        if (response.ok) {
          setStatus('success')
          setMessage('Logout completado. Redirigiendo...')
          
          // Clear any client-side storage
          localStorage.clear()
          sessionStorage.clear()
          
          // Redirect after a short delay
          setTimeout(() => {
            window.location.href = '/login'
          }, 2000)
        } else {
          throw new Error('Logout failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Error durante el logout')
        console.error('Force logout error:', error)
      }
    }

    performLogout()
  }, [])

  const handleManualRedirect = () => {
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Logout Forzado
        </h1>
        
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600">Cerrando sesión...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-green-600 font-medium">{message}</p>
            <button 
              onClick={handleManualRedirect}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Ir a Login
            </button>
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">{message}</p>
            <button 
              onClick={handleManualRedirect}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Ir a Login Manual
            </button>
          </div>
        )}
      </div>
    </div>
  )
}