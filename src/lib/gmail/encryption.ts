/**
 * Token Encryption for Gmail Integration
 * Encrypts sensitive tokens before storing in database
 */

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

function getEncryptionKey(): Buffer {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key-for-encryption'
  // Derive a 32-byte key from the secret
  return crypto.scryptSync(secret, 'gmail-tokens-salt', 32)
}

/**
 * Encrypt a token before storing in database
 */
export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  // Combine IV + authTag + encrypted data
  return iv.toString('hex') + authTag.toString('hex') + encrypted
}

/**
 * Decrypt a token from database
 */
export function decryptToken(encryptedData: string): string {
  const key = getEncryptionKey()

  // Extract IV, authTag, and encrypted data
  const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), 'hex')
  const authTag = Buffer.from(encryptedData.slice(IV_LENGTH * 2, IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2), 'hex')
  const encrypted = encryptedData.slice(IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2)

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Check if a string is encrypted (starts with hex IV)
 */
export function isEncrypted(data: string): boolean {
  // Encrypted data is at least IV (32 hex chars) + authTag (32 hex chars) + some data
  return data.length > 64 && /^[0-9a-f]+$/i.test(data.slice(0, 64))
}
