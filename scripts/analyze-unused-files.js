/**
 * SAFE SCRIPT: Analyze unused files in Vercel Blob
 * This script ONLY analyzes and reports, does NOT delete anything
 *
 * Run with: node scripts/analyze-unused-files.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { PrismaClient } = require('@prisma/client')
const { list } = require('@vercel/blob')

const prisma = new PrismaClient()

// ⚠️ PROTECTED USERS - Their files will NEVER be deleted
const PROTECTED_USERS = [
  'Israel Bernal',
  // Add more user names here if needed
]

async function analyzeUnusedFiles() {
  try {
    console.log('🔍 Starting safe analysis of Vercel Blob files...\n')
    console.log('⚠️  This script will NOT delete anything\n')
    console.log('🛡️  Protected users:', PROTECTED_USERS.join(', '))
    console.log()

    // Step 1: Get all files from Vercel Blob
    console.log('📋 Step 1: Fetching all files from Vercel Blob...')
    const { blobs } = await list()
    console.log(`   Found ${blobs.length} files\n`)

    // Step 2: Get all active users
    console.log('👥 Step 2: Fetching active users from database...')
    const activeUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    })
    console.log(`   Found ${activeUsers.length} active users\n`)

    // Step 3: Get all media URLs currently in use
    console.log('🔗 Step 3: Fetching all media URLs in use...')

    // Get all URLs from Steps (property manual content)
    const steps = await prisma.step.findMany({
      select: {
        content: true,
        zones: {
          select: {
            property: {
              select: {
                id: true,
                name: true,
                hostId: true,
                host: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    })

    // Get all URLs from MediaLibrary
    const mediaLibrary = await prisma.mediaLibrary.findMany({
      select: {
        url: true,
        userId: true,
        createdAt: true,
        usageCount: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Build a Set of all URLs in use and protected URLs
    const urlsInUse = new Set()
    const urlToOwner = new Map()
    const protectedUrls = new Set()

    // Add URLs from steps
    steps.forEach(step => {
      const content = step.content
      if (content && typeof content === 'object') {
        const mediaUrl = content.mediaUrl
        if (mediaUrl && typeof mediaUrl === 'string') {
          urlsInUse.add(mediaUrl)

          const ownerName = step.zones?.property?.host?.name || 'Unknown'
          const ownerEmail = step.zones?.property?.host?.email || 'unknown'
          urlToOwner.set(mediaUrl, { name: ownerName, email: ownerEmail })

          // Protect all files from protected users
          if (PROTECTED_USERS.includes(ownerName)) {
            protectedUrls.add(mediaUrl)
          }
        }
      }
    })

    // Add URLs from media library
    mediaLibrary.forEach(media => {
      if (media.url) {
        const ownerName = media.user?.name || 'Unknown'
        const ownerEmail = media.user?.email || 'unknown'

        // Protect ALL files from protected users (even if not in use yet)
        if (PROTECTED_USERS.includes(ownerName)) {
          urlsInUse.add(media.url)
          protectedUrls.add(media.url)
        } else {
          urlsInUse.add(media.url)
        }

        if (!urlToOwner.has(media.url)) {
          urlToOwner.set(media.url, { name: ownerName, email: ownerEmail })
        }
      }
    })

    console.log(`   Found ${urlsInUse.size} unique URLs currently in use`)
    console.log(`   Found ${protectedUrls.size} URLs from protected users\n`)

    // Step 4: Analyze files
    console.log('📊 Step 4: Analyzing files...\n')

    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

    const oldFiles = []
    const oldButInUse = []
    const oldAndUnused = []

    let totalSize = 0
    let oldUnusedSize = 0

    blobs.forEach(blob => {
      totalSize += blob.size

      const uploadDate = new Date(blob.uploadedAt)
      const isOld = uploadDate < tenDaysAgo
      const isInUse = urlsInUse.has(blob.url)
      const owner = urlToOwner.get(blob.url)

      if (isOld) {
        oldFiles.push({ ...blob, isInUse, owner })

        if (isInUse) {
          oldButInUse.push({ ...blob, owner })
        } else {
          oldAndUnused.push(blob)
          oldUnusedSize += blob.size
        }
      }
    })

    // Step 5: Generate Report
    console.log('=' .repeat(80))
    console.log('📊 ANALYSIS REPORT')
    console.log('=' .repeat(80))
    console.log()

    console.log('📈 OVERALL STATISTICS:')
    console.log(`   Total files in Vercel Blob: ${blobs.length}`)
    console.log(`   Total size: ${(totalSize / 1024 / 1024 / 1024).toFixed(2)} GB`)
    console.log(`   Files older than 10 days: ${oldFiles.length}`)
    console.log()

    console.log('✅ PROTECTED FILES (old but currently in use):')
    console.log(`   Count: ${oldButInUse.length}`)
    console.log(`   These files will NOT be deleted (they are being used)`)
    if (oldButInUse.length > 0) {
      console.log()
      oldButInUse.slice(0, 10).forEach((blob, i) => {
        const sizeInMB = (blob.size / 1024 / 1024).toFixed(2)
        const ownerName = blob.owner?.name || 'Unknown'
        const uploadDate = new Date(blob.uploadedAt).toLocaleDateString('es-ES')
        console.log(`   ${i + 1}. ${blob.pathname}`)
        console.log(`      Size: ${sizeInMB} MB | Uploaded: ${uploadDate}`)
        console.log(`      Owner: ${ownerName}`)
      })
      if (oldButInUse.length > 10) {
        console.log(`   ... and ${oldButInUse.length - 10} more protected files`)
      }
    }
    console.log()

    console.log('🗑️  UNUSED FILES (safe to delete):')
    console.log(`   Count: ${oldAndUnused.length}`)
    console.log(`   Total size: ${(oldUnusedSize / 1024 / 1024).toFixed(2)} MB`)
    console.log(`   Space that would be freed: ${((oldUnusedSize / totalSize) * 100).toFixed(1)}%`)

    if (oldAndUnused.length > 0) {
      console.log()
      console.log('   Top 20 largest unused files:')

      // Sort by size (largest first)
      oldAndUnused.sort((a, b) => b.size - a.size)

      oldAndUnused.slice(0, 20).forEach((blob, i) => {
        const sizeInMB = (blob.size / 1024 / 1024).toFixed(2)
        const uploadDate = new Date(blob.uploadedAt).toLocaleDateString('es-ES')
        console.log(`   ${i + 1}. ${blob.pathname}`)
        console.log(`      Size: ${sizeInMB} MB | Uploaded: ${uploadDate}`)
        console.log(`      URL: ${blob.url}`)
      })

      if (oldAndUnused.length > 20) {
        console.log(`   ... and ${oldAndUnused.length - 20} more unused files`)
      }
    }

    console.log()
    console.log('=' .repeat(80))
    console.log('⚠️  IMPORTANT NOTES:')
    console.log('   - This is a READ-ONLY analysis')
    console.log('   - NO files have been deleted')
    console.log('   - Files owned by active users (like Israel Bernal) are protected')
    console.log('   - Only files not referenced in any property would be deleted')
    console.log('=' .repeat(80))
    console.log()

    // Save report to file
    const reportContent = JSON.stringify({
      totalFiles: blobs.length,
      totalSizeGB: (totalSize / 1024 / 1024 / 1024).toFixed(2),
      oldFilesCount: oldFiles.length,
      protectedFilesCount: oldButInUse.length,
      unusedFilesCount: oldAndUnused.length,
      unusedSizeMB: (oldUnusedSize / 1024 / 1024).toFixed(2),
      unusedFiles: oldAndUnused.map(blob => ({
        pathname: blob.pathname,
        url: blob.url,
        size: blob.size,
        uploadedAt: blob.uploadedAt
      }))
    }, null, 2)

    const fs = require('fs')
    const path = require('path')
    const reportPath = path.join(__dirname, 'unused-files-report.json')
    fs.writeFileSync(reportPath, reportContent)

    console.log(`📄 Detailed report saved to: ${reportPath}`)
    console.log()

    if (oldAndUnused.length === 0) {
      console.log('✅ No unused files found! All files are being used.')
    } else {
      console.log('💡 NEXT STEPS:')
      console.log('   1. Review the unused files list above')
      console.log('   2. If you want to proceed with deletion, use:')
      console.log('      node scripts/delete-unused-files.js')
      console.log('   3. That script will ask for confirmation before deleting')
    }

  } catch (error) {
    console.error('❌ Error during analysis:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeUnusedFiles()
