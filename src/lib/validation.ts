import { VALIDATION_LIMITS } from './constants'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = []
  
  if (!email) {
    errors.push('Email es requerido')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Email debe tener un formato válido')
  }
  
  return { isValid: errors.length === 0, errors }
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []
  
  if (!password) {
    errors.push('Contraseña es requerida')
  } else {
    if (password.length < 8) {
      errors.push('Contraseña debe tener al menos 8 caracteres')
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Contraseña debe contener al menos una letra minúscula')
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Contraseña debe contener al menos una letra mayúscula')
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Contraseña debe contener al menos un número')
    }
  }
  
  return { isValid: errors.length === 0, errors }
}

export function validatePropertyName(name: string): ValidationResult {
  const errors: string[] = []
  
  if (!name) {
    errors.push('Nombre de propiedad es requerido')
  } else {
    if (name.length < VALIDATION_LIMITS.PROPERTY_NAME_MIN) {
      errors.push(`Nombre debe tener al menos ${VALIDATION_LIMITS.PROPERTY_NAME_MIN} caracteres`)
    }
    if (name.length > VALIDATION_LIMITS.PROPERTY_NAME_MAX) {
      errors.push(`Nombre no puede exceder ${VALIDATION_LIMITS.PROPERTY_NAME_MAX} caracteres`)
    }
  }
  
  return { isValid: errors.length === 0, errors }
}

export function validateZoneName(name: string): ValidationResult {
  const errors: string[] = []
  
  if (!name) {
    errors.push('Nombre de zona es requerido')
  } else {
    if (name.length < VALIDATION_LIMITS.ZONE_NAME_MIN) {
      errors.push(`Nombre debe tener al menos ${VALIDATION_LIMITS.ZONE_NAME_MIN} caracteres`)
    }
    if (name.length > VALIDATION_LIMITS.ZONE_NAME_MAX) {
      errors.push(`Nombre no puede exceder ${VALIDATION_LIMITS.ZONE_NAME_MAX} caracteres`)
    }
  }
  
  return { isValid: errors.length === 0, errors }
}

export function validateRequired(value: any, fieldName: string): ValidationResult {
  const errors: string[] = []
  
  if (value === null || value === undefined || value === '') {
    errors.push(`${fieldName} es requerido`)
  }
  
  return { isValid: errors.length === 0, errors }
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove basic HTML chars
    .substring(0, 1000) // Limit length
}

export function validateFileType(file: File, allowedTypes: string[]): ValidationResult {
  const errors: string[] = []
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`)
  }
  
  return { isValid: errors.length === 0, errors }
}

export function validateFileSize(file: File, maxSize: number): ValidationResult {
  const errors: string[] = []
  
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024))
    errors.push(`Archivo demasiado grande. Tamaño máximo: ${maxSizeMB}MB`)
  }
  
  return { isValid: errors.length === 0, errors }
}