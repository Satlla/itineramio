-- Migration: PR3 — AlexAI / Beds24 schema
--
-- Aditivo only. Cero columnas o tablas existentes se modifican.
-- Cero código de uso aún (vendrá en PR4-PR-MT y Fase 2).
--
-- Whitelist global ALEXAI_BETA_USERS sigue activa: APIs/UI nuevas que
-- toquen estos modelos deben gatear con isAlexAIBetaUser(user.email) (PR2).
--
-- IMPORTANTE: NO se aplica a producción automáticamente. El build de Vercel
-- solo hace `prisma generate + next build`, no `migrate deploy`. Se aplicará
-- a producción manualmente cuando se decida activar AlexAI.

-- ============================================================================
-- 1. ENUMS NUEVOS
-- ============================================================================

CREATE TYPE "ExternalIntegrationScope" AS ENUM ('MASTER', 'PER_USER');

CREATE TYPE "ExternalProvider" AS ENUM (
  'BEDS24', 'HOSTAWAY', 'HOSPITABLE', 'AVANTIO', 'AVIRATO',
  'ICNEA',  'LODGIFY',  'SMOOBU',     'GUESTY',  'SUITECLERK', 'WUBOOK'
);

CREATE TYPE "IntegrationStatus" AS ENUM (
  'ACTIVE', 'ERROR_AUTH', 'ERROR_SYNC', 'PAUSED', 'DISCONNECTED'
);

CREATE TYPE "ExternalPropertyRole" AS ENUM ('OWNER', 'PRIMARY_CO_HOST', 'CO_HOST');

CREATE TYPE "AiMode" AS ENUM ('OFF', 'SUGGEST', 'AUTO_SELECTIVE', 'AUTO_FULL', 'HYBRID_SCHEDULE');

CREATE TYPE "HostChannelType" AS ENUM ('WHATSAPP', 'EMAIL', 'SMS');

CREATE TYPE "ConversationChannel" AS ENUM (
  'WEB', 'WHATSAPP_DIRECT', 'OTA_AIRBNB', 'OTA_BOOKING', 'OTA_EXPEDIA', 'OTA_VRBO', 'VOICE'
);

CREATE TYPE "MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

CREATE TYPE "ReservationChannel" AS ENUM (
  'AIRBNB', 'BOOKING', 'EXPEDIA', 'VRBO', 'DIRECT', 'WHATSAPP_DIRECT', 'OTHER'
);

CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'PARTIAL', 'PENDING', 'REFUNDED');

CREATE TYPE "RegistroViajerosStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'SENT', 'ERROR');

-- ============================================================================
-- 2. TABLA NUEVA: external_integrations
-- ============================================================================

CREATE TABLE "external_integrations" (
  "id"                    TEXT                       NOT NULL,
  "scope"                 "ExternalIntegrationScope" NOT NULL,
  "ownerUserId"           TEXT,
  "provider"              "ExternalProvider"         NOT NULL,
  "encryptedCredentials"  TEXT                       NOT NULL,
  "capabilities"          JSONB,
  "status"                "IntegrationStatus"        NOT NULL DEFAULT 'ACTIVE',
  "lastSyncAt"            TIMESTAMP(3),
  "webhookSecret"         TEXT,
  "externalAccountId"     TEXT,
  "createdAt"             TIMESTAMP(3)               NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"             TIMESTAMP(3)               NOT NULL,

  CONSTRAINT "external_integrations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "external_integrations_scope_ownerUserId_provider_key"
  ON "external_integrations"("scope", "ownerUserId", "provider");

CREATE INDEX "external_integrations_provider_idx" ON "external_integrations"("provider");
CREATE INDEX "external_integrations_status_idx"   ON "external_integrations"("status");

ALTER TABLE "external_integrations"
  ADD CONSTRAINT "external_integrations_ownerUserId_fkey"
  FOREIGN KEY ("ownerUserId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- 3. TABLA NUEVA: ai_assistant_configs
-- ============================================================================

CREATE TABLE "ai_assistant_configs" (
  "id"                     TEXT         NOT NULL,
  "propertyId"             TEXT         NOT NULL,
  "enabled"                BOOLEAN      NOT NULL DEFAULT false,
  "mode"                   "AiMode"     NOT NULL DEFAULT 'SUGGEST',
  "autoCategories"         TEXT[]       NOT NULL DEFAULT ARRAY[]::TEXT[],
  "scheduleEnabled"        BOOLEAN      NOT NULL DEFAULT false,
  "scheduleAutoFrom"       TEXT,
  "scheduleAutoTo"         TEXT,
  "toneInstructions"       TEXT,
  "languages"              TEXT[]       NOT NULL DEFAULT ARRAY['es', 'en']::TEXT[],
  "alwaysEscalateKeywords" TEXT[]       NOT NULL DEFAULT ARRAY['queja', 'complaint', 'fuga', 'leak', 'emergency', 'policía', 'cancelar', 'refund']::TEXT[],
  "createdAt"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"              TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ai_assistant_configs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ai_assistant_configs_propertyId_key" ON "ai_assistant_configs"("propertyId");

ALTER TABLE "ai_assistant_configs"
  ADD CONSTRAINT "ai_assistant_configs_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "properties"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- 4. TABLA NUEVA: host_notification_channels
-- ============================================================================

CREATE TABLE "host_notification_channels" (
  "id"                    TEXT              NOT NULL,
  "userId"                TEXT              NOT NULL,
  "type"                  "HostChannelType" NOT NULL,
  "identifier"            TEXT              NOT NULL,
  "verified"              BOOLEAN           NOT NULL DEFAULT false,
  "verifiedAt"            TIMESTAMP(3),
  "lastInboundFromHostAt" TIMESTAMP(3),
  "preferences"           JSONB,
  "createdAt"             TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"             TIMESTAMP(3)      NOT NULL,

  CONSTRAINT "host_notification_channels_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "host_notification_channels_userId_type_identifier_key"
  ON "host_notification_channels"("userId", "type", "identifier");

CREATE INDEX "host_notification_channels_userId_type_idx"
  ON "host_notification_channels"("userId", "type");

ALTER TABLE "host_notification_channels"
  ADD CONSTRAINT "host_notification_channels_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- 5. TABLA NUEVA: raw_external_messages
-- ============================================================================

CREATE TABLE "raw_external_messages" (
  "id"                    TEXT                  NOT NULL,
  "externalIntegrationId" TEXT                  NOT NULL,
  "externalBookingId"     TEXT,
  "externalMessageId"     TEXT                  NOT NULL,
  "channel"               "ConversationChannel" NOT NULL,
  "direction"             "MessageDirection"    NOT NULL,
  "body"                  TEXT                  NOT NULL,
  "rawPayload"            JSONB                 NOT NULL,
  "processed"             BOOLEAN               NOT NULL DEFAULT false,
  "processedAt"           TIMESTAMP(3),
  "processingError"       TEXT,
  "receivedAt"            TIMESTAMP(3)          NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "raw_external_messages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "raw_external_messages_externalMessageId_key"
  ON "raw_external_messages"("externalMessageId");

CREATE INDEX "raw_external_messages_processed_receivedAt_idx"
  ON "raw_external_messages"("processed", "receivedAt");

CREATE INDEX "raw_external_messages_externalIntegrationId_receivedAt_idx"
  ON "raw_external_messages"("externalIntegrationId", "receivedAt");

ALTER TABLE "raw_external_messages"
  ADD CONSTRAINT "raw_external_messages_externalIntegrationId_fkey"
  FOREIGN KEY ("externalIntegrationId") REFERENCES "external_integrations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- 6. EXTENSIÓN: properties (1 columna nueva)
-- ============================================================================

ALTER TABLE "properties"
  ADD COLUMN "alexaiEnabled" BOOLEAN NOT NULL DEFAULT false;

-- ============================================================================
-- 7. EXTENSIÓN: property_external_mappings (9 columnas nuevas + indices + FKs)
-- ============================================================================

ALTER TABLE "property_external_mappings"
  ADD COLUMN "externalIntegrationId" TEXT,
  ADD COLUMN "tenantUserId"          TEXT,
  ADD COLUMN "externalRoomId"        TEXT,
  ADD COLUMN "externalSubAccountId"  TEXT,
  ADD COLUMN "hostRole"              "ExternalPropertyRole",
  ADD COLUMN "consentConfirmed"      BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "consentMetadata"       JSONB,
  ADD COLUMN "syncEnabled"           BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "lastSyncAt"            TIMESTAMP(3);

CREATE UNIQUE INDEX "property_external_mappings_externalIntegrationId_externalId_key"
  ON "property_external_mappings"("externalIntegrationId", "externalId");

CREATE INDEX "property_external_mappings_tenantUserId_idx"
  ON "property_external_mappings"("tenantUserId");

ALTER TABLE "property_external_mappings"
  ADD CONSTRAINT "property_external_mappings_externalIntegrationId_fkey"
  FOREIGN KEY ("externalIntegrationId") REFERENCES "external_integrations"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "property_external_mappings"
  ADD CONSTRAINT "property_external_mappings_tenantUserId_fkey"
  FOREIGN KEY ("tenantUserId") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- 8. EXTENSIÓN: reservations (13 columnas nuevas + indices + FKs)
-- ============================================================================

ALTER TABLE "reservations"
  ADD COLUMN "externalIntegrationId"   TEXT,
  ADD COLUMN "externalBookingId"       TEXT,
  ADD COLUMN "channel"                 "ReservationChannel",
  ADD COLUMN "channelMetadata"         JSONB,
  ADD COLUMN "tourismTax"              DECIMAL(65,30),
  ADD COLUMN "netToHostV2"             DECIMAL(65,30),
  ADD COLUMN "paymentStatus"           "PaymentStatus",
  ADD COLUMN "publicToken"             TEXT,
  ADD COLUMN "registroViajerosStatus"  "RegistroViajerosStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "registroViajerosSentAt"  TIMESTAMP(3),
  ADD COLUMN "registroViajerosFileUrl" TEXT,
  ADD COLUMN "isRepeatGuest"           BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "previousReservationId"   TEXT;

CREATE UNIQUE INDEX "reservations_publicToken_key" ON "reservations"("publicToken");

CREATE INDEX "reservations_externalIntegrationId_externalBookingId_idx"
  ON "reservations"("externalIntegrationId", "externalBookingId");

CREATE INDEX "reservations_channel_idx" ON "reservations"("channel");

CREATE INDEX "reservations_registroViajerosStatus_idx"
  ON "reservations"("registroViajerosStatus");

ALTER TABLE "reservations"
  ADD CONSTRAINT "reservations_externalIntegrationId_fkey"
  FOREIGN KEY ("externalIntegrationId") REFERENCES "external_integrations"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "reservations"
  ADD CONSTRAINT "reservations_previousReservationId_fkey"
  FOREIGN KEY ("previousReservationId") REFERENCES "reservations"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
