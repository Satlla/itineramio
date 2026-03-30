import puppeteer from 'puppeteer'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const htmlPath = path.join(__dirname, 'mkt-novedades.html')
const outputPath = path.join(__dirname, 'mkt-novedades.png')

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 })
await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 800))
await page.screenshot({ path: outputPath, type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1080 } })
await browser.close()

console.log('✓ Imagen guardada en:', outputPath)
