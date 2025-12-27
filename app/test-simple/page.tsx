export default function TestSimplePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">✅ Página funcionando</h1>
        <p className="text-gray-600">Esta página confirma que el routing funciona correctamente</p>
        <div className="mt-8 space-y-2">
          <p className="text-sm text-gray-500">Timestamp: {new Date().toISOString()}</p>
          <p className="text-sm text-gray-500">Deploy exitoso</p>
        </div>
      </div>
    </div>
  )
}