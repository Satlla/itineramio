'use client'

import { useEffect, useRef } from 'react'
import { trackBlogArticleRead } from '@/lib/analytics'
import { fbEvents } from '@/components/analytics/FacebookPixel'

interface BlogArticleTrackerProps {
  slug: string
  title: string
  category: string
}

export default function BlogArticleTracker({ slug, title, category }: BlogArticleTrackerProps) {
  const hasTrackedRef = useRef(false)
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    // Track view content on Facebook Pixel
    fbEvents.viewContent({
      content_name: title,
      content_category: category,
      content_type: 'blog_article',
      content_ids: [slug]
    })

    let maxScrollDepth = 0

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = Math.round((scrollTop / docHeight) * 100)
      maxScrollDepth = Math.max(maxScrollDepth, scrollPercent)

      // Track when user has read 75% of the article
      if (maxScrollDepth >= 75 && !hasTrackedRef.current) {
        hasTrackedRef.current = true
        const readTime = Math.round((Date.now() - startTimeRef.current) / 1000)

        trackBlogArticleRead({
          articleSlug: slug,
          articleTitle: title,
          category: category,
          readTime: readTime,
          scrollDepth: maxScrollDepth
        })
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [slug, title, category])

  return null
}
