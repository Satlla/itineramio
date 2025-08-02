import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Announcements Table Fix - Ensuring table structure...')
    
    // First check current schema
    const currentSchema = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'announcements' 
      ORDER BY column_name
    `
    
    console.log('Current announcements schema:', currentSchema)
    
    // Add potentially missing columns
    const columnsToAdd = [
      '"id" TEXT PRIMARY KEY DEFAULT cuid()',
      '"propertyId" TEXT NOT NULL',
      '"title" TEXT NOT NULL',
      '"message" TEXT',
      '"priority" INTEGER DEFAULT 1',
      '"isActive" BOOLEAN DEFAULT true',
      '"startDate" TIMESTAMP',
      '"endDate" TIMESTAMP', 
      '"createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      '"updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    ]
    
    for (const column of columnsToAdd) {
      try {
        const columnName = column.split(' ')[0].replace(/"/g, '')
        const columnDef = column.split(' ').slice(1).join(' ')
        
        await prisma.$executeRawUnsafe(`
          ALTER TABLE announcements 
          ADD COLUMN IF NOT EXISTS ${columnName} ${columnDef}
        `)
        console.log(`✅ Added/verified column: ${columnName}`)
      } catch (error) {
        console.warn(`⚠️ Column issue: ${error}`)
      }
    }
    
    // Test a simple query
    const count = await prisma.announcement.count()
    console.log('✅ Announcements count:', count)
    
    // Test query for specific property
    const testQuery = await prisma.announcement.findMany({
      where: { propertyId: 'cmdsr3qi70001lj04y8jvt893' },
      take: 1
    })
    console.log('✅ Test query result:', testQuery.length)
    
    return NextResponse.json({
      success: true,
      message: 'Announcements table structure verified',
      currentSchema,
      totalCount: count,
      testQueryCount: testQuery.length
    })
    
  } catch (error) {
    console.error('💥 Fix announcements error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}