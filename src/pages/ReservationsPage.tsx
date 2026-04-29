import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Plus } from 'lucide-react';
import { getReservations, deleteReservation } from '@/api/reservations';
import { getSpaces } from '@/api/spaces';
import { getErrorMessage } from '@/api/client';
import type { Reservation } from '@/types';
import { ReservationCard } from '@/features/reservations/ReservationCard';
import { ReservationFilters } from '@/features/reservations/ReservationFilters';
import { CreateReservationForm } from '@/features/reservations/CreateReservationForm';
import { EditReservationForm } from '@/features/reservations/EditReservationForm';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { PageError } from '@/components/ui/ErrorMessage';
import { Pagination } from '@/components/ui/Pagination';

const PAGE_SIZE = 10;

interface Filters {
  spaceId: string;
  clientEmail: string;
  date: string;
}

export function ReservationsPage() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [filters, setFilters] = useState<Filters>({ spaceId: '', clientEmail: '', date: '' });
  const queryClient = useQueryClient();

  const params = {
    page,
    pageSize: PAGE_SIZE,
    spaceId: filters.spaceId || undefined,
    clientEmail: filters.clientEmail || undefined,
    date: filters.date || undefined,
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['reservations', 'list', params],
    queryFn: () => getReservations(params),
  });

  const { data: spacesData } = useQuery({
    queryKey: ['spaces', 'list'],
    queryFn: () => getSpaces({ pageSize: 100 }),
  });

  const { mutate: remove, variables: deletingId } = useMutation({
    mutationFn: deleteReservation,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['reservations'] }),
  });

  function handleFilterChange(partial: Partial<Filters>) {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-slate-400" />
          <h1 className="text-xl font-semibold text-slate-900">Reservations</h1>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Reservation
        </button>
      </div>

      <ReservationFilters
        filters={filters}
        spaces={spacesData?.data ?? []}
        onChange={handleFilterChange}
      />

      {isLoading && <PageLoader />}
      {error && <PageError message={getErrorMessage(error)} />}

      {data && (
        <>
          {data.data.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-slate-400">
              <p className="text-sm">No reservations found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.data.map((r) => (
                <ReservationCard
                  key={r.id}
                  reservation={r}
                  onEdit={setEditing}
                  onDelete={(id) => remove(id)}
                  isDeleting={deletingId === r.id}
                />
              ))}
            </div>
          )}
          <Pagination
            page={page}
            totalPages={data.meta.totalPages}
            total={data.meta.total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New Reservation"
        maxWidth="lg"
      >
        <CreateReservationForm
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
