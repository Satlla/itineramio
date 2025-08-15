'use client'

import { useState } from 'react'

export default function UploadImagesPage() {
  const [images, setImages] = useState<string[]>([])
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (event) => {
            if (event.target?.result) {
              setImages(prev => [...prev, event.target!.result as string])
            }
          }
          reader.readAsDataURL(file)
        }
      })
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (event) => {
            if (event.target?.result) {
              setImages(prev => [...prev, event.target!.result as string])
            }
          }
          reader.readAsDataURL(file)
        }
      })
    }
  }

  const clearImages = () => {
    setImages([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Subir Imágenes para Claude</h1>
        
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="text-6xl">📸</div>
            <div>
              <p className="text-xl font-medium text-gray-700 mb-2">
                Arrastra y suelta las imágenes aquí
              </p>
              <p className="text-gray-500 mb-4">
                O haz click para seleccionar archivos
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Seleccionar Imágenes
              </label>
            </div>
          </div>
        </div>

        {/* Clear Button */}
        {images.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={clearImages}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Limpiar Todas las Imágenes
            </button>
          </div>
        )}

        {/* Images Display */}
        {images.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Imágenes Subidas ({images.length})
            </h2>
            <div className="space-y-8">
              {images.map((image, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Imagen {index + 1}
                  </h3>
                  <img
                    src={image}
                    alt={`Uploaded ${index + 1}`}
                    className="max-w-full h-auto rounded-lg border border-gray-200"
                    style={{ maxHeight: '600px' }}
                  />
                  <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600 font-mono break-all">
                    <p><strong>Data URL:</strong> {image.substring(0, 100)}...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Instrucciones:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Sube las imágenes arrastrándolas o haciendo click en "Seleccionar Imágenes"</li>
            <li>Las imágenes aparecerán abajo una vez subidas</li>
            <li>Copia la URL de esta página y envíasela a Claude</li>
            <li>Claude podrá ver las imágenes directamente desde esta página</li>
          </ol>
        </div>
      </div>
    </div>
  )
}