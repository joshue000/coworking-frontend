import type { CreateReservationInput, PaginatedResponse, Reservation } from '@/types';
import apiClient from './client';

export interface ListReservationsParams {
  page?: number;
  pageSize?: number;
  spaceId?: string;
  placeId?: string;
  clientEmail?: string;
  date?: string;
}

export async function getReservations(
  params?: ListReservationsParams
): Promise<PaginatedResponse<Reservation>> {
  const { data } = await apiClient.get('/api/reservations', { params });
  return data;
}

export async function getReservation(id: string): Promise<Reservation> {
  const { data } = await apiClient.get(`/api/reservations/${id}`);
  return data.data;
}

export async function createReservation(input: CreateReservationInput): Promise<Reservation> {
  const { data } = await apiClient.post('/api/reservations', input);
  return data.data;
}

export async function updateReservation(id: string, input: Partial<Omit<CreateReservationInput, 'spaceId'>>): Promise<Reservation> {
  const { data } = await apiClient.patch(`/api/reservations/${id}`, input);
  return data.data;
}

export async function deleteReservation(id: string): Promise<void> {
  await apiClient.delete(`/api/reservations/${id}`);
}
