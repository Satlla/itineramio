const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

/**
 * Script para generar posters de videos usando ffmpeg + sharp
 *
 * PERF-N1: Genera imágenes WebP optimizadas (~20KB cada una)
 * para usar como posters en VideoLazy component
 *
 * Requiere:
 * - ffmpeg instalado: brew install ffmpeg
 * - sharp instalado: npm install sharp
 */

const videosDir = './public/videos'
const videos = [
  'no-calls.mp4',
  'host-preocupado.mp4',
  'famili-check-in.mp4',
  'wifi.mp4',
  'washing-machine.mp4',
  'vitro.mp4'
]

console.log('🎬 Generating video posters...\n')

videos.forEach(video => {
  const videoPath = path.join(videosDir, video)
  const jpgPath = videoPath.replace('.mp4', '-poster.jpg')
  const webpPath = videoPath.replace('.mp4', '-poster.webp')

  // Step 1: Extract frame at 1s using ffmpeg
  const cmd = `ffmpeg -i "${videoPath}" -ss 00:00:01.000 -vframes 1 -vf scale=1920:1080 "${jpgPath}"`

  console.log(`📹 Processing: ${video}`)

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error generating poster for ${video}:`, error.message)
      return
    }

    // Step 2: Convert JPG to WebP with sharp
    sharp(jpgPath)
      .webp({ quality: 75 })
      .toFile(webpPath)
      .then(() => {
        const stats = fs.statSync(webpPath)
        const sizeKB = (stats.size / 1024).toFixed(1)
        console.log(`✅ Generated poster: ${path.basename(webpPath)} (${sizeKB}KB)`)

        // Cleanup JPG intermediate file
        fs.unlinkSync(jpgPath)
      })
      .catch(err => console.error(`❌ Sharp error for ${video}:`, err))
  })
})

console.log('\n⏳ Generating posters... This may take 10-15 seconds\n')
