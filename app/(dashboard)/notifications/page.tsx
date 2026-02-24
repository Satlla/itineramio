'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  Trash2,
  Check,
  MailOpen,
  Clock,
  Calendar,
  User,
  Building2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../src/components/ui/Card'
import { Button } from '../../../src/components/ui/Button'
import { useRealNotifications } from '../../../src/hooks/useRealNotifications'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  data?: any
}

export default function NotificationsPage() {
  const { t } = useTranslation('dashboard')
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useRealNotifications()
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL')
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [hiddenNotifications, setHiddenNotifications] = useState<string[]>([])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'subscription_approved':
      case 'subscription_activated':
      case 'payment_confirmed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'subscription_rejected':
      case 'payment_failed':
      case 'subscription_expired':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'subscription_renewal_requested':
      case 'subscription_expiring':
      case 'evaluation_received':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'property_created':
      case 'zone_created':
        return <Building2 className="w-5 h-5 text-blue-600" />
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getNotificationColor = (type: string, read: boolean) => {
    const baseClasses = read ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-200'
    
    switch (type) {
      case 'subscription_approved':
      case 'payment_confirmed':
        return read ? 'bg-green-50 border-green-200' : 'bg-green-50 border-green-300'
      case 'subscription_rejected':
      case 'payment_failed':
        return read ? 'bg-red-50 border-red-200' : 'bg-red-50 border-red-300'
      case 'subscription_expiring':
        return read ? 'bg-yellow-50 border-yellow-200' : 'bg-yellow-50 border-yellow-300'
      default:
        return baseClasses
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) return t('notifications.timeAgo.justNow')
    if (diffInMinutes < 60) return t('notifications.timeAgo.minutes', { count: diffInMinutes })
    if (diffInHours < 24) return t('notifications.timeAgo.hours', { count: diffInHours })
    if (diffInDays < 7) return t('notifications.timeAgo.days', { count: diffInDays })

    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: diffInDays > 365 ? 'numeric' : undefined
    })
  }

  const filteredNotifications = notifications
    .filter(n => !hiddenNotifications.includes(n.id))
    .filter(notification => {
      if (filter === 'UNREAD') return !notification.read
      if (filter === 'READ') return notification.read
      return true
    })

  const handleMarkAsRead = async (notificationIds: string[]) => {
    try {
      setLoading(true)
      await markAsRead(notificationIds)
      setSelectedNotifications([])
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true)
      await markAllAsRead()
      setSelectedNotifications([])
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNotification = (notificationId: string) => {
    // Hide notification locally (since we don't have delete API yet)
    setHiddenNotifications(prev => [...prev, notificationId])
  }

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    )
  }

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id))
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('notifications.title')}</h1>
          <p className="text-gray-600 mt-2">
            {t('notifications.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              {t('notifications.unreadCount', { count: unreadCount })}
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm text-gray-600">{t('notifications.stats.total')}</div>
                <div className="text-2xl font-bold text-blue-600">
                  {notifications.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <MailOpen className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm text-gray-600">{t('notifications.stats.unread')}</div>
                <div className="text-2xl font-bold text-red-600">
                  {unreadCount}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm text-gray-600">{t('notifications.stats.read')}</div>
                <div className="text-2xl font-bold text-green-600">
                  {notifications.length - unreadCount}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            {/* Filter Tabs */}
            <div className="flex space-x-2">
              {(['ALL', 'UNREAD', 'READ'] as const).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === filterType
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filterType === 'ALL' ? t('notifications.tabs.all') :
                   filterType === 'UNREAD' ? t('notifications.tabs.unread') : t('notifications.tabs.read')}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              {selectedNotifications.length > 0 && (
                <Button
                  onClick={() => handleMarkAsRead(selectedNotifications)}
                  disabled={loading}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-1" />
                  {t('notifications.actions.markSelectedAsRead', { count: selectedNotifications.length })}
                </Button>
              )}
              
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  size="sm"
                  variant="outline"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  {t('notifications.actions.markAllAsRead')}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'UNREAD' ? t('notifications.empty.noUnread') :
                 filter === 'READ' ? t('notifications.empty.noRead') :
                 t('notifications.empty.noNotifications')}
              </h3>
              <p className="text-gray-600">
                {filter === 'ALL'
                  ? t('notifications.empty.description')
                  : t('notifications.empty.changeFilter')
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Select All Option */}
            {filteredNotifications.length > 0 && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  {selectedNotifications.length === filteredNotifications.length ? t('notifications.actions.deselectAll') : t('notifications.actions.selectAll')}
                </span>
              </div>
            )}

            {/* Notifications */}
            {filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all hover:shadow-md cursor-pointer ${
                  getNotificationColor(notification.type, notification.read)
                } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleSelectNotification(notification.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => handleSelectNotification(notification.id)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />

                    {/* Notification Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`font-medium ${
                            notification.read ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className={`mt-1 text-sm ${
                            notification.read ? 'text-gray-500' : 'text-gray-700'
                          }`}>
                            {notification.message}
                          </p>
                          
                          {/* Metadata */}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatTimeAgo(notification.createdAt.toString())}
                            </div>
                            {!notification.read && (
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mr-1" />
                                <span>{t('notifications.new')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarkAsRead([notification.id])
                              }}
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteNotification(notification.id)
                            }}
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  )
}