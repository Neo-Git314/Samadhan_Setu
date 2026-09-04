import React from 'react';

export default function EmptyState({
  title = 'No Records Found',
  description = 'There are no active items under this category.',
  icon = 'inbox',
  actionLabel,
  onAction
}) {
  return (
    <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-12 text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center mx-auto text-secondary">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <h3 className="text-base font-bold text-on-surface">{title}</h3>
      <p className="text-xs text-secondary max-w-sm mx-auto leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="pt-2">
          <button
            onClick={onAction}
            className="px-5 py-2.5 bg-primary-container hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow transition-all"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}
