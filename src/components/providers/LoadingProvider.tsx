'use client';

import { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { FullPageSpinner } from '../ui/Spinner';

function NavigationLoadingTracker({ onLoadingChange }: { onLoadingChange: (loading: boolean) => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    onLoadingChange(true);
    const timer = setTimeout(() => {
      onLoadingChange(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [pathname, searchParams, onLoadingChange]);

  return null;
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <Suspense fallback={null}>
        <NavigationLoadingTracker onLoadingChange={setIsLoading} />
      </Suspense>
      {isLoading && <FullPageSpinner />}
      {children}
    </>
  );
}
