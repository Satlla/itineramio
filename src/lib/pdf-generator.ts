'use client'

// PDF Generator utility using html2pdf.js
// This provides better PDF generation than html2canvas alone

export interface PDFOptions {
  filename?: string
  margin?: number | [number, number, number, number]
  image?: { type: string; quality: number }
  html2canvas?: { scale: number; useCORS: boolean; logging: boolean }
  jsPDF?: { unit: string; format: string; orientation: string }
  pagebreak?: { mode: string[] }
}

const defaultOptions = {
  margin: 10,
  image: { type: 'jpeg' as const, quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true, logging: false },
  jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
  pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
}

export async function generatePDF(
  element: HTMLElement,
  filename: string = 'document.pdf',
  options: Partial<PDFOptions> = {}
): Promise<void> {
  // Dynamically import html2pdf.js (client-side only)
  const html2pdf = (await import('html2pdf.js')).default

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    filename
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await html2pdf()
    .set(mergedOptions as any)
    .from(element)
    .save()
}

export async function generatePDFBlob(
  element: HTMLElement,
  options: Partial<PDFOptions> = {}
): Promise<Blob> {
  const html2pdf = (await import('html2pdf.js')).default

  const mergedOptions = {
    ...defaultOptions,
    ...options
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await html2pdf()
    .set(mergedOptions as any)
    .from(element)
    .outputPdf('blob')
}

// Alternative: Open print dialog for native PDF generation
// This produces the highest quality PDFs
export function openPrintDialog(): void {
  window.print()
}
