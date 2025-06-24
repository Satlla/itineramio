import { 
  User, 
  Property, 
  PropertySet,
  Zone, 
  Step,
  ZoneComment, 
  ErrorReport, 
  ZoneRating,
  PropertyAnalytics,
  DailyStats
} from '@prisma/client'

// Prisma types re-export
export type {
  User,
  Property,
  PropertySet,
  Zone,
  Step,
  ZoneComment,
  ErrorReport,
  ZoneRating,
  PropertyAnalytics,
  DailyStats
}

// Extended types for UI components
export interface PropertyWithRelations extends Property {
  host: User
  zones: Zone[]
  analytics?: PropertyAnalytics | null
}

export interface PropertySetWithRelations extends PropertySet {
  host: User
  properties: Property[]
}

export interface ZoneWithRelations extends Zone {
  property?: Property | null
  steps: Step[]
  comments: ZoneComment[]
  errorReports: ErrorReport[]
  ratings: ZoneRating[]
}

// UI-specific types
export interface MultiLanguageContent {
  es: string
  en: string
  fr?: string
}

export interface StepContent {
  // For type: 'TEXT'
  text?: MultiLanguageContent
  
  // For type: 'IMAGE'
  imageUrl?: string
  imageAlt?: MultiLanguageContent
  imageDimensions?: {
    width: number
    height: number
  }
  
  // For type: 'VIDEO'
  videoUrl?: string
  videoDuration?: number // En segundos (máximo 30)
  videoThumbnail?: string
  videoSize?: number // En bytes
  subtitles?: {
    es?: string
    en?: string
    fr?: string
  }
}

export interface Address {
  street: string
  city: string
  state: string
  country: string
  postalCode: string
}

// Form types
export interface CreatePropertyData {
  name: string
  description: string
  street: string
  city: string
  state: string
  country: string
  postalCode: string
  type: 'APARTMENT' | 'HOUSE' | 'ROOM' | 'VILLA'
  bedrooms: number
  bathrooms: number
  maxGuests: number
  squareMeters?: number
  hostContactPhone: string
  hostContactEmail: string
  hostContactLanguage: string
  defaultLanguages: string[]
}

export interface CreatePropertySetData {
  name: string
  description: string
  street: string
  city: string
  state: string
  country: string
  postalCode: string
  type: 'HOTEL' | 'BUILDING' | 'COMPLEX' | 'RESORT' | 'HOSTEL' | 'APARTHOTEL'
  profileImage?: string
  hostContactName: string
  hostContactPhone: string
  hostContactEmail: string
  hostContactLanguage: string
  hostContactPhoto?: string
  selectedProperties?: string[]
}

export interface CreateZoneData {
  name: MultiLanguageContent
  description?: Partial<MultiLanguageContent>
  icon: string
  color?: string
  order: number
  whatsappEnabled: boolean
  errorReportsEnabled: boolean
  commentsEnabled: boolean
  ratingsEnabled: boolean
  propertyId?: string
}

export interface CreateStepData {
  type: string
  title: MultiLanguageContent
  content: StepContent
  order: number
  zoneId: string
}

// Analytics types
export interface ZonePerformance {
  zoneId: string
  zoneName: string
  views: number
  uniqueViews: number
  avgTimeSpent: number // Segundos
  completionRate: number // % que ve todos los steps
  avgRating: number
  errorReports: number
  whatsappClicks: number
  commentsCount: number
  lastViewedAt: Date
}

export interface CountryStats {
  country: string // Código ISO del país
  countryName: string // Nombre del país
  visitors: number
  percentage: number // % del total
}

// Icon categories for zone creation
export interface IconCategory {
  id: string
  label: string
  icons: string[]
}

export interface IconSelector {
  categories: Record<string, IconCategory>
  searchable: boolean
  categorized: boolean
  preview: boolean
  recent: boolean
  favorites: boolean
}

// Guest experience types
export interface PublicZone {
  id: string
  name: MultiLanguageContent
  description?: Partial<MultiLanguageContent>
  icon: string
  color?: string
  qrCode: string
  viewCount: number
  avgRating: number
}

export interface GuestProfile {
  ageRange?: string
  country?: string
  travelType?: 'BUSINESS' | 'LEISURE' | 'FAMILY'
}

// WhatsApp integration
export interface WhatsAppMessage {
  propertyName: string
  zoneName: string
  hostPhone: string
  context: string
}

// Error reporting
export interface ErrorReportContext {
  userAgent?: string
  browserInfo?: string
  deviceType: 'MOBILE' | 'TABLET' | 'DESKTOP'
  language: string
  affectedStep?: string
}

// System limits (from specs)
export interface SystemLimits {
  subscriptionLimits: Record<string, {
    properties: number | 'unlimited'
    zonesPerProperty: number
    stepsPerZone: number
    videosTotal: number
    storageLimit: string
  }>
  media: {
    video: {
      maxDuration: number
      maxFileSize: number
      supportedFormats: string[]
      minResolution: string
      maxResolution: string
    }
    image: {
      maxFileSize: number
      supportedFormats: string[]
      minDimensions: string
      maxDimensions: string
    }
  }
  text: {
    zoneName: number
    zoneDescription: number
    stepTitle: number
    stepContent: number
    comment: number
    errorReportDescription: number
  }
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form validation types
export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'tel' | 'select' | 'textarea' | 'file'
  validation?: ValidationRule
  placeholder?: string
  options?: { value: string; label: string }[]
}

// Dashboard stats
export interface DashboardStats {
  totalProperties: number
  totalZones: number
  totalViews: number
  avgRating: number
  pendingErrorReports: number
  recentActivity: Array<{
    type: 'view' | 'comment' | 'error_report' | 'rating'
    zoneName: string
    timestamp: Date
    value?: number
  }>
}