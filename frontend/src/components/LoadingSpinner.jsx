export default function LoadingSpinner({ fullPage = false, label = 'Loading...' }) {
  const wrapperClass = fullPage
    ? 'flex min-h-screen items-center justify-center bg-surface-50'
    : 'flex items-center justify-center py-12';

  return (
    <div className={wrapperClass}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        <p className="text-sm text-surface-700">{label}</p>
      </div>
    </div>
  );
}
