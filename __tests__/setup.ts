// Test setup — variables de entorno para tests
import { vi } from 'vitest'

process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-testing-purposes-32chars'
process.env.ADMIN_JWT_SECRET = 'admin-test-secret-that-is-long-enough-for-testing'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

// Prisma mock básico — los tests de auth no usan DB
vi.mock('../src/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
    property: { count: vi.fn().mockResolvedValue(0) },
    zone: { count: vi.fn().mockResolvedValue(0) },
    reservation: { count: vi.fn().mockResolvedValue(0) },
    liquidation: { count: vi.fn().mockResolvedValue(0) },
    userInvoiceConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    propertyOwner: { findFirst: vi.fn(), update: vi.fn() },
  }
}))
