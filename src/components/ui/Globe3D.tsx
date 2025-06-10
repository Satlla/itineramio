'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface ManualPoint {
  id: string
  lat: number
  lng: number
  country: string
  isActive: boolean
}

const manualPoints: ManualPoint[] = [
  { id: '1', lat: 40.4168, lng: -3.7038, country: 'Madrid', isActive: true },
  { id: '2', lat: 41.3851, lng: 2.1734, country: 'Barcelona', isActive: false },
  { id: '3', lat: 48.8566, lng: 2.3522, country: 'Paris', isActive: true },
  { id: '4', lat: 51.5074, lng: -0.1278, country: 'London', isActive: false },
  { id: '5', lat: 40.7128, lng: -74.0060, country: 'New York', isActive: true },
  { id: '6', lat: 35.6762, lng: 139.6503, country: 'Tokyo', isActive: false },
  { id: '7', lat: -33.8688, lng: 151.2093, country: 'Sydney', isActive: true },
  { id: '8', lat: 55.7558, lng: 37.6173, country: 'Moscow', isActive: false },
  { id: '9', lat: 39.9042, lng: 116.4074, country: 'Beijing', isActive: true },
  { id: '10', lat: -23.5505, lng: -46.6333, country: 'São Paulo', isActive: false },
]

export function Globe3D() {
  const [rotation, setRotation] = useState(0)
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRotation(prev => prev + 0.5)
    }, 50)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const convertToScreenCoords = (lat: number, lng: number, radius = 200) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + rotation) * (Math.PI / 180)
    
    const x = radius * Math.sin(phi) * Math.cos(theta)
    const y = -radius * Math.cos(phi)
    const z = radius * Math.sin(phi) * Math.sin(theta)
    
    return { x, y, z, visible: z > -radius * 0.3 }
  }

  return (
    <div className="relative w-[500px] h-[500px] mx-auto">
      {/* Globe Background */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 shadow-2xl border-2 border-white/20">
        {/* Luminous Grid Lines */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="70%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
            </radialGradient>
            <pattern id="worldGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8"/>
            </pattern>
          </defs>
          
          {/* World grid overlay */}
          <circle 
            cx="250" 
            cy="250" 
            r="240" 
            fill="url(#worldGrid)" 
            className="opacity-60"
          />
          
          {/* Center luminous glow */}
          <circle 
            cx="250" 
            cy="250" 
            r="240" 
            fill="url(#centerGlow)" 
          />
          
          {/* Latitude lines */}
          {[-60, -30, 0, 30, 60].map((lat, i) => {
            const y = 250 + (lat * 240) / 90
            return (
              <ellipse
                key={`lat-${i}`}
                cx="250"
                cy="250"
                rx={240 * Math.cos((lat * Math.PI) / 180)}
                ry="0"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
                fill="none"
                transform={`translate(0, ${lat * 2.67})`}
              />
            )
          })}
          
          {/* Longitude lines */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * 30) - rotation * 0.5
            return (
              <ellipse
                key={`lng-${i}`}
                cx="250"
                cy="250"
                rx="0"
                ry="240"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
                fill="none"
                transform={`rotate(${angle} 250 250)`}
              />
            )
          })}
        </svg>

        {/* Enhanced Continents with luminous borders */}
        <div className="absolute inset-0">
          {/* Europe */}
          <div 
            className="absolute w-12 h-8 bg-white/10 rounded border border-white/30 shadow-lg"
            style={{
              top: '38%',
              left: '52%',
              transform: `rotate(${rotation * 0.2}deg)`,
              boxShadow: '0 0 10px rgba(255,255,255,0.3)'
            }}
          />
          {/* North America */}
          <div 
            className="absolute w-16 h-20 bg-white/10 rounded border border-white/30 shadow-lg"
            style={{
              top: '25%',
              left: '18%',
              transform: `rotate(${rotation * 0.2}deg)`,
              boxShadow: '0 0 10px rgba(255,255,255,0.3)'
            }}
          />
          {/* Asia */}
          <div 
            className="absolute w-20 h-16 bg-white/10 rounded border border-white/30 shadow-lg"
            style={{
              top: '28%',
              left: '62%',
              transform: `rotate(${rotation * 0.2}deg)`,
              boxShadow: '0 0 10px rgba(255,255,255,0.3)'
            }}
          />
          {/* Africa */}
          <div 
            className="absolute w-10 h-16 bg-white/10 rounded border border-white/30 shadow-lg"
            style={{
              top: '45%',
              left: '48%',
              transform: `rotate(${rotation * 0.2}deg)`,
              boxShadow: '0 0 10px rgba(255,255,255,0.3)'
            }}
          />
          {/* South America */}
          <div 
            className="absolute w-8 h-18 bg-white/10 rounded border border-white/30 shadow-lg"
            style={{
              top: '55%',
              left: '28%',
              transform: `rotate(${rotation * 0.2}deg)`,
              boxShadow: '0 0 10px rgba(255,255,255,0.3)'
            }}
          />
          {/* Australia */}
          <div 
            className="absolute w-8 h-6 bg-white/10 rounded border border-white/30 shadow-lg"
            style={{
              top: '65%',
              left: '72%',
              transform: `rotate(${rotation * 0.2}deg)`,
              boxShadow: '0 0 10px rgba(255,255,255,0.3)'
            }}
          />
        </div>
      </div>

      {/* Manual Creation Points */}
      <div className="absolute inset-0">
        {manualPoints.map((point) => {
          const coords = convertToScreenCoords(point.lat, point.lng)
          
          if (!coords.visible) return null

          return (
            <motion.div
              key={point.id}
              className="absolute"
              style={{
                left: coords.x + 250,
                top: coords.y + 250,
                zIndex: Math.round(coords.z + 200)
              }}
              initial={{ scale: 0 }}
              animate={{ 
                scale: hoveredPoint === point.id ? 1.5 : 1,
                opacity: coords.visible ? 1 : 0
              }}
              transition={{ duration: 0.3 }}
              onHoverStart={() => setHoveredPoint(point.id)}
              onHoverEnd={() => setHoveredPoint(null)}
            >
              {/* Point Glow - Enhanced */}
              <div className={`absolute inset-0 w-6 h-6 rounded-full blur-md ${
                point.isActive ? 'bg-violet-400' : 'bg-blue-400'
              }`} />
              
              {/* Point Core - Enhanced */}
              <div className={`relative w-6 h-6 rounded-full ${
                point.isActive ? 'bg-violet-500' : 'bg-blue-500'
              } shadow-xl border-2 border-white`} style={{
                boxShadow: point.isActive 
                  ? '0 0 20px rgba(139, 92, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.4)' 
                  : '0 0 15px rgba(59, 130, 246, 0.6)'
              }}>
                {/* Enhanced Pulsing Animation */}
                {point.isActive && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full bg-violet-400"
                      animate={{
                        scale: [1, 3, 1],
                        opacity: [0.8, 0, 0.8]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: Math.random() * 2
                      }}
                    />
                    
                    {/* Secondary pulse for layered effect */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-white"
                      animate={{
                        scale: [1, 2.5, 1],
                        opacity: [0.6, 0, 0.6]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: Math.random() * 2 + 0.5
                      }}
                    />
                  </>
                )}
              </div>

              {/* Manual transmission beams */}
              {point.isActive && (
                <motion.div
                  className="absolute inset-0 w-1 h-16 bg-gradient-to-t from-violet-500 to-transparent rounded-full"
                  style={{
                    left: '50%',
                    top: '-60px',
                    transform: 'translateX(-50%)',
                    opacity: 0.7
                  }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    scaleY: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 3
                  }}
                />
              )}

              {/* Tooltip */}
              {hoveredPoint === point.id && (
                <motion.div
                  className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded text-sm whitespace-nowrap backdrop-blur-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {point.country}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80" />
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Enhanced Orbital Rings */}
      <motion.div
        className="absolute inset-2 border-2 border-violet-400/40 rounded-full shadow-lg"
        style={{
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.3), inset 0 0 20px rgba(139, 92, 246, 0.1)'
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-6 border border-blue-400/30 rounded-full shadow-lg"
        style={{
          boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)'
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-12 border border-white/20 rounded-full shadow-lg"
        animate={{ rotate: 360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      />

      {/* Enhanced Center Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-radial from-white/10 via-violet-500/10 to-transparent" />
      
      {/* Stats Overlay */}
      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
        <motion.div
          className="text-2xl font-bold text-white mb-1"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {manualPoints.filter(p => p.isActive).length * 247}+
        </motion.div>
        <div className="text-sm text-gray-300">Manuales creados en tiempo real</div>
      </div>
    </div>
  )
}