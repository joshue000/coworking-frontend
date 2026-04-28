import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl font-bold text-slate-200">404</p>
      <p className="text-lg font-medium text-slate-600">Page not found</p>
      <Link
        to="/spaces"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Go to Spaces
      </Link>
    </div>
  );
}
