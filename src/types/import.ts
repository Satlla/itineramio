/**
 * Types for Universal Reservation Import System
 */

// Column mapping - indices of columns in the CSV
export interface ColumnMapping {
  guestName: number
  checkIn: number
  checkOut: number
  amount: number
  confirmationCode?: number
  nights?: number
  cleaningFee?: number
  commission?: number
  status?: number
}

// Import configuration
export interface ImportConfig {
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'DD-MM-YYYY'
  numberFormat: 'EU' | 'US'  // EU: 1.234,56 | US: 1,234.56
  amountType: 'NET' | 'GROSS'  // NET: hostEarnings | GROSS: roomTotal
  platform: 'AIRBNB' | 'BOOKING' | 'VRBO' | 'DIRECT' | 'OTHER'
}

// Parsed reservation from CSV with validation info
export interface ParsedReservation {
  confirmationCode: string
  guestName: string
  checkIn: Date | null
  checkOut: Date | null
  nights: number
  amount: number
  cleaningFee: number
  commission: number
  status: string
  isValid: boolean
  errors: string[]
  rowIndex: number
}

// Import template saved by user
export interface ImportTemplate {
  id: string
  name: string
  mapping: ColumnMapping
  config: ImportConfig
  originalHeaders?: string[]
  createdAt: Date
  updatedAt: Date
}

// Import result
export interface ImportResult {
  totalRows: number
  importedCount: number
  skippedCount: number
  errorCount: number
  errors: Array<{ row: number; error: string; data?: unknown }>
}

// Props for ColumnMapper component
export interface ColumnMapperProps {
  headers: string[]
  sampleRows: string[][]
  onMappingComplete: (mapping: ColumnMapping, config: ImportConfig) => void
  onCancel: () => void
  savedTemplates?: ImportTemplate[]
  onSaveTemplate?: (name: string, mapping: ColumnMapping, config: ImportConfig) => Promise<void>
}

// Props for MappingPreview component
export interface MappingPreviewProps {
  rows: string[][]
  mapping: ColumnMapping
  config: ImportConfig
  maxRows?: number
}

// Column option for dropdown
export interface ColumnOption {
  index: number
  header: string
  sample: string
}

// Field definition for mapping UI
export interface MappingField {
  key: keyof ColumnMapping
  label: string
  labelEs: string
  required: boolean
  description?: string
}

// Date format option
export interface DateFormatOption {
  value: ImportConfig['dateFormat']
  label: string
  example: string
}

// Number format option
export interface NumberFormatOption {
  value: ImportConfig['numberFormat']
  label: string
  example: string
}

// Platform option
export interface PlatformOption {
  value: ImportConfig['platform']
  label: string
}

// Universal import request body
export interface UniversalImportRequest {
  rows: string[][]
  mapping: ColumnMapping
  config: ImportConfig
  propertyId: string
  skipDuplicates: boolean
}

// Validation result for a single row
export interface RowValidation {
  isValid: boolean
  errors: string[]
  parsedData?: {
    confirmationCode: string
    guestName: string
    checkIn: Date
    checkOut: Date
    nights: number
    amount: number
    cleaningFee: number
    commission: number
    status: string
  }
}
