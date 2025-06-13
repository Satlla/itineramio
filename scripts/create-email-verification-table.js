const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createEmailVerificationTable() {
  try {
    console.log('Checking if email_verification_tokens table exists...')
    
    // Try to query the table
    try {
      await prisma.$queryRaw`SELECT 1 FROM email_verification_tokens LIMIT 1`
      console.log('✅ Table already exists')
      return
    } catch (error) {
      console.log('Table does not exist, creating it...')
    }
    
    // Create the table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(email, token)
      )
    `
    
    console.log('✅ Table created successfully')
    
    // Create indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token)
    `
    
    console.log('✅ Indexes created successfully')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createEmailVerificationTable()