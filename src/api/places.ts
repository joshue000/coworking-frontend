import type { PaginatedResponse, Place } from '@/types';
import apiClient from './client';

export interface ListPlacesParams {
  page?: number;
  pageSize?: number;
}

export interface PlaceMutationInput {
  name: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export async function getPlaces(params?: ListPlacesParams): Promise<PaginatedResponse<Place>> {
  const { data } = await apiClient.get('/api/places', { params });
  return data;
}

export async function getPlace(id: string): Promise<Place> {
  const { data } = await apiClient.get(`/api/places/${id}`);
  return data.data;
}

export async function createPlace(input: PlaceMutationInput): Promise<Place> {
  const { data } = await apiClient.post('/api/places', input);
  return data.data;
}

export async function updatePlace(id: string, input: Partial<PlaceMutationInput>): Promise<Place> {
  const { data } = await apiClient.patch(`/api/places/${id}`, input);
  return data.data;
}

export async function deletePlace(id: string): Promise<void> {
  await apiClient.delete(`/api/places/${id}`);
}
