/**
 * Generate PWA icons from SVG
 * Creates PNG icons in multiple sizes for optimal PWA support
 *
 * Run with: node scripts/generate-pwa-icons.js
 */

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const publicDir = path.join(__dirname, '..', 'public')
const sourceSVG = path.join(publicDir, 'icon-512x512.svg')

// Icon sizes needed for PWA
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 180, name: 'apple-touch-icon.png' }, // iOS specific
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
]

async function generateIcons() {
  console.log('🎨 Generating PWA icons from SVG...\n')

  if (!fs.existsSync(sourceSVG)) {
    console.error(`❌ Source SVG not found: ${sourceSVG}`)
    console.error('   Please ensure icon-512x512.svg exists in the public folder')
    process.exit(1)
  }

  // Read SVG buffer
  const svgBuffer = fs.readFileSync(sourceSVG)

  let successCount = 0
  let failCount = 0

  for (const { size, name } of iconSizes) {
    try {
      const outputPath = path.join(publicDir, name)

      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 139, g: 92, b: 246, alpha: 1 } // Violet background (#8B5CF6)
        })
        .png()
        .toFile(outputPath)

      const stats = fs.statSync(outputPath)
      const sizeInKB = (stats.size / 1024).toFixed(2)

      console.log(`✅ Generated: ${name} (${size}x${size}) - ${sizeInKB} KB`)
      successCount++
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error.message)
      failCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`✅ Successfully generated: ${successCount} icons`)
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount} icons`)
  }
  console.log('='.repeat(60))
  console.log('\n💡 Next steps:')
  console.log('   1. Verify icons in public/ folder')
  console.log('   2. Update manifest.json to use PNG icons')
  console.log('   3. Test PWA installation on mobile device')
  console.log()
}

generateIcons().catch(error => {
  console.error('❌ Error generating icons:', error)
  process.exit(1)
})
