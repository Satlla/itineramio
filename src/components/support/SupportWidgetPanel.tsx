'use client'

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageCircle, BookOpen, Bell, X } from 'lucide-react'
import { ChatTab } from './tabs/ChatTab'
import { ArticlesTab } from './tabs/ArticlesTab'
import { UpdatesTab } from './tabs/UpdatesTab'

type TabType = 'chat' | 'articles' | 'updates'

interface SupportWidgetPanelProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  unreadCount: number
  isLoggedIn: boolean
  onClose: () => void
}

export function SupportWidgetPanel({
  activeTab,
  setActiveTab,
  unreadCount,
  isLoggedIn,
  onClose,
}: SupportWidgetPanelProps) {
  const { t } = useTranslation('support')
  const [visible, setVisible] = useState(false)

  // Trigger animation on mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const tabs: { key: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'chat', label: t('tabs.chat'), icon: <MessageCircle className="w-4 h-4" /> },
    { key: 'articles', label: t('tabs.articles'), icon: <BookOpen className="w-4 h-4" /> },
    {
      key: 'updates',
      label: t('tabs.updates'),
      icon: <Bell className="w-4 h-4" />,
      badge: unreadCount,
    },
  ]

  return (
    <div
      className={`
        fixed z-[9990]
        bottom-0 right-0 w-full
        md:bottom-24 md:right-6 md:w-[400px]
        transition-all duration-300 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      <div className="bg-white md:rounded-2xl rounded-t-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[calc(100vh-6rem)] md:max-h-[calc(100vh-8rem)] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-3 md:rounded-t-2xl rounded-t-2xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">Sof<span className="font-bold">IA</span></h2>
              <p className="text-white/70 text-[10px] leading-tight">Att. Cliente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1"
            aria-label={t('widget.close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium
                transition-all duration-200
                ${
                  activeTab === tab.key
                    ? 'text-violet-600 border-b-2 border-violet-500 bg-violet-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 ? (
                <span className="bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0 relative" style={{ minHeight: '350px' }}>
          <div className="absolute inset-0">
            {activeTab === 'chat' && <ChatTab isLoggedIn={isLoggedIn} />}
            {activeTab === 'articles' && <ArticlesTab />}
            {activeTab === 'updates' && <UpdatesTab />}
          </div>
        </div>
      </div>
    </div>
  )
}
