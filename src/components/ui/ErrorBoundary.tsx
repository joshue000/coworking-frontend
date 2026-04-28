import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home, X } from 'lucide-react';
import axios from 'axios';

function is5xxOrNoNetwork(error: unknown): boolean {
  if (isRouteErrorResponse(error)) return error.status >= 500;
  if (axios.isAxiosError(error)) {
    if (!error.response) return true;
    return error.response.status >= 500;
  }
  // Runtime JS crash (e.g. TypeError) — always fatal
  return error instanceof Error;
}

function getDetails(error: unknown): { title: string; message: string } {
  if (isRouteErrorResponse(error)) {
    return {
      title: `${error.status} ${error.statusText}`,
      message: error.status === 404
        ? 'The page you are looking for does not exist.'
        : (error.data?.message ?? 'An unexpected error occurred.'),
    };
  }
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: { message?: string } } | undefined;
    const msg = data?.error?.message ?? error.message;
    return { title: `Error ${error.response?.status ?? ''}`.trim(), message: msg };
  }
  if (error instanceof Error) {
    return { title: 'Something went wrong', message: 'An unexpected error occurred. Please try again.' };
  }
  return { title: 'Something went wrong', message: 'An unexpected error occurred. Please try again.' };
}

export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const { title, message } = getDetails(error);
  const fatal = is5xxOrNoNetwork(error);

  if (fatal) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          <p className="max-w-md text-sm text-slate-500">{message}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Go back
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Home className="h-4 w-4" />
            Home
          </button>
        </div>
      </div>
    );
  }

  // 4xx — dismissible inline modal so the user can read and retry
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="relative w-full max-w-md rounded-xl border border-red-200 bg-white p-6 shadow-lg">
        <button
          onClick={() => navigate(-1)}
          className="absolute right-4 top-4 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="space-y-1">
            <h2 className="font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Go back
          </button>
          <button
            onClick={() => navigate('/')}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
