import type { PaginatedResponse, Space } from '@/types';
import apiClient from './client';

export interface ListSpacesParams {
  page?: number;
  pageSize?: number;
  placeId?: string;
}

export interface SpaceMutationInput {
  placeId: string;
  name: string;
  reference?: string;
  capacity: number;
  description?: string;
  opensAt: string;
  closesAt: string;
}

export async function getSpaces(params?: ListSpacesParams): Promise<PaginatedResponse<Space>> {
  const { data } = await apiClient.get('/api/spaces', { params });
  return data;
}

export async function getSpace(id: string): Promise<Space> {
  const { data } = await apiClient.get(`/api/spaces/${id}`);
  return data.data;
}

export async function createSpace(input: SpaceMutationInput): Promise<Space> {
  const { data } = await apiClient.post('/api/spaces', input);
  return data.data;
}

export async function updateSpace(id: string, input: Partial<Omit<SpaceMutationInput, 'placeId'>>): Promise<Space> {
  const { data } = await apiClient.patch(`/api/spaces/${id}`, input);
  return data.data;
}

export async function deleteSpace(id: string): Promise<void> {
  await apiClient.delete(`/api/spaces/${id}`);
}
