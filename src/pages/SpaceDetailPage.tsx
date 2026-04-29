import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Users, Clock, MapPin, Plus } from 'lucide-react';
import { getSpace } from '@/api/spaces';
import { getReservations, deleteReservation } from '@/api/reservations';
import { getErrorMessage } from '@/api/client';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { PageError } from '@/components/ui/ErrorMessage';
import { Modal } from '@/components/ui/Modal';
import { ReservationCard } from '@/features/reservations/ReservationCard';
import { CreateReservationForm } from '@/features/reservations/CreateReservationForm';
import { EditReservationForm } from '@/features/reservations/EditReservationForm';
import type { Reservation } from '@/types';

export function SpaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const queryClient = useQueryClient();

  const {
    data: space,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['spaces', id],
    queryFn: () => getSpace(id!),
    enabled: !!id,
  });

  const { data: reservationsData } = useQuery({
    queryKey: ['reservations', 'list', { spaceId: id }],
    queryFn: () =>
      getReservations({
        spaceId: id,
        date: new Date().toISOString().split('T')[0],
        pageSize: 10,
      }),
    enabled: !!id,
  });

  const { mutate: remove, variables: deletingId } = useMutation({
    mutationFn: deleteReservation,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['reservations'] }),
  });

  if (isLoading) return <PageLoader />;
  if (error || !space) return <PageError message={getErrorMessage(error)} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/spaces"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to spaces
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{space.name}</h1>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Book this space
          </button>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
          {space.place && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {space.place.name}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            Capacity: {space.capacity} people
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {space.opensAt} – {space.closesAt}
          </span>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-slate-900">Today's Reservations</h2>
        {!reservationsData?.data.length ? (
          <p className="text-sm text-slate-400">No reservations scheduled for today.</p>
        ) : (
          <div className="space-y-2">
            {reservationsData.data.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                onEdit={setEditing}
                onDelete={(rid) => remove(rid)}
                isDeleting={deletingId === r.id}
              />
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New Reservation">
        <CreateReservationForm
          spaceId={id}
          onSuccess={() => setCreateOpen(false)}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Reservation"
        maxWidth="sm"
      >
        {editing && (
          <EditReservationForm
            reservation={editing}
            onSuccess={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  );
}
