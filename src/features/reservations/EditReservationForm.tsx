import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Reservation } from '@/types';
import { updateReservation } from '@/api/reservations';
import { getErrorMessage } from '@/api/client';
import { ErrorModal } from '@/components/ui/ErrorModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const schema = z
  .object({
    clientName: z.string().min(2, 'Name must be at least 2 characters'),
    reservationDate: z.string().min(1, 'Date is required'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
  })
  .refine((d) => d.startTime < d.endTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

type FormData = z.infer<typeof schema>;

interface Props {
  reservation: Reservation;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditReservationForm({ reservation, onSuccess, onCancel }: Props) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientName: reservation.clientName,
      reservationDate: new Date(reservation.reservationDate).toISOString().split('T')[0],
      startTime: reservation.startTime,
      endTime: reservation.endTime,
    },
  });

  const { mutate, isPending, error, reset: resetMutation } = useMutation({
    mutationFn: (data: FormData) => updateReservation(reservation.id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reservations'] });
      onSuccess();
    },
  });

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4">
      <Field label="Client name" error={errors.clientName?.message}>
        <input
          {...register('clientName')}
          placeholder="Jane Doe"
          className={inputClass(!!errors.clientName)}
        />
      </Field>

      <Field label="Date" error={errors.reservationDate?.message}>
        <input
          {...register('reservationDate')}
          type="date"
          min={today}
          className={inputClass(!!errors.reservationDate)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Start time" error={errors.startTime?.message}>
          <input {...register('startTime')} type="time" className={inputClass(!!errors.startTime)} />
        </Field>
        <Field label="End time" error={errors.endTime?.message}>
          <input {...register('endTime')} type="time" className={inputClass(!!errors.endTime)} />
        </Field>
      </div>

      {error && <ErrorModal message={getErrorMessage(error)} onClose={resetMutation} />}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isPending && <LoadingSpinner size="sm" />}
          Save changes
        </button>
      </div>
    </form>
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
