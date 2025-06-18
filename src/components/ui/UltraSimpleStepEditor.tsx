'use client'

import React, { useState } from 'react'

interface Props {
  onSave: (steps: any[]) => void
  onCancel: () => void
}

export function UltraSimpleStepEditor({ onSave, onCancel }: Props) {
  const [content, setContent] = useState('')
  
  const handleSave = () => {
    console.log('🟢 UltraSimple: Save clicked')
    console.log('🟢 UltraSimple: Content:', content)
    
    const steps = [{
      type: 'text',
      content: { es: content || 'Empty step' },
      order: 0
    }]
    
    console.log('🟢 UltraSimple: Calling onSave with:', steps)
    onSave(steps)
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'white',
      zIndex: 9999,
      padding: '20px'
    }}>
      <h2>Ultra Simple Editor</h2>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe algo..."
        style={{
          width: '100%',
          height: '200px',
          padding: '10px',
          border: '1px solid #ccc',
          marginTop: '20px',
          marginBottom: '20px'
        }}
      />
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleSave}
          style={{
            padding: '10px 20px',
            backgroundColor: '#333',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Guardar
        </button>
        
        <button
          onClick={onCancel}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ccc',
            color: 'black',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}