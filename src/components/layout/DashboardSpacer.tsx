'use client'

/**
 * DashboardSpacer Component
 *
 * Provides proper spacing for dashboard pages below the fixed navbar.
 * Accounts for both the navbar height (4rem) and iOS safe-area-inset-top.
 *
 * Usage: Place this component right after opening your main page container
 *
 * @example
 * <div className="min-h-screen bg-gray-50">
 *   <DashboardSpacer />
 *   <main>... your content ...</main>
 * </div>
 */
export function DashboardSpacer() {
  return (
    <div
      className="w-full"
      style={{
        height: 'calc(4rem + env(safe-area-inset-top, 0px))',
        flexShrink: 0
      }}
      aria-hidden="true"
    />
  )
}
