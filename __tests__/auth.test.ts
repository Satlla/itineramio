/**
 * Tests críticos para el sistema de autenticación
 * Cubre: signToken, verifyToken, expiración, tokens inválidos, rate limiting
 */

import { describe, it, expect } from 'vitest'
import { signToken, verifyToken } from '../src/lib/auth'
import { checkRateLimit, getRateLimitKey } from '../src/lib/rate-limit'

const validPayload = {
  userId: 'user_123',
  email: 'test@example.com',
  role: 'HOST',
}

describe('Auth — JWT tokens', () => {
  it('signToken genera un JWT válido con 3 partes', () => {
    const token = signToken(validPayload)
    expect(typeof token).toBe('string')
    expect(token.split('.').length).toBe(3)
  })

  it('verifyToken devuelve el payload original', () => {
    const token = signToken(validPayload)
    const decoded = verifyToken(token)
    expect(decoded.userId).toBe(validPayload.userId)
    expect(decoded.email).toBe(validPayload.email)
    expect(decoded.role).toBe(validPayload.role)
  })

  it('verifyToken incluye iat y exp', () => {
    const token = signToken(validPayload)
    const decoded = verifyToken(token)
    expect(decoded.iat).toBeDefined()
    expect(decoded.exp).toBeDefined()
    expect(decoded.exp!).toBeGreaterThan(decoded.iat!)
  })

  it('verifyToken lanza error con token inválido', () => {
    expect(() => verifyToken('invalid.token.here')).toThrow()
  })

  it('verifyToken lanza error con token manipulado', () => {
    const token = signToken(validPayload)
    const parts = token.split('.')
    const tamperedPayload = Buffer.from(JSON.stringify({ userId: 'hacker' })).toString('base64url')
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`
    expect(() => verifyToken(tamperedToken)).toThrow()
  })

  it('verifyToken lanza error con token vacío', () => {
    expect(() => verifyToken('')).toThrow()
  })

  it('dos usuarios tienen tokens diferentes', () => {
    const token1 = signToken({ ...validPayload, userId: 'user_1' })
    const token2 = signToken({ ...validPayload, userId: 'user_2' })
    expect(token1).not.toBe(token2)
  })

  it('token contiene userId correcto en payload base64', () => {
    const token = signToken(validPayload)
    const payloadBase64 = token.split('.')[1]
    const payloadJson = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString())
    expect(payloadJson.userId).toBe(validPayload.userId)
  })
})

describe('Rate limiting — in-memory', () => {
  it('getRateLimitKey con userId usa formato user:', () => {
    const request = new Request('https://example.com/api/test')
    const key = getRateLimitKey(request, 'user_123', 'checkout')
    expect(key).toBe('checkout:user:user_123')
  })

  it('getRateLimitKey sin prefix no incluye prefijo', () => {
    const request = new Request('https://example.com/api/test')
    const key = getRateLimitKey(request, 'user_abc')
    expect(key).toBe('user:user_abc')
  })

  it('getRateLimitKey sin userId usa IP del header', () => {
    const request = new Request('https://example.com/api/test', {
      headers: { 'x-forwarded-for': '1.2.3.4' }
    })
    const key = getRateLimitKey(request, null, 'checkout')
    expect(key).toBe('checkout:ip:1.2.3.4')
  })

  it('permite solicitudes dentro del límite', () => {
    const key = `allow_${Date.now()}`
    const result = checkRateLimit(key, { maxRequests: 5, windowMs: 60000 })
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
    expect(result.limit).toBe(5)
  })

  it('bloquea cuando se supera el límite', () => {
    const key = `block_${Date.now()}_${Math.random()}`
    const config = { maxRequests: 2, windowMs: 60000 }
    checkRateLimit(key, config) // 1
    checkRateLimit(key, config) // 2 — agota el límite
    const result = checkRateLimit(key, config) // 3 — bloqueado
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('el contador se incrementa correctamente', () => {
    const key = `count_${Date.now()}_${Math.random()}`
    const config = { maxRequests: 10, windowMs: 60000 }
    const r1 = checkRateLimit(key, config)
    const r2 = checkRateLimit(key, config)
    const r3 = checkRateLimit(key, config)
    expect(r1.current).toBe(1)
    expect(r2.current).toBe(2)
    expect(r3.current).toBe(3)
  })

  it('resetIn es positivo y menor que windowMs', () => {
    const key = `reset_${Date.now()}`
    const windowMs = 60000
    const result = checkRateLimit(key, { maxRequests: 5, windowMs })
    expect(result.resetIn).toBeGreaterThan(0)
    expect(result.resetIn).toBeLessThanOrEqual(windowMs)
  })
})
