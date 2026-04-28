import { useState } from 'react';
import { Key } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import axios from 'axios';

async function validateApiKey(key: string): Promise<void> {
  await axios.get(
    `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'}/api/spaces`,
    { headers: { 'x-api-key': key }, params: { pageSize: 1 } }
  );
}

export function ApiKeySetup() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const setApiKey = useAuthStore((s) => s.setApiKey);
  const authError = useAuthStore((s) => s.authError);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Please enter your API key.');
      return;
    }
    setIsValidating(true);
    setError('');
    try {
      await validateApiKey(trimmed);
      setApiKey(trimmed);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Invalid API key. Please check and try again.');
      } else {
        setError('Could not reach the server. Please try again.');
      }
    } finally {
      setIsValidating(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <Key className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Enter your API Key</h1>
          <p className="text-sm text-slate-500">
            Required to authenticate with the Coworking API.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="mb-1.5 block text-sm font-medium text-slate-700">
              API Key
            </label>
            <input
              id="apiKey"
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError('');
              }}
              placeholder="your-api-key-here"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {(error || authError) && <ErrorMessage message={error || authError} />}
          <button
            type="submit"
            disabled={isValidating}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {isValidating && <LoadingSpinner size="sm" />}
            {isValidating ? 'Verifying…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
