export interface Notification {
  id: string
  type: 'warning' | 'error' | 'info' | 'evaluation' | 'success'
  title: string
  message: string
  propertyId?: string
  zoneId?: string
  evaluationId?: string
  createdAt: Date
  read: boolean
  actionUrl?: string
  metadata?: {
    rating?: number
    isPublic?: boolean
    hasComment?: boolean
    evaluationType?: 'zone' | 'property'
    userName?: string
    propertyId?: string
    zoneId?: string
    type?: string
  }
}

export interface ZoneWarning {
  zoneId: string
  zoneName: string
  type: 'inactive' | 'no_visits' | 'empty' | 'error' | 'incomplete_steps' | 'missing_translation' | 'missing_french' | 'missing_essential'
  message: string
  propertyId: string
}

export type NotificationContext = {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  generateZoneWarnings: (propertyId: string, zones: any[], propertyName?: string) => void
}