'use client'

import React, { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'

interface SupportWidgetButtonProps {
  open: boolean
  unreadCount: number
  onClick: () => void
}

export function SupportWidgetButton({ open, unreadCount, onClick }: SupportWidgetButtonProps) {
  const [showLabel, setShowLabel] = useState(false)

  // Show label briefly when widget is closed (after mount)
  useEffect(() => {
    if (open) {
      setShowLabel(false)
      return
    }

    const alreadySeen = sessionStorage.getItem('support-widget-label-shown')
    if (alreadySeen) return

    const showTimer = setTimeout(() => {
      setShowLabel(true)
      sessionStorage.setItem('support-widget-label-shown', 'true')
    }, 1000)

    const hideTimer = setTimeout(() => {
      setShowLabel(false)
    }, 6000)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [open])

  return (
    <div className="fixed bottom-6 right-6 z-[9990] flex items-center gap-3">
      {/* Text label — shows briefly */}
      {!open && showLabel && (
        <div className="hidden md:block animate-fade-in bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 whitespace-nowrap">
          ¿Necesitas ayuda?
        </div>
      )}

      <button
        onClick={onClick}
        aria-label={open ? 'Cerrar soporte' : 'Abrir soporte'}
        className={`
          relative
          w-12 h-12 md:w-14 md:h-14
          rounded-full
          bg-gradient-to-br from-violet-500 to-violet-600
          text-white
          shadow-lg hover:shadow-xl
          flex items-center justify-center
          transition-all duration-300
          hover:scale-110 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2
        `}
      >
        <div className="relative">
          {open ? (
            <X className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300" />
          ) : (
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300" />
          )}
        </div>

        {!open && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  )
}
