'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useSupportWidget } from './hooks/useSupportWidget'
import { SupportWidgetButton } from './SupportWidgetButton'
import { SupportWidgetPanel } from './SupportWidgetPanel'

export function SupportWidget() {
  const pathname = usePathname()
  const { open, setOpen, activeTab, setActiveTab, unreadCount, isLoggedIn } = useSupportWidget()

  // Hide on admin, guide, and zone public pages
  if (
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/guide') ||
    pathname?.startsWith('/z/') ||
    pathname?.startsWith('/tesla-test') ||
    pathname?.startsWith('/landing-tes') ||
    pathname?.startsWith('/checklist-airbnb')
  ) {
    return null
  }

  return (
    <>
      {open && (
        <SupportWidgetPanel
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadCount={unreadCount}
          isLoggedIn={isLoggedIn}
          onClose={() => {
            setOpen(false)
            sessionStorage.setItem('support-widget-dismissed', 'true')
          }}
        />
      )}
      <SupportWidgetButton
        open={open}
        unreadCount={unreadCount}
        onClick={() => setOpen(!open)}
      />
    </>
  )
}
