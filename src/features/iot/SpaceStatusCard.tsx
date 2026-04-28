import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Thermometer, Droplets, Wind, Users, Zap, AlertTriangle, CheckCircle, WifiOff, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { getSpaceIotStatus, getSpaceAlerts, updateDesiredConfig } from '@/api/iot';
import { TelemetryMetric } from './TelemetryMetric';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Space, AlertKind } from '@/types';

interface Props {
  space: Space;
}

const alertKindLabel: Record<AlertKind, string> = {
  CO2: 'High CO₂',
  OCCUPANCY_MAX: 'Over Capacity',
  OCCUPANCY_UNEXPECTED: 'Unexpected Occupancy',
};

export function SpaceStatusCard({ space }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editingDesired, setEditingDesired] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['iot', space.id, 'status'],
    queryFn: () => getSpaceIotStatus(space.id),
    refetchInterval: 30_000,
  });

  const { data: alertsData } = useQuery({
    queryKey: ['iot', space.id, 'alerts'],
    queryFn: () => getSpaceAlerts(space.id, { pageSize: 5 }),
    enabled: expanded,
  });

  const { mutate: saveDesired, isPending: isSaving } = useMutation({
    mutationFn: (input: { samplingIntervalSec: number; co2AlertThreshold: number }) =>
      updateDesiredConfig(space.id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['iot', space.id, 'status'] });
      setEditingDesired(false);
    },
  });

  const { register, handleSubmit } = useForm({
    values: {
      samplingIntervalSec: data?.deviceDesired?.samplingIntervalSec ?? 10,
      co2AlertThreshold: data?.deviceDesired?.co2AlertThreshold ?? 1000,
    },
  });

  const telemetry = data?.latestTelemetry ?? null;
  const activeAlert = data?.activeAlert ?? null;
  const desired = data?.deviceDesired ?? null;
  const reported = data?.deviceReported ?? null;
  const diverged = desired && reported && (
    desired.samplingIntervalSec !== reported.samplingIntervalSec ||
    desired.co2AlertThreshold !== reported.co2AlertThreshold
  );

  return (
    <div className={`rounded-xl border bg-white shadow-sm ${activeAlert ? 'border-red-300' : 'border-slate-200'}`}>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <p className="font-medium text-slate-900">{space.name}</p>
          <p className="text-xs text-slate-500">
            Capacity: {space.capacity} · {space.opensAt}–{space.closesAt}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && <LoadingSpinner size="sm" />}
          {isError && <WifiOff className="h-4 w-4 text-slate-300" />}
          {activeAlert ? (
            <Badge variant="danger">
              <AlertTriangle className="mr-1 h-3 w-3" />
              {alertKindLabel[activeAlert.kind]}
            </Badge>
          ) : (
            data && (
              <Badge variant="success">
                <CheckCircle className="mr-1 h-3 w-3" />
                Normal
              </Badge>
            )
          )}
        </div>
      </div>

      {/* Telemetry metrics */}
      <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
        <TelemetryMetric label="Temperature" value={telemetry?.avgTempC ?? null} unit="°C" icon={<Thermometer className="h-4 w-4" />} />
        <TelemetryMetric label="Humidity" value={telemetry?.avgHumidityPct ?? null} unit="%" icon={<Droplets className="h-4 w-4" />} />
        <TelemetryMetric label="CO₂" value={telemetry?.avgCo2Ppm ?? null} unit="ppm" icon={<Wind className="h-4 w-4" />} alert={activeAlert?.kind === 'CO2'} />
        <TelemetryMetric label="Occupancy" value={telemetry?.avgOccupancy ?? null} unit="ppl" icon={<Users className="h-4 w-4" />} alert={activeAlert?.kind === 'OCCUPANCY_MAX' || activeAlert?.kind === 'OCCUPANCY_UNEXPECTED'} />
        <TelemetryMetric label="Power" value={telemetry?.avgPowerW ?? null} unit="W" icon={<Zap className="h-4 w-4" />} />
      </div>

      {telemetry && (
        <p className="border-t border-slate-100 px-4 py-1.5 text-right text-xs text-slate-400">
          Updated {new Date(telemetry.windowEnd).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          {' · '}{telemetry.sampleCount} samples
        </p>
      )}

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-center gap-1 border-t border-slate-100 py-2 text-xs text-slate-400 hover:bg-slate-50 hover:text-slate-600"
      >
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {expanded ? 'Less' : 'Details'}
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-slate-100 px-4 py-4">

          {/* Digital Twin */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Digital Twin</p>
              {diverged && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  Out of sync
                </span>
              )}
              <button onClick={() => setEditingDesired((v) => !v)} className="ml-auto rounded p-1 text-slate-400 hover:text-slate-700">
                <Settings className="h-3.5 w-3.5" />
              </button>
            </div>

            {editingDesired ? (
              <form onSubmit={handleSubmit((d) => saveDesired(d))} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-0.5 block text-xs text-slate-500">Interval (sec)</label>
                    <input
                      {...register('samplingIntervalSec', { valueAsNumber: true })}
                      type="number" min={1} max={3600}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-0.5 block text-xs text-slate-500">CO₂ threshold (ppm)</label>
                    <input
                      {...register('co2AlertThreshold', { valueAsNumber: true })}
                      type="number" min={100} max={5000}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setEditingDesired(false)} className="rounded px-3 py-1 text-xs text-slate-500 hover:bg-slate-100">Cancel</button>
                  <button type="submit" disabled={isSaving} className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60">
                    {isSaving ? 'Saving…' : 'Publish'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-slate-50 p-2">
                  <p className="mb-1 font-medium text-slate-500">Desired</p>
                  {desired ? (
                    <>
                      <p className="text-slate-700">Interval: <span className="font-semibold">{desired.samplingIntervalSec}s</span></p>
                      <p className="text-slate-700">CO₂ threshold: <span className="font-semibold">{desired.co2AlertThreshold} ppm</span></p>
                    </>
                  ) : <p className="text-slate-400">Not configured</p>}
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <p className="mb-1 font-medium text-slate-500">Reported</p>
                  {reported ? (
                    <>
                      <p className="text-slate-700">Interval: <span className={`font-semibold ${diverged && desired?.samplingIntervalSec !== reported.samplingIntervalSec ? 'text-amber-600' : ''}`}>{reported.samplingIntervalSec}s</span></p>
                      <p className="text-slate-700">CO₂ threshold: <span className={`font-semibold ${diverged && desired?.co2AlertThreshold !== reported.co2AlertThreshold ? 'text-amber-600' : ''}`}>{reported.co2AlertThreshold} ppm</span></p>
                      <p className="text-slate-400">FW: {reported.firmwareVersion ?? '—'}</p>
                    </>
                  ) : <p className="text-slate-400">No report yet</p>}
                </div>
              </div>
            )}
          </div>

          {/* Alert history */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Alert History</p>
            {!alertsData ? (
              <p className="text-xs text-slate-400">Loading…</p>
            ) : alertsData.data.length === 0 ? (
              <p className="text-xs text-slate-400">No alerts recorded.</p>
            ) : (
              <div className="space-y-1.5">
                {alertsData.data.map((alert) => (
                  <div key={alert.id} className={`flex items-start justify-between rounded-lg px-3 py-2 text-xs ${alert.resolvedAt ? 'bg-slate-50' : 'bg-red-50'}`}>
                    <div>
                      <span className={`font-semibold ${alert.resolvedAt ? 'text-slate-700' : 'text-red-700'}`}>
                        {alertKindLabel[alert.kind]}
                      </span>
                      <p className="text-slate-400">
                        {new Date(alert.startedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {alert.resolvedAt && ` → ${new Date(alert.resolvedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 font-medium ${alert.resolvedAt ? 'bg-slate-200 text-slate-600' : 'bg-red-200 text-red-700'}`}>
                      {alert.resolvedAt ? 'Resolved' : 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
