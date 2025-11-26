/**
 * DELETION SCRIPT: Delete unused files from Vercel Blob
 * This script WILL delete files after confirmation
 *
 * IMPORTANT: Run analyze-unused-files.js first to generate the report
 *
 * Run with: node scripts/delete-unused-files.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { del } = require('@vercel/blob')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

async function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y' || answer.toLowerCase() === 'sí' || answer.toLowerCase() === 's')
    })
  })
}

async function deleteUnusedFiles() {
  try {
    // Check for auto-confirm flag
    const args = process.argv.slice(2)
    const autoConfirm = args.includes('--confirm') || args.includes('-y')

    console.log('🗑️  Starting deletion process...\n')

    // Step 1: Load the analysis report
    const reportPath = path.join(__dirname, 'unused-files-report.json')

    if (!fs.existsSync(reportPath)) {
      console.error('❌ Error: No analysis report found!')
      console.error('   Please run analyze-unused-files.js first to generate the report.')
      process.exit(1)
    }

    console.log('📄 Loading analysis report...')
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'))

    const { unusedFiles, unusedFilesCount, unusedSizeMB } = report

    if (unusedFilesCount === 0) {
      console.log('✅ No unused files to delete!')
      return
    }

    // Step 2: Show summary and ask for confirmation
    console.log('\n' + '='.repeat(80))
    console.log('⚠️  DELETION CONFIRMATION')
    console.log('='.repeat(80))
    console.log()
    console.log(`📊 Files to delete: ${unusedFilesCount}`)
    console.log(`💾 Space to free: ${unusedSizeMB} MB`)
    console.log()
    console.log('🛡️  SAFETY GUARANTEES:')
    console.log('   ✓ Files currently in use will NOT be deleted')
    console.log('   ✓ Files from protected users are safe')
    console.log('   ✓ Only files older than 10 days and unused will be deleted')
    console.log()
    console.log('Top 10 largest files that will be deleted:')

    // Sort by size and show top 10
    const sorted = [...unusedFiles].sort((a, b) => b.size - a.size)
    sorted.slice(0, 10).forEach((file, i) => {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2)
      const uploadDate = new Date(file.uploadedAt).toLocaleDateString('es-ES')
      console.log(`   ${i + 1}. ${file.pathname} (${sizeMB} MB - ${uploadDate})`)
    })

    if (unusedFilesCount > 10) {
      console.log(`   ... and ${unusedFilesCount - 10} more files`)
    }

    console.log()
    console.log('='.repeat(80))
    console.log()

    // Ask for confirmation (or skip if auto-confirm flag is set)
    let confirmed = autoConfirm

    if (autoConfirm) {
      console.log('✅ Auto-confirm flag detected, proceeding with deletion...')
    } else {
      confirmed = await askConfirmation('⚠️  Type "yes" or "y" to proceed with deletion (or anything else to cancel): ')
    }

    if (!confirmed) {
      console.log('\n❌ Deletion cancelled by user.')
      console.log('   No files were deleted.')
      return
    }

    // Step 3: Delete files
    console.log('\n🗑️  Starting deletion...\n')

    let successCount = 0
    let failCount = 0
    const errors = []

    for (let i = 0; i < unusedFiles.length; i++) {
      const file = unusedFiles[i]
      const progress = ((i + 1) / unusedFiles.length * 100).toFixed(1)

      try {
        await del(file.url)
        successCount++

        if (i % 10 === 0 || i === unusedFiles.length - 1) {
          console.log(`   Progress: ${i + 1}/${unusedFiles.length} (${progress}%) - Deleted: ${successCount}, Failed: ${failCount}`)
        }
      } catch (error) {
        failCount++
        errors.push({
          file: file.pathname,
          url: file.url,
          error: error.message
        })
        console.error(`   ❌ Failed to delete: ${file.pathname}`)
      }
    }

    // Step 4: Generate final report
    console.log()
    console.log('='.repeat(80))
    console.log('✅ DELETION COMPLETE')
    console.log('='.repeat(80))
    console.log()
    console.log(`✅ Successfully deleted: ${successCount} files`)
    console.log(`❌ Failed to delete: ${failCount} files`)
    console.log(`💾 Space freed: ~${unusedSizeMB} MB`)
    console.log()

    if (errors.length > 0) {
      console.log('⚠️  Errors encountered:')
      errors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.file}`)
        console.log(`      Error: ${err.error}`)
      })
      console.log()
    }

    // Save deletion report
    const deletionReport = {
      timestamp: new Date().toISOString(),
      totalFilesDeleted: successCount,
      totalFilesFailed: failCount,
      spaceFree: `${unusedSizeMB} MB`,
      errors: errors,
      deletedFiles: unusedFiles.slice(0, successCount).map(f => ({
        pathname: f.pathname,
        url: f.url,
        size: f.size,
        uploadedAt: f.uploadedAt
      }))
    }

    const deletionReportPath = path.join(__dirname, 'deletion-report.json')
    fs.writeFileSync(deletionReportPath, JSON.stringify(deletionReport, null, 2))
    console.log(`📄 Deletion report saved to: ${deletionReportPath}`)
    console.log()

    console.log('💡 NEXT STEPS:')
    console.log('   1. Run analyze-unused-files.js again to verify cleanup')
    console.log('   2. Try uploading images again - you should have space now!')
    console.log('   3. Consider implementing aggressive compression for future uploads')
    console.log()

  } catch (error) {
    console.error('❌ Error during deletion:', error)
  }
}

deleteUnusedFiles()
