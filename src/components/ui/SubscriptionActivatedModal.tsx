'use client'

import React, { useEffect } from 'react'
import { CheckCircle2, X, CreditCard, Calendar, Building2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

interface NotificationData {
  id: string
  data?: {
    planName?: string
    subscriptionId?: string
    invoiceId?: string
  }
}

interface SubscriptionActivatedModalProps {
  onClose: () => void
  notification: NotificationData
}

export const SubscriptionActivatedModal: React.FC<SubscriptionActivatedModalProps> = ({ onClose, notification }) => {
  const router = useRouter()
  const { t } = useTranslation('common')

  useEffect(() => {
    // Marcar la notificación como leída al mostrar el modal
    const markAsRead = async () => {
      try {
        await fetch(`/api/notifications/${notification.id}/read`, {
          method: 'PATCH',
          credentials: 'include'
        })
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }
    markAsRead()
  }, [notification.id])

  const handleViewSubscription = () => {
    router.push('/subscriptions')
    onClose()
  }

  const handleCreateProperty = () => {
    router.push('/properties/new')
    onClose()
  }

  const handleGoToDashboard = () => {
    router.push('/main')
    onClose()
  }

  const planName = notification.data?.planName || 'tu plan'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl max-w-[90vw] sm:max-w-[90vw] sm:max-w-sm md:max-w-md md:max-w-lg w-full overflow-hidden animate-in fade-in duration-300 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 sm:p-3 sm:p-4 md:p-3 sm:p-4 md:p-6 lg:p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 sm:p-4 mb-3 sm:mb-4">
              <CheckCircle2 className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
            </div>
            <h2 className="text-base sm:text-lg md:text-xl sm:text-lg sm:text-base sm:text-lg md:text-xl md:text-2xl font-bold mb-2">
              {t('modals.subscriptionActivated.title')}
            </h2>
            <p className="text-sm sm:text-base text-green-100">
              {t('modals.subscriptionActivated.planReady', { planName })}
            </p>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 sm:p-3 sm:p-4 md:p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">{t('modals.subscriptionActivated.manageMoreProperties')}</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {t('modals.subscriptionActivated.manageMorePropertiesDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">{t('modals.subscriptionActivated.premiumAccess')}</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {t('modals.subscriptionActivated.premiumAccessDesc', { planName })}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-amber-100 rounded-lg flex-shrink-0">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">{t('modals.subscriptionActivated.transparentBilling')}</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {t('modals.subscriptionActivated.transparentBillingDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Botones de accion */}
          <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t">
            <button
              onClick={handleCreateProperty}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {t('modals.subscriptionActivated.createNewProperty')}
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={handleViewSubscription}
              className="w-full border-2 border-gray-200 text-gray-700 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              {t('modals.subscriptionActivated.viewSubscriptionDetails')}
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={handleGoToDashboard}
              className="w-full text-gray-600 hover:text-gray-900 py-2 text-sm sm:text-base font-medium underline underline-offset-4 transition-colors"
            >
              {t('modals.subscriptionActivated.goToDashboard')}
            </button>
          </div>

          <p className="text-[10px] sm:text-xs text-center text-gray-500">
            {t('modals.subscriptionActivated.contactUs')}{' '}
            <a href="mailto:hola@itineramio.com" className="text-green-600 hover:underline">
              hola@itineramio.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
