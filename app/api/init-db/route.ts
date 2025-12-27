import { NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET() {
  try {
    console.log('Initializing database tables...')
    
    // Check if email_verification_tokens table exists
    try {
      await prisma.$queryRaw`SELECT 1 FROM email_verification_tokens LIMIT 1`
      console.log('email_verification_tokens table already exists')
    } catch (error) {
      console.log('Creating email_verification_tokens table...')
      
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
      
      // Create index
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token)
      `
      
      console.log('email_verification_tokens table created successfully')
    }
    
    // Test the connection and show existing tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      tables
    })
    
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}