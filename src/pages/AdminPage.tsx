import { useQuery } from '@tanstack/react-query';
import { Activity, RefreshCw } from 'lucide-react';
import { getSpaces } from '@/api/spaces';
import { getErrorMessage } from '@/api/client';
import { SpaceStatusCard } from '@/features/iot/SpaceStatusCard';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { PageError } from '@/components/ui/ErrorMessage';

export function AdminPage() {
  const { data, isLoading, error, dataUpdatedAt, refetch, isFetching } = useQuery({
    queryKey: ['spaces', 'list'],
    queryFn: () => getSpaces({ pageSize: 100 }),
  });

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-slate-400" />
          <h1 className="text-xl font-semibold text-slate-900">IoT Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && <span className="text-xs text-slate-400">Updated at {lastUpdated}</span>}
          <button
            onClick={() => void refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        Each space auto-refreshes every 30 seconds. Spaces with active alerts are highlighted.
      </p>

      {isLoading && <PageLoader />}
      {error && <PageError message={getErrorMessage(error)} />}

      {data && (
        <>
          {data.data.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-slate-400">
              No spaces available.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {data.data.map((space) => (
                <SpaceStatusCard key={space.id} space={space} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
