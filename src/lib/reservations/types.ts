// Tipos para el sistema de reservas automáticas

export interface ParsedReservation {
  // Identificación
  platform: 'AIRBNB' | 'BOOKING' | 'VRBO' | 'DIRECT' | 'OTHER'
  confirmationCode: string

  // Propiedad (nombre tal como aparece en la plataforma)
  propertyName: string

  // Huésped
  guestName: string
  guestCountry?: string
  guestMessage?: string
  guestVerified?: boolean
  guestReviews?: number
  travelers?: {
    adults: number
    children: number
    babies: number
  }

  // Fechas
  checkIn: Date
  checkInTime?: string
  checkOut: Date
  checkOutTime?: string
  nights: number

  // Importes
  roomTotal: number           // Precio alojamiento
  cleaningFee: number         // Limpieza
  guestServiceFee?: number    // Comisión que paga el huésped
  hostServiceFee: number      // Comisión que te cobra la plataforma
  totalPaid: number           // Total que paga el huésped
  hostEarnings: number        // Lo que recibes tú
  currency: string

  // Tipo de evento
  eventType: 'NEW_RESERVATION' | 'CANCELLATION' | 'MODIFICATION' | 'UNKNOWN'

  // Política cancelación
  cancellationPolicy?: string

  // Datos crudos por si necesitamos debug
  rawEmail?: string
}

export interface ResendInboundEvent {
  type: 'email.received'
  created_at: string
  data: {
    email_id: string
    created_at: string
    from: string
    to: string[]
    bcc: string[]
    cc: string[]
    message_id: string
    subject: string
    attachments: {
      id: string
      filename: string
      content_type: string
      content_disposition: string
      content_id: string
    }[]
  }
}

export interface ResendEmailContent {
  html: string
  text: string
  subject: string
  from: string
  to: string[]
}
