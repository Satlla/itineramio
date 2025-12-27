export default function TestPropertyActivationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔧 Test de Activación de Propiedades</h1>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-red-900 mb-4">❌ ERRORES DETECTADOS:</h2>
          <ul className="text-sm text-red-800 space-y-2">
            <li>• <strong>Error 401 /api/auth/me:</strong> Intentas autenticación de usuario normal, pero necesitas admin</li>
            <li>• <strong>Error 500 en activación:</strong> La propiedad que intentas activar NO EXISTE</li>
            <li>• <strong>ID inexistente:</strong> cmd23uhm90001l304fxc7oe85 no está en la base de datos</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-green-900 mb-4">✅ PROPIEDADES REALES:</h2>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold text-green-900">Test Property for Invoice</h3>
              <p className="text-sm text-green-700">ID: <code className="bg-green-100 px-2 py-1 rounded">cmebxhhyf00017cp08h002vdq</code></p>
              <p className="text-sm text-green-700">Estado: <span className="bg-yellow-100 px-2 py-1 rounded">PENDING</span></p>
              <p className="text-sm text-green-700">Host: Demo User (demo@itineramio.com)</p>
            </div>
            
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold text-green-900">Test Property for Duplication - DUPLICATED</h3>
              <p className="text-sm text-green-700">ID: <code className="bg-green-100 px-2 py-1 rounded">cmduceci4000g7cfew81qm6ek</code></p>
              <p className="text-sm text-green-700">Estado: <span className="bg-green-100 px-2 py-1 rounded">ACTIVE</span></p>
              <p className="text-sm text-green-700">Host: Demo User (demo@itineramio.com)</p>
            </div>

            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold text-green-900">Test Property for Duplication</h3>
              <p className="text-sm text-green-700">ID: <code className="bg-green-100 px-2 py-1 rounded">cmducd44t00047cfe7jxu3p06</code></p>
              <p className="text-sm text-green-700">Estado: <span className="bg-green-100 px-2 py-1 rounded">ACTIVE</span></p>
              <p className="text-sm text-green-700">Host: Demo User (demo@itineramio.com)</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">🎯 PÁGINAS CORRECTAS:</h2>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold text-blue-900">Gestión de Propiedades (SIN errores de auth)</h3>
              <p className="text-sm text-blue-700 mb-2">Esta página no depende de autenticación de usuario</p>
              <a 
                href="/admin-property-management" 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
              >
                🚀 Ir a Admin Property Management
              </a>
            </div>

            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold text-blue-900">Test de Confirmación de Pagos</h3>
              <p className="text-sm text-blue-700 mb-2">Para probar la confirmación de pagos con facturas</p>
              <a 
                href="/test-payment-system" 
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 inline-block"
              >
                💰 Ir a Test Payment System
              </a>
            </div>

            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold text-blue-900">Test Simple (Verificar que funciona)</h3>
              <p className="text-sm text-blue-700 mb-2">Página simple para verificar que el deploy funciona</p>
              <a 
                href="/test-simple" 
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 inline-block"
              >
                🔧 Ir a Test Simple
              </a>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-900 mb-4">📋 INSTRUCCIONES:</h2>
          <ol className="text-sm text-yellow-800 space-y-2 list-decimal list-inside">
            <li>Cierra esta página</li>
            <li>Ve a <strong>/admin-property-management</strong></li>
            <li>Verás las 3 propiedades reales</li>
            <li>Activa solo la propiedad PENDING: <code className="bg-yellow-100 px-1 rounded">cmebxhhyf00017cp08h002vdq</code></li>
            <li>El sistema enviará notificaciones automáticamente</li>
            <li>Para recibir emails, configura RESEND_API_KEY en Vercel</li>
          </ol>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/admin-property-management" 
            className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 inline-block"
          >
            ✅ IR A LA PÁGINA CORRECTA
          </a>
        </div>
      </div>
    </div>
  )
}