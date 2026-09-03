// TODO: Reuse for empty lists and zero-data states.
function EmptyState({ message = 'No records found.' }) {
  return <div className="text-slate-500">{message}</div>;
}

export default EmptyState;
