'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { BlogProductCTA } from '@/components/blog/BlogProductCTA'

// Dynamic import del quiz para evitar SSR issues
const BomberoQuiz = dynamic(
  () => import('@/components/blog/BomberoQuiz'),
  { ssr: false }
)

interface BlogContentWithQuizProps {
  content: string
  slug: string
  className?: string
}

/**
 * Splits HTML content at approximately the target percentage
 * by finding a good break point (after a paragraph or heading)
 */
function splitContentAtPercentage(html: string, targetPercent: number = 40): [string, string] {
  // Find all paragraph and heading end tags
  const breakPoints: number[] = []
  const regex = /<\/(p|h[1-6]|div|ul|ol)>/gi
  let match

  while ((match = regex.exec(html)) !== null) {
    breakPoints.push(match.index + match[0].length)
  }

  if (breakPoints.length === 0) {
    return [html, '']
  }

  // Find the break point closest to target percentage
  const targetIndex = Math.floor(html.length * (targetPercent / 100))
  let closestBreak = breakPoints[0]
  let minDistance = Math.abs(breakPoints[0] - targetIndex)

  for (const bp of breakPoints) {
    const distance = Math.abs(bp - targetIndex)
    if (distance < minDistance) {
      minDistance = distance
      closestBreak = bp
    }
  }

  // Ensure we're at least 20% into the content and not past 60%
  const minBreak = html.length * 0.2
  const maxBreak = html.length * 0.6

  if (closestBreak < minBreak) {
    // Find first break after 20%
    closestBreak = breakPoints.find(bp => bp >= minBreak) || closestBreak
  } else if (closestBreak > maxBreak) {
    // Find last break before 60%
    const validBreaks = breakPoints.filter(bp => bp <= maxBreak)
    closestBreak = validBreaks[validBreaks.length - 1] || closestBreak
  }

  return [html.slice(0, closestBreak), html.slice(closestBreak)]
}

export default function BlogContentWithQuiz({ content, slug, className }: BlogContentWithQuizProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const quizMounted = useRef(false)

  // Check if this is the bombero article
  const isBomberoArticle = slug === 'del-modo-bombero-al-modo-ceo-framework'

  // For bombero article, split content at the quiz placeholder
  if (isBomberoArticle && content.includes('id="bombero-quiz"')) {
    const parts = content.split('<div id="bombero-quiz"></div>')

    return (
      <div className={className}>
        {/* First part of content */}
        <div dangerouslySetInnerHTML={{ __html: parts[0] }} />

        {/* Quiz component */}
        <BomberoQuiz />

        {/* Rest of content */}
        {parts[1] && <div dangerouslySetInnerHTML={{ __html: parts[1] }} />}
      </div>
    )
  }

  // For long articles (>2000 chars), insert inline CTA at ~40%
  const isLongArticle = content.length > 2000

  if (isLongArticle) {
    const [firstPart, secondPart] = splitContentAtPercentage(content, 40)

    return (
      <div className={className}>
        {/* First part of content */}
        <div dangerouslySetInnerHTML={{ __html: firstPart }} />

        {/* Inline CTA */}
        <BlogProductCTA variant="inline" articleSlug={slug} />

        {/* Rest of content */}
        {secondPart && <div dangerouslySetInnerHTML={{ __html: secondPart }} />}
      </div>
    )
  }

  // Normal content without CTA insertion (short articles)
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
