'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface LikeButtonProps {
  slug: string
  initialLikes: number
}

export function LikeButton({ slug, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [hasLiked, setHasLiked] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Check if user already liked this post (from localStorage)
  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
    setHasLiked(likedPosts.includes(slug))
  }, [slug])

  const handleLike = async () => {
    if (hasLiked) return

    setIsAnimating(true)
    setLikes(prev => prev + 1)
    setHasLiked(true)

    // Save to localStorage
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
    localStorage.setItem('likedPosts', JSON.stringify([...likedPosts, slug]))

    // Animate
    setTimeout(() => setIsAnimating(false), 600)

    // Send to API
    try {
      await fetch(`/api/blog/${slug}/like`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={hasLiked}
      className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
        hasLiked
          ? 'bg-red-50 text-red-500 cursor-default'
          : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
      }`}
    >
      <motion.div
        animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={`w-5 h-5 transition-all ${
            hasLiked ? 'fill-red-500 text-red-500' : 'group-hover:fill-red-100'
          }`}
        />
      </motion.div>
      <span className="font-medium">{likes.toLocaleString()}</span>

      {/* Heart burst animation */}
      <AnimatePresence>
        {isAnimating && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0],
                  x: Math.cos((i * 60 * Math.PI) / 180) * 30,
                  y: Math.sin((i * 60 * Math.PI) / 180) * 30
                }}
                transition={{ duration: 0.6 }}
                className="absolute"
              >
                <Heart className="w-3 h-3 fill-red-400 text-red-400" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </button>
  )
}
