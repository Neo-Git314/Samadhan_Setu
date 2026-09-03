// TODO: Map domain statuses to colors and labels.
function StatusBadge({ status = 'pending' }) {
  return <span className="rounded bg-slate-100 px-2 py-1 text-xs">{status}</span>;
}

export default StatusBadge;
