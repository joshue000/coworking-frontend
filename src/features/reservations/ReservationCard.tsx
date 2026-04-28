import { Calendar, Clock, Mail, User, Trash2, Pencil } from 'lucide-react';
import type { Reservation } from '@/types';

interface Props {
  reservation: Reservation;
  onEdit: (reservation: Reservation) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function ReservationCard({ reservation, onEdit, onDelete, isDeleting }: Props) {
  const date = new Date(reservation.reservationDate).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <div className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900">
            {reservation.space?.name ?? `Space ${reservation.spaceId.slice(0, 8)}`}
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1 text-sm text-slate-600">
            <User className="h-3.5 w-3.5" />
            {reservation.clientName}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {reservation.startTime} – {reservation.endTime}
          </span>
          <span className="flex items-center gap-1">
            <Mail className="h-3.5 w-3.5" />
            {reservation.clientEmail}
          </span>
        </div>
      </div>

      <div className="ml-4 flex shrink-0 gap-1">
        <button
          onClick={() => onEdit(reservation)}
          title="Edit reservation"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(reservation.id)}
          disabled={isDeleting}
          title="Delete reservation"
          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
