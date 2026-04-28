import { Link } from 'react-router-dom';
import { Users, Clock, MapPin, ArrowRight } from 'lucide-react';
import type { Space } from '@/types';

interface Props {
  space: Space;
}

export function SpaceCard({ space }: Props) {
  return (
    <div className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="font-semibold text-slate-900">{space.name}</h3>
      </div>

      <div className="flex flex-col gap-2 text-sm text-slate-500">
        {space.place && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>{space.place.name}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span>Capacity: {space.capacity}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>{space.opensAt} – {space.closesAt}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <Link
          to={`/spaces/${space.id}`}
          className="flex items-center justify-between text-sm font-medium text-blue-600 group-hover:text-blue-700"
        >
          View details
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
