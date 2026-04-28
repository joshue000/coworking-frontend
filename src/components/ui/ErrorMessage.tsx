import { AlertTriangle } from 'lucide-react';

interface Props {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className = '' }: Props) {
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 ${className}`}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function PageError({ message }: { message: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-500">
      <AlertTriangle className="h-10 w-10 text-red-400" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
