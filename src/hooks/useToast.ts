import { useCallback } from 'react'

interface ToastOptions {
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  duration?: number
}

export function useToast() {
  const toast = useCallback((options: ToastOptions) => {
    // Simple implementation using browser notification
    // In a real app, you'd use a proper toast library like react-hot-toast
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(options.title, {
        body: options.description,
        icon: '/favicon.ico'
      })
    } else {
      // Fallback to console log for development
      console.log(`Toast: ${options.title}`, options.description)
      
      // Simple alert for now
      if (options.variant === 'destructive') {
        alert(`Error: ${options.title}\n${options.description || ''}`)
      } else {
        alert(`${options.title}\n${options.description || ''}`)
      }
    }
  }, [])

  return { toast }
}