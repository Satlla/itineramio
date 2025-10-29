// Test file to verify JSX syntax compilation
import React from 'react'

export default function TestComponent() {
  const showModal = true
  
  return (
    <div>
      {/* This should work */}
      {showModal && (
        <div>Modal content</div>
      )}
    </div>
  )
}