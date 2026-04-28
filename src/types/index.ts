// Pagination
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Place
export interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

// Space
export interface Space {
  id: string;
  placeId: string;
  place?: Place;
  name: string;
  reference?: string | null;
  capacity: number;
  description?: string | null;
  opensAt: string;
  closesAt: string;
  createdAt: string;
  updatedAt: string;
}

// Reservation
export interface Reservation {
  id: string;
  spaceId: string;
  placeId: string;
  space?: Space;
  place?: Place;
  clientName: string;
  clientEmail: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReservationInput {
  spaceId: string;
  clientName: string;
  clientEmail: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
}

// IoT
export type AlertKind = 'CO2' | 'OCCUPANCY_MAX' | 'OCCUPANCY_UNEXPECTED';

export interface TelemetryAggregation {
  id: string;
  spaceId: string;
  windowStart: string;
  windowEnd: string;
  avgTempC: number | null;
  avgHumidityPct: number | null;
  avgCo2Ppm: number | null;
  maxCo2Ppm: number | null;
  avgOccupancy: number | null;
  maxOccupancy: number | null;
  avgPowerW: number | null;
  sampleCount: number;
}

export interface Alert {
  id: string;
  spaceId: string;
  kind: AlertKind;
  startedAt: string;
  resolvedAt: string | null;
  metaJson: Record<string, unknown>;
  createdAt: string;
}

export interface DeviceDesired {
  spaceId: string;
  samplingIntervalSec: number;
  co2AlertThreshold: number;
  updatedAt: string;
}

export interface DeviceReported {
  spaceId: string;
  samplingIntervalSec: number | null;
  co2AlertThreshold: number | null;
  firmwareVersion: string | null;
  reportedAt: string | null;
  updatedAt: string;
}

export interface SpaceIotStatus {
  space: { id: string; name: string; capacity: number; opensAt: string; closesAt: string };
  place: { id: string; name: string; timezone: string };
  latestTelemetry: TelemetryAggregation | null;
  deviceDesired: DeviceDesired | null;
  deviceReported: DeviceReported | null;
  activeAlert: Alert | null;
}
