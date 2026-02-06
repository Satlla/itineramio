import React from 'react';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

const sizeClasses = {
  xs: 'w-3 h-3 border-2',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
  xl: 'w-12 h-12 border-4'
};

const colorClasses = {
  primary: 'border-gray-900 border-t-transparent',
  white: 'border-white border-t-transparent',
  gray: 'border-gray-400 border-t-transparent'
};

export function Spinner({ size = 'md', color = 'primary', className = '' }: SpinnerProps) {
  return (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Cargando"
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );
}

// Spinner para pantalla completa
export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" />
        <p className="text-sm text-gray-600 font-medium">Cargando...</p>
      </div>
    </div>
  );
}

// Spinner inline (para botones)
export function InlineSpinner({ size = 'sm', color = 'primary', className = '' }: Pick<SpinnerProps, 'size' | 'color' | 'className'>) {
  return <Spinner size={size} color={color} className={`inline-block ${className}`} />;
}

// Spinner para overlay (sobre contenido)
export function OverlaySpinner() {
  return (
    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
      <Spinner size="lg" />
    </div>
  );
}
