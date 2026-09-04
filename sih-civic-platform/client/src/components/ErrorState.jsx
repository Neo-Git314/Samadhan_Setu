import React from 'react';

export default function ErrorState({
  title = 'Something Went Wrong',
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry
}) {
  return (
    <div className="bg-surface-container-low border border-red-500/40 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-error flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-3xl">error_outline</span>
      </div>
      <h3 className="text-base font-bold text-on-surface">{title}</h3>
      <p className="text-xs text-secondary max-w-sm mx-auto leading-relaxed">{message}</p>
      {onRetry && (
        <div className="pt-2">
          <button
            onClick={onRetry}
            className="px-5 py-2.5 bg-primary-container hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow transition-all flex items-center gap-1.5 mx-auto"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            <span>Retry Operation</span>
          </button>
        </div>
      )}
    </div>
  );
}
