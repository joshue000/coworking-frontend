import type { Alert, PaginatedResponse, SpaceIotStatus, TelemetryAggregation } from '@/types';
import apiClient from './client';

export async function getSpaceIotStatus(spaceId: string): Promise<SpaceIotStatus> {
  const { data } = await apiClient.get(`/api/iot/spaces/${spaceId}/status`);
  return data.data;
}

export async function getSpaceAlerts(
  spaceId: string,
  params?: { page?: number; pageSize?: number }
): Promise<PaginatedResponse<Alert>> {
  const { data } = await apiClient.get(`/api/iot/spaces/${spaceId}/alerts`, { params });
  return data;
}

export async function getSpaceTelemetry(
  spaceId: string,
  params?: { page?: number; pageSize?: number }
): Promise<PaginatedResponse<TelemetryAggregation>> {
  const { data } = await apiClient.get(`/api/iot/spaces/${spaceId}/telemetry`, { params });
  return data;
}

export async function updateDesiredConfig(
  spaceId: string,
  input: { samplingIntervalSec: number; co2AlertThreshold: number }
): Promise<void> {
  await apiClient.put(`/api/iot/spaces/${spaceId}/desired`, input);
}
