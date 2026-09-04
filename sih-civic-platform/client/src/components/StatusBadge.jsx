import React from 'react';

/**
 * Reusable high-contrast StatusBadge component for dark theme.
 * Supports: 'Resolved', 'In Progress', 'Pending', 'Under Review', 'Critical', etc.
 */
function StatusBadge({ status = 'pending', size = 'sm', className = '' }) {
  const norm = (status || '').toLowerCase().trim();

  let badgeClasses = 'bg-slate-800/90 text-slate-200 border-slate-600/80';
  let dotClasses = 'bg-slate-400';
  let displayLabel = status || 'Pending';

  if (norm === 'resolved' || norm === 'done' || norm === 'completed' || norm === 'co-funded' || norm === 'approved') {
    badgeClasses = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-sm';
    dotClasses = 'bg-emerald-400';
    if (norm === 'resolved') displayLabel = 'Resolved';
    if (norm === 'completed') displayLabel = 'Completed';
    if (norm === 'co-funded') displayLabel = 'Co-Funded';
  } else if (
    norm === 'in progress' ||
    norm === 'in_progress' ||
    norm === 'assigned' ||
    norm === 'active' ||
    norm === 'testing'
  ) {
    badgeClasses = 'bg-sky-950/80 text-sky-300 border-sky-500/50 shadow-sm';
    dotClasses = 'bg-sky-400 animate-pulse';
    if (norm === 'in_progress' || norm === 'in progress') displayLabel = 'In Progress';
    if (norm === 'assigned') displayLabel = 'Assigned';
  } else if (
    norm === 'pending' ||
    norm === 'under review' ||
    norm === 'under_review' ||
    norm === 'review' ||
    norm === 'submitted' ||
    norm === 'proposed'
  ) {
    badgeClasses = 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-sm';
    dotClasses = 'bg-amber-400';
    if (norm === 'under_review' || norm === 'under review') displayLabel = 'Under Review';
    if (norm === 'pending') displayLabel = 'Pending';
  } else if (
    norm === 'critical' ||
    norm.includes('critical') ||
    norm === 'breached' ||
    norm === 'urgent'
  ) {
    badgeClasses = 'bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-sm';
    dotClasses = 'bg-rose-400 animate-ping';
    displayLabel = 'Critical SLA';
  }

  const sizeClasses =
    size === 'lg'
      ? 'px-3.5 py-1 text-xs sm:text-sm font-bold gap-2'
      : size === 'md'
      ? 'px-3 py-0.5 text-xs font-semibold gap-1.5'
      : 'px-2.5 py-0.5 text-xs font-semibold gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide transition-colors ${sizeClasses} ${badgeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClasses}`}></span>
      <span className="truncate">{displayLabel}</span>
    </span>
  );
}

export default StatusBadge;
