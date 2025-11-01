'use client'

import React, { useState } from 'react'
import { Share2, Twitter, Facebook, Linkedin, Link as LinkIcon, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SocialShareProps {
  title: string
  description?: string
  url?: string
}

export function SocialShare({ title, description, url }: SocialShareProps) {
  const [showShare, setShowShare] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const shareText = description || title

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedText = encodeURIComponent(shareText)

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    }

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400')
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowShare(!showShare)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl hover:border-violet-500 hover:shadow-lg transition-all group"
      >
        <Share2 className="w-4 h-4 text-gray-600 group-hover:text-violet-600 transition-colors" />
        <span className="text-sm font-medium text-gray-700 group-hover:text-violet-600 transition-colors">
          Compartir
        </span>
      </button>

      <AnimatePresence>
        {showShare && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-4 z-50 min-w-[240px]"
          >
            <div className="flex flex-col space-y-2">
              {/* Twitter */}
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                <div className="w-8 h-8 bg-[#1DA1F2] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Twitter className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Compartir en Twitter</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                <div className="w-8 h-8 bg-[#1877F2] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Facebook className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Compartir en Facebook</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={() => handleShare('linkedin')}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                <div className="w-8 h-8 bg-[#0A66C2] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Linkedin className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Compartir en LinkedIn</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors group border-t border-gray-100 mt-2 pt-4"
              >
                <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  {copied ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <LinkIcon className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {copied ? '¡Enlace copiado!' : 'Copiar enlace'}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
