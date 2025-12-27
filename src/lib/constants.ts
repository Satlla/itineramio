// Authentication constants
export const JWT_EXPIRY = '24h'

// User roles
export enum UserRole {
  HOST = 'HOST',
  ADMIN = 'ADMIN',
  GUEST = 'GUEST'
}

// Upload constants
export const MAX_VIDEO_SIZE = 200 * 1024 * 1024 // 200MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
export const UPLOAD_CHUNK_SIZE = 1024 * 1024 // 1MB

// Video compression settings
export const VIDEO_COMPRESSION = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  frameRate: 30
}

// Cache durations (in seconds)
export const CACHE_DURATION = {
  STATIC_ASSETS: 31536000, // 1 year
  API_RESPONSES: 300, // 5 minutes
  USER_SESSION: 86400 // 24 hours
}

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso denegado',
  NOT_FOUND: 'Recurso no encontrado',
  VALIDATION_ERROR: 'Error de validación',
  INTERNAL_ERROR: 'Error interno del servidor'
}

// Validation limits
export const VALIDATION_LIMITS = {
  PROPERTY_NAME_MIN: 2,
  PROPERTY_NAME_MAX: 100,
  ZONE_NAME_MIN: 2,
  ZONE_NAME_MAX: 50,
  STEP_TITLE_MAX: 100,
  STEP_CONTENT_MAX: 5000
}