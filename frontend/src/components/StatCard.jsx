
export default function StatCard({
  title,
  value,
  description,
  icon,
  colorClass = 'bg-primary-50 text-primary-700 border-primary-100',
  isLoading = false,
  isError = false,
  onRetry,
}) {
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
        <div className="animate-pulse flex items-start justify-between">
          <div className="flex-1 space-y-3">
            {/* Title Skeleton */}
            <div className="h-4 bg-surface-200 rounded-md w-2/3" />
            {/* Value Skeleton */}
            <div className="h-8 bg-surface-200 rounded-md w-1/3 mt-2" />
            {/* Description Skeleton */}
            <div className="h-3 bg-surface-200 rounded-md w-3/4 mt-2" />
          </div>
          {/* Icon Skeleton */}
          <div className="h-11 w-11 bg-surface-200 rounded-xl" />
        </div>
        {/* Shimmer overlay effect */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent ltr:animate-shimmer" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-red-200 bg-red-50/30 p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-red-300">
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">{title}</p>
              <p className="mt-2 text-xs text-red-600 font-medium">Failed to load data</p>
            </div>
            <div className="rounded-xl p-2.5 bg-red-100 text-red-700 border border-red-200">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-900 transition-colors cursor-pointer w-fit"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18" />
              </svg>
              Retry Connection
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-surface-300">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-surface-600 truncate">{title}</p>
          <p className="mt-2 text-3xl font-bold text-surface-900 tracking-tight transition-transform duration-300 hover:scale-105 origin-left">
            {value}
          </p>
          <p className="mt-1.5 text-xs text-surface-500 font-medium truncate">{description}</p>
        </div>
        <div className={`rounded-xl p-3 transition-transform duration-300 hover:scale-110 shadow-sm border ${colorClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
