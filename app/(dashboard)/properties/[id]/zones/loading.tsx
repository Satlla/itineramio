export default function ZonesLoading() {
  return (
    <div className="min-h-[50vh] bg-gray-50 pt-4 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-violet-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Zones grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
