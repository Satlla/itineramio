import { prisma } from './prisma'

export function generatePropertyCode(): string {
  const prefix = 'ITN'
  const number = Math.floor(100000 + Math.random() * 900000)
  return `${prefix}-${number}`
}

export async function generateUniquePropertyCode(): Promise<string> {
  let code = generatePropertyCode()
  let isUnique = false
  let attempts = 0

  while (!isUnique && attempts < 20) {
    try {
      const existing = await prisma.property.findUnique({
        where: { propertyCode: code }
      })
      
      if (!existing) {
        isUnique = true
      } else {
        code = generatePropertyCode()
        attempts++
      }
    } catch (error) {
      console.error('Error checking property code uniqueness:', error)
      break
    }
  }

  if (!isUnique) {
    throw new Error('Could not generate unique property code after multiple attempts')
  }

  return code
}

export function formatPropertyCode(code: string): string {
  return code.toUpperCase()
}

export function validatePropertyCode(code: string): boolean {
  const codePattern = /^ITN-\d{6}$/
  return codePattern.test(code)
}