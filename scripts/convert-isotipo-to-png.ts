import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

async function convertIsotipo() {
  const svgPath = join(process.cwd(), 'public', 'isotipo-itineramio.svg')
  const pngPath = join(process.cwd(), 'public', 'isotipo-itineramio.png')

  // Read SVG and add white background for dark header
  const svgContent = readFileSync(svgPath, 'utf-8')

  // Convert to PNG at 2x for retina displays
  await sharp(Buffer.from(svgContent))
    .resize(200, 110)
    .png()
    .toFile(pngPath)

  console.log('✅ Created isotipo-itineramio.png (200x110)')

  // Also create a smaller version for footer
  const pngSmallPath = join(process.cwd(), 'public', 'isotipo-itineramio-small.png')
  await sharp(Buffer.from(svgContent))
    .resize(120, 66)
    .png()
    .toFile(pngSmallPath)

  console.log('✅ Created isotipo-itineramio-small.png (120x66)')
}

convertIsotipo().catch(console.error)
