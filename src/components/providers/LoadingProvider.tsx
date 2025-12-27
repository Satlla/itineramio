'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { FullPageSpinner } from '../ui/Spinner';

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Mostrar loading cuando cambia la ruta
    setIsLoading(true);

    // Ocultar loading después de un breve delay para asegurar que se vea
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Mínimo 300ms para que siempre se vea

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <>
      {isLoading && <FullPageSpinner />}
      {children}
    </>
  );
}
