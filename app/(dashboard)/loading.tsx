export default function DashboardLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-violet-200 rounded-full animate-spin border-t-violet-600"></div>
        </div>
        <p className="text-gray-500 text-sm animate-pulse">Cargando...</p>
      </div>
    </div>
  )
}
