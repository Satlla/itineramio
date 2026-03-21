'use client'

import React, { useState, useEffect } from 'react'
import { clearTextSelection } from '../../utils/clearTextSelection'

interface SimpleStep {
  id: string
  content: string
  type: string
}

interface MobileStepEditorSimpleProps {
  zoneTitle: string
  onSave: (steps: any[]) => void
  onCancel: () => void
}

export function MobileStepEditorSimple({
  zoneTitle,
  onSave,
  onCancel
}: MobileStepEditorSimpleProps) {
  const [steps, setSteps] = useState<SimpleStep[]>([{
    id: '1',
    content: '',
    type: 'text'
  }])


  const handleContentChange = (index: number, content: string) => {
    const newSteps = [...steps]
    newSteps[index].content = content
    setSteps(newSteps)
  }

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const formattedSteps = steps.map((step, index) => ({
      id: step.id,
      type: step.type,
      content: {
        es: step.content,
        en: '',
        fr: ''
      },
      order: index
    }))
    
    try {
      onSave(formattedSteps)
    } catch (error) {
      // save error suppressed
    }
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="bg-white border-b p-4">
        <div className="flex justify-between items-center">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              onCancel()
            }}
            className="text-gray-600"
          >
            Cancelar
          </button>
          
          <h1 className="font-semibold">{zoneTitle}</h1>
          
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-gray-800 text-white rounded"
          >
            Guardar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4 p-4 bg-red-100 rounded">
          <p className="text-red-800 text-sm mb-2">Debug: Editor Simple Activo</p>
        </div>

        {steps.map((step, index) => (
          <div key={step.id} className="mb-4 p-4 border rounded">
            <label className="block text-sm font-medium mb-2">
              Paso {index + 1}
            </label>
            <textarea
              value={step.content}
              onChange={(e) => handleContentChange(index, e.target.value)}
              onPaste={() => setTimeout(() => clearTextSelection(), 100)}
              onBlur={() => clearTextSelection()}
              placeholder="Escribe el contenido..."
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
        ))}
      </div>
    </div>
  )
}