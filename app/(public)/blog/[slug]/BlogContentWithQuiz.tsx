'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

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

  // Normal content without quiz
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
