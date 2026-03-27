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

// ── Ceiling Fan (Ventilador de Techo) ────────────────────────────────────────
export function CeilingFanIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Ceiling mount rod */}
      <line x1="12" y1="2" x2="12" y2="10"/>
      {/* Motor hub */}
      <circle cx="12" cy="12" r="2"/>
      {/* Left blade */}
      <path d="M10 12c-1-2-4-3-6-2s-2 3 0 4 5-1 6-2z"/>
      {/* Right blade */}
      <path d="M14 12c1 2 4 3 6 2s2-3 0-4-5 1-6 2z"/>
      {/* Top blade */}
      <path d="M12 10c2-1 3-4 2-6s-3-2-4 0 1 5 2 6z"/>
      {/* Bottom blade */}
      <path d="M12 14c-2 1-3 4-2 6s3 2 4 0-1-5-2-6z"/>
    </svg>
  )
}

// ── Jacuzzi / Hot Tub (Jacuzzi / Bañera de Hidromasaje) ─────────────────────
export function JacuzziIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Tub body */}
      <path d="M2 12h20v4a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-4z"/>
      {/* Back rim */}
      <path d="M2 12V8a2 2 0 0 1 2-2h4"/>
      {/* Faucet handle */}
      <line x1="7" y1="6" x2="7" y2="4"/>
      <line x1="5" y1="4" x2="9" y2="4"/>
      {/* Bubbles / jets */}
      <circle cx="8" cy="9" r="1"/>
      <circle cx="12" cy="8" r="1"/>
      <circle cx="16" cy="9" r="1"/>
      {/* Leg left */}
      <line x1="5" y1="20" x2="4" y2="22"/>
      {/* Leg right */}
      <line x1="19" y1="20" x2="20" y2="22"/>
    </svg>
  )
}

// ── Outdoor Hot Tub (Bañera exterior / Spa) ──────────────────────────────────
export function HotTubIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Round tub */}
      <circle cx="12" cy="14" r="8"/>
      {/* Inner water fill line */}
      <path d="M4.5 12a7.5 7.5 0 0 1 15 0"/>
      {/* Steam lines */}
      <path d="M9 5c0-1 1-2 1-3s-1-2-1-3" strokeWidth="1.5"/>
      <path d="M12 5c0-1 1-2 1-3s-1-2-1-3" strokeWidth="1.5"/>
      <path d="M15 5c0-1 1-2 1-3s-1-2-1-3" strokeWidth="1.5"/>
      {/* Bubbles */}
      <circle cx="9" cy="13" r="0.8" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none"/>
      <circle cx="15" cy="13" r="0.8" fill="currentColor" stroke="none"/>
    </svg>
  )
}

// ── Locker / Taquilla (Taquilla con cerrojo) ─────────────────────────────────
export function LockerIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Locker body */}
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      {/* Horizontal divider (2 compartments) */}
      <line x1="4" y1="12" x2="20" y2="12"/>
      {/* Top lock */}
      <circle cx="12" cy="7" r="1.5"/>
      <line x1="12" y1="8.5" x2="12" y2="10"/>
      {/* Bottom lock */}
      <circle cx="12" cy="17" r="1.5"/>
      <line x1="12" y1="18.5" x2="12" y2="20"/>
      {/* Vent slats top */}
      <line x1="7" y1="4" x2="10" y2="4"/>
      {/* Vent slats bottom */}
      <line x1="7" y1="14" x2="10" y2="14"/>
    </svg>
  )
}

// ── Vault / Safe (Caja Fuerte con combinación) ───────────────────────────────
export function VaultIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Safe body */}
      <rect x="2" y="3" width="20" height="18" rx="2"/>
      {/* Combination wheel */}
      <circle cx="12" cy="12" r="5"/>
      <circle cx="12" cy="12" r="2"/>
      {/* Wheel notches */}
      <line x1="12" y1="7" x2="12" y2="9"/>
      <line x1="12" y1="15" x2="12" y2="17"/>
      <line x1="7" y1="12" x2="9" y2="12"/>
      <line x1="15" y1="12" x2="17" y2="12"/>
      {/* Handle */}
      <line x1="19" y1="10" x2="22" y2="10"/>
      <line x1="19" y1="14" x2="22" y2="14"/>
      <line x1="22" y1="10" x2="22" y2="14"/>
      {/* Feet */}
      <line x1="6" y1="21" x2="6" y2="23"/>
      <line x1="18" y1="21" x2="18" y2="23"/>
    </svg>
  )
}

// ── Oven (Horno con puerta y visor) ──────────────────────────────────────────
export function OvenIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Oven body */}
      <rect x="2" y="3" width="20" height="19" rx="2"/>
      {/* Control panel divider */}
      <line x1="2" y1="8" x2="22" y2="8"/>
      {/* Control knobs */}
      <circle cx="7" cy="5.5" r="1"/>
      <circle cx="12" cy="5.5" r="1"/>
      <circle cx="17" cy="5.5" r="1"/>
      {/* Door window */}
      <rect x="6" y="11" width="12" height="8" rx="1"/>
      {/* Inner window grill */}
      <line x1="6" y1="15" x2="18" y2="15"/>
      {/* Door handle */}
      <line x1="8" y1="22" x2="16" y2="22"/>
    </svg>
  )
}

// ── Dryer (Secadora con rejilla frontal) ─────────────────────────────────────
export function DryerIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Body */}
      <rect x="2" y="2" width="20" height="20" rx="2"/>
      {/* Control panel */}
      <line x1="2" y1="7" x2="22" y2="7"/>
      {/* Power button */}
      <circle cx="18" cy="4.5" r="1"/>
      {/* Temperature dial */}
      <circle cx="6" cy="4.5" r="1"/>
      {/* Main drum with heat indicator */}
      <circle cx="12" cy="14" r="5"/>
      {/* Inner drum ring */}
      <circle cx="12" cy="14" r="2.5"/>
      {/* Heat lines inside */}
      <line x1="10.5" y1="12.5" x2="13.5" y2="15.5" strokeWidth="1.5"/>
      <line x1="13.5" y1="12.5" x2="10.5" y2="15.5" strokeWidth="1.5"/>
    </svg>
  )
}

// ── Iron (Plancha de Ropa) ───────────────────────────────────────────────────
export function IronIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Iron sole plate (flat bottom, rounded front) */}
      <path d="M2 15h16l2-6H4a2 2 0 0 0-2 2v4z"/>
      {/* Handle */}
      <path d="M8 9V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3"/>
      {/* Steam holes */}
      <circle cx="7" cy="14" r="0.6" fill="currentColor" stroke="none"/>
      <circle cx="10" cy="14" r="0.6" fill="currentColor" stroke="none"/>
      <circle cx="13" cy="14" r="0.6" fill="currentColor" stroke="none"/>
      <circle cx="16" cy="14" r="0.6" fill="currentColor" stroke="none"/>
    </svg>
  )
}

// ── Hammock (Hamaca entre dos puntos) ────────────────────────────────────────
export function HammockIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {/* Left post */}
      <line x1="3" y1="3" x2="3" y2="21"/>
      {/* Right post */}
      <line x1="21" y1="3" x2="21" y2="21"/>
      {/* Top rope */}
      <path d="M3 8c6-2 12-2 18 0"/>
      {/* Hammock body (catenary curve) */}
      <path d="M3 10c2 4 4 7 9 7s7-3 9-7"/>
      {/* Bottom fringe lines */}
      <line x1="8" y1="17" x2="7" y2="19"/>
      <line x1="12" y1="17" x2="12" y2="19"/>
      <line x1="16" y1="17" x2="17" y2="19"/>
    </svg>
  )
}
