export default function Spinner() {
  return (
    <div
      className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500"
      role="status"
      aria-label="Loading"
    />
  );
}