import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LayoutGrid, Plus, Pencil, Trash2 } from 'lucide-react';
import { getSpaces, createSpace, updateSpace, deleteSpace } from '@/api/spaces';
import { getPlaces } from '@/api/places';
import type { Space } from '@/types';
import { getErrorMessage } from '@/api/client';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { PageError, ErrorMessage } from '@/components/ui/ErrorMessage';
import { Pagination } from '@/components/ui/Pagination';

const PAGE_SIZE = 10;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const schema = z.object({
  placeId: z.string().min(1, 'Place is required'),
  name: z.string().min(1, 'Name is required'),
  capacity: z.coerce.number().int().positive('Must be a positive number'),
  opensAt: z.string().regex(timeRegex, 'Must be HH:mm'),
  closesAt: z.string().regex(timeRegex, 'Must be HH:mm'),
  reference: z.string().optional(),
  description: z.string().optional(),
}).refine((d) => d.opensAt < d.closesAt, { message: 'Opens at must be before closes at', path: ['closesAt'] });

type FormData = z.infer<typeof schema>;

export function SpacesManagePage() {
  const [page, setPage] = useState(1);
  const [placeFilter, setPlaceFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Space | null>(null);
  const [deleting, setDeleting] = useState<Space | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['spaces', 'manage', { page, pageSize: PAGE_SIZE, placeId: placeFilter || undefined }],
    queryFn: () => getSpaces({ page, pageSize: PAGE_SIZE, placeId: placeFilter || undefined }),
  });

  const { data: placesData } = useQuery({
    queryKey: ['places', 'list'],
    queryFn: () => getPlaces({ pageSize: 100 }),
  });

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['spaces'] });

  const createMutation = useMutation({ mutationFn: createSpace, onSuccess: () => { invalidate(); closeModal(); } });
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Omit<FormData, 'placeId'>> }) => updateSpace(id, input),
    onSuccess: () => { invalidate(); closeModal(); },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteSpace,
    onSuccess: () => { invalidate(); setDeleting(null); },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { opensAt: '08:00', closesAt: '18:00', capacity: 10 },
  });

  function openCreate() {
    reset({ placeId: '', name: '', capacity: 10, opensAt: '08:00', closesAt: '18:00', reference: '', description: '' });
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(space: Space) {
    reset({
      placeId: space.placeId,
      name: space.name,
      capacity: space.capacity,
      opensAt: space.opensAt,
      closesAt: space.closesAt,
      reference: space.reference ?? '',
      description: space.description ?? '',
    });
    setEditing(space);
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
      const { placeId: _, ...rest } = data;
      updateMutation.mutate({ id: editing.id, input: rest });
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
          <LayoutGrid className="h-5 w-5 text-slate-400" />
          <h1 className="text-xl font-semibold text-slate-900">Manage Spaces</h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={placeFilter}
            onChange={(e) => { setPlaceFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All places</option>
            {placesData?.data.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Space
          </button>
        </div>
      </div>

      {isLoading && <PageLoader />}
      {error && <PageError message={getErrorMessage(error)} />}

      {data && (
        <>
          {data.data.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-slate-400">
              <p className="text-sm">No spaces found. Create one to get started.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Place</th>
                    <th className="px-4 py-3">Capacity</th>
                    <th className="px-4 py-3">Hours</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.data.map((space) => (
                    <tr key={space.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {space.name}
                        {space.reference && <span className="ml-2 text-xs text-slate-400">#{space.reference}</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {placesData?.data.find((p) => p.id === space.placeId)?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{space.capacity}</td>
                      <td className="px-4 py-3 text-slate-500">{space.opensAt} – {space.closesAt}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEdit(space)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleting(space)}
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
        title={editing ? 'Edit Space' : 'New Space'}
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!editing && (
            <Field label="Place" error={errors.placeId?.message}>
              <select {...register('placeId')} className={inputClass(!!errors.placeId)}>
                <option value="">Select a place</option>
                {placesData?.data.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" error={errors.name?.message}>
              <input {...register('name')} placeholder="Room A" className={inputClass(!!errors.name)} />
            </Field>
            <Field label="Reference" error={errors.reference?.message}>
              <input {...register('reference')} placeholder="A-01" className={inputClass(!!errors.reference)} />
            </Field>
          </div>
          <Field label="Capacity" error={errors.capacity?.message}>
            <input {...register('capacity')} type="number" min={1} className={inputClass(!!errors.capacity)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Opens at" error={errors.opensAt?.message}>
              <input {...register('opensAt')} type="time" className={inputClass(!!errors.opensAt)} />
            </Field>
            <Field label="Closes at" error={errors.closesAt?.message}>
              <input {...register('closesAt')} type="time" className={inputClass(!!errors.closesAt)} />
            </Field>
          </div>
          <Field label="Description" error={errors.description?.message}>
            <textarea {...register('description')} rows={2} placeholder="Optional description" className={inputClass(!!errors.description)} />
          </Field>
          {mutationError && <ErrorMessage message={getErrorMessage(mutationError)} />}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={closeModal} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
              {isSaving ? 'Saving…' : editing ? 'Save changes' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        title="Delete Space"
        message={`Are you sure you want to delete "${deleting?.name}"? All reservations for this space will also be deleted.`}
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
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
    hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
  }`;
}
