-- CreateEnum
CREATE TYPE "ModuleType" AS ENUM ('MANUALES', 'GESTION');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('PENDING_VERIFICATION', 'PENDING', 'APPROVED', 'REJECTED', 'SPAM');

-- CreateEnum
CREATE TYPE "BlogCategory" AS ENUM ('GUIAS', 'MEJORES_PRACTICAS', 'NORMATIVA', 'AUTOMATIZACION', 'MARKETING', 'OPERACIONES', 'CASOS_ESTUDIO', 'NOTICIAS');

-- CreateEnum
CREATE TYPE "BlogStatus" AS ENUM ('DRAFT', 'REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "JourneyStage" AS ENUM ('VISITOR', 'LEAD', 'REGISTERED', 'MQL', 'SQL', 'CUSTOMER', 'CHURNED');

-- CreateEnum
CREATE TYPE "EmailEventType" AS ENUM ('SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'COMPLAINED', 'UNSUBSCRIBED');

-- CreateEnum
CREATE TYPE "EmailTrigger" AS ENUM ('ON_LEAD_CAPTURE', 'ON_REGISTRATION', 'ON_TRIAL_START', 'ON_SUBSCRIPTION', 'ON_INACTIVITY', 'ON_CANCELLATION', 'MANUAL');

-- CreateEnum
CREATE TYPE "FaqSubmissionStatus" AS ENUM ('PENDING', 'REVIEWING', 'ANSWERED', 'PUBLISHED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OwnerType" AS ENUM ('PERSONA_FISICA', 'EMPRESA');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('INVOICE', 'SERVICE_NOTE', 'NONE');

-- CreateEnum
CREATE TYPE "IncomeReceiver" AS ENUM ('OWNER', 'MANAGER');

-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('PERCENTAGE', 'FIXED_PER_RESERVATION', 'FIXED_MONTHLY', 'NONE');

-- CreateEnum
CREATE TYPE "CleaningType" AS ENUM ('FIXED_PER_RESERVATION', 'PER_NIGHT', 'NONE');

-- CreateEnum
CREATE TYPE "CleaningFeeRecipient" AS ENUM ('OWNER', 'MANAGER', 'SPLIT');

-- CreateEnum
CREATE TYPE "InvoiceDetailLevel" AS ENUM ('DETAILED', 'SUMMARY');

-- CreateEnum
CREATE TYPE "ReservationPlatform" AS ENUM ('AIRBNB', 'BOOKING', 'VRBO', 'DIRECT', 'OTHER');

-- CreateEnum
CREATE TYPE "ReservationType" AS ENUM ('BOOKING', 'CANCELLATION', 'MODIFICATION', 'REFUND');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('PAYOUT', 'REFUND', 'RESOLUTION', 'ADJUSTMENT', 'MANUAL');

-- CreateEnum
CREATE TYPE "PaymentCategory" AS ENUM ('ACCOMMODATION', 'CLEANING', 'DAMAGE', 'COMPENSATION', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentSource" AS ENUM ('EMAIL', 'MANUAL', 'CSV', 'API');

-- CreateEnum
CREATE TYPE "BillingAction" AS ENUM ('NORMAL', 'PASSTHROUGH', 'MANAGER_KEEPS', 'EXCLUDE');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('MAINTENANCE', 'SUPPLIES', 'REPAIR', 'CLEANING', 'FURNITURE', 'TAXES', 'INSURANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "LiquidationStatus" AS ENUM ('DRAFT', 'PENDING', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ClientInvoiceStatus" AS ENUM ('DRAFT', 'PROFORMA', 'ISSUED', 'SENT', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "RectifyingType" AS ENUM ('SUBSTITUTION', 'DIFFERENCE');

-- CreateEnum
CREATE TYPE "SeriesType" AS ENUM ('STANDARD', 'RECTIFYING');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('TRANSFER', 'DIRECT_DEBIT', 'CASH', 'CARD', 'BIZUM', 'PAYPAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT,
    "emailVerified" TIMESTAMP(3),
    "phoneVerified" TIMESTAMP(3),
    "preferredLanguage" TEXT NOT NULL DEFAULT 'es',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Madrid',
    "role" TEXT NOT NULL DEFAULT 'HOST',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "subscription" TEXT,
    "trialStartedAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "avatar" TEXT,
    "companyName" TEXT,
    "billingAddress" TEXT,
    "billingCity" TEXT,
    "billingCountry" TEXT,
    "billingPostalCode" TEXT,
    "vatNumber" TEXT,
    "referralCode" TEXT,
    "referredBy" TEXT,
    "affiliateCommission" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "notificationPreferences" JSONB DEFAULT '{}',
    "onboardingCompletedAt" TIMESTAMP(3),
    "academyEnrolledAt" TIMESTAMP(3),
    "academyPoints" INTEGER NOT NULL DEFAULT 0,
    "academyStreak" INTEGER NOT NULL DEFAULT 0,
    "lastAcademyActivityAt" TIMESTAMP(3),
    "username" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_modules" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleType" "ModuleType" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "stripeSubscriptionId" TEXT,
    "subscriptionPlanId" TEXT,
    "trialEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_info" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "companyName" TEXT,
    "companyTaxId" TEXT,
    "tradeName" TEXT,
    "taxId" TEXT,
    "businessActivity" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "nationalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_sets" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "profileImage" TEXT,
    "hostContactName" TEXT NOT NULL,
    "hostContactPhone" TEXT NOT NULL,
    "hostContactEmail" TEXT NOT NULL,
    "hostContactLanguage" TEXT NOT NULL DEFAULT 'es',
    "hostContactPhoto" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "organizationId" TEXT,
    "buildingId" TEXT,
    "propertySetId" TEXT,
    "name" TEXT NOT NULL,
    "nameTranslations" JSONB,
    "description" TEXT NOT NULL,
    "descriptionTranslations" JSONB,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "maxGuests" INTEGER NOT NULL,
    "squareMeters" INTEGER,
    "defaultLanguages" JSONB NOT NULL DEFAULT '["es", "en"]',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "profileImage" TEXT,
    "hostContactName" TEXT NOT NULL,
    "hostContactPhone" TEXT NOT NULL,
    "hostContactEmail" TEXT NOT NULL,
    "hostContactLanguage" TEXT NOT NULL DEFAULT 'es',
    "hostContactPhoto" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "trialStartsAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "trialNotified3d" BOOLEAN NOT NULL DEFAULT false,
    "trialNotified24h" BOOLEAN NOT NULL DEFAULT false,
    "trialNotified6h" BOOLEAN NOT NULL DEFAULT false,
    "trialNotified1h" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionEndsAt" TIMESTAMP(3),
    "lastPaymentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "slug" TEXT,
    "propertyCode" TEXT,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT,
    "organizationId" TEXT,
    "buildingId" TEXT,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "icon" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT,
    "qrCode" TEXT NOT NULL,
    "accessCode" TEXT NOT NULL,
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT true,
    "errorReportsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "commentsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "ratingsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "slug" TEXT,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "steps" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zone_comments" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "guestName" TEXT,
    "guestCountry" TEXT,
    "guestLanguage" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "moderatedAt" TIMESTAMP(3),
    "moderatedBy" TEXT,
    "moderationReason" TEXT,
    "helpfulVotes" INTEGER NOT NULL DEFAULT 0,
    "reportedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "zone_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_reports" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "affectedStep" TEXT,
    "userAgent" TEXT,
    "browserInfo" TEXT,
    "deviceType" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "reporterEmail" TEXT,
    "reporterLanguage" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "assignedTo" TEXT,
    "hostResponse" TEXT,
    "resolutionNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "error_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zone_ratings" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "clarity" INTEGER NOT NULL,
    "completeness" INTEGER NOT NULL,
    "helpfulness" INTEGER NOT NULL,
    "upToDate" INTEGER NOT NULL,
    "feedback" TEXT,
    "improvementSuggestions" TEXT,
    "language" TEXT NOT NULL,
    "guestAgeRange" TEXT,
    "guestCountry" TEXT,
    "guestTravelType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "visibleToHost" BOOLEAN NOT NULL DEFAULT true,
    "visibleToGuests" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "zone_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_analytics" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "avgSessionDuration" INTEGER NOT NULL DEFAULT 0,
    "overallRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "improvementScore" INTEGER NOT NULL DEFAULT 0,
    "whatsappClicks" INTEGER NOT NULL DEFAULT 0,
    "errorReportsCount" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastViewedAt" TIMESTAMP(3),
    "zoneViews" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "property_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_stats" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "avgSessionDuration" INTEGER NOT NULL DEFAULT 0,
    "whatsappClicks" INTEGER NOT NULL DEFAULT 0,
    "errorReports" INTEGER NOT NULL DEFAULT 0,
    "newComments" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "zoneId" TEXT,
    "stepId" TEXT,
    "userId" TEXT,
    "sessionId" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "duration" INTEGER,

    CONSTRAINT "tracking_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zone_analytics" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "totalViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "avgTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgStepsCompleted" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCompletions" INTEGER NOT NULL DEFAULT 0,
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "timeSavedMinutes" INTEGER NOT NULL DEFAULT 0,
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastViewedAt" TIMESTAMP(3),
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "zone_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_members" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "brandColorPrimary" TEXT,
    "brandColorSecondary" TEXT,
    "customDomain" TEXT,
    "defaultLanguages" JSONB NOT NULL DEFAULT '["es", "en"]',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Madrid',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_inspiration_states" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dismissedZones" JSONB NOT NULL DEFAULT '[]',
    "createdZones" JSONB NOT NULL DEFAULT '[]',
    "lastShownInspiration" TEXT,
    "showInspirations" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_inspiration_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price_monthly" DECIMAL(65,30) NOT NULL,
    "price_semestral" DECIMAL(65,30),
    "price_yearly" DECIMAL(65,30),
    "ai_messages_included" INTEGER NOT NULL DEFAULT 0,
    "max_properties" INTEGER NOT NULL DEFAULT 1,
    "features" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_visible_in_ui" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT,
    "custom_plan_id" TEXT,
    "status" TEXT NOT NULL,
    "custom_price" DECIMAL(65,30),
    "discount_percentage" DECIMAL(65,30) DEFAULT 0,
    "discount_reason" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "cancel_reason" TEXT,
    "canceled_at" TIMESTAMP(3),
    "stripe_subscription_id" TEXT,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subscription_id" TEXT,
    "invoice_number" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "discount_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "final_amount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,
    "payment_method" TEXT,
    "payment_reference" TEXT,
    "due_date" TIMESTAMP(3) NOT NULL,
    "paid_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_activity_log" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target_type" TEXT,
    "target_id" TEXT,
    "description" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_library" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "duration" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "hash" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "media_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_ratings" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "guestId" TEXT NOT NULL,
    "guestIp" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "property_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "zoneId" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "userName" TEXT NOT NULL DEFAULT 'Usuario anónimo',
    "userEmail" TEXT,
    "reviewType" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "hostResponse" TEXT,
    "hostRespondedAt" TIMESTAMP(3),
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "message" JSONB NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_views" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "visitorIp" TEXT NOT NULL,
    "userAgent" TEXT,
    "referrer" TEXT,
    "language" TEXT NOT NULL DEFAULT 'es',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "screenWidth" INTEGER,
    "screenHeight" INTEGER,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zone_views" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "visitorIp" TEXT NOT NULL,
    "userAgent" TEXT,
    "referrer" TEXT,
    "language" TEXT NOT NULL DEFAULT 'es',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "screenWidth" INTEGER,
    "screenHeight" INTEGER,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "isHostView" BOOLEAN NOT NULL DEFAULT false,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zone_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "duration" INTEGER,
    "reason" TEXT NOT NULL,
    "resolution" TEXT,
    "notes" TEXT,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_transactions" (
    "id" TEXT NOT NULL,
    "referrer_id" TEXT NOT NULL,
    "referred_user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "discountPercent" INTEGER,
    "discountAmount" DECIMAL(65,30),
    "freeMonths" INTEGER,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "maxUsesPerUser" INTEGER NOT NULL DEFAULT 1,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "minAmount" DECIMAL(65,30),
    "minDuration" INTEGER,
    "applicableToPlans" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "campaignSource" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_uses" (
    "id" TEXT NOT NULL,
    "coupon_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "order_id" TEXT,
    "discountApplied" DECIMAL(65,30) NOT NULL,
    "originalAmount" DECIMAL(65,30) NOT NULL,
    "finalAmount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_uses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pricePerProperty" DECIMAL(65,30) NOT NULL,
    "minProperties" INTEGER NOT NULL DEFAULT 1,
    "maxProperties" INTEGER,
    "features" JSONB NOT NULL DEFAULT '[]',
    "restrictions" JSONB NOT NULL DEFAULT '{}',
    "isForHotels" BOOLEAN NOT NULL DEFAULT false,
    "maxZonesPerProperty" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_change_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "old_email" TEXT NOT NULL,
    "new_email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_change_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_tiers" (
    "id" TEXT NOT NULL,
    "min_properties" INTEGER NOT NULL,
    "max_properties" INTEGER,
    "price_per_property" DECIMAL(65,30) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT,
    "custom_plan_id" TEXT,
    "requestType" TEXT NOT NULL,
    "properties_count" INTEGER,
    "total_amount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payment_method" TEXT,
    "payment_reference" TEXT,
    "payment_proof_url" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "admin_notes" TEXT,
    "metadata" JSONB,

    CONSTRAINT "subscription_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "coverImageAlt" TEXT,
    "category" "BlogCategory" NOT NULL,
    "tags" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "keywords" TEXT[],
    "status" "BlogStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "scheduledFor" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,
    "readTime" INTEGER NOT NULL DEFAULT 5,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorImage" TEXT,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "parentId" TEXT,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "likes" INTEGER NOT NULL DEFAULT 0,
    "isAuthor" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "verificationSentAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "funnel_theme" TEXT,
    "funnel_started_at" TIMESTAMP(3),
    "funnel_current_day" INTEGER DEFAULT 0,
    "property_count" TEXT,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_journey_stages" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT,
    "user_id" TEXT,
    "email" TEXT NOT NULL,
    "stage" "JourneyStage" NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "entered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exited_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_journey_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_events" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT,
    "user_id" TEXT,
    "email" TEXT NOT NULL,
    "eventType" "EmailEventType" NOT NULL,
    "campaign_id" TEXT,
    "template_name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered_at" TIMESTAMP(3),
    "opened_at" TIMESTAMP(3),
    "clicked_at" TIMESTAMP(3),
    "bounced_at" TIMESTAMP(3),
    "clicked_url" TEXT,
    "bounce_reason" TEXT,
    "metadata" JSONB,

    CONSTRAINT "email_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" "EmailTrigger" NOT NULL,
    "triggerStages" "JourneyStage"[],
    "template_name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "from_name" TEXT NOT NULL DEFAULT 'Itineramio',
    "from_email" TEXT NOT NULL DEFAULT 'hola@itineramio.com',
    "delay_minutes" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "opened_count" INTEGER NOT NULL DEFAULT 0,
    "clicked_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImage" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'INTERMEDIATE',
    "duration" INTEGER NOT NULL,
    "passingScore" INTEGER NOT NULL DEFAULT 80,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "enrollmentCount" INTEGER NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "paymentMethods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_modules" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL,
    "unlockDate" TIMESTAMP(3),
    "estimatedTime" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_lessons" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "slides" JSONB NOT NULL,
    "coverImage" TEXT,
    "videoUrl" TEXT,
    "duration" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 10,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_quizzes" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "passingScore" INTEGER NOT NULL DEFAULT 80,
    "timeLimit" INTEGER,
    "maxAttempts" INTEGER,
    "points" INTEGER NOT NULL DEFAULT 50,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_questions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "options" JSONB NOT NULL,
    "correctAnswer" INTEGER NOT NULL,
    "explanation" TEXT,
    "order" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_quiz_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "timeSpent" INTEGER,

    CONSTRAINT "academy_quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_quiz_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedAnswer" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_leads" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "score" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeElapsed" INTEGER NOT NULL,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "academyUserId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'QUIZ_PUBLIC',
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "verificationTokenExpires" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "quiz_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_achievements" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "badge" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_diplomas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "certificateCode" TEXT NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER,
    "totalStudents" INTEGER,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdfUrl" TEXT,
    "sharedToFacebook" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_diplomas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "username" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "academyPoints" INTEGER NOT NULL DEFAULT 0,
    "academyStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailVerificationExpires" TIMESTAMP(3),
    "emailVerificationToken" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "day10EmailSent" BOOLEAN NOT NULL DEFAULT false,
    "day2EmailSent" BOOLEAN NOT NULL DEFAULT false,
    "day5EmailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailClicks" INTEGER NOT NULL DEFAULT 0,
    "emailOpens" INTEGER NOT NULL DEFAULT 0,
    "journeyStage" TEXT NOT NULL DEFAULT 'QUIZ_COMPLETED',
    "lastEmailClickedAt" TIMESTAMP(3),
    "lastEmailOpenedAt" TIMESTAMP(3),
    "quizAnswers" JSONB,
    "quizCompletedAt" TIMESTAMP(3),
    "quizLevel" TEXT,
    "quizScore" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "welcomeEmailSent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "academy_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_user_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_user_quiz_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "timeSpent" INTEGER,

    CONSTRAINT "academy_user_quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_user_quiz_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedAnswer" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_user_quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_user_diplomas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "certificateCode" TEXT NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER,
    "totalStudents" INTEGER,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdfUrl" TEXT,
    "sharedToFacebook" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_user_diplomas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "testimonial" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "stripeSessionId" TEXT,
    "stripePaymentId" TEXT,
    "reference" TEXT,
    "proofUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_email_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailType" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "openedAt" TIMESTAMP(3),
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "clickedAt" TIMESTAMP(3),
    "bounced" BOOLEAN NOT NULL DEFAULT false,
    "complained" BOOLEAN NOT NULL DEFAULT false,
    "resendId" TEXT,

    CONSTRAINT "academy_email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_user_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_user_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "country" TEXT,
    "language" TEXT NOT NULL DEFAULT 'es',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "knowledge_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_articles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "views" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "author" TEXT,
    "categoryId" TEXT NOT NULL,
    "country" TEXT,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "embedding" JSONB,
    "embeddingModel" TEXT,
    "language" TEXT NOT NULL DEFAULT 'es',
    "lastReviewedAt" TIMESTAMP(3),
    "previousVersionId" TEXT,
    "sourceType" TEXT NOT NULL DEFAULT 'MANUAL',
    "sourceUrl" TEXT,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "knowledge_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_sources" (
    "id" TEXT NOT NULL,
    "articleId" TEXT,
    "url" TEXT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "rawContent" TEXT,
    "extractedAt" TIMESTAMP(3),
    "author" TEXT,
    "publishedDate" TIMESTAMP(3),
    "language" TEXT NOT NULL DEFAULT 'es',
    "country" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "type" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "explanation" TEXT,
    "relatedArticleId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "timesAsked" INTEGER NOT NULL DEFAULT 0,
    "timesCorrect" INTEGER NOT NULL DEFAULT 0,
    "averageTime" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cerebellum_queries" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "query" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'gpt-4',
    "tokens" INTEGER,
    "responseTime" DOUBLE PRECISION,
    "wasHelpful" BOOLEAN,
    "feedback" TEXT,
    "rating" INTEGER,
    "country" TEXT,
    "language" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cerebellum_queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cerebellum_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'FREE',
    "queriesLimit" INTEGER NOT NULL DEFAULT 10,
    "queriesUsed" INTEGER NOT NULL DEFAULT 0,
    "resetDate" TIMESTAMP(3) NOT NULL,
    "hasPrioritySupport" BOOLEAN NOT NULL DEFAULT false,
    "hasAdvancedAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cerebellum_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "archetype" TEXT,
    "source" TEXT NOT NULL,
    "sourceMetadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "unsubscribedAt" TIMESTAMP(3),
    "unsubscribeReason" TEXT,
    "openRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "clickRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastEmailOpenedAt" TIMESTAMP(3),
    "lastEmailClickedAt" TIMESTAMP(3),
    "engagementScore" TEXT NOT NULL DEFAULT 'warm',
    "currentJourneyStage" TEXT NOT NULL DEFAULT 'subscribed',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "downloadedGuide" BOOLEAN NOT NULL DEFAULT false,
    "enrolledCourse" BOOLEAN NOT NULL DEFAULT false,
    "purchasedManual" BOOLEAN NOT NULL DEFAULT false,
    "purchasedCourse" BOOLEAN NOT NULL DEFAULT false,
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "emailsOpened" INTEGER NOT NULL DEFAULT 0,
    "emailsClicked" INTEGER NOT NULL DEFAULT 0,
    "lastEmailSentAt" TIMESTAMP(3),
    "leadId" TEXT,
    "userId" TEXT,
    "hostProfileTestId" TEXT,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "becameHotAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "emailsBounced" INTEGER NOT NULL DEFAULT 0,
    "emailsDelivered" INTEGER NOT NULL DEFAULT 0,
    "firstOpenedAt" TIMESTAMP(3),
    "lastEngagement" TIMESTAMP(3),
    "day10SentAt" TIMESTAMP(3),
    "day14SentAt" TIMESTAMP(3),
    "day3SentAt" TIMESTAMP(3),
    "day7SentAt" TIMESTAMP(3),
    "sequenceStartedAt" TIMESTAMP(3),
    "sequenceStatus" TEXT NOT NULL DEFAULT 'active',
    "contentTrack" TEXT,
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "topPriority" TEXT,
    "nivelDay1SentAt" TIMESTAMP(3),
    "nivelDay2SentAt" TIMESTAMP(3),
    "nivelDay3SentAt" TIMESTAMP(3),
    "nivelDay5SentAt" TIMESTAMP(3),
    "nivelDay7SentAt" TIMESTAMP(3),
    "nivelSequenceStatus" TEXT NOT NULL DEFAULT 'pending',
    "soapOperaStatus" TEXT NOT NULL DEFAULT 'pending',
    "soapOperaStartedAt" TIMESTAMP(3),
    "nivel" TEXT,
    "perfilInteres" TEXT,
    "quizScore" INTEGER,
    "soapEmail1SentAt" TIMESTAMP(3),
    "soapEmail2SentAt" TIMESTAMP(3),
    "soapEmail3SentAt" TIMESTAMP(3),
    "soapEmail4SentAt" TIMESTAMP(3),
    "soapEmail5SentAt" TIMESTAMP(3),
    "soapEmail6SentAt" TIMESTAMP(3),
    "soapEmail7SentAt" TIMESTAMP(3),
    "soapEmail8SentAt" TIMESTAMP(3),
    "lastOpenedAt" TIMESTAMP(3),
    "lastClickedAt" TIMESTAMP(3),
    "totalOpens" INTEGER NOT NULL DEFAULT 0,
    "totalClicks" INTEGER NOT NULL DEFAULT 0,
    "trialStartedAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),

    CONSTRAINT "email_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "host_profile_tests" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "gender" TEXT,
    "emailConsent" BOOLEAN NOT NULL DEFAULT false,
    "shareConsent" BOOLEAN NOT NULL DEFAULT false,
    "answers" JSONB NOT NULL,
    "scoreHospitalidad" DOUBLE PRECISION NOT NULL,
    "scoreComunicacion" DOUBLE PRECISION NOT NULL,
    "scoreOperativa" DOUBLE PRECISION NOT NULL,
    "scoreCrisis" DOUBLE PRECISION NOT NULL,
    "scoreData" DOUBLE PRECISION NOT NULL,
    "scoreLimites" DOUBLE PRECISION NOT NULL,
    "scoreMkt" DOUBLE PRECISION NOT NULL,
    "scoreBalance" DOUBLE PRECISION NOT NULL,
    "archetype" TEXT NOT NULL,
    "topStrength" TEXT NOT NULL,
    "criticalGap" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "host_profile_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_sequences" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "triggerEvent" TEXT NOT NULL,
    "targetArchetype" TEXT,
    "targetSource" TEXT,
    "targetTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "subscribersEnrolled" INTEGER NOT NULL DEFAULT 0,
    "subscribersCompleted" INTEGER NOT NULL DEFAULT 0,
    "subscribersActive" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_sequence_steps" (
    "id" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "templateData" JSONB,
    "delayDays" INTEGER NOT NULL DEFAULT 0,
    "delayHours" INTEGER NOT NULL DEFAULT 0,
    "sendAtHour" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "requiresPreviousOpen" BOOLEAN NOT NULL DEFAULT false,
    "requiresPreviousClick" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "emailsDelivered" INTEGER NOT NULL DEFAULT 0,
    "emailsOpened" INTEGER NOT NULL DEFAULT 0,
    "emailsClicked" INTEGER NOT NULL DEFAULT 0,
    "emailsBounced" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_sequence_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sequence_enrollments" (
    "id" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentStepOrder" INTEGER NOT NULL DEFAULT 0,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "pausedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "emailsOpened" INTEGER NOT NULL DEFAULT 0,
    "emailsClicked" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sequence_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_emails" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT,
    "subject" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "templateData" JSONB,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sendAttempts" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "resendId" TEXT,
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "complainedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "adminName" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "targetUserId" TEXT,
    "targetUserEmail" TEXT,
    "targetUserName" TEXT,
    "action" TEXT NOT NULL,
    "propertyId" TEXT,
    "propertyName" TEXT,
    "zoneId" TEXT,
    "zoneName" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_submissions" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "email" TEXT,
    "userId" TEXT,
    "status" "FaqSubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "answer" TEXT,
    "category" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "answeredAt" TIMESTAMP(3),
    "answeredBy" TEXT,

    CONSTRAINT "faq_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "resendId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_bookings" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "properties" TEXT NOT NULL,
    "challenge" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "source" TEXT NOT NULL DEFAULT 'direct',
    "meetLink" TEXT,
    "notes" TEXT,
    "adminNotes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "leadId" TEXT,

    CONSTRAINT "consultation_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_slots" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocked_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_owners" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "OwnerType" NOT NULL DEFAULT 'PERSONA_FISICA',
    "documentType" "DocumentType" NOT NULL DEFAULT 'INVOICE',
    "firstName" TEXT,
    "lastName" TEXT,
    "nif" TEXT,
    "companyName" TEXT,
    "cif" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'España',
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "iban" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_billing_configs" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "ownerId" TEXT,
    "airbnbNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bookingNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "vrboNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "incomeReceiver" "IncomeReceiver" NOT NULL DEFAULT 'OWNER',
    "commissionType" "CommissionType" NOT NULL DEFAULT 'PERCENTAGE',
    "commissionValue" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "commissionVat" DECIMAL(65,30) NOT NULL DEFAULT 21,
    "cleaningType" "CleaningType" NOT NULL DEFAULT 'FIXED_PER_RESERVATION',
    "cleaningValue" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "cleaningVatIncluded" BOOLEAN NOT NULL DEFAULT true,
    "cleaningFeeRecipient" "CleaningFeeRecipient" NOT NULL DEFAULT 'MANAGER',
    "cleaningFeeSplitPct" DECIMAL(65,30),
    "monthlyFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "monthlyFeeVat" DECIMAL(65,30) NOT NULL DEFAULT 21,
    "monthlyFeeConcept" TEXT,
    "defaultVatRate" DECIMAL(65,30) NOT NULL DEFAULT 21,
    "defaultRetentionRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "invoiceDetailLevel" "InvoiceDetailLevel" NOT NULL DEFAULT 'DETAILED',
    "singleConceptText" TEXT,
    "icalUrl" TEXT,
    "lastIcalSync" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_billing_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT,
    "notes" TEXT,
    "totalStays" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "firstStayAt" TIMESTAMP(3),
    "lastStayAt" TIMESTAMP(3),
    "averageStay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "billingConfigId" TEXT NOT NULL,
    "platform" "ReservationPlatform" NOT NULL,
    "confirmationCode" TEXT NOT NULL,
    "guestId" TEXT,
    "guestName" TEXT NOT NULL,
    "guestCountry" TEXT,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "travelers" JSONB,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkInTime" TEXT,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "checkOutTime" TEXT,
    "nights" INTEGER NOT NULL,
    "roomTotal" DECIMAL(65,30) NOT NULL,
    "cleaningFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "guestServiceFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "hostServiceFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "hostEarnings" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "type" "ReservationType" NOT NULL DEFAULT 'BOOKING',
    "relatedReservationId" TEXT,
    "status" "ReservationStatus" NOT NULL DEFAULT 'CONFIRMED',
    "guestMessage" TEXT,
    "internalNotes" TEXT,
    "importSource" TEXT,
    "importBatchId" TEXT,
    "sourceListingName" TEXT,
    "rawEmailData" TEXT,
    "unit" TEXT,
    "liquidationId" TEXT,
    "ownerAmount" DECIMAL(65,30),
    "managerAmount" DECIMAL(65,30),
    "cleaningAmount" DECIMAL(65,30),
    "invoiced" BOOLEAN NOT NULL DEFAULT false,
    "invoiceItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_payments" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "paymentType" "PaymentType" NOT NULL,
    "category" "PaymentCategory",
    "description" TEXT,
    "source" "PaymentSource" NOT NULL DEFAULT 'EMAIL',
    "emailId" TEXT,
    "rawEmailData" TEXT,
    "billingAction" "BillingAction" NOT NULL DEFAULT 'NORMAL',
    "invoiceId" TEXT,
    "invoiceLineId" TEXT,
    "autoDetected" BOOLEAN NOT NULL DEFAULT true,
    "userReviewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_expenses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "billingConfigId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "concept" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "vatAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "invoiceUrl" TEXT,
    "invoiceNumber" TEXT,
    "supplierName" TEXT,
    "supplierNif" TEXT,
    "chargeToOwner" BOOLEAN NOT NULL DEFAULT true,
    "liquidationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "liquidations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "totalIncome" DECIMAL(65,30) NOT NULL,
    "totalCommission" DECIMAL(65,30) NOT NULL,
    "totalCommissionVat" DECIMAL(65,30) NOT NULL,
    "totalRetention" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalCleaning" DECIMAL(65,30) NOT NULL,
    "totalExpenses" DECIMAL(65,30) NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "status" "LiquidationStatus" NOT NULL DEFAULT 'DRAFT',
    "pdfUrl" TEXT,
    "invoiceNumber" TEXT,
    "invoiceDate" TIMESTAMP(3),
    "invoiceSeries" TEXT,
    "paidAt" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "paymentReference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "liquidations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_invoice_configs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "nif" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'España',
    "email" TEXT,
    "phone" TEXT,
    "logoUrl" TEXT,
    "footerNotes" TEXT,
    "inboundEmailToken" TEXT NOT NULL,
    "paymentMethods" JSONB,
    "defaultPaymentMethod" TEXT,
    "bankName" TEXT,
    "iban" TEXT,
    "bic" TEXT,
    "bizumPhone" TEXT,
    "paypalEmail" TEXT,
    "onboardingSkippedAt" TIMESTAMP(3),
    "onboardingCompletedAt" TIMESTAMP(3),
    "onboardingReminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_invoice_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_series" (
    "id" TEXT NOT NULL,
    "invoiceConfigId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "type" "SeriesType" NOT NULL DEFAULT 'STANDARD',
    "currentNumber" INTEGER NOT NULL DEFAULT 0,
    "resetYearly" BOOLEAN NOT NULL DEFAULT true,
    "lastResetYear" INTEGER,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_invoices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "propertyId" TEXT,
    "periodMonth" INTEGER,
    "periodYear" INTEGER,
    "number" INTEGER,
    "fullNumber" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "issuedAt" TIMESTAMP(3),
    "subtotal" DECIMAL(65,30) NOT NULL,
    "totalVat" DECIMAL(65,30) NOT NULL,
    "retentionRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "retentionAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL,
    "status" "ClientInvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "isRectifying" BOOLEAN NOT NULL DEFAULT false,
    "rectifyingType" "RectifyingType",
    "rectifiesId" TEXT,
    "rectifyingReason" TEXT,
    "originalTotal" DECIMAL(65,30),
    "paymentMethodUsed" TEXT,
    "pdfUrl" TEXT,
    "publicToken" TEXT,
    "sentAt" TIMESTAMP(3),
    "sentTo" TEXT,
    "emailSubject" TEXT,
    "emailBody" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_invoice_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "vatRate" DECIMAL(65,30) NOT NULL DEFAULT 21,
    "retentionRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total" DECIMAL(65,30) NOT NULL,
    "reservationId" TEXT,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_imports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'AIRBNB',
    "importDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalRows" INTEGER NOT NULL,
    "importedCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "propertyId" TEXT,
    "importBatchId" TEXT,
    "listingsFound" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservation_imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_templates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "guestNameColumn" INTEGER NOT NULL,
    "checkInColumn" INTEGER NOT NULL,
    "checkOutColumn" INTEGER NOT NULL,
    "amountColumn" INTEGER NOT NULL,
    "confirmationCodeColumn" INTEGER,
    "nightsColumn" INTEGER,
    "cleaningFeeColumn" INTEGER,
    "commissionColumn" INTEGER,
    "statusColumn" INTEGER,
    "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "numberFormat" TEXT NOT NULL DEFAULT 'EU',
    "amountType" TEXT NOT NULL DEFAULT 'NET',
    "platform" TEXT NOT NULL DEFAULT 'OTHER',
    "originalHeaders" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "import_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gmail_integrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiry" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "syncErrors" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gmail_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gmail_synced_emails" (
    "id" TEXT NOT NULL,
    "gmailIntegrationId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "threadId" TEXT,
    "subject" TEXT,
    "fromEmail" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "emailType" TEXT NOT NULL,
    "parsedData" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "reservationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gmail_synced_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArticleTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ArticleTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CerebellumQueryToKnowledgeArticle" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CerebellumQueryToKnowledgeArticle_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_referralCode_key" ON "users"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_modules_stripeSubscriptionId_key" ON "user_modules"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "user_modules_userId_status_idx" ON "user_modules"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_modules_userId_moduleType_key" ON "user_modules"("userId", "moduleType");

-- CreateIndex
CREATE UNIQUE INDEX "billing_info_userId_key" ON "billing_info"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_key" ON "email_verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_email_token_key" ON "email_verification_tokens"("email", "token");

-- CreateIndex
CREATE UNIQUE INDEX "properties_slug_key" ON "properties"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "properties_propertyCode_key" ON "properties"("propertyCode");

-- CreateIndex
CREATE INDEX "properties_slug_idx" ON "properties"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "zones_qrCode_key" ON "zones"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "zones_accessCode_key" ON "zones"("accessCode");

-- CreateIndex
CREATE INDEX "zones_propertyId_status_idx" ON "zones"("propertyId", "status");

-- CreateIndex
CREATE INDEX "zones_qrCode_idx" ON "zones"("qrCode");

-- CreateIndex
CREATE INDEX "zones_slug_idx" ON "zones"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "zones_propertyId_slug_key" ON "zones"("propertyId", "slug");

-- CreateIndex
CREATE INDEX "steps_zoneId_order_idx" ON "steps"("zoneId", "order");

-- CreateIndex
CREATE INDEX "zone_comments_zoneId_status_idx" ON "zone_comments"("zoneId", "status");

-- CreateIndex
CREATE INDEX "error_reports_status_createdAt_idx" ON "error_reports"("status", "createdAt");

-- CreateIndex
CREATE INDEX "zone_ratings_zoneId_createdAt_idx" ON "zone_ratings"("zoneId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "property_analytics_propertyId_key" ON "property_analytics"("propertyId");

-- CreateIndex
CREATE INDEX "daily_stats_propertyId_date_idx" ON "daily_stats"("propertyId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_stats_propertyId_date_key" ON "daily_stats"("propertyId", "date");

-- CreateIndex
CREATE INDEX "tracking_events_propertyId_type_timestamp_idx" ON "tracking_events"("propertyId", "type", "timestamp");

-- CreateIndex
CREATE INDEX "tracking_events_zoneId_type_timestamp_idx" ON "tracking_events"("zoneId", "type", "timestamp");

-- CreateIndex
CREATE INDEX "tracking_events_sessionId_timestamp_idx" ON "tracking_events"("sessionId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "zone_analytics_zoneId_key" ON "zone_analytics"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_organizationId_userId_key" ON "organization_members"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_customDomain_key" ON "organizations"("customDomain");

-- CreateIndex
CREATE UNIQUE INDEX "user_inspiration_states_userId_key" ON "user_inspiration_states"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_code_key" ON "subscription_plans"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_stripe_subscription_id_key" ON "user_subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "admin_activity_log_admin_id_created_at_idx" ON "admin_activity_log"("admin_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "media_library_userId_type_idx" ON "media_library"("userId", "type");

-- CreateIndex
CREATE INDEX "media_library_hash_idx" ON "media_library"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "media_library_userId_hash_key" ON "media_library"("userId", "hash");

-- CreateIndex
CREATE INDEX "property_ratings_propertyId_status_idx" ON "property_ratings"("propertyId", "status");

-- CreateIndex
CREATE INDEX "property_ratings_guestId_idx" ON "property_ratings"("guestId");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "reviews_propertyId_isPublic_idx" ON "reviews"("propertyId", "isPublic");

-- CreateIndex
CREATE INDEX "reviews_zoneId_isPublic_idx" ON "reviews"("zoneId", "isPublic");

-- CreateIndex
CREATE INDEX "reviews_createdAt_idx" ON "reviews"("createdAt");

-- CreateIndex
CREATE INDEX "reviews_isApproved_isPublic_idx" ON "reviews"("isApproved", "isPublic");

-- CreateIndex
CREATE INDEX "announcements_propertyId_isActive_idx" ON "announcements"("propertyId", "isActive");

-- CreateIndex
CREATE INDEX "announcements_startDate_endDate_idx" ON "announcements"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "property_views_propertyId_viewedAt_idx" ON "property_views"("propertyId", "viewedAt");

-- CreateIndex
CREATE INDEX "property_views_hostId_viewedAt_idx" ON "property_views"("hostId", "viewedAt");

-- CreateIndex
CREATE INDEX "property_views_visitorIp_idx" ON "property_views"("visitorIp");

-- CreateIndex
CREATE INDEX "zone_views_zoneId_viewedAt_idx" ON "zone_views"("zoneId", "viewedAt");

-- CreateIndex
CREATE INDEX "zone_views_propertyId_viewedAt_idx" ON "zone_views"("propertyId", "viewedAt");

-- CreateIndex
CREATE INDEX "zone_views_hostId_viewedAt_idx" ON "zone_views"("hostId", "viewedAt");

-- CreateIndex
CREATE INDEX "zone_views_visitorIp_idx" ON "zone_views"("visitorIp");

-- CreateIndex
CREATE INDEX "zone_views_isHostView_idx" ON "zone_views"("isHostView");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE INDEX "call_logs_userId_idx" ON "call_logs"("userId");

-- CreateIndex
CREATE INDEX "call_logs_adminId_idx" ON "call_logs"("adminId");

-- CreateIndex
CREATE INDEX "call_logs_createdAt_idx" ON "call_logs"("createdAt");

-- CreateIndex
CREATE INDEX "user_notes_userId_idx" ON "user_notes"("userId");

-- CreateIndex
CREATE INDEX "user_notes_adminId_idx" ON "user_notes"("adminId");

-- CreateIndex
CREATE INDEX "user_notes_createdAt_idx" ON "user_notes"("createdAt");

-- CreateIndex
CREATE INDEX "affiliate_transactions_referrer_id_idx" ON "affiliate_transactions"("referrer_id");

-- CreateIndex
CREATE INDEX "affiliate_transactions_referred_user_id_idx" ON "affiliate_transactions"("referred_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_code_idx" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_validFrom_validUntil_idx" ON "coupons"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "coupons_campaignSource_idx" ON "coupons"("campaignSource");

-- CreateIndex
CREATE INDEX "coupon_uses_coupon_id_idx" ON "coupon_uses"("coupon_id");

-- CreateIndex
CREATE INDEX "coupon_uses_user_id_idx" ON "coupon_uses"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_change_tokens_token_key" ON "email_change_tokens"("token");

-- CreateIndex
CREATE INDEX "email_change_tokens_user_id_idx" ON "email_change_tokens"("user_id");

-- CreateIndex
CREATE INDEX "email_change_tokens_token_idx" ON "email_change_tokens"("token");

-- CreateIndex
CREATE INDEX "email_change_tokens_expires_at_idx" ON "email_change_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "email_change_tokens_user_id_new_email_key" ON "email_change_tokens"("user_id", "new_email");

-- CreateIndex
CREATE INDEX "pricing_tiers_min_properties_idx" ON "pricing_tiers"("min_properties");

-- CreateIndex
CREATE INDEX "pricing_tiers_max_properties_idx" ON "pricing_tiers"("max_properties");

-- CreateIndex
CREATE INDEX "subscription_requests_user_id_idx" ON "subscription_requests"("user_id");

-- CreateIndex
CREATE INDEX "subscription_requests_status_idx" ON "subscription_requests"("status");

-- CreateIndex
CREATE INDEX "subscription_requests_requested_at_idx" ON "subscription_requests"("requested_at");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_slug_idx" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_status_idx" ON "blog_posts"("status");

-- CreateIndex
CREATE INDEX "blog_posts_category_idx" ON "blog_posts"("category");

-- CreateIndex
CREATE INDEX "blog_posts_publishedAt_idx" ON "blog_posts"("publishedAt");

-- CreateIndex
CREATE INDEX "blog_posts_featured_idx" ON "blog_posts"("featured");

-- CreateIndex
CREATE INDEX "blog_posts_status_category_publishedAt_idx" ON "blog_posts"("status", "category", "publishedAt");

-- CreateIndex
CREATE INDEX "blog_posts_status_publishedAt_idx" ON "blog_posts"("status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "blog_comments_verificationToken_key" ON "blog_comments"("verificationToken");

-- CreateIndex
CREATE INDEX "blog_comments_postId_idx" ON "blog_comments"("postId");

-- CreateIndex
CREATE INDEX "blog_comments_parentId_idx" ON "blog_comments"("parentId");

-- CreateIndex
CREATE INDEX "blog_comments_status_idx" ON "blog_comments"("status");

-- CreateIndex
CREATE INDEX "blog_comments_createdAt_idx" ON "blog_comments"("createdAt");

-- CreateIndex
CREATE INDEX "blog_comments_verificationToken_idx" ON "blog_comments"("verificationToken");

-- CreateIndex
CREATE INDEX "leads_email_idx" ON "leads"("email");

-- CreateIndex
CREATE INDEX "leads_source_idx" ON "leads"("source");

-- CreateIndex
CREATE INDEX "leads_createdAt_idx" ON "leads"("createdAt");

-- CreateIndex
CREATE INDEX "leads_funnel_theme_idx" ON "leads"("funnel_theme");

-- CreateIndex
CREATE INDEX "customer_journey_stages_email_stage_idx" ON "customer_journey_stages"("email", "stage");

-- CreateIndex
CREATE INDEX "customer_journey_stages_lead_id_idx" ON "customer_journey_stages"("lead_id");

-- CreateIndex
CREATE INDEX "customer_journey_stages_user_id_idx" ON "customer_journey_stages"("user_id");

-- CreateIndex
CREATE INDEX "customer_journey_stages_stage_entered_at_idx" ON "customer_journey_stages"("stage", "entered_at");

-- CreateIndex
CREATE INDEX "email_events_email_eventType_idx" ON "email_events"("email", "eventType");

-- CreateIndex
CREATE INDEX "email_events_lead_id_idx" ON "email_events"("lead_id");

-- CreateIndex
CREATE INDEX "email_events_user_id_idx" ON "email_events"("user_id");

-- CreateIndex
CREATE INDEX "email_events_campaign_id_idx" ON "email_events"("campaign_id");

-- CreateIndex
CREATE INDEX "email_events_sent_at_idx" ON "email_events"("sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "academy_courses_slug_key" ON "academy_courses"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "academy_modules_courseId_slug_key" ON "academy_modules"("courseId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "academy_lessons_moduleId_slug_key" ON "academy_lessons"("moduleId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "academy_quizzes_moduleId_key" ON "academy_quizzes"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "academy_quiz_answers_attemptId_questionId_key" ON "academy_quiz_answers"("attemptId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_leads_verificationToken_key" ON "quiz_leads"("verificationToken");

-- CreateIndex
CREATE INDEX "quiz_leads_email_idx" ON "quiz_leads"("email");

-- CreateIndex
CREATE INDEX "quiz_leads_completedAt_idx" ON "quiz_leads"("completedAt");

-- CreateIndex
CREATE INDEX "quiz_leads_converted_idx" ON "quiz_leads"("converted");

-- CreateIndex
CREATE INDEX "quiz_leads_emailVerified_idx" ON "quiz_leads"("emailVerified");

-- CreateIndex
CREATE INDEX "quiz_leads_verificationToken_idx" ON "quiz_leads"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "academy_progress_userId_lessonId_key" ON "academy_progress"("userId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "academy_achievements_code_key" ON "academy_achievements"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "academy_diplomas_certificateCode_key" ON "academy_diplomas"("certificateCode");

-- CreateIndex
CREATE INDEX "academy_diplomas_userId_idx" ON "academy_diplomas"("userId");

-- CreateIndex
CREATE INDEX "academy_diplomas_courseId_idx" ON "academy_diplomas"("courseId");

-- CreateIndex
CREATE INDEX "academy_diplomas_finalScore_idx" ON "academy_diplomas"("finalScore");

-- CreateIndex
CREATE INDEX "academy_diplomas_completedAt_idx" ON "academy_diplomas"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "academy_users_email_key" ON "academy_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "academy_users_username_key" ON "academy_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "academy_users_emailVerificationToken_key" ON "academy_users"("emailVerificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "academy_user_progress_userId_lessonId_key" ON "academy_user_progress"("userId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "academy_user_quiz_answers_attemptId_questionId_key" ON "academy_user_quiz_answers"("attemptId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "academy_user_achievements_userId_achievementId_key" ON "academy_user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "academy_user_diplomas_certificateCode_key" ON "academy_user_diplomas"("certificateCode");

-- CreateIndex
CREATE INDEX "academy_user_diplomas_userId_idx" ON "academy_user_diplomas"("userId");

-- CreateIndex
CREATE INDEX "academy_user_diplomas_courseId_idx" ON "academy_user_diplomas"("courseId");

-- CreateIndex
CREATE INDEX "academy_user_diplomas_finalScore_idx" ON "academy_user_diplomas"("finalScore");

-- CreateIndex
CREATE INDEX "academy_reviews_courseId_isApproved_isPublic_idx" ON "academy_reviews"("courseId", "isApproved", "isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "academy_payments_stripeSessionId_key" ON "academy_payments"("stripeSessionId");

-- CreateIndex
CREATE INDEX "academy_payments_userId_idx" ON "academy_payments"("userId");

-- CreateIndex
CREATE INDEX "academy_payments_status_idx" ON "academy_payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "academy_email_logs_resendId_key" ON "academy_email_logs"("resendId");

-- CreateIndex
CREATE INDEX "academy_email_logs_userId_idx" ON "academy_email_logs"("userId");

-- CreateIndex
CREATE INDEX "academy_email_logs_emailType_idx" ON "academy_email_logs"("emailType");

-- CreateIndex
CREATE INDEX "academy_email_logs_sentAt_idx" ON "academy_email_logs"("sentAt");

-- CreateIndex
CREATE INDEX "academy_user_events_userId_createdAt_idx" ON "academy_user_events"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "academy_user_events_eventType_idx" ON "academy_user_events"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_categories_name_key" ON "knowledge_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_categories_slug_key" ON "knowledge_categories"("slug");

-- CreateIndex
CREATE INDEX "knowledge_categories_slug_idx" ON "knowledge_categories"("slug");

-- CreateIndex
CREATE INDEX "knowledge_categories_country_idx" ON "knowledge_categories"("country");

-- CreateIndex
CREATE INDEX "knowledge_categories_order_idx" ON "knowledge_categories"("order");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_tags_name_key" ON "knowledge_tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_tags_slug_key" ON "knowledge_tags"("slug");

-- CreateIndex
CREATE INDEX "knowledge_tags_slug_idx" ON "knowledge_tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_articles_slug_key" ON "knowledge_articles"("slug");

-- CreateIndex
CREATE INDEX "knowledge_articles_slug_idx" ON "knowledge_articles"("slug");

-- CreateIndex
CREATE INDEX "knowledge_articles_status_idx" ON "knowledge_articles"("status");

-- CreateIndex
CREATE INDEX "knowledge_articles_categoryId_idx" ON "knowledge_articles"("categoryId");

-- CreateIndex
CREATE INDEX "knowledge_articles_country_idx" ON "knowledge_articles"("country");

-- CreateIndex
CREATE INDEX "knowledge_articles_publishedAt_idx" ON "knowledge_articles"("publishedAt");

-- CreateIndex
CREATE INDEX "knowledge_sources_url_idx" ON "knowledge_sources"("url");

-- CreateIndex
CREATE INDEX "knowledge_sources_status_idx" ON "knowledge_sources"("status");

-- CreateIndex
CREATE INDEX "knowledge_sources_type_idx" ON "knowledge_sources"("type");

-- CreateIndex
CREATE INDEX "quiz_questions_category_idx" ON "quiz_questions"("category");

-- CreateIndex
CREATE INDEX "quiz_questions_difficulty_idx" ON "quiz_questions"("difficulty");

-- CreateIndex
CREATE INDEX "quiz_questions_isActive_idx" ON "quiz_questions"("isActive");

-- CreateIndex
CREATE INDEX "cerebellum_queries_userId_idx" ON "cerebellum_queries"("userId");

-- CreateIndex
CREATE INDEX "cerebellum_queries_createdAt_idx" ON "cerebellum_queries"("createdAt");

-- CreateIndex
CREATE INDEX "cerebellum_queries_wasHelpful_idx" ON "cerebellum_queries"("wasHelpful");

-- CreateIndex
CREATE UNIQUE INDEX "cerebellum_subscriptions_userId_key" ON "cerebellum_subscriptions"("userId");

-- CreateIndex
CREATE INDEX "cerebellum_subscriptions_userId_idx" ON "cerebellum_subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "email_subscribers_email_key" ON "email_subscribers"("email");

-- CreateIndex
CREATE INDEX "email_subscribers_email_idx" ON "email_subscribers"("email");

-- CreateIndex
CREATE INDEX "email_subscribers_archetype_idx" ON "email_subscribers"("archetype");

-- CreateIndex
CREATE INDEX "email_subscribers_source_idx" ON "email_subscribers"("source");

-- CreateIndex
CREATE INDEX "email_subscribers_status_idx" ON "email_subscribers"("status");

-- CreateIndex
CREATE INDEX "email_subscribers_engagementScore_idx" ON "email_subscribers"("engagementScore");

-- CreateIndex
CREATE INDEX "email_subscribers_currentJourneyStage_idx" ON "email_subscribers"("currentJourneyStage");

-- CreateIndex
CREATE INDEX "email_subscribers_subscribedAt_idx" ON "email_subscribers"("subscribedAt");

-- CreateIndex
CREATE INDEX "host_profile_tests_archetype_idx" ON "host_profile_tests"("archetype");

-- CreateIndex
CREATE INDEX "host_profile_tests_email_idx" ON "host_profile_tests"("email");

-- CreateIndex
CREATE INDEX "host_profile_tests_createdAt_idx" ON "host_profile_tests"("createdAt");

-- CreateIndex
CREATE INDEX "email_sequences_triggerEvent_idx" ON "email_sequences"("triggerEvent");

-- CreateIndex
CREATE INDEX "email_sequences_isActive_idx" ON "email_sequences"("isActive");

-- CreateIndex
CREATE INDEX "email_sequence_steps_sequenceId_order_idx" ON "email_sequence_steps"("sequenceId", "order");

-- CreateIndex
CREATE INDEX "sequence_enrollments_subscriberId_idx" ON "sequence_enrollments"("subscriberId");

-- CreateIndex
CREATE INDEX "sequence_enrollments_sequenceId_status_idx" ON "sequence_enrollments"("sequenceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "sequence_enrollments_subscriberId_sequenceId_key" ON "sequence_enrollments"("subscriberId", "sequenceId");

-- CreateIndex
CREATE UNIQUE INDEX "scheduled_emails_resendId_key" ON "scheduled_emails"("resendId");

-- CreateIndex
CREATE INDEX "scheduled_emails_status_scheduledFor_idx" ON "scheduled_emails"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "scheduled_emails_subscriberId_idx" ON "scheduled_emails"("subscriberId");

-- CreateIndex
CREATE INDEX "scheduled_emails_enrollmentId_idx" ON "scheduled_emails"("enrollmentId");

-- CreateIndex
CREATE INDEX "scheduled_emails_resendId_idx" ON "scheduled_emails"("resendId");

-- CreateIndex
CREATE INDEX "admin_audit_logs_adminId_createdAt_idx" ON "admin_audit_logs"("adminId", "createdAt");

-- CreateIndex
CREATE INDEX "admin_audit_logs_targetUserId_createdAt_idx" ON "admin_audit_logs"("targetUserId", "createdAt");

-- CreateIndex
CREATE INDEX "admin_audit_logs_action_createdAt_idx" ON "admin_audit_logs"("action", "createdAt");

-- CreateIndex
CREATE INDEX "admin_audit_logs_propertyId_createdAt_idx" ON "admin_audit_logs"("propertyId", "createdAt");

-- CreateIndex
CREATE INDEX "faq_submissions_status_idx" ON "faq_submissions"("status");

-- CreateIndex
CREATE INDEX "faq_submissions_createdAt_idx" ON "faq_submissions"("createdAt");

-- CreateIndex
CREATE INDEX "email_logs_userId_type_idx" ON "email_logs"("userId", "type");

-- CreateIndex
CREATE INDEX "email_logs_type_createdAt_idx" ON "email_logs"("type", "createdAt");

-- CreateIndex
CREATE INDEX "consultation_bookings_email_idx" ON "consultation_bookings"("email");

-- CreateIndex
CREATE INDEX "consultation_bookings_scheduledDate_idx" ON "consultation_bookings"("scheduledDate");

-- CreateIndex
CREATE INDEX "consultation_bookings_status_idx" ON "consultation_bookings"("status");

-- CreateIndex
CREATE INDEX "blocked_slots_date_idx" ON "blocked_slots"("date");

-- CreateIndex
CREATE UNIQUE INDEX "blocked_slots_date_time_key" ON "blocked_slots"("date", "time");

-- CreateIndex
CREATE INDEX "property_owners_userId_idx" ON "property_owners"("userId");

-- CreateIndex
CREATE INDEX "property_owners_email_idx" ON "property_owners"("email");

-- CreateIndex
CREATE UNIQUE INDEX "property_billing_configs_propertyId_key" ON "property_billing_configs"("propertyId");

-- CreateIndex
CREATE INDEX "property_billing_configs_ownerId_idx" ON "property_billing_configs"("ownerId");

-- CreateIndex
CREATE INDEX "guests_userId_idx" ON "guests"("userId");

-- CreateIndex
CREATE INDEX "guests_email_idx" ON "guests"("email");

-- CreateIndex
CREATE INDEX "guests_name_idx" ON "guests"("name");

-- CreateIndex
CREATE UNIQUE INDEX "guests_userId_email_key" ON "guests"("userId", "email");

-- CreateIndex
CREATE INDEX "reservations_userId_idx" ON "reservations"("userId");

-- CreateIndex
CREATE INDEX "reservations_billingConfigId_idx" ON "reservations"("billingConfigId");

-- CreateIndex
CREATE INDEX "reservations_guestId_idx" ON "reservations"("guestId");

-- CreateIndex
CREATE INDEX "reservations_checkIn_idx" ON "reservations"("checkIn");

-- CreateIndex
CREATE INDEX "reservations_checkOut_idx" ON "reservations"("checkOut");

-- CreateIndex
CREATE INDEX "reservations_status_idx" ON "reservations"("status");

-- CreateIndex
CREATE INDEX "reservations_liquidationId_idx" ON "reservations"("liquidationId");

-- CreateIndex
CREATE INDEX "reservations_invoiced_idx" ON "reservations"("invoiced");

-- CreateIndex
CREATE INDEX "reservations_importBatchId_idx" ON "reservations"("importBatchId");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_billingConfigId_platform_confirmationCode_key" ON "reservations"("billingConfigId", "platform", "confirmationCode");

-- CreateIndex
CREATE INDEX "reservation_payments_reservationId_idx" ON "reservation_payments"("reservationId");

-- CreateIndex
CREATE INDEX "reservation_payments_userId_idx" ON "reservation_payments"("userId");

-- CreateIndex
CREATE INDEX "reservation_payments_paymentDate_idx" ON "reservation_payments"("paymentDate");

-- CreateIndex
CREATE INDEX "reservation_payments_billingAction_idx" ON "reservation_payments"("billingAction");

-- CreateIndex
CREATE INDEX "property_expenses_userId_idx" ON "property_expenses"("userId");

-- CreateIndex
CREATE INDEX "property_expenses_billingConfigId_idx" ON "property_expenses"("billingConfigId");

-- CreateIndex
CREATE INDEX "property_expenses_date_idx" ON "property_expenses"("date");

-- CreateIndex
CREATE INDEX "property_expenses_liquidationId_idx" ON "property_expenses"("liquidationId");

-- CreateIndex
CREATE INDEX "liquidations_userId_idx" ON "liquidations"("userId");

-- CreateIndex
CREATE INDEX "liquidations_ownerId_idx" ON "liquidations"("ownerId");

-- CreateIndex
CREATE INDEX "liquidations_status_idx" ON "liquidations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "liquidations_userId_ownerId_year_month_key" ON "liquidations"("userId", "ownerId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "user_invoice_configs_userId_key" ON "user_invoice_configs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_invoice_configs_inboundEmailToken_key" ON "user_invoice_configs"("inboundEmailToken");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_series_invoiceConfigId_prefix_year_key" ON "invoice_series"("invoiceConfigId", "prefix", "year");

-- CreateIndex
CREATE UNIQUE INDEX "client_invoices_publicToken_key" ON "client_invoices"("publicToken");

-- CreateIndex
CREATE INDEX "client_invoices_userId_idx" ON "client_invoices"("userId");

-- CreateIndex
CREATE INDEX "client_invoices_ownerId_idx" ON "client_invoices"("ownerId");

-- CreateIndex
CREATE INDEX "client_invoices_propertyId_idx" ON "client_invoices"("propertyId");

-- CreateIndex
CREATE INDEX "client_invoices_status_idx" ON "client_invoices"("status");

-- CreateIndex
CREATE INDEX "client_invoices_issueDate_idx" ON "client_invoices"("issueDate");

-- CreateIndex
CREATE INDEX "client_invoices_ownerId_issueDate_idx" ON "client_invoices"("ownerId", "issueDate");

-- CreateIndex
CREATE UNIQUE INDEX "client_invoices_seriesId_number_key" ON "client_invoices"("seriesId", "number");

-- CreateIndex
CREATE INDEX "client_invoice_items_invoiceId_idx" ON "client_invoice_items"("invoiceId");

-- CreateIndex
CREATE INDEX "client_invoice_items_reservationId_idx" ON "client_invoice_items"("reservationId");

-- CreateIndex
CREATE UNIQUE INDEX "reservation_imports_importBatchId_key" ON "reservation_imports"("importBatchId");

-- CreateIndex
CREATE INDEX "reservation_imports_userId_idx" ON "reservation_imports"("userId");

-- CreateIndex
CREATE INDEX "reservation_imports_importDate_idx" ON "reservation_imports"("importDate");

-- CreateIndex
CREATE INDEX "reservation_imports_importBatchId_idx" ON "reservation_imports"("importBatchId");

-- CreateIndex
CREATE INDEX "import_templates_userId_idx" ON "import_templates"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "import_templates_userId_name_key" ON "import_templates"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "gmail_integrations_userId_key" ON "gmail_integrations"("userId");

-- CreateIndex
CREATE INDEX "gmail_synced_emails_gmailIntegrationId_status_idx" ON "gmail_synced_emails"("gmailIntegrationId", "status");

-- CreateIndex
CREATE INDEX "gmail_synced_emails_receivedAt_idx" ON "gmail_synced_emails"("receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "gmail_synced_emails_gmailIntegrationId_messageId_key" ON "gmail_synced_emails"("gmailIntegrationId", "messageId");

-- CreateIndex
CREATE INDEX "_ArticleTags_B_index" ON "_ArticleTags"("B");

-- CreateIndex
CREATE INDEX "_CerebellumQueryToKnowledgeArticle_B_index" ON "_CerebellumQueryToKnowledgeArticle"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_modules" ADD CONSTRAINT "user_modules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_modules" ADD CONSTRAINT "user_modules_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "subscription_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_info" ADD CONSTRAINT "billing_info_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_sets" ADD CONSTRAINT "property_sets_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_propertySetId_fkey" FOREIGN KEY ("propertySetId") REFERENCES "property_sets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "steps" ADD CONSTRAINT "steps_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zone_comments" ADD CONSTRAINT "zone_comments_moderatedBy_fkey" FOREIGN KEY ("moderatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zone_comments" ADD CONSTRAINT "zone_comments_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "error_reports" ADD CONSTRAINT "error_reports_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "error_reports" ADD CONSTRAINT "error_reports_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zone_ratings" ADD CONSTRAINT "zone_ratings_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_analytics" ADD CONSTRAINT "property_analytics_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_events" ADD CONSTRAINT "tracking_events_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_events" ADD CONSTRAINT "tracking_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_events" ADD CONSTRAINT "tracking_events_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zone_analytics" ADD CONSTRAINT "zone_analytics_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_inspiration_states" ADD CONSTRAINT "user_inspiration_states_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_custom_plan_id_fkey" FOREIGN KEY ("custom_plan_id") REFERENCES "custom_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "user_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_activity_log" ADD CONSTRAINT "admin_activity_log_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_library" ADD CONSTRAINT "media_library_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_ratings" ADD CONSTRAINT "property_ratings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_views" ADD CONSTRAINT "property_views_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_views" ADD CONSTRAINT "property_views_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zone_views" ADD CONSTRAINT "zone_views_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zone_views" ADD CONSTRAINT "zone_views_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zone_views" ADD CONSTRAINT "zone_views_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notes" ADD CONSTRAINT "user_notes_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notes" ADD CONSTRAINT "user_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_transactions" ADD CONSTRAINT "affiliate_transactions_referred_user_id_fkey" FOREIGN KEY ("referred_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_transactions" ADD CONSTRAINT "affiliate_transactions_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_uses" ADD CONSTRAINT "coupon_uses_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_uses" ADD CONSTRAINT "coupon_uses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_change_tokens" ADD CONSTRAINT "email_change_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_requests" ADD CONSTRAINT "subscription_requests_custom_plan_id_fkey" FOREIGN KEY ("custom_plan_id") REFERENCES "custom_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_requests" ADD CONSTRAINT "subscription_requests_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_requests" ADD CONSTRAINT "subscription_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "blog_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_journey_stages" ADD CONSTRAINT "customer_journey_stages_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_journey_stages" ADD CONSTRAINT "customer_journey_stages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "email_campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_modules" ADD CONSTRAINT "academy_modules_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "academy_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_lessons" ADD CONSTRAINT "academy_lessons_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "academy_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_quizzes" ADD CONSTRAINT "academy_quizzes_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "academy_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_questions" ADD CONSTRAINT "academy_questions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "academy_quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_quiz_attempts" ADD CONSTRAINT "academy_quiz_attempts_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "academy_quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_quiz_attempts" ADD CONSTRAINT "academy_quiz_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_quiz_answers" ADD CONSTRAINT "academy_quiz_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "academy_quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_quiz_answers" ADD CONSTRAINT "academy_quiz_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "academy_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_progress" ADD CONSTRAINT "academy_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "academy_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_progress" ADD CONSTRAINT "academy_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "academy_achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_user_progress" ADD CONSTRAINT "academy_user_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "academy_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_user_progress" ADD CONSTRAINT "academy_user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "academy_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_user_quiz_attempts" ADD CONSTRAINT "academy_user_quiz_attempts_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "academy_quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_user_quiz_attempts" ADD CONSTRAINT "academy_user_quiz_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "academy_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_user_quiz_answers" ADD CONSTRAINT "academy_user_quiz_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "academy_user_quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_user_quiz_answers" ADD CONSTRAINT "academy_user_quiz_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "academy_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_user_achievements" ADD CONSTRAINT "academy_user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "academy_achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_user_achievements" ADD CONSTRAINT "academy_user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "academy_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_user_diplomas" ADD CONSTRAINT "academy_user_diplomas_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "academy_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_user_diplomas" ADD CONSTRAINT "academy_user_diplomas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "academy_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_reviews" ADD CONSTRAINT "academy_reviews_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "academy_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_reviews" ADD CONSTRAINT "academy_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "academy_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_payments" ADD CONSTRAINT "academy_payments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "academy_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_payments" ADD CONSTRAINT "academy_payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "academy_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_email_logs" ADD CONSTRAINT "academy_email_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "academy_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_user_events" ADD CONSTRAINT "academy_user_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "academy_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_categories" ADD CONSTRAINT "knowledge_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "knowledge_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_articles" ADD CONSTRAINT "knowledge_articles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "knowledge_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_sources" ADD CONSTRAINT "knowledge_sources_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "knowledge_articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_relatedArticleId_fkey" FOREIGN KEY ("relatedArticleId") REFERENCES "knowledge_articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_profile_tests" ADD CONSTRAINT "host_profile_tests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_sequence_steps" ADD CONSTRAINT "email_sequence_steps_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "email_sequences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sequence_enrollments" ADD CONSTRAINT "sequence_enrollments_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "email_sequences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_emails" ADD CONSTRAINT "scheduled_emails_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "sequence_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_emails" ADD CONSTRAINT "scheduled_emails_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "email_sequence_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faq_submissions" ADD CONSTRAINT "faq_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_owners" ADD CONSTRAINT "property_owners_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_billing_configs" ADD CONSTRAINT "property_billing_configs_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_billing_configs" ADD CONSTRAINT "property_billing_configs_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "property_owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_billingConfigId_fkey" FOREIGN KEY ("billingConfigId") REFERENCES "property_billing_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_liquidationId_fkey" FOREIGN KEY ("liquidationId") REFERENCES "liquidations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_relatedReservationId_fkey" FOREIGN KEY ("relatedReservationId") REFERENCES "reservations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_invoiceItemId_fkey" FOREIGN KEY ("invoiceItemId") REFERENCES "client_invoice_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_payments" ADD CONSTRAINT "reservation_payments_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_payments" ADD CONSTRAINT "reservation_payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_payments" ADD CONSTRAINT "reservation_payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "client_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_expenses" ADD CONSTRAINT "property_expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_expenses" ADD CONSTRAINT "property_expenses_billingConfigId_fkey" FOREIGN KEY ("billingConfigId") REFERENCES "property_billing_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_expenses" ADD CONSTRAINT "property_expenses_liquidationId_fkey" FOREIGN KEY ("liquidationId") REFERENCES "liquidations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liquidations" ADD CONSTRAINT "liquidations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liquidations" ADD CONSTRAINT "liquidations_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "property_owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invoice_configs" ADD CONSTRAINT "user_invoice_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_series" ADD CONSTRAINT "invoice_series_invoiceConfigId_fkey" FOREIGN KEY ("invoiceConfigId") REFERENCES "user_invoice_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_invoices" ADD CONSTRAINT "client_invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_invoices" ADD CONSTRAINT "client_invoices_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "property_owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_invoices" ADD CONSTRAINT "client_invoices_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "invoice_series"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_invoices" ADD CONSTRAINT "client_invoices_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_invoices" ADD CONSTRAINT "client_invoices_rectifiesId_fkey" FOREIGN KEY ("rectifiesId") REFERENCES "client_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_invoice_items" ADD CONSTRAINT "client_invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "client_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_imports" ADD CONSTRAINT "reservation_imports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_templates" ADD CONSTRAINT "import_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gmail_integrations" ADD CONSTRAINT "gmail_integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gmail_synced_emails" ADD CONSTRAINT "gmail_synced_emails_gmailIntegrationId_fkey" FOREIGN KEY ("gmailIntegrationId") REFERENCES "gmail_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleTags" ADD CONSTRAINT "_ArticleTags_A_fkey" FOREIGN KEY ("A") REFERENCES "knowledge_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleTags" ADD CONSTRAINT "_ArticleTags_B_fkey" FOREIGN KEY ("B") REFERENCES "knowledge_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CerebellumQueryToKnowledgeArticle" ADD CONSTRAINT "_CerebellumQueryToKnowledgeArticle_A_fkey" FOREIGN KEY ("A") REFERENCES "cerebellum_queries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CerebellumQueryToKnowledgeArticle" ADD CONSTRAINT "_CerebellumQueryToKnowledgeArticle_B_fkey" FOREIGN KEY ("B") REFERENCES "knowledge_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
