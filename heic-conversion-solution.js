// SOLUCIÓN 1: Conversión HEIC → JPEG en el cliente
// Usando la librería 'heic2any'

import heic2any from 'heic2any'

async function convertHeicToJpeg(file) {
  if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
    console.log('🔄 Converting HEIC to JPEG:', file.name)
    
    try {
      const convertedBlob = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.8
      })
      
      // Crear nuevo archivo con nombre actualizado
      const convertedFile = new File(
        [convertedBlob], 
        file.name.replace(/\.heic$/i, '.jpg'),
        { type: 'image/jpeg' }
      )
      
      console.log('✅ HEIC converted successfully:', convertedFile.name)
      return convertedFile
      
    } catch (error) {
      console.error('❌ HEIC conversion failed:', error)
      throw new Error('No se pudo convertir el archivo HEIC. Por favor, usa JPG o PNG.')
    }
  }
  
  return file // No es HEIC, devolver original
}

// Uso en ImageUpload.tsx:
const handleFile = async (file) => {
  try {
    // 1. Intentar convertir si es HEIC
    const processedFile = await convertHeicToJpeg(file)
    
    // 2. Validar tamaño del archivo procesado
    if (processedFile.size > maxSize * 1024 * 1024) {
      alert(`El archivo es demasiado grande. Máximo ${maxSize}MB.`)
      return
    }
    
    // 3. Subir archivo convertido
    await uploadFile(processedFile)
    
  } catch (error) {
    console.error('Error processing file:', error)
    alert(error.message)
  }
}

// VENTAJAS:
// ✅ Usuario puede subir HEIC directamente
// ✅ Conversión automática e invisible
// ✅ Resultado compatible con todos los navegadores
// ✅ No requiere que usuario sepa sobre formatos

// DESVENTAJAS:
// ❌ Librería adicional (~200KB)
// ❌ Procesamiento en cliente (puede ser lento)
// ❌ Consume recursos del dispositivo del usuario