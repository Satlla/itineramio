/**
 * Tests para parsing de CSV y detección de plataforma
 * Verifica la lógica de importación de reservas
 */

import { describe, it, expect } from 'vitest'

// Amount parsing function (extracted from page)
function parseAmount(str: string): number {
  if (!str) return 0

  let cleaned = str.replace(/[€$£\s]/g, '')

  if (cleaned.includes(',') && cleaned.includes('.')) {
    const lastComma = cleaned.lastIndexOf(',')
    const lastDot = cleaned.lastIndexOf('.')
    if (lastComma > lastDot) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.')
    } else {
      cleaned = cleaned.replace(/,/g, '')
    }
  } else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.')
  }

  return parseFloat(cleaned) || 0
}

// Date parsing function (extracted from import-preview/route.ts)
function parseDate(value: string): Date | null {
  if (!value || typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed) return null

  // ISO format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const d = new Date(trimmed)
    if (!isNaN(d.getTime())) return d
  }

  // DD/MM/YYYY or MM/DD/YYYY format
  const parts = trimmed.split(/[\/\-\.]/)
  if (parts.length >= 3) {
    const num1 = parseInt(parts[0], 10)
    const num2 = parseInt(parts[1], 10)
    const num3 = parseInt(parts[2], 10)

    // Determine year
    let y: number
    if (num3 > 100) {
      y = num3
    } else if (num1 > 100) {
      y = num1
    } else {
      y = 2000 + num3
    }

    // Determine day and month based on values
    if (num2 > 12) {
      // num2 is the day (MM/DD/YYYY)
      return new Date(Date.UTC(y, num1 - 1, num2, 12, 0, 0))
    }
    if (num1 > 12) {
      // num1 is the day (DD/MM/YYYY)
      return new Date(Date.UTC(y, num2 - 1, num1, 12, 0, 0))
    }
    // Ambiguous: assume MM/DD/YYYY (Airbnb default)
    return new Date(Date.UTC(y, num1 - 1, num2, 12, 0, 0))
  }

  return null
}

// Platform detection
function detectPlatform(headers: string[]): 'AIRBNB' | 'BOOKING' | 'UNKNOWN' {
  const headerStr = headers.join(' ').toLowerCase()

  if (headerStr.includes('confirmation code') || headerStr.includes('código de confirmación')) {
    return 'AIRBNB'
  }
  if (headerStr.includes('reservation number') || headerStr.includes('número de reserva') ||
      headerStr.includes('booker name') || headerStr.includes('nombre del cliente')) {
    return 'BOOKING'
  }
  return 'UNKNOWN'
}

describe('Amount Parsing', () => {
  describe('Basic formats', () => {
    it('should parse simple numbers', () => {
      expect(parseAmount('100')).toBe(100)
      expect(parseAmount('100.50')).toBe(100.50)
      expect(parseAmount('0')).toBe(0)
    })

    it('should handle currency symbols', () => {
      expect(parseAmount('€100')).toBe(100)
      expect(parseAmount('$100.50')).toBe(100.50)
      expect(parseAmount('£200')).toBe(200)
      expect(parseAmount('100€')).toBe(100)
    })

    it('should handle spaces', () => {
      expect(parseAmount('100 ')).toBe(100)
      expect(parseAmount(' 100')).toBe(100)
      expect(parseAmount('1 000')).toBe(1000)
    })
  })

  describe('European format (comma as decimal)', () => {
    it('should parse comma as decimal separator', () => {
      expect(parseAmount('100,50')).toBe(100.50)
      expect(parseAmount('1,5')).toBe(1.5)
    })

    it('should handle thousands with dot, decimal with comma', () => {
      expect(parseAmount('1.234,56')).toBe(1234.56)
      expect(parseAmount('10.000,00')).toBe(10000)
    })
  })

  describe('US format (dot as decimal)', () => {
    it('should parse dot as decimal separator', () => {
      expect(parseAmount('100.50')).toBe(100.50)
    })

    it('should handle thousands with comma, decimal with dot', () => {
      expect(parseAmount('1,234.56')).toBe(1234.56)
      expect(parseAmount('10,000.00')).toBe(10000)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty values', () => {
      expect(parseAmount('')).toBe(0)
      expect(parseAmount(null as any)).toBe(0)
      expect(parseAmount(undefined as any)).toBe(0)
    })

    it('should handle invalid strings', () => {
      expect(parseAmount('abc')).toBe(0)
      expect(parseAmount('N/A')).toBe(0)
      expect(parseAmount('-')).toBe(0)
    })

    it('should handle negative amounts', () => {
      expect(parseAmount('-100')).toBe(-100)
      expect(parseAmount('-100.50')).toBe(-100.50)
    })
  })
})

describe('Date Parsing', () => {
  describe('ISO format', () => {
    it('should parse ISO dates', () => {
      const d = parseDate('2025-01-15')
      expect(d?.getFullYear()).toBe(2025)
      expect(d?.getMonth()).toBe(0) // January
      expect(d?.getDate()).toBe(15)
    })

    it('should parse ISO datetime', () => {
      const d = parseDate('2025-01-15T10:30:00')
      expect(d?.getFullYear()).toBe(2025)
    })
  })

  describe('European format (DD/MM/YYYY)', () => {
    it('should parse when day > 12 (unambiguous)', () => {
      const d = parseDate('25/01/2025')
      expect(d?.getFullYear()).toBe(2025)
      expect(d?.getMonth()).toBe(0) // January
      expect(d?.getDate()).toBe(25)
    })

    it('should parse with different separators', () => {
      const d1 = parseDate('25-01-2025')
      const d2 = parseDate('25.01.2025')
      expect(d1?.getDate()).toBe(25)
      expect(d2?.getDate()).toBe(25)
    })
  })

  describe('US format (MM/DD/YYYY)', () => {
    it('should parse when month position has value > 12 (unambiguous)', () => {
      const d = parseDate('01/25/2025')
      expect(d?.getFullYear()).toBe(2025)
      expect(d?.getMonth()).toBe(0) // January
      expect(d?.getDate()).toBe(25)
    })
  })

  describe('Ambiguous dates', () => {
    it('should default to MM/DD/YYYY for ambiguous dates', () => {
      // 05/06/2025 could be May 6 or June 5
      const d = parseDate('05/06/2025')
      // Default is MM/DD/YYYY (Airbnb), so May 6
      expect(d?.getMonth()).toBe(4) // May (0-indexed)
      expect(d?.getDate()).toBe(6)
    })
  })

  describe('Two-digit year', () => {
    it('should handle two-digit years', () => {
      const d = parseDate('25/01/25')
      expect(d?.getFullYear()).toBe(2025)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty values', () => {
      expect(parseDate('')).toBeNull()
      expect(parseDate(null as any)).toBeNull()
      expect(parseDate(undefined as any)).toBeNull()
    })

    it('should handle invalid dates', () => {
      expect(parseDate('invalid')).toBeNull()
      expect(parseDate('99/99/9999')).not.toBeNull() // JavaScript Date is lenient
    })
  })
})

describe('Platform Detection', () => {
  describe('Airbnb detection', () => {
    it('should detect Airbnb from English headers', () => {
      const headers = ['Confirmation code', 'Guest name', 'Check-in', 'Check-out', 'Earnings']
      expect(detectPlatform(headers)).toBe('AIRBNB')
    })

    it('should detect Airbnb from Spanish headers', () => {
      const headers = ['Código de confirmación', 'Nombre del huésped', 'Fecha entrada']
      expect(detectPlatform(headers)).toBe('AIRBNB')
    })
  })

  describe('Booking detection', () => {
    it('should detect Booking from English headers', () => {
      const headers = ['Reservation number', 'Booker name', 'Check-in date']
      expect(detectPlatform(headers)).toBe('BOOKING')
    })

    it('should detect Booking from Spanish headers', () => {
      const headers = ['Número de reserva', 'Nombre del cliente', 'Fecha de entrada']
      expect(detectPlatform(headers)).toBe('BOOKING')
    })
  })

  describe('Unknown platform', () => {
    it('should return UNKNOWN for unrecognized headers', () => {
      const headers = ['ID', 'Name', 'Date', 'Amount']
      expect(detectPlatform(headers)).toBe('UNKNOWN')
    })

    it('should return UNKNOWN for empty headers', () => {
      expect(detectPlatform([])).toBe('UNKNOWN')
    })
  })
})

describe('CSV Line Parsing', () => {
  function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++ // Skip next quote
        } else {
          inQuotes = !inQuotes
        }
      } else if ((char === ',' || char === ';') && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  it('should parse simple CSV line', () => {
    const result = parseCSVLine('a,b,c')
    expect(result).toEqual(['a', 'b', 'c'])
  })

  it('should handle quoted fields', () => {
    const result = parseCSVLine('"hello, world",b,c')
    expect(result).toEqual(['hello, world', 'b', 'c'])
  })

  it('should handle escaped quotes', () => {
    const result = parseCSVLine('"hello ""world""",b')
    expect(result).toEqual(['hello "world"', 'b'])
  })

  it('should handle semicolon separator', () => {
    const result = parseCSVLine('a;b;c')
    expect(result).toEqual(['a', 'b', 'c'])
  })

  it('should handle empty fields', () => {
    const result = parseCSVLine('a,,c')
    expect(result).toEqual(['a', '', 'c'])
  })

  it('should trim whitespace', () => {
    const result = parseCSVLine('  a  ,  b  ,  c  ')
    expect(result).toEqual(['a', 'b', 'c'])
  })
})
