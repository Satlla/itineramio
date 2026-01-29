export default function NewPropertyLoading() {
  return (
    <div className="min-h-[50vh] bg-gray-50 pt-4 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button skeleton */}
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mb-6"></div>

        {/* Title skeleton */}
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-8"></div>

        {/* Progress steps skeleton */}
        <div className="flex justify-center gap-8 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse hidden sm:block"></div>
            </div>
          ))}
        </div>

        {/* Form skeleton */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <div className="space-y-6">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>

            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            ))}

            <div className="flex justify-end gap-4 pt-4">
              <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-32 bg-violet-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
