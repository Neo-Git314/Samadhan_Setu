import React from 'react';

export default function LoadingSpinner({ message = 'Loading...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  }[size] || 'w-8 h-8 border-3';

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className={`${sizeClasses} border-primary border-t-transparent rounded-full animate-spin`}></div>
      {message && <p className="text-xs text-secondary font-medium">{message}</p>}
    </div>
  );
}
