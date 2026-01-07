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
    ['Ubicacion:', data.location],
    ['Temporada:', data.season],
    ['Huespedes:', `${data.guests}`],
    ['Dormitorios:', `${data.bedrooms}`],
    ['Banos:', `${data.bathrooms}`],
    ['Servicios:', data.amenities.length > 0 ? data.amenities.join(', ') : 'Basicos']
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

// ========== CLEANING CHECKLIST PDF ==========

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

export function generateCleaningChecklistPDF(data: CleaningChecklistData): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  let y = 20

  // Colors
  const primaryColor: [number, number, number] = [124, 58, 237] // Violet-600
  const darkGray: [number, number, number] = [31, 41, 55]
  const mediumGray: [number, number, number] = [107, 114, 128]
  const lightGray: [number, number, number] = [243, 244, 246]

  // Count total tasks
  const totalTasks = data.sections.reduce((acc, s) => acc + s.items.length, 0)

  // Header
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, 35, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('CHECKLIST DE LIMPIEZA', margin, y)

  y += 8
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(data.propertyName || 'Mi Propiedad', margin, y)

  // Property info box
  y = 42
  doc.setFillColor(...lightGray)
  doc.roundedRect(margin, y, contentWidth, data.propertyAddress ? 22 : 16, 2, 2, 'F')

  y += 6
  doc.setTextColor(...darkGray)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`${totalTasks} tareas`, margin + 5, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...mediumGray)
  doc.text(`Preparado para: ${data.userName}`, margin + 35, y)
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, contentWidth - 15, y)

  if (data.propertyAddress) {
    y += 6
    doc.setFontSize(9)
    doc.text(`Direccion: ${data.propertyAddress}`, margin + 5, y)
  }

  y += 12

  // Sections
  data.sections.forEach((section, sectionIndex) => {
    // Check if we need a new page
    const sectionHeight = 10 + section.items.length * 6
    if (y + sectionHeight > pageHeight - 25) {
      doc.addPage()
      y = 20
    }

    // Section header
    doc.setFillColor(...primaryColor)
    doc.roundedRect(margin, y, contentWidth, 8, 1, 1, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(section.title.toUpperCase(), margin + 3, y + 5.5)

    y += 12

    // Items
    doc.setTextColor(...darkGray)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')

    section.items.forEach((item, itemIndex) => {
      // Check for page break
      if (y > pageHeight - 20) {
        doc.addPage()
        y = 20
      }

      // Checkbox
      doc.setDrawColor(...mediumGray)
      doc.setLineWidth(0.3)
      doc.rect(margin + 2, y - 3, 4, 4)

      // Item text (truncate if too long)
      const maxTextWidth = contentWidth - 15
      let itemText = item
      while (doc.getTextWidth(itemText) > maxTextWidth && itemText.length > 10) {
        itemText = itemText.slice(0, -1)
      }
      if (itemText !== item) itemText += '...'

      doc.text(itemText, margin + 9, y)

      y += 6
    })

    y += 4
  })

  // Notes section
  if (y + 30 < pageHeight - 15) {
    y += 5
    doc.setTextColor(...darkGray)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('NOTAS:', margin, y)

    y += 3
    doc.setDrawColor(...lightGray)
    doc.setLineWidth(0.3)
    for (let i = 0; i < 3; i++) {
      y += 6
      doc.line(margin, y, margin + contentWidth, y)
    }
  }

  // Signature section
  y = pageHeight - 22
  doc.setDrawColor(...mediumGray)
  doc.setLineWidth(0.3)

  doc.setTextColor(...mediumGray)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  doc.text('Fecha:', margin, y)
  doc.line(margin + 15, y, margin + 55, y)

  doc.text('Firma:', margin + 70, y)
  doc.line(margin + 85, y, margin + contentWidth, y)

  // Footer
  y = pageHeight - 10
  doc.setTextColor(...mediumGray)
  doc.setFontSize(8)
  doc.text('Creado con Itineramio - itineramio.com', margin, y)

  // Return as Buffer
  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}
