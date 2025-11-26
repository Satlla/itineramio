/**
 * Script to list all files in Vercel Blob storage
 * Run with: node scripts/list-vercel-blob-files.js
 */

const { list } = require('@vercel/blob')

async function listAllFiles() {
  try {
    console.log('📋 Listing all files in Vercel Blob...\n')

    const { blobs } = await list()

    if (blobs.length === 0) {
      console.log('No files found in Vercel Blob')
      return
    }

    // Calculate total size
    let totalSize = 0
    blobs.forEach(blob => {
      totalSize += blob.size
    })

    console.log(`Found ${blobs.length} files`)
    console.log(`Total size: ${(totalSize / 1024 / 1024 / 1024).toFixed(2)} GB / 1.00 GB\n`)
    console.log('---'.repeat(30))

    // Sort by size (largest first)
    blobs.sort((a, b) => b.size - a.size)

    blobs.forEach((blob, index) => {
      const sizeInMB = (blob.size / 1024 / 1024).toFixed(2)
      const uploadDate = new Date(blob.uploadedAt).toLocaleDateString('es-ES')

      console.log(`\n${index + 1}. ${blob.pathname}`)
      console.log(`   Size: ${sizeInMB} MB`)
      console.log(`   Uploaded: ${uploadDate}`)
      console.log(`   URL: ${blob.url}`)
    })

    console.log('\n---'.repeat(30))
    console.log('\n💡 To delete files, go to:')
    console.log('   https://vercel.com/dashboard → Your Project → Storage → Blob')
    console.log('\n💡 Or upgrade to Pro plan for 100GB:')
    console.log('   https://vercel.com/pricing')

  } catch (error) {
    console.error('Error listing files:', error.message)
    console.log('\n⚠️  Make sure BLOB_READ_WRITE_TOKEN is set in your environment')
  }
}

listAllFiles()
