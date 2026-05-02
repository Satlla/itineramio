/**
 * ExternalIntegrationAdapter — contrato común para todos los PMS / channel managers
 * que Itineramio integra (Beds24, Hostaway, Hospitable, Avantio, Lodgify, etc.).
 *
 * Diseño primero (PR2). Implementaciones concretas vendrán en PR6+ (Beds24Master)
 * y Fase 4b (Hostaway) y Fase 5 (resto).
 *
 * Regla de oro: el core de Itineramio NO conoce el proveedor. Solo habla con esta
 * interface. Los adapters traducen entre el modelo normalizado de Itineramio y la
 * API/quirks de cada proveedor.
 */

// ─── Provider enums (string unions, no Prisma enums todavía — eso es PR3) ─────

export type ExternalProvider =
  | 'BEDS24'
  | 'HOSTAWAY'
  | 'HOSPITABLE'
  | 'AVANTIO'
  | 'AVIRATO'
  | 'ICNEA'
  | 'LODGIFY'
  | 'SMOOBU'
  | 'GUESTY'
  | 'SUITECLERK'
  | 'WUBOOK'

export type IntegrationScope = 'MASTER' | 'PER_USER'

export type IntegrationStatus =
  | 'ACTIVE'
  | 'ERROR_AUTH'
  | 'ERROR_SYNC'
  | 'PAUSED'
  | 'DISCONNECTED'

export type ReservationChannel =
  | 'AIRBNB'
  | 'BOOKING'
  | 'EXPEDIA'
  | 'VRBO'
  | 'DIRECT'
  | 'WHATSAPP_DIRECT'
  | 'OTHER'

export type ExternalPropertyRole = 'OWNER' | 'PRIMARY_CO_HOST' | 'CO_HOST'

// ─── Normalized models (lo que el core ve, independiente del proveedor) ───────

export interface NormalizedReservation {
  externalBookingId: string
  externalPropertyId: string
  channel: ReservationChannel
  guestName: string
  guestEmail?: string
  guestPhone?: string
  guestCountry?: string
  guestLanguage?: string
  partyAdults?: number
  partyChildren?: number
  specialRequests?: string
  checkInDate: Date
  checkOutDate: Date
  grossAmount?: number
  otaCommission?: number
  tourismTax?: number
  netToHost?: number
  currency: string
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED'
  channelMetadata?: Record<string, unknown>
}

export interface NormalizedMessage {
  externalMessageId: string
  externalBookingId: string
  direction: 'INBOUND' | 'OUTBOUND'
  channel: ReservationChannel
  senderName?: string
  body: string
  attachments?: NormalizedAttachment[]
  sentAt: Date
}

export interface NormalizedAttachment {
  url: string
  mimeType: string
  filename?: string
}

export interface NormalizedProperty {
  externalPropertyId: string
  externalPropertyName: string
  externalRoomId?: string
  externalSubAccountId?: string
  hostRole: ExternalPropertyRole
  capacityGuests?: number
  bedrooms?: number
  bathrooms?: number
  metadata?: Record<string, unknown>
}

export interface NormalizedCalendarEntry {
  externalPropertyId: string
  date: Date
  status: 'AVAILABLE' | 'BLOCKED' | 'BOOKED'
  externalBookingId?: string
  pricePerNight?: number
  currency?: string
}

// ─── Adapter operation results ────────────────────────────────────────────────

export interface PullReservationsResult {
  reservations: NormalizedReservation[]
  cursor?: string
  hasMore: boolean
}

export interface PullMessagesResult {
  messages: NormalizedMessage[]
  cursor?: string
  hasMore: boolean
}

export interface SendMessageResult {
  externalMessageId: string
  sentAt: Date
  deliveryStatus: 'SENT' | 'PENDING' | 'FAILED'
  failureReason?: string
}

export interface CalendarSyncResult {
  entries: NormalizedCalendarEntry[]
  syncedAt: Date
}

export interface PullPropertiesResult {
  properties: NormalizedProperty[]
}

export interface WebhookVerificationResult {
  valid: boolean
  reason?: string
  payload?: unknown
}

// ─── Adapter operation options ────────────────────────────────────────────────

export interface PullReservationsOptions {
  /** Solo reservas con check-in o modificación posterior a esta fecha */
  modifiedSince?: Date
  /** Limitar a una propiedad concreta del proveedor */
  externalPropertyId?: string
  cursor?: string
  limit?: number
}

export interface PullMessagesOptions {
  externalBookingId: string
  modifiedSince?: Date
  cursor?: string
  limit?: number
}

export interface SendMessageOptions {
  externalBookingId: string
  body: string
  attachments?: NormalizedAttachment[]
  /** Idempotency key para evitar dobles envíos en retries */
  idempotencyKey: string
}

export interface SyncCalendarOptions {
  externalPropertyId: string
  fromDate: Date
  toDate: Date
}

// ─── Adapter context (cómo se construye un adapter) ───────────────────────────

export interface AdapterContext {
  /** ID del registro ExternalIntegration en BD */
  integrationId: string
  /** Scope del adapter (MASTER para Beds24 multi-tenant, PER_USER para resto) */
  scope: IntegrationScope
  /** Para scope=MASTER: usuario tenant cuyas operaciones se ejecutan ahora */
  tenantUserId?: string
  /** Credenciales descifradas (la BD las guarda cifradas con HOST_CREDENTIALS_ENCRYPTION_KEY) */
  credentials: AdapterCredentials
  /** Account ID externo si aplica (sub-cuenta Beds24, etc.) */
  externalAccountId?: string
}

/**
 * Credenciales del adapter. Estructura libre por proveedor — el adapter sabe qué
 * campos esperar. Ejemplos:
 *   - Beds24: { refreshToken, accessToken?, accessTokenExpiresAt? }
 *   - Hostaway: { clientId, clientSecret }
 *   - OAuth: { accessToken, refreshToken, tokenExpiresAt }
 *
 * NUNCA persistir en plano. Cifrado con HOST_CREDENTIALS_ENCRYPTION_KEY (D17).
 */
export type AdapterCredentials = Record<string, unknown>

// ─── La interface principal ───────────────────────────────────────────────────

export interface ExternalIntegrationAdapter {
  /** Identificador del proveedor (constante por adapter) */
  readonly provider: ExternalProvider

  /** Capabilities matrix (qué soporta este adapter) — ver capabilities.ts */
  getCapabilities(): import('./capabilities').AdapterCapabilities

  /** Comprueba que las credenciales son válidas (ej: refresca token, hace ping) */
  verifyCredentials(): Promise<{ ok: boolean; reason?: string }>

  /** Lista propiedades del proveedor para mapear a Itineramio properties */
  pullProperties(): Promise<PullPropertiesResult>

  /** Pull de reservas (paginado vía cursor) */
  pullReservations(options: PullReservationsOptions): Promise<PullReservationsResult>

  /** Pull de mensajes de una reserva */
  pullMessages(options: PullMessagesOptions): Promise<PullMessagesResult>

  /** Envía mensaje al canal de la reserva (Airbnb / Booking inbox / etc.) */
  sendMessage(options: SendMessageOptions): Promise<SendMessageResult>

  /** Sync calendario para mostrar disponibilidad de la propiedad */
  syncCalendar(options: SyncCalendarOptions): Promise<CalendarSyncResult>

  /**
   * Verifica firma del webhook (HMAC, JWT signature, etc.). Implementación
   * por proveedor. Devuelve `valid:false` si firma inválida o origen no confiable.
   */
  verifyWebhook(headers: Record<string, string>, rawBody: string): WebhookVerificationResult
}

// ─── Errores tipados que cualquier adapter puede lanzar ──────────────────────

export class AdapterAuthError extends Error {
  readonly code = 'ADAPTER_AUTH_ERROR' as const
  constructor(message: string, public readonly providerHint?: string) {
    super(message)
    this.name = 'AdapterAuthError'
  }
}

export class AdapterRateLimitError extends Error {
  readonly code = 'ADAPTER_RATE_LIMIT_ERROR' as const
  constructor(message: string, public readonly retryAfterSeconds?: number) {
    super(message)
    this.name = 'AdapterRateLimitError'
  }
}

export class AdapterCapabilityError extends Error {
  readonly code = 'ADAPTER_CAPABILITY_ERROR' as const
  constructor(message: string, public readonly capability: string) {
    super(message)
    this.name = 'AdapterCapabilityError'
  }
}

export class AdapterNotImplementedError extends Error {
  readonly code = 'ADAPTER_NOT_IMPLEMENTED' as const
  constructor(method: string) {
    super(`Adapter method not implemented: ${method}`)
    this.name = 'AdapterNotImplementedError'
  }
}

export class AdapterTenantMismatchError extends Error {
  readonly code = 'ADAPTER_TENANT_MISMATCH' as const
  constructor(message: string) {
    super(message)
    this.name = 'AdapterTenantMismatchError'
  }
}

export class AdapterConsentRequiredError extends Error {
  readonly code = 'ADAPTER_CONSENT_REQUIRED' as const
  constructor(message: string, public readonly hostRole: ExternalPropertyRole) {
    super(message)
    this.name = 'AdapterConsentRequiredError'
  }
}
