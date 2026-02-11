'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Lista de rutas públicas que NO necesitan auth check
    const publicRoutes = [
      '/academia',
      '/blog',
      '/recursos',
      '/host-profile',
      '/funcionalidades',
      '/pricing',
      '/legal',
      '/terms',
      '/privacy',
      '/login',
      '/register',
      '/',
    ]

    // Lista de rutas admin
    const isAdminRoute = pathname?.startsWith('/admin')

    // Verificar si es ruta pública
    const isPublicRoute = publicRoutes.some(route =>
      pathname === route || pathname?.startsWith(`${route}/`)
    )

    // Solo verificar auth si NO es admin y NO es pública
    if (isAdminRoute || isPublicRoute) {
      setLoading(false)
      return
    }

    // Solo verificar auth en rutas privadas (ej: /account, /dashboard)
    checkAuthStatus()
  }, [pathname])

  const checkAuthStatus = async () => {
    try {
      // Get token from localStorage for PWA persistence fallback
      const headers: HeadersInit = {}

      try {
        const localToken = localStorage.getItem('auth-token')
        if (localToken) {
          headers['Authorization'] = `Bearer ${localToken}`
          console.log('📱 Sending localStorage token via Authorization header')
        }
      } catch (e) {
        console.warn('⚠️ Could not access localStorage:', e)
      }

      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-cache',
        headers
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        setUser(null)
        if (response.status !== 401) {
          console.error('Auth check failed:', response.status)
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setUser(result.user)
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Error de autenticación' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Error de conexión' }
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setUser(result.user)
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Error en el registro' }
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: 'Error de conexión' }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear all user data from localStorage for security
      if (typeof window !== 'undefined') {
        try {
          // Auth tokens
          localStorage.removeItem('auth-token')
          // User preferences and state
          localStorage.removeItem('notificationSettings')
          localStorage.removeItem('onboardingState')
          localStorage.removeItem('itineramio_notifications')
          localStorage.removeItem('hasSeenFirstPropertyOnboarding')
          // Form data
          localStorage.removeItem('propertyFormData')
          localStorage.removeItem('propertyFormData_timestamp')
          // Session data
          sessionStorage.clear()
        } catch (e) {
          console.error('Error clearing storage on logout:', e)
        }
      }
      setUser(null)
      router.push('/login')
    }
  }, [router])

  const refreshUser = useCallback(async () => {
    await checkAuthStatus()
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    refreshUser
  }), [user, loading, login, register, logout, refreshUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}