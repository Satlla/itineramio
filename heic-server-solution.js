// SOLUCIÓN 2: Conversión HEIC en el servidor
// Usando ImageMagick o Sharp en Vercel Functions

import sharp from 'sharp'
import { put } from '@vercel/blob'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    let processedBuffer = buffer
    let contentType = file.type
    let fileName = file.name
    
    // Detectar y convertir HEIC
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      console.log('🔄 Converting HEIC to JPEG on server:', file.name)
      
      try {
        // Convertir HEIC a JPEG usando Sharp
        processedBuffer = await sharp(buffer, { 
          failOnError: false // HEIC requiere esta opción
        })
        .jpeg({ 
          quality: 80,
          progressive: true 
        })
        .toBuffer()
        
        contentType = 'image/jpeg'
        fileName = file.name.replace(/\.heic$/i, '.jpg')
        
        console.log('✅ Server HEIC conversion successful')
        
      } catch (error) {
        console.error('❌ Server HEIC conversion failed:', error)
        return Response.json({ 
          error: 'No se pudo procesar el archivo HEIC' 
        }, { status: 400 })
      }
    }
    
    // Subir archivo procesado a Vercel Blob
    const blob = await put(fileName, processedBuffer, {
      access: 'public',
      contentType
    })
    
    return Response.json({ 
      success: true, 
      url: blob.url,
      originalFormat: file.type,
      finalFormat: contentType,
      converted: file.type.includes('heic')
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return Response.json({ error: 'Error uploading file' }, { status: 500 })
  }
}

// VENTAJAS:
// ✅ Procesamiento en servidor (no afecta al usuario)
// ✅ Más robusto y confiable
// ✅ No añade peso al cliente
// ✅ Mejor para archivos grandes

// DESVENTAJAS:
// ❌ Más complejo de implementar
// ❌ Puede requerir plan de Vercel más alto
// ❌ Tiempo de procesamiento en servidor