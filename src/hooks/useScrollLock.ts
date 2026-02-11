import { useEffect, useRef } from 'react'

// Global counter to handle nested modals
let scrollLockCount = 0

export function useScrollLock(isLocked: boolean) {
  const originalOverflow = useRef<string>('')
  const originalPaddingRight = useRef<string>('')

  useEffect(() => {
    if (!isLocked) return

    // Store original values on first lock
    if (scrollLockCount === 0) {
      originalOverflow.current = document.body.style.overflow
      originalPaddingRight.current = document.body.style.paddingRight

      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

      // Apply scroll lock
      document.body.style.overflow = 'hidden'
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
    }

    scrollLockCount++

    return () => {
      scrollLockCount--

      // Restore original values when last modal closes
      if (scrollLockCount === 0) {
        document.body.style.overflow = originalOverflow.current
        document.body.style.paddingRight = originalPaddingRight.current
      }
    }
  }, [isLocked])
}
