import * as React from 'react'

// Placeholder simplificado para DropdownMenu
export const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative">{children}</div>
)

export const DropdownMenuTrigger: React.FC<{ asChild?: boolean; children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
)

export const DropdownMenuContent: React.FC<{ align?: string; className?: string; children: React.ReactNode }> = ({ children, className }) => (
  <div className={`absolute top-full mt-1 bg-white border rounded shadow-lg ${className}`}>{children}</div>
)

export const DropdownMenuItem: React.FC<{ onClick?: () => void; className?: string; children: React.ReactNode }> = ({ onClick, children, className }) => (
  <div onClick={onClick} className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${className}`}>{children}</div>
)