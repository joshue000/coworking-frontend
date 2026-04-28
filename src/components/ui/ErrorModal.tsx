import { AlertTriangle, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Props {
  message: string;
  onClose: () => void;
}

export function ErrorModal({ message, onClose }: Props) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="font-semibold">Action failed</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-slate-600">{message}</p>
        </div>
        <div className="flex justify-end border-t border-slate-100 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            OK, got it
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
