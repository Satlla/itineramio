/**
 * @module integrations
 *
 * Punto de entrada del módulo de integraciones externas (PMS / channel managers).
 * En PR2 solo se exponen contratos (interfaces y tipos). Implementaciones
 * concretas vendrán en PR6+ (Beds24Master) y posteriores.
 */

export type {
  AdapterContext,
  AdapterCredentials,
  CalendarSyncResult,
  ExternalIntegrationAdapter,
  ExternalProvider,
  ExternalPropertyRole,
  IntegrationScope,
  IntegrationStatus,
  NormalizedAttachment,
  NormalizedCalendarEntry,
  NormalizedMessage,
  NormalizedProperty,
  NormalizedReservation,
  PullMessagesOptions,
  PullMessagesResult,
  PullPropertiesResult,
  PullReservationsOptions,
  PullReservationsResult,
  ReservationChannel,
  SendMessageOptions,
  SendMessageResult,
  SyncCalendarOptions,
  WebhookVerificationResult,
} from './types'

export {
  AdapterAuthError,
  AdapterCapabilityError,
  AdapterConsentRequiredError,
  AdapterNotImplementedError,
  AdapterRateLimitError,
  AdapterTenantMismatchError,
} from './types'

export type { AdapterCapabilities, CapabilityLevel } from './capabilities'
export { PROVIDER_CAPABILITIES, hasCapability, hasFullCapability } from './capabilities'
