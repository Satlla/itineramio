'use client'

import { Download } from 'lucide-react'
import { trackLeadMagnetDownloaded, trackGenerateLead } from '@/lib/analytics'

interface TrackDownloadButtonProps {
  href: string
  slug: string
  archetype: string
  title: string
  pages: number
}

export function TrackDownloadButton({
  href,
  slug,
  archetype,
  title,
  pages,
}: TrackDownloadButtonProps) {
  const handleClick = () => {
    // Track PDF download
    trackLeadMagnetDownloaded({
      resourceName: title,
      resourceType: 'pdf',
      articleSlug: slug,
    })

    // Also track as lead generation
    trackGenerateLead({
      source: 'recursos',
      leadMagnet: slug,
      value: 10,
    })
  }

  return (
    <a
      href={href}
      download
      onClick={handleClick}
      className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg px-8 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
    >
      <Download className="w-6 h-6" />
      Descargar PDF ahora ({pages} páginas)
    </a>
  )
}
