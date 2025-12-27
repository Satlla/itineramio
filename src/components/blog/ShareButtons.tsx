'use client'

import { useState } from 'react'
import { Twitter, Facebook, Linkedin, Link2, Check } from 'lucide-react'

interface ShareButtonsProps {
  url: string
  title: string
  description?: string
  className?: string
}

export function ShareButtons({ url, title, description, className = '' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description || '')

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  }

  const handleShare = (platform: keyof typeof shareLinks) => {
    const shareUrl = shareLinks[platform]
    window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes')

    // Track share event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share', {
        method: platform,
        content_type: 'article',
        item_id: url,
      })
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      // Track copy event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'share', {
          method: 'copy_link',
          content_type: 'article',
          item_id: url,
        })
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <button
        onClick={() => handleShare('twitter')}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
        title="Compartir en Twitter"
        aria-label="Compartir en Twitter"
      >
        <Twitter className="w-5 h-5 text-gray-600 group-hover:text-[#1DA1F2]" />
      </button>
      <button
        onClick={() => handleShare('facebook')}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
        title="Compartir en Facebook"
        aria-label="Compartir en Facebook"
      >
        <Facebook className="w-5 h-5 text-gray-600 group-hover:text-[#1877F2]" />
      </button>
      <button
        onClick={() => handleShare('linkedin')}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
        title="Compartir en LinkedIn"
        aria-label="Compartir en LinkedIn"
      >
        <Linkedin className="w-5 h-5 text-gray-600 group-hover:text-[#0A66C2]" />
      </button>
      <button
        onClick={handleCopyLink}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
        title={copied ? '¡Enlace copiado!' : 'Copiar enlace'}
        aria-label="Copiar enlace"
      >
        {copied ? (
          <Check className="w-5 h-5 text-green-600" />
        ) : (
          <Link2 className="w-5 h-5 text-gray-600 group-hover:text-violet-600" />
        )}
      </button>
    </div>
  )
}
