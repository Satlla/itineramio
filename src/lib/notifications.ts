// Server-side notification utilities
import { prisma } from './prisma'

export type NotificationType = 'success' | 'info' | 'warning' | 'error' | 'evaluation'

export interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: any
  actionUrl?: string
}

// Create a notification in the database
export async function createNotification({
  userId,
  type,
  title,
  message,
  data = {},
  actionUrl
}: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: {
          ...data,
          ...(actionUrl && { actionUrl })
        }
      }
    })
    
    console.log('✅ Notification created:', notification.id)
    return notification
  } catch (error) {
    console.error('❌ Error creating notification:', error)
    throw error
  }
}

// Get notifications for a user
export async function getUserNotifications(userId: string, limit = 50) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
    
    return notifications
  } catch (error) {
    console.error('❌ Error fetching notifications:', error)
    return []
  }
}

// Mark notifications as read
export async function markNotificationsAsRead(userId: string, notificationIds: string[]) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId // Ensure user owns the notifications
      },
      data: { read: true }
    })
    
    return result.count
  } catch (error) {
    console.error('❌ Error marking notifications as read:', error)
    throw error
  }
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: { read: true }
    })
    
    return result.count
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error)
    throw error
  }
}

// Delete old notifications (cleanup)
export async function deleteOldNotifications(daysToKeep = 30) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
  
  try {
    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate }
      }
    })
    
    console.log(`🧹 Deleted ${result.count} old notifications`)
    return result.count
  } catch (error) {
    console.error('❌ Error deleting old notifications:', error)
    throw error
  }
}

// Notification templates
export const notificationTemplates = {
  propertyCreated: (propertyName: string) => ({
    type: 'success' as NotificationType,
    title: 'Propiedad creada exitosamente',
    message: `Tu propiedad "${propertyName}" ha sido creada. ¡Ahora puedes agregar zonas y contenido!`
  }),
  
  zoneCreated: (propertyName: string, zoneName: string) => ({
    type: 'success' as NotificationType,
    title: 'Nueva zona agregada',
    message: `La zona "${zoneName}" ha sido agregada a ${propertyName}`
  }),
  
  evaluationReceived: (propertyName: string, rating: number, isZone = false) => ({
    type: 'evaluation' as NotificationType,
    title: `Nueva evaluación: ${rating} estrellas`,
    message: `Tu ${isZone ? 'zona' : 'propiedad'} en ${propertyName} ha recibido una evaluación de ${rating} estrellas`
  }),
  
  propertyActivated: (propertyName: string) => ({
    type: 'success' as NotificationType,
    title: 'Propiedad activada',
    message: `¡Felicidades! "${propertyName}" está ahora activa y visible para tus huéspedes`
  }),
  
  propertyDeactivated: (propertyName: string) => ({
    type: 'warning' as NotificationType,
    title: 'Propiedad desactivada',
    message: `"${propertyName}" ha sido desactivada y ya no es visible públicamente`
  }),
  
  zoneWarning: (propertyName: string, zoneName: string, issue: string) => ({
    type: 'warning' as NotificationType,
    title: `Atención requerida en ${propertyName}`,
    message: `La zona "${zoneName}" ${issue}`
  })
}