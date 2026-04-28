interface Props {
  label: string;
  value: number | null;
  unit: string;
  icon: React.ReactNode;
  alert?: boolean;
}

export function TelemetryMetric({ label, value, unit, icon, alert = false }: Props) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg p-3 ${
        alert ? 'bg-red-50' : 'bg-slate-50'
      }`}
    >
      <div className={`shrink-0 ${alert ? 'text-red-500' : 'text-slate-400'}`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className={`text-sm font-semibold ${alert ? 'text-red-700' : 'text-slate-900'}`}>
          {value !== null ? `${value.toFixed(1)} ${unit}` : '—'}
        </p>
      </div>
    </div>
  );
}
