import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import { getPlaces, createPlace, updatePlace, deletePlace } from '@/api/places';
import type { Place } from '@/types';
import { getErrorMessage } from '@/api/client';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { PageError } from '@/components/ui/ErrorMessage';
import { ErrorModal } from '@/components/ui/ErrorModal';
import { Pagination } from '@/components/ui/Pagination';

const PAGE_SIZE = 10;

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  timezone: z.string().min(1, 'Timezone is required'),
});

type FormData = z.infer<typeof schema>;

export function PlacesPage() {
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Place | null>(null);
  const [deleting, setDeleting] = useState<Place | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['places', 'list', { page, pageSize: PAGE_SIZE }],
    queryFn: () => getPlaces({ page, pageSize: PAGE_SIZE }),
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['places'] });

  const createMutation = useMutation({
    mutationFn: createPlace,
    onSuccess: () => {
      invalidate();
      closeModal();
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<FormData> }) => updatePlace(id, input),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deletePlace,
    onSuccess: () => {
      invalidate();
      setDeleting(null);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { timezone: 'America/Panama' },
  });

  function openCreate() {
    reset({ name: '', latitude: 0, longitude: 0, timezone: 'America/Panama' });
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(place: Place) {
    reset({
      name: place.name,
      latitude: place.latitude ?? 0,
      longitude: place.longitude ?? 0,
      timezone: place.timezone,
    });
    setEditing(place);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    createMutation.reset();
    updateMutation.reset();
  }

  function onSubmit(data: FormData) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, input: data });
    } else {
      createMutation.mutate(data);
    }
  }

  const mutationError = createMutation.error ?? updateMutation.error;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-slate-400" />
          <h1 className="text-xl font-semibold text-slate-900">Places</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Place
        </button>
      </div>

      {isLoading && <PageLoader />}
      {error && <PageError message={getErrorMessage(error)} />}

      {data && (
        <>
          {data.data.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-slate-400">
              <p className="text-sm">No places found. Create one to get started.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Timezone</th>
                    <th className="px-4 py-3">Coordinates</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.data.map((place) => (
                    <tr key={place.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{place.name}</td>
                      <td className="px-4 py-3 text-slate-500">{place.timezone}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {place.latitude != null ? `${place.latitude}, ${place.longitude}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEdit(place)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleting(place)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Place' : 'New Place'}
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Name" error={errors.name?.message}>
            <input
              {...register('name')}
              placeholder="Main Office"
              className={inputClass(!!errors.name)}
            />
          </Field>
          <Field label="Timezone" error={errors.timezone?.message}>
            <input
              {...register('timezone')}
              placeholder="America/Panama"
              className={inputClass(!!errors.timezone)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude" error={errors.latitude?.message}>
              <input
                {...register('latitude')}
                type="number"
                step="any"
                className={inputClass(!!errors.latitude)}
              />
            </Field>
            <Field label="Longitude" error={errors.longitude?.message}>
              <input
                {...register('longitude')}
                type="number"
                step="any"
                className={inputClass(!!errors.longitude)}
              />
            </Field>
          </div>
          {mutationError && (
            <ErrorModal
              message={getErrorMessage(mutationError)}
              onClose={() => {
                createMutation.reset();
                updateMutation.reset();
              }}
            />
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : editing ? 'Save changes' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        title="Delete Place"
        message={`Are you sure you want to delete "${deleting?.name}"? This will also delete all associated spaces and reservations.`}
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 ${
    hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
  }`;
}
