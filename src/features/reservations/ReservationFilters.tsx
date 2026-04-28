import { Search } from 'lucide-react';
import type { Space } from '@/types';

interface Filters {
  spaceId: string;
  clientEmail: string;
  date: string;
}

interface Props {
  filters: Filters;
  spaces: Space[];
  onChange: (filters: Partial<Filters>) => void;
}

export function ReservationFilters({ filters, spaces, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="email"
          value={filters.clientEmail}
          onChange={(e) => onChange({ clientEmail: e.target.value })}
          placeholder="Filter by email"
          className="rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <select
        value={filters.spaceId}
        onChange={(e) => onChange({ spaceId: e.target.value })}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">All spaces</option>
        {spaces.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={filters.date}
        onChange={(e) => onChange({ date: e.target.value })}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      {(filters.spaceId || filters.clientEmail || filters.date) && (
        <button
          onClick={() => onChange({ spaceId: '', clientEmail: '', date: '' })}
          className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
        >
          Clear
        </button>
      )}
    </div>
  );
}
