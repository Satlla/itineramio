'use client'

import React from 'react'
import { cn } from '../../lib/utils'

interface ItineramioLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'icon' | 'full' | 'square'
  showText?: boolean
  white?: boolean
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12'
}

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl'
}

export function ItineramioLogo({ 
  className,
  size = 'md',
  variant = 'icon',
  showText = false,
  white = false
}: ItineramioLogoProps) {
  const LogoSVG = () => (
    <svg 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizeClasses[size], className)}
    >
      {/* Background Circle */}
      <circle cx="16" cy="16" r="16" fill={white ? "white" : "url(#gradient)"}/>
      
      {/* Property/Building Icon */}
      <rect x="8" y="14" width="16" height="12" rx="2" fill={white ? "#8B5CF6" : "white"} opacity="0.9"/>
      <rect x="8" y="10" width="16" height="4" rx="2" fill={white ? "#8B5CF6" : "white"}/>
      
      {/* Guide Lines/Steps */}
      <line x1="11" y1="17" x2="21" y2="17" stroke={white ? "#A855F7" : "#8B5CF6"} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="11" y1="20" x2="18" y2="20" stroke={white ? "#A855F7" : "#8B5CF6"} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="11" y1="23" x2="20" y2="23" stroke={white ? "#A855F7" : "#8B5CF6"} strokeWidth="1.5" strokeLinecap="round"/>
      
      {/* Step Numbers */}
      <circle cx="11" cy="17" r="1.5" fill={white ? "#A855F7" : "#8B5CF6"}/>
      <circle cx="11" cy="20" r="1.5" fill={white ? "#A855F7" : "#8B5CF6"}/>
      <circle cx="11" cy="23" r="1.5" fill={white ? "#A855F7" : "#8B5CF6"}/>
      
      {!white && (
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6"/>
            <stop offset="100%" stopColor="#A855F7"/>
          </linearGradient>
        </defs>
      )}
    </svg>
  )

  if (variant === 'icon') {
    return <LogoSVG />
  }

  if (variant === 'square') {
    return (
      <div className={cn(
        "bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg",
        sizeClasses[size]
      )}>
        <LogoSVG />
      </div>
    )
  }

  if (variant === 'full' || showText) {
    return (
      <div className="flex items-center space-x-2">
        {variant === 'full' ? (
          <div className={cn(
            "bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg",
            sizeClasses[size]
          )}>
            <svg 
              viewBox="0 0 32 32" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className={cn(sizeClasses[size === 'xl' ? 'lg' : size === 'lg' ? 'md' : 'sm'])}
            >
              {/* Property/Building Icon */}
              <rect x="6" y="11" width="20" height="15" rx="2" fill="white" opacity="0.9"/>
              <rect x="6" y="8" width="20" height="5" rx="2" fill="white"/>
              
              {/* Guide Lines/Steps */}
              <line x1="9" y1="15" x2="23" y2="15" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="9" y1="18" x2="19" y2="18" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="9" y1="21" x2="21" y2="21" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round"/>
              
              {/* Step Numbers */}
              <circle cx="9" cy="15" r="1.5" fill="#A855F7"/>
              <circle cx="9" cy="18" r="1.5" fill="#A855F7"/>
              <circle cx="9" cy="21" r="1.5" fill="#A855F7"/>
            </svg>
          </div>
        ) : (
          <LogoSVG />
        )}
        {showText && (
          <span className={cn(
            "font-bold",
            white ? "text-white" : "bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent",
            textSizeClasses[size]
          )}>
            Itineramio
          </span>
        )}
      </div>
    )
  }

  return <LogoSVG />
}