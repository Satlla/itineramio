// SOLUCIÓN 3: Híbrida (Recomendada)
// Conversión ligera en cliente + fallback en servidor

// 1. DETECCIÓN INTELIGENTE
function canConvertHEIC() {
  // Verificar si el navegador puede manejar HEIC
  return 'HTMLCanvasElement' in window && 
         'OffscreenCanvas' in window &&
         window.navigator.userAgent.includes('Safari')
}

// 2. IMPLEMENTACIÓN EN ImageUpload.tsx
const handleHeicFile = async (file) => {
  const isHeic = file.type === 'image/heic' || 
                 file.name.toLowerCase().endsWith('.heic')
  
  if (!isHeic) return file
  
  // Mostrar mensaje de procesamiento
  setProcessingMessage('Convirtiendo imagen de iPhone...')
  
  try {
    if (canConvertHEIC()) {
      // Conversión en cliente (navegadores compatibles)
      return await convertHeicClient(file)
    } else {
      // Enviar al servidor para conversión
      return await convertHeicServer(file)
    }
  } catch (error) {
    // Fallback: Pedir al usuario que convierta manualmente
    throw new Error(`
      No pudimos convertir tu foto de iPhone automáticamente.
      
      💡 Solución rápida:
      1. Abre la foto en tu iPhone
      2. Compártela por AirDrop o email
      3. Selecciona "Formato JPG" 
      4. Sube la nueva versión aquí
      
      O cambia la configuración en: Ajustes > Cámara > Formatos > "Más compatibles"
    `)
  }
}

// 3. MENSAJE DE USUARIO MEJORADO
const HeicHelpDialog = () => (
  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <h3 className="font-bold text-blue-900 mb-2">
      📱 ¿Tienes un iPhone?
    </h3>
    <p className="text-blue-800 text-sm mb-3">
      Las fotos de iPhone suelen estar en formato HEIC, que no funcionan en navegadores web.
    </p>
    
    <div className="space-y-2 text-sm">
      <h4 className="font-semibold">✅ Soluciones:</h4>
      <ul className="space-y-1 text-blue-700 ml-4">
        <li>• <strong>Automático:</strong> Subiremos y convertiremos tu foto</li>
        <li>• <strong>Manual:</strong> Cambia a "Formatos más compatibles" en Ajustes</li>
        <li>• <strong>Compartir:</strong> Usa AirDrop y selecciona "JPG"</li>
      </ul>
    </div>
  </div>
)

// CARACTERÍSTICAS:
// ✅ Detección automática de capacidades del navegador  
// ✅ Conversión inteligente (cliente o servidor según el caso)
// ✅ Mensajes educativos para el usuario
// ✅ Fallbacks múltiples si la conversión falla
// ✅ UX optimizada para usuarios de iPhone