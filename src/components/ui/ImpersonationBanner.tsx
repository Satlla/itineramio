'use client'

import React, { useState, useEffect } from 'react'
import { Shield, X, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from './Button'

interface ImpersonationData {
  adminId: string
  adminName: string
  adminEmail: string
  targetUserId: string
  targetUserName: string
  targetUserEmail: string
  startedAt: string
}

export function ImpersonationBanner() {
  const [impersonationData, setImpersonationData] = useState<ImpersonationData | null>(null)
  const [isEnding, setIsEnding] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Leer cookie de impersonation
    const checkImpersonation = async () => {
      const cookies = document.cookie.split(';')
      const impersonationCookie = cookies.find(c => c.trim().startsWith('admin-impersonation='))

      if (impersonationCookie) {
        try {
          const value = impersonationCookie.split('=')[1]
          const data = JSON.parse(decodeURIComponent(value))

          // Verificar que haya un admin-token (no auth-token)
          const adminToken = cookies.find(c => c.trim().startsWith('admin-token='))
          const authToken = cookies.find(c => c.trim().startsWith('auth-token='))

          // Si hay auth-token pero NO admin-token, es un usuario normal con cookie huérfano
          if (authToken && !adminToken) {
            console.warn('⚠️ User session with orphaned admin-impersonation cookie, cleaning up...')
            document.cookie = 'admin-impersonation=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; secure; sameSite=lax'
            setImpersonationData(null)
            return
          }

          // Si no hay ningún token, limpiar
          if (!adminToken && !authToken) {
            console.warn('⚠️ No session found, cleaning up admin-impersonation cookie...')
            document.cookie = 'admin-impersonation=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; secure; sameSite=lax'
            setImpersonationData(null)
            return
          }

          // Verificar que realmente es una sesión de impersonation válida (solo si hay admin-token)
          if (adminToken) {
            const response = await fetch('/api/admin/auth/check')
            if (!response.ok) {
              // No es una sesión de admin válida, limpiar cookie
              console.warn('⚠️ Invalid admin session detected, cleaning up...')
              document.cookie = 'admin-impersonation=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; secure; sameSite=lax'
              setImpersonationData(null)
              return
            }

            // Todo OK, mostrar el banner
            setImpersonationData(data)
          }
        } catch (error) {
          console.error('Error parsing impersonation cookie:', error)
          // En caso de error, limpiar el cookie
          document.cookie = 'admin-impersonation=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; secure; sameSite=lax'
          setImpersonationData(null)
        }
      } else {
        setImpersonationData(null)
      }
    }

    checkImpersonation()

    // Verificar cada 3 segundos por si cambia
    const interval = setInterval(checkImpersonation, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleStopImpersonation = async () => {
    if (!impersonationData) return

    setIsEnding(true)

    try {
      const response = await fetch('/api/admin/stop-impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Impersonation terminada:', result)

        // Redirigir al panel de admin
        window.location.href = '/admin/users'
      } else {
        console.error('Error deteniendo impersonation')
        alert('Error al terminar la suplantación')
        setIsEnding(false)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al terminar la suplantación')
      setIsEnding(false)
    }
  }

  if (!impersonationData) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Left side - Info */}
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 flex-shrink-0 animate-pulse" />
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-semibold">MODO ADMIN</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">
                Viendo como: <strong>{impersonationData.targetUserName || impersonationData.targetUserEmail}</strong>
              </span>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-2">
            <span className="text-xs hidden md:inline opacity-90">
              Admin: {impersonationData.adminName}
            </span>
            <Button
              onClick={handleStopImpersonation}
              disabled={isEnding}
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs py-1 px-3"
              variant="outline"
            >
              {isEnding ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saliendo...
                </>
              ) : (
                <>
                  <LogOut className="w-3 h-3 mr-1" />
                  Volver a Admin
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
