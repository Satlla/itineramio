export default function AdminCurrentPropertiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">📋 Propiedades Actuales en la Base de Datos</h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-yellow-900 mb-4">⚠️ PROBLEMA IDENTIFICADO:</h2>
          <p className="text-yellow-800 mb-4">
            Estás intentando usar una propiedad que <strong>NO EXISTE</strong>:
          </p>
          <div className="bg-red-100 p-4 rounded border border-red-300">
            <code className="text-red-800 font-mono">cme2qxx6q0001kv041gddyxiu</code> ❌ <strong>NO EXISTE</strong>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-green-900 mb-4">✅ PROPIEDADES QUE SÍ EXISTEN:</h2>
          
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border-2 border-green-300">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Test Property for Invoice</h3>
              <p className="text-green-700 mb-2">
                <strong>ID:</strong> <code className="bg-green-100 px-2 py-1 rounded font-mono">cmebxhhyf00017cp08h002vdq</code>
              </p>
              <p className="text-green-700 mb-2"><strong>Estado:</strong> <span className="bg-yellow-100 px-2 py-1 rounded">PENDING</span></p>
              <p className="text-green-700 mb-2"><strong>Host:</strong> Demo User (demo@itineramio.com)</p>
              <p className="text-green-700"><strong>Ubicación:</strong> Madrid, España</p>
              <div className="mt-4 p-3 bg-green-100 rounded">
                <strong>💡 Esta puedes ACTIVARLA (está PENDING)</strong>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-blue-300">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Test Property for Duplication - DUPLICATED</h3>
              <p className="text-blue-700 mb-2">
                <strong>ID:</strong> <code className="bg-blue-100 px-2 py-1 rounded font-mono">cmduceci4000g7cfew81qm6ek</code>
              </p>
              <p className="text-blue-700 mb-2"><strong>Estado:</strong> <span className="bg-green-100 px-2 py-1 rounded">ACTIVE</span></p>
              <p className="text-blue-700 mb-2"><strong>Host:</strong> Demo User (demo@itineramio.com)</p>
              <p className="text-blue-700"><strong>Ubicación:</strong> Test City, ES</p>
              <div className="mt-4 p-3 bg-blue-100 rounded">
                <strong>💡 Esta puedes DESACTIVARLA (está ACTIVE)</strong>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-blue-300">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Test Property for Duplication</h3>
              <p className="text-blue-700 mb-2">
                <strong>ID:</strong> <code className="bg-blue-100 px-2 py-1 rounded font-mono">cmducd44t00047cfe7jxu3p06</code>
              </p>
              <p className="text-blue-700 mb-2"><strong>Estado:</strong> <span className="bg-green-100 px-2 py-1 rounded">ACTIVE</span></p>
              <p className="text-blue-700 mb-2"><strong>Host:</strong> Demo User (demo@itineramio.com)</p>
              <p className="text-blue-700"><strong>Ubicación:</strong> Test City, ES</p>
              <div className="mt-4 p-3 bg-blue-100 rounded">
                <strong>💡 Esta puedes DESACTIVARLA (está ACTIVE)</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">🎯 INSTRUCCIONES:</h2>
          <ol className="text-blue-800 space-y-2 list-decimal list-inside">
            <li>Espera a que termine el deploy (unos minutos más)</li>
            <li>Ve a <strong>/admin-property-management</strong></li>
            <li>USA SOLO los IDs que están arriba ☝️</li>
            <li>Para ACTIVAR: usa <code className="bg-blue-100 px-1 rounded">cmebxhhyf00017cp08h002vdq</code></li>
            <li>Para DESACTIVAR: usa cualquiera de las otras dos</li>
          </ol>
        </div>

        <div className="text-center space-y-4">
          <a 
            href="/admin-property-management" 
            className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 inline-block"
          >
            🏠 Ir a Property Management
          </a>
          
          <div>
            <a 
              href="/test-property-activation" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
            >
              📋 Ver todas las instrucciones
            </a>
          </div>
        </div>

        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-900 mb-2">🚨 IMPORTANTE:</h3>
          <p className="text-red-800">
            DEJA DE intentar usar propiedades que no existen. Solo usa los 3 IDs que están arriba.
            El frontend puede estar mostrando datos cacheados o de otra fuente.
          </p>
        </div>
      </div>
    </div>
  )
}