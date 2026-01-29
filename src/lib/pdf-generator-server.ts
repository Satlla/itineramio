// Server-side PDF Generator for email attachments
// Uses jsPDF which works in Node.js environment

import { jsPDF } from 'jspdf'

export interface PricingAnalysisData {
  propertyType: string
  location: string
  season: string
  bedrooms: number
  bathrooms: number
  guests: number
  amenities: string[]
  recommendedPrice: number
  minPrice: number
  maxPrice: number
  weekendPrice: number
  weeklyDiscount: number
  monthlyDiscount: number
  userName: string
}

export function generatePricingAnalysisPDF(data: PricingAnalysisData): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = 25

  // Colors
  const primaryColor: [number, number, number] = [124, 58, 237] // Violet-600
  const darkGray: [number, number, number] = [31, 41, 55]
  const mediumGray: [number, number, number] = [107, 114, 128]
  const lightGray: [number, number, number] = [243, 244, 246]
  const greenColor: [number, number, number] = [22, 163, 74]

  // Header background
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, 50, 'F')

  // Logo/Brand
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('ITINERAMIO', margin, y)

  y += 10
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('Analisis de Precios Personalizado', margin, y)

  y += 25

  // User greeting
  doc.setTextColor(...darkGray)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Preparado para: ${data.userName}`, margin, y)
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth - margin - 60, y)

  y += 15

  // Main price card
  doc.setFillColor(...primaryColor)
  doc.roundedRect(margin, y, contentWidth, 45, 3, 3, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.text('Precio Recomendado', margin + 10, y + 12)

  doc.setFontSize(36)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.recommendedPrice} EUR/noche`, margin + 10, y + 32)

  y += 55

  // Price range
  doc.setFillColor(...lightGray)
  doc.roundedRect(margin, y, contentWidth / 2 - 5, 25, 2, 2, 'F')
  doc.roundedRect(margin + contentWidth / 2 + 5, y, contentWidth / 2 - 5, 25, 2, 2, 'F')

  doc.setTextColor(...mediumGray)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Precio Minimo', margin + 5, y + 8)
  doc.text('Precio Maximo', margin + contentWidth / 2 + 10, y + 8)

  doc.setTextColor(...darkGray)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.minPrice} EUR`, margin + 5, y + 20)
  doc.text(`${data.maxPrice} EUR`, margin + contentWidth / 2 + 10, y + 20)

  y += 35

  // Property details section
  doc.setTextColor(...darkGray)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Tu Propiedad', margin, y)

  y += 8
  doc.setDrawColor(...lightGray)
  doc.setLineWidth(0.5)
  doc.line(margin, y, margin + contentWidth, y)

  y += 10
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')

  const propertyDetails = [
    ['Tipo de propiedad:', data.propertyType],
    ['Ubicación:', data.location],
    ['Temporada:', data.season],
    ['Huéspedes:', `${data.guests}`],
    ['Dormitorios:', `${data.bedrooms}`],
    ['Banos:', `${data.bathrooms}`],
    ['Servicios:', data.amenities.length > 0 ? data.amenities.join(', ') : 'Básicos']
  ]

  propertyDetails.forEach(([label, value]) => {
    doc.setTextColor(...mediumGray)
    doc.text(label, margin, y)
    doc.setTextColor(...darkGray)
    doc.text(value, margin + 45, y)
    y += 7
  })

  y += 10

  // Pricing strategy section
  doc.setTextColor(...darkGray)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Estrategia de Precios', margin, y)

  y += 8
  doc.line(margin, y, margin + contentWidth, y)

  y += 10
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')

  const pricingStrategy = [
    ['Fin de semana (+20%):', `${data.weekendPrice} EUR/noche`],
    ['Descuento semanal:', `${data.weeklyDiscount}%`],
    ['Descuento mensual:', `${data.monthlyDiscount}%`]
  ]

  pricingStrategy.forEach(([label, value]) => {
    doc.setTextColor(...mediumGray)
    doc.text(label, margin, y)
    doc.setTextColor(...darkGray)
    doc.text(value, margin + 55, y)
    y += 7
  })

  y += 15

  // Income projection section
  doc.setTextColor(...darkGray)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Proyeccion de Ingresos Mensuales', margin, y)

  y += 8
  doc.line(margin, y, margin + contentWidth, y)

  y += 10

  const occupancyLevels = [
    { label: 'Ocupacion 50% (15 noches)', amount: data.recommendedPrice * 15 },
    { label: 'Ocupacion 70% (21 noches)', amount: data.recommendedPrice * 21 },
    { label: 'Ocupacion 90% (27 noches)', amount: data.recommendedPrice * 27 }
  ]

  doc.setFontSize(11)
  occupancyLevels.forEach((level, index) => {
    doc.setTextColor(...mediumGray)
    doc.text(level.label + ':', margin, y)

    if (index === occupancyLevels.length - 1) {
      doc.setTextColor(...greenColor)
      doc.setFont('helvetica', 'bold')
    } else {
      doc.setTextColor(...darkGray)
    }
    doc.text(`${level.amount} EUR`, margin + 70, y)
    doc.setFont('helvetica', 'normal')
    y += 7
  })

  y += 15

  // Tips section
  doc.setFillColor(255, 251, 235) // Amber-50
  doc.roundedRect(margin, y, contentWidth, 45, 2, 2, 'F')

  y += 8
  doc.setTextColor(146, 64, 14) // Amber-800
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Consejos de Pricing', margin + 5, y)

  y += 8
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const tips = [
    '- Ajusta precios segun eventos locales y festividades',
    '- Monitorea competencia directa en tu zona',
    '- Ofrece descuentos para reservas anticipadas',
    '- Usa precios dinamicos para maximizar ocupacion'
  ]
  tips.forEach(tip => {
    doc.text(tip, margin + 5, y)
    y += 5
  })

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15
  doc.setTextColor(...mediumGray)
  doc.setFontSize(9)
  doc.text('Generado por Itineramio - itineramio.com', margin, footerY)
  doc.text('Este analisis es orientativo y basado en datos de mercado.', pageWidth - margin - 80, footerY)

  // Return as Buffer for email attachment
  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}

// ========== CLEANING CHECKLIST PDF (Airbnb Professional Style) ==========

export interface ChecklistSection {
  title: string
  items: string[]
}

export interface CleaningChecklistData {
  propertyName: string
  propertyAddress?: string
  sections: ChecklistSection[]
  userName: string
}

// Helper function to remove emojis and special unicode from text (jsPDF doesn't support them)
function removeEmojis(text: string): string {
  return text
    // Remove all emoji ranges
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')
    .replace(/[\u{231A}-\u{231B}]/gu, '')
    .replace(/[\u{23E9}-\u{23F3}]/gu, '')
    .replace(/[\u{23F8}-\u{23FA}]/gu, '')
    .replace(/[\u{25AA}-\u{25AB}]/gu, '')
    .replace(/[\u{25B6}]/gu, '')
    .replace(/[\u{25C0}]/gu, '')
    .replace(/[\u{25FB}-\u{25FE}]/gu, '')
    .replace(/[\u{2614}-\u{2615}]/gu, '')
    .replace(/[\u{2648}-\u{2653}]/gu, '')
    .replace(/[\u{267F}]/gu, '')
    .replace(/[\u{2693}]/gu, '')
    .replace(/[\u{26A1}]/gu, '')
    .replace(/[\u{26AA}-\u{26AB}]/gu, '')
    .replace(/[\u{26BD}-\u{26BE}]/gu, '')
    .replace(/[\u{26C4}-\u{26C5}]/gu, '')
    .replace(/[\u{26CE}]/gu, '')
    .replace(/[\u{26D4}]/gu, '')
    .replace(/[\u{26EA}]/gu, '')
    .replace(/[\u{26F2}-\u{26F3}]/gu, '')
    .replace(/[\u{26F5}]/gu, '')
    .replace(/[\u{26FA}]/gu, '')
    .replace(/[\u{26FD}]/gu, '')
    // Remove variation selectors
    .replace(/[\uFE00-\uFE0F]/gu, '')
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/gu, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim()
}

// Section icons/numbers mapping
const sectionIcons: Record<string, string> = {
  'cocina': '1',
  'kitchen': '1',
  'bano': '2',
  'bathroom': '2',
  'dormitorio': '3',
  'bedroom': '3',
  'salon': '4',
  'living': '4',
  'livingroom': '4',
  'general': '5'
}

function getSectionNumber(title: string, index: number): string {
  const normalized = removeEmojis(title).toLowerCase().replace(/\s+/g, '')
  for (const [key, num] of Object.entries(sectionIcons)) {
    if (normalized.includes(key)) return num
  }
  return String(index + 1)
}

export function generateCleaningChecklistPDF(data: CleaningChecklistData): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = 0

  // Airbnb Color Palette
  const rausch: [number, number, number] = [255, 56, 92]      // Coral primary
  const hof: [number, number, number] = [34, 34, 34]          // Dark text #222
  const foggy: [number, number, number] = [113, 113, 113]     // Secondary #717171
  const hackberry: [number, number, number] = [235, 235, 235] // Border #EBEBEB
  const white: [number, number, number] = [255, 255, 255]
  const kazan: [number, number, number] = [247, 247, 247]     // Light bg #F7F7F7

  // Spacing
  const LINE_HEIGHT = 6
  const SECTION_GAP = 6
  const ITEM_GAP = 5.5

  // Count total tasks
  const totalTasks = data.sections.reduce((acc, s) => acc + s.items.length, 0)

  // ========== CORAL HEADER BANNER ==========
  doc.setFillColor(...rausch)
  doc.rect(0, 0, pageWidth, 38, 'F')

  // Brand name
  y = 14
  doc.setTextColor(...white)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('ITINERAMIO', margin, y)

  // Main title
  y = 28
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Checklist de Limpieza', margin, y)

  // Subtitle with task count
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const subtitleText = `${totalTasks} tareas`
  const subtitleWidth = doc.getTextWidth(subtitleText)
  doc.text(subtitleText, pageWidth - margin - subtitleWidth, y)

  // ========== PROPERTY INFO BAR ==========
  y = 48
  doc.setFillColor(...kazan)
  doc.roundedRect(margin, y, contentWidth, 18, 3, 3, 'F')

  y += 7
  doc.setTextColor(...hof)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Propiedad', margin + 6, y)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...foggy)
  const propertyText = data.propertyName || '________________________'
  doc.text(propertyText, margin + 28, y)

  // Date field on right
  doc.setTextColor(...hof)
  doc.setFont('helvetica', 'bold')
  doc.text('Fecha', pageWidth - margin - 45, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...foggy)
  doc.text('___/___/___', pageWidth - margin - 30, y)

  if (data.propertyAddress) {
    y += 5
    doc.setTextColor(...foggy)
    doc.setFontSize(8)
    doc.text(data.propertyAddress, margin + 28, y)
  }

  y = 75

  // ========== SECTIONS ==========
  const checkboxSize = 4

  data.sections.forEach((section, sectionIndex) => {
    const cleanTitle = removeEmojis(section.title)
    const sectionNum = getSectionNumber(section.title, sectionIndex)

    // Check for page break
    const sectionHeight = 12 + (section.items.length * ITEM_GAP) + SECTION_GAP
    if (y + sectionHeight > pageHeight - 35) {
      doc.addPage()
      y = 20
    }

    // Section header with coral accent
    doc.setFillColor(...rausch)
    doc.roundedRect(margin, y, 6, 6, 1.5, 1.5, 'F')

    // Number in circle
    doc.setTextColor(...white)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    const numWidth = doc.getTextWidth(sectionNum)
    doc.text(sectionNum, margin + 3 - (numWidth / 2), y + 4.2)

    // Section title
    doc.setTextColor(...hof)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(cleanTitle, margin + 10, y + 4.5)

    // Item count badge
    doc.setFillColor(...kazan)
    const countText = `${section.items.length}`
    const countBadgeWidth = 8
    doc.roundedRect(pageWidth - margin - countBadgeWidth, y, countBadgeWidth, 6, 1.5, 1.5, 'F')
    doc.setTextColor(...foggy)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const countW = doc.getTextWidth(countText)
    doc.text(countText, pageWidth - margin - countBadgeWidth / 2 - countW / 2, y + 4)

    y += 14

    // Items
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')

    section.items.forEach((item) => {
      // Page break check
      if (y + ITEM_GAP > pageHeight - 30) {
        doc.addPage()
        y = 20
      }

      // Rounded checkbox
      doc.setDrawColor(...hackberry)
      doc.setLineWidth(0.4)
      doc.roundedRect(margin + 2, y - 2.8, checkboxSize, checkboxSize, 1, 1)

      // Item text
      const cleanItem = removeEmojis(item)
      doc.setTextColor(...hof)
      const maxWidth = contentWidth - 15
      const lines = doc.splitTextToSize(cleanItem, maxWidth)
      doc.text(lines[0], margin + 9, y)

      y += ITEM_GAP
    })

    // Subtle divider after section
    y += 2
    doc.setDrawColor(...hackberry)
    doc.setLineWidth(0.2)
    doc.line(margin, y, pageWidth - margin, y)

    y += SECTION_GAP
  })

  // ========== NOTES SECTION ==========
  if (y + 30 < pageHeight - 35) {
    y += 2

    // Notes header
    doc.setFillColor(...rausch)
    doc.roundedRect(margin, y, 6, 6, 1.5, 1.5, 'F')
    doc.setTextColor(...white)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('+', margin + 2, y + 4.2)

    doc.setTextColor(...hof)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Notas', margin + 10, y + 4.5)

    y += 12

    // Notes box
    doc.setDrawColor(...hackberry)
    doc.setLineWidth(0.3)
    doc.roundedRect(margin, y, contentWidth, 20, 2, 2)

    // Lines inside
    doc.setDrawColor(...kazan)
    doc.setLineWidth(0.2)
    for (let i = 1; i <= 3; i++) {
      doc.line(margin + 4, y + (i * 5), pageWidth - margin - 4, y + (i * 5))
    }
  }

  // ========== FOOTER ==========
  const footerY = pageHeight - 15

  doc.setDrawColor(...hackberry)
  doc.setLineWidth(0.3)
  doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6)

  // Signature section
  doc.setTextColor(...foggy)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Firma', margin, footerY)
  doc.setDrawColor(...hackberry)
  doc.line(margin + 10, footerY, margin + 55, footerY)

  doc.text('Hora', margin + 65, footerY)
  doc.line(margin + 77, footerY, margin + 100, footerY)

  // Brand
  doc.setTextColor(...rausch)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  const brand = 'itineramio.com'
  const brandW = doc.getTextWidth(brand)
  doc.text(brand, pageWidth - margin - brandW, footerY)

  // Return as Buffer
  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}

// ========== INSPECTION PROTOCOL PDF (Airbnb-style) ==========

export interface InspectionProtocolData {
  propertyName?: string
  userName?: string
}

export function generateInspectionProtocolPDF(data?: InspectionProtocolData): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 16
  const contentWidth = pageWidth - margin * 2
  let y = 0

  // Airbnb-style colors
  const rausch: [number, number, number] = [255, 56, 92] // Airbnb coral/red
  const hof: [number, number, number] = [72, 72, 72] // Dark gray
  const foggy: [number, number, number] = [118, 118, 118] // Medium gray
  const hackberry: [number, number, number] = [176, 176, 176] // Light gray
  const white: [number, number, number] = [255, 255, 255]
  const babu: [number, number, number] = [0, 166, 153] // Teal for success

  // ========== HEADER BANNER ==========
  doc.setFillColor(...rausch)
  doc.rect(0, 0, pageWidth, 42, 'F')

  // Header content
  y = 16
  doc.setTextColor(...white)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('ITINERAMIO', margin, y)

  y = 28
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('Protocolo de Inspeccion Pre-huésped', margin, y)

  y = 36
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Verificacion en 5 minutos antes de cada check-in', margin, y)

  // ========== PROPERTY INFO BAR ==========
  y = 52
  doc.setFillColor(247, 247, 247)
  doc.rect(0, y - 6, pageWidth, 18, 'F')

  doc.setTextColor(...hof)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Propiedad:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(data?.propertyName || '________________________________', margin + 22, y)

  doc.setFont('helvetica', 'bold')
  doc.text('Fecha:', margin + 100, y)
  doc.setFont('helvetica', 'normal')
  doc.text('____/____/________', margin + 113, y)

  y = 72

  // ========== SECTIONS DATA ==========
  const sections = [
    {
      icon: '1',
      title: 'ENTRADA Y PRIMERA IMPRESION',
      time: '1 min',
      items: [
        'Puerta y cerradura funcionan correctamente',
        'Entrada limpia (sin suciedad, hojas o colillas)',
        'Olor neutro al entrar (sin humedad ni exceso de ambientador)',
        'Luces de entrada funcionan'
      ]
    },
    {
      icon: '2',
      title: 'SALON / ZONA COMUN',
      time: '1 min',
      items: [
        'Sofa sin manchas, cojines colocados',
        'Mesa limpia, sin marcas de vasos',
        'TV funciona + mando con pilas',
        'WiFi funcionando (conectar y probar)',
        'Aire acondicionado / calefaccion operativo',
        'Persianas y cortinas funcionan'
      ]
    },
    {
      icon: '3',
      title: 'COCINA',
      time: '1 min',
      items: [
        'Encimera y vitro sin manchas de grasa',
        'Fregadero limpio, sin restos en desague',
        'Nevera vacia, limpia y sin olores',
        'Microondas limpio por dentro',
        'Cafetera limpia y lista para usar',
        'Cuberteria y vajilla completa',
        'Cubo de basura vacio con bolsa nueva'
      ]
    },
    {
      icon: '4',
      title: 'DORMITORIO(S)',
      time: '1 min',
      items: [
        'Sabanas tensas, sin arrugas',
        'Almohadas mullidas y bien colocadas',
        'Sin pelos en sabanas ni almohadas',
        'Mesitas de noche limpias y vacias',
        'Armario vacio, perchas disponibles',
        'Enchufes junto a cama funcionan'
      ]
    },
    {
      icon: '5',
      title: 'BANO(S)',
      time: '1 min',
      items: [
        'Inodoro impecable (incluido debajo de la tapa)',
        'Ducha/banera sin restos de jabon ni pelos',
        'Juntas de azulejos sin moho',
        'Espejo sin manchas',
        'Toallas dobladas correctamente',
        'Amenities completos (jabon, champu, papel)',
        'Desagues sin olores'
      ]
    }
  ]

  const checkboxSize = 4.5
  const itemStartX = margin + 8

  // ========== RENDER SECTIONS ==========
  sections.forEach((section, sectionIndex) => {
    // Check for page break
    const estimatedHeight = 12 + section.items.length * 7
    if (y + estimatedHeight > pageHeight - 45) {
      doc.addPage()
      y = 20
    }

    // Section header with number badge
    doc.setFillColor(...rausch)
    doc.circle(margin + 4, y, 4, 'F')
    doc.setTextColor(...white)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(section.icon, margin + 2.5, y + 1.5)

    // Section title
    doc.setTextColor(...hof)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(section.title, margin + 12, y + 1)

    // Time badge
    doc.setFillColor(247, 247, 247)
    const timeWidth = doc.getTextWidth(section.time) + 6
    doc.roundedRect(pageWidth - margin - timeWidth, y - 3, timeWidth, 7, 1, 1, 'F')
    doc.setTextColor(...foggy)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(section.time, pageWidth - margin - timeWidth + 3, y + 1)

    y += 10

    // Items
    doc.setFontSize(10)
    section.items.forEach((item, itemIndex) => {
      // Checkbox
      doc.setDrawColor(...hackberry)
      doc.setLineWidth(0.4)
      doc.roundedRect(itemStartX, y - 3.2, checkboxSize, checkboxSize, 0.8, 0.8)

      // Item text
      doc.setTextColor(...hof)
      doc.setFont('helvetica', 'normal')
      doc.text(item, itemStartX + checkboxSize + 4, y)

      y += 7
    })

    y += 6
  })

  // ========== EXTRAS & SECURITY SECTION ==========
  if (y + 50 > pageHeight - 45) {
    doc.addPage()
    y = 20
  }

  doc.setFillColor(...rausch)
  doc.circle(margin + 4, y, 4, 'F')
  doc.setTextColor(...white)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('+', margin + 2.3, y + 1.5)

  doc.setTextColor(...hof)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('EXTRAS Y SEGURIDAD', margin + 12, y + 1)

  y += 10

  const extraItems = [
    'Manual del huésped visible y accesible',
    'Llaves / códigos preparados',
    'Sin objetos olvidados del huésped anterior',
    'Detector de humo con bateria',
    'Extintor accesible (si aplica)'
  ]

  doc.setFontSize(10)
  extraItems.forEach(item => {
    doc.setDrawColor(...hackberry)
    doc.roundedRect(itemStartX, y - 3.2, checkboxSize, checkboxSize, 0.8, 0.8)
    doc.setTextColor(...hof)
    doc.setFont('helvetica', 'normal')
    doc.text(item, itemStartX + checkboxSize + 4, y)
    y += 7
  })

  // ========== RESULT BOX ==========
  y += 8
  doc.setFillColor(240, 253, 244) // Green-50
  doc.setDrawColor(...babu)
  doc.setLineWidth(0.5)
  doc.roundedRect(margin, y, contentWidth, 28, 2, 2, 'FD')

  y += 8
  doc.setTextColor(...babu)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('RESULTADO', margin + 6, y)

  y += 7
  doc.setTextColor(...hof)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Total puntos: 35     Puntos OK: _____     Incidencias: _____', margin + 6, y)

  y += 7
  doc.setFontSize(9)
  doc.setTextColor(...foggy)
  doc.text('Si detectas mas de 3 incidencias, NO confirmes la llegada hasta resolver.', margin + 6, y)

  // ========== SIGNATURE SECTION ==========
  y += 18

  doc.setTextColor(...foggy)
  doc.setFontSize(9)
  doc.text('Inspector:', margin, y)
  doc.setDrawColor(...hackberry)
  doc.line(margin + 18, y, margin + 70, y)

  doc.text('Firma:', margin + 80, y)
  doc.line(margin + 93, y, margin + 145, y)

  // ========== FOOTER ==========
  const footerY = pageHeight - 12
  doc.setDrawColor(230, 230, 230)
  doc.setLineWidth(0.3)
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5)

  doc.setTextColor(...foggy)
  doc.setFontSize(8)
  doc.text('Protocolo de Inspeccion Pre-huésped', margin, footerY)

  const brandText = 'itineramio.com'
  const brandWidth = doc.getTextWidth(brandText)
  doc.text(brandText, pageWidth - margin - brandWidth, footerY)

  // Return as Buffer
  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}
