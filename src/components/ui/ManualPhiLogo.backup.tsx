'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ManualPhiLogoProps {
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

export function ManualPhiLogo({ 
  className,
  size = 'md',
  variant = 'icon',
  showText = false,
  white = false
}: ManualPhiLogoProps) {
  const LogoSVG = () => (
    <svg 
      viewBox="0 0 42 41" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizeClasses[size], className)}
    >
      <path d="M2 8V5C2 3.34315 3.34315 2 5 2H9" stroke={white ? "white" : "url(#paint0_linear)"} strokeWidth="3"/>
      <path d="M33.4336 2H36C37.6569 2 39 3.34315 39 5V8.16667M2 33.807V36C2 37.6569 3.34315 39 5 39H8.87611" stroke={white ? "white" : "url(#paint1_linear)"} strokeWidth="3"/>
      <path d="M40 34V36C40 37.6569 38.6569 39 37 39H33" stroke={white ? "white" : "url(#paint2_linear)"} strokeWidth="3"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M7.59408 22.8502C8.12901 23.5437 10.9814 27.2414 17.4965 27.2943V30.8126C17.4965 32.1469 17.8273 33.8071 19.1616 33.8071C20.4732 33.8071 20.8268 32.1316 20.8268 30.82V27.2943C24.9777 27.1022 33.3808 24.7007 33.7863 16.6318C34.1917 8.56282 28.5253 6.54558 25.2432 6.54558C24.3835 6.52733 22.887 6.65611 21.4128 7.21625C17.9043 8.54936 17.4965 12.953 17.4965 16.7062V24.5854C16.0967 24.5086 12.9208 24.0091 11.4149 22.6258C11.3433 22.6258 11.0533 22.6369 10.6524 22.6521C9.75609 22.6861 8.3058 22.7411 7.50537 22.7411C7.51721 22.7505 7.54646 22.7885 7.59408 22.8502ZM20.8992 24.5274C24.2296 24.2585 30.6442 22.0938 30.2387 15.1315C29.9974 13.1911 28.6894 9.18351 24.8088 9.36794C21.7286 9.36794 21.0265 13.1302 20.9921 16.2102L20.8992 24.5274Z" fill={white ? "white" : "url(#paint3_linear)"}/>
      <rect x="7.42334" y="18.5146" width="2.63837" height="2.39625" fill={white ? "white" : "url(#paint4_linear)"}/>
      <rect x="10.9412" y="14.521" width="2.63837" height="2.39625" fill={white ? "white" : "url(#paint5_linear)"}/>
      <rect x="6.54395" y="10.5269" width="2.63837" height="2.39625" fill={white ? "white" : "url(#paint6_linear)"}/>
      <rect x="11.8208" y="8.9292" width="0.879455" height="0.798751" fill={white ? "white" : "url(#paint7_linear)"}/>
      <path d="M8.30298 20.1123L12.6563 16.5179L8.30298 12.1248L12.6563 9.72852L17.977 13.7223" stroke={white ? "white" : "url(#paint8_linear)"} strokeWidth="0.2"/>
      {!white && (
        <defs>
          <linearGradient id="paint0_linear" x1="2" y1="2" x2="9" y2="8" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B5CF6"/>
            <stop offset="1" stopColor="#A855F7"/>
          </linearGradient>
          <linearGradient id="paint1_linear" x1="2" y1="33" x2="39" y2="8" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B5CF6"/>
            <stop offset="1" stopColor="#A855F7"/>
          </linearGradient>
          <linearGradient id="paint2_linear" x1="33" y1="34" x2="40" y2="39" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B5CF6"/>
            <stop offset="1" stopColor="#A855F7"/>
          </linearGradient>
          <linearGradient id="paint3_linear" x1="20.6561" y1="6.54395" x2="20.6561" y2="33.8071" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B5CF6"/>
            <stop offset="1" stopColor="#A855F7"/>
          </linearGradient>
          <linearGradient id="paint4_linear" x1="8.74252" y1="18.5146" x2="8.74252" y2="20.9109" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B5CF6"/>
            <stop offset="1" stopColor="#A855F7"/>
          </linearGradient>
          <linearGradient id="paint5_linear" x1="12.2603" y1="14.521" x2="12.2603" y2="16.9173" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B5CF6"/>
            <stop offset="1" stopColor="#A855F7"/>
          </linearGradient>
          <linearGradient id="paint6_linear" x1="7.86313" y1="10.5269" x2="7.86313" y2="12.9231" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B5CF6"/>
            <stop offset="1" stopColor="#A855F7"/>
          </linearGradient>
          <linearGradient id="paint7_linear" x1="12.2605" y1="8.9292" x2="12.2605" y2="9.72795" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B5CF6"/>
            <stop offset="1" stopColor="#A855F7"/>
          </linearGradient>
          <linearGradient id="paint8_linear" x1="8.30298" y1="9.72852" x2="17.977" y2="20.1123" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B5CF6"/>
            <stop offset="1" stopColor="#A855F7"/>
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
              viewBox="0 0 42 41" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className={cn(sizeClasses[size === 'xl' ? 'lg' : size === 'lg' ? 'md' : 'sm'])}
            >
              <path d="M2 8V5C2 3.34315 3.34315 2 5 2H9" stroke="white" strokeWidth="3"/>
              <path d="M33.4336 2H36C37.6569 2 39 3.34315 39 5V8.16667M2 33.807V36C2 37.6569 3.34315 39 5 39H8.87611" stroke="white" strokeWidth="3"/>
              <path d="M40 34V36C40 37.6569 38.6569 39 37 39H33" stroke="white" strokeWidth="3"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M7.59408 22.8502C8.12901 23.5437 10.9814 27.2414 17.4965 27.2943V30.8126C17.4965 32.1469 17.8273 33.8071 19.1616 33.8071C20.4732 33.8071 20.8268 32.1316 20.8268 30.82V27.2943C24.9777 27.1022 33.3808 24.7007 33.7863 16.6318C34.1917 8.56282 28.5253 6.54558 25.2432 6.54558C24.3835 6.52733 22.887 6.65611 21.4128 7.21625C17.9043 8.54936 17.4965 12.953 17.4965 16.7062V24.5854C16.0967 24.5086 12.9208 24.0091 11.4149 22.6258C11.3433 22.6258 11.0533 22.6369 10.6524 22.6521C9.75609 22.6861 8.3058 22.7411 7.50537 22.7411C7.51721 22.7505 7.54646 22.7885 7.59408 22.8502ZM20.8992 24.5274C24.2296 24.2585 30.6442 22.0938 30.2387 15.1315C29.9974 13.1911 28.6894 9.18351 24.8088 9.36794C21.7286 9.36794 21.0265 13.1302 20.9921 16.2102L20.8992 24.5274Z" fill="white"/>
              <rect x="7.42334" y="18.5146" width="2.63837" height="2.39625" fill="white"/>
              <rect x="10.9412" y="14.521" width="2.63837" height="2.39625" fill="white"/>
              <rect x="6.54395" y="10.5269" width="2.63837" height="2.39625" fill="white"/>
              <rect x="11.8208" y="8.9292" width="0.879455" height="0.798751" fill="white"/>
              <path d="M8.30298 20.1123L12.6563 16.5179L8.30298 12.1248L12.6563 9.72852L17.977 13.7223" stroke="white" strokeWidth="0.2"/>
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
            ManualPhi
          </span>
        )}
      </div>
    )
  }

  return <LogoSVG />
}