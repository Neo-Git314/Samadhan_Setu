// TODO: Reuse for API and UI error messaging states.
function ErrorState({ message = 'Something went wrong.' }) {
  return <div className="text-red-600">{message}</div>;
}

export default ErrorState;
