/**
 * Custom SVG icons for home appliances not available in Lucide React.
 * Style follows Lucide conventions: 24×24 viewBox, stroke-based, currentColor, className passthrough.
 */

import React from 'react'

type IconProps = { className?: string }

// ── Washing Machine (Lavadora) ──────────────────────────────────────────────
export function WashingMachineIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Body */}
      <rect x="2" y="2" width="20" height="20" rx="2"/>
      {/* Control panel divider */}
      <line x1="2" y1="7" x2="22" y2="7"/>
      {/* Power button */}
      <circle cx="18" cy="4.5" r="1"/>
      {/* Program dial */}
      <circle cx="6" cy="4.5" r="1"/>
      {/* Main drum */}
      <circle cx="12" cy="14" r="5"/>
      {/* Inner drum ring (porthole detail) */}
      <circle cx="12" cy="14" r="2.5"/>
    </svg>
  )
}

// ── Boiler / Water Heater (Caldera) ────────────────────────────────────────
export function BoilerIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Main tank (pill / capsule = cylinder) */}
      <rect x="5" y="2" width="14" height="17" rx="7"/>
      {/* Top outlet pipe */}
      <line x1="12" y1="2" x2="12" y2="1"/>
      {/* Bottom drain pipe */}
      <line x1="12" y1="19" x2="12" y2="22"/>
      {/* Left connection pipe */}
      <line x1="5" y1="10" x2="2" y2="10"/>
      {/* Right connection pipe */}
      <line x1="19" y1="10" x2="22" y2="10"/>
      {/* Pressure gauge dial */}
      <circle cx="12" cy="11" r="2.5"/>
      {/* Gauge needle */}
      <line x1="12" y1="9" x2="13" y2="10.5"/>
    </svg>
  )
}

// ── Range Hood / Extractor (Campana Extractora) ─────────────────────────────
export function RangeHoodIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Duct at top (narrow) */}
      <rect x="9" y="1" width="6" height="5" rx="1"/>
      {/* Hood body: trapezoid wider at bottom, connected to duct */}
      <path d="M5 21h14l-4-15H9L5 21z"/>
      {/* Filter slats */}
      <line x1="7" y1="14" x2="17" y2="14"/>
      <line x1="6" y1="18" x2="18" y2="18"/>
    </svg>
  )
}

// ── Ceramic Hob / Induction Cooktop (Vitrocerámica) ─────────────────────────
export function CeramicHobIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Flat surface */}
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      {/* Top-left heating zone */}
      <circle cx="7.5" cy="10" r="2.5"/>
      {/* Top-right heating zone */}
      <circle cx="16.5" cy="10" r="2.5"/>
      {/* Bottom-left heating zone */}
      <circle cx="7.5" cy="16.5" r="2"/>
      {/* Bottom-right heating zone */}
      <circle cx="16.5" cy="16.5" r="2"/>
    </svg>
  )
}

// ── Gas Burner (Fogones de Gas) ─────────────────────────────────────────────
export function GasBurnerIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Outer grate ring */}
      <circle cx="12" cy="13" r="8"/>
      {/* Inner burner ring */}
      <circle cx="12" cy="13" r="3.5"/>
      {/* Burner cap center */}
      <circle cx="12" cy="13" r="1"/>
      {/* Grate arms (cardinal directions) */}
      <line x1="4" y1="13" x2="8.5" y2="13"/>
      <line x1="15.5" y1="13" x2="20" y2="13"/>
      <line x1="12" y1="5" x2="12" y2="9.5"/>
      <line x1="12" y1="16.5" x2="12" y2="21"/>
      {/* Flame above the burner */}
      <path d="M14 5c0 2-1.5 2.5-2 4-0.5-1.5-2-2-2-4 0-2 4-4 4 0z"/>
    </svg>
  )
}

// ── Toilet / WC (Inodoro) ────────────────────────────────────────────────────
export function ToiletIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Tank */}
      <rect x="6" y="2" width="12" height="6" rx="1"/>
      {/* Tank lid top */}
      <line x1="5" y1="2" x2="19" y2="2"/>
      {/* Bowl body */}
      <path d="M5 8h14v3a7 4.5 0 0 1-14 0V8z"/>
      {/* Seat open line */}
      <path d="M5 8q7 4 14 0"/>
      {/* Base / floor mount */}
      <line x1="9" y1="22" x2="15" y2="22"/>
      <line x1="10" y1="15" x2="10" y2="22"/>
      <line x1="14" y1="15" x2="14" y2="22"/>
    </svg>
  )
}

// ── Smart Lock / Electronic Lock (Cerradura Electrónica) ────────────────────
export function SmartLockIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Lock body */}
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      {/* Shackle */}
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      {/* Keypad dots (3×2 grid) */}
      <circle cx="9" cy="15" r="0.8" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="15" r="0.8" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="15" r="0.8" fill="currentColor" stroke="none"/>
      <circle cx="9" cy="18" r="0.8" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="18" r="0.8" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="18" r="0.8" fill="currentColor" stroke="none"/>
    </svg>
  )
}
