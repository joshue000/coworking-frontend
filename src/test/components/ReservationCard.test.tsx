import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReservationCard } from '@/features/reservations/ReservationCard';
import type { Reservation } from '@/types';

const baseReservation: Reservation = {
  id: 'res-1',
  spaceId: 'space-1',
  placeId: 'place-1',
  clientName: 'Alice Test',
  clientEmail: 'alice@test.com',
  reservationDate: '2025-12-15T00:00:00.000Z',
  startTime: '09:00',
  endTime: '11:00',
  createdAt: '2025-12-01T00:00:00.000Z',
  updatedAt: '2025-12-01T00:00:00.000Z',
  space: {
    id: 'space-1',
    placeId: 'place-1',
    name: 'Meeting Room A',
    capacity: 10,
    opensAt: '08:00',
    closesAt: '18:00',
    createdAt: '2025-12-01T00:00:00.000Z',
    updatedAt: '2025-12-01T00:00:00.000Z',
  },
};

describe('ReservationCard', () => {
  it('renders the space name', () => {
    render(<ReservationCard reservation={baseReservation} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Meeting Room A')).toBeInTheDocument();
  });

  it('renders client name and email', () => {
    render(<ReservationCard reservation={baseReservation} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Alice Test')).toBeInTheDocument();
    expect(screen.getByText('alice@test.com')).toBeInTheDocument();
  });

  it('renders time range', () => {
    render(<ReservationCard reservation={baseReservation} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/09:00/)).toBeInTheDocument();
    expect(screen.getByText(/11:00/)).toBeInTheDocument();
  });

  it('falls back to spaceId when space name is missing', () => {
    const reservation: Reservation = { ...baseReservation, space: undefined };
    render(<ReservationCard reservation={reservation} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/space-1/i)).toBeInTheDocument();
  });

  it('calls onEdit with the reservation when edit button is clicked', async () => {
    const onEdit = vi.fn();
    render(<ReservationCard reservation={baseReservation} onEdit={onEdit} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByTitle('Edit reservation'));
    expect(onEdit).toHaveBeenCalledWith(baseReservation);
  });

  it('calls onDelete with the reservation id when delete button is clicked', async () => {
    const onDelete = vi.fn();
    render(<ReservationCard reservation={baseReservation} onEdit={vi.fn()} onDelete={onDelete} />);
    await userEvent.click(screen.getByTitle('Delete reservation'));
    expect(onDelete).toHaveBeenCalledWith('res-1');
  });

  it('disables delete button when isDeleting is true', () => {
    render(
      <ReservationCard
        reservation={baseReservation}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        isDeleting
      />
    );
    expect(screen.getByTitle('Delete reservation')).toBeDisabled();
  });
});
