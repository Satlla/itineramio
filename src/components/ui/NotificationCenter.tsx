'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, ArrowLeft, AlertTriangle, AlertCircle, Info, ExternalLink, CheckCircle, Star, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Notification } from '../../types/notifications'
import { Button } from './Button'

// Helper function to safely get text from multilingual objects
const getTextSafely = (value: any): string => {
  if (typeof value === 'string') {
    return value
  }
  if (value && typeof value === 'object') {
    return value.es || value.en || value.fr || String(value)
  }
  return String(value || '')
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  onBack: () => void
  notifications: Notification[]
  unreadCount: number
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
}

export function NotificationCenter({
  isOpen,
  onClose,
  onBack,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationCenterProps) {
  const { t } = useTranslation('common')

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />
      case 'evaluation':
        return <Star className="w-5 h-5 text-yellow-600" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getNotificationBg = (type: Notification['type'], read: boolean) => {
    if (read) {
      return 'bg-white border-gray-200'
    }
    return 'bg-gray-50 border-gray-200'
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return t('notifications.timeAgo.minutes', { count: minutes })
    } else if (hours < 24) {
      return t('notifications.timeAgo.hours', { count: hours })
    } else {
      return t('notifications.timeAgo.days', { count: days })
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute top-0 left-0 right-0 bottom-0 bg-white z-10"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          <div className="p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <button
                  onClick={onBack}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{t('notifications.title')}</h2>
                  {unreadCount > 0 && (
                    <p className="text-sm text-gray-500">{t('notifications.unread', { count: unreadCount })}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Mark all as read button */}
            {unreadCount > 0 && (
              <div className="mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMarkAllAsRead}
                  className="text-sm"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('notifications.markAllRead')}
                </Button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('notifications.empty')}
                  </h3>
                  <p className="text-gray-500">
                    {t('notifications.emptyDescription')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                        getNotificationBg(notification.type, notification.read)
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          onMarkAsRead(notification.id)
                        }
                        if (notification.actionUrl) {
                          window.location.href = notification.actionUrl
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {getTextSafely(notification.title)}
                                </h4>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onMarkAsRead(notification.id)
                                  }}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                  <X className="w-3 h-3 text-gray-400" />
                                </button>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">
                                {getTextSafely(notification.message)}
                              </p>
                              
                              {/* Evaluation-specific details */}
                              {notification.type === 'evaluation' && notification.metadata && (
                                <div className="mb-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                                  <div className="flex items-center gap-2 text-xs text-yellow-800">
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: 5 }, (_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-3 h-3 ${
                                            i < (notification.metadata?.rating || 0)
                                              ? 'fill-yellow-400 text-yellow-400'
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                      <span className="font-medium ml-1">
                                        {notification.metadata?.rating || 0}/5
                                      </span>
                                    </div>
                                    <span>•</span>
                                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                      notification.metadata?.isPublic
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {notification.metadata?.isPublic ? t('notifications.evaluation.public') : t('notifications.evaluation.private')}
                                    </span>
                                    {notification.metadata?.hasComment && (
                                      <>
                                        <span>•</span>
                                        <MessageCircle className="w-3 h-3" />
                                        <span>{t('notifications.evaluation.withComment')}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {formatTime(notification.createdAt)}
                                </span>
                                {notification.actionUrl && (
                                  <span className="text-xs text-violet-600 hover:text-violet-700 font-medium">
                                    {t('notifications.viewDetails')}
                                  </span>
                                )}
                              </div>
                            </div>
                            {!notification.read && (
                              <div className="absolute top-4 right-4 w-2 h-2 bg-violet-600 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}