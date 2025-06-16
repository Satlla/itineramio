export interface Notification {
  id: string
  type: 'warning' | 'error' | 'info'
  title: string
  message: string
  propertyId?: string
  zoneId?: string
  createdAt: Date
  read: boolean
  actionUrl?: string
}

export interface ZoneWarning {
  zoneId: string
  zoneName: string
  type: 'inactive' | 'no_visits' | 'empty' | 'error'
  message: string
  propertyId: string
}

export type NotificationContext = {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  generateZoneWarnings: (propertyId: string, zones: any[]) => void
}