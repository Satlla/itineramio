'use client'

import React, { useState, useEffect } from 'react'
import { Shield, X, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('common')
  const [impersonationData, setImpersonationData] = useState<ImpersonationData | null>(null)
  const [isEnding, setIsEnding] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkImpersonation = async () => {
      try {
        const response = await fetch('/api/admin/impersonation-status')
        if (response.ok) {
          const result = await response.json()
          setImpersonationData(result.isImpersonating ? result.data : null)
        } else {
          setImpersonationData(null)
        }
      } catch {
        setImpersonationData(null)
      }
    }

    checkImpersonation()
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
        // Redirigir al panel de admin
        window.location.href = '/admin/users'
      } else {
        alert(t('admin.impersonation.error'))
        setIsEnding(false)
      }
    } catch (error) {
      alert(t('admin.impersonation.error'))
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
              <span className="font-semibold">{t('admin.impersonation.label')}</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">
                {t('admin.impersonation.viewing')} <strong>{impersonationData.targetUserName || impersonationData.targetUserEmail}</strong>
              </span>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-2">
            <span className="text-xs hidden md:inline opacity-90">
              {t('admin.impersonation.admin')}: {impersonationData.adminName}
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
                  {t('admin.impersonation.exiting')}
                </>
              ) : (
                <>
                  <LogOut className="w-3 h-3 mr-1" />
                  {t('admin.impersonation.backToAdmin')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
