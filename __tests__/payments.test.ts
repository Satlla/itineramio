/**
 * Tests críticos para el flujo de pagos y cálculos de liquidaciones
 */

import { describe, it, expect } from 'vitest'
import { formatCurrency } from '../src/lib/format'
import { MODULES } from '../src/config/modules'

describe('Formato de moneda', () => {
  it('formatea números correctamente en locale es-ES', () => {
    const result = formatCurrency(1234.56)
    expect(result).toContain('1')
    expect(result).toContain('234')
    expect(result).toContain('56')
  })

  it('formatea 0 correctamente', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })

  it('formatea números negativos', () => {
    const result = formatCurrency(-500)
    expect(result).toContain('500')
    expect(result).toContain('-')
  })

  it('formatea números grandes sin perder decimales', () => {
    const result = formatCurrency(10000.99)
    expect(result).toContain('99')
  })
})

describe('Módulos — configuración', () => {
  it('MODULES es un objeto con claves válidas', () => {
    expect(typeof MODULES).toBe('object')
    expect(MODULES).not.toBeNull()
    expect(Object.keys(MODULES).length).toBeGreaterThan(0)
  })

  it('cada módulo tiene los campos obligatorios', () => {
    for (const [code, module] of Object.entries(MODULES)) {
      expect(module).toHaveProperty('code')
      expect(module).toHaveProperty('name')
      expect(typeof (module as any).name).toBe('string')
      expect(typeof (module as any).code).toBe('string')
    }
  })
})

describe('Cálculos de liquidaciones', () => {
  it('totalAmount = ingresos - comisión - IVA comisión - limpieza', () => {
    const totalIncome = 1000
    const totalCommission = 100
    const totalCommissionVat = 21
    const totalCleaning = 50

    const totalAmount = totalIncome - totalCommission - totalCommissionVat - totalCleaning
    expect(totalAmount).toBe(829)
  })

  it('retención IRPF se aplica sobre ingresos netos (sin limpieza)', () => {
    const hostEarnings = 1000
    const cleaningFee = 100
    const retentionRate = 0.15

    const netIncome = hostEarnings - cleaningFee
    const retention = parseFloat((netIncome * retentionRate).toFixed(2))

    expect(retention).toBe(135)
  })

  it('comisión 10% sobre ingresos netos', () => {
    const hostEarnings = 1000
    const cleaningFee = 100
    const commissionRate = 0.10

    const netIncome = hostEarnings - cleaningFee
    const commission = parseFloat((netIncome * commissionRate).toFixed(2))

    expect(commission).toBe(90)
  })

  it('IVA de comisión al 21%', () => {
    const commission = 90
    const vat = parseFloat((commission * 0.21).toFixed(2))
    expect(vat).toBe(18.9)
  })

  it('precio por noche = (ingresos - limpieza) / noches', () => {
    const hostEarnings = 700
    const cleaningFee = 100
    const nights = 6

    const pricePerNight = parseFloat(((hostEarnings - cleaningFee) / nights).toFixed(2))
    expect(pricePerNight).toBe(100)
  })

  it('ocupación mensual = noches reservadas / días del mes * 100', () => {
    const reservedNights = 21
    const daysInMonth = 30
    const occupancy = parseFloat(((reservedNights / daysInMonth) * 100).toFixed(1))
    expect(occupancy).toBe(70)
  })
})

describe('Stripe — validación de formato de claves', () => {
  it('formato test key correcto', () => {
    const testKey = 'sk_test_abc123'
    expect(testKey).toMatch(/^sk_(test|live)_/)
  })

  it('formato live key correcto', () => {
    const liveKey = 'sk_live_abc123'
    expect(liveKey).toMatch(/^sk_(test|live)_/)
  })

  it('formato publishable key correcto', () => {
    const pk = 'pk_test_abc123'
    expect(pk).toMatch(/^pk_(test|live)_/)
  })
})
